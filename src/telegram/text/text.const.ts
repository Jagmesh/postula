import {CONFIG} from "../../config.js";
import {REACTION} from "../store.js"

export const TG_TEXT = {
    ENTRY_MESSAGE: prepareEntryMessage()
}

function prepareEntryMessage(): string {
    return 'Здарова!\n\n' +
        `Это бот предлошки для ${CONFIG.TG_TARGET_CHANNEL_ID} под авторством @jagmesh\n\n` +
        `<i>[БОТ В АЛЬФЕ, МНОГОЕ БУДЕТ ДОРАБАТЫВАТЬСЯ, МНОГОЕ МОЖЕТ БЫТЬ СЛОМАНО]</i>\n\n`+
        '<b>Кидай посты в формате Гиф + Текст\n\n</b>' +
        '<blockquote>Статусы:\n' +
        `${REACTION.WAIT[0].emoji} — предложка принята и находится на рассмотрении\n` +
        `${REACTION.ACCEPT[0].emoji} — предложка принята и опубликована\n` +
        `${REACTION.REJECT[0].emoji} — предложка отклонена <i>(либо отклонена вручную, потому что прикол неприкольный, либо отклонена автоматически, потому что неверный формат, нет текста в записи и тд)</i>` +
        '</blockquote>';
}