import { IBotContext } from "../context/context.interface";
import { Shop } from "../entity/Shop";
import { ShopService } from "../services/shop.service";
import { ItemService } from "../services/item.service";
import { Markup, Scenes } from "telegraf";
import { InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";

export const shopScene = new Scenes.BaseScene<IBotContext>("shop");

export type OffersDisplayed = {
    id: number,
    name: string,
    price: number,
    rm_price: number,
    description: string,
    picture: string,
    slot: string,
    power: number,
    currency_type: string
}

const formState = {
    num: 1,
    message_id: 0
}

shopScene.enter(async ctx => {
    const offers: Shop[] = await ShopService.getOffers();

    console.log('inside shop');

    const offers_displayed: OffersDisplayed[] = [];

    formState.num = 1;

    for (let offer of offers) {
        const item = await ItemService.getItem(offer.item_id);

        offers_displayed.push({
            id: offer.id,
            name: item.name,
            price: offer.price,
            rm_price: offer.rm_price,
            description: item.description,
            picture: item.picture,
            slot: item.slot,
            power: item.power,
            currency_type: offer.currency_type
        });
    }

    formState.message_id = (await ctx.replyWithPhoto("https://webshop.abo.fi/wp-content/uploads/woocommerce-placeholder-600x600.png",
        {
            reply_markup: { inline_keyboard: [[{ text: "Вернуться в меню", callback_data: "open_menu" }]] },
            caption: "Добро пожаловать в магазин! Происходит загрузка предложений..."
        })).message_id;

    showOffer(ctx, offers_displayed, formState.num, formState.message_id);

    shopScene.action("buy_with_money", async ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        const result = await ShopService.buyOfferWithMoney(offers_displayed[formState.num - 1].id, ctx.from.id);
        if (result) {
            ctx.reply("Предмет куплен", Markup.inlineKeyboard([Markup.button.callback("Вернуться к меню", "open_menu")]));
        } else {
            ctx.reply("Не удалось купить предмет, возможно на вашем счету недостаточно средств!",
                Markup.inlineKeyboard([Markup.button.callback("Вернуться к меню", "open_menu")]));
        }
    });

    shopScene.action("buy_with_rm_currency", async ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        const result = await ShopService.buyOfferWithRMCurrency(offers_displayed[formState.num - 1].id, ctx.from.id);
        if (result) {
            ctx.reply("Предмет куплен", Markup.inlineKeyboard([Markup.button.callback("Вернуться в меню", "open_menu")]));
        } else {
            ctx.reply("Не удалось купить предмет, возможно на вашем счету недостаточно средств!",
                Markup.inlineKeyboard([Markup.button.callback("Вернуться к меню", "open_menu")]));
        }
    });

    shopScene.action("open_menu", ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("shopping_district");
    });

    shopScene.action("prev_item", ctx => {
        if (formState.num === 1) {
            return;
        }

        formState.num--;

        showOffer(ctx, offers_displayed, formState.num, formState.message_id);
    });

    shopScene.action("next_item", ctx => {
        if (formState.num + 1 > offers_displayed.length) {
            return;
        }

        formState.num++;

        showOffer(ctx, offers_displayed, formState.num, formState.message_id);
    });

    function showOffer(ctx: IBotContext, offers: OffersDisplayed[], num: number, message_id: number): void {

        if (num - 1 < 0 || num - 1 >= offers.length) {
            return;
        }

        const inline_keyboard: InlineKeyboardMarkup = {
            inline_keyboard: [[{ text: '<<< (ещё ' + (num - 1) + ')', callback_data: 'prev_item' },
            { text: '(ещё ' + (offers.length - num) + ') >>>', callback_data: 'next_item' }],
            [{ text: 'Вернуться в меню', callback_data: 'open_menu' }]]
        };

        if (offers[num - 1].currency_type === "both") {
            inline_keyboard.inline_keyboard.unshift([{ text: 'Купить за деньги', callback_data: 'buy_with_money' }],
                [{ text: 'Купить за золото', callback_data: 'buy_with_rm_currency' }]);
        } else if (offers[num - 1].currency_type === "money") {
            inline_keyboard.inline_keyboard.unshift([{ text: 'Купить за деньги', callback_data: 'buy_with_money' }]);
        } else if (offers[num - 1].currency_type === "rm_currency") {
            inline_keyboard.inline_keyboard.unshift([{ text: 'Купить за золото', callback_data: 'buy_with_rm_currency' }]);
        }

        ctx.telegram.editMessageMedia(ctx.chat?.id, message_id, undefined, {
            media: offers[num - 1].picture, type: "photo",
            caption: "🛍️ Для вас сегодня есть <b>" + offers.length + "</b> предложений:\n\n⌨ Название предмета: <b>"
                + offers[num - 1].name + "</b>\n👊🏼 Сила: <b> " + offers[num - 1].power + "</b>\n💎 Цены: <b>" +
                (offers[num - 1].currency_type === "both" || offers[num - 1].currency_type === "money" ? offers[num - 1].price + "💰" : "")
                + (offers[num - 1].currency_type === "both" || offers[num - 1].currency_type === "rm_currency" ? " " + offers[num - 1].rm_price + " 🟡" : "")
                + "</b>\n👚 Надевается в слот: <b>" + offers[num - 1].slot + "</b>\n📃 Описание: <b>"
                + offers[num - 1].description + "</b>", parse_mode: "HTML"
        }, { reply_markup: inline_keyboard });
    }
});