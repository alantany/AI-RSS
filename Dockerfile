# 使用 Node.js 官方镜像作为基础镜像
FROM node:16-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 文件
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# 安装依赖
RUN cd frontend && npm install
RUN cd backend && npm install

# 复制源代码
COPY . .

# 构建前端
RUN cd frontend && npm run build

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "backend/src/app.js"] 