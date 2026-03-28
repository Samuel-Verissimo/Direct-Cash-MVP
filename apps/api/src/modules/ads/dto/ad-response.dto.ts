import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdFormat } from '@prisma/client';

export class AdResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiPropertyOptional()
  imageUrl?: string | null;

  @ApiProperty()
  targetUrl!: string;

  @ApiProperty({ enum: AdFormat })
  format!: AdFormat;

  @ApiProperty()
  impressions!: number;

  @ApiProperty()
  clicks!: number;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  campaignId!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
