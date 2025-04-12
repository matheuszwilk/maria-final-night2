# Use uma imagem base que já tenha o Bun instalado
FROM oven/bun:latest AS deps

# Define o diretório de trabalho e copia arquivos necessários
WORKDIR /app
COPY package.json bun.lockb* ./

# Instala apenas as dependências de produção
RUN bun install --production

FROM oven/bun:latest AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia todos os arquivos do projeto
COPY . .
# Copia as dependências instaladas na etapa anterior
COPY --from=deps /app/node_modules ./node_modules

# Instala TODAS as dependências e faz o build
RUN bun install
RUN bun run build

# Imagem final usando uma base mais leve
FROM oven/bun:1-slim AS runner

# Configuração das variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3001
ENV AUTH_SECRET="adokpsadisfaijsfijoasoijfaoijsoijf1192824214h12h4912uy981c8b89c49c97419714"
ENV NEXTAUTH_SECRET="adokpsadisfaijsfijoasoijfaoijsoijf1192824214h12h4912uy981c8b89c49c97419714"
ENV NEXTAUTH_URL="http://192.168.0.247:3001"
ENV NEXT_PUBLIC_APP_URL="http://192.168.0.247:3001"
ENV AUTH_TRUST_HOST=true
ENV DATABASE_URL="mysql://mariadb:bh2ksv5y@192.168.0.247:3306/newdb"
ENV MINIO_ACCESS_KEY="CRQV4Enx6ktSsiWHdRUo"
ENV MINIO_SECRET_KEY="rR75x645RL8KdMR8IcuDrr51J6Ln9Oe1U0bi5IIh"
ENV MINIO_PORT=9000
ENV MINIO_SERVER_URL="192.168.0.247"
ENV MINIO_BUCKET="aws-f6"
ENV RESEND_KEY="lgekrhqsssdasdmh01.lge.com"

# Configuração do timezone
ENV TZ=America/Sao_Paulo
RUN apt-get update && apt-get install -y --no-install-recommends tzdata \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
    && echo $TZ > /etc/timezone \
    && rm -rf /var/lib/apt/lists/*

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos necessários para produção
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.js ./next.config.js

# Expor a porta que o Next.js irá rodar
EXPOSE 3002

# Comando para rodar a aplicação em modo produção
CMD ["bun", "run", "start"]
