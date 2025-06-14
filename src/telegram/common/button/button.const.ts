import {Markup} from "telegraf";

export const BUTTONS_MARKUP = {
    ACCEPT_OR_REJECT: (msgId: number) => Markup.inlineKeyboard([
        Markup.button.callback('👍 Принять', `accept:${msgId}`),
        Markup.button.callback('👎 Отклонить', `reject:${msgId}`)
    ])
}