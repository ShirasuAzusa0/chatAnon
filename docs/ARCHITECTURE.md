# ChatAnon 项目架构设计

## 1. 概述

ChatAnon 是一个前后端分离的匿名聊天应用程序。前端使用 React 和 Vite 构建，后端使用 Python 和 Flask 实现。

## 2. 技术选型

- **前端**:
  - **框架**: React
  - **构建工具**: Vite
  - **状态管理**: Zustand
  - **路由**: React Router
  - **UI 库**: Shadcn UI
  - **HTTP 客户端**: Axios

- **后端**:
  - **框架**: Flask, Flask-RESTful
  - **ORM**: SQLAlchemy
  - **数据库**: MySQL
  - **CORS**: Flask-Cors
  - **鉴权机制**: JWT token
  - **加密信息保护**: RSA

## 3. 模块规格

### 3.1 前端 (`frontend`)

- **`src/`**: 主要源代码目录。
  - **`api/`**: 包含与后端 API 端点交互的函数。
  - **`components/`**: 可重用的 React 组件。
    - **`ui/`**: Shadcn UI 组件。
  - **`hooks/`**: 自定义 React Hooks。
  - **`lib/`**: 辅助函数和工具函数。
  - **`pages/`**: 应用程序的主要页面组件。
  - **`router/`**: 路由配置。
  - **`stores/`**: Zustand 状态管理存储。

### 3.2 后端 (`backend`)

- **`commons/`**: 通用模块，如配置、令牌处理和密钥生成。
- **`models/`**: SQLAlchemy 数据库模型。
- **`resources/`**: Flask-RESTful API 资源，定义 API 端点。
- **`services/`**: 业务逻辑层，处理数据和与数据库交互。
- **`main.py`**: 应用程序入口点。

## 4. 分工

- **前端开发**:
  - 负责 `frontend` 目录下的所有开发工作。
  - 实现用户界面和用户体验。
  - 与后端 API 集成。

- **后端开发**:
  - 负责 `backend` 目录下的所有开发工作。
  - 设计和实现 RESTful API。
  - 数据库设计和管理。
  - 调用大模型与数据微调。
  - 实现业务逻辑和身份验证。
