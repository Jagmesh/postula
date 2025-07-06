import { ReactionTypeEmoji } from 'telegraf/types';

export const REACTION = {
    WAIT: [{ type: 'emoji', emoji: '👀' }],
    ACCEPT: [{ type: 'emoji', emoji: '👍' }],
    REJECT: [{ type: 'emoji', emoji: '👎' }],
    PROCESSING: [{ type: 'emoji', emoji: '🤔' }],
} satisfies Record<string, ReactionTypeEmoji[]>;