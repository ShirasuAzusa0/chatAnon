# ChatAnon 项目规范

## 技术栈

### 前端技术

- **开发语言**: TypeScript
- **构建工具**: Vite
- **框架**: React v19
- **样式设计**: Tailwind CSS 4.1
- **组件库**: shadcn/ui
- **状态管理**: Zustand
- **路由**: Data 式 React Router
- **包管理器**: pnpm

## 架构原则

### 1. MVVM 分层架构

- 严格实施 MVVM (Model-View-ViewModel) 分层架构
- 确保各层职责明确，边界清晰

### 2. React 最佳实践

- 使用函数式组件和 Hooks
- 避免不必要的重渲染
- 合理使用 React.memo、useCallback 和 useMemo
- 遵循单向数据流原则

### 3. 组件设计规范

- **保持组件精简**: 每个组件应专注于单一职责
- **避免创建过大的组件**: 组件过大时应拆分为多个小组件
- 组件应具有良好的可复用性和可测试性
- 使用组合而非继承扩展组件功能

### 4. 代码分层要求

- **Model 层**: 负责数据结构定义和数据操作
- **ViewModel 层**: 处理业务逻辑，连接 Model 和 View
- **View 层**: 负责 UI 渲染，不包含业务逻辑
- **严格禁止**:
  - 在 View 层直接操作 Model
  - 将业务逻辑混入 View 层
  - 各层逻辑混杂在一起

### 5. 类型安全要求

- **禁止使用 any 类型**: 所有变量、参数和返回值必须有明确类型定义
- **确保类型定义完整准确**: 使用接口和类型别名定义复杂数据结构
- 充分利用 TypeScript 的类型推断和类型保护功能
- 对外部数据进行类型验证和转换

## 文件组织结构

```
src/
├── assets/         # 静态资源
├── components/     # 共享UI组件
├── hooks/          # 自定义Hooks
├── lib/            # 工具函数和常量
├── models/         # 数据模型定义
├── pages/          # 页面组件
├── router/         # 路由配置
├── api/       # API服务
├── stores/         # Zustand状态管理
└── viewModels/     # ViewModel层
```

## 代码规范

### 命名规范

- **文件命名**: 使用 kebab-case (如: user-config.ts)
- **React组件文件命名**: 使用 PascalCase (如: UserProfile.tsx)
- **Stores文件命名**: 使用 camelCase (如: userStore.ts)
- **组件命名**: 使用 PascalCase (如: UserProfile)
- **函数/变量命名**: 使用 camelCase (如: getUserData)
- **常量命名**: 使用 UPPER_SNAKE_CASE (如: API_BASE_URL)
- **类型/接口命名**: 使用 PascalCase (如: UserData)

### 导入顺序

1. 外部库导入
2. 内部模块导入
3. 样式导入

### 注释规范

- 为复杂逻辑添加注释
- 使用 JSDoc 风格为函数添加文档
- 避免无意义的注释

## 性能优化准则

- 合理使用 React.memo、useCallback 和 useMemo
- 避免不必要的重渲染
- 实现代码分割和懒加载
- 优化大型列表渲染 (虚拟列表)
- 合理使用缓存策略

## 测试要求

- 编写单元测试覆盖核心业务逻辑
- 组件测试确保 UI 交互正常
- 集成测试验证功能流程

## 版本控制规范

- 遵循语义化版本控制
- 使用 Git Flow 工作流
- 提交信息遵循 Conventional Commits 规范
