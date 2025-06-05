import { ReactionTypeEmoji } from 'telegraf/types';

export const REACTION = {
    WAIT: [{ type: 'emoji', emoji: '👀' }],
    ACCEPT: [{ type: 'emoji', emoji: '👍' }],
    REJECT: [{ type: 'emoji', emoji: '👎' }]
} satisfies Record<string, ReactionTypeEmoji[]>;

export const GET_POST_KEY = (id: string | number) => { return `post_id:${id}` }