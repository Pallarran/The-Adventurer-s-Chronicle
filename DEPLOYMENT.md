# Deploying The Adventurer's Chronicle on Unraid

## Prerequisites

- Unraid with Docker enabled
- SSH access to your server (or use the Unraid terminal)
- **Docker Compose Manager** plugin installed (get it from Community Applications)
- `git` installed — if not: `apk add git` in the Unraid terminal

## Step 1 — Clone the repo

SSH into your Unraid server and clone to a persistent location:

```bash
mkdir -p /mnt/user/appdata/adventurers-chronicle
cd /mnt/user/appdata/adventurers-chronicle
git clone https://github.com/Pallarran/The-Adventurer-s-Chronicle.git
cd The-Adventurer-s-Chronicle
```

## Step 2 — Set your database password

Create a `.env` file with a real password (not the default):

```bash
echo 'POSTGRES_PASSWORD=YourSecurePasswordHere' > .env
```

This gets picked up by `docker-compose.yml` automatically.

## Step 3 — Build and start

```bash
docker compose up -d --build
```

This will:

1. Build the app image (multi-stage, takes a few minutes the first time)
2. Start PostgreSQL 16 and wait for it to be healthy
3. Run database migrations automatically
4. Seed the database with a default campaign
5. Start the app on port **4000**

## Step 4 — Access the app

Open your browser and go to:

```
http://<your-unraid-ip>:4000/dashboard
```

## Updating to a new version

When you push new code from your dev machine:

```bash
cd /mnt/user/appdata/adventurers-chronicle/The-Adventurer-s-Chronicle
git pull
docker compose up -d --build
```

Migrations run automatically on each startup — your data is safe.

## Useful commands

```bash
# View logs
docker compose logs -f app

# Restart the app
docker compose restart app

# Stop everything
docker compose down

# Stop everything AND delete data (fresh start)
docker compose down -v

# Check database directly
docker compose exec db psql -U postgres -d adventurers_chronicle
```

## Data persistence

Two Docker volumes keep your data safe across rebuilds:

- **postgres-data** — all your campaign data
- **uploads** — character portraits and uploaded images

These survive `docker compose down` and `docker compose up --build`. Only `docker compose down -v` deletes them.

## Changing the port

If port 4000 conflicts with something, edit `docker-compose.yml` and change the left side of the port mapping:

```yaml
ports:
  - "3000:4000"   # access on port 3000 instead
```
