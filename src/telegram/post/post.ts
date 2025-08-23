import Logger from "jblog";
import { Telegraf, TelegramError } from "telegraf";
import { PendingMessage } from "../type";
import { ReactionTypeEmoji } from "telegraf/types";
import { CONFIG } from "../../config.js";
import { TgStorage } from "../storage/storage.service.js";
import { REACTION } from "../const.js";

export class Post {
  private readonly log: Logger = new Logger({
    scopes: [Post.name.toUpperCase()],
  });

  constructor(private readonly bot: Telegraf) {}

  /** Public */
  public async accept(from: string, post: PendingMessage) {
    await this.setReaction(
      REACTION.ACCEPT,
      post.original.chatId,
      post.original.messageId,
    );

    const updatedCaption =
      `${post.original.caption}\n\n` +
      `👤 Автор: ${post.original.username}` +
      ` | <a href="https://t.me/${await this.bot.telegram.getMe()}">Предложка</a>`;
    await this.bot.telegram.copyMessage(
      CONFIG.TG_TARGET_CHANNEL_ID,
      CONFIG.TG_SUGGESTION_CHAT_ID,
      post.review.messageId,
      {
        caption: updatedCaption,
        parse_mode: "HTML",
      },
    );

    await this.cleanUp(from, post, REACTION.ACCEPT[0]);
  }

  public async reject(from: string, post: PendingMessage) {
    await this.setReaction(
      REACTION.REJECT,
      post.original.chatId,
      post.original.messageId,
    );

    await this.cleanUp(from, post, REACTION.REJECT[0]);
  }

  public async postpone(post: PendingMessage) {
    await this.setReaction(
      REACTION.POSTPONED,
      post.original.chatId,
      post.original.messageId,
    );

    await this.bot.telegram.editMessageCaption(
      CONFIG.TG_SUGGESTION_CHAT_ID,
      post.review.messageId,
      undefined,
      `${post.original.caption}\n\n` +
        `<blockquote>Пост в отложке (by @${post.admin?.username})</blockquote>`,
      {
        parse_mode: "HTML",
      },
    );

    await this.bot.telegram
      .deleteMessage(CONFIG.TG_SUGGESTION_CHAT_ID, post.review.buttonsMsgId)
      .catch((err) => {
        if (
          (err instanceof TelegramError &&
            err.description.includes("message to delete not found")) ||
          err.description.includes("message not found")
        ) {
          return false;
        }
        throw err;
      });
  }

  /** Private */
  private async cleanUp(
    from: string,
    post: PendingMessage,
    reaction: ReactionTypeEmoji,
  ): Promise<void> {
    const { original, review } = post;

    await this.bot.telegram.editMessageCaption(
      CONFIG.TG_SUGGESTION_CHAT_ID,
      review.messageId,
      undefined,
      `${original.caption}\n\n` +
        `<blockquote>Пост от ${original.username}. Решение: "${reaction.emoji}" (by @${from})</blockquote>`,
      {
        parse_mode: "HTML",
      },
    );
    await this.bot.telegram
      .deleteMessage(CONFIG.TG_SUGGESTION_CHAT_ID, post.review.buttonsMsgId)
      .catch((err) => {
        if (
          (err instanceof TelegramError &&
            err.description.includes("message to delete not found")) ||
          err.description.includes("message not found")
        ) {
          return false;
        }
        throw err;
      });

    await TgStorage.delete(review.messageId);
  }

  private async setReaction(
    reaction: ReactionTypeEmoji[],
    chatId: string | number,
    messageId: number,
  ): Promise<void> {
    const postAlreadyDeletedTgErrorDescription =
      "Bad Request: message to react not found";
    await this.bot.telegram
      .setMessageReaction(chatId, messageId, reaction, true)
      .catch((err) => {
        if (
          err instanceof TelegramError &&
          err.description.trim() === postAlreadyDeletedTgErrorDescription
        ) {
          return this.log.warn(
            `Post in ${chatId} chat with ${messageId} messageID was already deleted`,
          );
        }
        throw err;
      });
  }
}
