import 'dotenv/config';
import Logger from 'jblog';

const CONFIG = {
  TG_BOT_TOKEN: process.env.TG_BOT_TOKEN!,
  TG_SUGGESTION_CHAT_ID: Number(process.env.TG_SUGGESTION_CHAT_ID),
  TG_TARGET_CHANNEL_ID: process.env.TG_TARGET_CHANNEL_ID!,
  TG_ARCHIVE_THREAD_ID: Number(process.env.TG_ARCHIVE_THREAD_ID),
  TG_ADMIN_ID_LIST: process.env.TG_ADMIN_ID_LIST ? process.env.TG_ADMIN_ID_LIST.split(',') : [],
  TG_POSTPONED_POSTS_POSTING_SLOTS: process.env.TG_POSTPONED_POSTS_POSTING_SLOTS
    ? process.env.TG_POSTPONED_POSTS_POSTING_SLOTS.split(',')
    : [],
  TG_POSTPONED_POSTS_TIMEZONE: process.env.TG_POSTPONED_POSTS_TIMEZONE || 'Europe/Moscow',

  REDIS_HOST_URL: process.env.REDIS_HOST_URL,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
};

for (const configKey in CONFIG) {
  if (CONFIG[configKey as keyof typeof CONFIG] === undefined) {
    new Logger({ scopes: ['CONFIG'] }).error(`Check .env — ${configKey} is required`);
    process.exit(1);
  }
}

export { CONFIG };
