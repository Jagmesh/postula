import {Telegraf, Context} from "telegraf";
import Logger from "jblog";
import {handleEditedMessage, handleMessage} from "./handler/on/message-handler.js";
import {handleAccept, handleReject} from "./handler/action/action-handler.js";
import {validateAnimationMsg} from "./validation/validate.js";
import {commandStart} from "./handler/command/start.command.js";
import { CONFIG } from "../config.js";

export class Telegram {
    private readonly log: Logger = new Logger({scopes: [Telegram.name.toUpperCase()]});
    private readonly bot: Telegraf;

    constructor(botToken: string) {
        this.bot = new Telegraf(botToken);
    }

    async init() {
        this.bot.catch((err: unknown, ctx: Context) => {
            this.log.error(`Error occured: ${err}`)
            this.bot.telegram.sendMessage(CONFIG.TG_SUGGESTION_CHAT_ID, `Error occured: ${err}`)
        })

        this.bot.command('start', commandStart)

        this.bot.on('message', validateAnimationMsg, handleMessage);
        this.bot.on('edited_message', validateAnimationMsg, handleEditedMessage);

        this.bot.action(/accept:(\d+)/, handleAccept);
        this.bot.action(/reject:(\d+)/, handleReject);

        await this.bot.launch(() => { this.log.success('Bot started successfully')})
    }
}