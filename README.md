# 旅管家 / lvguanjia — 智慧酒店管家服务平台

基于 NestJS + React 的酒店智能管家系统，支持多酒店、实时聊天、在线商城、订单支付、客房服务和 AI 问答。

---

## 目录

- [项目结构](#项目结构)
- [本地开发快速启动（Docker Compose）](#本地开发快速启动)
- [手动启动（不使用 Docker）](#手动启动)
- [环境变量说明](#环境变量说明)
- [API 文档](#api-文档)
- [功能模块](#功能模块)
- [技术栈](#技术栈)

---

## 项目结构

```
lvguanjia/
├── server/          # NestJS 后端 API (port 3000)
├── web/             # 访客 H5 前端 (port 80)
├── admin/           # 酒店管理面板 (port 8081)
├── sysadmin/        # 系统管理面板 (port 8080)
├── docker/          # Nginx 配置
├── docker-compose.yml
└── README.md
```

---

## 本地开发快速启动

> **前提条件:** 已安装 [Docker Desktop](https://www.docker.com/products/docker-desktop/) >= 24.x

### 第一步：复制并填写环境变量

```bash
cp server/.env.example server/.env
```

打开 `server/.env`，至少修改以下字段（其余保持默认即可用于本地开发）：

| 变量 | 说明 |
|------|------|
| `JWT_SECRET` | 随机字符串，本地可用任意值，生产必须改 |
| `JWT_REFRESH_SECRET` | 同上 |
| `ADMIN_PASSWORD` | 系统管理员密码 |

> 第三方服务（微信、支付宝、AI）默认全部关闭（`FEATURE_*=false`），本地不需要填写。

### 第二步：一键启动所有服务

```bash
docker compose up -d
```

首次启动会拉取镜像并构建，约需 3–5 分钟。

### 第三步：验证启动

| 服务 | 地址 | 说明 |
|------|------|------|
| 访客 H5 | http://localhost | 扫描入住二维码后的访客界面 |
| 系统管理 | http://localhost:8080 | 系统管理员面板（创建酒店/房间） |
| 酒店管理 | http://localhost:8081 | 酒店管理员面板（入住/退房/服务） |
| API 服务 | http://localhost:3000 | NestJS 后端直接访问 |
| **Swagger UI** | http://localhost:3000/api-docs | 所有接口文档 |

### 第四步：初始化数据（首次）

1. 打开 http://localhost:8080，用 `ADMIN_USERNAME` / `ADMIN_PASSWORD` 登录
2. 在「酒店管理」页面点击「新建酒店」
3. 点击「初始化房间」，填写楼层数和每层房间数
4. 系统自动创建房间和默认服务类型

### 查看日志

```bash
# 所有服务
docker compose logs -f

# 仅后端
docker compose logs -f server
```

### 停止服务

```bash
docker compose down
```

> 数据持久化在 Docker volume（`mysql_data`, `redis_data`），`down` 不会删除数据。
> 如需清空数据库重新初始化：`docker compose down -v`

### 开启开发模式工具（phpMyAdmin）

```bash
docker compose --profile dev up -d
# phpMyAdmin: http://localhost:8082
```

---

## 手动启动（不使用 Docker）

> 需要本地已安装 Node.js >= 20、MySQL 8.0、Redis 7

```bash
# 1. 启动后端
cd server
cp .env.example .env   # 编辑 .env，填写本地 DB/Redis 连接信息
npm install
npm run start:dev      # 热重载开发模式，端口 3000

# 2. 启动访客前端
cd web
npm install
npm run dev            # Vite 开发服务器，端口 5173

# 3. 启动系统管理面板
cd sysadmin
npm install
npm run dev            # 端口 5174

# 4. 启动酒店管理面板
cd admin
npm install
npm run dev            # 端口 5175
```

---

## 环境变量说明

完整注释见 [`server/.env.example`](server/.env.example)。

### 必填（生产环境）

| 变量 | 说明 |
|------|------|
| `JWT_SECRET` | JWT 签名密钥，生产必须为随机长字符串 |
| `JWT_REFRESH_SECRET` | 刷新令牌密钥 |
| `ADMIN_PASSWORD` | 系统管理员密码 |
| `DB_PASSWORD` | MySQL 用户密码 |
| `DB_ROOT_PASSWORD` | MySQL root 密码 |
| `REDIS_PASSWORD` | Redis 密码 |

### 可选（启用对应功能时填写）

| 变量 | 功能 | 开关 |
|------|------|------|
| `WECHAT_APP_ID` / `WECHAT_APP_SECRET` | 微信登录 | `FEATURE_WECHAT_LOGIN=true` |
| `ALIPAY_APP_ID` 等 | 支付宝支付 | `FEATURE_PAYMENT_ENABLED=true` |
| `WECHAT_PAY_MCH_ID` 等 | 微信支付 | `FEATURE_PAYMENT_ENABLED=true` |
| `ARK_API_KEY` | AI 问答（豆包） | `FEATURE_AI_ENABLED=true` |

---

## API 文档

启动后访问 Swagger UI：**http://localhost:3000/api**

### 认证方式

所有需要认证的接口均使用 Bearer Token：

```
Authorization: Bearer <token>
```

### 获取 Token

| 角色 | 接口 |
|------|------|
| 访客（扫码入住） | `POST /auth/verify-checkin` |
| 酒店管理员 | `POST /auth/hotel-admin-login` |
| 系统管理员 | `POST /auth/admin-login` |
| 开发测试 | `POST /auth/dev-login` |

### 接口前缀说明

| 前缀 | 角色 | Guard |
|------|------|-------|
| `/auth/*` | 公开 / 所有角色 | ThrottlerGuard / JwtAuthGuard |
| `/sysadmin/*` | 系统管理员（role=3） | AdminAuthGuard |
| `/hotel-admin/*` | 酒店管理员（role=2） | HotelAdminAuthGuard |
| `/orders`, `/products`, `/services`, `/rooms` 等 | 已登录用户 | JwtAuthGuard |

---

## 功能模块

| 模块 | 状态 | 说明 |
|------|------|------|
| 用户认证 | 完成 | JWT + 入住验证 + 微信（需配置） |
| 多酒店管理 | 完成 | 系统管理员创建酒店，酒店管理员独立管理 |
| 房间管理 | 完成 | 入住/退房/状态流转 |
| 订单 | 完成 | 创建/支付/取消（含库存回滚） |
| 支付 | 部分 | 支付宝 H5（需密钥）；微信支付 stub |
| 客房服务 | 完成 | 提交/处理/Socket 实时通知 |
| 消息/聊天 | 完成 | WebSocket 双向通信 |
| 商品管理 | 完成 | CRUD + 图片上传 |
| AI 问答 | 部分 | 豆包 API（需 ARK_API_KEY） |
| OTA 同步 | 未开始 | Phase 2，Order 实体已预留字段 |

---

## 技术栈

- **后端**: NestJS 10 · TypeORM · MySQL 8 · Redis 7 · Socket.IO 4 · JWT
- **前端**: React 18 · Vite · TypeScript · Ant Design / Ant Design Mobile · Zustand
- **部署**: Docker Compose · Nginx
- **文档**: Swagger / OpenAPI 3
