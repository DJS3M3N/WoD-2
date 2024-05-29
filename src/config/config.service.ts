import { DotenvParseOutput, config } from "dotenv";
import { IConfigService } from "./config.interface";

export class ConfigService implements IConfigService {
	private config: DotenvParseOutput;

	constructor() {
		const { error, parsed } = config();
		if (error) {
			throw new Error("Could not find .env file");
		}
		if (!parsed) {
			throw new Error("Empty .env file");
		}
		this.config = parsed;
	}

	get(key: string): string {
		const res = this.config[key];
		if (!res) {
			console.log(key);
			throw new Error("No such key");
		}
		return res;
	}

	getClasses(): Class[] {
		return [
			{
				id: "warrior",
				name: "Воин",
				emoji: "⚔️",
				attacks: [
					{
						id: 0,
						name: "Вихрь🌪",
						text: "переходит из дикого танца в Вихрь🌪",
						damage: [50, 60],
						def: false,
						antidef: false,
						cooldown: 0,
						passives: { stun: 0, burn: 0, venom: 0, blood: 0 },
						clean: false,
					},
					{
						id: 1,
						name: "Ядовитый клинок🗡",
						text: "использует Ядовитый клинок🗡",
						damage: [50, 100],
						def: false,
						antidef: false,
						cooldown: 3,
						passives: { stun: 0, burn: 0, venom: 3, blood: 0 },
						clean: false,
					},
					{
						id: 2,
						name: "Аватара👻",
						text: "использует Кровопролитие🔪",
						damage: [],
						def: false,
						antidef: false,
						cooldown: 3,
						passives: { stun: 0, burn: 0, venom: 0, blood: 0 },
						clean: true,
					},
					{
						id: 3,
						name: "Выпад🤜",
						text: "использует Выпад🤜",
						damage: [50, 100],
						def: false,
						antidef: false,
						cooldown: 3,
						passives: { stun: 1, burn: 0, venom: 0, blood: 0 },
						clean: false,
					},
					{
						id: 4,
						name: "Уклонение🔛",
						text: "уклоняется от атаки",
						damage: [],
						def: true,
						antidef: false,
						cooldown: 3,
						passives: { stun: 0, burn: 0, venom: 0, blood: 0 },
						clean: false,
					},
					{
						id: 5,
						name: "Расправы☄️",
						text: "использует Расправу☄️",
						damage: [100, 150],
						def: false,
						antidef: true,
						cooldown: 5,
						passives: { stun: 1, burn: 0, venom: 0, blood: 0 },
						clean: false,
					},
				],
				hp: 1000,
			},
			{
				id: "mage",
				name: "Маг",
				emoji: "🧙‍♂️",
				attacks: [
					{
						id: 0,
						name: "Вихрь🌪",
						text: "переходит из дикого танца в Вихрь🌪",
						damage: [50, 60],
						def: false,
						antidef: false,
						cooldown: 0,
						passives: { stun: 0, burn: 0, venom: 0, blood: 0 },
						clean: false,
					},
					{
						id: 1,
						name: "Кровопролитие🔪",
						text: "использует Кровопролитие🔪",
						damage: [50, 100],
						def: false,
						antidef: false,
						cooldown: 3,
						passives: { stun: 0, burn: 0, venom: 0, blood: 3 },
						clean: false,
					},
					{
						id: 2,
						name: "Аватара👻",
						text: "использует Кровопролитие🔪",
						damage: [],
						def: false,
						antidef: false,
						cooldown: 3,
						passives: { stun: 0, burn: 0, venom: 0, blood: 0 },
						clean: true,
					},
					{
						id: 3,
						name: "Контузия🤯",
						text: "использует Контузию🤯",
						damage: [50, 100],
						def: false,
						antidef: false,
						cooldown: 3,
						passives: { stun: 1, burn: 0, venom: 0, blood: 0 },
						clean: false,
					},
					{
						id: 4,
						name: "Щит🛡",
						text: "блокирует атаку",
						damage: [],
						def: true,
						antidef: false,
						cooldown: 3,
						passives: { stun: 0, burn: 0, venom: 0, blood: 0 },
						clean: false,
					},
					{
						id: 5,
						name: "Игла🪡",
						text: "использует Иглу🪡",
						damage: [30, 50],
						def: false,
						antidef: true,
						cooldown: 3,
						passives: { stun: 0, burn: 0, venom: 0, blood: 0 },
						clean: false,
					},
				],
				hp: 1000,
			},
			{
				id: "tank",
				name: "Танк",
				emoji: "🛡️",
				attacks: [
					{
						id: 0,
						name: "Вихрь🌪",
						text: "переходит из дикого танца в Вихрь🌪",
						damage: [50, 60],
						def: false,
						antidef: false,
						cooldown: 0,
						passives: { stun: 0, burn: 0, venom: 0, blood: 0 },
						clean: false,
					},
					{
						id: 1,
						name: "Кровопролитие🔪",
						text: "использует Кровопролитие🔪",
						damage: [50, 100],
						def: false,
						antidef: false,
						cooldown: 3,
						passives: { stun: 0, burn: 0, venom: 0, blood: 3 },
						clean: false,
					},
					{
						id: 2,
						name: "Аватара👻",
						text: "использует Кровопролитие🔪",
						damage: [],
						def: false,
						antidef: false,
						cooldown: 3,
						passives: { stun: 0, burn: 0, venom: 0, blood: 0 },
						clean: true,
					},
					{
						id: 3,
						name: "Оглушение🏃",
						text: "с разбега ударяет плечом",
						damage: [50, 100],
						def: false,
						antidef: false,
						cooldown: 3,
						passives: { stun: 1, burn: 0, venom: 0, blood: 0 },
						clean: false,
					},
					{
						id: 4,
						name: "Блок🛡",
						text: "блокирует атаку",
						damage: [],
						def: true,
						antidef: false,
						cooldown: 3,
						passives: { stun: 0, burn: 0, venom: 0, blood: 0 },
						clean: false,
					},
					{
						id: 5,
						name: "Смертельный удар🪓",
						text: "замахивается топором",
						damage: [150, 200],
						def: false,
						antidef: false,
						cooldown: 5,
						passives: { stun: 0, burn: 0, venom: 0, blood: 2 },
						clean: false,
					},
				],
				hp: 1200,
			},
		];
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
