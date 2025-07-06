import {Redis} from "../../redis/redis.service.js";
import {PendingMessage} from "../type";

const GET_POST_KEY = (id: string | number) => { return `post_id:${id}` }
const GET_ORIGINAL_POST_KEY = (chat_id: string | number, message_id: string | number) => { return `original_id:${chat_id}:${message_id}` }

export class TgStorage {
    static async add(postID: string | number, data: PendingMessage): Promise<void> {
        const redis = Redis.getInstance()
        await redis.set(GET_POST_KEY(postID), data)
        await redis.set(GET_ORIGINAL_POST_KEY(data.original.chatId, data.original.messageId), postID)
    }

    static async findByPostID(postID: string | number): Promise<PendingMessage | null> {
        return Redis.getInstance().get(GET_POST_KEY(postID))
    }

    static async findByOriginalID(chatID: string | number, messageID: string | number): Promise<PendingMessage | null> {
        const postID = await Redis.getInstance().get<string>(GET_ORIGINAL_POST_KEY(chatID, messageID))
        if (!postID) return null

        return TgStorage.findByPostID(postID)
    }

    static async delete(postID: string | number): Promise<void> {
        const data = await TgStorage.findByPostID(postID)
        if(!data) return;

        await Redis.getInstance().delete(GET_POST_KEY(postID));
        await Redis.getInstance().delete(GET_ORIGINAL_POST_KEY(data.original.chatId, data.original.messageId));
    }
}