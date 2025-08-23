import { Context } from "telegraf";
import Logger from "jblog";
import { TgStorage } from "../storage/storage.service.js";
import {PostDataContext} from "../type";

const log = new Logger({ scopes: ["POST_DATA_ENRICHER"] });

export async function postDataEnricher(
  ctx: Context,
  next: () => Promise<void>,
) {
  const adminName = ctx?.from?.username;
  const reviewMsgID = parseCallbackData(ctx);
  if (!reviewMsgID) {
    await ctx.answerCbQuery("Некорректные данные");
    return;
  }

  const postData = await TgStorage.findByPostID(reviewMsgID);
  if (!postData) {
    await ctx.answerCbQuery("⚠️ Сообщение уже обработано или истекло");
    return;
  }

  if (adminName) {
    postData.admin = { username: adminName };
    await TgStorage.add(reviewMsgID, postData);
  }
  (ctx as PostDataContext).postData = postData;

  await next();
}

function parseCallbackData(ctx: Context): string | null {
  const data =
    ctx.callbackQuery && "data" in ctx.callbackQuery
      ? (ctx.callbackQuery.data as string)
      : null;
  if (!data) return null;
  const parts = data.split(":");
  return parts.length === 2 ? parts[1] : null;
}
