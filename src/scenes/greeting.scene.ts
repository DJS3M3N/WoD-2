import { Markup, Scenes } from "telegraf";
import { UserService } from "../services/user.service";
import { IBotContext } from "../context/context.interface";
import { AvatarsService } from "../services/avatars.service";
import { deleteMarkup } from "../lib/deleteMarkup";

export const greetingScene = new Scenes.BaseScene<IBotContext>("greeting");

greetingScene.enter(async (ctx) => {
    console.log(ctx.from?.id)
    console.log("inside greeting")
    const formState = {
        stage: 0,
        char_name: '',
        char_class: '',
        avatar: '',
        id: 0,
        timesWrongInput: 0
    }

    if (ctx.from && await UserService.checkIfExists(ctx.from.id)) {
        ctx.reply('Такой пользователь уже существует');
        ctx.scene.leave();
        ctx.scene.enter("menu");
        return;
    }

    const avatars = await AvatarsService.getAllAvatars();

    ctx.reply("Введите имя своего персонажа (от 3 до до 15 символов)");

    greetingScene.on('text', async (ctx) => {
        const typedText = ctx.message.text;
        switch (formState.stage) {
            case 0:
                if (typedText.length < 3 || typedText.length > 15) {
                    ctx.reply("Неправильная длина имени, попробуйте ещё");
                    break;
                }
                formState.char_name = typedText;
                formState.id = ctx.from.id;
                formState.stage++;
                await ctx.reply("Выберите класс вашего персонажа",
                    Markup.inlineKeyboard([[
                        Markup.button.callback('Воин', 'warrior'),
                        Markup.button.callback('Маг', 'mage'),
                        Markup.button.callback('Танк', 'tank')],
                    [Markup.button.callback('Вернуться', 'back')]])
                );
                break;
            case 2:
                const num = parseInt(ctx.message.text);
                if (!(num > 0 && num <= avatars.length)) {
                    ctx.reply("Неправильный номер аватара, попробуйте ещё");
                    formState.timesWrongInput++;
                    break;
                } else {
                    deleteMarkup(ctx, ctx.chat.id, ctx.message.message_id - 1 - formState.timesWrongInput * 2 - avatars.length);
                }
                formState.avatar = avatars[num - 1][0];
                UserService.create(formState.id, formState.char_name, formState.char_class, formState.avatar);
                formState.stage = 0;
                ctx.reply("Ваш персонаж был успешно создан!");
                ctx.scene.leave()
                setTimeout(() => {
                    ctx.scene.enter("menu");
                }, 1000);
                break;
        }
    });

    function outputAvatars(ctx: IBotContext) {
        if (avatars.length > 0) {
            formState.stage++;
            ctx.reply("Введите номер вашей аватарки", Markup.inlineKeyboard([Markup.button.callback("Вернуться", "back")]));
            ctx.replyWithMediaGroup(avatars.map(avatar => { return { type: "photo", media: avatar[1] } }));
        } else {
            formState.avatar = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSq0Fr1oEX9PZURzf_COP6Cqd07CBLOAWDecQt_gFtdsg&s';
            UserService.create(formState.id, formState.char_name, formState.char_class, formState.avatar);
            formState.stage = 0;
            ctx.reply("Ваш персонаж был успешно создан!");
            ctx.scene.leave()
            setTimeout(() => {
                ctx.scene.enter("menu");
            }, 1000);
        }
    }

    greetingScene.action("warrior", ctx => {
        formState.char_class = "warrior";
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        outputAvatars(ctx);
    });

    greetingScene.action("mage", ctx => {
        formState.char_class = "mage";
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        outputAvatars(ctx);
    });

    greetingScene.action("tank", ctx => {
        formState.char_class = "tank";
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        outputAvatars(ctx);
    });

    greetingScene.action("back", ctx => {
        formState.stage--;
        if (formState.stage === 0) {
            ctx.editMessageReplyMarkup({ inline_keyboard: [] });
            ctx.reply("Введите имя своего персонажа (от 3 до до 15 символов)");
        } else if (formState.stage === 1) {
            formState.timesWrongInput = 0;
            ctx.editMessageReplyMarkup({ inline_keyboard: [] });
            ctx.reply("Выберите класс вашего персонажа",
                Markup.inlineKeyboard([[
                    Markup.button.callback('Воин', 'warrior'),
                    Markup.button.callback('Маг', 'mage'),
                    Markup.button.callback('Танк', 'tank')],
                [Markup.button.callback('Вернуться', 'back')]])
            );
        }
    });
});