# 使用 Node.js 官方镜像作为基础镜像
FROM node:16-alpine

# 设置工作目录
WORKDIR /app

# 创建前端和后端目录
RUN mkdir frontend backend

# 首先复制 package.json 文件
COPY package.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

# 安装依赖
WORKDIR /app/frontend
RUN npm install

WORKDIR /app/backend
RUN npm install

# 复制源代码
WORKDIR /app
COPY . .

# 构建前端
WORKDIR /app/frontend
RUN npm run build

# 回到主目录
WORKDIR /app

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "backend/src/app.js"] 