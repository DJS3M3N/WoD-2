import { AppDataSource } from "../data-source";
import { Casino } from "../entity/Casino";
import { InventoryService } from "./inventory.service";
import { UserService } from "./user.service";

export class CasinoService {
    private static casinoRepo = AppDataSource.getRepository(Casino);

    static async create(name: string, outcomes: string[], chances: number[], prizes: number[], pictures: string[], price: number): Promise<void> {
        const new_game = new Casino();
        new_game.name = name;
        new_game.outcomes = outcomes;
        new_game.chances = chances;
        new_game.prizes = prizes;
        new_game.pictures = pictures;
        new_game.price = price;

        this.casinoRepo.save(new_game);
    }

    static async getGameInfo(id: number): Promise<Casino> {
        const result = await this.casinoRepo.findBy({id: id});

        if (result.length > 0) {
            return result[0];
        } else {
            throw Error("Could not find game with such id!");
        }
    }

    static async play(id: number, player_id: number): Promise<number> {
        const game = await this.getGameInfo(id);
        const random_value = Math.random();
        
        console.log(random_value);

        UserService.payWithMoney(player_id, game.price);

        let outcome = 0;
        for (let i = 0; i < game.chances.length; ++i) {
            if (game.chances[i] < random_value) {
                outcome = i + 1;
            }
        }

        if (game.prizes[outcome] !== 0) {
            InventoryService.create(player_id, game.prizes[outcome]);
        }

        return outcome;
    }

    static async delete(id: number) {
        this.casinoRepo.delete(id);
    }

    static async getGames() {
        return await this.casinoRepo.find();
    }
}