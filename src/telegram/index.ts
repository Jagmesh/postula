import { Telegraf, Context } from "telegraf";
import Logger from "jblog";
import { handleEditedMessage, handleMessage } from "./handler/on/message.on.js";
import {
  handleAccept,
  handleMainMenu,
  handlePostInTime,
  handlePostNow,
  handleReject,
} from "./handler/action/accept-n-reject.action.js";
import { validateAnimationMsg } from "./middleware/validate.filter.js";
import { commandStart } from "./handler/command/start.command.js";
import { CONFIG } from "../config.js";
import { commandFlush } from "./handler/command/flush.command.js";
import { adminGuard } from "./middleware/admin.guard.js";
import { commandHelp } from "./handler/command/help.command.js";
import { Post } from "./post/post.js";
import { Scheduler } from "../scheduler/scheduler.js";
import { commandQueue } from "./handler/command/queue.command.js";
import { postDataEnricher } from "./middleware/postdata.enricher.js";
import { CronJob } from "cron";

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
    this.bot.catch((err: unknown, ctx: Context) => {
      this.log.error(`Error occurred: ${err}`);
      this.bot.telegram.sendMessage(CONFIG.TG_SUGGESTION_CHAT_ID, `❌ Error occurred: ${err}`);
    });

    CronJob.from({
      cronTime: "0 10,17 * * *", // 10:00, 17:00
      onTick: () => {
        this.scheduler.process();
      },
      start: true,
      timeZone: 'Europe/Moscow'
    }).start();

    this.bot.command("start", commandStart);
    this.bot.command("help", commandHelp);
    this.bot.command("flush", adminGuard, commandFlush);
    this.bot.command("queue", adminGuard, (ctx) =>
      commandQueue(ctx, this.scheduler),
    );

    this.bot.on("message", validateAnimationMsg, handleMessage);
    this.bot.on("edited_message", validateAnimationMsg, handleEditedMessage);

    this.bot.action(/accept:(\d+)/, postDataEnricher, handleAccept);
    this.bot.action(/reject:(\d+)/, postDataEnricher, (ctx) =>
      handleReject(ctx, this.postService),
    );

    this.bot.action(/post_now:(\d+)/, postDataEnricher, (ctx) =>
      handlePostNow(ctx, this.postService),
    );
    this.bot.action(/post_in_time:(\d+)/, postDataEnricher, (ctx) =>
      handlePostInTime(ctx, this.scheduler),
    );

    this.bot.action(/main_menu:(\d+)/, postDataEnricher, handleMainMenu);

    await this.bot.launch(() => {
      this.log.success("Bot started successfully");
    });
  }
}
