import { PartialType } from '@nestjs/swagger';

import { CreateOfficeLocationDto } from './create-office-location.dto';

/** Body untuk PATCH /api/office-locations/:id - semua field opsional. */
export class UpdateOfficeLocationDto extends PartialType(
  CreateOfficeLocationDto,
) {}
