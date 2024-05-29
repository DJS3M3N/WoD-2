import { Markup, Scenes } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { AvatarsService } from "../services/avatars.service";

export const manageAvatarScene = new Scenes.BaseScene<IBotContext>("manage_avatars");

const formState = {
    opperation: "",
    avatars: [""]
}

manageAvatarScene.enter(async ctx => {
    console.log("inside create avatar");

    formState.opperation = "";

    formState.avatars = (await AvatarsService.getAllAvatars()).map(avatar => avatar[0]);

    ctx.reply("Выберете интересующую вас опцию",
        Markup.inlineKeyboard([
            Markup.button.callback("Добавить аватарку", "create_avatar"),
            Markup.button.callback("Удалить аватарку", "delete_avatar"),
            Markup.button.callback("Вернуться", "open_admin")]));

    manageAvatarScene.action("create_avatar", ctx => {
        formState.opperation = "create";
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.reply("Введите ссылки на картинки для аватарок, разделённые пробелом, сперва на аватарку без цифры, потом с цифрой. Например, 'google.com yandex.ru'",
            Markup.inlineKeyboard([Markup.button.callback("Вернуться", "open_admin")]));
    });

    manageAvatarScene.action("delete_avatar", async ctx => {
        formState.opperation = "delete";
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        if (formState.avatars.length > 0) {
            ctx.replyWithMediaGroup(formState.avatars.map((avatar, index) => { return { type: "photo", media: avatar, caption: index.toString() } }));
        }
        ctx.reply("Введите номер аватарки, которую вы хотите удалить", Markup.inlineKeyboard([Markup.button.callback("Вернуться", "open_admin")]));
    })

    manageAvatarScene.on('text', async ctx => {
        if (formState.opperation === "delete") {
            const num = parseInt(ctx.message.text);
            if (!(num >= 0 && num < formState.avatars.length)) {
                ctx.reply("Неверный номер аватарки", Markup.inlineKeyboard([Markup.button.callback("Вернуться", "open_admin")]));
                return;
            }
            AvatarsService.delete(formState.avatars[num]);
            ctx.reply("Аватар успешно удалён!", Markup.inlineKeyboard([Markup.button.callback("Вернуться", "open_admin")]));
        } else if (formState.opperation === "create") {
            const [link, link_with_num] = ctx.message.text.split(" ");
            if (link.length === 0 || link_with_num.length === 0) {
                ctx.reply("Ошибка в ссылках", Markup.inlineKeyboard([Markup.button.callback("Вернуться", "open_admin")]));
                return;
            }
            AvatarsService.create(link, link_with_num);
            ctx.reply("Аватар успешно создан!", Markup.inlineKeyboard([Markup.button.callback("Вернуться", "open_admin")]));
        }
    });

    manageAvatarScene.action("open_admin", ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("admin");
    });
});