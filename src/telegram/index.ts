import {Telegraf} from "telegraf";
import Logger from "jblog";
import {BOT_TOKEN} from "../config.js";
import {handleEditedMessage, handleMessage} from "./handler/message-handler.js";
import {handleAccept, handleReject} from "./handler/action-handler.js";

export function initTgBot() {
    const bot = new Telegraf(BOT_TOKEN);
    const log = new Logger({scopes: ['BOOTSTRAP']})

    bot.on('message', handleMessage);
    bot.on('edited_message', handleEditedMessage);
    bot.action(/accept:(\d+)/, handleAccept);
    bot.action(/reject:(\d+)/, handleReject);

    bot.launch(() => { log.success('Bot started successfully')})
}