# 构建阶段
FROM node:20-alpine3.19 AS builder

# 配置环境变量
ENV NODE_ENV=prod

# 设置 npm 镜像源
RUN npm config set registry https://registry.npmmirror.com/

# 安装 pnpm 并设置 pnpm 镜像源
RUN npm install -g pnpm@latest && pnpm config set registry https://registry.npmmirror.com/
WORKDIR /nest-ea
# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 使用 pnpm 安装依赖
RUN pnpm install --frozen-lockfile

# 复制所有源代码并构建应用
COPY . .

RUN pnpm run build

# 生产阶段
FROM node:20-alpine3.19 AS runner

WORKDIR /nest-ea
# 设置 npm 镜像源
RUN npm config set registry https://registry.npmmirror.com/
RUN npm install -g pnpm@latest

# 从构建阶段复制构建结果和依赖
COPY --from=builder /nest-ea/dist /nest-ea/dist
COPY --from=builder /nest-ea/node_modules /nest-ea/node_modules
COPY --from=builder /nest-ea/.env.prod /nest-ea/.env.prod

RUN ls -l /nest-ea/dist
# 暴露端口
EXPOSE 3002

CMD [ "node", "dist/src/main.js" ]