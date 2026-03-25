# 智慧酒店管家服务平台 - 数据库 ER 图设计

**版本**: V1.0  
**设计日期**: 2026-03-30  
**设计人**: AI 当前  
**协作人**: Ray（后端）

---

## 📊 核心实体关系图

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Hotel     │       │    User     │       │    Room     │
│   酒店表     │       │    用户表    │       │    房间表    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │◄──────│ hotel_id    │       │ hotel_id    │
│ name        │       │ id          │──────►│ id          │
│ address     │       │ name        │       │ room_number │
│ phone       │       │ phone       │       │ floor       │
│ status      │       │ role        │       │ type        │
└─────────────┘       │ room_id     │       │ status      │
                      │ avatar      │       │ price       │
                      │ created_at  │       └─────────────┘
                      └─────────────┘
                             │
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
     ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
     │   Message   │ │   Order     │ │   Service   │
     │   消息表     │ │   订单表     │ │   服务请求表  │
     ├─────────────┤ ├─────────────┤ ├─────────────┤
     │ id          │ │ id          │ │ id          │
     │ room_id     │ │ user_id     │ │ room_id     │
     │ sender_id   │ │ order_no    │ │ user_id     │
     │ receiver_id │ │ total_amount│ │ type        │
     │ content     │ │ status      │ │ status      │
     │ type        │ │ created_at  │ │ description │
     │ created_at  │ └─────────────┘ │ created_at  │
     └─────────────┘                 └─────────────┘
