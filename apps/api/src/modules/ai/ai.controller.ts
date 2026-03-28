import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AiService } from './ai.service.js';
import {
  GenerateAdsDto,
  GenerateCampaignDto,
  GeneratedAdDto,
  GeneratedCampaignDto,
} from './dto/ai.dto.js';

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-campaign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Gerar sugestao de campanha com IA',
    description:
      'Recebe um brief em linguagem natural e retorna nome, descricao, orcamento e duracao sugeridos pela IA.',
  })
  @ApiResponse({ status: 200, type: GeneratedCampaignDto })
  @ApiResponse({ status: 503, description: 'OPENAI_API_KEY nao configurada' })
  generateCampaign(
    @Body() dto: GenerateCampaignDto,
  ): Promise<GeneratedCampaignDto> {
    return this.aiService.generateCampaign(dto);
  }

  @Post('generate-ads')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Gerar variantes de anuncio com IA',
    description:
      'Dado o contexto de uma campanha, retorna variantes de anuncio com titulo, descricao e URL alvo.',
  })
  @ApiResponse({ status: 200, type: [GeneratedAdDto] })
  @ApiResponse({ status: 503, description: 'OPENAI_API_KEY nao configurada' })
  generateAds(@Body() dto: GenerateAdsDto): Promise<GeneratedAdDto[]> {
    return this.aiService.generateAds(dto);
  }
}
