export interface PendingMessage {
    originalChatId: number | string;
    originalMessageId: number;
    forwardedMsgId: number;
    actionsMsgId: number;
}