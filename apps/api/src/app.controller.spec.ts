import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return the API status', () => {
      expect(appController.getRoot()).toEqual({
        name: 'BusinessOS API',
        status: 'running',
      });
    });

    it('should return health status', () => {
      expect(appController.getHealth()).toEqual({
        status: 'ok',
      });
    });
  });
});
