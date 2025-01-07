-- -- ./postgres/init.sql

-- -- Crea authdb
-- -- CREATE DATABASE authdb OWNER "user";

-- -- Crea appdb
-- CREATE DATABASE appdb OWNER "user";
CREATE DATABASE authdb;
CREATE DATABASE appdb;

\c authdb;
CREATE SCHEMA IF NOT EXISTS public;

\c appdb;
CREATE SCHEMA IF NOT EXISTS public;