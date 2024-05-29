import { randomInt } from "crypto";

export class GamesService {
	games: Game[];
	constructor() {
		this.games = [
			{
				name: "⚫ Рулетка",
				id: "roulette",
				cost: 500,
				start: this.roulette,
				predict: [
					["Четное", "Нечетное", "1-8", "9-16"],
					...Array.from({ length: 4 }).map((_, i) =>
						Array.from({ length: 4 }).map((_, y) => String(y + i * 4 + 1))
					),
				],
			},
			// {
			// 	name: "🎰 Слоты",
			// 	id: "slots",
			// 	cost: 500,
			// 	start: this.slots,
			// },
			{
				name: "🦴 Кости",
				id: "bones",
				cost: 500,
				start: this.bones,
				predict: Array.from({ length: 2 }).map((_, i) =>
					Array.from({ length: 3 }).map((_, y) => String(y + i * 3 + 1))
				),
			},
		];
	}

	bones(bet: number, predict?: string): { money: number; text: string } {
		if (!predict)
			return {
				money: 0,
				text: "Не была указана ставка.",
			};
		let num = Number(predict);
		if (isNaN(num))
			return {
				money: 0,
				text: "Ставка не является числом.",
			};

		if (num > 6 || num < 1)
			return {
				money: 0,
				text: "Введено недопустимое число.",
			};

		const random = randomInt(1, 7);
		console.log(random);

		if (random === num)
			return {
				money: bet * 5,
				text: `Выпало 🎲${random}!\nВы выиграли, на ваш счет начисленно ${
					bet * 5
				} монет.`,
			};
		else
			return {
				money: -bet,
				text: `К сожалению, выпало 🎲${random}.\nВы проиграли, с вашего счета списано ${bet} монет.`,
			};
	}

	roulette(bet: number, predict?: string): { money: number; text: string } {
		if (!predict)
			return {
				money: 0,
				text: "Не была указана ставка.",
			};

		console.log(predict);
		let win;
		let numbers = Array.from({ length: 16 }).map((x, i) => i + 1);
		const number = Number(predict);
		if (predict == "Четное") {
			numbers = numbers.filter((x) => x % 2 == 0);
			win = 2;
		} else if (predict == "Нечетное") {
			numbers = numbers.filter((x) => x % 2 != 0);
			win = 2;
		} else if (predict.split("-").length >= 2) {
			const args = predict.split("-");
			numbers = numbers.filter(
				(x) => x <= Number(args[1]) && x >= Number(args[0])
			);
			win = 3;
		} else if (isNaN(number)) {
			numbers = [number];
			win = 36;
		} else {
			return {
				money: 0,
				text: "Введена неправильная ставка.",
			};
		}

		console.log(numbers);
		const random = randomInt(1, 17);
		console.log(random);

		if (numbers.includes(random))
			return {
				money: bet * (win - 1),
				text: `Выпало 🎲${random}!\nВы выиграли, на ваш счет начисленно ${
					bet * (win - 1)
				} монет.`,
			};
		else
			return {
				money: -bet,
				text: `К сожалению, выпало 🎲${random}.\nВы проиграли, с вашего счета списано ${bet} монет.`,
			};
	}

	slots(bet: number): { money: number; text: string } {
		return {
			money: 0,
			text: "",
		};
	}

	getGames(): Game[] {
		return this.games;
	}

	getGameById(id: string): Game | undefined {
		return this.games.find((x) => x.id === id);
	}
}

interface Game {
	name: string;
	id: string;
	cost: number;
	start: (bet: number, predict?: string) => { money: number; text: string };
	predict?: string[][];
}
