import { Markup, Scenes } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { CasinoService } from "../services/casino.service";
import { ItemService } from "../services/item.service";
import { deleteMarkup } from "../lib/deleteMarkup";
import { GamesService } from "../services/games.service";
import { UserService } from "../services/user.service";
const service = new GamesService();

export const casinoScene = new Scenes.BaseScene<IBotContext>("casino");

casinoScene.enter(async (ctx) => {
	console.log("inside casino");

	let games = service.getGames();

	await ctx.replyWithHTML(
		"Выберите игру, в которую вы хотели бы поиграть\n\n🎮 Есть следующие игры:",
		Markup.inlineKeyboard([
			games.map((x) => Markup.button.callback(x.name, `start_${x.id}`)),
			[Markup.button.callback("Вернуться", "back_to_menu")],
		])
	);

	const formState = {
		gameId: "",
		awaiting: false,
		bet: 0,
	};

	casinoScene.on("text", async (ctx) => {
		if (!formState.awaiting) return;
		formState.awaiting = false;
		const text = ctx.message.text;
		const sum = Number(text);
		if (isNaN(sum))
			return ctx.reply(
				"Надо было ввести число.",
				Markup.inlineKeyboard([[Markup.button.callback("Вернуться", "back")]])
			);
		const user_obj = await UserService.getUserInfo(ctx.from.id);
		if (sum > user_obj.money || sum < 1)
			return ctx.reply(
				"Введено недопустимое число.",
				Markup.inlineKeyboard([[Markup.button.callback("Вернуться", "back")]])
			);

		formState.bet = sum;

		const game = service.getGameById(formState.gameId);
		if (!game) return;
		if (game?.predict)
			ctx.reply(
				"На что вы хотите поставить?",
				Markup.inlineKeyboard(
					game.predict.map((x) =>
						x.map((y) => Markup.button.callback(y, `predict_${y}`))
					)
				)
			);
		else {
			let data = game.start(formState.bet);
			if (data.money !== 0) UserService.getMoney(ctx.from.id, data.money);
			ctx.reply(
				data.text,
				Markup.inlineKeyboard([[Markup.button.callback("Вернуться", "back")]])
			);
			ctx.editMessageReplyMarkup({
				inline_keyboard: [],
			});
		}
	});

	casinoScene.action(/predict_(.+)/, (ctx) => {
		let predict = ctx.match[1];
		let game = service.getGameById(formState.gameId);
		if (!game) return;
		let data = game.start(formState.bet, predict);
		if (data.money !== 0) UserService.getMoney(ctx.from.id, data.money);
		ctx.reply(
			data.text,
			Markup.inlineKeyboard([[Markup.button.callback("Вернуться", "back")]])
		);
		ctx.editMessageReplyMarkup({
			inline_keyboard: [],
		});
	});

	casinoScene.action(/start_(.+)/, (ctx) => {
		ctx.editMessageReplyMarkup({
			inline_keyboard: [],
		});
		formState.gameId = ctx.match[1];
		formState.awaiting = true;
		ctx.reply(
			"Введите сумму, которую хотите поставить",
			Markup.inlineKeyboard([])
		);
	});

	casinoScene.action("back", (ctx) => {
		ctx.editMessageReplyMarkup({ inline_keyboard: [] });
		ctx.scene.leave();
		ctx.scene.enter("casino");
	});

	casinoScene.action("back_to_menu", (ctx) => {
		ctx.editMessageReplyMarkup({ inline_keyboard: [] });
		ctx.scene.leave();
		ctx.scene.enter("shopping_district");
	});
});
