import {Context, Markup} from 'telegraf';
import {pendingMessagesMap, REACTION} from '../store.js';
import type {PendingMessage} from '../type';
import Logger from "jblog";
import {Message} from 'telegraf/types';
import {CONFIG} from "../../config.js";

const log = new Logger({scopes: ['HANDLER', 'MESSAGE']})

async function processIncomingMessage(ctx: Context, message: Message.AnimationMessage) {
    log.info("Received message:", message);
    const from = message.from!;
    const chat = ctx.chat!;

    await ctx.telegram.setMessageReaction(chat.id, message.message_id, REACTION.WAIT, true);

    const origCaption = typeof message.caption === 'string' && message.caption.trim().length > 0 ? message.caption.trim() : ''
    const caption = `${origCaption}\n\n👤 Автор: ${message.from?.username ? `@${message.from.username}` : `ID: ${message.from?.id}`}`;

    const reviewMsg = await ctx.telegram.sendAnimation(CONFIG.TG_SUGGESTION_CHAT_ID, message.animation.file_id, {
        caption,
        parse_mode: 'HTML'
    });

    const headerText = `📥 Пост от @${from.username || from.first_name} (id: ${from.id} / id сообщения: ${message.message_id}):`
    const actionsMsg = await ctx.telegram.sendMessage(
        CONFIG.TG_SUGGESTION_CHAT_ID,
        headerText,
        Markup.inlineKeyboard([
            Markup.button.callback('👍 Принять', `accept:${reviewMsg.message_id}`),
            Markup.button.callback('👎 Отклонить', `reject:${reviewMsg.message_id}`)
        ])
    );

    const pending: PendingMessage = {
        original: {
            chatId: chat.id,
            messageId: message.message_id,
            caption: caption,
            contentFileId: message.animation.file_id
        },
        review: {
            messageId: reviewMsg.message_id,
            buttonsMsgId: actionsMsg.message_id
        }
    };
    pendingMessagesMap.set(String(reviewMsg.message_id), pending);
}

export async function handleMessage(ctx: Context) {
    const message = ctx.message;
    await processIncomingMessage(ctx, message as any);
}

export async function handleEditedMessage(ctx: Context) {
    const message = ctx.editedMessage;
    await processIncomingMessage(ctx, message as any);
}
