FROM node:20-alpine

WORKDIR /workspace

RUN corepack enable && corepack prepare pnpm@10.20.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY backend/package.json backend/package.json

RUN pnpm install --frozen-lockfile

COPY packages/shared packages/shared
COPY backend backend

RUN pnpm --filter @veya/shared build
RUN pnpm --filter @veya/backend build

EXPOSE 3000

CMD ["pnpm", "--filter", "@veya/backend", "start:prod"]
