import { ApiProperty } from '@nestjs/swagger';

export class PaginatedMetaDto {
  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ isArray: true })
  data!: T[];

  @ApiProperty({ type: PaginatedMetaDto })
  meta!: PaginatedMetaDto;
}

export class CampaignStatsDto {
  @ApiProperty()
  totalAds!: number;

  @ApiProperty()
  activeAds!: number;

  @ApiProperty()
  totalImpressions!: number;

  @ApiProperty()
  totalClicks!: number;

  @ApiProperty()
  ctr!: number;

  @ApiProperty()
  budgetUsed!: number;

  @ApiProperty()
  budgetRemaining!: number;
}
