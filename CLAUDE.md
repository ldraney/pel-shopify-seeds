# pel-shopify-seeds

Source of truth for PEL Shopify catalog automation.

## Architecture

Three-repo pipeline:
1. **pel-shopify-seeds** (this repo) - CSVs + API definitions -> GitHub releases
2. **pel-shopify-views** - Ingests seeds, builds SQLite DB -> releases seeded DB
3. **pel-shopify-update** - Uses DB to sync to Shopify via CSV import + API calls

## Data Split

- **CSV**: Products, variants, images, tags, options (Shopify bulk import)
- **API**: Metafields, collections, multi-location inventory (GraphQL mutations)

## Goal

Complete product catalog updates with all fields mapped in the SQLite schema.

See `docs/architecture.html` for detailed diagrams. 
