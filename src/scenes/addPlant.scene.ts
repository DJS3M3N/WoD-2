import { IBotContext } from "../context/context.interface";
import { Scenes } from "telegraf";
import { PlantService } from "../services/plant.service";

export const addPlantScene = new Scenes.BaseScene<IBotContext>("add_plant");

addPlantScene.enter(ctx => {
    ctx.reply(`Введите данные нового растения в формате
(если вы не хотите добавлять возможность покупки за какой-то вид валюты, 
поставьте отрицательное значение в соответствующую строку):
название
эмодзи
описание
стоимость в монетах
стоимость в премиум валюте
интервал полива в минутах
максимальная стоимость при продаже
время засыхания в минутах`);
});


addPlantScene.on("text", async ctx => {
    const plantData = ctx.message.text.split("\n");
    if (plantData.length !== 8) {
        ctx.reply("Неверный формат данных. Попробуйте еще раз.");
        return;
    }
    const [name, emoji_icon, description, cost_money, cost_rmcurrency, watering_interval, sale_price, death_time] = plantData.map(d => d.trim());
    const plant = {
        name,
        emoji_icon,
        description,
        cost_money: Number(cost_money),
        cost_rmcurrency: Number(cost_rmcurrency),
        watering_interval: Number(watering_interval),
        sale_price: Number(sale_price),
        death_time: Number(death_time)
    };

    if (isNaN(plant.cost_money) || isNaN(plant.cost_rmcurrency) || isNaN(plant.watering_interval) || isNaN(plant.sale_price) || isNaN(plant.death_time)) {
        ctx.reply("Одно или несколько числовых полей имеют неверный формат. Попробуйте еще раз.");
        return;
    }

    await PlantService.create(plant.name, plant.emoji_icon, plant.description, plant.cost_money, plant.cost_rmcurrency, plant.sale_price, plant.watering_interval, plant.death_time);
    ctx.reply(`Растение ${name} добавлено.`);
    ctx.scene.leave();
    ctx.scene.enter("manage_plants");
});