import { Server } from 'http';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { RequestContext, setupContext } from '../../src';

describe('All in one', () => {
  let server: Server;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    setupContext(app);
    server = app.getHttpServer();
    await app.init();
  });

  it(`should works well`, () => {
    return request(server).get('/').expect(200, 'test');
  });

  it('should add x-request-id to response header', async () => {
    const res = await request(server).get('/').expect(200, 'test');
    expect(res.header['x-request-id']).not.toBeUndefined();
  });

  it('should response x-request-id shoule equal to request', async () => {
    const xReqId = 'xxxxx';
    const res = await request(server)
      .get('/')
      .set('x-request-id', xReqId)
      .expect(200, 'test');
    expect(res.header['x-request-id']).toBe(xReqId);
  });

  it('should got null when call currentRequest not in request scope', () => {
    expect(RequestContext.currentRequest()).toBeNull();
  });

  afterEach(async () => {
    await app.close();
  });
});
