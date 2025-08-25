import { Context } from 'telegraf';
import { TG_TEXT } from '../../common/text/text.const.js';

export async function commandStart(ctx: Context): Promise<void> {
  const { message_id } = await ctx.sendMessage(TG_TEXT.ENTRY_MESSAGE, {
    parse_mode: 'HTML',
  });
  await ctx.sendMessage(TG_TEXT.INSTRUCTIONS_MESSAGE, { parse_mode: 'HTML' });
  await ctx.sendMessage(TG_TEXT.FEEDBACK_MESSAGE, { parse_mode: 'HTML' });
  await ctx.pinChatMessage(message_id);
}
