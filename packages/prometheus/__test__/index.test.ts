import { Controller, Get, Query, Res } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { register } from 'prom-client';
import * as request from 'supertest';
import { Response } from 'express';
import { Config, setupProm } from '../src';

const clear = () => register.clear();

@Controller()
class TestController {
  @Get('/')
  test1(@Query() q: any, @Res() res: Response) {
    this.handler(q, res);
  }

  @Get('/test')
  test2(@Query() q: any, @Res() res: Response) {
    this.handler(q, res);
  }

  @Get('/regex/:id')
  test3(@Query() q: any, @Res() res: Response) {
    this.handler(q, res);
  }

  private handler(q: any, res: Response) {
    res.status((q.status && parseInt(q.status, 10)) || 200).json({
      code: q.code || 0,
      data: 'test',
    });
  }
}

const createApp = async (cfg?: Config) => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    controllers: [TestController],
  }).compile();

  const app = moduleFixture.createNestApplication();
  setupProm(app, cfg);
  await app.init();
  return app;
};

it('default config should work well', async () => {
  const app = await createApp();

  await request(app.getHttpServer()).get('/');
  await request(app.getHttpServer()).get('/regex/test');
  await request(app.getHttpServer()).get('/non-exists');
  await request(app.getHttpServer()).get('/?status=300');
  await request(app.getHttpServer()).get('/?status=400');

  const res = await request(app.getHttpServer()).get('/metrics');
  expect(res.status).toBe(200);
  // test collect default metrics
  expect(res.text).toMatch(/process_cpu_user_seconds_total/);
  expect(res.text).toMatch(/TYPE http_request_duration_ms histogram/);
  expect(res.text).toMatch(/status="200"/);
  expect(res.text).toMatch(/status="300"/);
  expect(res.text).toMatch(/status="400"/);
  expect(res.text).toMatch(/route="\/regex\/:id"/);

  clear();
});

it('custom config should work well', async () => {
  const config: Config = {
    metricsPath: '/customMetrics',
    collectDefaultMetrics: false,
    requestDurationUseHistogram: false,
    defaultLabels: {
      app: 'test',
    },
  };

  const app = await createApp(config);

  await request(app.getHttpServer()).get('/');
  await request(app.getHttpServer()).get('/test');

  const res = await request(app.getHttpServer()).get('/customMetrics');

  expect(res.status).toBe(200);
  expect(res.text).not.toMatch(/process_cpu_user_seconds_total/);
  expect(res.text).toMatch(/TYPE http_request_duration_ms summary/);
  expect(res.text).toMatch(/app="test"/);

  clear();
});

it('custom metric name should work well', async () => {
  const config: Config = {
    requestTotalMetricName: 'http_request_total_1',
    requestDurationMetricName: 'http_response_time_ms',
  };

  const app = await createApp(config);

  await request(app.getHttpServer()).get('/');
  await request(app.getHttpServer()).get('/test');

  const res = await request(app.getHttpServer()).get('/metrics');
  expect(res.status).toBe(200);

  expect(res.text).toMatch(/TYPE http_response_time_ms histogram/);
  expect(res.text).toMatch(/TYPE http_request_total_1 counter/);

  clear();
});
