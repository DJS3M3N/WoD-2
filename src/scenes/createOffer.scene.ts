import { Markup, Scenes } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { ShopService } from "../services/shop.service";

export const createOfferScene = new Scenes.BaseScene<IBotContext>("create_offer");

createOfferScene.enter(ctx => {
    console.log("inside create offer");

    const formState = {
        stage: 0,
        item_id: 0,
        price: 0,
        rm_price: 0,
        currency_type: ''
    }

    ctx.reply("Введите название id предмета, который будет продаваться");
    createOfferScene.on('text', ctx => {
        const text = ctx.message.text;
        switch (formState.stage) {
            case 0:
                formState.item_id = parseInt(text);
                formState.stage++;
                ctx.reply("Введите цену предмета за внутриигровую валюту");
                break;
            case 1:
                formState.price = parseInt(text);
                formState.stage++;
                ctx.reply("Введите цену предмета за донатную валюту");
                break;
            case 2:
                formState.rm_price = parseInt(text);
                formState.stage++;
                ctx.reply("Введите тип валюты, за который можно будет купить предмет. Варианты: money, rm_currency, both");
                break;
            case 3:
                formState.currency_type = text;
                formState.stage = 0;
                ShopService.create(formState.currency_type, formState.item_id, formState.price, formState.rm_price);
                ctx.reply("Предмет успешно создан!", Markup.inlineKeyboard([Markup.button.callback("Вернуться в админ-панель", "open_admin")]))
        }
    });

    createOfferScene.action("open_admin", ctx => {
        ctx.editMessageReplyMarkup({inline_keyboard: []});
        ctx.scene.leave();
        ctx.scene.enter("admin");
    });
});