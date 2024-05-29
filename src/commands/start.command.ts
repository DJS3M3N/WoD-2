import {Telegraf } from "telegraf";
import { Command } from "./command.class";
import { IBotContext } from "../context/context.interface";

export class StartCommand extends Command {
    constructor(bot: Telegraf<IBotContext>) {
        super(bot);
    }

    handle(): void {
        this.bot.command("start", async ctx => {  
            const deepLinkPayload = ctx.message.text.substring(6).trim();
            if (deepLinkPayload) {
                ctx.session.deepLinkPayload = deepLinkPayload
                ctx.scene.enter("clan_invite")
            } else {
                ctx.scene.enter("greeting")
            }     
        });
    }
}
