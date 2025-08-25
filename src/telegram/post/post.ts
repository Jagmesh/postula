import Logger from 'jblog';
import { Telegraf } from 'telegraf';
import { PostData } from '../type';
import { ReactionTypeEmoji } from 'telegraf/types';
import { CONFIG } from '../../config.js';
import { TgStorage } from '../storage/storage.service.js';
import { REACTION } from '../const.js';
import { POST_RESULT } from './post.const.js';
import { getCleanUpMessage, handleNotFoundErr } from './post.util.js';

export class Post {
  constructor(private readonly bot: Telegraf) {}

  /** Public */
  public async accept(post: PostData) {
    await this.setReaction(REACTION.ACCEPT, post.original.chatId, post.original.messageId);

    const updatedCaption =
      `${post.original.caption}\n\n` +
      `👤 Автор: ${post.original.username}` +
      ` | <a href="https://t.me/${this.bot.botInfo?.username}">Предложка</a>`;

    await this.bot.telegram.copyMessage(
      CONFIG.TG_TARGET_CHANNEL_ID,
      CONFIG.TG_SUGGESTION_CHAT_ID,
      post.archive ? post.archive.messageId : post.review.messageId,
      {
        caption: updatedCaption,
        parse_mode: 'HTML',
      }
    );

    await this.cleanUp(post, POST_RESULT.ACCEPTED);
  }

  public async reject(post: PostData) {
    await this.setReaction(REACTION.REJECT, post.original.chatId, post.original.messageId);

    await this.cleanUp(post, POST_RESULT.REJECTED);
  }

  public async postpone(post: PostData) {
    await this.setReaction(REACTION.POSTPONED, post.original.chatId, post.original.messageId);

    await this.cleanUp(post, POST_RESULT.POSTPONED);
  }

  /** Private */
  private async cleanUp(post: PostData, result: POST_RESULT): Promise<void> {
    if (post.archive) {
      await this.bot.telegram
        .editMessageCaption(
          CONFIG.TG_SUGGESTION_CHAT_ID,
          post.archive.messageId,
          undefined,
          getCleanUpMessage(post, result),
          {
            parse_mode: 'HTML',
          }
        )
        .catch(handleNotFoundErr);
    } else {
      const archiveMsg = await this.bot.telegram
        .copyMessage(CONFIG.TG_SUGGESTION_CHAT_ID, CONFIG.TG_SUGGESTION_CHAT_ID, post.review.messageId, {
          caption: getCleanUpMessage(post, result),
          parse_mode: 'HTML',
          message_thread_id: CONFIG.TG_ARCHIVE_THREAD_ID,
        })
        .catch(handleNotFoundErr);
      if (!archiveMsg) return;
      await TgStorage.add({ ...post, archive: { messageId: archiveMsg.message_id } });
    }

    await this.bot.telegram
      .deleteMessages(CONFIG.TG_SUGGESTION_CHAT_ID, [post.review.messageId, post.review.buttonsMsgId])
      .catch(handleNotFoundErr);

    if (result === POST_RESULT.POSTPONED) return;
    await TgStorage.delete(post.id);
  }

  private async setReaction(reaction: ReactionTypeEmoji[], chatId: string | number, messageId: number): Promise<void> {
    await this.bot.telegram.setMessageReaction(chatId, messageId, reaction, true).catch(handleNotFoundErr);
  }
}
