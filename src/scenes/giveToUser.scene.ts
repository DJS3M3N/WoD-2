import { Markup, Scenes } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { UserService } from "../services/user.service";

export const giveToUserScene = new Scenes.BaseScene<IBotContext>("give_to_user");

giveToUserScene.enter(ctx => {
    console.log("inside give to user");

    let subject = "";

    ctx.reply("В этом меню вы можете выдавать пользователю деньги, золото или уровни, выберите интересующий вариант.",
        Markup.inlineKeyboard([
            Markup.button.callback("Деньги", "money"),
            Markup.button.callback("Золото", "rm_currency"),
            Markup.button.callback("Уровни", "level"),
            Markup.button.callback("Вернуться", "back_to_admin")]));

    giveToUserScene.on("text", ctx => {
        if (["money", "rm_currency", "level"].some(value => value === subject)) {
            const [amount, user_id] = ctx.message.text.split(",").map(token => parseInt(token.trim()));
            if (amount) {
                UserService.addToUser(user_id, amount, subject);
                ctx.reply("Успешно добавлено!", Markup.inlineKeyboard([Markup.button.callback("Вернуться", "back_to_admin")]));
            }
        } else {
            return;
        }
    });

    giveToUserScene.action("money", ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        subject = "money";
        ctx.reply("Теперь введите число, на которое нужно увеличить выбранную переменную и id пользователя, к которому нужно это применить через запятую");
    });

    giveToUserScene.action("rm_currency", ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        subject = "rm_currency";
        ctx.reply("Теперь введите число, на которое нужно увеличить выбранную переменную и id пользователя, к которому нужно это применить через запятую")
    });

    giveToUserScene.action("level", ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        subject = "level";
        ctx.reply("Теперь введите число, на которое нужно увеличить выбранную переменную и id пользователя, к которому нужно это применить через запятую")
    });

    giveToUserScene.action("back_to_admin", ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("admin");
    });
});