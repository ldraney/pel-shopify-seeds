# pel-shopify-seeds

Source of truth for PEL Shopify catalog automation.

## Architecture

Three-repo pipeline:
1. **pel-shopify-seeds** (this repo) - CSVs + API definitions -> GitHub releases
2. **pel-shopify-views** - Ingests seeds, builds SQLite DB -> releases seeded DB
3. **pel-shopify-update** - Uses DB to sync to Shopify via CSV import + API calls

## Data Split

**CSV handles (65 columns including metafields):**
- Products, variants, images, tags, options, SEO, Google Shopping
- Product metafields (as columns like `product.metafields.namespace.key`)

**API required:**
- Collections (separate entity)
- Multi-location inventory
- InventoryItem details (HS codes, country of origin)

## Current State

- `data/` - Product CSV export (gitignored, goes in releases)
- `docs/architecture.html` - Full architecture with Mermaid diagrams + API reference

## Goal

Complete product catalog updates with all fields mapped in the SQLite schema.

See `docs/architecture.html` for detailed diagrams and Shopify Admin API reference. 
