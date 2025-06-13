import {Context} from "telegraf";
import {CONFIG} from "../../../config.js";
import Logger from "jblog";

const log = new Logger({scopes: ['/FLUSH']});

export async function commandFlush(ctx: Context): Promise<void> {
    const suggestionChatId = CONFIG.TG_SUGGESTION_CHAT_ID
    if(suggestionChatId != ctx.chat?.id) return;

    const currentMsgId = ctx.msgId
    const from = 75, to = currentMsgId || 0
    log.info(`Deleting ${to-from} posts in ${suggestionChatId} (from ${from} to ${to})`)

    for (let i = from; i <= to; i++) {
        try {
            await ctx.telegram.deleteMessage(suggestionChatId, i);
        } catch {}
    }
    log.success(`Deleted ${to-from} posts in ${suggestionChatId} (from ${from} to ${to})`)
}