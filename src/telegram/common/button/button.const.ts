import { Markup } from 'telegraf';

export const BUTTONS_MARKUP = {
  ACCEPT_OR_REJECT: (postId: string) =>
    Markup.inlineKeyboard([
      Markup.button.callback('👍 Принять', `accept:${postId}`),
      Markup.button.callback('👎 Отклонить', `reject:${postId}`),
    ]),
};
