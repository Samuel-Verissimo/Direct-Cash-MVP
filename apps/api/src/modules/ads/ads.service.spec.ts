import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AdsService } from './ads.service';

const userId = 'user-1';
const campaignId = 'campaign-1';

const baseCampaign = {
  id: campaignId,
  userId,
  name: 'Test Campaign',
};

const baseAd = {
  id: 'ad-1',
  campaignId,
  title: 'Ad One',
  description: null,
  imageUrl: null,
  targetUrl: 'https://example.com',
  format: 'BANNER' as const,
  impressions: 0,
  clicks: 0,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function createMockAdsRepository() {
  return {
    findCampaignByIdAndUser: jest.fn(),
    findAllByCampaign: jest.fn(),
    findDuplicateTitle: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}

describe('AdsService', () => {
  let service: AdsService;
  let adsRepo: ReturnType<typeof createMockAdsRepository>;

  beforeEach(async () => {
    adsRepo = createMockAdsRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [AdsService, { provide: 'ADS_REPOSITORY', useValue: adsRepo }],
    }).compile();

    service = module.get<AdsService>(AdsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('throws NotFoundException when campaign does not belong to user', async () => {
      adsRepo.findCampaignByIdAndUser.mockResolvedValue(null);

      await expect(service.findAll(campaignId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns ads for valid campaign', async () => {
      adsRepo.findCampaignByIdAndUser.mockResolvedValue(baseCampaign);
      adsRepo.findAllByCampaign.mockResolvedValue([baseAd]);

      const result = await service.findAll(campaignId, userId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(baseAd.id);
    });
  });

  describe('create', () => {
    const dto = {
      title: 'New Ad',
      targetUrl: 'https://example.com',
      format: 'VIDEO' as const,
    };

    it('throws ConflictException on duplicate title within same campaign', async () => {
      adsRepo.findCampaignByIdAndUser.mockResolvedValue(baseCampaign);
      adsRepo.findDuplicateTitle.mockResolvedValue(baseAd);

      await expect(service.create(campaignId, dto, userId)).rejects.toThrow(
        ConflictException,
      );
    });

    it('creates and returns ad on success', async () => {
      const newAd = { ...baseAd, title: dto.title };
      adsRepo.findCampaignByIdAndUser.mockResolvedValue(baseCampaign);
      adsRepo.findDuplicateTitle.mockResolvedValue(null);
      adsRepo.create.mockResolvedValue(newAd);

      const result = await service.create(campaignId, dto, userId);

      expect(adsRepo.create).toHaveBeenCalledTimes(1);
      expect(result.title).toBe(dto.title);
    });
  });

  describe('update', () => {
    it('throws NotFoundException when ad does not exist', async () => {
      adsRepo.findCampaignByIdAndUser.mockResolvedValue(baseCampaign);
      adsRepo.findById.mockResolvedValue(null);

      await expect(
        service.update(campaignId, 'nonexistent', {}, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when ad belongs to a different campaign', async () => {
      adsRepo.findCampaignByIdAndUser.mockResolvedValue(baseCampaign);
      adsRepo.findById.mockResolvedValue({
        ...baseAd,
        campaignId: 'other-campaign',
      });

      await expect(
        service.update(campaignId, baseAd.id, {}, userId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when ad does not exist', async () => {
      adsRepo.findCampaignByIdAndUser.mockResolvedValue(baseCampaign);
      adsRepo.findById.mockResolvedValue(null);

      await expect(
        service.remove(campaignId, 'nonexistent', userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('deletes ad on success', async () => {
      adsRepo.findCampaignByIdAndUser.mockResolvedValue(baseCampaign);
      adsRepo.findById.mockResolvedValue(baseAd);
      adsRepo.delete.mockResolvedValue(undefined);

      await service.remove(campaignId, baseAd.id, userId);

      expect(adsRepo.delete).toHaveBeenCalledWith(baseAd.id);
    });
  });
});
