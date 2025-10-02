# 宝可梦图鉴 (Pokémon Pokédex) 🐱

这是一个基于 [Expo](https://expo.dev) 和 React Native 开发的宝可梦图鉴移动应用，使用 [PokeAPI](https://pokeapi.co/) 获取宝可梦数据。

## 功能特性

- 📋 浏览所有宝可梦 - 无限滚动列表，显示宝可梦序号、中英文名称、类型
- 📄 宝可梦详情 - 展示详细信息包括属性、特性、种族值、进化链等
- 🔗 进化链 - 显示完整的进化链和进化条件（等级、道具、快乐度等）
- 🌗 深色模式 - 支持自动切换深色/浅色主题
- 📱 响应式设计 - 适配不同屏幕尺寸的移动设备

## 技术栈

- [React Native](https://reactnative.dev/) - 跨平台移动应用开发框架
- [Expo](https://expo.dev/) - React Native 开发工具链
- [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集，提供类型安全
- [PokeAPI](https://pokeapi.co/) - 宝可梦数据来源
- [React Navigation](https://reactnavigation.org/) - 导航解决方案

## 开始使用

1. 安装依赖

   ```bash
   pnpm install
   ```

2. 启动应用

   ```bash
   npx expo start
   ```

在输出中，您可以选择以下方式打开应用：

- [开发构建](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android 模拟器](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS 模拟器](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go) - 用于尝试应用开发的有限沙盒

您可以通过编辑 **app** 目录中的文件开始开发。此项目使用 [基于文件的路由](https://docs.expo.dev/router/introduction)。

## 项目结构

```
app/                    # 应用页面
├── (tabs)/            # 底部标签页
│   ├── index.tsx      # 首页 - 宝可梦列表
│   └── explore.tsx    # 关于页面
├── pokemon/[id].tsx   # 宝可梦详情页
└── _layout.tsx        # 应用根布局
components/            # 公共组件
services/              # API服务
types/                 # TypeScript类型定义
constants/             # 主题和配置常量
hooks/                 # 自定义React hooks
assets/                # 静态资源
docs/                  # 项目文档
```

## 开发指导

更多开发指导请查看 [CLAUDE.md](CLAUDE.md) 文件，其中包含详细的项目信息和开发最佳实践。
