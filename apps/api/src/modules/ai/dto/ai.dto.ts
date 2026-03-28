import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdFormat } from '@prisma/client';

export class GenerateCampaignDto {
  @ApiProperty({
    description: 'Breve descricao do objetivo da campanha em linguagem natural',
    example:
      'Quero anunciar minha padaria em Sao Paulo para o Dia das Maes com promocoes de bolos',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  brief: string;
}

export class GeneratedCampaignDto {
  @ApiProperty({ example: 'Dia das Maes — Padaria Feliz' })
  name: string;

  @ApiProperty({
    example:
      'Campanha sazonal voltada para clientes da regiao de SP para o Dia das Maes.',
  })
  description: string;

  @ApiProperty({ example: 3500, description: 'Orcamento sugerido em reais' })
  suggestedBudget: number;

  @ApiProperty({ example: 14, description: 'Duracao sugerida em dias' })
  suggestedDurationDays: number;

  @ApiProperty({
    example: 'Campanha sazonal de curto prazo com alto potencial de conversao.',
  })
  reasoning: string;
}

export class GenerateAdsDto {
  @ApiProperty({ example: 'Dia das Maes — Padaria Feliz' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  campaignName: string;

  @ApiProperty({
    example: 'Campanha sazonal para clientes de SP no Dia das Maes',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  campaignDescription: string;

  @ApiPropertyOptional({
    enum: AdFormat,
    example: AdFormat.BANNER,
    description:
      'Formato do anuncio. Se omitido, a IA escolhe o mais adequado.',
  })
  @IsOptional()
  @IsEnum(AdFormat)
  format?: AdFormat;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 5,
    example: 3,
    description: 'Quantidade de variantes a gerar (padrao: 3)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  count?: number;
}

export class GeneratedAdDto {
  @ApiProperty({ example: 'Bolos artesanais para o Dia das Maes' })
  title: string;

  @ApiProperty({
    example: 'Surpreenda com um bolo unico feito com amor. Encomende ja!',
  })
  description: string;

  @ApiProperty({ example: 'https://padaria.com.br/dia-das-maes' })
  targetUrl: string;

  @ApiProperty({ enum: AdFormat, example: AdFormat.BANNER })
  format: AdFormat;
}
