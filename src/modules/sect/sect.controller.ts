import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SectService } from './sect.service';
import { CreateSectDto } from './dto/create-sect.dto';
import { UpdateSectDto } from './dto/update-sect.dto';

@Controller('sect')
export class SectController {
  constructor(private readonly sectService: SectService) {}

  @Post()
  create(@Body() createSectDto: CreateSectDto) {
    return this.sectService.create(createSectDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sectService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSectDto: UpdateSectDto) {
    return this.sectService.update(+id, updateSectDto);
  }

}
