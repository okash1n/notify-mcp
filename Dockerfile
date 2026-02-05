FROM oven/bun:1.1.24

RUN apt-get update \
  && apt-get install -y --no-install-recommends tini \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json tsconfig.json ./
COPY packages ./packages
COPY config ./config
COPY scripts ./scripts

RUN bun install
RUN rm -rf /app/packages/*/node_modules \
  && ln -s /app/node_modules /app/packages/core/node_modules \
  && ln -s /app/node_modules /app/packages/server/node_modules \
  && ln -s /app/node_modules /app/packages/web/node_modules \
  && ln -s /app/node_modules /app/packages/desktop-client/node_modules

ENV HOST=0.0.0.0
ENV PORT=19800
ENV CONFIG_PATH=/app/config/config.yaml

EXPOSE 19800

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["bun", "run", "packages/server/src/http.ts"]
