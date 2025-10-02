#!/bin/bash
set -e

DB=appdb
USER=app
PASS='pwd'

sudo pacman -Syu --noconfirm
sudo pacman -S --noconfirm postgresql php php-pgsql

# init cluster (first time only)
# [ -d /var/lib/postgres/data/base ] || sudo -iu postgres initdb -D /var/lib/postgres/data -E UTF8 --locale=en_US.UTF-8

# allow local password auth
sudo -iu postgres bash -lc "printf '%s\n' \
'local   all   all                 scram-sha-256' \
'host    all   all   127.0.0.1/32  scram-sha-256' \
'host    all   all   ::1/128       scram-sha-256' > /var/lib/postgres/data/pg_hba.conf"

sudo systemctl enable --now postgresql

# create db + user (idempotent) and a users table
sudo -iu postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='$USER') THEN
  CREATE ROLE "$USER" LOGIN PASSWORD '$PASS';
END IF; END\$\$;
DO \$\$BEGIN IF NOT EXISTS (SELECT FROM pg_database WHERE datname='$DB') THEN
  CREATE DATABASE "$DB" OWNER "$USER";
END IF; END\$\$;

\c "$DB"
CREATE TABLE IF NOT EXISTS users(
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  address TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client'
);
SQL

echo "DSN for PHP: pgsql:host=127.0.0.1;port=5432;dbname=$DB"
echo "User: $USER  Pass: $PASS"
