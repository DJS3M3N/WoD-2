import { Markup, Scenes } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { InventoryService } from "../services/inventory.service";
import { UserService } from "../services/user.service";
import { InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";
import { deleteMarkup } from "../lib/deleteMarkup";

export const equipItemScene = new Scenes.BaseScene<IBotContext>("equip_item");

equipItemScene.enter(async ctx => {
    console.log("inside equip item");

    let current_slot = "";
    let num = -1;

    if (!ctx.from) {
        return;
    }

    let tooltips = [];

    for (let slot of ["arms", "legs", "feet", "lefthand", "righthand", "head", "thorax"]) {
        tooltips.push((await InventoryService.getInventoryWithSlot(ctx.from.id, slot)).length);
    }

    equipItemScene.on("text", async ctx => {
        num = parseInt(ctx.message.text);
        const items = await InventoryService.getItemFromInventoryWithSlot(ctx.from.id, current_slot);
        const inventory = await InventoryService.getInventoryWithSlot(ctx.from.id, current_slot);

        if (num === 0) {
            deleteMarkup(ctx, ctx.chat.id, ctx.message.message_id - 1);
            UserService.removeItemFromSlot(ctx.from.id, current_slot);
            ctx.reply("Вы успешно убрали предмет из слота: " + current_slot, Markup.inlineKeyboard([Markup.button.callback("Вернуться", "back_to_equipment")]));
        } else if (num > 0 && num <= items.length) {
            deleteMarkup(ctx, ctx.chat.id, ctx.message.message_id - 1);
            UserService.putItemInSlot(ctx.from.id, inventory[num - 1].id, current_slot);
            ctx.reply("Вы успешно экипировали предмет: " + items[num - 1].name + " в слот: " + current_slot,
                Markup.inlineKeyboard([Markup.button.callback("Вернуться", "back_to_equipment")]));
        } else {
            ctx.reply("Неверный номер предмета, попробуйте еще", Markup.inlineKeyboard([Markup.button.callback("Вернуться", "back_to_equipment")]));
        }
    });

    ctx.reply("Выберите слот, предмет в котором вы хотите поменять: ", Markup.inlineKeyboard([
        [Markup.button.callback("🪖 Шлем (" + tooltips[5] + ")", "head")],
        [Markup.button.callback("🤛🏼 Левая рука (" + tooltips[3] + ")", "lefthand"),
        Markup.button.callback("👔 Грудь (" + tooltips[6] + ")", "thorax"),
        Markup.button.callback("🤜🏼 Правая рука (" + tooltips[4] + ")", "righthand")],
        [Markup.button.callback("🧤 Перчатки (" + tooltips[0] + ")", "arms"),
        Markup.button.callback("👖 Штаны (" + tooltips[1] + ")", "legs"),
        Markup.button.callback("👞 Обувь (" + tooltips[2] + ")", "feet")],
        [Markup.button.callback("Вернуться", "back_to_equipment")]
    ]));



    equipItemScene.action("arms", async ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        current_slot = "arms";

        chooseItem(ctx, current_slot);
    });

    equipItemScene.action("legs", async ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        current_slot = "legs";

        chooseItem(ctx, current_slot);
    });

    equipItemScene.action("feet", async ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        current_slot = "feet";

        chooseItem(ctx, current_slot);
    });

    equipItemScene.action("lefthand", async ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        current_slot = "lefthand";

        chooseItem(ctx, current_slot);
    });

    equipItemScene.action("righthand", async ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        current_slot = "righthand";

        chooseItem(ctx, current_slot);
    });

    equipItemScene.action("head", async ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        current_slot = "head";

        chooseItem(ctx, current_slot);
    });

    equipItemScene.action("thorax", async ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        current_slot = "thorax";

        chooseItem(ctx, current_slot);
    });

    equipItemScene.action("back_to_equipment", ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave()
        ctx.scene.enter("equipment");
    });

    equipItemScene.action("back_to_equip_item", ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave()
        ctx.scene.enter("equip_item");
    });
});

async function chooseItem(ctx: any, current_slot: string) {
    const items = await InventoryService.getItemFromInventoryWithSlot(ctx.from.id, current_slot);

    ctx.replyWithHTML("Теперь выберите предмет, который вы хотите надеть:\n"
        + items.map((item, index) => ("\n" + (index + 1) + ". <b>") + item.name + "</b> 👊🏼 " + item.power).join("")
        + "\n\nЧтобы убрать предмет из слота введите 0",
        Markup.inlineKeyboard([Markup.button.callback("Вернуться", "back_to_equip_item")]));
}