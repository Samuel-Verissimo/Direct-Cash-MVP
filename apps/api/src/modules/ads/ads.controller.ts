import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Ad } from '@prisma/client';
import {
  CurrentUser,
  type JwtPayload,
} from '../../common/decorators/current-user.decorator.js';
import { AdsService } from './ads.service.js';
import { CreateAdDto } from './dto/create-ad.dto.js';
import { UpdateAdDto } from './dto/update-ad.dto.js';
import { AdResponseDto } from './dto/ad-response.dto.js';

@ApiTags('ads')
@ApiBearerAuth()
@Controller('campaigns/:campaignId/ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar anúncios da campanha' })
  @ApiResponse({ status: 200, type: [AdResponseDto] })
  findAll(
    @Param('campaignId') campaignId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<Ad[]> {
    return this.adsService.findAll(campaignId, user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Criar anúncio na campanha' })
  @ApiResponse({ status: 201, type: AdResponseDto })
  create(
    @Param('campaignId') campaignId: string,
    @Body() dto: CreateAdDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<Ad> {
    return this.adsService.create(campaignId, dto, user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar anúncio' })
  @ApiResponse({ status: 200, type: AdResponseDto })
  update(
    @Param('campaignId') campaignId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAdDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<Ad> {
    return this.adsService.update(campaignId, id, dto, user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar anúncio' })
  @ApiResponse({ status: 204, description: 'Anúncio deletado' })
  remove(
    @Param('campaignId') campaignId: string,
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.adsService.remove(campaignId, id, user.sub);
  }
}
