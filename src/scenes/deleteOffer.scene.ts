import { Markup, Scenes } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { ShopService } from "../services/shop.service";

export const deleteOfferScene = new Scenes.BaseScene<IBotContext>("delete_offer");

deleteOfferScene.enter(ctx => {
    ctx.reply("Введите id предложения, которое нужно удалить: ");

    deleteOfferScene.on('text', ctx => {
        const num = parseInt(ctx.message.text);

        ShopService.makeOfferNotActive(num);
        ctx.reply("Предложение отмечено как неактивное", Markup.inlineKeyboard([Markup.button.callback('Вернуться', 'open_admin')]));
    });

    deleteOfferScene.action("open_admin", ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("admin");
    });
});