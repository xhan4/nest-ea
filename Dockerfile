# 使用官方 Node 镜像
FROM node:20

# 创建并设置工作目录
WORKDIR /nest-ea

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN pnpm install

# 复制源代码
COPY . .

# 构建 Nest 应用
RUN pnpm build

# 绑定应用到 3002 端口
EXPOSE 3002

# 启动应用
CMD ["pnpm", "start"]

