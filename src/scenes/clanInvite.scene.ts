import { Markup, Scenes } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { ClanService } from "../services/clan.service";
import { UserService } from "../services/user.service";

export const clanInviteScene = new Scenes.BaseScene<IBotContext>("clan_invite");

clanInviteScene.enter(ctx => {
    console.log('inside clan invite');
    console.log(ctx.session.deepLinkPayload);
    displayInvite(ctx)
});

const displayInvite = async (ctx: IBotContext) => {
    if (!ctx.from) {
        return
    }
    const keyboard = [];
    const clanInfo = await UserService.checkForClan(ctx.from.id)
    let text = ""
    if (clanInfo.isInClan) {
        text += "Вы не можете присоедениться к этому клану, т.к. уже состоите в другом."
        ctx.reply(text);
        ctx.scene.leave();
        ctx.scene.enter("menu");
    } else {
        if (!ctx.session.deepLinkPayload) {
            return 
        }
        const clan = await ClanService.getClanByUrl(ctx.session.deepLinkPayload)
        if (!clan.exists) {
            return
        }
    
        text += "Вам предложено присоедениться к клану " + clan.clan?.name +
        "\n" + clan.clan?.description;
        keyboard.push(Markup.button.callback('Принять', 'accept'));
        keyboard.push(Markup.button.callback('Отказаться', 'reject'));
        ctx.reply(text, Markup.inlineKeyboard(keyboard));
    }
}


clanInviteScene.action('accept', async ctx => {
    let text = ""

    if (!ctx.session.deepLinkPayload) {
        text = "Ошибка при обработке приглашения.";
        ctx.reply(text);
        return;
    }

    try {
        const clan = await ClanService.getClanByUrl(ctx.session.deepLinkPayload);
        if (!clan.exists || !clan.clan) {
            text = "Клан не найден.";
            ctx.reply(text);
            return;
        }

        await ClanService.addUser(ctx.from.id, clan.clan.id);
        text = `Вы успешно присоединились к клану ${clan.clan.name}.`;
    } catch (error) {
        text = "Ошибка";
    } finally {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.reply(text);
        ctx.scene.leave();
        ctx.scene.enter("menu");
    }
});

clanInviteScene.action('reject', ctx => {
    let text = "Отказано!"
    ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    ctx.reply(text);
    ctx.scene.leave();
    ctx.scene.enter("menu");
});
 