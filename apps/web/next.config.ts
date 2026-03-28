import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // output standalone gera um servidor Node.js autossuficiente para Docker
  // sem precisar da node_modules completa na imagem de produção
  output: 'standalone',
};

export default withNextIntl(nextConfig);
