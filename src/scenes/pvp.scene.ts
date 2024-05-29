import { Markup, Scenes } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { CasinoService } from "../services/casino.service";
import { ItemService } from "../services/item.service";
import { deleteMarkup } from "../lib/deleteMarkup";
import { GamesService } from "../services/games.service";
import { UserService } from "../services/user.service";
import { PvpService } from "../services/pvp.service";
const games = [];

let service = new PvpService();
export const pvpScene = new Scenes.BaseScene<IBotContext>("pvp");

pvpScene.enter(async (ctx) => {
	console.log("inside pvp");

	await ctx.replyWithHTML(
		"Начат поиск соперника...",
		Markup.inlineKeyboard([
			[Markup.button.callback("Отменить поиск", "back_to_menu")],
		])
	);

	service.getFreeGame(ctx.from?.id);

	pvpScene.action(/step_(.+)/, (ctx) => {
		ctx.editMessageReplyMarkup({ inline_keyboard: [] });
		ctx.reply("Ожидаем противника...");
		service.step(ctx.from.id, Number(ctx.match[1]));
	});

	pvpScene.action("back_to_menu", (ctx) => {
		ctx.editMessageReplyMarkup({ inline_keyboard: [] });
		service.removeFromQueue(ctx.from.id);
		ctx.scene.leave();
		ctx.scene.enter("menu");
	});
});
