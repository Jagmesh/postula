import { Context } from "telegraf";

export interface PendingMessage {
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
  admin?: {
    username: string;
  };
}

export interface PostDataContext extends Context {
  postData?: PendingMessage;
}
