import { Markup, Scenes } from "telegraf";
import { UserService } from "../services/user.service";
import { IBotContext } from "../context/context.interface";
import { InventoryService } from "../services/inventory.service";
import { ItemService } from "../services/item.service";

export const menuScene = new Scenes.BaseScene<IBotContext>("menu");

menuScene.enter(async (ctx) => {
	console.log("inside menu");
	const inlineKeyboard = [
		[Markup.button.callback("⛩️ Торговый квартал", "shopping_district")],
		[Markup.button.callback("🥋 Экипировка", "equipment")],
		[Markup.button.callback("🏰 Крепость", "fortress")],
		[Markup.button.callback("⚔️ Сражения", "pvp")],
	];

	if (!ctx.from) {
		return;
	}

	if (!(await UserService.checkIfExists(ctx.from.id))) {
		ctx.scene.leave();
		ctx.scene.enter("greeting");
	} else {
		if (await UserService.checkIfAdmin(ctx.from.id)) {
			inlineKeyboard.push([
				Markup.button.callback("Админ-панель", "admin-dashboard"),
			]);
		}

		let clan = await UserService.checkForClan(ctx.from.id);

		const userData = await UserService.getUserInfo(ctx.from.id);

		ctx.replyWithPhoto(userData.avatar, {
			caption:
				"<b>🐶 " +
				userData.char_name +
				"</b>\n\n✨ " +
				userData.level +
				" уровень\n⚡ Класс: <b>" +
				(() => {
					switch (userData.char_class) {
						case "warrior":
							return "воин";
						case "mage":
							return "маг";
						case "tank":
							return "танк";
					}
				})() +
				"</b>\n🗡 Клан: <b>" +
				(clan ? clan.clanDetails?.name : "не состоит в клане") +
				"</b>\n👊🏼 Общая сила: <b>" +
				(await UserService.getCharPower(ctx.from.id)) +
				"</b>\n💸 На счету " +
				userData.money +
				" 💰 и " +
				userData.rm_currency +
				" 🟡",
			reply_markup: { inline_keyboard: inlineKeyboard },
			parse_mode: "HTML",
		});

		menuScene.action("admin-dashboard", async (ctx) => {
			if (!(await UserService.checkIfAdmin(ctx.from.id))) {
				return;
			}
			ctx.scene.leave();
			ctx.scene.enter("admin");
			ctx.editMessageReplyMarkup({ inline_keyboard: [] });
		});

		menuScene.action("open_menu", (ctx) => {
			ctx.editMessageReplyMarkup({ inline_keyboard: [] });
			ctx.scene.leave();
			ctx.scene.enter("menu");
		});

		menuScene.action("equipment", (ctx) => {
			ctx.editMessageReplyMarkup({ inline_keyboard: [] });
			ctx.scene.leave();
			ctx.scene.enter("equipment");
		});

		menuScene.action("shopping_district", (ctx) => {
			ctx.editMessageReplyMarkup({ inline_keyboard: [] });
			ctx.scene.leave();
			ctx.scene.enter("shopping_district");
		});

		menuScene.action("pvp", (ctx) => {
			ctx.editMessageReplyMarkup({ inline_keyboard: [] });
			ctx.scene.leave();
			ctx.scene.enter("pvp");
		});

		menuScene.action("fortress", (ctx) => {
			ctx.editMessageReplyMarkup({ inline_keyboard: [] });
			ctx.scene.leave();
			ctx.scene.enter("fortress");
		});
	}
});
