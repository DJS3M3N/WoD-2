import { AppDataSource } from "../data-source";
import { Clan } from "../entity/Clan";
import { v4 as uuidv4 } from 'uuid';
import { User } from "../entity/User";

export class ClanService {
    static clanRepo = AppDataSource.getRepository(Clan);
    static userRepo = AppDataSource.getRepository(User);

    static async create(name: string, description: string, userId: number): Promise<string> {

        const adminUser = await this.userRepo.findOneBy({ id: userId });
        if (!adminUser) {
            throw new Error('User not found');
        }

        const existingAdminClan = await this.clanRepo.findOneBy({ administrator: adminUser });
        if (existingAdminClan) {
            throw new Error('User is already an administrator of a clan');
        }

        if (adminUser.clan) {
            throw new Error('User is already a member of a clan');
        }

        const new_clan = new Clan();
        new_clan.name = name;
        new_clan.level = adminUser.level
        new_clan.description = description;
        new_clan.administrator = adminUser
        new_clan.uniqueInvitationCode = uuidv4();

        adminUser.clan = new_clan;

        await this.clanRepo.save(new_clan);
        await this.userRepo.save(adminUser); 

        return new_clan.uniqueInvitationCode
    }

    static async delete(id: number): Promise<void> {
        const result = await this.clanRepo.findBy({id: id});
        if (result.length > 0) {
            this.clanRepo.delete(id);
        } else {
            throw Error("No clan with such id!");
        }
    }

    static async getClanByUrl(url: string): Promise<getClanByUrlResult> {
        const clan = await this.clanRepo.findOne({
            where: { uniqueInvitationCode: url },
            relations: ['administrator'],
        });

        if (clan) {
            return {exists: true, clan: clan}
        } else {
            return {exists: false, clan: undefined};
        }
    }

    static async addUser(userId: number, clanId: number): Promise<void> {
        const user = await this.userRepo.findOneBy({ id: userId });
        const clan = await this.clanRepo.findOneBy({ id: clanId });
    
        if (!user) {
            throw new Error('User not found');
        }
        if (!clan) {
            throw new Error('Clan not found');
        }
    
        if (user.clan) {
            throw new Error('User is already a member of a clan');
        }
        clan.level += user.level;
        user.clan = clan;
        await this.clanRepo.save(clan)
        await this.userRepo.save(user);
    }

    static async getClanMembers(clanId: number, offset: number = 0, limit: number = 10): Promise<User[]> {

        const clanExists = await this.clanRepo.findOneBy({ id: clanId });
        if (!clanExists) {
            throw new Error('Clan not found');
        }

        const members = await this.userRepo.createQueryBuilder("user")
            .leftJoinAndSelect("user.clan", "clan")
            .where("clan.id = :clanId", { clanId })
            .skip(offset)
            .take(limit)
            .getMany();
    
        return members;
    }

    static async leaveClan(userId: number): Promise<void> {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['clan', 'clan.administrator'],
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (!user.clan) {
            throw new Error('User is not a member of any clan');
        }
        if (user.clan.administrator.id === userId) {
            throw new Error('Admin cannot leave');
        }
        if (user.clan) {
            user.clan = null; 
        }
        await this.userRepo.save(user);
    }

    static async excludeUser(userId: number): Promise<void> {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['clan', 'clan.administrator'],
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (!user.clan) {
            throw new Error('User is not a member of any clan');
        }
        if (user.clan.administrator.id === userId) {
            throw new Error('Admin cannot leave');
        }
        user.clan = null; 
        await this.userRepo.save(user);
    }

    static async makeAdmin(currentAdminId: number, newAdminId: number): Promise<void> {
        const currentAdmin = await this.userRepo.findOne({
            where: { id: currentAdminId },
            relations: ['clan', 'clan.administrator'], 
        });
        if (!currentAdmin || !currentAdmin.clan) {
            throw new Error('Current administrator not found or not part of a clan');
        }
    
        const newAdmin = await this.userRepo.findOneBy({ id: newAdminId });
        if (!newAdmin) {
            throw new Error('New administrator user not found');
        }
    
        if (!currentAdmin.clan.administrator || currentAdmin.clan.administrator.id !== currentAdminId) {
            throw new Error('Operation not allowed. User is not the current administrator.');
        }
    
        currentAdmin.clan.administrator = newAdmin;
        await this.clanRepo.save(currentAdmin.clan); 
    }
    
    static async getTopClans(): Promise<Clan[]> {

        return this.clanRepo
            .createQueryBuilder("clan")
            .orderBy("clan.level", "DESC") 
            .limit(10)
            .getMany(); 
    }


    static async updateClanLevels(): Promise<void> {
        const clans = await this.clanRepo.find({
            relations: ['members'],
        });

        
    
        for (const clan of clans) {
            console.log(clan)
            const totalLevel = clan.members.reduce((sum, member) => sum + member.level, 0);
            clan.level = totalLevel;
            await this.clanRepo.save(clan);
        }
    }
    

}

interface getClanByUrlResult {
    exists: boolean;
    clan?: Clan;   
}
