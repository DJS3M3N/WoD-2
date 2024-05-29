import { Markup, Scenes } from "telegraf";
import { IBotContext } from "../context/context.interface";

export  const shoppingDistrictScene = new Scenes.BaseScene<IBotContext>("shopping_district");

shoppingDistrictScene.enter(ctx => {

    console.log("inside shopping district");

    ctx.replyWithPhoto("https://s0.rbk.ru/v6_top_pics/media/img/1/04/755883604518041.jpg", {
        caption: "💰 Добро пожаловать в торговый квартал!\n\nЗдесь вы можете обзовестись новыми вещами или заработать, продав собственные",
        reply_markup: { inline_keyboard: [[Markup.button.callback("🏬 Рынок", "market")],
        [Markup.button.callback("🛒 Магазин", "shop")],
         [Markup.button.callback("🎲 Казино", "casino")],
         [Markup.button.callback("Вернуться", "back_to_menu")]
      ] 
        }, parse_mode: "HTML"
    });

    shoppingDistrictScene.action("shop", ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("shop");
    });

    shoppingDistrictScene.action("market", ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("market");
    });

    shoppingDistrictScene.action("casino", ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("casino");
    });

    shoppingDistrictScene.action("back_to_menu", ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("menu");
    });
});