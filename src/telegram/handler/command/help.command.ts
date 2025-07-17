import {Context} from "telegraf";
import {TG_TEXT} from "../../common/text/text.const.js";

export async function commandHelp(ctx: Context): Promise<void> {
    await Promise.all([
            ctx.sendMessage(TG_TEXT.ENTRY_MESSAGE, {parse_mode: 'HTML'}),
            ctx.sendMessage(TG_TEXT.INSTRUCTIONS_MESSAGE, {parse_mode: 'HTML'}),
            ctx.sendMessage(TG_TEXT.FEEDBACK_MESSAGE, {parse_mode: 'HTML'})
        ])
}