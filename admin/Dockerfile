FROM node:20-alpine

WORKDIR /workspace

RUN corepack enable && corepack prepare pnpm@10.20.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY admin/package.json admin/package.json

RUN pnpm install --frozen-lockfile

COPY admin admin

EXPOSE 5173

CMD ["pnpm", "--filter", "@veya/admin", "dev", "--", "--host", "0.0.0.0"]
