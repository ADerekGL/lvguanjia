export default () => ({
  // 应用配置
  app: {
    name: process.env.APP_NAME || 'Smart Hotel Platform',
    port: parseInt(process.env.APP_PORT || '3000', 10) || 3000,
    wsPort: parseInt(process.env.WS_PORT || '3001', 10) || 3001,
    url: process.env.APP_URL || 'http://localhost:3000',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8080',
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // 数据库配置
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10) || 3306,
    username: process.env.DB_USERNAME || 'hotel_user',
    password: process.env.DB_PASSWORD || 'hotel_password',
    database: process.env.DB_DATABASE || 'smart_hotel',
    sync: process.env.DB_SYNC === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },

  // Redis 配置
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10) || 6379,
    password: process.env.REDIS_PASSWORD || 'redispassword',
    db: parseInt(process.env.REDIS_DB || '0', 10) || 0,
  },

  // JWT 配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your_super_secret_jwt_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // 微信配置
  wechat: {
    appid: process.env.WECHAT_APPID || '',
    secret: process.env.WECHAT_SECRET || '',
    redirectUrl: process.env.WECHAT_REDIRECT_URL || 'http://localhost:8080/auth/callback',
  },

  // AI 配置
  ai: {
    apiKey: process.env.ARK_API_KEY || '',
    modelId: process.env.ARK_MODEL_ID || 'doubao-1-5-pro-32k-250115',
    volcanoEndpoint: process.env.VOLCANO_ENDPOINT || 'ark.cn-beijing.volces.com',
    dailyLimitPerRoom: parseInt(process.env.AI_DAILY_LIMIT_PER_ROOM || '50', 10) || 50,
    cacheTtl: parseInt(process.env.AI_CACHE_TTL || '86400', 10) || 86400,
  },

  // 文件上传配置
  upload: {
    path: process.env.UPLOAD_PATH || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10) || 10485760, // 10MB
    allowedFileTypes: process.env.ALLOWED_FILE_TYPES
      ? process.env.ALLOWED_FILE_TYPES.split(',')
      : ['image/jpeg', 'image/png', 'image/gif', 'audio/mpeg'],
  },

  // 邮件配置
  mail: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10) || 587,
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.MAIL_FROM || 'noreply@smart-hotel.com',
  },

  // 支付配置
  payment: {
    alipay: {
      appId: process.env.ALIPAY_APP_ID || '',
      privateKey: (process.env.ALIPAY_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      publicKey: (process.env.ALIPAY_PUBLIC_KEY || '').replace(/\\n/g, '\n'),
      gateway: process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do',
      notifyUrl: process.env.ALIPAY_NOTIFY_URL || '',
      returnUrl: process.env.ALIPAY_RETURN_URL || '',
    },
    wxpay: {
      mchid: process.env.WXPAY_MCHID || '',
      apiKey: process.env.WXPAY_API_KEY || '',
      certPath: process.env.WXPAY_CERT_PATH || './certs/apiclient_cert.pem',
      keyPath: process.env.WXPAY_KEY_PATH || './certs/apiclient_key.pem',
    },
  },

  // 管理员配置
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123456',
  },

  // 监控配置
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN || '',
    prometheusPort: parseInt(process.env.PROMETHEUS_PORT || '9090', 10) || 9090,
  },

  // 功能开关
  features: {
    aiEnabled: process.env.FEATURE_AI_ENABLED === 'true',
    paymentEnabled: process.env.FEATURE_PAYMENT_ENABLED === 'true',
    wechatLoginEnabled: process.env.FEATURE_WECHAT_LOGIN === 'true',
  },

  // 限流配置
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10) || 60000,
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10) || 100,
  },
});