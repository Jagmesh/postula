import { Context } from 'telegraf';
import Logger from 'jblog';
import { REACTION } from '../const.js';

const log = new Logger({ scopes: ['VALIDATION'] });
export async function validateAnimationMsg(ctx: Context, next: () => Promise<void>) {
  const message = ctx.message || ctx.editedMessage;
  if (!message || message.chat.type !== 'private') {
    return log.error('Invalid message');
  }
  log.info('Received message:', message);
  const { id } = ctx.chat!;

  if (message?.from?.username === ctx.me) return log.error('The bot itself has sent this message');
  const from = message.from?.username ? `@${message.from.username}` : `ID: ${message.from?.id}`;

  if (!('animation' in message)) {
    await ctx.telegram.setMessageReaction(id, message.message_id, REACTION.REJECT, true);
    return log.error(`No animation in message [${from}]`);
  }

  /** No post validation for now */
  // if (!('caption' in message) || typeof message.caption !== 'string' || message.caption.trim().length === 0) {
  //     await ctx.telegram.setMessageReaction(id, message.message_id, REACTION.REJECT, true);
  //     return log.error(`No caption in message [${from}]`);
  // }

  await next();
}
