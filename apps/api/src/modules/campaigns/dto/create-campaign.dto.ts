import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CampaignStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCampaignDto {
  @ApiProperty({ example: 'Campanha Verão 2026', minLength: 3, maxLength: 100 })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ example: 'Campanha para produtos de verão' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 5000.0, description: 'Orçamento em reais' })
  @IsPositive()
  budget!: number;

  @ApiProperty({ example: '2026-04-01T00:00:00Z' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-06-30T23:59:59Z' })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({ enum: CampaignStatus, default: CampaignStatus.DRAFT })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;
}
