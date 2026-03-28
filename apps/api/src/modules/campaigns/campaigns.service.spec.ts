import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CampaignsService } from './campaigns.service';

const userId = 'user-1';

const baseCampaign = {
  id: 'campaign-1',
  userId,
  name: 'Black Friday',
  description: null,
  budget: { toString: () => '1000' },
  spent: { toString: () => '100' },
  status: 'ACTIVE' as const,
  startDate: new Date('2026-01-01'),
  endDate: new Date('2026-01-31'),
  createdAt: new Date(),
  updatedAt: new Date(),
};

function createMockCampaignsRepository() {
  return {
    findAllPaginated: jest.fn(),
    findByIdAndUser: jest.fn(),
    findById: jest.fn(),
    findByIdWithAds: jest.fn(),
    findDuplicateName: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}

describe('CampaignsService', () => {
  let service: CampaignsService;
  let campaignsRepo: ReturnType<typeof createMockCampaignsRepository>;

  beforeEach(async () => {
    campaignsRepo = createMockCampaignsRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignsService,
        { provide: 'CAMPAIGNS_REPOSITORY', useValue: campaignsRepo },
      ],
    }).compile();

    service = module.get<CampaignsService>(CampaignsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto = {
      name: 'New Campaign',
      budget: 500,
      startDate: '2026-02-01',
      endDate: '2026-03-01',
      status: 'DRAFT' as const,
    };

    it('throws BadRequestException when endDate <= startDate', async () => {
      await expect(
        service.create(
          { ...dto, startDate: '2026-03-01', endDate: '2026-02-01' },
          userId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException when campaign name already exists', async () => {
      campaignsRepo.findDuplicateName.mockResolvedValue(baseCampaign);

      await expect(service.create(dto, userId)).rejects.toThrow(
        ConflictException,
      );
    });

    it('creates and returns campaign on success', async () => {
      campaignsRepo.findDuplicateName.mockResolvedValue(null);
      campaignsRepo.create.mockResolvedValue(baseCampaign);

      const result = await service.create(dto, userId);

      expect(campaignsRepo.create).toHaveBeenCalledTimes(1);
      expect(result.id).toBe(baseCampaign.id);
    });
  });

  describe('findAll', () => {
    it('returns paginated campaigns for the user', async () => {
      campaignsRepo.findAllPaginated.mockResolvedValue({
        data: [baseCampaign],
        total: 1,
      });

      const result = await service.findAll({}, userId);

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('filters by status when provided', async () => {
      campaignsRepo.findAllPaginated.mockResolvedValue({
        data: [],
        total: 0,
      });

      await service.findAll({ status: 'ACTIVE' }, userId);

      const firstCallArg = (
        campaignsRepo.findAllPaginated.mock.calls as Array<[unknown]>
      )[0]?.[0];
      expect(firstCallArg).toMatchObject({ status: 'ACTIVE' });
    });

    it('applies search filter when provided', async () => {
      campaignsRepo.findAllPaginated.mockResolvedValue({
        data: [],
        total: 0,
      });

      await service.findAll({ search: 'black friday' }, userId);

      const firstCallArg = (
        campaignsRepo.findAllPaginated.mock.calls as Array<[unknown]>
      )[0]?.[0];
      expect(firstCallArg).toMatchObject({ search: 'black friday' });
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when campaign does not exist', async () => {
      campaignsRepo.findByIdAndUser.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns campaign when found', async () => {
      campaignsRepo.findByIdAndUser.mockResolvedValue(baseCampaign);

      const result = await service.findOne(baseCampaign.id, userId);

      expect(result.id).toBe(baseCampaign.id);
    });
  });

  describe('update', () => {
    it('throws ConflictException on duplicate name', async () => {
      campaignsRepo.findByIdAndUser.mockResolvedValue(baseCampaign);
      campaignsRepo.findDuplicateName.mockResolvedValue({
        ...baseCampaign,
        id: 'other-campaign',
      });

      await expect(
        service.update(baseCampaign.id, { name: 'Existing Name' }, userId),
      ).rejects.toThrow(ConflictException);
    });

    it('throws BadRequestException when both dates provided and endDate <= startDate', async () => {
      campaignsRepo.findByIdAndUser.mockResolvedValue(baseCampaign);

      await expect(
        service.update(
          baseCampaign.id,
          { startDate: '2026-03-01', endDate: '2026-02-01' },
          userId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('updates and returns campaign on success', async () => {
      const updated = { ...baseCampaign, name: 'Updated Name' };
      campaignsRepo.findByIdAndUser.mockResolvedValue(baseCampaign);
      campaignsRepo.findDuplicateName.mockResolvedValue(null);
      campaignsRepo.update.mockResolvedValue(updated);

      const result = await service.update(
        baseCampaign.id,
        { name: 'Updated Name' },
        userId,
      );

      expect(result.name).toBe('Updated Name');
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when campaign does not exist', async () => {
      campaignsRepo.findById.mockResolvedValue(null);

      await expect(service.remove('nonexistent', userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException when campaign belongs to another user', async () => {
      campaignsRepo.findById.mockResolvedValue({
        ...baseCampaign,
        userId: 'other-user',
      });

      await expect(service.remove(baseCampaign.id, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('deletes campaign on success', async () => {
      campaignsRepo.findById.mockResolvedValue(baseCampaign);
      campaignsRepo.delete.mockResolvedValue(undefined);

      await service.remove(baseCampaign.id, userId);

      expect(campaignsRepo.delete).toHaveBeenCalledWith(baseCampaign.id);
    });
  });

  describe('getStats', () => {
    it('throws NotFoundException when campaign does not exist', async () => {
      campaignsRepo.findByIdWithAds.mockResolvedValue(null);

      await expect(service.getStats('nonexistent', userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('computes CTR, budgetUsed, and budgetRemaining correctly', async () => {
      const campaignWithAds = {
        ...baseCampaign,
        ads: [
          { isActive: true, impressions: 1000, clicks: 50 },
          { isActive: false, impressions: 500, clicks: 10 },
        ],
      };
      campaignsRepo.findByIdWithAds.mockResolvedValue(campaignWithAds);

      const stats = await service.getStats(baseCampaign.id, userId);

      expect(stats.totalAds).toBe(2);
      expect(stats.activeAds).toBe(1);
      expect(stats.totalImpressions).toBe(1500);
      expect(stats.totalClicks).toBe(60);
      expect(stats.ctr).toBe(4);
      expect(stats.budgetUsed).toBe(100);
      expect(stats.budgetRemaining).toBe(900);
    });

    it('returns ctr of 0 when there are no impressions', async () => {
      const campaignNoImpressions = {
        ...baseCampaign,
        ads: [{ isActive: true, impressions: 0, clicks: 0 }],
      };
      campaignsRepo.findByIdWithAds.mockResolvedValue(campaignNoImpressions);

      const stats = await service.getStats(baseCampaign.id, userId);

      expect(stats.ctr).toBe(0);
    });
  });
});
