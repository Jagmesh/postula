import { Context } from 'telegraf';
import {CONFIG} from '../../config.js';
import { pendingMessagesMap, REACTION } from '../store.js';

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

    const data = pendingMessagesMap.get(forwardedId);
    if (!data) {
        await ctx.answerCbQuery('⚠️ Сообщение уже обработано или истекло');
        return;
    }
    const { original, review } = data;

    await Promise.all([
        ctx.telegram.deleteMessage(CONFIG.TG_SUGGESTION_CHAT_ID, review.messageId),
        ctx.telegram.deleteMessage(CONFIG.TG_SUGGESTION_CHAT_ID, review.buttonsMsgId)
    ]);


    await ctx.telegram.setMessageReaction(
        original.chatId,
        original.messageId,
        REACTION.ACCEPT,
        true
    );

    await ctx.telegram.sendAnimation(CONFIG.TG_TARGET_CHANNEL_ID, original.contentFileId, {
        caption: original.caption,
        parse_mode: 'HTML'
    });

    await ctx.answerCbQuery('👍 Принято и отправлено в канал');
    pendingMessagesMap.delete(forwardedId);
}

export async function handleReject(ctx: Context) {
    const forwardedId = parseCallbackData(ctx);
    if (!forwardedId) {
        await ctx.answerCbQuery('Некорректные данные');
        return;
    }

    const data = pendingMessagesMap.get(forwardedId);
    if (!data) {
        await ctx.answerCbQuery('⚠️ Сообщение уже обработано или истекло');
        return;
    }
    const { original, review } = data;

    await Promise.all([
        ctx.telegram.deleteMessage(CONFIG.TG_SUGGESTION_CHAT_ID, review.messageId),
        ctx.telegram.deleteMessage(CONFIG.TG_SUGGESTION_CHAT_ID, review.buttonsMsgId)
    ]);

    await ctx.telegram.setMessageReaction(
        original.chatId,
        original.messageId,
        REACTION.ACCEPT,
        true
    );

    await ctx.answerCbQuery('👎 Отклонено');
    pendingMessagesMap.delete(forwardedId);
}
