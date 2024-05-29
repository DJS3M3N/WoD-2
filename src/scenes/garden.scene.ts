import { IBotContext } from "../context/context.interface";
import { Markup, Scenes } from "telegraf";
import { UserService } from "../services/user.service";
import { Pot, potDict } from "../entity/Pot";
import { PlantService, PlantStage } from "../services/plant.service";

export const gardenScene = new Scenes.BaseScene<IBotContext>("garden");

gardenScene.enter(ctx => {
    console.log("inside garden");
    displayGarden(ctx);
});     

const displayGarden = async (ctx: IBotContext) => {
    if (!ctx.from) {
        return;
    }
    const potsAndPlants = await UserService.getUserPotsAndPlants(ctx.from.id);
    const text: string[] = [];

    for (let i = 1; i <= 5; i++) {
        let pot = potsAndPlants?.pots?.[i - 1];
        text.push(`Горшок ${i} ${pot?.plant?.emoji_icon ? `(${pot.plant.emoji_icon})` : ''}` || `Горшок ${i}`);
    }

    ctx.replyWithPhoto("https://lh4.googleusercontent.com/proxy/V85bPWvnUNQlWor_8AK9pck6bOVHBnXxi-ZXZcZnvV7IhtkxMJZGBNCKnwC0U5xM-zm2QEQMxW7e4EbcepNm6yco-m65GlZzlw1a-Upf1eUjnkyFBqM", {
        caption: "🏡Магический сад\n\nЗдесь можно вырастить волшебное растение и выручить за него ценные ресурсы и эффекты.",
        reply_markup: { inline_keyboard: [
            [Markup.button.callback(text[0], 'pot_1'), Markup.button.callback(text[1], 'pot_2')],
            [Markup.button.callback(text[2], 'pot_3'), Markup.button.callback(text[3], 'pot_4')],
            [Markup.button.callback(text[4], 'pot_5')],
            [Markup.button.callback('Назад', 'back_to_menu')]
        ]
        }, parse_mode: "HTML"
    });
};

gardenScene.action('display_garden', async ctx => {
    if (!ctx.from) {
        return;
    }
    const potsAndPlants = await UserService.getUserPotsAndPlants(ctx.from.id);
    const text: string[] = [];

    for (let i = 1; i <= 5; i++) {
        let pot = potsAndPlants?.pots?.[i - 1];
        text.push(`Горшок ${i} ${pot?.plant?.emoji_icon ? `(${pot.plant.emoji_icon})` : ''}` || `Горшок ${i}`);
    }
    ctx.editMessageCaption("🏡Магический сад\n\nЗдесь можно вырастить волшебное растение и выручить за него ценные ресурсы и эффекты.",
        Markup.inlineKeyboard([
            [Markup.button.callback(text[0], 'pot_1'), Markup.button.callback(text[1], 'pot_2')],
            [Markup.button.callback(text[2], 'pot_3'), Markup.button.callback(text[3], 'pot_4')],
            [Markup.button.callback(text[4], 'pot_5')],
            [Markup.button.callback('Назад', 'back_to_menu')]
        ])
    );
})

gardenScene.action('back_to_menu', ctx => {
    ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    ctx.scene.leave();
    ctx.scene.enter("fortress");
});

