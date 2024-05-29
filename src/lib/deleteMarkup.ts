import { IBotContext } from "../context/context.interface";

export function deleteMarkup(ctx: IBotContext, chat_id: number, message_id: number) {
    ctx.telegram.editMessageReplyMarkup(chat_id, message_id, undefined, {inline_keyboard: []});
}