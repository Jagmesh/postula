import { PostData } from '../type';
import { POST_RESULT } from './post.const.js';
import { REACTION } from '../const.js';
import { TelegramError } from 'telegraf';
import Logger from 'jblog';

export function getCleanUpMessage(post: PostData, result: POST_RESULT): string {
  const { original } = post;
  const from = post.admin?.username;

  switch (result) {
    case POST_RESULT.ACCEPTED:
      return (
        `${original.caption}\n\n` +
        `<blockquote>Пост от ${original.username}. ` +
        `Решение: "${REACTION.ACCEPT[0].emoji}" (by @${from})</blockquote>` +
        `<blockquote>${post.id}</blockquote>`
      );
    case POST_RESULT.REJECTED:
      return (
        `${original.caption}\n\n` +
        `<blockquote>Пост от ${original.username}. ` +
        `Решение: "${REACTION.REJECT[0].emoji}" (by @${from})</blockquote>`
      );
    case POST_RESULT.POSTPONED:
      return (
        `${original.caption}\n\n` +
        `<blockquote>Пост от ${original.username}. ` +
        `Пост отложен (by @${from})</blockquote>`
      );
  }
}

const MSG_NOT_FOUND_REGEX = /^message to \S+ not found$/;
const log = new Logger({ scopes: ['POST_UTIL'] });
export function handleNotFoundErr(error: Error): void {
  if (error instanceof TelegramError && MSG_NOT_FOUND_REGEX.test(error.description)) {
    return log.error(error);
  }
  throw error;
}
