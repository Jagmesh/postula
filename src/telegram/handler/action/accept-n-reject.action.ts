import { Markup } from 'telegraf';
import { CONFIG } from '../../../config.js';
import { BUTTONS_MARKUP } from '../../common/button/button.const.js';
import { Post } from '../../post/post.js';
import { Scheduler } from '../../../scheduler/scheduler.js';
import { PostDataContext } from '../../type';

export async function handleAccept(ctx: PostDataContext): Promise<void> {
  const { postData } = ctx;
  if (!postData) throw new Error('No post data');

  await ctx.telegram.editMessageReplyMarkup(
    CONFIG.TG_SUGGESTION_CHAT_ID,
    postData.review.buttonsMsgId,
    undefined,
    Markup.inlineKeyboard(
      [
        Markup.button.callback('🚀 Опубликовать сейчас', `post_now:${postData.id}`),
        Markup.button.callback('🕒 Опубликовать потом', `post_in_time:${postData.id}`),
        Markup.button.callback('🔙 Назад', `main_menu:${postData.id}`),
      ],
      {
        columns: 1,
      }
    ).reply_markup
  );
}

export async function handleReject(ctx: PostDataContext, postService: Post) {
  const { postData } = ctx;
  if (!postData) throw new Error('No post data');

  await postService.reject(postData);
  await ctx.answerCbQuery('👎 Отклонено');
}

export async function handlePostNow(ctx: PostDataContext, postService: Post) {
  const { postData } = ctx;
  if (!postData) throw new Error('No post data');

  await postService.accept(postData);
  await ctx.answerCbQuery('👍 Принято и отправлено в канал');
}

export async function handlePostInTime(ctx: PostDataContext, scheduler: Scheduler) {
  const { postData } = ctx;
  if (!postData) throw new Error('No post data');

  await scheduler.queue(postData);
  await ctx.answerCbQuery('⏳ Пост отправлен в отложку');
}

export async function handleMainMenu(ctx: PostDataContext) {
  const { postData } = ctx;
  if (!postData) throw new Error('No post data');

  await ctx.telegram.editMessageReplyMarkup(
    CONFIG.TG_SUGGESTION_CHAT_ID,
    postData.review.buttonsMsgId,
    undefined,
    BUTTONS_MARKUP.ACCEPT_OR_REJECT(postData.id).reply_markup
  );
}
