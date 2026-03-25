# 智慧酒店管家服务平台

基于 AI 技术的酒店智能管家服务平台，提供实时聊天、在线商城、订单管理、客房服务等功能。

## 🚀 技术栈

### 后端
- **框架**: Nest.js 10.x + TypeScript 5.x
- **数据库**: MySQL 8.0 + TypeORM
- **缓存**: Redis 7.x
- **实时通信**: Socket.IO 4.x
- **认证**: JWT + 微信登录

### 前端
- **框架**: React 18.x + TypeScript 5.x
- **UI 组件**: Ant Design Mobile 5.x
- **状态管理**: Zustand 4.x
- **路由**: React Router 6.x

### 部署
- **容器化**: Docker + Docker Compose
- **编排**: Kubernetes (可选)
- **数据库**: MySQL 主从 + Redis 集群

## 📁 项目结构

```
├── server/              # 后端 Nest.js 应用
├── web/                 # 前端 React 应用
├── docker/              # Docker 配置文件
├── docs/                # 项目文档
├── scripts/             # 部署脚本
└── README.md            # 项目说明
```

## 🔧 快速开始

### 环境要求
- Node.js >= 20.x
- MySQL >= 8.0
- Redis >= 7.x
- Docker >= 24.x (可选)

### 开发环境设置

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd smart-hotel-platform
   ```

2. **启动后端服务**
   ```bash
   cd server
   npm install
   npm run start:dev
   ```

3. **启动前端应用**
   ```bash
   cd web
   npm install
   npm start
   ```

4. **使用 Docker Compose (推荐)**
   ```bash
   docker-compose up -d
   ```

## 📊 功能模块

### 核心功能
1. **用户管理**: 微信登录、用户信息管理
2. **房间管理**: 房间分配、状态管理
3. **实时聊天**: WebSocket 实时通信
4. **在线商城**: 商品浏览、下单支付
5. **客房服务**: 服务请求、进度跟踪
6. **订单管理**: 订单创建、支付、状态管理

### AI 能力
1. **智能问答**: 基于大模型的客服问答
2. **智能推荐**: 个性化商品推荐
3. **语义理解**: 用户意图识别

## 🔐 安全特性

- **房间隔离**: 每个房间数据严格隔离
- **JWT 认证**: 基于 Token 的身份验证
- **权限控制**: 角色-based 访问控制
- **输入验证**: 严格的参数验证

## 📈 性能优化

- **消息分区**: 按 room_id 分区存储海量消息
- **缓存策略**: Redis 缓存热点数据
- **连接池**: 数据库连接池管理
- **分表分库**: 大表分表存储

## 📝 开发指南

### 代码规范
- TypeScript 严格模式
- ESLint + Prettier 代码格式化
- Commitlint 提交规范
- Husky Git 钩子

### 测试策略
- 单元测试: Jest
- 集成测试: Supertest
- E2E 测试: Playwright
- 性能测试: k6

## 🚢 部署

### Docker 部署
```bash
docker-compose up -d
```

### Kubernetes 部署
```bash
kubectl apply -f k8s/
```

## 📄 许可证

MIT License