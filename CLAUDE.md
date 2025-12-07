# pel-shopify-seeds

Source of truth for PEL Shopify catalog automation.

## Quick Start for Agents

1. **Read the issue you're assigned** - it has specific tasks and acceptance criteria
2. **Read `docs/architecture.html`** - contains Shopify API reference and type fields
3. **Read `docs/ROADMAP.html`** - shows phase dependencies and examples
4. **Follow conventions below** - especially for commits and ROADMAP updates

## Architecture

Three-repo pipeline:
1. **pel-shopify-seeds** (this repo) - CSVs + API definitions -> GitHub releases
2. **pel-shopify-views** - Ingests seeds, builds SQLite DB -> releases seeded DB
3. **pel-shopify-update** - Uses DB to sync to Shopify via CSV import + API calls

## Key Documentation

| Document | What's In It |
|----------|--------------|
| `docs/architecture.html` | System diagrams, Shopify Admin API reference, type fields |
| `docs/ROADMAP.html` | Implementation phases, Gantt chart, example JSON structures |
| Issue #4 | Meta issue tracking all implementation |

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
│   └── products.csv         # Shopify product export (65 columns)
├── api/                     # JSON definitions for API-only data
│   ├── collections.schema.json
│   ├── collections.json
│   ├── inventory.schema.json
│   └── inventory.json
├── docs/
│   ├── architecture.html    # Architecture + API reference
│   └── ROADMAP.html         # Implementation roadmap
├── README.md
└── CLAUDE.md               # This file
```

## Agent Instructions by Issue

### Issue #2 (First Release) - DO THIS FIRST
```bash
# 1. Validate CSV exists and has 65 columns
head -1 data/products.csv | tr ',' '\n' | wc -l

# 2. Count products for release notes
tail -n +2 data/products.csv | wc -l

# 3. Create release
gh release create v0.1.0 data/products.csv \
  --title "v0.1.0 - Initial Product Export" \
  --notes "Initial product CSV with X products, 65 columns"

# 4. Update ROADMAP.html - mark Phase 2 complete
# 5. Commit and push
```

### Issue #1 (Collections Schema)
1. Read `docs/architecture.html` - find **Collection** type fields
2. Read `docs/ROADMAP.html` - find example JSON structure
3. Create `api/` directory if needed
4. Create `api/collections.schema.json` (JSON Schema draft-07)
5. Create `api/collections.json` with examples of:
   - Manual collection (explicit product handles)
   - Smart collection (rule-based with `ruleSet`)
   - Collection with metafields
6. Update `docs/ROADMAP.html` - mark Phase 3a complete
7. Commit and push

### Issue #3 (Inventory Schema)
1. Read `docs/architecture.html` - find **InventoryItem** and **InventoryLevel** types
2. Read `docs/ROADMAP.html` - find example JSON structure
3. Create `api/inventory.schema.json` (JSON Schema draft-07)
4. Create `api/inventory.json` with examples of:
   - SKU with multiple locations
   - InventoryItem fields (countryCodeOfOrigin, harmonizedSystemCode)
5. Update `docs/ROADMAP.html` - mark Phase 3b complete
6. Commit and push

## Conventions

### JSON Schema
- Use JSON Schema **draft-07**
- Include `$schema` declaration
- Add `description` fields for documentation

### Git Commits
- Descriptive commit messages
- Reference issue number: `Fixes #2` or `Part of #1`
- Push after completing each issue

### ROADMAP Updates
**Every issue must update `docs/ROADMAP.html`** to mark its phase complete:
- Change phase div class from `current` to `complete`
- Change phase status text to `COMPLETE`

### File Naming
- Schema files: `{name}.schema.json`
- Data files: `{name}.json`
- All API files go in `api/` directory

## Useful Commands

```bash
# List issues
gh issue list

# View issue details
gh issue view 1

# Create a release
gh release create v0.1.0 file1 file2 --title "Title" --notes "Notes"

# Validate JSON
python3 -m json.tool api/collections.json

# Check git status
git status
```

## Goal

Complete product catalog automation with all fields mapped so that:
1. pel-shopify-views can build a SQLite database from our releases
2. pel-shopify-update can sync that database to Shopify
