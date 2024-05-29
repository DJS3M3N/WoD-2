import { Markup, Scenes } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { CasinoService } from "../services/casino.service";

export const deleteGameScene = new Scenes.BaseScene<IBotContext>('delete_game');

deleteGameScene.enter(async ctx => {
    console.log("inside delete game");

    const games = await CasinoService.getGames();

    ctx.reply("Есть следующие игры \n" + games.map((game, index) => (index + 1) + ". " + game.name + "\n") + "Введите номер игры, которую вы хотите удалить");

    deleteGameScene.on('text', ctx => {
        const num = parseInt(ctx.message.text);

        if (num <= games.length && num > 0) {
            CasinoService.delete(games[num - 1].id);
            ctx.reply("Игра " + games[num - 1].name + " успешно удалена!", Markup.inlineKeyboard([Markup.button.callback("Вернуться в админ-панель", "open_admin")]));
        } else {
            ctx.reply("Неверный номер игры, попробуйте ещё", Markup.inlineKeyboard([Markup.button.callback("Вернуться в админ-панель", "open_admin")]));
        }
    });

    deleteGameScene.action("open_admin", ctx => {
        ctx.editMessageReplyMarkup({inline_keyboard: []});
        ctx.scene.leave();
        ctx.scene.enter("admin");
    });
});