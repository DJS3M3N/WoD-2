import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { ConfigService } from "./config/config.service"
import { Item } from "./entity/Item";
import { Inventory } from "./entity/Inventory";
import { Shop } from "./entity/Shop";
import { Market } from "./entity/Market";
import { Casino } from "./entity/Casino";
import { Avatars } from "./entity/Avatars";
import { Plant } from "./entity/Plant";
import { Pot } from "./entity/Pot";
import { Clan } from "./entity/Clan";

const configService = new ConfigService();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: configService.get("host"),
    port: parseInt(configService.get("port")),
    username: configService.get("username"),
    password: configService.get("password"),
    database: configService.get("database"),
    synchronize: true,
    logging: false,
    entities: [User, Item, Inventory, Shop, Market, Casino, Avatars, Plant, Pot, Clan],
    migrations: [],
    subscribers: [],
})
