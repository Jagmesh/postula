import {Context} from 'telegraf';
import {REACTION} from '../../const.js';
import type {PendingMessage} from '../../type';
import {Message} from 'telegraf/types';
import {CONFIG} from "../../../config.js";
import {BUTTONS_MARKUP} from "../../common/button/button.const.js";
import {TgStorage} from "../../storage/storage.service.js";
import Logger from "jblog";

const log = new Logger({scopes: ['HANDLE_MESSAGE']});

async function processIncomingMessage(ctx: Context, message: Message.AnimationMessage) {
    const from = message.from!;
    const chat = ctx.chat!;

    await ctx.telegram.setMessageReaction(chat.id, message.message_id, REACTION.WAIT, true);

    const origCaption = typeof message.caption === 'string' && message.caption.trim().length > 0 ? message.caption.trim() : ''
    const reviewMsg = await ctx.telegram.sendAnimation(CONFIG.TG_SUGGESTION_CHAT_ID, message.animation.file_id, {
        caption: origCaption,
        parse_mode: 'HTML',
    });

    const headerText = `📥 Пост от @${from.username || from.first_name} (id: ${from.id} / id сообщения: ${message.message_id}):`
    const actionsMsg = await ctx.telegram.sendMessage(
        CONFIG.TG_SUGGESTION_CHAT_ID,
        headerText,
        {
            reply_parameters: {
                message_id: reviewMsg.message_id
            },
            ...BUTTONS_MARKUP.ACCEPT_OR_REJECT(reviewMsg.message_id)
        }
    );

    const pending: PendingMessage = {
        original: {
            chatId: chat.id,
            messageId: message.message_id,
            caption: origCaption,
            contentFileId: message.animation.file_id,
            username: message.from?.username ? `@${message.from.username}` : `ID: ${message.from?.id}`
        },
        review: {
            messageId: reviewMsg.message_id,
            buttonsMsgId: actionsMsg.message_id
        }
    };
    
    await TgStorage.add(reviewMsg.message_id, pending)
}

async function processEditedMessage(ctx: Context, message: Message.AnimationMessage) {
    const from = message.from!;
    const chat = ctx.chat!;
    const username = from?.username ? `@${from.username}` : `ID: ${from?.id}`

    const postData = await TgStorage.findByOriginalID(chat.id, message.message_id);
    if (!postData) {
        log.warn(`No post data found while handling "edited_message" for User: ${username}, ChatID: ${chat.id}, MessageID: ${message.message_id}`);
        return;
    }

    await ctx.telegram.setMessageReaction(chat.id, message.message_id, REACTION.PROCESSING, true);
    await new Promise((resolve) => setTimeout(resolve, 2_000)); // Some delay to show the reaction
    await ctx.telegram.setMessageReaction(chat.id, message.message_id, REACTION.WAIT, true);

    const editedCaption = typeof message.caption === 'string' && message.caption.trim().length > 0 ? message.caption.trim() : ''
    await ctx.telegram.editMessageCaption(
        CONFIG.TG_SUGGESTION_CHAT_ID,
        postData.review.messageId,
        undefined,
        editedCaption,
    );

    const pending: PendingMessage = {
        original: {
            chatId: chat.id,
            messageId: message.message_id,
            caption: editedCaption,
            contentFileId: message.animation.file_id,
            username
        },
        review: {
            messageId: postData.review.messageId,
            buttonsMsgId: postData.review.buttonsMsgId
        }
    };

    await TgStorage.add(postData.review.messageId, pending)
}

export async function handleMessage(ctx: Context) {
    const message = ctx.message;
    await processIncomingMessage(ctx, message as any);
}

export async function handleEditedMessage(ctx: Context) {
    const message = ctx.editedMessage;
    await processEditedMessage(ctx, message as any);
}
