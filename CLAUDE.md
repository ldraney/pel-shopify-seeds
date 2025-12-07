# pel-shopify-seeds

Source of truth for PEL Shopify catalog automation.

## Quick Start for Agents

1. **Read the issue you're assigned** - it has specific tasks and acceptance criteria
2. **Read `docs/architecture.html`** - contains Shopify API reference and type fields
3. **Read `docs/ROADMAP.html`** - shows phase dependencies and examples
4. **Follow conventions below** - especially for commits and ROADMAP updates

## Architecture

Three-repo pipeline:
1. **pel-shopify-seeds** (this repo) - CSV + API schemas -> GitHub releases
2. **pel-shopify-views** - Downloads seeds, calls Shopify API, builds SQLite DB -> releases DB
3. **pel-shopify-update** - Uses DB to sync changes to Shopify

```
seeds release                    views                         Shopify
─────────────                    ─────                         ───────
products.csv ──────────────────► Parse CSV ──────────────────►
api/types.js ──────────────────► Create matching tables
                                 Call API ◄────────────────── GET collections
                                 Call API ◄────────────────── GET inventory
                                      │
                                      ▼
                                 catalog.sqlite → release
```

## Key Documentation

| Document | What's In It |
|----------|--------------|
| `docs/architecture.html` | System diagrams, Shopify Admin API reference, type fields |
| `docs/ROADMAP.html` | Implementation phases, Gantt chart, current status |
| Issue #4 | Meta issue tracking all implementation |
| Issue #7 | Schema introspection script |

## What This Repo Contains

### Data (in releases, gitignored locally)
- `data/products.csv` - Shopify product export (65 columns, 1656 products)

### API Schemas (tracked in repo)
- `api/types.js` - Response schemas for Shopify API calls (generated via introspection)
- Views repo uses these schemas to create matching SQLite tables

### Documentation
- `docs/architecture.html` - Shopify API reference, type fields
- `docs/ROADMAP.html` - Implementation phases and status

## File Structure

```
pel-shopify-seeds/
├── data/                    # gitignored - goes in releases only
│   └── products.csv         # Shopify product export (65 columns)
├── api/                     # API response schemas
│   └── types.js             # Generated from Shopify introspection
├── src/                     # Scripts
│   └── introspect.js        # Shopify schema introspection
├── docs/
│   ├── architecture.html    # Architecture + API reference
│   └── ROADMAP.html         # Implementation roadmap
├── .github/
│   ├── release.yml          # Release notes config
│   └── RELEASE_CHECKLIST.md # Release process
├── README.md
└── CLAUDE.md               # This file
```

## Agent Instructions by Issue

### Issue #7 (Schema Introspection) - CURRENT PRIORITY
1. Create `src/introspect.js` (or Python equivalent)
2. Connect to Shopify Admin GraphQL API
3. Introspect types: Collection, InventoryItem, InventoryLevel, Location
4. Generate `api/types.js` with response schemas
5. Document which queries return which types

```bash
# Example usage
SHOPIFY_STORE_URL=xxx SHOPIFY_ACCESS_TOKEN=xxx node src/introspect.js
```

### Completed Issues
- Issue #2 (First Release) - ✅ v0.2.0 released
- Issue #1 (Collections) - ✅ Merged (legacy JSON approach, will be replaced by types.js)
- Issue #3 (Inventory) - ✅ Merged (legacy JSON approach, will be replaced by types.js)

## Conventions

### Schema Generation
- Introspect from live Shopify API
- Output JavaScript/TypeScript types or GraphQL schema
- Include all fields views repo needs to create tables

### Git Commits
- Descriptive commit messages
- Reference issue number: `Fixes #7` or `Part of #7`
- Push after completing each issue

### ROADMAP Updates
**Every issue must update `docs/ROADMAP.html`** to mark its phase complete:
- Change phase div class from `current` to `complete`
- Add COMPLETE status text

### Releases
Each release should be a complete snapshot:
- `products.csv` - Product data
- `api/types.js` - API response schemas

## Useful Commands

```bash
# List issues
gh issue list

# View issue details
gh issue view 7

# Create a release
gh release create v0.3.0 data/products.csv api/types.js \
  --title "v0.3.0" --notes "Added schema introspection"

# Test Shopify API connection
curl -X POST https://your-store.myshopify.com/admin/api/2024-01/graphql.json \
  -H "X-Shopify-Access-Token: $SHOPIFY_ACCESS_TOKEN" \
  -d '{"query": "{ shop { name } }"}'
```

## Environment Variables

```bash
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxx
```

## Goal

Provide pel-shopify-views with:
1. Product CSV data (for products_raw table)
2. API response schemas (so views knows what tables to create for API data)
