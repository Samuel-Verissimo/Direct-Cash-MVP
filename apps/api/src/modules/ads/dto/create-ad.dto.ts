import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdFormat } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAdDto {
  @ApiProperty({ example: 'Anúncio de Verão', minLength: 3, maxLength: 100 })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title!: string;

  @ApiPropertyOptional({ example: 'Promoção especial de verão' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({ example: 'https://example.com/landing' })
  @IsUrl()
  targetUrl!: string;

  @ApiPropertyOptional({ enum: AdFormat, default: AdFormat.BANNER })
  @IsOptional()
  @IsEnum(AdFormat)
  format?: AdFormat;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
