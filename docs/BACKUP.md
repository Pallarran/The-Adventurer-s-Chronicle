# Backup & Restore

All campaign data lives in two places on the Docker host, both bind-mounted next to `docker-compose.yml`:

- `./postgres-data` — the PostgreSQL data directory (never copy this while the db container is running)
- `./uploads` — entity images and uploaded files

`scripts/backup.sh` produces safe, consistent backups **without stopping anything**: a gzipped `pg_dump` of the database plus a tarball of `uploads/`.

## Running a backup

```bash
cd /path/to/The-Adventurer-s-Chronicle
./scripts/backup.sh            # writes to ./backups
./scripts/backup.sh /mnt/user/backups/chronicle   # custom destination
```

Backups older than 30 days are pruned automatically (edit `KEEP_DAYS` in the script).

## Scheduling on Unraid

1. Install the **User Scripts** plugin (Apps tab).
2. Add a new script with this body (adjust paths):
   ```bash
   #!/bin/bash
   /mnt/user/appdata/adventurers-chronicle/scripts/backup.sh /mnt/user/backups/chronicle
   ```
3. Set the schedule to **Daily** (or weekly — session notes change at most a few times a week).
4. Point the destination at a share that is itself backed up off-box if possible.

## Restoring

Database (into a fresh or existing db container):

```bash
# wipe and recreate the database, then restore
docker exec -i adventurers-chronicle-db psql -U postgres -c "DROP DATABASE IF EXISTS adventurers_chronicle;"
docker exec -i adventurers-chronicle-db psql -U postgres -c "CREATE DATABASE adventurers_chronicle;"
gunzip -c backups/chronicle-db-YYYY-MM-DD_HHMMSS.sql.gz \
  | docker exec -i adventurers-chronicle-db psql -U postgres adventurers_chronicle
```

Uploads:

```bash
tar -xzf backups/chronicle-uploads-YYYY-MM-DD_HHMMSS.tar.gz -C /path/to/The-Adventurer-s-Chronicle
```

Then restart the app container: `docker compose restart app`.

## Verifying a backup (recommended occasionally)

```bash
docker run --rm -e POSTGRES_PASSWORD=test -d --name restore-test postgres:16-alpine
gunzip -c backups/chronicle-db-....sql.gz | docker exec -i restore-test psql -U postgres
docker exec restore-test psql -U postgres -c '\dt'   # tables should be listed
docker rm -f restore-test
```
