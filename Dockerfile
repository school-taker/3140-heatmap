FROM denoland/deno:1.16.3

EXPOSE 8000

WORKDIR /app

# Prefer not to run as root.
USER deno

COPY deps.ts .
RUN deno cache deps.ts


ADD . .
RUN deno cache index.ts

CMD ["run", "--allow-net", "--allow-read", "index.ts"]