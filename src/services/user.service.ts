import { AppDataSource } from "../data-source";
import { Pot, potDict } from "../entity/Pot";
import { User } from "../entity/User";
import { InventoryService } from "./inventory.service";
import { ItemService } from "./item.service";
import { PlantService } from "./plant.service";
import { PotService } from "./pot.service";

export class UserService {
    private static userRepo = AppDataSource.getRepository(User);

    static create(id: number, char_name: string, char_class: string, avatar: string): void {
        const newUser = new User();
        newUser.char_name = char_name;
        newUser.char_class = char_class;
        newUser.avatar = avatar;
        newUser.is_admin = false;
        newUser.id = id;
        newUser.money = 1000;
        newUser.rm_currency = 100;
        newUser.pot_1 = null
        newUser.pot_2 = null
        newUser.pot_3 = null
        newUser.pot_4 = null
        newUser.pot_5 = null
        this.userRepo.save(newUser);
    }

    static async saveUser(user: User) {
        await this.userRepo.save(user)
    }

    static async checkForClan(user_id: number): Promise<ClanCheckResult> {
        const userWithClan = await this.userRepo.findOne({
            where: { id: user_id },
            relations: ['clan', 'clan.administrator'],
        });
    
        if (userWithClan && userWithClan.clan) {
            const { id, name, description, uniqueInvitationCode, level, administrator } = userWithClan.clan;
            return {
                isInClan: true,
                clanDetails: {
                    id,
                    name,
                    description,
                    uniqueInvitationCode,
                    level,
                    administrator,
                },
            };
        } else {
            return { isInClan: false };
        }
    }

    static async checkIfExists(user_id: number): Promise<boolean> {
        return await this.userRepo.existsBy({ id: user_id });
    }

    static async checkIfAdmin(user_id: number): Promise<boolean> {
        return await this.userRepo.existsBy({ id: user_id, is_admin: true })
    }

    static async getUserInfo(user_id: number): Promise<User> {
        const result: User[] = await this.userRepo.findBy({ id: user_id });
        if (result.length) {
            return result[0];
        } else {
            throw Error("No user with such id");
        }
    }

    static async checkMoneyBalance(user_id: number): Promise<number> {
        const result: User[] = await this.userRepo.findBy({ id: user_id });
        if (result.length) {
            return result[0].money;
        } else {
            throw Error("No user with such id");
        }
    }

    static async checkRMCurrencyBalance(user_id: number): Promise<number> {
        const result: User[] = await this.userRepo.findBy({ id: user_id });
        if (result.length) {
            return result[0].rm_currency;
        } else {
            throw Error("No user with such id");
        }
    }

    static async updateUserWalk(userId: number, walkTime: Date, reward: number = 0): Promise<void> {

        const user = await this.userRepo.findOneBy({ id: userId });
        if (!user) throw new Error("User not found");

        user.last_walk = walkTime;
        user.money += reward; 

        await this.userRepo.save(user);
    }

    static payWithMoney(user_id: number, amount: number): void {
        this.userRepo.decrement({ id: user_id }, "money", amount);
    }

    static payWithRMCurrency(user_id: number, amount: number): void {
        this.userRepo.decrement({ id: user_id }, "rm_currency", amount);
    }

    static getMoney(user_id: number, amount: number): void {
        this.userRepo.increment({ id: user_id }, "money", amount);
    }

    static getRMCurrency(user_id: number, amount: number): void {
        this.userRepo.increment({ id: user_id }, "rm_currency", amount);
    }

    static addToUser(user_id: number, amount: number, variable: string): void {
        this.userRepo.increment({ id: user_id }, variable, amount);
    }

    static giveAdminToUser(user_id: number): void {
        this.userRepo.update({ id: user_id }, { is_admin: true });
    }

