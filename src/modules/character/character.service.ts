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
  ) {}

  async create(createCharacterDto: CreateCharacterDto): Promise<Character> {
    const character = this.characterRepository.create({
        ...createCharacterDto,
        user: { id: createCharacterDto.userId },
        created_at: new Date(),
        lastAgingTime: new Date(),
    });
    console.log(character,'character')
    return await this.characterRepository.save(character);
}

  async findOne(id: number): Promise<Character> {
    return await this.characterRepository.findOne({ 
      where: { id },
      relations: ['user', 'foundedSect', 'sectMembers']
    });
  }

  async update(id: number, updateCharacterDto: UpdateCharacterDto): Promise<Character> {
    await this.characterRepository.update(id,{
      ...updateCharacterDto,
      user: { id: updateCharacterDto.userId }, // 将数字ID转换为User对象
    });
    return this.findOne(id);
  }

  async levelUp(id: number): Promise<Character> {
    const character = await this.findOne(id);
    character.level += 1;
    return await this.characterRepository.save(character);
  }

  async gainExperience(id: number, amount: number): Promise<Character> {
    const character = await this.findOne(id);
    character.experience += amount;
    return await this.characterRepository.save(character);
  }
}
