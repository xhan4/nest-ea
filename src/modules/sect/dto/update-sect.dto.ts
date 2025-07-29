import { PartialType } from '@nestjs/mapped-types';
import { CreateSectDto } from './create-sect.dto';

export class UpdateSectDto extends PartialType(CreateSectDto) {}
