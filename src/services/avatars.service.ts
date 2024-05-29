import { AppDataSource } from "../data-source";
import { Avatars } from "../entity/Avatars";

export class AvatarsService {
    static avatarRepo = AppDataSource.getRepository(Avatars);

    static create(link: string, link_with_num: string): void {
        const new_avatar = new Avatars();
        new_avatar.link = link;
        new_avatar.link_with_num = link_with_num;
        this.avatarRepo.save(new_avatar);
    }

    static async delete(link: string): Promise<void> {
        const result = await this.avatarRepo.findBy({link: link});
        if (result.length > 0) {
            this.avatarRepo.delete(result[0].id);
        } else {
            throw Error("No avatar with such link!");
        }
    }

    static async getAllAvatars(): Promise<string[][]> {
        return (await this.avatarRepo.find()).map(avatar => [avatar.link, avatar.link_with_num]);
    }
}