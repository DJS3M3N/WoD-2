import { Context, Scenes } from "telegraf";

export interface SessionData extends Scenes.SceneSession {
    deepLinkPayload?: string;
}


export interface IBotSceneSession extends Scenes.SceneSessionData {

}

export interface IBotContext extends Context {
    session: SessionData;
    scene: Scenes.SceneContextScene<IBotContext, IBotSceneSession>;
}