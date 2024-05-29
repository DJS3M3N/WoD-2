import { randomInt } from "crypto";
import bot from "../app";
import { Markup } from "telegraf";
import { ConfigService } from "../config/config.service";
const service = new ConfigService();
export class PvpGameService {
	classes: Class[];
	players: Player[];
	nextStep: { id: number; attack: number }[];
	passives: { burn: string; venom: string; stun: string; blood: string };
	constructor(
		member_1: number,
		member_1_name: string,
		member_1_class: string,
		member_2: number,
		member_2_name: string,
		member_2_class: string
	) {
		this.classes = service.getClasses();

		this.players = [
			{
				id: member_1,
				class:
					this.classes.find((x) => x.id === member_1_class) || this.classes[0],
				name: member_1_name,
				hp: (
					this.classes.find((x) => x.id === member_1_class) || this.classes[0]
				).hp,
				cooldowns: [],
				passives: {
					stun: 0,
					burn: 0,
					venom: 0,
					blood: 0,
				},
				damage: 0,
			},
			{
				id: member_2,
				class:
					this.classes.find((x) => x.id === member_2_class) || this.classes[0],
				name: member_2_name,
				hp: (
					this.classes.find((x) => x.id === member_2_class) || this.classes[0]
				)?.hp,
				cooldowns: [],
				passives: {
					stun: 0,
					burn: 0,
					venom: 0,
					blood: 0,
				},
				damage: 0,
			},
		];
		this.nextStep = [];

		this.passives = {
			burn: "поджигая врага 🔥",
			venom: "отравляя врага 🐍",
			stun: "оглушая врага 🫨",
			blood: "пронзая врага 🩸",
		};
	}

	setPassives(attack: Attack, player: Player, text: string[]): void {
		for (const passive of ["stun", "burn", "venom", "blood"] as const) {
			player.passives[passive] = Math.max(
				player.passives[passive],
				attack.passives[passive]
			);
			if (attack.passives[passive] > 0) text.push(this.passives[passive]);
		}
	}

