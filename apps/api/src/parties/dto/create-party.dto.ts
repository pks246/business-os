import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { PartyType } from '../../generated/prisma/enums.js';

export class CreatePartyDto {
  @IsEnum(PartyType)
  type!: PartyType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  displayName!: string;
}
