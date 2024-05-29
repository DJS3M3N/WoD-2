import { Markup, Scenes } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { InventoryService } from "../services/inventory.service";
import { ItemService } from "../services/item.service";
import { MarketService } from "../services/market.service";
import { deleteMarkup } from "../lib/deleteMarkup";

type InventoryDisplayed = {
    name: string,
    power: number
}

export const createMarketOfferScene = new Scenes.BaseScene<IBotContext>("create_market_offer");

createMarketOfferScene.enter(async ctx => {
    console.log("inside create market offer");

    if (!ctx.from) {
        return;
    }

    let inventory = await InventoryService.getInventory(ctx.from.id);

    let inventory_displayed: InventoryDisplayed[] = [];

    for (let item of inventory) {
        inventory_displayed.push({ name: (await ItemService.getItem(item.item_id)).name, power:  (await ItemService.getItem(item.item_id)).power});
    }

    let message = await ctx.replyWithHTML(`🎒 В вашем инвентаре содержится:\n${inventory_displayed.map(
        (item, index) => "\n" + (index + 1) + ". <b>" + item.name + "</b> 👊🏼 " + item.power).join("")}`
         + "\n\nВведите номер предмета, который вы хотите выставить",
        Markup.inlineKeyboard([Markup.button.callback("Вернуться", "back_to_market")]));

    let stage = 0;

    let picked_item: number = 0;
    createMarketOfferScene.on('text', async ctx => {
        deleteMarkup(ctx, message.chat.id, ctx.message.message_id - 1);
        let num = parseInt(ctx.message.text);

        if (stage === 0) {
            if (num <= inventory.length && num > 0) {
                picked_item = num - 1;
                message = await ctx.replyWithHTML("Вы выбрали предмет <b>" + (await ItemService.getItem(inventory[picked_item].item_id)).name + "</b>\n\nТеперь введите цену",
                    Markup.inlineKeyboard([Markup.button.callback('Вернуться назад', 'back_to_market')]));
                stage++;
            } else {
                ctx.reply("Неверный номер предложения. Введите число заново", Markup.inlineKeyboard([Markup.button.callback('Вернуться назад', 'back_to_market')]));
            }
        } else if (stage === 1) {
            if (picked_item < 0) {
                throw Error("Wrong picked item!");
            }
            MarketService.createOffer(ctx.from.id, num, inventory[picked_item].item_id, inventory[picked_item].id);
            ctx.reply("Предложение успешно создано!", Markup.inlineKeyboard([Markup.button.callback('Вернуться назад', 'back_to_market')]));
            stage = 0;
        }
    });

    createMarketOfferScene.action('back_to_market', ctx => {
        stage = 0;
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("market");
    });
});