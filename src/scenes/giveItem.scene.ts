import { Markup, Scenes } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { InventoryService } from "../services/inventory.service";

export const giveItemScene = new Scenes.BaseScene<IBotContext>("give_item");

giveItemScene.enter(ctx => {
    ctx.reply("Введите id нужного пользователя");
    const formState = {
        user_id: 0,
        item_id: 0,
        stage: 0
    }

    giveItemScene.on('text', ctx => {
        const text = ctx.message.text;
        switch(formState.stage) {
            case 0:
                formState.user_id = parseInt(text);
                formState.stage++;
                ctx.reply("Введите id нужного предмета!");
                break;
            case 1:
                formState.item_id = parseInt(text);
                formState.stage = 0;
                InventoryService.create(formState.user_id, formState.item_id);
                ctx.reply("Предмет успешно добавлен пользователю!", Markup.inlineKeyboard([Markup.button.callback("Вернуться в админ-панель", "open_admin")]));
        }
    });

    giveItemScene.action("open_admin", ctx => {
        ctx.editMessageReplyMarkup({inline_keyboard: []});
        ctx.scene.leave();
        ctx.scene.enter("admin");
    });
});