	getSummary(): void {
		let passives = [];

		const step_1 = this.nextStep[0];
		const player_1 = this.players.find((x) => x.id == step_1?.id) || {
			hp: 1000,
			class: this.classes[0],
			name: "",
			cooldowns: [],
			damage: 0,
			id: 0,
			passives: {
				stun: 0,
				burn: 0,
				venom: 0,
				blood: 0,
			},
		};
		const attack_1 = player_1?.class.attacks.find(
			(x) => x.id == step_1?.attack
		) || {
			id: 0,
			name: "",
			text: "",
			damage: [],
			def: false,
			antidef: false,
			clean: false,
			cooldown: 0,
			passives: {
				stun: 0,
				burn: 0,
				venom: 0,
				blood: 0,
			},
		};
		const def_1 = attack_1?.def;

		const step_2 = this.nextStep[1];
		const player_2 = this.players.find((x) => x.id == step_2?.id) || {
			hp: 1000,
			class: this.classes[0],
			name: "",
			cooldowns: [],
			damage: 0,
			id: 0,
			passives: {
				stun: 0,
				burn: 0,
				venom: 0,
				blood: 0,
			},
		};
		const attack_2 = player_2?.class.attacks.find(
			(x) => x.id == step_2?.attack
		) || {
			id: 0,
			name: "",
			text: "",
			damage: [],
			def: false,
			antidef: false,
			clean: false,
			cooldown: 0,
			passives: {
				stun: 0,
				burn: 0,
				venom: 0,
				blood: 0,
			},
		};
		const def_2 = attack_2?.def;

		let text_1 = `${player_1?.name} ${attack_1?.text}, `;
		let text_2 = `${player_2?.name} ${attack_2?.text}, `;

		for (let i of [
			{ attack: attack_1, player: player_1 },
			{ attack: attack_2, player: player_2 },
		]) {
			if (i.attack.clean)
				for (const passive of ["stun", "burn", "venom", "blood"] as const) {
					i.player.passives[passive] = 0;
				}
		}

		for (let i of this.players) {
			if (i.passives.blood > 0) {
				let random = randomInt(10, 30);
				passives.push(`${i.name} истекает кровью и теряет ${random}💔`);
				i.hp -= random;
				i.passives.blood -= 1;
			}

			if (i.passives.venom > 0) {
				let random = randomInt(10, 30);
				passives.push(`${i.name} отправлен и теряет ${random}💔`);
				i.hp -= random;
				i.passives.venom -= 1;
			}

			if (i.passives.stun > 0) {
				i.passives.stun -= 1;
			}

			if (i.passives.burn > 0) {
				let random = randomInt(10, 30);
				passives.push(`${i.name} горит и теряет ${random}💔`);
				i.hp -= random;
				i.passives.burn -= 1;
			}

			i.cooldowns.map((x) => {
				x.kd = Math.max(x.kd - 1, 0);
			});
		}

		let text = [];

		if (def_1) {
			if (attack_2.antidef) {
				let random = randomInt(attack_2.damage[0], attack_2.damage[1]);
				player_1.hp = Math.max(player_1.hp - random * 4, 0);
				player_2.damage += random * 4;
				text.push(`нанося ${random * 4}💔`);
				this.setPassives(attack_2, player_1, text);
			} else if (attack_2.damage.length > 0) {
				let random = randomInt(10, 20);
				player_2.hp = Math.max(player_2.hp - random, 0);
				player_1.damage += random;
				text.push(
					`но ${player_1.name} защитился и контратаковал на ${random}💔`
				);
			}
		} else if (attack_2.damage.length >= 2) {
			let random = randomInt(attack_2.damage[0], attack_2.damage[1]);
			player_1.hp = Math.max(player_1.hp - random, 0);
			player_2.damage += random;
			text.push(`нанося ${random}💔`);
			this.setPassives(attack_2, player_1, text);
		}
		text_2 += text.join(" и ");
		text = [];
		if (def_2) {
			if (attack_1.antidef) {
				let random = randomInt(attack_1.damage[0], attack_1.damage[1]);
				player_2.hp = Math.max(player_2.hp - random * 4, 0);
				player_1.damage += random * 4;
				text.push(`нанося ${random * 4}💔`);
				this.setPassives(attack_1, player_2, text);
			} else if (attack_1.damage.length > 0) {
				let random = randomInt(10, 20);
				player_1.hp = Math.max(player_1.hp - random, 0);
				player_2.damage += random;
				text.push(
					`но ${player_2.name} защитился и контратаковал на ${random}💔`
				);
			}
		} else if (attack_1.damage.length >= 2) {
			let random = randomInt(attack_1.damage[0], attack_1.damage[1]);
			player_2.hp = Math.max(player_2.hp - random, 0);
			player_1.damage += random;
			text.push(`нанося ${random}💔`);
			this.setPassives(attack_1, player_2, text);
		}
		text_1 += text.join(" и ");

		if (attack_1.cooldown > 0) {
			let kd = player_1.cooldowns.find((x) => x.id == attack_1.id);
			if (kd) kd.kd = attack_1.cooldown;
			else player_1.cooldowns.push({ id: attack_1.id, kd: attack_1.cooldown });
		}

		if (attack_2.cooldown > 0) {
			let kd = player_2.cooldowns.find((x) => x.id == attack_2.id);
			if (kd) kd.kd = attack_2.cooldown;
			else player_2.cooldowns.push({ id: attack_2.id, kd: attack_2.cooldown });
		}

		this.players.map((x) => {
			bot.bot.telegram.sendMessage(
				x.id,
				`${passives.join("\n")}\n\n${step_1 ? text_1 + "\n" : ""}${
					step_2 ? text_2 : ""
				}`
			);
		});

		this.step();
	}

