# Telegram 邀请机器人

一个无服务器的 Telegram 机器人，用于通过唯一邀请链接跟踪用户邀请情况。

## 功能特点

- 为用户生成个人邀请链接（`/mylink`）
- 当用户通过邀请链接加入时，跟踪邀请记录
- 查看个人邀请统计和排名（`/status`）
- 查看邀请人数排行榜前十名（`/rank`）

## 环境要求

- Node.js 18+ 或 Bun 1.0+
- Telegram 机器人令牌（通过 [@BotFather](https://t.me/BotFather) 获取）
- Supabase 账户用于数据库存储

## 项目设置

1. 克隆此仓库
2. 使用 Bun 安装依赖：
   ```bash
   bun install
   ```
3. 通过复制 `.env.example` 创建 `.env` 文件：
   ```bash
   cp .env.example .env
   ```
4. 在 `.env` 文件中填写必要的环境变量：
   - `BOT_TOKEN`：来自 BotFather 的 Telegram 机器人令牌
   - `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`：Supabase 凭证

## 数据库设置

您需要在 Supabase 数据库中设置以下表：

### 用户表 (users)
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT,
  username TEXT,
  invite_count INTEGER DEFAULT 0,
  invite_link TEXT DEFAULT NULL
);
```

### 邀请记录表 (invites)
```sql
CREATE TABLE invites (
  invitee_id BIGINT PRIMARY KEY,
  inviter_id BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## 本地开发

在轮询模式下本地运行机器人：

```bash
bun dev
```

## 测试

运行所有测试：

```bash
bun test
```

运行特定测试：

```bash
# 运行存储服务测试
bun test:storage

# 运行链接生成器测试
bun test:link

# 运行集成测试
bun test:integration
```

## 部署

### 部署到 Vercel

1. 将代码推送到 GitHub 仓库
2. 在 Vercel 中导入仓库
3. 在 Vercel 控制面板中配置环境变量

### 部署到 AWS Worker 或其他无服务器平台

与 Vercel 类似，您需要：

1. 为无服务器函数配置平台
2. 设置环境变量
3. 部署应用程序

## 项目结构

```
├── src/                # 源代码目录
│   ├── types/          # 类型定义
│   ├── services/       # 服务层（存储等）
│   ├── utils/          # 工具函数
│   ├── bot.ts          # 机器人主逻辑
│   └── config.ts       # 配置加载
├── tests/              # 测试目录
├── index.ts            # 入口文件
├── .env.example        # 环境变量示例
└── README.md           # 英文文档
```

## 工作原理

1. 用户可以通过 `/mylink` 命令获取唯一的邀请链接
2. 当新用户通过邀请链接加入时，系统会将邀请记录到邀请者名下
3. 邀请者可以通过 `/status` 命令查看自己邀请的人数和排名
4. 所有用户可以通过 `/rank` 命令查看邀请排行榜

## 贡献

欢迎提交问题和拉取请求！请确保遵循现有的代码风格和测试覆盖要求。

## 协议

MIT 