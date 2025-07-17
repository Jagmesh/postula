import {Context, Markup, TelegramError} from 'telegraf';
import {CONFIG} from '../../../config.js';
import {  REACTION } from '../../const.js';
import { PendingMessage } from '../../type';
import {ReactionTypeEmoji} from "telegraf/types";
import {BUTTONS_MARKUP} from "../../common/button/button.const.js";
import {TgStorage} from "../../storage/storage.service.js";

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

    const postData = await TgStorage.findByPostID(reviewMsgID);
    if (!postData) {
        await ctx.answerCbQuery('⚠️ Сообщение уже обработано или истекло');
        return;
    }

    await ctx.telegram.editMessageReplyMarkup(
        CONFIG.TG_SUGGESTION_CHAT_ID,
        postData.review.buttonsMsgId,
        undefined,
        Markup.inlineKeyboard(
            [
                Markup.button.callback('🚀 Опубликовать сейчас', `post_now:${postData.review.messageId}`),
                Markup.button.callback('🕒 Опубликовать потом', `post_in_time:${postData.review.messageId}`),
                Markup.button.callback('🔙 Назад', `main_menu:${postData.review.messageId}`)
            ], {
                columns: 1
            }
        ).reply_markup)
}

export async function handleReject(ctx: Context) {
    const reviewMsgID = parseCallbackData(ctx);
    if (!reviewMsgID) {
        await ctx.answerCbQuery('Некорректные данные');
        return;
    }

    const postData = await TgStorage.findByPostID(reviewMsgID);
    if (!postData) {
        await ctx.answerCbQuery('⚠️ Сообщение уже обработано или истекло');
        return;
    }

    const { original } = postData;
    await setReaction(ctx,
        REACTION.REJECT,
        original.chatId,
        original.messageId,
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

    await TgStorage.delete(review.messageId);
}

export async function handlePostNow(ctx: Context) {
    const reviewMsgID = parseCallbackData(ctx);
    if (!reviewMsgID) {
        await ctx.answerCbQuery('Некорректные данные');
        return;
    }

    const postData = await TgStorage.findByPostID(reviewMsgID);
    if (!postData) {
        await ctx.answerCbQuery('⚠️ Сообщение уже обработано или истекло');
        return;
    }

    const { original } = postData;
    await setReaction(ctx,
        REACTION.ACCEPT,
        original.chatId,
        original.messageId,
    );

    const updatedCaption  = `${original.caption}\n\n` +
        `👤 Автор: ${original.username}` +
        ` | <a href="https://t.me/${ctx.me}">Предложка</a>`
    await ctx.telegram.copyMessage(CONFIG.TG_TARGET_CHANNEL_ID, CONFIG.TG_SUGGESTION_CHAT_ID, Number(reviewMsgID), {
            caption: updatedCaption,
            parse_mode: 'HTML',
        })

    await ctx.answerCbQuery('👍 Принято и отправлено в канал');
    await cleanUp(ctx, postData, REACTION.ACCEPT[0])
}

export async function handlePostInTime(ctx: Context) {
    //TODO: add postpone post handling
    await ctx.answerCbQuery('(┛ಠ_ಠ)┛彡┻━┻ NIZYANIZYANIZYANIZYA (¬､¬)')
}

export async function handleMainMenu(ctx: Context) {
    const reviewMsgID = parseCallbackData(ctx);
    if (!reviewMsgID) {
        await ctx.answerCbQuery('Некорректные данные');
        return;
    }

    const postData = await TgStorage.findByPostID(reviewMsgID);
    if (!postData) {
        await ctx.answerCbQuery('⚠️ Сообщение уже обработано или истекло');
        return;
    }

    await ctx.telegram.editMessageReplyMarkup(
        CONFIG.TG_SUGGESTION_CHAT_ID,
        postData.review.buttonsMsgId,
        undefined,
        BUTTONS_MARKUP.ACCEPT_OR_REJECT(postData.review.messageId).reply_markup
    )
}

async function setReaction(ctx: Context, reaction: ReactionTypeEmoji[], chatId: string | number, messageId: number): Promise<void> {
    await ctx.telegram.setMessageReaction(
        chatId,
        messageId,
        reaction,
        true
    ).catch(err => {
        if(err instanceof TelegramError) {
            console.log("err.description: ", err.description);
        }
    });
}
