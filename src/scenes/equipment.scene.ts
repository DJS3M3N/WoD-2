import { Markup, Scenes } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { UserService } from "../services/user.service";
import { ItemService } from "../services/item.service";

export const equipmentScene = new Scenes.BaseScene<IBotContext>("equipment");

equipmentScene.enter(async ctx => {
    console.log("inside equipment");
    if (!ctx.from) {
        return;
    }
    const user_data = await UserService.getUserInfo(ctx.from.id);
    const item_names = {
        arms: (await ItemService.getItem(user_data.arms_item_equiped)).name,
        arms_power: (await ItemService.getItem(user_data.arms_item_equiped)).power,
        legs: (await ItemService.getItem(user_data.legs_item_equiped)).name,
        legs_power: (await ItemService.getItem(user_data.legs_item_equiped)).power,
        feet: (await ItemService.getItem(user_data.feet_item_equiped)).name,
        feet_power: (await ItemService.getItem(user_data.feet_item_equiped)).power,
        lefthand: (await ItemService.getItem(user_data.lefthand_item_equiped)).name,
        lefthand_power: (await ItemService.getItem(user_data.lefthand_item_equiped)).power,
        righthand: (await ItemService.getItem(user_data.righthand_item_equiped)).name,
        righthand_power: (await ItemService.getItem(user_data.righthand_item_equiped)).power,
        head: (await ItemService.getItem(user_data.head_item_equiped)).name,
        head_power: (await ItemService.getItem(user_data.head_item_equiped)).power,
        thorax: (await ItemService.getItem(user_data.thorax_item_equiped)).name,
        thorax_power: (await ItemService.getItem(user_data.thorax_item_equiped)).power
    }
    ctx.replyWithHTML("🛡️ На вас экипировано:\n\n<b>🧤 Перчатки</b>: " + item_names.arms + " 👊🏼 " + item_names.arms_power
        + "\n<b>👖 Штаны</b>: " + item_names.legs + " 👊🏼 " + item_names.legs_power
        + "\n<b>👞 Обувь</b>: " + item_names.feet + " 👊🏼 " + item_names.feet_power
        + "\n<b>🤛🏼 Левая рука</b>: " + item_names.lefthand + " 👊🏼 " + item_names.lefthand_power
        + "\n<b>🤜🏼 Правая рука</b>: " + item_names.righthand + " 👊🏼 " + item_names.righthand_power
        + "\n<b>🪖 Шлем</b>: " + item_names.head + " 👊🏼 " + item_names.head_power
        + "\n<b>👔 Грудь</b>: " + item_names.thorax + " 👊🏼 " + item_names.thorax_power,
        Markup.inlineKeyboard([
            Markup.button.callback("🧥 Надеть предмет", "equip_item"),
            Markup.button.callback("Вернуться", "back_to_menu")]));

    equipmentScene.action("equip_item", ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("equip_item");
    });

    equipmentScene.action("back_to_menu", ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("menu");
    });
});