import { Context } from 'telegraf';
import { TARGET_CHANNEL_ID, YOUR_TELEGRAM_ID } from '../../config.js';
import { pendingMessagesMap, REACTIONS } from '../store.js';

function parseCallbackData(ctx: Context): string | null {
    const data = ctx.callbackQuery && 'data' in ctx.callbackQuery
        ? (ctx.callbackQuery.data as string)
        : null;
    if (!data) return null;
    const parts = data.split(':');
    return parts.length === 2 ? parts[1] : null;
}

export async function handleAccept(ctx: Context): Promise<void> {
    const forwardedId = parseCallbackData(ctx);
    if (!forwardedId) {
        await ctx.answerCbQuery('Некорректные данные');
        return;
    }
    const key = `forwardedId:${forwardedId}`;
    console.log('key:', key)
    console.log('pendingMessagesMap', pendingMessagesMap)
    const data = pendingMessagesMap.get(key);
    if (!data) {
        await ctx.answerCbQuery('⚠️ Сообщение уже обработано или истекло');
        return;
    }

    await Promise.all([
        ctx.telegram.deleteMessage(YOUR_TELEGRAM_ID, data.forwardedMsgId),
        ctx.telegram.deleteMessage(YOUR_TELEGRAM_ID, data.actionsMsgId)
    ]);

    await ctx.telegram.setMessageReaction(
        data.originalChatId,
        data.originalMessageId,
        REACTIONS.accept,
        true
    );

    await ctx.telegram.forwardMessage(
        TARGET_CHANNEL_ID,
        data.originalChatId,
        data.originalMessageId
    );

    await ctx.answerCbQuery('👍 Принято и отправлено в канал');
    pendingMessagesMap.delete(key);
}

export async function handleReject(ctx: Context) {
    const forwardedId = parseCallbackData(ctx);
    if (!forwardedId) {
        await ctx.answerCbQuery('Некорректные данные');
        return;
    }
    const key = `forwardedId:${forwardedId}`;
    const data = pendingMessagesMap.get(key);
    if (!data) {
        await ctx.answerCbQuery('⚠️ Сообщение уже обработано или истекло');
        return;
    }

    await Promise.all([
        ctx.telegram.deleteMessage(YOUR_TELEGRAM_ID, data.forwardedMsgId),
        ctx.telegram.deleteMessage(YOUR_TELEGRAM_ID, data.actionsMsgId)
    ]);

    await ctx.telegram.setMessageReaction(
        data.originalChatId,
        data.originalMessageId,
        REACTIONS.reject,
        true
    );

    await ctx.answerCbQuery('👎 Отклонено');
    pendingMessagesMap.delete(key);
}
