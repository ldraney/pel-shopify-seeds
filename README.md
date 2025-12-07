# pel-shopify-seeds

Source of truth for PEL Shopify catalog data.

## Purpose

This repo contains the canonical product data that feeds into the Shopify catalog automation pipeline:

1. **pel-shopify-seeds** (this repo) - CSV files + API call definitions
2. **pel-shopify-views** - Transforms seeds into a SQLite database
3. **pel-shopify-update** - Syncs the database to Shopify

## Data Split

| Data Type | Method | Notes |
|-----------|--------|-------|
| Products, variants, images | CSV | 65 columns in Shopify export |
| Product metafields | CSV | Included as columns |
| SEO, Google Shopping | CSV | Built into export |
| Collections | API | Separate entity |
| Multi-location inventory | API | CSV only has single qty |
| HS codes, country of origin | API | InventoryItem fields |

## Structure

```
├── docs/              # Architecture documentation
├── data/              # Product CSVs (gitignored, goes in releases)
│   └── products.csv
├── api/               # API call definitions (JSON) - TODO
│   └── collections.json
└── CLAUDE.md          # AI assistant instructions
```

## Releases

Each release includes:
- CSV files for bulk import
- JSON files defining GraphQL mutations for API-only features

## Documentation

See [docs/architecture.html](docs/architecture.html) for the full system architecture with diagrams and Shopify Admin API reference.
