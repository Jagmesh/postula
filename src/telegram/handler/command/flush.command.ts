import {Context, TelegramError} from "telegraf";
import {CONFIG} from "../../../config.js";
import Logger from "jblog";

const log = new Logger({scopes: ['/FLUSH']});

export async function commandFlush(ctx: Context): Promise<void> {
    const suggestionChatId = CONFIG.TG_SUGGESTION_CHAT_ID
    if(suggestionChatId != ctx.chat?.id) return;

    const currentMsgId = ctx.msgId
    const from = 525, to = currentMsgId || 0
    log.info(`Deleting ${to-from} posts in ${suggestionChatId} (from ${from} to ${to})`)

    for (let i = from; i <= to; i++) {
        try {
            await ctx.telegram.deleteMessage(suggestionChatId, i);
        } catch(err: TelegramError | unknown) {
            if(err instanceof TelegramError && err.response && err.response.error_code !== 400) {
                log.error(err.response);
            }
        }
    }
    log.success(`Deleted ${to-from} posts in ${suggestionChatId} (from ${from} to ${to})`)
}