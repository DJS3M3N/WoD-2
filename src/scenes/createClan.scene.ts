import { Markup, Scenes } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { ClanService } from "../services/clan.service";

export const createClanScene = new Scenes.BaseScene<IBotContext>("create_clan");

createClanScene.enter(ctx => {

    console.log('inside create clan');

    const formState = {
        stage: 0,
        clan_name: '',
        description: '',
    }

    ctx.reply("Как бы вы хотели назвать свой клан?");
    createClanScene.on('text',async ctx => {
        const text = ctx.message.text;
        switch (formState.stage) {
            case 0:
                formState.clan_name = text;
                formState.stage++;
                ctx.reply("Введите описание, его увидят приглашенные игроки!");
                break;
            case 1:
                formState.description = text;
                formState.stage++;
                const url = await ClanService.create(formState.clan_name, formState.description, ctx.from.id)
                ctx.reply("Ваш клан создан!\nА вот и ссылка для приглашения: https://t.me/wodtest_bot?start=" + url);
                ctx.reply("Клан успешно создан!", Markup.inlineKeyboard([Markup.button.callback("Вернуться", "clan_scene")]));
                break;
        }
    });

    createClanScene.action("clan_scene", ctx => {
        ctx.editMessageReplyMarkup({inline_keyboard: []});
        ctx.scene.leave();
        ctx.scene.enter("clan");
    });
});