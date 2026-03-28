import { PrismaClient, CampaignStatus, AdFormat, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  await prisma.ad.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.user.deleteMany();

  // ── Usuários ──────────────────────────────────────────────────────────────
  const [adminUser, regularUser] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@directcash.com',
        name: 'Admin DirectCash',
        passwordHash: await bcrypt.hash('Admin@123456', 10),
        role: Role.ADMIN,
      },
    }),
    prisma.user.create({
      data: {
        email: 'joao@directcash.com',
        name: 'Joao Veríssimo',
        passwordHash: await bcrypt.hash('User@123456', 10),
        role: Role.USER,
      },
    }),
  ]);

  console.log(`✅ Usuários criados: ${adminUser.email}, ${regularUser.email}`);

  // ── Campanhas do admin ────────────────────────────────────────────────────
  const now = new Date();
  const d = (offsetDays: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() + offsetDays);
    return date;
  };

  const adminCampaigns = await Promise.all([
    prisma.campaign.create({
      data: {
        name: 'Black Friday 2026 — Eletronicos',
        description:
          'Campanha sazonal de alto impacto para o periodo de Black Friday, focada em eletronicos e gadgets.',
        status: CampaignStatus.ACTIVE,
        budget: 45000.0,
        spent: 12300.5,
        startDate: d(-5),
        endDate: d(25),
        userId: adminUser.id,
      },
    }),
    prisma.campaign.create({
      data: {
        name: 'Lancamento App DirectCash',
        description:
          'Campanha de awareness para o lancamento do aplicativo mobile DirectCash em todo o Brasil.',
        status: CampaignStatus.ACTIVE,
        budget: 80000.0,
        spent: 31500.0,
        startDate: d(-15),
        endDate: d(45),
        userId: adminUser.id,
      },
    }),
    prisma.campaign.create({
      data: {
        name: 'Retargeting Q1 — Usuarios Inativos',
        description:
          'Reengajamento de usuarios que nao acessam a plataforma ha mais de 30 dias.',
        status: CampaignStatus.PAUSED,
        budget: 15000.0,
        spent: 7200.0,
        startDate: d(-30),
        endDate: d(10),
        userId: adminUser.id,
      },
    }),
    prisma.campaign.create({
      data: {
        name: 'Teste A/B — Copy de Onboarding',
        description: 'Campanha experimental para testar diferentes abordagens de texto no fluxo de onboarding.',
        status: CampaignStatus.DRAFT,
        budget: 5000.0,
        spent: 0,
        startDate: d(7),
        endDate: d(21),
        userId: adminUser.id,
      },
    }),
  ]);

  // ── Campanhas do usuario regular ──────────────────────────────────────────
  const userCampaigns = await Promise.all([
    prisma.campaign.create({
      data: {
        name: 'Dia das Maes — Flores e Presentes',
        description:
          'Campanha sazonal voltada para o Dia das Maes com foco em e-commerce de flores e produtos personalizados.',
        status: CampaignStatus.COMPLETED,
        budget: 12000.0,
        spent: 11850.0,
        startDate: d(-60),
        endDate: d(-30),
        userId: regularUser.id,
      },
    }),
    prisma.campaign.create({
      data: {
        name: 'Captacao de Leads — Curso Online',
        description:
          'Campanha de performance para captacao de leads qualificados para um curso online de financas pessoais.',
        status: CampaignStatus.ACTIVE,
        budget: 8500.0,
        spent: 3200.0,
        startDate: d(-7),
        endDate: d(23),
        userId: regularUser.id,
      },
    }),
    prisma.campaign.create({
      data: {
        name: 'Brand Awareness — Startup Fintech',
        description:
          'Campanha de reconhecimento de marca para uma fintech de pagamentos voltada para MEIs.',
        status: CampaignStatus.DRAFT,
        budget: 20000.0,
        spent: 0,
        startDate: d(14),
        endDate: d(44),
        userId: regularUser.id,
      },
    }),
  ]);

  console.log(
    `✅ Campanhas criadas: ${adminCampaigns.length} (admin) + ${userCampaigns.length} (user)`,
  );

  // ── Anúncios ──────────────────────────────────────────────────────────────
  const ads = await Promise.all([
    prisma.ad.create({
      data: {
        title: 'Black Friday — ate 70% OFF em Eletronicos',
        description: 'Ofertas imperdíveis so hoje. Clique e garanta o seu!',
        imageUrl: 'https://placehold.co/1200x628/0f172a/ffffff?text=Black+Friday',
        targetUrl: 'https://directcash.com/black-friday',
        format: AdFormat.BANNER,
        impressions: 125400,
        clicks: 4820,
        isActive: true,
        campaignId: adminCampaigns[0].id,
      },
    }),
    prisma.ad.create({
      data: {
        title: 'Smartphone X15 — Preco de Black Friday',
        description: 'O melhor smartphone do ano com o menor preco do mercado.',
        imageUrl: 'https://placehold.co/1080x1080/0f172a/ffffff?text=X15+Pro',
        targetUrl: 'https://directcash.com/black-friday/smartphone',
        format: AdFormat.CAROUSEL,
        impressions: 98700,
        clicks: 5120,
        isActive: true,
        campaignId: adminCampaigns[0].id,
      },
    }),
    prisma.ad.create({
      data: {
        title: 'Descubra o DirectCash',
        description: 'Gerencie suas financas com inteligencia. Baixe gratis!',
        imageUrl: 'https://placehold.co/1200x628/14532d/ffffff?text=DirectCash+App',
        targetUrl: 'https://directcash.com/download',
        format: AdFormat.VIDEO,
        impressions: 210000,
        clicks: 8900,
        isActive: true,
        campaignId: adminCampaigns[1].id,
      },
    }),
    prisma.ad.create({
      data: {
        title: 'DirectCash — Seu dinheiro no controle',
        description: 'Mais de 50 mil usuarios confiam no DirectCash.',
        imageUrl: 'https://placehold.co/1200x628/1e3a5f/ffffff?text=DirectCash+Social',
        targetUrl: 'https://directcash.com/sobre',
        format: AdFormat.NATIVE,
        impressions: 180500,
        clicks: 7200,
        isActive: true,
        campaignId: adminCampaigns[1].id,
      },
    }),
    // Campanha de leads do user
    prisma.ad.create({
      data: {
        title: 'Aprenda a investir do zero',
        description:
          'Curso completo de financas pessoais. Vagas limitadas — inscreva-se agora!',
        imageUrl: 'https://placehold.co/1200x628/4c1d95/ffffff?text=Curso+Financas',
        targetUrl: 'https://cursodefinancas.com.br/landing',
        format: AdFormat.BANNER,
        impressions: 45200,
        clicks: 2340,
        isActive: true,
        campaignId: userCampaigns[1].id,
      },
    }),
    prisma.ad.create({
      data: {
        title: 'Sua reserva de emergencia em 90 dias',
        description: 'Metodo simples e comprovado. Comece hoje!',
        imageUrl: null,
        targetUrl: 'https://cursodefinancas.com.br/reserva',
        format: AdFormat.CAROUSEL,
        impressions: 32100,
        clicks: 1870,
        isActive: true,
        campaignId: userCampaigns[1].id,
      },
    }),
  ]);

  console.log(`✅ Anuncios criados: ${ads.length}`);

  console.log('\n🎉 Seed concluido com sucesso!\n');
  console.log('──────────────────────────────────────────');
  console.log('Credenciais para acesso:');
  console.log('  Admin : admin@directcash.com  /  Admin@123456');
  console.log('  User  : joao@directcash.com   /  User@123456');
  console.log('──────────────────────────────────────────\n');
}

main()
  .catch((error) => {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
