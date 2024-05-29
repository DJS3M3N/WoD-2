import { AppDataSource } from "../data-source";
import { Plant } from "../entity/Plant";
import { Pot } from "../entity/Pot";
import { User } from "../entity/User";
import { UserService } from "./user.service";

export class PlantService {
    static plantRepo = AppDataSource.getRepository(Plant);

    static create(name: string, emoji_icon: string, description: string, cost_money: number,
        cost_rmcurrency: number, sale_price: number, watering_interval: number, death_time: number): void {
        const new_plant = new Plant();
        new_plant.name = name;
        new_plant.emoji_icon = emoji_icon;
        new_plant.description = description;
        new_plant.cost_money = cost_money;
        new_plant.cost_rmcurrency = cost_rmcurrency;
        new_plant.watering_interval = watering_interval
        new_plant.sale_price = sale_price;
        new_plant.death_time = death_time;
        this.plantRepo.save(new_plant);
    }

    static async delete(id: number): Promise<void> {
        const result = await this.plantRepo.findBy({id: id});
        if (result.length > 0) {
            this.plantRepo.delete(id);
        } else {
            throw Error("No avatar with such link!");
        }
    }

    static async getAllPlants(): Promise<Plant[]> {
        return (await this.plantRepo.find());
    }

    static async getPlantById(id: number): Promise<Plant> {
        const result: Plant[] = await this.plantRepo.findBy({ id: id });
        if (result.length) {
            return result[0];
        } else {
            throw Error("No user with such id");
        } 
    }

    static async addPlantToUserPot(userId: number, plantId: number, potNumber: number) {
        const userRepository = AppDataSource.getRepository(User);
        const potRepository = AppDataSource.getRepository(Pot);
        const plantRepository = AppDataSource.getRepository(Plant);
    
        const user_result: User | null  = await userRepository.findOne({
            where: { id: userId },
            relations: ["pot_1", "pot_2", "pot_3", "pot_4", "pot_5", "pot_1.plant", "pot_2.plant", "pot_3.plant", "pot_4.plant", "pot_5.plant"],
        });
        
        if (!user_result) {
            return 
        } 
        
        const plant_result: Plant[] = await plantRepository.findBy({ id: plantId })
        
        if (!plant_result.length) {
            return
        }
        const plant = plant_result[0];
    
        if (!user_result || !plant) {
            throw new Error('User or Plant not found');
        }
    
        let pot: Pot | null = null  
    
        switch (potNumber) {
            case 1:
                pot = user_result?.pot_1;
                break;
            case 2:
                pot = user_result?.pot_2;
                break;
            case 3:
                pot = user_result?.pot_3;
                break;
            case 4:
                pot = user_result?.pot_4;
                break;
            case 5:
                pot = user_result?.pot_5;
                break;
        }
    
        if (!pot) {
            pot = new Pot();
            pot.plant = plant;
            pot.stage = PlantStage.JustPlantedRecently;
            pot.nextWatering = new Date()
            pot.liveUntil = new Date(new Date().getTime() + plant.death_time * 60000);
    
        } else {
            pot.plant = plant;
            pot.stage = PlantStage.JustPlantedRecently;
            pot.nextWatering = new Date()
            pot.liveUntil = new Date(new Date().getTime() + plant.death_time * 60000);
        }
    
        await potRepository.save(pot);
    
        switch (potNumber) {
            case 1:
                user_result.pot_1 = pot;
                break;
            case 2:
                user_result.pot_2 = pot;
                break;
            case 3:
                user_result.pot_3 = pot;
                break;
            case 4:
                user_result.pot_4 = pot;
                break;
            case 5:
                user_result.pot_5 = pot;
                break;
        }
    
        await userRepository.save(user_result);
    }

    static async waterPlant(userId: number, potNumber: number) {
        const userRepository = AppDataSource.getRepository(User);
        const potRepository = AppDataSource.getRepository(Pot);
    
        const user: User | null = await userRepository.findOne({
            where: { id: userId },
            relations: [`pot_${potNumber}`, `pot_${potNumber}.plant`],
        });
    
        if (!user) {
            throw new Error('User not found');
        }
    
        let pot: Pot | null = null  
    
        switch (potNumber) {
            case 1:
                pot = user?.pot_1;
                break;
            case 2:
                pot = user?.pot_2;
                break;
            case 3:
                pot = user?.pot_3;
                break;
            case 4:
                pot = user?.pot_4;
                break;
            case 5:
                pot = user?.pot_5;
                break;
        }
    
        if (!pot || !pot.plant) {
            throw new Error('Pot or plant not found');
        }
    
        if (pot.stage < PlantStage.Grown) {
            if (pot.nextWatering && pot.nextWatering < new Date()) {
                pot.stage += 1;
            }
            pot.nextWatering = new Date(new Date().getTime() + pot.plant.watering_interval * 60000);
            pot.liveUntil = new Date(pot.nextWatering.getTime() + pot.plant.death_time * 60000);
            await potRepository.save(pot);
        }
    }

    static async harvePlant(userId: number, potNumber: number): Promise<number> {
        const userRepository = AppDataSource.getRepository(User);
        const potRepository = AppDataSource.getRepository(Pot);
    
        const user: User | null = await userRepository.findOne({
            where: { id: userId },
            relations: [`pot_${potNumber}`, `pot_${potNumber}.plant`],
        });
    
        if (!user) {
            throw new Error('User not found');
        }
    
        let pot: Pot | null = null  
        
        switch (potNumber) {
            case 1:
                pot = user?.pot_1;
                break;
            case 2:
                pot = user?.pot_2;
                break;
            case 3:
                pot = user?.pot_3;
                break;
            case 4:
                pot = user?.pot_4;
                break;
            case 5:
                pot = user?.pot_5;
                break;
        }
        if (!pot) {
            throw new Error('Pot not found');
        }
        if (!pot.plant) {
            throw new Error('Plant not found');
        }
        const bias = Math.floor(Math.random() * 5); 
        const sale = Math.round(pot.stage * (pot.plant.sale_price + bias) / 4);
        await UserService.getMoney(userId, sale)
        pot.plant = null;
        pot.stage = 0;
        pot.nextWatering = null;
        pot.liveUntil = null;
        await potRepository.save(pot);
        return sale
    }
}



export enum PlantStage {
    JustPlantedRecently = 1,
    Little = 2,
    Mid = 3,
    Grown = 4,
}