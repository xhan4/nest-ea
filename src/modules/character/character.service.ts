import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from '../../entities/character.entity';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';

@Injectable()
export class CharacterService {
  constructor(
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
  ) { }

  async create(createCharacterDto: CreateCharacterDto): Promise<Character> {
    const character = this.characterRepository.create({
      ...createCharacterDto,
      user: { id: createCharacterDto.userId },
      created_at: new Date(),
      lastAgingTime: new Date(),
    });
    return await this.characterRepository.save(character);
  }

  async findOne(id: number, userId: number): Promise<Character> {
    const character = await this.characterRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['sect']
    });
    if (character?.sect) {
      character.sect = { id: character.sect.id } as any;
    }
    return {
      ...character
    }
  }

  async update(id: number, updateCharacterDto: UpdateCharacterDto): Promise<Character> {
    await this.characterRepository.update(id, {
      ...updateCharacterDto,
      user: { id: updateCharacterDto.userId }, // 将数字ID转换为User对象
    });
    return this.findOne(id, updateCharacterDto.userId);
  }

  async levelUp(id: number, userId: number): Promise<Character> {
    const character = await this.findOne(id, userId);
    character.level += 1;
    return await this.characterRepository.save(character);
  }

  async gainExperience(id: number, amount: number, userId: number): Promise<Character> {
    const character = await this.findOne(id, userId);
    character.experience += amount;
    return await this.characterRepository.save(character);
  }
}
