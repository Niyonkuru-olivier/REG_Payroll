import { IsInt, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBranchDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  company_id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  branch_code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  branch_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address_line1: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  country?: string;
}