    static async putItemInSlot(user_id: number, inventory_id: number, slot: string): Promise<void> {
        if (["arms", "legs", "feet", "lefthand", "righthand", "head", "thorax"].some(value => value === slot)) {
            const user_data = await UserService.getUserInfo(user_id);
            const item_id = await InventoryService.getItemFromInventory(user_id, inventory_id);
            const item_slot = await ItemService.getItemSlot(item_id);
            if (item_slot !== slot) {
                throw Error("Wrong slot for this item!");
            }
            switch (slot) {
                case "arms":
                    if (user_data.arms_item_equiped !== 0) {
                        InventoryService.create(user_id, user_data.arms_item_equiped);
                    }
                    this.userRepo.update({ id: user_id }, { "arms_item_equiped": item_id });
                    break;
                case "legs":
                    if (user_data.legs_item_equiped !== 0) {
                        InventoryService.create(user_id, user_data.legs_item_equiped);
                    }
                    this.userRepo.update({ id: user_id }, { "legs_item_equiped": item_id });
                    break;
                case "feet":
                    if (user_data.feet_item_equiped !== 0) {
                        InventoryService.create(user_id, user_data.feet_item_equiped);
                    }
                    this.userRepo.update({ id: user_id }, { "feet_item_equiped": item_id });
                    break;
                case "lefthand":
                    if (user_data.lefthand_item_equiped !== 0) {
                        InventoryService.create(user_id, user_data.lefthand_item_equiped);
                    }
                    this.userRepo.update({ id: user_id }, { "lefthand_item_equiped": item_id });
                    break;
                case "righthand":
                    if (user_data.righthand_item_equiped !== 0) {
                        InventoryService.create(user_id, user_data.righthand_item_equiped);
                    }
                    this.userRepo.update({ id: user_id }, { "righthand_item_equiped": item_id });
                    break;
                case "head":
                    if (user_data.head_item_equiped !== 0) {
                        InventoryService.create(user_id, user_data.head_item_equiped);
                    }
                    this.userRepo.update({ id: user_id }, { "head_item_equiped": item_id });
                    break;
                case "thorax":
                    if (user_data.thorax_item_equiped !== 0) {
                        InventoryService.create(user_id, user_data.thorax_item_equiped);
                    }
                    this.userRepo.update({ id: user_id }, { "thorax_item_equiped": item_id });
                    break;
            }
            InventoryService.delete(inventory_id);
        } else {
            throw Error("Wrong slot");
        }
    }

    static async removeItemFromSlot(user_id: number, slot: string): Promise<void> {
        if (["arms", "legs", "feet", "lefthand", "righthand", "head", "thorax"].some(value => value === slot)) {
            const user_data = await UserService.getUserInfo(user_id);
            switch (slot) {
                case "arms":
                    if (user_data.arms_item_equiped !== 0) {
                        InventoryService.create(user_id, user_data.arms_item_equiped);
                    }
                    this.userRepo.update({ id: user_id }, { "arms_item_equiped": 0 });
                    break;
                case "legs":
                    if (user_data.legs_item_equiped !== 0) {
                        InventoryService.create(user_id, user_data.legs_item_equiped);
                    }
                    this.userRepo.update({ id: user_id }, { "legs_item_equiped": 0 });
                    break;
                case "feet":
                    if (user_data.feet_item_equiped !== 0) {
                        InventoryService.create(user_id, user_data.feet_item_equiped);
                    }
                    this.userRepo.update({ id: user_id }, { "feet_item_equiped": 0 });
                    break;
                case "lefthand":
                    if (user_data.lefthand_item_equiped !== 0) {
                        InventoryService.create(user_id, user_data.lefthand_item_equiped);
                    }
                    this.userRepo.update({ id: user_id }, { "lefthand_item_equiped": 0 });
                    break;
                case "righthand":
                    if (user_data.righthand_item_equiped !== 0) {
                        InventoryService.create(user_id, user_data.righthand_item_equiped);
                    }
                    this.userRepo.update({ id: user_id }, { "righthand_item_equiped": 0 });
                    break;
                case "head":
                    if (user_data.head_item_equiped !== 0) {
                        InventoryService.create(user_id, user_data.head_item_equiped);
                    }
                    this.userRepo.update({ id: user_id }, { "head_item_equiped": 0 });
                    break;
                case "thorax":
                    if (user_data.thorax_item_equiped !== 0) {
                        InventoryService.create(user_id, user_data.thorax_item_equiped);
                    }
                    this.userRepo.update({ id: user_id }, { "thorax_item_equiped": 0 });
                    break;
            }
        } else {
            throw Error("Wrong slot");
        }
    }

