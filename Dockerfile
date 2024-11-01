# 使用 Node.js 官方镜像作为基础镜像
FROM node:16-alpine

# 设置工作目录
WORKDIR /app

# 复制整个项目
COPY . .

# 安装前端依赖并构建
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# 安装后端依赖
WORKDIR /app/backend
RUN npm install

# 回到主目录
WORKDIR /app

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "backend/src/app.js"] 