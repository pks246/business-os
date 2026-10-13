import { IsBoolean, IsIn, IsObject, IsOptional } from 'class-validator';
import type {
  ConfigObject,
  PartyRoleCaptureMode,
} from '../../platform/business-template';

export class UpdatePartyRolePolicyDto {
  @IsBoolean()
  enabled!: boolean;

  @IsIn(['optional', 'required'])
  captureMode!: PartyRoleCaptureMode;

  @IsOptional()
  @IsObject()
  settings?: ConfigObject;
}
