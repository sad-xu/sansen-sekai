# Rust系列（二）

## 模块系统

**作用域**：代码所在的嵌套上下文有一组定义为`in scope`的名称

模块系统：包，Crates，模块和use，路径

### 包 package 和 crate

**crate**：一个二进制项或库，以`crate root`源文件为起点

**包**：提供一系列功能的一个或多个crate，`Cargo.toml`文件描述如何构建crate

`cargo new my-package` 创建包

### 模块

将`crate`中的代码分组

`cargo new --lib name`


