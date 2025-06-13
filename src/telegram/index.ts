import {Telegraf, Context} from "telegraf";
import Logger from "jblog";
import {handleEditedMessage, handleMessage} from "./handler/on/message.on.js";
import {handleAccept, handlePostInTime, handlePostNow, handleReject} from "./handler/action/accept-n-reject.action.js";
import {validateAnimationMsg} from "./middleware/validate.filter.js";
import {commandStart} from "./handler/command/start.command.js";
import { CONFIG } from "../config.js";
import {commandFlush} from "./handler/command/flush.command.js";
import {adminGuard} from "./middleware/admin.guard.js";

export class Telegram {
    private readonly log: Logger = new Logger({scopes: [Telegram.name.toUpperCase()]});
    private readonly bot: Telegraf;

    constructor(botToken: string) {
        this.bot = new Telegraf(botToken);
    }

    async init() {
        this.bot.catch((err: unknown, ctx: Context) => {
            this.log.error(`Error occurred: ${err}`)
            this.bot.telegram.sendMessage(CONFIG.TG_SUGGESTION_CHAT_ID, `❌ Error occurred: ${err}`)
        })

        this.bot.command('start', commandStart)
        this.bot.command('flush', adminGuard, commandFlush)

        this.bot.on('message', validateAnimationMsg, handleMessage);
        this.bot.on('edited_message', validateAnimationMsg, handleEditedMessage);

        this.bot.action(/accept:(\d+)/, handleAccept);
        this.bot.action(/reject:(\d+)/, handleReject);

        this.bot.action(/post_now:(\d+)/, handlePostNow);
        this.bot.action(/post_in_time:(\d+)/, handlePostInTime);

        await this.bot.launch(() => { this.log.success('Bot started successfully')})
    }
}