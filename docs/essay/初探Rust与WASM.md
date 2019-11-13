# 初试WASM与Rust

是什么 - 一个关于WebAssembly与js性能对比的demo

怎么做 - 通过Rust编译出wasm，wasm和js运行同样的函数对比执行时间

## 准备

1. 安装`rust-init.exe`

    国内环境直接安装会很慢甚至超时，需要增加两个环境变量

    `RUSTUP_DIST_SERVER=https://mirrors.tuna.tsinghua.edu.cn/rustup`

    `RUSTUP_UPDATE_ROOT=http://mirrors.ustc.edu.cn/rust-static/rustup`

    验证是否安装成功 `rustc --version`

2. crates镜像

    类似npm的镜像，提高下依赖时的速度，在`C:\Users\Administrator\.cargo`里新建`config`文件

    ```bash
    [source.crates-io]
    registry = "https://github.com/rust-lang/crates.io-index"
    replace-with = 'ustc'
    [source.ustc]
    registry = "git://mirrors.ustc.edu.cn/crates.io-index"
    ```

3. 安装`wasm-pack`，用于生成`wasm`

4. 安装`cargo-generate`，可通过git仓库作为模板快速创建项目
  
    `cargo install cargo-generate`

## 起步

克隆项目模板

`cargo generate --git https://github.com/rustwasm/wasm-pack-template`

```sh
wasm-demo/
├── Cargo.toml
└── src
    └── lib.rs
```

本Demo里有用的就两个文件

**Cargo.toml**：为Rust的包管理器和构建工具cargo指定依赖和元信息，类似`package.json`，模板内置了`wasm-bindgen`依赖，用于生成`.wasm`文件

**lib.rs**：会被编译为`.wasm`的根文件

## Rust部分

准备一个计算斐波那契数的函数

```rs
// lib.rs
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn fib(i: u32) -> u32 {
    match i {
        0 => 0,
        1 => 1,
        _ => fib(i-1) + fib(i-2)
    }
}
```

执行`wasm-pack build`，先把Rust代码编译成`.wasm`二进制文件，再通过`wasm-bindgen`生成js可调用的API

构建完成后在`/pkg`目录，本文里有用的就两个文件`wasm-demo.wasm`和`wasm-demo.js`

```js
// wasm-demo.js
import * as wasm from './wasm-demo.wasm';

/**
* @param {number} i
* @returns {number}
*/
export function fib(i) {
    const ret = wasm.fib(i);
    return ret >>> 0;
}
```

## JS部分

需要把生成的`wasm-demo.js`当做依赖引入

为了省去搭webpack的功夫，我直接用了`Vue-cli`的`vue serve`快速原型开发命令

需要注意的是，如果直接引入，会报`WebAssembly module is included in initial chunk.This is not allowed, because WebAssembly download and compilation must happen asynchronous.Add an async splitpoint (i. e. import()) somewhere between your entrypoint and the WebAssembly module:`这样的错误，需要通过`import()`做个中介，或是使用`fetch`先加载

```js
// APP.vue
import './bootstrap.js'

export default {
  created() {
    this.init()
  },
  methods: {
    init() {
      window.console.log('init')
    }
  }
}
```

```js
// bootstrap.js
import('./index.js')
```

```js
// index.js
import * as wasm from '../pkg/wasm_game_of_life.js'

function fib(n) {
 if (n === 0)  return 0
 if (n === 1)  return 1
 return fib(n - 1) + fib(n - 2)
}

let t1 = 0
let t2 = 0
let now = 0
for (let i = 10; i < 35; i++) {
  now = window.performance.now()
  wasm.fib(i)
  t1 = window.performance.now() - now

  now = window.performance.now()
  fib(i)
  t2 = window.performance.now() - now

  window.console.log(`index: ${i} t1: ${t1} t2: ${t2}`)
  window.console.log(`ratio: ${t2 / t1}`)
}
```

使用`performance`能得到较为精确的时间

## 对比

```
	wasm	js	比值
10	0.069999995	0.104999999	0.66666662
11	0.035000005	0.004999994	7.000008731
12	0.045000008	0.005000009	8.999985448
13	0.079999998	0.004999994	16.00001746
14	0.140000004	0.014999998	9.33333495
15	0.229999991	0.014999998	15.33333495
16	0.345000008	0.024999987	13.80000768
17	0.964999999	0.039999999	24.12500059
18	1.140000008	0.059999991	19.00000291
19	1.965000003	0.124999991	15.72000111
20	2.485000005	0.139999989	17.7500014
21	5.315000002	0.339999999	15.63235301
22	2.400000012	0.444999998	5.39325848
23	0.985000006	0.554999991	1.774774813
24	14.175	1.040000003	13.62980766
25	3.024999998	1.474999997	2.05084746
26	3.40999999	2.869999997	1.188153308
27	11.69	2.884999994	4.051993075
28	11.3	5.135000014	2.20058422
29	16.26	10.04499999	1.618715781
30	25.03999999	12.16500001	2.058364158
31	49.145	24.445	2.010431581
32	50.34	43.32	1.162049862
33	75.82499999	48.715	1.556502104
34	111.605	79.51	1.403659917
```

可以看到速度的提升非常明显，最高的能达到25倍，但随着执行时间的增加，速度的提高越不明显，但平均下来也能提高个1倍左右。唯一的特例是第一条，wasm反而比js慢，不过总执行时间太短了，可以忽略。

“如果有10%的利润，它就保证到处被使用；有20%的利润，它就活跃起来；有50%的利润，它就铤而走险；为了100%的利润，它就敢践踏一切人间法律；有300%的利润，它就敢犯任何罪行，甚至绞首的危险。”这句话放在代码里也挺适用的。

`web worker`，通过另开一个线程异步执行耗时的代码，防止阻塞，治标不治本；而wasm是直接提速，简单直接，就是用起来太麻烦了，涉及到其他语言。这两种方案都只针对js，然而真正耗时的dom操作，页面渲染这些都无法通过它们来提速。

之前看到国外一家公司做了一个网页版PS就用到了wasm，之后肯定会有越来越多的大型应用推出网页版。页面越做越复杂，wasm的应用场景只会越来越多，比如音视频转码，大数据展示分析，游戏，甚至挖矿。

”张华考上了北京大学；李萍进了中等技术学校；我在百货公司当售货员：我们都有光明的前途。“
