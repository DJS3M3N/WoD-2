import { Markup, Scenes } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { UserService } from "../services/user.service";

export const walkScene = new Scenes.BaseScene<IBotContext>("walk");

const walks = [
    { name: "Лес", max_reward: 15, description: "Прогулка в лесу помогает проветрить голову и собраться с мыслями." },
    { name: "Пляж", max_reward: 20, description: "Пляжный песок, то что нужно для ваших лап" },
    { name: "Горы", max_reward: 30, description: "Горы - отличный способ отдохнуть любуясь видами" },
];

walkScene.enter(async (ctx) => {
    if (!ctx.from) return;

    const user = await UserService.getUserInfo(ctx.from.id);
    if (!user) {
        await ctx.reply("Пользователь не найден.");
        return;
    }

    if (user.last_walk && new Date().getTime() - user.last_walk.getTime() < 2 * 60 * 60 * 1000) {
        await ctx.reply(
            "Вам нужно отдохнуть прежде чем идти на очередную прогулку. Попробуйте позже.",
            Markup.inlineKeyboard([
                Markup.button.callback("Вернуться", "back_to_fortress")
            ])
        );
        return;
    }

    await ctx.reply(
        "Куда хотите отправиться или вернуться в крепость?:",
        Markup.inlineKeyboard([
            ...walks.map(walk => Markup.button.callback(walk.name, `walk_${walk.name}`)),
            Markup.button.callback("Вернуться", "back_to_fortress")
        ], { columns: 2 })
    );
});

walkScene.action(/^walk_(.+)$/, async (ctx) => {
    if (!ctx.match || !ctx.from) return;

    const walkName = ctx.match[1];
    const walkOption = walks.find(walk => walk.name === walkName);
    if (!walkOption) {
        await ctx.reply("Неверное направление.");
        return;
    }

    await UserService.updateUserWalk(ctx.from.id, new Date());

    await ctx.editMessageText(`Вы выбрали: ${walkOption.name}. Вы на прогулке...`, { reply_markup: { inline_keyboard: [] } });

    setTimeout(async () => {
        const reward = Math.floor(Math.random() * (walkOption.max_reward + 1));
        await ctx.reply(
            `${walkOption.description} Вы получили ${reward}💰! Вернуться в крепость?`,
            Markup.inlineKeyboard([Markup.button.callback("Вернуться", "back_to_fortress")])
        );
    }, 5000);
});

walkScene.action("back_to_fortress", (ctx) => {
    ctx.scene.enter("fortress");
});
