# pel-shopify-seeds

Source of truth for PEL Shopify catalog automation.

## Architecture

Three-repo pipeline:
1. **pel-shopify-seeds** (this repo) - CSVs + API definitions -> GitHub releases
2. **pel-shopify-views** - Ingests seeds, builds SQLite DB -> releases seeded DB
3. **pel-shopify-update** - Uses DB to sync to Shopify via CSV import + API calls

## Key Documentation

- `docs/architecture.html` - System architecture, Mermaid diagrams, Shopify Admin API reference
- `docs/ROADMAP.html` - Implementation phases, issue dependencies, agent instructions

**READ THESE DOCS BEFORE STARTING ANY ISSUE.**

## Data Split

**CSV handles (65 columns including metafields):**
- Products, variants, images, tags, options, SEO, Google Shopping
- Product metafields (as columns like `product.metafields.namespace.key`)

**API required (needs JSON schema definitions):**
- Collections (separate entity) -> `api/collections.json`
- Multi-location inventory -> `api/inventory.json`
- InventoryItem details (HS codes, country of origin)

## File Structure

```
pel-shopify-seeds/
├── data/                    # gitignored - goes in releases only
│   └── products.csv         # Shopify product export
├── api/                     # JSON definitions for API-only data
│   ├── collections.json     # Collection definitions
│   └── inventory.json       # Multi-location inventory
├── docs/
│   ├── architecture.html    # Architecture + API reference
│   └── ROADMAP.html         # Implementation roadmap
├── README.md
└── CLAUDE.md               # This file
```

## Agent Instructions

### For Issue #2 (First Release)
1. Validate `data/products.csv` exists and has 65 columns
2. Create release: `gh release create v0.1.0 data/products.csv --title "v0.1.0" --notes "Initial product CSV"`
3. Verify release at https://github.com/ldraney/pel-shopify-seeds/releases

### For Issue #1 (Collections Schema)
1. Read `docs/architecture.html` - find Collection type fields
2. Create `api/collections.schema.json` (JSON Schema draft-07)
3. Create `api/collections.json` with example data
4. Support both manual and smart (rule-based) collections
5. Include metafields support

### For Issue #3 (Inventory Schema)
1. Read `docs/architecture.html` - find InventoryItem and InventoryLevel types
2. Create `api/inventory.schema.json` (JSON Schema draft-07)
3. Create `api/inventory.json` with example data
4. Map: SKU -> locations -> quantities

## Conventions

- Use JSON Schema draft-07 for all schema definitions
- JSON files should be valid and parseable
- All API definitions go in `api/` directory
- Data files go in `data/` (gitignored, attached to releases)
- Documentation uses HTML + Mermaid for diagrams

## Goal

Complete product catalog updates with all fields mapped in the SQLite schema that pel-shopify-views will create.
