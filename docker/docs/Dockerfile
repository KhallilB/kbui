FROM oven/bun:1.3.11 AS build
WORKDIR /app
COPY package.json bun.lock bunfig.toml ./
COPY packages ./packages
COPY apps ./apps
COPY tsconfig.base.json ./
RUN bun install --frozen-lockfile --ignore-scripts
RUN bun run build && bun run --filter @kbui/storybook build-storybook

FROM nginx:alpine
COPY docker/docs/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/storybook/storybook-static /usr/share/nginx/html
