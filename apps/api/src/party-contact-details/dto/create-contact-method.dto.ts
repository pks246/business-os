import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateContactMethodDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  channel!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  value!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  label?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
