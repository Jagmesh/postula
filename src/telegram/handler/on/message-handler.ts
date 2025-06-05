import {Context, Markup} from 'telegraf';
import {GET_POST_KEY, REACTION} from '../../const.js';
import type {PendingMessage} from '../../type';
import {Message} from 'telegraf/types';
import {CONFIG} from "../../../config.js";
import {Redis} from "../../../redis/redis.service.js";

async function processIncomingMessage(ctx: Context, message: Message.AnimationMessage) {
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
    
    await Redis.getInstance().set(GET_POST_KEY(reviewMsg.message_id), pending)
}

export async function handleMessage(ctx: Context) {
    const message = ctx.message;
    await processIncomingMessage(ctx, message as any);
}

export async function handleEditedMessage(ctx: Context) {
    const message = ctx.editedMessage;
    await processIncomingMessage(ctx, message as any);
}
