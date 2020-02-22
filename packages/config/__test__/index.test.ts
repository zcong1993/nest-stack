import { Test, TestingModule } from '@nestjs/testing';
import { Module, Injectable } from '@nestjs/common';
import { ConfigService, ConfigModule } from '../src';

describe('ConfigService', () => {
  it('default config should works well', () => {
    const cfg: any = { name: 'default', k1: 'xxx1' };

    const cs = new ConfigService({
      default: () => cfg,
    });

    expect(cs.getConfig()).toEqual(cfg);
  });

  it('empty config should throw', () => {
    expect(() => new ConfigService({} as any)).toThrow();
  });

  it('every env config should works well', () => {
    const cfg: any = { name: 'default', k1: 'xxx1' };
    const local: any = { name: 'local', k2: 'xxx2' };
    const prod: any = { name: 'prod', k3: 'xxx3' };
    const test: any = { name: 'test', k4: 'xxx4' };

    const createEnvConfig = (env: string) => {
      process.env.NODE_ENV = env;
      return new ConfigService({
        default: () => cfg,
        local: () => local,
        prod: () => prod,
        test: () => test,
      });
    };

    expect(createEnvConfig('local').getConfig()).toEqual({
      name: 'local',
      k2: 'xxx2',
      k1: 'xxx1',
    });
    expect(createEnvConfig('prod').getConfig()).toEqual({
      name: 'prod',
      k3: 'xxx3',
      k1: 'xxx1',
    });
    expect(createEnvConfig('test').getConfig()).toEqual({
      name: 'test',
      k4: 'xxx4',
      k1: 'xxx1',
    });
  });
});

describe('Use in Nest app', () => {
  const cfg: any = { name: 'default', k1: 'xxx1' };

  @Injectable()
  class TestService {
    constructor(private readonly configService: ConfigService) {}

    config() {
      return this.configService.getConfig();
    }
  }

  @Module({
    imports: [
      ConfigModule.registry({
        default: () => cfg,
      }),
    ],
    providers: [TestService],
  })
  class TestModule {}

  it('use in nest app should works well', async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    const testService = app.get<TestService>(TestService);

    expect(testService.config()).toEqual(cfg);
  });
});