    static async getUserPotsAndPlants(user_id: number): Promise<UserPotPlantInfo> {
        const user = await this.userRepo.findOne({
            where: { id: user_id },
            relations: ["pot_1", "pot_2", "pot_3", "pot_4", "pot_5", "pot_1.plant", "pot_2.plant", "pot_3.plant", "pot_4.plant", "pot_5.plant"],
        });
        if (!user) {
            throw new Error('User not found');
        }
        const pots = [user.pot_1, user.pot_2, user.pot_3, user.pot_4, user.pot_5];
        const usersPotsAndPlants: UserPotPlantInfo = {
            userId: user.id,
            charName: user.char_name,
            pots: pots
        };
        return usersPotsAndPlants;
    }

    static async purchasePot(userId: number, potNumber: number, currency: string): Promise<Pot | null> {
        const cost = potDict[potNumber][currency === 'money' ? 0 : 1];
        const balance = currency === 'money' ? await this.checkMoneyBalance(userId) : await this.checkRMCurrencyBalance(userId);

        if (balance >= cost) {
            if (currency === 'money') {
                await this.payWithMoney(userId, cost);
            } else {
                await this.payWithRMCurrency(userId, cost);
            }

            let pot = new Pot();
            pot.rentedUntil = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);
            await PotService.savePot(pot);

            const user = await this.getUserInfo(userId);
            switch (potNumber) {
                case 1:
                    user.pot_1 = pot;
                    break;
                case 2:
                    user.pot_2 = pot;
                    break;
                case 3:
                    user.pot_3 = pot;
                    break;
                case 4:
                    user.pot_4 = pot;
                    break;
                case 5:
                    user.pot_5 = pot;
                    break;
                default:
                    break;
            }
            await this.saveUser(user);
            return pot;
        } else {
            return null;
        }
    }

    static async purchasePlant(userId: number, potNumber: number, plantId: number, currency: string): Promise<boolean> {
        const plant = await PlantService.getPlantById(plantId);
        const cost = currency === 'money' ? plant.cost_money : plant.cost_rmcurrency;
        const balance = currency === 'money' ? await this.checkMoneyBalance(userId) : await this.checkRMCurrencyBalance(userId);

        if (balance >= cost) {
            if (currency === 'money') {
                await this.payWithMoney(userId, cost);
            } else {
                await this.payWithRMCurrency(userId, cost);
            }

            await PlantService.addPlantToUserPot(userId, plantId, potNumber);
            return true;
        } else {
            return false;
        }
    }

    static async getNameById(userId: number): Promise<string> {
        const result = await this.userRepo.findBy({ id: userId });
        if (result.length > 0) {
            return result[0].char_name;
        } else {
            throw Error("No user wtih such id" + userId);
        }
    }

    static async getCharPower(user_id: number): Promise<number> {
        const user = await this.getUserInfo(user_id);
        let result = 0;

        result += await ItemService.getItemPower(user.head_item_equiped);
        result += await ItemService.getItemPower(user.thorax_item_equiped);
        result += await ItemService.getItemPower(user.righthand_item_equiped);
        result += await ItemService.getItemPower(user.lefthand_item_equiped);
        result += await ItemService.getItemPower(user.arms_item_equiped);
        result += await ItemService.getItemPower(user.legs_item_equiped);
        result += await ItemService.getItemPower(user.feet_item_equiped);
        
        return result;
    }
}

interface UserPotPlantInfo {
    userId: number;
    charName: string;
    pots: (Pot | null)[];
}

interface ClanCheckResult {
    isInClan: boolean;
    clanDetails?: {
        id: number;
        name: string;
        description: string;
        level: number;
        uniqueInvitationCode: string;
        administrator: User
    };
}
