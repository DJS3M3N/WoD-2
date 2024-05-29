import { AppDataSource } from "../data-source";
import { Pot } from "../entity/Pot";

export class PotService {
    static async savePot(pot: Pot): Promise<Pot> {
        const potRepository = AppDataSource.getRepository(Pot);
        return potRepository.save(pot);
    }
}