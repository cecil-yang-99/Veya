FROM node:20-alpine

WORKDIR /workspace

RUN apk add --no-cache bash
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY app/package.json app/package.json

RUN pnpm install --frozen-lockfile

COPY packages/shared packages/shared
COPY app app

EXPOSE 8081 19000 19001 19002 19006

CMD ["pnpm", "--filter", "@veya/app", "exec", "expo", "start", "--web", "--host", "lan"]
