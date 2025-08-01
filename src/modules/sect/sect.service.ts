import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sect } from '../../entities/sect.entity';
import { PendMember } from '../../entities/pending-member.entity';
import { SectMember } from '../../entities/sect-member.entity';
import { Cron } from '@nestjs/schedule';
import { CreateSectDto } from './dto/create-sect.dto';
import { UpdateSectDto } from './dto/update-sect.dto';
import { generateMember } from 'src/utils/member-generator';
@Injectable()
export class SectService implements OnModuleInit {
  constructor(
    @InjectRepository(Sect)
    private sectRepository: Repository<Sect>,
    @InjectRepository(PendMember)
    private pendMemberRepo: Repository<PendMember>,
    @InjectRepository(SectMember)
    private sectMemberRepo: Repository<SectMember>,
  ) {}
  async onModuleInit() {
    // await this.generatePotentialDisciples();
    // console.log('SectService onModuleInit');
  }
  async create(createSectDto: CreateSectDto) {
    const sect = this.sectRepository.create({
      founder: { id: createSectDto.founderId },
      ...createSectDto
    });
  
    return await this.sectRepository.save(sect);
  }

  async findOne(id: number) {
    return await this.sectRepository.findOne({ 
      where: { id },
      relations: ['founder', 'members']
    });
  }

  async update(id: number, updateSectDto: UpdateSectDto) {
    await this.sectRepository.update(id, {
      ...updateSectDto
    });
    return this.findOne(id);
  }

  async getSectList() {
    return await this.sectRepository.find();
  }

  async findPendingMembers(sectId: number) {
    return await this.pendMemberRepo.find({
      where: { sect: { id: sectId } },
    });
  }

  async findSectMembers(sectId: number) {
    return await this.sectMemberRepo.find({
      where: { sect: { id: sectId } },
    });
  }
  
  @Cron('0 0 */4 * * *')
  async generatePotentialDisciples() {
    const sects = await this.sectRepository.find({
      relations: ['founder']
    });
    for (const sect of sects) {
      const memberCount = await this.sectMemberRepo.count({ 
        where: { sect: { id: sect.id } }
      });
      
      if (memberCount >= 30) continue;

      await this.pendMemberRepo.delete({ sect: { id: sect.id } });

      const newMemberCount = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < newMemberCount; i++) {
        const npc = generateMember();
        await this.pendMemberRepo.save({
          sect,
          character:{id:sect.founder.id},
          ...npc,
          arriveTime: new Date(),
          expireHours: 24
        });
      }
    }
  }
  async processDisciple(pendingId: number, accept: boolean) {
    const pending = await this.pendMemberRepo.findOne({ 
      where: { id: pendingId },
      relations: ['sect']
    });

    if (!pending) throw new Error('无效的请求');

    if (accept) {
      const memberCount = await this.sectMemberRepo.count({
        where: { sect: { id: pending.sect.id } }
      });
      
      if (memberCount >= 30) {
        throw new Error('宗门人数已达上限');
      }

      await this.sectMemberRepo.save({
        sect: pending.sect,
        ...pending,
        rank: 'DISCIPLE'
      });
    }
    await this.pendMemberRepo.delete(pending.id);
  }
}

