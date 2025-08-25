import { Redis } from '../../redis/redis.service.js';
import { PostData } from '../type';
import { CONFIG } from '../../config.js';

type lookup = 'original' | 'review' | 'archive';
const LOOKUPS_LIST: lookup[] = ['original', 'review', 'archive'];

const GET_POST_KEY = (id: string | number) => {
  return `post_id:${id}`;
};
const GET_LOOKUP_POST_KEY = (type: lookup) => {
  return `lookup:${type}`;
};
const GET_CHAT_POST_COMMON_KEY = (chat_id: string | number, message_id: string | number) => {
  return `${chat_id}:${message_id}`;
};

export class TgStorage {
  static async add(post: PostData): Promise<void> {
    const redis = Redis.getInstance();
    await redis.set(GET_POST_KEY(post.id), post);

    await redis.hSet(GET_LOOKUP_POST_KEY('original'), {
      [GET_CHAT_POST_COMMON_KEY(post.original.chatId, post.original.messageId)]: post.id,
    });
    await redis.hSet(GET_LOOKUP_POST_KEY('review'), {
      [GET_CHAT_POST_COMMON_KEY(CONFIG.TG_SUGGESTION_CHAT_ID, post.review.messageId)]: post.id,
    });
    if (post.archive) {
      await redis.hSet(GET_LOOKUP_POST_KEY('archive'), {
        [GET_CHAT_POST_COMMON_KEY(CONFIG.TG_SUGGESTION_CHAT_ID, post.archive.messageId)]: post.id,
      });
    }
  }

  static async findById(id: string): Promise<PostData | null> {
    return Redis.getInstance().get(GET_POST_KEY(id));
  }

  static async find(chatID: string | number, messageID: string | number): Promise<PostData | null> {
    const redis = Redis.getInstance();
    //TODO: add other lookup sets handling
    const postId = await redis.hGet(GET_LOOKUP_POST_KEY('original'), GET_CHAT_POST_COMMON_KEY(chatID, messageID));
    if (!postId) return null;

    return this.findById(postId);
  }

  static async delete(postID: string): Promise<void> {
    const post = await TgStorage.findById(postID);
    if (!post) return;

    const redis = Redis.getInstance();
    await redis.delete(GET_POST_KEY(post.id));

    await redis.hDelete(
      GET_LOOKUP_POST_KEY('original'),
      GET_CHAT_POST_COMMON_KEY(post.original.chatId, post.original.messageId)
    );
    await redis.hDelete(
      GET_LOOKUP_POST_KEY('review'),
      GET_CHAT_POST_COMMON_KEY(CONFIG.TG_SUGGESTION_CHAT_ID, post.review.messageId)
    );
    if (post.archive) {
      await redis.hDelete(
        GET_LOOKUP_POST_KEY('archive'),
        GET_CHAT_POST_COMMON_KEY(CONFIG.TG_SUGGESTION_CHAT_ID, post.archive.messageId)
      );
    }
  }
}
