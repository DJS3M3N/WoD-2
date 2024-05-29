import { Markup, Scenes } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { PlantService } from "../services/plant.service";

export const managePlantsScene = new Scenes.BaseScene<IBotContext>("manage_plants");

managePlantsScene.enter(async ctx => {
    console.log("inside manage plants");

    const plants = await PlantService.getAllPlants();
    for (const plant of plants) {
        const plantMessage = `ID: ${plant.id}\nНазвание: ${plant.name}\nЭмодзи: ${plant.emoji_icon}\nОписание: ${plant.description}\nСтоимость: ${plant.cost_money} денег, ${plant.cost_rmcurrency} премиум валюты\nИнтервал полива: ${plant.watering_interval}\nСтоимость при продаже: ${plant.sale_price}\nВремя засыхания: ${plant.death_time}`;
        ctx.reply(plantMessage, Markup.inlineKeyboard([Markup.button.callback(`Удалить ${plant.name}`, `delete_plant_${plant.id}`)]));
    } 

    const keyboard = Markup.inlineKeyboard([
        Markup.button.callback("Добавить растение", "add_plant"),
        Markup.button.callback("Вернуться", "open_admin")
    ]);

    ctx.reply("Выберите действие:", keyboard);
});

managePlantsScene.action(/^delete_plant_(\d+)$/, async ctx => {
    const plantId = ctx.match[1];
    await PlantService.delete(parseInt(plantId));
    ctx.reply(`Растение с ID ${plantId} удалено.`);
    ctx.scene.reenter();
});

managePlantsScene.action("add_plant", ctx => {
    ctx.scene.enter("add_plant");
});

managePlantsScene.action("open_admin", ctx => {
    ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    ctx.scene.leave();
    ctx.scene.enter("admin");
});