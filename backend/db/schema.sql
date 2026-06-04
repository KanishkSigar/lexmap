-- LexMap - Database Schema
-- Run: node db/migrate.js to execute this against your PostgreSQL instance

CREATE TABLE IF NOT EXISTS cases (
    id        SERIAL PRIMARY KEY,
    title     VARCHAR(255) NOT NULL,
    raw_text  TEXT         NOT NULL,
    graph_json JSONB       NOT NULL,
    created_at TIMESTAMP  DEFAULT NOW()
);
