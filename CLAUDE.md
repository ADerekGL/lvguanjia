# Project: lvguanjia

## Session History

### 2026-03-25
- User asked to write session history into CLAUDE.md and remember it
- CLAUDE.md was found empty; initialized with session history
- Memory file at `C:/Users/阿格兰·赛尔江/.claude/projects/d--lvguanjia/memory/MEMORY.md` did not exist yet

### 2026-03-26
- Built check-in management system (admin registers guests, guests verify with room + phone last 4)
- Built sysadmin panel at d:/lvguanjia/sysadmin/; fixed icon imports across web pages; created production roadmap
- Completed all Priority 1 security tasks:
  - Implemented `adminLogin()` in auth.service.ts (username+password from config, auto-creates admin user record)
  - Added admin login page (Login.tsx) to sysadmin panel with JWT localStorage + 401 auto-redirect
  - Added RequireAuth wrapper in App.tsx protecting all layout routes
  - Added logout button to Layout.tsx
  - Added ThrottlerGuard to POST /auth/verify-checkin (5 req/60s brute-force protection)
  - Added ADMIN_USERNAME/ADMIN_PASSWORD to server/.env
- Completed all Priority 2 infrastructure tasks:
  - Fixed server/Dockerfile (devDeps in builder stage, prod-only in runner)
  - Created web/Dockerfile and sysadmin/Dockerfile (Vite build → nginx)
  - Rewrote docker-compose.yml: all secrets via env vars, added sysadmin service, removed dev-only services to `dev` profile
  - Updated docker/nginx/conf.d/default.conf: :80→web, :8080→sysadmin, /api+/socket.io→server
  - Created .github/workflows/deploy.yml: builds 3 Docker images, pushes to Docker Hub, SSH deploys
  - Created server/.env.example with production template
- Completed all Priority 3 multi-hotel & QR code tasks:
  - `verifyCheckin` now accepts optional hotelId (POST body)
  - Added GET /admin/hotels/:id/qrcode endpoint (qrcode npm, returns data URI)
  - Guest Login.tsx reads ?hotelId from URL and passes to API
  - Sysadmin Hotels.tsx has QR code button → modal with PNG display + download
- Completed all Priority 4 payment tasks:
  - Rewrote payment.service.ts: Alipay H5 (alipay-sdk) when FEATURE_PAYMENT_ENABLED=true, mock otherwise
  - Added POST /payment/alipay-notify webhook with signature verification
  - Added GET /payment/receipt/:orderId returning structured receipt
  - Orders.tsx: pay button redirects to Alipay URL; receipt button opens modal
  - Added ALIPAY_* env vars to server/.env and configuration.ts
- Completed all Priority 5 WeChat OAuth tasks:
  - Added GET /auth/wechat-oauth (redirects to WeChat authorization page)
  - Added GET /auth/wechat-callback (exchanges code → openid, creates user, redirects with JWT)
  - wechatLogin() now accepts optional hotelId to pre-link hotel
  - wechatLoginWithCode() uses real WeChat jscode2session when FEATURE_WECHAT_LOGIN=true
  - Created web/src/pages/WechatCallback.tsx (consumes ?token= from redirect)
  - App.tsx: added /auth-callback route
  - Login.tsx: detects WeChat browser (MicroMessenger UA), shows 微信一键登录 button
- Completed all Priority 6 notification tasks:
  - Added sendNotification(userId, event, payload) to SocketGateway
  - updateStatus() in service.service.ts emits 'service_update' via socket on status change
  - ServiceModule now imports SocketModule to get SocketGateway
  - web/src/services/socket.ts: added onServiceUpdate() subscription helper
  - MainLayout.tsx: connects socket on mount, shows badge on Service tab when unread updates exist
  - Service.tsx: subscribes to service_update, refreshes list, shows Toast and badge on history tab
- Completed all Priority 7 product image & management tasks:
  - Created upload controller (POST /upload/image, multer disk storage, AdminAuthGuard, 10MB/ext validation)
  - Switched to NestExpressApplication in main.ts, serves /uploads as static assets
  - AdminService: added getProducts/createProduct/updateProduct/deleteProduct (delegates to ProductService)
  - AdminController: added GET/POST/PUT/DELETE /admin/products
  - sysadmin Products.tsx: full CRUD with image upload, hotel filter
  - docker/nginx/conf.d: added /uploads/ proxy block with 30-day cache
- Completed all Priority 8 testing tasks:
  - server/src/modules/auth/auth.service.spec.ts: 6 unit tests for verifyCheckin
  - server/src/modules/admin/admin.service.spec.ts: unit tests for getStats, createHotel, getProducts
  - server/src/modules/payment/payment.service.spec.ts: unit tests for createPayment, confirmPayment, getReceipt
  - server/src/modules/service/service.service.spec.ts: unit tests for createRequest, updateStatus (socket emission), findByRoom, getServiceTypes

