import { Markup, Scenes } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { CasinoService } from "../services/casino.service";

export const createGameScene = new Scenes.BaseScene<IBotContext>("create_game");

createGameScene.enter(async ctx => {
    console.log("inside create game");

    const formState = {
        stage: 0,
        game_name: '',
        outcomes: [''],
        chances: [0],
        prizes: [0],
        pictures: [''],
        price: 0
    }

    ctx.reply("Введите название новой игры");
    createGameScene.on('text', ctx => {
        const text = ctx.message.text;
        switch (formState.stage) {
            case 0:
                formState.game_name = text;
                formState.stage++;
                ctx.reply("Введите названия исходов через запятую. Например, 'выпала 1, выпала 2, выпала 3'");
                break;
            case 1:
                formState.outcomes = text.split(',').map(tag => tag.trim());
                formState.stage++;
                ctx.reply("Введите диапозоны значения от 0 до 1, при которых выпадает ранее указанный результат. Например, '0.33, 0.67, 1' сделает так, что первый исход достигается от 0 до 0.33, второй от 0.34 до 0.67, а третий от 0.68 до 1");
                break;
            case 2:
                formState.chances = text.split(',').map(num => parseFloat(num.trim()));
                formState.stage++;
                ctx.reply("Введите id предметов, которые будут выдаваться при соответствующем исходе, если награды нет, то введите 0. Например, '0, 10, 12' не выдаст награды при первом исходе, выдаст предмет с id 10 при втором исходе и предмет с id 12 при третьем исходе");
                break;
            case 3:
                formState.prizes = text.split(',').map(num => parseInt(num.trim()));
                formState.stage++;
                ctx.reply("Введите ссылки на картинки исходов. Например 'https://google.com, https://yandex.ru,' выведет картинку по первой ссылке для первого исхода и картинку по второй ссылке для второго исхода.");
                break;
            case 4:
                formState.pictures = text.split(',').map(link => link.trim());
                formState.stage++;
                ctx.reply("Введите цену за участие в игре в виде целого числа. Например, 10.");
                break;
            case 5:
                formState.price = parseInt(text);
                formState.stage = 0;
                CasinoService.create(formState.game_name, formState.outcomes, formState.chances, formState.prizes, formState.pictures, formState.price);
                ctx.reply("Игра успешно создана!", Markup.inlineKeyboard([Markup.button.callback("Вернуться в админ-панель", "open_admin")]))
        }
    });

    createGameScene.action("open_admin", ctx => {
        ctx.editMessageReplyMarkup({inline_keyboard: []});
        ctx.scene.leave();
        ctx.scene.enter("admin");
    });
});