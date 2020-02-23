# `config`

> nestjs 配置模块

## Install

```bash
$ npm install @zcong/nest-stack-config --save
# or yarn
$ yarn add @zcong/nest-stack-config
```

## Usage

此模块与 eggjs 的配置模块类似

全局配置：

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@zcong/nest-stack-config';

interface Config {
  name: string;
  optinal?: number;
}

const defaultConfig = (): Config => ({ name: 'default' });
const localConfig = (): Config => ({ name: 'local', optinal: 1 });
const testConfig = (): Config => ({ name: 'test', optinal: 2 });
const prodConfig = (): Config => ({ name: 'prod', optinal: 3 });

@Module({
  imports: [
    ConfigModule.registry({
      default: defaultConfig,
      local: localConfig,
      testConfig: testConfig,
      prod: prodConfig,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

可以注入任何服务使用:

```ts
import { ConfigService } from '@zcong/nest-stack-config';

@Injectable()
class TestService {
  constructor(private readonly configService: ConfigService<Config>) {}

  test() {
    // get config
    this.configService.getConfig();
  }
}
```

不同 `NODE_ENV` 会获取不同配置, 配置均会和 default 配置使用 [extend2](https://github.com/eggjs/extend2) merge:

1. local 默认环境，会加载 local config merge default config
2. prod 环境，会加载 prod config merge default config
3. test 环境，会加载 test config merge default config
