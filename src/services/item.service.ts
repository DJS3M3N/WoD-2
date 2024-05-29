import { AppDataSource } from "../data-source";
import { Item } from "../entity/Item";

export class ItemService {
    private static itemRepo = AppDataSource.getRepository(Item);

    static create(item_name: string, description: string, slot: string, picture: string, power: number): void {
        const newItem = new Item();
        newItem.name = item_name;
        newItem.description = description;
        newItem.picture = picture;
        newItem.slot = slot;
        newItem.power = power;
        this.itemRepo.save(newItem);
    }

    static async getItem(item_id: number): Promise<Item> {
        if (item_id === 0) {
            const newItem = new Item();
            newItem.name = "Нет";
            newItem.description = "";
            newItem.picture = "";
            newItem.slot = "";
            newItem.power = 0;
            return newItem;
        }
        const res: Item[] = await this.itemRepo.findBy({ id: item_id });
        if (res.length) {
            return res[0];
        } else {
            throw Error("No item with such id" + item_id);
        }
    }

    static async getIdWithName(item_name: string): Promise<number> {
        const res: Item[] = await this.itemRepo.findBy({ name: item_name });
        if (res.length) {
            return res[0].id;
        } else {
            return 0;
        }
    }

    static async getItemSlot(item_id: number): Promise<string> {
        const res: Item[] = await this.itemRepo.findBy({ id: item_id });
        if (res.length) {
            return res[0].slot;
        } else {
            throw Error("No item with such id" + item_id);
        }
    }

    static async getItemPower(item_id: number): Promise<number> {
        if (item_id === 0) {
            return 0;
        }
        const res: Item[] = await this.itemRepo.findBy({ id: item_id });
        if (res.length) {
            return res[0].power;
        } else {
            throw Error("No item with such id" + item_id);
        }
    }
}