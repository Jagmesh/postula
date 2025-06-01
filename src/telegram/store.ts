import type { PendingMessage } from './type';
import { ReactionTypeEmoji } from 'telegraf/types';

export const pendingMessagesMap = new Map<string, PendingMessage>();

export const REACTION = {
    WAIT: [{ type: 'emoji', emoji: '👀' }],
    ACCEPT: [{ type: 'emoji', emoji: '👍' }],
    REJECT: [{ type: 'emoji', emoji: '👎' }]
} satisfies Record<string, ReactionTypeEmoji[]>;