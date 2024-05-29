import { AppDataSource } from "../data-source";
import { Shop } from "../entity/Shop";
import { InventoryService } from "./inventory.service";
import { UserService } from "./user.service";

export class ShopService {
    private static shopRepo = AppDataSource.getRepository(Shop);

    static create(currency_type: string, item_id: number, price: number, rm_price: number): void {
        const newOffer = new Shop();
        newOffer.item_id = item_id;
        newOffer.price = price;
        newOffer.isActvie = true;
        newOffer.currency_type = currency_type;
        newOffer.rm_price = rm_price;

        this.shopRepo.save(newOffer);
    }

    static async checkMoneyPrice(offer_id: number): Promise<number> {
        const result: Shop[] = await this.shopRepo.findBy({ id: offer_id });
        if (result.length) {
            return result[0].price;
        } else {
            throw Error("No offer with such id");
        }
    }

    static async checkRMCurrencyPrice(offer_id: number): Promise<number> {
        const result: Shop[] = await this.shopRepo.findBy({ id: offer_id });
        if (result.length) {
            return result[0].rm_price;
        } else {
            throw Error("No offer with such id");
        }
    }

    static async getItemId(offer_id: number): Promise<number> {
        const result: Shop[] = await this.shopRepo.findBy({ id: offer_id });
        if (result.length) {
            return result[0].item_id;
        } else {
            throw Error("No offer with such id");
        }
    }

    static async checkOfferActive(offer_id: number): Promise<boolean> {
        const result: Shop[] = await this.shopRepo.findBy({ id: offer_id });
        if (result.length) {
            return result[0].isActvie;
        } else {
            throw Error("No offer with such id");
        }
    }

    static async makeOfferNotActive(offer_id: number): Promise<void> {
        const result: Shop[] = await this.shopRepo.findBy({ id: offer_id });
        if (result.length) {
            this.shopRepo.update(offer_id, {isActvie: false});
        } else {
            throw Error("No offer with such id");
        }
    }

    static async buyOfferWithMoney(offer_id: number, buyer_id: number): Promise<boolean> {
        const offerStatus = await this.checkOfferActive(offer_id);
        if (!offerStatus) {
            return offerStatus;
        }
        const price = await this.checkMoneyPrice(offer_id);
        if (await UserService.checkMoneyBalance(buyer_id) - price >= 0) {
            InventoryService.create(buyer_id, await this.getItemId(offer_id));
            UserService.payWithMoney(buyer_id, price);
            return new Promise(resolve => {
                resolve(true);
            });
        }
        return new Promise(resolve => {
            resolve(false);
        })
    }

    static async buyOfferWithRMCurrency(offer_id: number, buyer_id: number): Promise<boolean> {
        const offerStatus = await this.checkOfferActive(offer_id);
        if (!offerStatus) {
            return offerStatus;
        }
        const price = await this.checkRMCurrencyPrice(offer_id);
        if (await UserService.checkRMCurrencyBalance(buyer_id) - price >= 0) {
            InventoryService.create(buyer_id, await this.getItemId(offer_id));
            UserService.payWithRMCurrency(buyer_id, price);
            return new Promise(resolve => {
                resolve(true);
            });
        }
        return new Promise(resolve => {
            resolve(false);
        })
    }

    static async checkPaymentOptions(offer_id: number): Promise<string> {
        const result: Shop[] = await this.shopRepo.findBy({ id: offer_id });
        if (result.length) {
            return result[0].currency_type;
        } else {
            throw Error("No offer with such id");
        }
    }

    static async getOffers(): Promise<Shop[]> {
        return await this.shopRepo.findBy({isActvie: true});
    }
}