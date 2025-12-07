# pel-shopify-seeds

Source of truth for PEL Shopify catalog data.

## Purpose

This repo contains the canonical product data that feeds into the Shopify catalog automation pipeline:

1. **pel-shopify-seeds** (this repo) - CSV files + API call definitions
2. **pel-shopify-views** - Transforms seeds into a SQLite database
3. **pel-shopify-update** - Syncs the database to Shopify

## Structure

```
├── docs/              # Architecture documentation
├── csv/               # Product CSVs (Shopify import format)
│   └── products.csv
├── api/               # API call definitions (JSON)
│   ├── metafields.json
│   └── collections.json
└── CLAUDE.md          # AI assistant instructions
```

## Releases

Each release includes:
- CSV files for bulk import
- JSON files defining GraphQL mutations for API-only features

## Documentation

See [docs/architecture.html](docs/architecture.html) for the full system architecture with diagrams.
