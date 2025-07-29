import { Controller, Get, Post, Body, Param, Req, BadRequestException, Query } from '@nestjs/common';
import { SectService } from './sect.service';
import { CreateSectDto } from './dto/create-sect.dto';
import { UpdateSectDto } from './dto/update-sect.dto';

@Controller('sect')
export class SectController {
  constructor(private readonly sectService: SectService) { }

  @Post('create')
  create(@Body() createSectDto: CreateSectDto) {
    return this.sectService.create(createSectDto);
  }
  @Get('sect_list')
  getSectList() {
    return this.sectService.getSectList();
  }

  @Post('generate')
  async generateDisciples() {
    return this.sectService.generatePotentialDisciples();
  }

  @Get('pendings')
  getPendingMembers(@Query('sectId') sectId: string) {
    return this.sectService.findPendingMembers(+sectId);
  }

  @Get('members')
  getSectMembers(@Query('sectId') sectId: string) {
    return this.sectService.findSectMembers(+sectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sectService.findOne(+id);
  }

  @Post('update/:id')
  update(@Param('id') id: string, @Body() updateSectDto: UpdateSectDto) {
    return this.sectService.update(+id, updateSectDto);
  }

  @Post('process/:id')
  processDisciple(@Param('id') id: string, @Body("accept") accept: boolean) {
    return this.sectService.processDisciple(+id, accept);
  }

}
