import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sect } from '../../entities/sect.entity';
import { CreateSectDto } from './dto/create-sect.dto';
import { UpdateSectDto } from './dto/update-sect.dto';

@Injectable()
export class SectService {
  constructor(
    @InjectRepository(Sect)
    private sectRepository: Repository<Sect>,
  ) {}

  async create(createSectDto: CreateSectDto) {
    const sect = this.sectRepository.create(createSectDto);
    return await this.sectRepository.save(sect);
  }

  async findOne(id: number) {
    return await this.sectRepository.findOne({ 
      where: { id },
      relations: ['founder', 'members']
    });
  }

  async update(id: number, updateSectDto: UpdateSectDto) {
    await this.sectRepository.update(id, updateSectDto);
    return this.findOne(id);
  }
}
