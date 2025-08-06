# 🏭 BarcodeSys - 仓库管理系统 | Warehouse Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.18.0-brightgreen)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-supported-blue)](https://www.docker.com/)

[English](#english) | [中文](#中文)

---

## 中文

一个专为小型企业和工厂设计的现代化仓库管理系统，支持库存管理、条码扫描、月度财务报表等功能。采用 Vue.js + Node.js + SQLite 技术栈构建。

### ✨ 核心功能

- **📦 库存管理**：产品管理、实时库存、低库存预警
- **🔄 出入库操作**：条码扫描、批量操作、详细记录
- **📊 月度账本**：财务报表、成本核算、Excel导出
- **📈 报表中心**：库存报告、交易统计、数据分析

### 🚀 快速开始

#### Docker 部署（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/GGPbadazz/SmallWareHouseManageSys.git
cd SmallWareHouseManageSys

# 2. 启动服务
docker-compose up -d

# 3. 访问应用
# 前端: http://localhost:8080
# 后端: http://localhost:3004
```

#### 本地开发

```bash
# 1. 安装后端依赖
cd server && npm install

# 2. 安装前端依赖
cd ../client && npm install

# 3. 启动后端服务
cd ../server && npm run dev

# 4. 启动前端服务
cd ../client && npm run dev
```

### 🛠 技术架构

- **前端**: Vue.js 3 + Vite + Pinia + Vue Router
- **后端**: Node.js + Express.js + SQLite + Better-SQLite3
- **部署**: Docker + Docker Compose + Nginx

### 📁 项目结构

```
SmallWareHouseManageSys/
├── client/              # 前端Vue.js应用
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── server/              # 后端Node.js应用
│   ├── routes/
│   ├── database/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml   # Docker编排文件
└── README.md
```

### 🔧 环境配置

1. 复制环境变量模板：
```bash
cp server/.env.example server/.env
```

2. 修改 `.env` 文件中的配置：
```env
JWT_SECRET=your-jwt-secret-key
ADMIN_PASSWORD=your-admin-password
```

### 📄 许可证

本项目采用 [MIT License](LICENSE) 开源许可证。

---

## English

A modern warehouse management system designed for small businesses and factories, supporting inventory management, barcode scanning, monthly financial reports, and more. Built with Vue.js + Node.js + SQLite technology stack.

### ✨ Core Features

- **📦 Inventory Management**: Product management, real-time inventory, low stock alerts
- **🔄 In/Out Operations**: Barcode scanning, batch operations, detailed records
- **📊 Monthly Ledger**: Financial reports, cost accounting, Excel export
- **📈 Reports Center**: Inventory reports, transaction statistics, data analysis

### 🚀 Quick Start

#### Docker Deployment (Recommended)

```bash
# 1. Clone the project
git clone https://github.com/GGPbadazz/SmallWareHouseManageSys.git
cd SmallWareHouseManageSys

# 2. Start with Docker Compose
docker-compose up -d

# 3. Access the application
# Frontend: http://localhost:8080
# Backend: http://localhost:3004
```

#### Local Development

```bash
# 1. Install backend dependencies
cd server && npm install

# 2. Install frontend dependencies
cd ../client && npm install

# 3. Start backend service
cd ../server && npm run dev

# 4. Start frontend service
cd ../client && npm run dev
```

### 🛠 Technical Architecture

- **Frontend**: Vue.js 3 + Vite + Pinia + Vue Router
- **Backend**: Node.js + Express.js + SQLite + Better-SQLite3
- **Deployment**: Docker + Docker Compose + Nginx

### 📁 Project Structure

```
SmallWareHouseManageSys/
├── client/              # Frontend Vue.js application
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── server/              # Backend Node.js application
│   ├── routes/
│   ├── database/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml   # Docker Compose file
└── README.md
```

### 🔧 Environment Setup

1. Copy environment template:
```bash
cp server/.env.example server/.env
```

2. Edit the `.env` file with your configurations:
```env
JWT_SECRET=your-jwt-secret-key
ADMIN_PASSWORD=your-admin-password
```

### 🌐 Features

- **🔐 User Authentication**: Secure login system
- **📱 Responsive Design**: Works on desktop and mobile devices
- **🌍 Internationalization Ready**: Supports multiple languages
- **🔧 Easy Deployment**: One-command Docker deployment
- **📊 Real-time Analytics**: Live inventory tracking and reports

### 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 📄 License

This project is licensed under the [MIT License](LICENSE).

---

⭐ **如果这个项目对您有帮助，请给我们一个Star！| If this project helps you, please give us a Star!** ⭐