import { AppDataSource } from "../data-source";
import { Inventory } from "../entity/Inventory";
import { Item } from "../entity/Item";
import { ItemService } from "./item.service";

export class InventoryService {
    private static InventRepo = AppDataSource.getRepository(Inventory);

    static create(user_id: number, item_id: number): void {
        const new_inventory_line = new Inventory();
        new_inventory_line.item_id = item_id;
        new_inventory_line.owner = user_id;
        this.InventRepo.save(new_inventory_line);
    }

    static getInventory(user_id: number): Promise<Inventory[]> {
        return this.InventRepo.findBy({owner: user_id});
    }

    static async delete(id: number) {
        await this.InventRepo.delete(id);
    }

    static async getItemFromInventory(user_id: number, inventory_id: number): Promise<number> {
        const result = await this.InventRepo.findBy({owner: user_id, id: inventory_id});
        if (result.length !== 0) {
            return result[0].item_id;
        } else {
            throw Error("Wrong inventory id");
        }
    }

    static async getItemFromInventoryWithSlot(user_id: number, slot: string): Promise<Item[]> {
        const result = await this.InventRepo.findBy({owner: user_id});
        const items = [];
        for (let inventory of result) {
            if (await ItemService.getItemSlot(inventory.item_id) === slot) {
                items.push(await ItemService.getItem(inventory.item_id));
            }   
        }
        return items;
    }

    static async getInventoryWithSlot(user_id: number, slot: string): Promise<Inventory[]> {
        const result = await this.InventRepo.findBy({owner: user_id});
        const items = [];
        for (let inventory of result) {
            if (await ItemService.getItemSlot(inventory.item_id) === slot) {
                items.push(inventory);
            }   
        }
        return items;
    }
}