	step(): void {
		this.nextStep = [];
		let playerWithoutStun = this.players.find((x) => x.passives.stun <= 0);
		if (!playerWithoutStun) {
			let min = Math.min(...this.players.map((x) => x.passives.stun));
			for (let i = 0; i < min; i++) {
				this.getSummary();
			}
		}
		let lose = this.players.find((x) => x.hp <= 0);
		if (lose) {
			let winner = this.players.find((x) => x.hp >= 0);
			if (!winner) {
				this.players.map((x) => {
					bot.bot.telegram.sendMessage(
						x.id,
						`Ничья!\n\n${this.players
							.map(
								(y) =>
									`${y.class?.emoji} ${y.name} - ${y.hp}❤️\nНанесенный урон: ${y.damage}💔`
							)
							.join("\n\n")}`
					);
				});
			} else {
				this.players.map((x) => {
					bot.bot.telegram.sendMessage(
						x.id,
						`Победил ${winner.name}!\n\n${this.players
							.map(
								(y) =>
									`${y.class?.emoji} ${y.name} - ${y.hp}❤️\nНанесенный урон: ${y.damage}💔`
							)
							.join("\n\n")}`
					);
				});
			}
		} else {
			this.players.map((x) => {
				bot.bot.telegram.sendMessage(
					x.id,
					`${this.players
						.map((y) => `${y.class?.emoji} ${y.name} - ${y.hp}❤️`)
						.join("\n")}\n\n${
						x.passives.stun <= 0
							? "Выберите, что вы хотите сделать:"
							: "К сожалению, вы пропускаете ход, из-за оглушения"
					}`,
					{
						reply_markup: Markup.inlineKeyboard(
							x.passives.stun <= 0
								? [
										x.class.attacks.slice(0, 3).map((y) => {
											let cooldown = x.cooldowns.find(
												(z) => z.id === y.id && z.kd > 0
											);
											return Markup.button.callback(
												`${y.name} ${cooldown ? `(⌛${cooldown.kd})` : ""}`,
												`step_${y.id}`,
												Boolean(
													x.cooldowns.find((z) => z.id === y.id && z.kd > 0)
												)
											);
										}),
										x.class.attacks.slice(3, 6).map((y) => {
											let cooldown = x.cooldowns.find(
												(z) => z.id === y.id && z.kd > 0
											);
											return Markup.button.callback(
												`${y.name} ${cooldown ? `(⌛${cooldown.kd})` : ""}`,
												`step_${y.id}`,
												Boolean(
													x.cooldowns.find((z) => z.id === y.id && z.kd > 0)
												)
											);
										}),
								  ]
								: []
						).reply_markup,
					}
				);
			});
		}
	}

	setStep(user: number, attack: number): void {
		this.nextStep.push({ id: user, attack: attack });
		if (
			this.nextStep.length >=
			this.players.filter((x) => x.passives.stun <= 0).length
		)
			this.getSummary();
	}

	startGame(): void {
		this.players.map((x) => {
			bot.bot.telegram.sendMessage(
				x.id,
				`Ваш противник найден!\n\n${this.players
					.map((y) => `${y.class?.emoji} ${y.name} - ${y.hp}❤️`)
					.join("\n")}\n\nВыберите, что вы хотите сделать:`,
				{
					reply_markup: Markup.inlineKeyboard([
						x.class.attacks
							.slice(0, 3)
							.map((y) => Markup.button.callback(y.name, `step_${y.id}`)),
						x.class.attacks
							.slice(3, 6)
							.map((y) => Markup.button.callback(y.name, `step_${y.id}`)),
					]).reply_markup,
				}
			);
		});
	}
}

interface Attack {
	id: number;
	name: string;
	text: string;
	damage: number[];
	def: boolean;
	antidef: boolean;
	clean: boolean;
	cooldown: number;
	passives: {
		stun: number;
		burn: number;
		venom: number;
		blood: number;
	};
}

interface Class {
	id: string;
	name: string;
	emoji: string;
	attacks: Attack[];
	hp: number;
}

interface Player {
	class: Class;
	id: number;
	name: string;
	hp: number;
	cooldowns: {
		id: number;
		kd: number;
	}[];
	passives: {
		stun: number;
		burn: number;
		venom: number;
		blood: number;
	};
	damage: number;
}
