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
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Campaign } from '@prisma/client';
import {
  CurrentUser,
  type JwtPayload,
} from '../../common/decorators/current-user.decorator.js';
import { CampaignsService } from './campaigns.service.js';
import { CreateCampaignDto } from './dto/create-campaign.dto.js';
import { UpdateCampaignDto } from './dto/update-campaign.dto.js';
import { CampaignQueryDto } from './dto/campaign-query.dto.js';
import {
  CampaignStatsDto,
  PaginatedResponseDto,
} from './dto/campaign-response.dto.js';

@ApiTags('campaigns')
@ApiBearerAuth()
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar campanha' })
  @ApiResponse({ status: 201, description: 'Campanha criada' })
  create(
    @Body() dto: CreateCampaignDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<Campaign> {
    return this.campaignsService.create(dto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Listar campanhas do usuário' })
  @ApiResponse({ status: 200, description: 'Lista paginada de campanhas' })
  findAll(
    @Query() query: CampaignQueryDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedResponseDto<Campaign>> {
    return this.campaignsService.findAll(query, user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar campanha por ID' })
  @ApiResponse({ status: 200, description: 'Campanha encontrada' })
  @ApiResponse({ status: 404, description: 'Campanha não encontrada' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<Campaign> {
    return this.campaignsService.findOne(id, user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar campanha' })
  @ApiResponse({ status: 200, description: 'Campanha atualizada' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<Campaign> {
    return this.campaignsService.update(id, dto, user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar campanha' })
  @ApiResponse({ status: 204, description: 'Campanha deletada' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.campaignsService.remove(id, user.sub);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Estatísticas da campanha' })
  @ApiResponse({ status: 200, type: CampaignStatsDto })
  getStats(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<CampaignStatsDto> {
    return this.campaignsService.getStats(id, user.sub);
  }
}
