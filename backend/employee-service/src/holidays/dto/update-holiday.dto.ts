import { PartialType } from '@nestjs/swagger';

import { CreateHolidayDto } from './create-holiday.dto';

/** Body untuk PATCH /api/holidays/:id - semua field opsional. */
export class UpdateHolidayDto extends PartialType(CreateHolidayDto) {}
