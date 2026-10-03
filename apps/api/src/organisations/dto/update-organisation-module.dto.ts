import { IsBoolean, IsObject, IsOptional } from 'class-validator';
import type { ConfigObject } from '../../platform/business-template';

export class UpdateOrganisationModuleDto {
  @IsBoolean()
  enabled!: boolean;

  @IsOptional()
  @IsObject()
  settings?: ConfigObject;
}
