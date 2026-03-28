import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  GenerateCampaignDto,
  GenerateAdsDto,
  GeneratedCampaignDto,
  GeneratedAdDto,
} from './dto/ai.dto.js';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openai: OpenAI;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('app.openaiApiKey') ?? '';
    this.openai = new OpenAI({ apiKey });
  }

  async generateCampaign(
    dto: GenerateCampaignDto,
  ): Promise<GeneratedCampaignDto> {
    this.ensureApiKey();

    const systemPrompt = `Voce e um especialista em marketing digital e gestao de campanhas publicitarias.
O usuario vai te dar um breve descritivo em linguagem natural sobre o objetivo de uma campanha.
Responda APENAS com um JSON valido (sem markdown, sem backticks) no seguinte formato:
{
  "name": "nome curto e impactante para a campanha (max 60 chars)",
  "description": "descricao clara da campanha e seu objetivo (max 300 chars)",
  "suggestedBudget": <numero inteiro em reais, considerando o contexto>,
  "suggestedDurationDays": <numero inteiro de dias de duracao da campanha>,
  "reasoning": "breve justificativa das suas escolhas de budget e duracao (max 200 chars)"
}`;

    const raw = await this.callOpenAI(systemPrompt, dto.brief);
    return this.parseJson<GeneratedCampaignDto>(raw);
  }

  async generateAds(dto: GenerateAdsDto): Promise<GeneratedAdDto[]> {
    this.ensureApiKey();

    const count = dto.count ?? 3;
    const formatHint = dto.format
      ? `Todos os anuncios devem ser do formato: ${dto.format}.`
      : 'Escolha o formato mais adequado para cada anuncio (BANNER, VIDEO, CAROUSEL ou NATIVE).';

    const systemPrompt = `Voce e um especialista em criacao de anuncios digitais de alta performance.
Dado o nome e descricao de uma campanha, gere ${count} variante(s) de anuncio.
${formatHint}
Responda APENAS com um JSON valido (sem markdown, sem backticks) no seguinte formato:
{
  "ads": [
    {
      "title": "titulo do anuncio (max 60 chars)",
      "description": "texto do anuncio com call-to-action (max 150 chars)",
      "targetUrl": "URL de destino plausivel (ex: https://empresa.com/pagina)",
      "format": "BANNER | VIDEO | CAROUSEL | NATIVE"
    }
  ]
}`;

    const userMessage = `Campanha: ${dto.campaignName}\nDescricao: ${dto.campaignDescription}`;
    const raw = await this.callOpenAI(systemPrompt, userMessage);
    const parsed = this.parseJson<{ ads: GeneratedAdDto[] }>(raw);
    return parsed.ads;
  }

  private ensureApiKey(): void {
    const apiKey = this.config.get<string>('app.openaiApiKey');
    if (!apiKey || apiKey.trim() === '') {
      throw new ServiceUnavailableException(
        'O servico de IA nao esta configurado. Defina OPENAI_API_KEY no ambiente.',
      );
    }
  }

  private async callOpenAI(
    systemPrompt: string,
    userMessage: string,
  ): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Resposta vazia da OpenAI');
      }

      return content;
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        this.logger.error(
          `OpenAI API error: ${error.status} — ${error.message}`,
        );
        throw new BadGatewayException(
          `Erro na comunicacao com a IA: ${error.message}`,
        );
      }
      throw error;
    }
  }

  private parseJson<T>(raw: string): T {
    try {
      return JSON.parse(raw) as T;
    } catch {
      this.logger.error(`Falha ao fazer parse do JSON da IA: ${raw}`);
      throw new BadGatewayException('A IA retornou uma resposta inesperada.');
    }
  }
}
