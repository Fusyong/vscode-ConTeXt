
# ConTeXt Syntax Plus

一个为ConTeXt文档提供语法高亮和大纲视图的VSCode扩展。

## 功能特性

- ✅ **语法高亮**：为ConTeXt文档提供完整的语法高亮支持
- ✅ **大纲视图**：自动生成文档大纲，支持多级标题结构
    - ✅ **自定义标题**：支持在设置中自定义各级标题的层级关系
    - ✅ **智能识别**：支持标准ConTeXt命令和自定义标题命令

## 支持的标题命令

### 标准ConTeXt标题
- `\part`, `\chapter`, `\section`, `\subsection` 等
- `\title`, `\subject`, `\subsubject` 等

### 自定义中文标题（可在设置中配置）
- `\bu` (部), `\zhang` (章), `\jie` (节) 等
- `\ce` (册), `\danyuan` (单元), `\kewen` (课文) 等

## 安装

### 从VSIX文件安装
1. 下载最新的 `.vsix` 文件
2. 在VSCode中按 `Ctrl+Shift+P` 打开命令面板
3. 输入 "Extensions: Install from VSIX..."
4. 选择下载的 `.vsix` 文件

### 从源码构建
1. 克隆仓库并进入目录
2. 安装依赖：
   ```bash
   npm install
   ```
3. 编译：
   ```bash
   npm run compile
   ```
4. 打包：
   ```bash
   vsce package
   ```

## 开发调试

```shell
# 安装依赖
npm install

# 编译项目
npm run compile

# 监听模式开发
npm run watch

# 代码检查
npm run lint

# 打包扩展
npm run package

# 运行测试
npm test
```

## 配置

在VSCode设置中搜索 "ConTeXt Grammar" 可以配置：

- **自定义标题级别**：为不同的标题命令设置层级（0-6级）

## 技术实现

基于以下项目：
- [context.tmbundle](https://github.com/pgundlach/context.tmbundle) - 语法定义
- [vscode-context-syntax](https://github.com/JulianGmp/vscode-context-syntax) - 基础实现

## 开发计划

- [ ] 支持 `\startmytitle` 环境
- [ ] 解析导入的文件和环境
- [ ] 添加更多ConTeXt命令的智能提示
- [ ] 支持代码片段（Snippets）

## 许可证

MIT License

