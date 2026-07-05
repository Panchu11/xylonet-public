# XyloNet Indexer — Self-Hosted Deployment Guide

Deploy the XyloNet blockchain indexer (Envio + PostgreSQL + Hasura) on Oracle Cloud's Always Free tier, managed through Coolify.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Create an Oracle Cloud Instance](#2-create-an-oracle-cloud-instance)
3. [Configure Firewall Rules](#3-configure-firewall-rules)
4. [SSH Into Your Instance](#4-ssh-into-your-instance)
5. [Install Docker and Docker Compose](#5-install-docker-and-docker-compose)
6. [Install Coolify](#6-install-coolify)
7. [Set Up a Free Subdomain with DuckDNS](#7-set-up-a-free-subdomain-with-duckdns)
8. [Deploy the Indexer via Coolify](#8-deploy-the-indexer-via-coolify)
9. [Track Tables in Hasura](#9-track-tables-in-hasura)
10. [Verify the Deployment](#10-verify-the-deployment)
11. [Update Frontend Environment Variables](#11-update-frontend-environment-variables)
12. [Routine Maintenance](#12-routine-maintenance)
13. [Troubleshooting](#13-troubleshooting)
14. [Backup Strategy](#14-backup-strategy)

---

## 1. Prerequisites

Before starting, you need:

- **Oracle Cloud account** — sign up at [cloud.oracle.com](https://cloud.oracle.com) (Always Free tier is sufficient)
- **SSH key pair** — generated on your local machine
- **A terminal** — Windows Terminal, PowerShell, or any SSH client
- **Git** — to clone the repository onto the server

### Generate an SSH Key (Windows)

Open PowerShell and run:

```powershell
ssh-keygen -t ed25519 -C "your-email@example.com"
```

Press Enter to accept the default path (`~/.ssh/id_ed25519`). Copy the **public key** — you'll paste it into Oracle Cloud:

```powershell
cat ~/.ssh/id_ed25519.pub
```

---

## 2. Create an Oracle Cloud Instance

Oracle's Always Free tier includes an ARM-based instance that is more than powerful enough for this indexer.

### Step-by-step

1. Log in to the [Oracle Cloud Console](https://cloud.oracle.com).
2. Click **Create a VM instance**.
3. Click **Edit** next to "Image and shape" and select:
   - **Image:** Ubuntu 24.04
   - **Shape:** `VM.Standard.A1.Flex` (ARM, Always Free eligible)
   - **OCPU count:** 4
   - **Memory (GB):** 24
4. Under **Boot volume**, set size to **200 GB** (Always Free allows up to 200 GB total).
5. Under **Add SSH keys**, choose **Paste public keys** and paste your `id_ed25519.pub` contents.
6. Click **Create**.

Wait 1–2 minutes for the instance to reach **Running** state. Copy the **public IP address** from the instance details page.

---

## 3. Configure Firewall Rules

Oracle Cloud has two firewalls — the OS-level `iptables` and the cloud-level Virtual Cloud Network (VCN) security list. You need to open ports in both.

### Ports to open

| Port  | Purpose                          |
|-------|----------------------------------|
| 22    | SSH access                       |
| 80    | HTTP (Coolify reverse proxy)     |
| 443   | HTTPS (Coolify reverse proxy)    |
| 8000  | Coolify dashboard                |
| 8080  | Hasura GraphQL API + Console     |

### 3a. Oracle Cloud VCN Security List

1. Go to **Networking → Virtual Cloud Networks** in the Oracle Console sidebar.
2. Click your VCN (e.g., `vcn-...`).
3. Click **Security Lists → Default Security List**.
4. Click **Add Ingress Rules** and add:

   | Source CIDR   | Dest Port | Protocol | Description         |
   |---------------|-----------|----------|---------------------|
   | 0.0.0.0/0    | 80        | TCP      | HTTP                |
   | 0.0.0.0/0    | 443       | TCP      | HTTPS               |
   | 0.0.0.0/0    | 8000      | TCP      | Coolify dashboard   |
   | 0.0.0.0/0    | 8080      | TCP      | Hasura GraphQL      |

### 3b. Ubuntu iptables

After SSH-ing in (next step), run:

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8000 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8080 -j ACCEPT
sudo netfilter-persistent save
```

---

## 4. SSH Into Your Instance

From your local terminal:

```bash
ssh -i ~/.ssh/id_ed25519 ubuntu@<YOUR_PUBLIC_IP>
```

Replace `<YOUR_PUBLIC_IP>` with the IP from step 2. Type `yes` when asked about the host fingerprint.

> **Tip:** To avoid typing the full command each time, create an SSH config entry:
> ```
> # ~/.ssh/config
> Host xylonet-server
>     HostName <YOUR_PUBLIC_IP>
>     User ubuntu
>     IdentityFile ~/.ssh/id_ed25519
> ```
> Then connect with just: `ssh xylonet-server`

---

## 5. Install Docker and Docker Compose

Run these commands on the server:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo sh

# Add your user to the docker group (so you don't need sudo for docker)
sudo usermod -aG docker $USER

# Apply group change without logging out
newgrp docker

# Verify Docker is running
docker --version
docker compose version
```

Both commands should print version numbers.

---

## 6. Install Coolify

Coolify is an open-source PaaS with a web UI. It manages Docker containers, handles reverse proxying, and gives you logs/restarts without needing to SSH in every time.

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash
```

After installation completes (~2 minutes):

1. Open `http://<YOUR_PUBLIC_IP>:8000` in your browser.
2. Create an admin account (email + password).
3. You'll land on the Coolify dashboard.

> **Note:** Coolify uses Traefik as a reverse proxy on ports 80/443. The Hasura port 8080 is exposed directly (not through Traefik) for simplicity.

---

## 7. Set Up a Free Subdomain with DuckDNS

To avoid hardcoding your server IP, set up a free subdomain.

1. Go to [duckdns.org](https://www.duckdns.org) and sign in with GitHub/Google.
2. Create a subdomain, e.g., `xylonet-indexer.duckdns.org`.
3. Set the IP to your Oracle instance's public IP.
4. Copy your **token** from the DuckDNS dashboard.
5. On the server, set up the auto-update cron:

```bash
# Install the DuckDNS updater
mkdir -p ~/duckdns && cd ~/duckdns
echo "echo url=\"https://www.duckdns.org/update?domains=xylonet-indexer&token=YOUR_TOKEN&ip=\" | curl -k -o ~/duckdns/duck.log -K -" > duck.sh
chmod +x duck.sh
./duck.sh

# Auto-update every 5 minutes
(crontab -l 2>/dev/null; echo "*/5 * * * * ~/duckdns/duck.sh") | crontab -
```

Replace `xylonet-indexer` with your chosen subdomain and `YOUR_TOKEN` with your DuckDNS token.

---

## 8. Deploy the Indexer via Coolify

### Option A: Deploy from Git (recommended)

1. Push the `indexer/` folder to a GitHub/GitLab repository.
2. In Coolify, go to **Sources** and connect your GitHub account (or add a deploy key).
3. Click **+ New Project → Docker Compose**.
4. Select your repository and set the **Base Directory** to `/indexer`.
5. Coolify will auto-detect `docker-compose.yml`.

### Option B: Paste Docker Compose directly

1. In Coolify, click **+ New Project → Docker Compose (empty)**.
2. Paste the full contents of `docker-compose.yml`.
3. Save.

### Set Environment Variables

In the Coolify dashboard, open your project and go to the **Environment Variables** tab. Add each variable:

| Key                              | Value                                           |
|----------------------------------|-------------------------------------------------|
| `POSTGRES_USER`                  | `xylonet`                                       |
| `POSTGRES_PASSWORD`              | *(a strong random password, 32+ chars)*         |
| `POSTGRES_DB`                    | `xylonet_indexer`                               |
| `POSTGRES_PORT`                  | `5432`                                          |
| `HASURA_GRAPHQL_DATABASE_URL`    | `postgres://xylonet:<PASSWORD>@postgres:5432/xylonet_indexer` |
| `HASURA_GRAPHQL_ADMIN_SECRET`    | *(a strong random secret, 32+ chars)*           |
| `ENVIO_PG_HOST`                  | `postgres`                                      |
| `ENVIO_PG_PORT`                  | `5432`                                          |
| `ENVIO_PG_USER`                  | `xylonet`                                       |
| `ENVIO_PG_PASSWORD`              | *(same as POSTGRES_PASSWORD)*                   |
| `ENVIO_PG_DATABASE`              | `xylonet_indexer`                               |
| `RPC_URL`                        | `https://rpc.testnet.arc.network`               |

> **Generating secure passwords:**
> ```bash
> openssl rand -hex 32
> ```

Click **Deploy**. Coolify will build the Docker image and start all three services.

### First deployment takes time

The Envio indexer starts syncing from block `17100000` on Arc testnet. Depending on how many events exist, initial sync can take 10–30 minutes. Watch the `envio-indexer` logs in Coolify for progress.

---

## 9. Track Tables in Hasura

Hasura does not automatically expose tables as GraphQL endpoints — you must "track" them after Envio creates them in PostgreSQL.

### When to track tables

After the indexer finishes its initial sync (or after it creates at least one row in each table), follow these steps.

### How to track tables

1. Open the Hasura Console: `http://<YOUR_SERVER_IP>:8080/console`
2. Log in with your `HASURA_GRAPHQL_ADMIN_SECRET`.
3. Go to the **Data** tab at the top.
4. You'll see the `default` database → `public` schema.
5. Click **Track** next to each untracked table:
   - `swap`
   - `pool`
   - `liquidity_event`
   - `vault_event`
   - `tip`
   - `tip_claim`
   - `daily_volume`
   - `protocol_user`
6. Also track any foreign-key relationships if prompted.

> **Note:** Envio may also create internal bookkeeping tables (e.g., `_envio_metadata`). You do NOT need to track those — they are for Envio's internal use only.

### Track all tables at once (optional)

In the Hasura Console → Data → public schema, click **Track all** next to Untracked tables.

---

## 10. Verify the Deployment

### Check service health

```bash
# SSH into your server, then:
docker compose -f /path/to/docker-compose.yml ps
```

All three services should show `Up` / `healthy`.

### Query the GraphQL endpoint

From your local machine, test the Hasura GraphQL API:

```bash
curl -X POST http://xylonet-indexer.duckdns.org:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: YOUR_ADMIN_SECRET" \
  -d '{"query": "{ swap(limit: 5, order_by: {blockNumber: desc}) { id pool tokenIn tokenOut amountIn txHash } }"}'
```

You should get JSON with recent swap events. If you get an error like `table "swap" does not exist`, the indexer hasn't finished syncing yet — check the `envio-indexer` logs.

### Test without the admin secret (public access)

```bash
curl -X POST http://xylonet-indexer.duckdns.org:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ pool { id address totalVolume txCount } }"}'
```

This works because we set `HASURA_GRAPHQL_UNAUTHORIZED_ROLE: "public"` in docker-compose.yml.

---

## 11. Update Frontend Environment Variables

In your XyloNet frontend project (deployed on Vercel), update the environment variable that points to the indexer GraphQL endpoint:

```env
# .env.local (or Vercel dashboard → Settings → Environment Variables)
NEXT_PUBLIC_INDEXER_GRAPHQL_URL=http://xylonet-indexer.duckdns.org:8080/v1/graphql
```

If you had a previous Envio Cloud URL (e.g., `https://indexer.hyperindex.xyz/...`), replace it with your self-hosted URL.

> **CORS is already configured** — the Hasura `CORS_DOMAIN: "*"` setting allows requests from any origin, including your Vercel frontend.

After updating, redeploy the frontend:

```bash
cd frontend
npm run build
vercel --prod
```

Or push to your Git branch and let Vercel auto-deploy.

---

## 12. Routine Maintenance

### View logs

```bash
# All services
docker compose logs -f --tail=100

# Specific service
docker compose logs -f envio-indexer
docker compose logs -f hasura
docker compose logs -f postgres
```

Or use the Coolify web UI → your project → **Logs** tab.

### Restart a single service

```bash
docker compose restart envio-indexer
```

### Update the indexer code

```bash
cd /path/to/indexer
git pull origin main
docker compose up -d --build envio-indexer
```

Or click **Redeploy** in the Coolify dashboard.

---

## 13. Troubleshooting

### "envio-indexer keeps restarting"

Check the logs:

```bash
docker compose logs envio-indexer --tail=50
```

Common causes:
- **PostgreSQL not ready:** The health check should prevent this, but if postgres crashed, check `docker compose logs postgres`.
- **RPC connection failure:** The indexer can't reach `https://rpc.testnet.arc.network`. Test from the server: `curl https://rpc.testnet.arc.network`. If it times out, switch to a different RPC (e.g., Alchemy) in your `.env`.
- **Out of memory:** Unlikely on 24GB RAM, but check with `docker stats`.

### "Hasura returns empty results"

1. Check that Envio has finished syncing (look for "caught up" in logs).
2. Verify tables are tracked in Hasura Console (Step 9).
3. Check that Envio wrote data: `docker compose exec postgres psql -U xylonet -d xylonet_indexer -c "SELECT COUNT(*) FROM swap;"`

### "Cannot connect to Hasura Console"

- Ensure port 8080 is open in both Oracle VCN security list AND iptables (Step 3).
- Test locally on the server: `curl http://localhost:8080/healthz` — should return `OK`.

### "Docker build fails"

- Ensure `package-lock.json` is committed and up to date: `npm install && git add package-lock.json`.
- Ensure the `abis/` directory is committed (config.yaml references the ABI files).

---

## 14. Backup Strategy

The PostgreSQL volume (`pgdata`) contains all indexed data. Back it up regularly.

### Manual backup

```bash
# Create a SQL dump
docker compose exec postgres pg_dump -U xylonet xylonet_indexer > backup_$(date +%Y%m%d).sql

# To restore from backup:
cat backup_20260630.sql | docker compose exec -T postgres psql -U xylonet xylonet_indexer
```

### Automated daily backup

Add a cron job on the server:

```bash
# Back up every day at 3 AM UTC, keep last 7 days
(crontab -l 2>/dev/null; echo "0 3 * * * docker exec indexer-postgres-1 pg_dump -U xylonet xylonet_indexer | gzip > /home/ubuntu/backups/indexer_\$(date +\\%Y\\%m\\%d).sql.gz && find /home/ubuntu/backups -name '*.sql.gz' -mtime +7 -delete") | crontab -
```

Create the backup directory first:

```bash
mkdir -p ~/backups
```

### Full volume backup (for migrations)

```bash
# Stop services
docker compose down

# Copy the volume
sudo cp -r /var/lib/docker/volumes/indexer_pgdata ~/pgdata_backup_$(date +%Y%m%d)

# Restart
docker compose up -d
```

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    Oracle Cloud VM (Ubuntu 24.04)            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │               Docker Compose (Coolify)                  │ │
│  │                                                        │ │
│  │  ┌──────────────┐  ┌────────────┐  ┌───────────────┐  │ │
│  │  │  PostgreSQL  │←─│   Envio    │  │    Hasura     │  │ │
│  │  │  (port 5432) │  │  Indexer   │  │  (port 8080)  │  │ │
│  │  │              │─→│            │  │       ↑       │  │ │
│  │  └──────────────┘  └─────┬──────┘  └───────┼───────┘  │ │
│  │                          │                 │           │ │
│  └──────────────────────────┼─────────────────┼───────────┘ │
│                             │                 │              │
│                    Arc Testnet RPC      Vercel Frontend      │
│               (rpc.testnet.arc.network) (GraphQL queries)    │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Reference

| Service         | Internal URL              | External URL                                   |
|-----------------|---------------------------|------------------------------------------------|
| PostgreSQL      | `postgres:5432`           | Not exposed                                    |
| Hasura GraphQL  | `hasura:8080`             | `http://xylonet-indexer.duckdns.org:8080`      |
| Hasura Console  | `hasura:8080/console`     | `http://xylonet-indexer.duckdns.org:8080/console` |
| Coolify         | —                         | `http://<YOUR_PUBLIC_IP>:8000`                 |
| Envio Indexer   | N/A (no HTTP server)      | Not exposed                                    |
