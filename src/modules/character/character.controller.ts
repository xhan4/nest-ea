import { Controller, Get, Post, Body, Patch, Param, Req } from '@nestjs/common';
import { CharacterService } from './character.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';

@Controller('character')
export class CharacterController {
  constructor(private readonly characterService: CharacterService) { }

  @Post('create')
  create(@Body() createCharacterDto: CreateCharacterDto, @Req() req) {
    const userId = req.user.id;
    createCharacterDto.userId = userId
    return this.characterService.create(createCharacterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.characterService.findOne(+id);
  }

  @Post('update/:id')
  update(@Param('id') id: string, @Body() updateCharacterDto: UpdateCharacterDto,@Req() req) {
    const userId = req.user.id;
    updateCharacterDto.userId = userId
    return this.characterService.update(+id, updateCharacterDto);
  }
}
