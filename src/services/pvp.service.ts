import { randomInt } from "crypto";
import bot from "../app";
import { PvpGameService } from "./pvpgame.service";
import { UserService } from "./user.service";
import { ConfigService } from "../config/config.service";
const service = new ConfigService();
export class PvpService {
	classes: Class[];
	games: Game[];
	constructor() {
		this.classes = service.getClasses();
		this.games = [];
	}

	async getFreeGame(id: number | undefined) {
		if (!id) return;
		let game = this.games.find((x) => !x.member_2 && x.search);

		let user_obj = await UserService.getUserInfo(id);

		if (game) {
			game.member_2 = id;
			game.member_2_class = user_obj.char_class;
			game.member_2_name = user_obj.char_name;
			game.game = new PvpGameService(
				game.member_1,
				game.member_1_name,
				game.member_1_class,
				game.member_2,
				game.member_2_name,
				game.member_2_class
			);

			game.game.startGame();
			console.log(game);
		} else {
			this.games.push({
				member_1: id,
				member_1_name: user_obj.char_name,
				member_1_class: user_obj.char_class,
				search: true,
			});
		}
	}

	step(id: number, attack: number) {
		if (!id) return;
		let game = this.games.find((x) => id == x.member_1 || x.member_2 == id);
		if (!game) return;
		game.game?.setStep(id, attack);
	}

	removeFromQueue(id: number) {
		let game = this.games.find((x) => x.member_1 == id || x.member_2 == id);
		if (game && !game.member_2) delete this.games[this.games.indexOf(game)];
	}

	getClassNames(): { name: string; id: string }[] {
		return this.classes.map((x) => ({ name: x.name, id: x.id }));
	}

	getClasses(): Class[] {
		return this.classes;
	}
}

interface Attack {
	id: number;
	name: string;
	text: string;
	damage: number[];
	def: boolean;
	antidef: boolean;
	cooldown: number;
	passives: { stun: number; burn: number; venom: number; blood: number };
	clean: boolean;
}

interface Class {
	id: string;
	name: string;
	emoji: string;
	attacks: Attack[];
	hp: number;
}

interface Game {
	member_1: number;
	member_1_name: string;
	member_1_class: string;
	member_2?: number;
	member_2_name?: string;
	member_2_class?: string;
	game?: PvpGameService;
	search: boolean;
}
