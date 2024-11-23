# 使用官方 Node 镜像，推荐使用更小的版本（如 slim）
FROM node:20-alpine as builder

# 配置环境变量
ENV NODE_ENV=prod
ENV PNPM_HOME="/root/.pnpm"

# 设置国内 NPM 镜像源
RUN npm config set registry https://registry.npmmirror.com

# 安装 pnpm（指定版本以避免不兼容问题）
RUN npm install -g pnpm@9.4.0

# 设置工作目录
WORKDIR /nest-ea

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./ 

# 安装依赖
RUN pnpm install --frozen-lockfile --production=false

# 复制项目文件
COPY . .

# 构建 Nest.js 应用
RUN pnpm build

# 第二阶段，构建镜像运行环境
FROM node:20-alpine as runner

# 设置工作目录
WORKDIR /nest-ea

# 从 builder 阶段复制 dist 目录到最终镜像
COPY --from=builder /nest-ea/dist /nest-ea/dist
COPY --from=builder /nest-ea/node_modules /nest-ea/node_modules

# 暴露端口
EXPOSE 3002

RUN echo "Working Directory: $(pwd)" && ls -alh /nest-ea/dist/src
# 启动服务
CMD ["node", "dist/src/main.js"]
