import { resolve } from "path";
import { AppDataSource } from "../data-source";
import { Market } from "../entity/Market";
import { InventoryService } from "./inventory.service";
import { ItemService } from "./item.service";
import { UserService } from "./user.service";

export class MarketService {
    private static marketRepo = AppDataSource.getRepository(Market);

    static async createOffer(owner_id: number, price: number, item_id: number, inventory_id: number): Promise<void> {
        const new_offer = new Market();
        new_offer.owner_id = owner_id;
        new_offer.price = price;
        new_offer.item_id = item_id;
        await InventoryService.delete(inventory_id);
        this.marketRepo.save(new_offer);
    }

    static async retriveItem(offer_id: number): Promise<boolean> {
        const offer = await this.marketRepo.findBy({ id: offer_id });
        if (offer.length === 0) {
            return new Promise(resolve => {
                resolve(false);
            })
        }
        InventoryService.create(offer[0].owner_id, offer[0].item_id);
        await this.marketRepo.delete(offer_id);
        return new Promise(resolve => {
            resolve(true);
        })
    }

    static async delete(offer_id: number): Promise<boolean> {
        const offer = await this.marketRepo.findBy({ id: offer_id });
        if (offer.length === 0) {
            return new Promise(resolve => {
                resolve(false);
            })
        }
        await this.marketRepo.delete(offer_id);
        return new Promise(resolve => {
            resolve(true);
        })
    }

    static async checkPrice(offer_id: number): Promise<number> {
        const res = await this.marketRepo.findBy({ id: offer_id });
        if (res.length > 0) {
            return res[0].price;
        }
        throw Error("No offer with such id");
    }

    static async checkOwner(offer_id: number): Promise<number> {
        const res = await this.marketRepo.findBy({ id: offer_id });
        if (res.length > 0) {
            return res[0].owner_id;
        }
        throw Error("No offer with such id");
    }

    static async getItemId(offer_id: number): Promise<number> {
        const res = await this.marketRepo.findBy({ id: offer_id });
        if (res.length > 0) {
            return res[0].item_id;
        }
        throw Error("No offer with such id");
    }

    static async buyOffer(buyer_id: number, offer_id: number): Promise<boolean> {
        if (await this.marketRepo.countBy({ id: offer_id }) === 0) {
            return new Promise(resolve => {
                resolve(false);
            });
        }
        const price = await this.checkPrice(offer_id);
        if (await UserService.checkMoneyBalance(buyer_id) - price >= 0) {
            InventoryService.create(buyer_id, await this.getItemId(offer_id));
            UserService.payWithMoney(buyer_id, price);
            UserService.getMoney(await this.checkOwner(offer_id), price);
            await MarketService.delete(offer_id);
            return new Promise(resolve => {
                resolve(true);
            });
        }
        return new Promise(resolve => {
            resolve(false);
        })
    }

    static async checkUsersOffers(owner_id: number): Promise<Market[]> {
        return await this.marketRepo.findBy({ owner_id: owner_id });
    }

    static async findOffersWithItem(item_name: string): Promise<Market[]> {
        const item_id = await ItemService.getIdWithName(item_name);
        if (item_id === 0) {
            return [];
        }
        return await this.marketRepo.findBy({ item_id: item_id });
    }
}