#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER docker;
    CREATE DATABASE short_url;
    GRANT ALL PRIVILEGES ON DATABASE short_url TO docker;
    CREATE DATABASE short_url_test;
    GRANT ALL PRIVILEGES ON DATABASE short_url_test TO docker;
EOSQL