gardenScene.action(/^pot_(\d+)$/, async ctx => {
    const potNumber = parseInt(ctx.match[1]);
    const potsAndPlants = await UserService.getUserPotsAndPlants(ctx.from.id);
    const pot = potsAndPlants?.pots?.[potNumber - 1];
    const rentedUntil = potsAndPlants?.pots?.[potNumber - 1]?.rentedUntil;
    const keyboard = [];
    if (rentedUntil && new Date() < rentedUntil) {
        let text = `Горшок ${potNumber}\nЭтот горшочек ваш\n`;
        if (!pot?.plant) {
            text += "\nПока тут ничего не растет...";
            keyboard.push(Markup.button.callback('Посадить', `planting_${potNumber}`));
        } else {
            text += "\n" + pot.plant.emoji_icon;
            text += "\n*" + pot.plant.name + "*"; 
            text += "\n*Этап: *" + stageToText(pot.stage);
            if (!(pot.stage === PlantStage.Grown)) {
                if (pot.liveUntil) {
                    if (pot.liveUntil < new Date()) {
                        text += "\nРастение засохло🍂"
                    } else {
                        if (pot.nextWatering) {
                            if (pot.nextWatering < new Date()) {
                                text += "\nПолив: сейчас"
                                if (pot.liveUntil)
                                    text += "\nУмрет если не полить через: " + formatTimeDifference(pot.liveUntil);
                            } else {
                                text += "\nПолив через: " + formatTimeDifference(pot.nextWatering);
                            }
                            keyboard.push(Markup.button.callback('Полить💧', `water_${potNumber}`));
                        }
                    }
                }
                
            } 
            keyboard.push(Markup.button.callback('Сорвать', `harve_${potNumber}`));
        }
        text += "\n\nДо конца аренды: " + formatTimeDifference(rentedUntil);
        keyboard.push(Markup.button.callback('Назад', 'display_garden'));
        ctx.editMessageCaption(text, { parse_mode: 'Markdown', ...Markup.inlineKeyboard(keyboard) });
    } else {
        const [moneyPrice, rmCurrencyPrice] = potDict[potNumber];
        if (moneyPrice > 0) {
            keyboard.push(Markup.button.callback(`${moneyPrice}💵`, `buy_pot_for_money_${potNumber}`));
        }
        if (rmCurrencyPrice > 0) {
            keyboard.push(Markup.button.callback(`${rmCurrencyPrice} 🟡`, `buy_pot_for_rm_${potNumber}`));
        }
        keyboard.push(Markup.button.callback('Назад', 'display_garden'));
        ctx.editMessageCaption(`Горшок ${potNumber}\n\nЭтот горшочек пока не ваш, но его можно арендовать на 30 дней`,
            Markup.inlineKeyboard(keyboard));
    }
});

gardenScene.action(/^water_(\d+)$/, async ctx => {
    const potNumber = parseInt(ctx.match[1]);
    const potsAndPlants = await UserService.getUserPotsAndPlants(ctx.from.id);
    const rentedUntil = potsAndPlants?.pots?.[potNumber - 1]?.rentedUntil;
    const death = potsAndPlants?.pots?.[potNumber - 1]?.liveUntil;
    const keyboard = [];
    keyboard.push(Markup.button.callback('Назад', 'display_garden'));

    if (!rentedUntil || new Date() > rentedUntil) {
        ctx.editMessageCaption(`Горшок ${potNumber} вам не пренадлежит :(`,
            Markup.inlineKeyboard(keyboard));
        return 
    }

    if (death && death < new Date()) {
        ctx.editMessageCaption(`Растение засохло🍂`,
            Markup.inlineKeyboard(keyboard));
        return
    } else {
        await PlantService.waterPlant(ctx.from.id, potNumber)
        ctx.editMessageCaption(`Вы полили растение 💧`,
            Markup.inlineKeyboard(keyboard));
        return
    }
});

gardenScene.action(/^harve_(\d+)$/, async ctx => {
    const potNumber = parseInt(ctx.match[1]);
    const potsAndPlants = await UserService.getUserPotsAndPlants(ctx.from.id);
    const rentedUntil = potsAndPlants?.pots?.[potNumber - 1]?.rentedUntil;
    const keyboard = [];
    keyboard.push(Markup.button.callback('Назад', 'display_garden'));
    if (!rentedUntil || new Date() > rentedUntil) {
        ctx.editMessageCaption(`Горшок ${potNumber} вам не пренадлежит :(`,
            Markup.inlineKeyboard(keyboard));
        return 
    }
    if (potsAndPlants?.pots?.[potNumber - 1]?.plant) {
        const got = await PlantService.harvePlant(ctx.from.id, potNumber)
        ctx.editMessageCaption(`Вы продали растение и получили ${got}💵`,
        Markup.inlineKeyboard(keyboard));
        return
    }
});

