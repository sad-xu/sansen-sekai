# 初探Rust与WASM

## 准备

1. 先安装Rust工具链，详见“Rust系列（一）”

2. 安装`wasm-pack`，用于生成`wasm`

3. 安装`cargo-generate`，可通过git仓库作为模板快速创建项目
  
    `cargo install cargo-generate`

## 起步

克隆项目模板

`cargo generate --git https://github.com/rustwasm/wasm-pack-template`