# 🏭 BarcodeSys - Warehouse Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.18.0-brightgreen)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-supported-blue)](https://www.docker.com/)

A modern warehouse management system designed for small businesses and factories, supporting inventory management, barcode scanning, monthly financial reports, and more. Built with Vue.js + Node.js + SQLite technology stack.

## ✨ Core Features

- **Inventory Management**: Product management, real-time inventory, low stock alerts
- **In/Out Operations**: Barcode scanning, batch operations, detailed records
- **Monthly Ledger**: Financial reports, cost accounting, Excel export
- **Reports Center**: Inventory reports, transaction statistics, data analysis

## 🚀 Quick Start

### Docker Deployment (Recommended)

```bash
# 1. Clone the project
git clone https://github.com/your-username/barcodesys.git
cd barcodesys

# 2. Start with Docker Compose
docker-compose up -d

# 3. Access the application
# Frontend: http://localhost:8080
# Backend: http://localhost:3004
```

### Local Development

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

## 🛠 Technical Architecture

**前端**: Vue.js 3 + Vite + Pinia + Vue Router  
**后端**: Node.js + Express.js + SQLite + Better-SQLite3  
**部署**: Docker + Docker Compose + Nginx  

## 📁 项目结构

```
SmallWareHouseManageSys/
├── client/          # 前端Vue.js应用
├── server/          # 后端Node.js应用
├── docker-compose.yml
└── README.md
```

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源许可证。

---

⭐ 如果这个项目对您有帮助，请给我们一个Star！⭐