import { Context } from 'telegraf';
import { TgStorage } from '../storage/storage.service.js';
import { PostDataContext } from '../type';
import Logger from 'jblog';

const log = new Logger({ scopes: ['POST_DATA_ENRICHER'] });

export async function postDataEnricher(ctx: Context, next: () => Promise<void>) {
  const adminName = ctx?.from?.username;
  const postId = parseCallbackData(ctx);
  if (!postId) {
    log.error('Invalid data: no postId');
    await ctx.answerCbQuery('Некорректные данные: no postId');
    return;
  }

  const postData = await TgStorage.findById(postId);
  if (!postData) {
    log.error('Message already has been processed or expired');
    await ctx.answerCbQuery('⚠️ Сообщение уже обработано или истекло');
    return;
  }

  if (adminName) {
    postData.admin = { username: adminName };
    await TgStorage.add(postData);
  }
  (ctx as PostDataContext).postData = postData;

  return next();
}

function parseCallbackData(ctx: Context): string | null {
  const data = ctx.callbackQuery && 'data' in ctx.callbackQuery ? (ctx.callbackQuery.data as string) : null;
  if (!data) return null;
  const parts = data.split(':');
  return parts.length === 2 ? parts[1] : null;
}
