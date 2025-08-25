import { Context } from 'telegraf';
import Logger from 'jblog';
import { CONFIG } from '../../config.js';

const log = new Logger({ scopes: ['GUARD', 'ADMIN'] });

interface CommandContext extends Context {
  command?: string;
}

export async function adminGuard(ctx: CommandContext, next: () => Promise<void>): Promise<void> {
  if (!ctx.from) return;

  if (!CONFIG.TG_ADMIN_ID_LIST.includes(`${ctx.from.id}`))
    return log.warn(`An attempt to use "/${ctx?.command}" from ${ctx.from.username}`);

  await next();
}
