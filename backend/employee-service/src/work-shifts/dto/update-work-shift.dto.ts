import { PartialType } from '@nestjs/swagger';

import { CreateWorkShiftDto } from './create-work-shift.dto';

/** Body untuk PATCH /api/work-shifts/:id - semua field opsional. */
export class UpdateWorkShiftDto extends PartialType(CreateWorkShiftDto) {}