### 2026-03-29
- Performed API completeness audit across all 13 controllers
- Fixed critical security: added AdminAuthGuard to POST /rooms and POST/PUT/DELETE /products
- Added source + externalOrderNo nullable fields to Order entity (Phase 2 OTA reservation)
- Fixed GET /services/all hotelId hardcode — now reads from JWT context
- Fixed order cancel to restore stock atomically in a transaction
- Added POST /payment/wechat-notify stub + handleWechatNotify() service method
- Updated server/.env.example with Alipay and WeChat Pay env vars
- Full Swagger annotation pass: ApiOperation + ApiResponse + ApiParam/ApiQuery/ApiBody on all controllers
- Created typed DTOs: auth.dto.ts (VerifyCheckinDto/AdminLoginDto/DevLoginDto), order.dto.ts, payment.dto.ts, service.dto.ts, room.dto.ts
- Rewrote README.md: Docker Compose local-dev quickstart, env var table, API auth guide

### 2026-03-28
- Implemented PRD: Admin Architecture Fix - Dual Backend System
- Backend: hotel-admin module already existed; added product CRUD + checkin/checkout endpoints to hotel-admin.service.ts and hotel-admin.controller.ts
- Backend: AdminController already renamed to /sysadmin/* prefix; HotelAdminController uses /hotel-admin/* prefix with HotelAdminAuthGuard (role=2)
- Frontend admin/: rewrote api.ts to call /hotel-admin/* with JWT auth + 401 auto-redirect; added RequireAuth wrapper + /login route to App.tsx; added logout button to Layout.tsx
- Frontend admin/pages/: updated Dashboard.tsx to use statsApi; updated Rooms.tsx to use hotel-admin roomApi (status update only, no create); updated Users.tsx to use hotel-admin userApi; fixed Orders/Services data parsing
- Docker: added admin service to docker-compose.yml; added port 8081 expose; rewrote nginx default.conf cleanly with 3 server blocks (80/8080/8081)

### 2026-03-29
- Performed API completeness audit across all 13 controllers
- Fixed critical security: added AdminAuthGuard to POST /rooms and POST/PUT/DELETE /products
- Added source + externalOrderNo nullable fields to Order entity (Phase 2 OTA reservation)
- Fixed GET /services/all hotelId hardcode — now reads from JWT context
- Fixed order cancel to restore stock atomically in a transaction
- Added POST /payment/wechat-notify stub + handleWechatNotify() service method
- Updated server/.env.example with Alipay and WeChat Pay env vars
- Full Swagger annotation pass: ApiOperation + ApiResponse + ApiParam/ApiQuery/ApiBody on all controllers
- Created typed DTOs: auth.dto.ts, order.dto.ts, payment.dto.ts, service.dto.ts, room.dto.ts
- Rewrote README.md: Docker Compose local-dev quickstart, env var table, API auth guide
- Unblocked AI module: updated ARK_MODEL_ID to doubao-1-5-pro-32k-250115 (doubao-pro-4k was invalid)
- Fixed configuration.ts ai section key names (apiKey/modelId) to match ai.service.ts
- Added server/.dockerignore; added AI + feature flag env vars to docker-compose.yml server section
- Added REDIS_PASSWORD + ARK vars to root d:/lvguanjia/.env
- Confirmed live AI end-to-end: POST /api/ai/ask returns real Volcengine responses (cached:false, real tokens)

### 2026-03-29 (session 2) — Subscription/Billing System
- Created 3 TypeORM entities: Plan, Subscription, SubscriptionOrder (auto-synced via entity glob)
- Created SubscriptionService: plan CRUD, getActiveSubscription, hasFeature, grantSubscription, cancelSubscription, initiatePurchase (Alipay mock/real), handleSubscriptionPaid, seedPlans
- Created PlanGuard (CanActivate) + @RequireFeature('ai') decorator — returns 403 + upgradeUrl on no entitlement
- Applied PlanGuard + @RequireFeature('ai') to POST /ai/ask, POST /ai/recommendations, GET /ai/faq
- Created SysadminSubscriptionController: GET/POST /sysadmin/plans, PUT /sysadmin/plans/:id, GET /sysadmin/subscriptions (paginated), GET/POST /sysadmin/subscriptions/:hotelId(/grant), PUT /sysadmin/subscriptions/:id/cancel, POST /sysadmin/plans/seed
- Created HotelAdminSubscriptionController: GET /hotel-admin/subscription, GET /hotel-admin/subscription/plans, POST /hotel-admin/subscription/upgrade, GET /hotel-admin/subscription/orders
- SubscriptionModule exports SubscriptionService + PlanGuard; imports JwtModule for HotelAdminAuthGuard
- Wired SubscriptionModule into AiModule, PaymentModule, AppModule
- Updated PaymentService.handleAlipayNotify to route SUB-prefixed tradeNos to SubscriptionService.handleSubscriptionPaid
- Enterprise plan purchase returns 400 with sales contact message (stub)
- TypeScript tsc --noEmit: 0 errors
