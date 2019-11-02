# Rust系列（一）：从零开始

## Windows安装

1. 官网[https://www.rust-lang.org/zh-CN/tools/install](https://www.rust-lang.org/zh-CN/tools/install)安装`rust-init.exe`

2. 国内环境直接安装会很慢甚至超时，需要增加两个环境变量

    `RUSTUP_DIST_SERVER=https://mirrors.tuna.tsinghua.edu.cn/rustup`

    `RUSTUP_UPDATE_ROOT=http://mirrors.ustc.edu.cn/rust-static/rustup`

3. 验证是否安装成功 `rustc --version`

4. crates镜像

    类似npm的镜像，提高下依赖时的速度，在`C:\Users\Administrator\.cargo`里新建`config`文件

    ```bash
    [source.crates-io]
    registry = "https://github.com/rust-lang/crates.io-index"
    replace-with = 'ustc'
    [source.ustc]
    registry = "git://mirrors.ustc.edu.cn/crates.io-index"
    ```

## 新建项目

1. 编译

    新建`hello_world.rs`文件

    ```rs
    fn main() {
      printn!("Hello World!")
    }
    ```

    命令行执行`rustc hello_world.rs`，生成两个文件`hello_world.exe`和`hello_world.pdd`

2. 运行

    `.pdd`包含调试信息，执行`.exe`，输出`Hello World!`

## cargo 构建系统和包管理器

初始化项目

```bash
cargo new hello_cargo
cd hello_cargo
```

```bash
| .gitignore
| Cargo.toml
\---.git
\---src
    main.rs
```

通过 Cargo 构建

```bash
cargo build
```

发布构建

```bash
cargo build --release
```

编译并运行

```bash
cargo run
```

检查代码确保可编译

```bash
cargo check
```

更新依赖版本

```bash
# 只更新小版本 修改Cargo.lock文件
cargo update
```

生成当前依赖的文档

```bash
cargo doc --open
```

---

## 基础

几乎所有编程语言都共通的概念

### 变量和可变性

`let` 声明变量，默认不可变；`let mut`声明的变量可变

`const` 声明常量

`shadowing`: 隐藏，多次定义同名变量，实际上创建了新的变量，可改变类型

`mut`: 未创建新变量，无法改变类型

### 数据类型

数据类型 = 标量 scalar + 复合 compound

标量 = 整型 + 浮点型 + 布尔类型 + 字符类型

复合 = 元祖 tuple + 数组 array

#### 整型

默认`i32`

范围`-2^(n - 1) 或 0 到 2(n - 1) - 1`

| 长度 | 有符号 | 无符号 | 大小 |
| -- | -- | -- | -- |
| 8-bit | i8 | u8 | 128 |
| 16-bit | i16 | u16 | 32768 |
| 32-bit | i32 | u32 | 2147483648 |
| 64-bit | i64 | u64 | 9223372036854776000 |
| arch | isize | usize | |

`arch`依赖计算机机构，32或64

| 数字字面值 | 例子 |
| -- | -- |
| Decimal | 98__222 |
| Hex | 0xff |
| Octal | 0o77 |
| Binary | 0b1111_0000 |
| Byte (u8 only) | b'A' |

除`byte`外，可加类型后缀，如`57u8`

可加`_`作分隔符，方便读数

整型溢出：`u8`存放`256`；`debug`模式编译时会`panic`退出；`release`构建时，进行二进制补码，`256`变`0`,`257`变`1`，类推

#### 浮点型

`f32` 和 `f64`（默认）

`IEEE-754`标准，和js一样会出现精度问题`0.1 + 0.2 = 0.30000000000000004`

#### 布尔型

`bool` = `true` + `false`

#### 字符类型

`char` 由单引号指定，字符串由双引号指定

大小四个字节，代表一个`Unicode`

#### 元祖

圆括号包裹，逗号分隔，各个元素类型可不同

可解构赋值

可通过`tuple.index`获取指定位置的元素

```rs
let tup: (i32, f64, u8) = (500, 6.4, 1);
let (x, y, z) = tup;
let x = tup.0
```

#### 数组

`[type; number]` 长度不可变，每个元素类型必须相同

```rs
let a: [i32; 5] = [1, 2, 3, 4, 5];
let first = a[0];
```

### 函数

`fn`声明，命名规范`snake_case`

函数参数必须声明类型

Rust 是一门基于表达式（expression-based）的语言

语句 Statements：执行操作，没有返回值，有`;`

表达式 Expressions：计算并产生值，没有`;`

宏调用、函数调用、`{}`都是表达式

```rs
let x = 5;
// y = 4
let y = {
    let x = 3;
    x + 1 // 没有; 返回4
};
```

函数的返回值 `->`声明类型

```rs
fn five() -> i32 {
    5
}

fn main() {
    let x = five();

    println!("The value of x is: {}", x);
}
```

### 控制流

`if` `loop` `while` `for`

---

## 所有权
