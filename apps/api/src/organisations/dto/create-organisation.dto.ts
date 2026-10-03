import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateOrganisationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsNotEmpty()
  templateId!: string;
}
