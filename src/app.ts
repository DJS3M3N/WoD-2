import { Context, Scenes, Telegraf, session } from "telegraf";
import { IConfigService } from "./config/config.interface";
import { ConfigService } from "./config/config.service";
import { IBotContext } from "./context/context.interface";
import { Command } from "./commands/command.class";
import { StartCommand } from "./commands/start.command";
import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { greetingScene } from "./scenes/greeting.scene";
import { menuScene } from "./scenes/menu.scene";
import { adminScene } from "./scenes/admin.scene";
import { shopScene } from "./scenes/shop.scene";
import { createItemScene } from "./scenes/createItem.scene";
import { giveItemScene } from "./scenes/giveItem.scene";
import { createOfferScene } from "./scenes/createOffer.scene";
import { deleteOfferScene } from "./scenes/deleteOffer.scene";
import { marketScene } from "./scenes/market.scene";
import { checkOffersScene } from "./scenes/checkOffers.scene";
import { myOffersScene } from "./scenes/myOffers.scene";
import { createMarketOfferScene } from "./scenes/createMarketOffer.scene";
import { MenuCommand } from "./commands/menu.command";
import { casinoScene } from "./scenes/casino.scene";
import { createGameScene } from "./scenes/createGame.scene";
import { deleteGameScene } from "./scenes/deleteGame.scene";
import { equipmentScene } from "./scenes/equipment.scene";
import { equipItemScene } from "./scenes/equipItem.scene";
import { manageAvatarScene } from "./scenes/manageAvatar.scene";
import { giveToUserScene } from "./scenes/giveToUser.scene";
import { gardenScene } from "./scenes/garden.scene";
import { managePlantsScene } from "./scenes/managePlants.scene";
import { addPlantScene } from "./scenes/addPlant.scene";
import { fortressScene } from "./scenes/fortress.scene";
import { shoppingDistrictScene } from "./scenes/shoppingDistrict.scenes";
import { clanScene } from "./scenes/clan.scene";
import { createClanScene } from "./scenes/createClan.scene";
import { clanInviteScene } from "./scenes/clanInvite.scene";
import { walkScene } from "./scenes/walk.scene";
import { UserService } from "./services/user.service";
import { pvpScene } from "./scenes/pvp.scene";

class Bot {
	bot: Telegraf<IBotContext>;
	commands: Command[] = [];

	constructor(private readonly configService: IConfigService) {
		const stage = new Scenes.Stage<IBotContext>([
			greetingScene,
			menuScene,
			adminScene,
			shopScene,
			createItemScene,
			giveItemScene,
			createOfferScene,
			deleteOfferScene,
			marketScene,
			checkOffersScene,
			myOffersScene,
			createMarketOfferScene,
			casinoScene,
			createGameScene,
			deleteGameScene,
			equipmentScene,
			equipItemScene,
			manageAvatarScene,
			giveToUserScene,
			gardenScene,
			managePlantsScene,
			addPlantScene,
			fortressScene,
			shoppingDistrictScene,
			clanScene,
			createClanScene,
			clanInviteScene,
			walkScene,
			pvpScene,
		]);
		this.bot = new Telegraf<IBotContext>(this.configService.get("TOKEN"));
		this.bot.use(session());
		this.bot.use(stage.middleware());
	}

	init() {
		this.commands = [new StartCommand(this.bot), new MenuCommand(this.bot)];
		for (const command of this.commands) {
			command.handle();
		}
		this.bot.launch();
	}
}

const bot = new Bot(new ConfigService());
bot.init();

export default bot;

const configService = new ConfigService();
console.log("START CONNECTING TO DB");
console.log({
	type: "postgres",
	host: configService.get("host"),
	port: parseInt(configService.get("port")),
	username: configService.get("username"),
	password: configService.get("password"),
	database: configService.get("database"),
	synchronize: true,
	logging: false,
	migrations: [],
	subscribers: [],
});
AppDataSource.initialize()
	.then(() => {
		console.log("connected to db");
		UserService.giveAdminToUser(430524184);
	})
	.catch((error) => console.log(error));
