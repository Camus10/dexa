import { PartialType } from '@nestjs/swagger';

import { CreateEmployeeDto } from './create-employee.dto';

/** Body untuk PATCH /api/employees/:id - semua field opsional. */
export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}
