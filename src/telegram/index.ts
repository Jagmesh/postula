import { Telegraf, Context } from 'telegraf';
import Logger from 'jblog';
import { handleEditedMessage, handleMessage } from './handler/on/message.on.js';
import {
  handleAccept,
  handleMainMenu,
  handlePostInTime,
  handlePostNow,
  handleReject,
} from './handler/action/accept-n-reject.action.js';
import { validateAnimationMsg } from './middleware/validate.filter.js';
import { commandStart } from './handler/command/start.command.js';
import { CONFIG } from '../config.js';
import { commandFlush } from './handler/command/flush.command.js';
import { adminGuard } from './middleware/admin.guard.js';
import { commandHelp } from './handler/command/help.command.js';
import { Post } from './post/post.js';
import { Scheduler } from '../scheduler/scheduler.js';
import { commandQueue } from './handler/command/queue.command.js';
import { postDataEnricher } from './middleware/postdata.enricher.js';
import { CronJob } from 'cron';
import { newActionRegexp } from './handler/action/action.const';

export class Telegram {
  private readonly log: Logger = new Logger({
    scopes: [Telegram.name.toUpperCase()],
  });
  private readonly bot: Telegraf;
  private readonly postService: Post;
  private readonly scheduler: Scheduler;

  constructor(botToken: string) {
    this.bot = new Telegraf(botToken);
    this.postService = new Post(this.bot);
    this.scheduler = new Scheduler(this.postService);
  }

  async init() {
    for (const slot of CONFIG.TG_POSTPONED_POSTS_POSTING_SLOTS) {
      const [hour, minute] = slot.split(':');

      const job = CronJob.from({
        cronTime: `${minute} ${hour} * * *`, // 10:00, 17:00
        onTick: () => this.scheduler.process(),
        start: true,
        timeZone: CONFIG.TG_POSTPONED_POSTS_TIMEZONE,
      });
      this.log.success(`Cronjob on ${job.cronTime} (for ${job.cronTime.timeZone}) registered`)
      job.start();
    }


    this.bot.catch((err: unknown, ctx: Context) => {
      const errMsg = `update_id:${ctx.update.update_id}. ❌ Error occurred: ${err}`;
      this.log.error(errMsg);
      this.bot.telegram.sendMessage(CONFIG.TG_SUGGESTION_CHAT_ID, errMsg);
    });

    this.bot.use((ctx: Context, next) => {
      const updateType = ctx.updateType;
      const subtypes = Array.isArray((ctx as any).updateSubTypes) ? (ctx as any).updateSubTypes.join(',') : '';
      const updateId = ctx.update.update_id;
      const action = (ctx.update as any)?.callback_query?.data;
      const messageId =
        (ctx as any).message?.message_id ?? (ctx as any).callbackQuery?.id ?? (ctx as any).editedMessage?.message_id;
      const chatId = ctx.chat?.id;
      const fromId = ctx.from?.id;
      const username = ctx.from?.username ? `@${ctx.from.username}` : '';

      this.log.info(
        `Incoming update: type=${updateType}${subtypes ? ` subtypes=${subtypes}` : ''} update_id=${updateId ?? 'n/a'} ` +
          `msg_id=${messageId ?? 'n/a'} chat=${chatId ?? 'n/a'} from=${fromId ?? 'n/a'} ${username} ` +
          `action=${action ?? ''}`
      );

      return next();
    });

    this.bot.command('start', commandStart);
    this.bot.command('help', commandHelp);
    this.bot.command('flush', adminGuard, commandFlush);
    this.bot.command('queue', adminGuard, (ctx) => commandQueue(ctx, this.scheduler));

    this.bot.on('message', validateAnimationMsg, handleMessage);
    this.bot.on('edited_message', validateAnimationMsg, handleEditedMessage);

    this.bot.action(newActionRegexp('accept'), postDataEnricher, handleAccept);
    this.bot.action(newActionRegexp('reject'), postDataEnricher, (ctx) => handleReject(ctx, this.postService));

    this.bot.action(newActionRegexp('post_now'), postDataEnricher, (ctx) => handlePostNow(ctx, this.postService));
    this.bot.action(newActionRegexp('post_in_time'), postDataEnricher, (ctx) => handlePostInTime(ctx, this.scheduler));

    this.bot.action(newActionRegexp('main_menu'), postDataEnricher, handleMainMenu);

    await this.bot.launch(() => this.log.success('Bot started successfully'));
  }
}
