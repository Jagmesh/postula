import {Context} from "telegraf";
import {TG_TEXT} from "../../text/text.const.js";

export async function commandStart(ctx: Context): Promise<void> {
    await ctx.sendMessage(TG_TEXT.ENTRY_MESSAGE, {parse_mode: 'HTML'});
}