import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(200)
      .then((response) => {
        const rawBody: unknown = response.body;
        const body = rawBody as {
          data: string;
          timestamp: string;
          path: string;
        };

        expect(body.data).toBe('Hello World!');
        expect(body.timestamp).toBeDefined();
        expect(body.path).toBe('/api');
      });
  });
});