```

---

## 📋 表结构设计

### 1. Hotel（酒店表）

| 字段 | 类型 | 长度 | 必填 | 默认值 | 说明 |
|------|------|------|------|--------|------|
| id | BIGINT | - | YES | AUTO_INC | 主键 ID |
| name | VARCHAR | 100 | YES | - | 酒店名称 |
| address | VARCHAR | 255 | YES | - | 酒店地址 |
| phone | VARCHAR | 20 | NO | - | 联系电话 |
| email | VARCHAR | 100 | NO | - | 邮箱 |
| city | VARCHAR | 50 | NO | - | 城市 |
| province | VARCHAR | 50 | NO | - | 省份 |
| status | TINYINT | 1 | YES | 1 | 状态：0-停业，1-营业 |
| created_at | DATETIME | - | YES | NOW() | 创建时间 |
| updated_at | DATETIME | - | YES | NOW() | 更新时间 |

**索引**:
- PRIMARY KEY (id)
- INDEX idx_status (status)

---

### 2. User（用户表）

| 字段 | 类型 | 长度 | 必填 | 默认值 | 说明 |
|------|------|------|------|--------|------|
| id | BIGINT | - | YES | AUTO_INC | 主键 ID |
| hotel_id | BIGINT | - | YES | - | 所属酒店 ID |
| room_id | BIGINT | - | NO | - | 关联房间 ID（客人） |
| openid | VARCHAR | 64 | YES | - | 微信 openid |
| unionid | VARCHAR | 64 | NO | - | 微信 unionid |
| name | VARCHAR | 50 | NO | - | 姓名 |
| phone | VARCHAR | 20 | NO | - | 手机号 |
| avatar | VARCHAR | 255 | NO | - | 头像 URL |
| role | TINYINT | 1 | YES | 1 | 角色：1-客人，2-管家，3-管理员 |
| status | TINYINT | 1 | YES | 1 | 状态：0-禁用，1-正常 |
| last_login_at | DATETIME | - | NO | - | 最后登录时间 |
| created_at | DATETIME | - | YES | NOW() | 创建时间 |
| updated_at | DATETIME | - | YES | NOW() | 更新时间 |

**索引**:
- PRIMARY KEY (id)
- UNIQUE KEY uk_openid (openid)
- INDEX idx_hotel_id (hotel_id)
- INDEX idx_room_id (room_id)
- INDEX idx_role (role)

---

### 3. Room（房间表）

| 字段 | 类型 | 长度 | 必填 | 默认值 | 说明 |
|------|------|------|------|--------|------|
| id | BIGINT | - | YES | AUTO_INC | 主键 ID |
| hotel_id | BIGINT | - | YES | - | 所属酒店 ID |
| floor | INT | - | YES | - | 楼层 |
| room_number | VARCHAR | 10 | YES | - | 房间号 |
| type | TINYINT | 1 | YES | 1 | 类型：1-标准间，2-大床房，3-套房 |
| status | TINYINT | 1 | YES | 1 | 状态：0-维修，1-空闲，2-入住 |
| price | DECIMAL | 10,2 | NO | - | 房价/天 |
| description | VARCHAR | 255 | NO | - | 房间描述 |
| created_at | DATETIME | - | YES | NOW() | 创建时间 |
| updated_at | DATETIME | - | YES | NOW() | 更新时间 |

**索引**:
- PRIMARY KEY (id)
- INDEX idx_hotel_id (hotel_id)
- UNIQUE KEY uk_hotel_room (hotel_id, room_number)
- INDEX idx_status (status)

---

### 4. Message（消息表）

| 字段 | 类型 | 长度 | 必填 | 默认值 | 说明 |
|------|------|------|------|--------|------|
| id | BIGINT | - | YES | AUTO_INC | 主键 ID |
| room_id | BIGINT | - | YES | - | 房间 ID（消息隔离） |
| sender_id | BIGINT | - | YES | - | 发送者 ID |
| receiver_id | BIGINT | - | NO | - | 接收者 ID（私聊） |
| content | TEXT | - | YES | - | 消息内容 |
| type | TINYINT | 1 | YES | 1 | 类型：1-文本，2-图片，3-语音，4-订单通知，5-服务通知 |
| is_read | TINYINT | 1 | YES | 0 | 是否已读：0-未读，1-已读 |
| created_at | DATETIME | - | YES | NOW() | 创建时间 |

**索引**:
- PRIMARY KEY (id)
- INDEX idx_room_id (room_id)
- INDEX idx_sender_id (sender_id)
- INDEX idx_receiver_id (receiver_id)
- INDEX idx_created_at (created_at)

**分区建议**: 按 room_id 分区，支持海量消息存储

---

### 5. Product（商品表）

| 字段 | 类型 | 长度 | 必填 | 默认值 | 说明 |
|------|------|------|------|--------|------|
| id | BIGINT | - | YES | AUTO_INC | 主键 ID |
| hotel_id | BIGINT | - | YES | - | 所属酒店 ID |
| name | VARCHAR | 100 | YES | - | 商品名称 |
| description | TEXT | - | NO | - | 商品描述 |
| price | DECIMAL | 10,2 | YES | - | 价格 |
| stock | INT | - | YES | 0 | 库存 |
| image | VARCHAR | 255 | NO | - | 商品图片 URL |
| category | VARCHAR | 50 | NO | - | 分类：零食、饮品、日用品 |
| status | TINYINT | 1 | YES | 1 | 状态：0-下架，1-上架 |
| created_at | DATETIME | - | YES | NOW() | 创建时间 |
| updated_at | DATETIME | - | YES | NOW() | 更新时间 |

**索引**:
- PRIMARY KEY (id)
- INDEX idx_hotel_id (hotel_id)
- INDEX idx_category (category)
- INDEX idx_status (status)

---

### 6. Order（订单表）

| 字段 | 类型 | 长度 | 必填 | 默认值 | 说明 |
|------|------|------|------|--------|------|
| id | BIGINT | - | YES | AUTO_INC | 主键 ID |
| hotel_id | BIGINT | - | YES | - | 所属酒店 ID |
| room_id | BIGINT | - | YES | - | 房间 ID |
| user_id | BIGINT | - | YES | - | 用户 ID |
| order_no | VARCHAR | 32 | YES | - | 订单号（唯一） |
| total_amount | DECIMAL | 10,2 | YES | - | 订单总额 |
| status | TINYINT | 1 | YES | 1 | 状态：1-待支付，2-已支付，3-配送中，4-已完成，5-已取消 |
| remark | VARCHAR | 255 | NO | - | 备注 |
| paid_at | DATETIME | - | NO | - | 支付时间 |
| completed_at | DATETIME | - | NO | - | 完成时间 |
| created_at | DATETIME | - | YES | NOW() | 创建时间 |
| updated_at | DATETIME | - | YES | NOW() | 更新时间 |

**索引**:
- PRIMARY KEY (id)
- UNIQUE KEY uk_order_no (order_no)
- INDEX idx_hotel_id (hotel_id)
- INDEX idx_room_id (room_id)
- INDEX idx_user_id (user_id)
- INDEX idx_status (status)

---

### 7. OrderItem（订单明细表）

| 字段 | 类型 | 长度 | 必填 | 默认值 | 说明 |
|------|------|------|------|--------|------|
| id | BIGINT | - | YES | AUTO_INC | 主键 ID |
| order_id | BIGINT | - | YES | - | 订单 ID |
| product_id | BIGINT | - | YES | - | 商品 ID |
| product_name | VARCHAR | 100 | YES | - | 商品名称（快照） |
| price | DECIMAL | 10,2 | YES | - | 单价（快照） |
| quantity | INT | - | YES | 1 | 数量 |
| subtotal | DECIMAL | 10,2 | YES | - | 小计 |
| created_at | DATETIME | - | YES | NOW() | 创建时间 |

**索引**:
- PRIMARY KEY (id)
- INDEX idx_order_id (order_id)

---

### 8. ServiceType（服务类型表）

| 字段 | 类型 | 长度 | 必填 | 默认值 | 说明 |
|------|------|------|------|--------|------|
| id | BIGINT | - | YES | AUTO_INC | 主键 ID |
| hotel_id | BIGINT | - | YES | - | 所属酒店 ID |
| name | VARCHAR | 50 | YES | - | 服务名称 |
| icon | VARCHAR | 255 | NO | - | 图标 URL |
| status | TINYINT | 1 | YES | 1 | 状态：0-禁用，1-启用 |
| sort | INT | - | YES | 0 | 排序 |
| created_at | DATETIME | - | YES | NOW() | 创建时间 |

**索引**:
- PRIMARY KEY (id)
- INDEX idx_hotel_id (hotel_id)

---

### 9. ServiceRequest（服务请求表）

| 字段 | 类型 | 长度 | 必填 | 默认值 | 说明 |
|------|------|------|------|--------|------|
| id | BIGINT | - | YES | AUTO_INC | 主键 ID |
| hotel_id | BIGINT | - | YES | - | 所属酒店 ID |
| room_id | BIGINT | - | YES | - | 房间 ID |
| user_id | BIGINT | - | YES | - | 用户 ID |
| type_id | BIGINT | - | YES | - | 服务类型 ID |
| description | TEXT | - | YES | - | 服务描述 |
| status | TINYINT | 1 | YES | 1 | 状态：1-待处理，2-处理中，3-已完成，4-已取消 |
| handler_id | BIGINT | - | NO | - | 处理人 ID（管家） |
| completed_at | DATETIME | - | NO | - | 完成时间 |
| created_at | DATETIME | - | YES | NOW() | 创建时间 |
| updated_at | DATETIME | - | YES | NOW() | 更新时间 |

**索引**:
- PRIMARY KEY (id)
- INDEX idx_hotel_id (hotel_id)
- INDEX idx_room_id (room_id)
- INDEX idx_status (status)

---

### 10. Payment（支付记录表）

| 字段 | 类型 | 长度 | 必填 | 默认值 | 说明 |
|------|------|------|------|--------|------|
| id | BIGINT | - | YES | AUTO_INC | 主键 ID |
| order_id | BIGINT | - | YES | - | 订单 ID |
| transaction_id | VARCHAR | 64 | YES | - | 微信交易号 |
| amount | DECIMAL | 10,2 | YES | - | 支付金额 |
| channel | TINYINT | 1 | YES | 1 | 支付渠道：1-微信支付，2-支付宝 |
| status | TINYINT | 1 | YES | 1 | 状态：0-失败，1-成功 |
| paid_at | DATETIME | - | YES | - | 支付时间 |
| created_at | DATETIME | - | YES | NOW() | 创建时间 |

**索引**:
- PRIMARY KEY (id)
- UNIQUE KEY uk_transaction_id (transaction_id)
- INDEX idx_order_id (order_id)

---

## 🔐 房间隔离设计

### 核心原则

**每个房间的数据严格隔离，客人只能访问自己房间的数据**

### 实现方案

1. **所有业务表必须包含 room_id 字段**
2. **所有查询必须带 room_id 条件**
3. **JWT Token 中携带 room_id**
4. **中间件自动校验 room_id**

### 中间件设计

```typescript
// RoomGuard 中间件伪代码
@Injectable()
export class RoomGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userRoomId = request.user.room_id;  // 从 JWT token 获取
    const requestedRoomId = request.params.room_id || request.body.room_id;
    
    // 严格校验：用户只能访问自己房间的资源
    if (userRoomId && userRoomId !== requestedRoomId) {
      throw new ForbiddenException('跨房间访问禁止');
    }
    
    // 自动注入 room_id 到查询条件
    if (userRoomId) {
      request.query.room_id = userRoomId;
    }
    
    return true;
  }
}
```

---

## 📈 数据库扩展性设计

### 1. 消息表分区

```sql
-- 按 room_id 分区，支持海量消息
ALTER TABLE message 
PARTITION BY HASH(room_id) 
PARTITIONS 100;
```

### 2. 订单表分表

```sql
-- 按 created_at 月份分表
CREATE TABLE order_202603 LIKE order;
CREATE TABLE order_202604 LIKE order;
```

### 3. 索引优化

- 所有外键字段建立索引
- 查询频繁的字段建立联合索引
- 避免在索引列上使用函数

---

## 📝 待确认事项

| 事项 | 说明 | 负责人 | 状态 |
|------|------|--------|------|
| 酒店多租户设计 | 是否支持连锁酒店 | Ray | 待确认 |
| 会员体系 | 是否需要会员等级表 | Ray | 待确认 |
| 优惠券系统 | 是否需要优惠券表 | Ray | 待确认 |
| 评价系统 | 是否需要评价表 | Ray | 待确认 |

---

## 📅 设计评审

| 阶段 | 日期 | 参与人 | 状态 |
|------|------|--------|------|
| 初稿完成 | 04-02 | AI 当前 | 🟡 进行中 |
| 技术评审 | 04-03 | Ray + AI 当前 | ⚪ 待评审 |
| 最终确认 | 04-05 | Ray + AI 当前 | ⚪ 待确认 |

---

*设计文档版本：V1.0*  
*最后更新：2026-03-30*
