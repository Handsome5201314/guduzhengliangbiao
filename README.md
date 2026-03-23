# 智能发育行为儿科量表评估系统

这是一个基于 Next.js 15+ (App Router)、Prisma (SQLite) 和 Gemini AI 构建的智能医疗量表评估系统，专为发育行为儿科设计。系统分为家长端、医生端和管理员端，通过 AI 辅助家长填写量表，并自动生成专业评估报告。

## ✨ 核心功能

- **多角色系统**：支持家长（患者）、医生、管理员三种角色。
- **AI 辅助填表**：集成 Gemini 3.1 Pro，在家长填写量表遇到困惑时，提供通俗易懂的解释和生活化场景类比。
- **智能评估报告**：基于填写的量表数据，自动生成结构化的评估报告，并支持导出为 PDF/图片。
- **医患匹配**：医生和家长可以进行双向绑定，方便医生查看和管理患者档案。
- **响应式设计**：采用 Tailwind CSS 和 Framer Motion，提供流畅的跨端用户体验。

## 🛠️ 技术栈

- **前端框架**: Next.js 15+ (App Router), React 19
- **样式与动画**: Tailwind CSS, Framer Motion, Lucide React
- **数据库与 ORM**: SQLite, Prisma
- **AI 大模型**: Google Gemini API (`@google/genai`)
- **认证与安全**: JWT (`jose`), `bcryptjs`, AES-256-GCM 加密

## 🚀 腾讯云 Ubuntu 22.04 Docker 部署指南

本项目已完全适配 Docker 部署，非常适合在腾讯云等云服务器上运行。

### 1. 环境准备

登录到您的腾讯云 Ubuntu 22.04 服务器，确保已安装 Git、Docker 和 Docker Compose。

```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y

# 安装 Git
sudo apt install git -y

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo apt-get install docker-compose-plugin -y
```

### 2. 获取代码

将代码推送到您的 GitHub 仓库后，在服务器上克隆该仓库：

```bash
git clone https://github.com/您的用户名/您的仓库名.git
cd 您的仓库名
```

### 3. 配置环境变量

复制环境变量示例文件并进行修改：

```bash
cp .env.example .env
```

使用 `nano .env` 或 `vim .env` 编辑文件，填入您的真实配置：

```env
# 必填：您的 Gemini API Key
NEXT_PUBLIC_GEMINI_API_KEY="your_gemini_api_key_here"

# 您的服务器域名或公网 IP (例如: http://123.45.67.89:3000)
APP_URL="http://your-server-ip:3000"

# 必填：32字节的加密密钥（用于加密敏感数据）
ENCRYPTION_KEY="12345678901234567890123456789012"

# 必填：JWT 签名密钥（请修改为随机复杂字符串）
JWT_SECRET="your-super-secret-jwt-key-change-me-in-production"
```

### 4. 构建与启动服务

使用 Docker Compose 一键构建并启动服务。该过程会自动安装依赖、生成 Prisma Client、构建 Next.js 生产环境产物，并在启动时自动执行数据库迁移。

```bash
# 后台构建并启动容器
sudo docker compose up -d --build
```

### 5. 验证部署

部署完成后，您可以通过浏览器访问 `http://您的服务器IP:3000` 来查看应用。

查看运行日志：
```bash
sudo docker compose logs -f
```

### 6. 数据持久化说明

在 `docker-compose.yml` 中，我们配置了 Docker Volume (`sqlite_data`)，它会将 SQLite 数据库文件挂载到宿主机。这意味着即使您重启或重建容器，您的用户数据、量表记录等都不会丢失。

## 💻 本地开发指南

如果您希望在本地进行二次开发：

1. 克隆代码并安装依赖：
   ```bash
   npm install
   ```
2. 配置 `.env` 文件（参考 `.env.example`）。
3. 初始化数据库：
   ```bash
   npx prisma db push
   ```
4. 启动开发服务器：
   ```bash
   npm run dev
   ```
5. 浏览器访问 `http://localhost:3000`。

## 📄 许可证

MIT License
