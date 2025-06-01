import {Telegraf} from "telegraf";
import Logger from "jblog";
import {CONFIG} from "../config.js";
import {handleEditedMessage, handleMessage} from "./handler/message-handler.js";
import {handleAccept, handleReject} from "./handler/action-handler.js";
import {validateAnimationMsg} from "./validation/validate.js";
import {commandStart} from "./handler/command/start.command.js";

export function initTgBot() {
    const bot = new Telegraf(CONFIG.TG_BOT_TOKEN);
    const log = new Logger({scopes: ['BOOTSTRAP']})

    bot.command('start', commandStart)

    bot.on('message', validateAnimationMsg, handleMessage);
    bot.on('edited_message', validateAnimationMsg, handleEditedMessage);

    bot.action(/accept:(\d+)/, handleAccept);
    bot.action(/reject:(\d+)/, handleReject);

    bot.launch(() => { log.success('Bot started successfully')})
}