gardenScene.action(/^planting_(\d+)$/, async ctx => {
    const potNumber = parseInt(ctx.match[1]);
    const plants = await PlantService.getAllPlants();
    const buttons = plants.map(plant => Markup.button.callback(`${plant.emoji_icon} ${plant.name}`, `select_plant_${potNumber}_${plant.id}`));
    buttons.push(Markup.button.callback('Назад', `pot_${potNumber}`))
    ctx.editMessageCaption('Выберите растение для посадки:', Markup.inlineKeyboard(buttons));
});

gardenScene.action(/^select_plant_(\d+)_(\d+)$/, async ctx => {
    const potNumber = parseInt(ctx.match[1]);
    const plantId = parseInt(ctx.match[2]);
    const plant = await PlantService.getPlantById(plantId);

    if (plant) {
        let priceInfo = '';
        if (plant.cost_money >= 0) {
            priceInfo += `Цена: ${plant.cost_money}💵`;
        }
        if (plant.cost_rmcurrency >= 0) {
            priceInfo += (priceInfo ? ' или ' : 'Цена: ') + `${plant.cost_rmcurrency} 🟡`;
        }

        const text = `Растение: ${plant.emoji_icon} ${plant.name}\nОписание: ${plant.description}\n${priceInfo}\nМаксимальная стоимость при продаже: ${plant.sale_price} 💵\nИнтервал полива: каждые ${plant.watering_interval} мин\nВремя засыхания: ${plant.death_time} мин`;
        ctx.editMessageCaption(text, Markup.inlineKeyboard([
            ...(plant.cost_money > 0 ? [Markup.button.callback('Купить за деньги💵', `buy_plant_for_money_${potNumber}_${plantId}`)] : []),
            ...(plant.cost_rmcurrency > 0 ? [Markup.button.callback('Купить за 🟡', `buy_plant_for_rm_${potNumber}_${plantId}`)] : []),
            Markup.button.callback('Назад', `planting_${potNumber}`)
        ].filter(button => button !== undefined)));
    } else {
        ctx.reply('Извините, растение не найдено.');
    }
});


gardenScene.action(/^buy_plant_for_(money|rm)_(\d+)_(\d+)$/, async ctx => {
    const potNumber = parseInt(ctx.match[2]);
    const plantId = parseInt(ctx.match[3]);
    const currency = ctx.match[1];
    if (!ctx.from) {
        return;
    }
    const success = await UserService.purchasePlant(ctx.from.id, potNumber, plantId, currency);
    if (success) {
        const plant = await PlantService.getPlantById(plantId);
        ctx.editMessageCaption(`Вы успешно посадили ${plant.emoji_icon} ${plant.name} в горшок ${potNumber}!`,
            Markup.inlineKeyboard([
                [Markup.button.callback('Назад', 'display_garden')]
            ])
        );
    } else {
        ctx.reply('У вас недостаточно средств для покупки этого растения.');
    }
});

function formatTimeDifference(rentedUntil: Date): string {
    const now = new Date();
    const timeDifference = rentedUntil.getTime() - now.getTime();
    if (timeDifference <= 0) {
        return 'Время аренды истекло';
    }
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    return `${days} дн, ${hours} ч ${minutes} м`;
}

function stageToText(stage: PlantStage): string {
    switch(stage) {
        case PlantStage.JustPlantedRecently:
            return "Семечка"
        case PlantStage.Little:
            return "Росточек"
        case PlantStage.Mid:
            return "Подрос"
        case PlantStage.Grown:
            return "Вырос!"
    }
}

gardenScene.action(/^buy_pot_for_(money|rm)_(\d+)$/, async (ctx) => {
    const potNumber = parseInt(ctx.match[2]);
    const currency = ctx.match[1];
    if (!ctx.from) {
        return;
    }

    const pot = await UserService.purchasePot(ctx.from.id, potNumber, currency);

    if (pot) {
        ctx.editMessageCaption(`Вы успешно арендовали горшок ${potNumber} на 30 дней!`,
            Markup.inlineKeyboard([
                [Markup.button.callback('Назад', 'display_garden')]
            ])
        );
    } else {
        ctx.reply('У вас недостаточно средств для аренды этого горшка.');
    }
});