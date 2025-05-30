import { Context, Markup } from 'telegraf';
import { YOUR_TELEGRAM_ID } from '../../config.js';
import { pendingMessagesMap, REACTIONS } from '../store.js';
import type { PendingMessage } from '../type';
import Logger from "jblog";
import { Message, Update, CommonMessageBundle } from 'telegraf/types';

const log = new Logger({scopes: ['HANDLER', 'MESSAGE']})

async function processIncomingMessage(ctx: Context, message: Message.TextMessage | Message.AnimationMessage) {
    log.info("Received message:", message);
    const from = message.from!;
    const chat = ctx.chat!;

    let hasGif, hasCaption =  false;
    if ('animation' in message) hasGif = !!message.animation;
    if ('caption' in message) hasCaption = typeof message.caption === 'string' && message.caption.trim().length > 0;

    if (!hasGif || !hasCaption) {
        await ctx.telegram.setMessageReaction(chat.id, message.message_id, REACTIONS.reject, true);
        return;
    }

    await ctx.telegram.setMessageReaction(chat.id, message.message_id, REACTIONS.wait, true);

    const forwarded = await ctx.telegram.forwardMessage(
        YOUR_TELEGRAM_ID,
        chat.id,
        message.message_id
    );

    const headerText = `📥 Пост от @${from.username || from.first_name} (id: ${from.id}) из "личка" (id сообщения: ${message.message_id}):`
    const actionsMsg = await ctx.telegram.sendMessage(
        YOUR_TELEGRAM_ID,
        headerText,
        Markup.inlineKeyboard([
            Markup.button.callback('👍 Принять', `accept:${forwarded.message_id}`),
            Markup.button.callback('👎 Отклонить', `reject:${forwarded.message_id}`)
        ])
    );

    const key = `forwardedId:${forwarded.message_id}`;
    const pending: PendingMessage = {
        originalChatId: chat.id,
        originalMessageId: message.message_id,
        forwardedMsgId: forwarded.message_id,
        actionsMsgId: actionsMsg.message_id
    };
    pendingMessagesMap.set(key, pending);
}

function validateMessage(message:  (Update.Edited & Update.NonChannel & CommonMessageBundle) | (Update.New & Update.NonChannel & Message) | undefined): boolean {
    return !(!message || message.chat.type !== 'private');
}

export async function handleMessage(ctx: Context) {
    const message = ctx.message;

    if (!validateMessage(message)) return;
    await processIncomingMessage(ctx, message as any);
}

export async function handleEditedMessage(ctx: Context) {
    const message = ctx.editedMessage;

    if (!validateMessage(message)) return;
    await processIncomingMessage(ctx, message as any);
}
