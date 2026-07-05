FROM node:20-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package.json package-lock.json ./
RUN npm ci --production

# Copy ABI files (referenced by config.yaml)
COPY abis/ ./abis/

# Copy indexer configuration and schema
COPY config.yaml schema.graphql ./

# Copy handler source code
COPY src/ ./src/

# Envio CLI is installed as a production dependency; start the indexer
CMD ["npx", "envio", "start"]
