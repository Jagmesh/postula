import { Context } from 'telegraf';
import {CONFIG} from '../../../config.js';
import {  GET_POST_KEY, REACTION } from '../../const.js';
import { Redis } from '../../../redis/redis.service.js';
import { PendingMessage } from '../../type';
import {ReactionTypeEmoji} from "telegraf/types";

function parseCallbackData(ctx: Context): string | null {
    const data = ctx.callbackQuery && 'data' in ctx.callbackQuery
        ? (ctx.callbackQuery.data as string)
        : null;
    if (!data) return null;
    const parts = data.split(':');
    return parts.length === 2 ? parts[1] : null;
}

export async function handleAccept(ctx: Context): Promise<void> {
    const reviewMsgID = parseCallbackData(ctx);
    if (!reviewMsgID) {
        await ctx.answerCbQuery('Некорректные данные');
        return;
    }

    const postData = await Redis.getInstance().get<PendingMessage>(GET_POST_KEY(reviewMsgID));
    if (!postData) {
        await ctx.answerCbQuery('⚠️ Сообщение уже обработано или истекло');
        return;
    }

    const { original } = postData;
    await ctx.telegram.setMessageReaction(
        original.chatId,
        original.messageId,
        REACTION.ACCEPT,
        true
    );

    const updatedCaption  = `${original.caption}\n\n` +
    `👤 Автор: ${original.username}` +
    ` | <a href="https://t.me/${ctx.me}">Предложка</a>`
    await ctx.telegram.sendAnimation(CONFIG.TG_TARGET_CHANNEL_ID, original.contentFileId, {
        caption: updatedCaption,
        parse_mode: 'HTML'
    });

    await ctx.answerCbQuery('👍 Принято и отправлено в канал');
    await cleanUp(ctx, postData, REACTION.ACCEPT[0])
}

export async function handleReject(ctx: Context) {
    const reviewMsgID = parseCallbackData(ctx);
    if (!reviewMsgID) {
        await ctx.answerCbQuery('Некорректные данные');
        return;
    }

    const postData = await Redis.getInstance().get<PendingMessage>(GET_POST_KEY(reviewMsgID));
    if (!postData) {
        await ctx.answerCbQuery('⚠️ Сообщение уже обработано или истекло');
        return;
    }

    const { original } = postData;
    await ctx.telegram.setMessageReaction(
        original.chatId,
        original.messageId,
        REACTION.REJECT,
        true
    );

    await ctx.answerCbQuery('👎 Отклонено');
    await cleanUp(ctx, postData, REACTION.REJECT[0])
}

async function cleanUp(ctx: Context, post: PendingMessage, reaction: ReactionTypeEmoji): Promise<void> {
    const { original, review } = post;

    await Promise.all([
        ctx.telegram.editMessageCaption(
            CONFIG.TG_SUGGESTION_CHAT_ID,
            review.messageId,
            undefined,
            `${original.caption}\n\n` +
            `<blockquote>Пост от ${original.username}. Решение: "${reaction.emoji}" (by @${ctx.from?.username})</blockquote>`,
            {
                parse_mode: 'HTML'
            }
        ),
        ctx.telegram.deleteMessage(CONFIG.TG_SUGGESTION_CHAT_ID, review.buttonsMsgId)
    ]);

    await Redis.getInstance().delete(GET_POST_KEY(review.messageId));
}
