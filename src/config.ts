import 'dotenv/config';
import Logger from "jblog";

export const BOT_TOKEN = process.env.BOT_TOKEN!;
export const YOUR_TELEGRAM_ID = Number(process.env.YOUR_TELEGRAM_ID);
export const TARGET_CHANNEL_ID = process.env.TARGET_CHANNEL_ID!;

if (!BOT_TOKEN || !YOUR_TELEGRAM_ID || !TARGET_CHANNEL_ID) {
    new Logger({scopes: ['CONFIG']}).error('Check .env — BOT_TOKEN, YOUR_TELEGRAM_ID, TARGET_CHANNEL_ID are required');
    process.exit(1);
}