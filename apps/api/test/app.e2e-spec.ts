import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { initialisePlatformRegistries } from './../src/platform/initialise-platform-registries';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(() => initialisePlatformRegistries());

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET) returns the API status', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect({
      name: 'BusinessOS API',
      status: 'running',
    });
  });

  it('/health (GET) returns the health status', () => {
    return request(app.getHttpServer()).get('/health').expect(200).expect({
      status: 'ok',
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
