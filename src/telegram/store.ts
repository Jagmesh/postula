import type { PendingMessage } from './type';

export const pendingMessagesMap = new Map<string, PendingMessage>();

export const REACTIONS: Record<string, any[]> = {
    wait: [{ type: 'emoji', emoji: '👀' }],
    accept: [{ type: 'emoji', emoji: '👍' }],
    reject: [{ type: 'emoji', emoji: '👎' }]
};