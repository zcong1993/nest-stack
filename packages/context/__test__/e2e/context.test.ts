import { Server } from 'http';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupContext, RequestContext } from '../../src';
import { AppService } from '../src/app.service';

describe('All in one', () => {
  let server: Server;
  let app: INestApplication;
  let appService: AppService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    setupContext(app);
    server = app.getHttpServer();
    appService = module.get(AppService);
    await app.init();
  });

  it('should got x-request-id in service', async () => {
    let xRequestId: string;
    let xRequestId2: string;
    jest.spyOn(appService, 'getHello').mockImplementation(() => {
      xRequestId = RequestContext.currentRequestId();
      xRequestId2 = RequestContext.currentRequest().headers[
        'x-request-id'
      ] as string;
      return 'test';
    });
    await request(server).get('/').expect(200, 'test');
    expect(xRequestId).not.toBeUndefined();
    expect(xRequestId2).toBe(xRequestId);
  });

  it('should got x-request-id equal to request', async () => {
    const xReqId = 'xxxxx';
    let xRequestId: string;
    let xRequestId2: string;
    jest.spyOn(appService, 'getHello').mockImplementation(() => {
      xRequestId = RequestContext.currentRequestId();
      xRequestId2 = RequestContext.currentRequest().headers[
        'x-request-id'
      ] as string;
      return 'test';
    });

    await request(server).get('/').set('x-request-id', xReqId).expect(200);

    expect(xRequestId).toBe(xReqId);
    expect(xRequestId2).toBe(xReqId);
  });

  afterEach(async () => {
    await app.close();
  });
});
