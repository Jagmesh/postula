import { CONFIG } from '../../../config.js';
import { REACTION } from '../../const.js';

export const TG_TEXT = {
  ENTRY_MESSAGE: prepareEntryMessage(),
  INSTRUCTIONS_MESSAGE: prepareInstructions(),
  FEEDBACK_MESSAGE: prepareFeedbackMessage(),
};

function prepareEntryMessage(): string {
  return (
    'Здарова!\n\n' +
    `Это бот предлошки для ${CONFIG.TG_TARGET_CHANNEL_ID} под авторством @jagmesh\n\n` +
    `<i>[БОТ ПОКА ЧТО В EARLY ACCESS, МНОГОЕ БУДЕТ ДОРАБАТЫВАТЬСЯ, ЧТО-ТО МОЖЕТ БЫТЬ БЫТЬ СЛОМАНО]</i>\n\n` +
    '<b>Кидай посты в формате Гиф + Текст\n\n</b>' +
    '<blockquote>Статусы:\n' +
    `${REACTION.WAIT[0].emoji} — предложка принята и находится на рассмотрении\n` +
    `${REACTION.ACCEPT[0].emoji} — предложка принята и опубликована\n` +
    `${REACTION.POSTPONED[0].emoji} — предложка принята и в отложке (будет опубликована позже)\n` +
    `${REACTION.REJECT[0].emoji} — предложка отклонена <i>(либо отклонена вручную, потому что прикол неприкольный, либо отклонена автоматически, потому что неверный формат, нет текста в записи и тд)</i>\n` +
    `${REACTION.PROCESSING[0].emoji} — запрос обрабатывается (бот думоет)` +
    '</blockquote>'
  );
}

function prepareInstructions(): string {
  return (
    'Отправить <b>Гифку + Текст</b>\n можно несколькими способами:\n\n' +
    '<blockquote>' +
    '1. Отправь <b>видео с выключенным звуком</b> <i>(нужно тыкнуть на значок звука перед отправкой)</i> и с текстом к нему;\n\n' +
    '2. Отправь <b>гифку без подписи</b>, а затем <b>отредактируй</b> пост, добавив туда текст;\n\n' +
    '3. Отправь гифку как файл <i>[так тоже можно, но там дрочно добавлять текcт, придется поковыряться]</i>;\n\n' +
    '4. <i>[с ПК]</i> Тыкни правой кнопкой мыши на гифку и выбери "Отправить GIF с подписью"' +
    '</blockquote>'
  );
}

function prepareFeedbackMessage(): string {
  return `<i>Если что-то сломалось, или ты хочешь предложить улучшения, то можешь написать в личку @jagmesh 🐊</i>`;
}
