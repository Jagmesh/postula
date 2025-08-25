import { Context } from 'telegraf';
import crypto from 'crypto';

export interface PostData {
  id: crypto.UUID;
  original: {
    chatId: number | string;
    messageId: number;
    caption: string;
    username: string;
  };
  review: {
    messageId: number;
    buttonsMsgId: number;
  };
  archive?: {
    messageId: number;
  };
  admin?: {
    username: string;
  };
}

export interface PostDataContext extends Context {
  postData?: PostData;
}
