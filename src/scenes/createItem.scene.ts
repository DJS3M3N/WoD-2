import { Markup, Scenes } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { ItemService } from "../services/item.service";

export const createItemScene = new Scenes.BaseScene<IBotContext>("create_item");

createItemScene.enter(ctx => {

    console.log('inside create item');

    const formState = {
        stage: 0,
        item_name: '',
        price: 0,
        rm_price: 0,
        power: 0,
        slot: '',
        picture: '',
        description: ''
    }

    ctx.reply("Введите название нового предмета");
    createItemScene.on('text', ctx => {
        const text = ctx.message.text;
        switch (formState.stage) {
            case 0:
                formState.item_name = text;
                formState.stage++;
                ctx.reply("Введите название слота, в который надевается предмет. Варианты: arms, legs, feet, lefthand, righthand, head, thorax");
                break;
            case 1:
                formState.slot = text;
                formState.stage++;
                ctx.reply("Введите число силы предмета");
                break;
            case 2:
                formState.power = parseFloat(text);
                formState.stage++;
                ctx.reply("Введите описание предмета");
                break;
            case 3:
                formState.description = text;
                formState.stage++;
                ctx.reply("Введите ссылку на картинку с предметом");
                break;
            case 4:
                formState.picture = text;
                formState.stage = 0;
                ItemService.create(formState.item_name, formState.description, formState.slot, formState.picture, formState.power);
                ctx.reply("Предмет успешно создан!", Markup.inlineKeyboard([Markup.button.callback("Вернуться в админ-панель", "open_admin")]))
        }
    });

    createItemScene.action("open_admin", ctx => {
        ctx.editMessageReplyMarkup({inline_keyboard: []});
        ctx.scene.leave();
        ctx.scene.enter("admin");
    });
});