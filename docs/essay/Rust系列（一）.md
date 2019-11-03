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

## 所有权 ownership

栈 stack：后进先出，类似js里基本类型存放的位置

堆 Heap：类似js里Object类型存放的位置，在堆上分配内存，返回指针

**目的**：

管理堆数据。跟踪哪部分代码正在使用堆上的哪些数据，最大限度的减少堆上的重复数据的数量，以及清理堆上不再使用的数据确保不会耗尽空间

**规则**：

1. Rust 中的每一个值都有一个被称为其 所有者（owner）的变量

2. 值有且只有一个所有者

3. 当所有者（变量）离开作用域，这个值将被丢弃

`char`类型，大小确定，且不可变，编译时内容确定，文本被硬编码进最终的可执行文件中；

`String`类型，可变的，不确定的文本片段，需要在堆上分配一块在编译时大小未知的内存，即

* 在运行时箱操作系统请求内存 `String::from`
* 需要一个处理完`String`时将内存返回给操作系统的方法

    1. 垃圾回收，自动回收，开发者无需关心
    2. 手动回收
    3. 在变量离开作用域后自动释放内存

```rs
{
    let s = String::from("hello"); // 从此处起，s 是有效的
    // 使用 s
}   // 此作用域已结束，自动调`drop`方法释放内存
    // s 不再有效
```

### 变量与数据的交互

`RAII(Resource Acquisition Is Initialization)`资源获取即初始化：C++中在生命周期结束时释放资源的模式

在复杂场景下的行为

#### 移动

类似js里对引用类型的复制，其实是对指针的操作，即浅拷贝

```rs
let s1 = String::from("hello");
let s2 = s1; // move移动，浅拷贝的同时使`s1`无效，内存的释放只看s2
```

#### 克隆

深复制

```rs
let s1 = String::from("hello");
let s2 = s1.clone();
```

存储在栈上的类型有一个叫做`Copy trait`的特殊注解，在将其赋值给其他变量后仍然可用

#### 所有权与函数

```rs
fn main() {
    let s = String::from("hello");  // s 进入作用域
    takes_ownership(s); // s 的值移动到函数里
    // s到这里不再有效
    let x = 5;  // x 进入作用域
    makes_copy(x);  // x 应该移动函数里，
    // 但 i32 是 Copy 的，所以在后面可继续使用 x
} // x 先移出了作用域，然后是 s。但因为 s 的值已被移走，所以不会有特殊操作

fn takes_ownership(some_string: String) { // some_string 进入作用域
    println!("{}", some_string);
} // some_string 移出作用域并调用 `drop` 方法。占用的内存被释放

fn makes_copy(some_integer: i32) { // some_integer 进入作用域
    println!("{}", some_integer);
} // some_integer 移出作用域。不会有特殊操作
```

#### 返回值与作用域

函数的返回值也可以转移所有权

```rs
fn main() {
    let s1 = gives_ownership(); // gives_ownership 将返回值移给 s1
    let s2 = String::from("hello"); // s2 进入作用域
    let s3 = takes_and_gives_back(s2);  // s2 被移动到takes_and_gives_back 中, 它也将返回值移给 s3
} // s3 移出作用域并被丢弃。s2 也移出作用域，但已被移走，所以什么也不会发生。s1 移出作用域并被丢弃

fn gives_ownership() -> String { // gives_ownership 将返回值移动给
    let some_string = String::from("hello"); // some_string 进入作用域.
    some_string // 返回 some_string 并移出给调用的函数
}

// takes_and_gives_back 将传入字符串并返回该值
fn takes_and_gives_back(a_string: String) -> String { // a_string 进入作用域
    a_string  // 返回 a_string 并移出给调用的函数
}
```

需求：函数使用一个值，但不想获取所有权，因为后面还要用，同时还需要函数返回一些其他值

### 引用 &

`&` 引用的值默认禁止修改

```rs
// $s1 -> s1 -> 堆内存
fn main() {
    let s1 = String::from("hello");
    let len = calculate_length(&s1);
    println!("The length of '{}' is {}.", s1, len);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}
```

**可变引用**：`&mut`

特定作用域中的特定数据有且只有一个可变引用，防止*数据竞争*

一个引用的作用域从声明的地方开始一直持续到最后一次使用为止

```rs
let mut s = String::from("hello");

let r1 = &s;
let r2 = &s;
println!("{} and {}", r1, r2);
// r1 和 r2 最后一次使用，作用域结束

let r3 = &mut s; // 作用域没有重叠，可声明可变引用
println!("{}", r3);
```

**悬垂指针（dangling pointer）**：其指向的内存被分配给其它持有者

```rs
fn dangle() -> &String {
    let s = String::from("hello");
    &s // 返回字符串 s 的引用
} // 这里 s 离开作用域并被丢弃。其内存被释放，&s为悬垂指针，此时应直接返回s，移出所有权，使s不被释放
```

### slice

**slice**：没有所有权的类型，是`String`中一部分值的引用

```rs
let s = String::from("hello world");
let hello = &s[0..5];   // [0, 5)
let hello = &s[...5];   // [0, 5)
let world = &s[6..=10]; // [6, 10]
```

## 结构体 struct
