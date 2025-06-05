import {Telegram} from "./telegram/index.js";
import {CONFIG} from "./config.js";
import {Redis} from "./redis/redis.service.js";

async function bootstrap() {
    await Redis.init({
        url: CONFIG.REDIS_HOST_URL,
        password: CONFIG.REDIS_PASSWORD,
        database: 0
    })

    await new Telegram(CONFIG.TG_BOT_TOKEN).init()
}

bootstrap();