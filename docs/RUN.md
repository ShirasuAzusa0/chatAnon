# 如何运行 ChatAnon 项目

## 后端

1. **安装依赖**:
   打开终端，进入 `backend` 目录，然后运行以下命令来安装所需的 Python 包：
   ```bash
   pip install flask flask-restful flask-sqlalchemy flask-cors
   ```

2. **运行后端服务**:
   在 `backend` 目录下，运行以下命令来启动后端服务：
   ```bash
   python main.py
   ```
   服务将会在 `http://127.0.0.1:5000` 上运行。

## 前端

1. **安装依赖**:
   打开终端，进入 `frontend` 目录，然后运行以下命令来安装项目依赖：
   ```bash
   pnpm install
   ```

2. **运行前端开发服务器**:
   在 `frontend` 目录下，运行以下命令来启动前端开发服务器：
   ```bash
   pnpm dev
   ```
   应用将会在 `http://localhost:5173` 上可用。