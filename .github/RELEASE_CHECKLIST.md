# Release Checklist for pel-shopify-seeds

Each release should be a **complete snapshot** for pel-shopify-views consumption.

## Required Assets

### CSV Data (from `data/` - gitignored)
- [ ] `products.csv` - Shopify product export (65 columns)

### API Definitions (from `api/` - tracked in repo)
- [ ] `collections.json` - Collection definitions
- [ ] `collections.schema.json` - JSON Schema for collections
- [ ] `inventory.json` - Multi-location inventory
- [ ] `inventory.schema.json` - JSON Schema for inventory

## Release Command

```bash
gh release create vX.Y.Z \
  data/products.csv \
  api/collections.json \
  api/collections.schema.json \
  api/inventory.json \
  api/inventory.schema.json \
  --title "vX.Y.Z - Description" \
  --notes "Release notes here"
```

## Versioning

- **Major (X)**: Breaking schema changes
- **Minor (Y)**: New data/schemas added
- **Patch (Z)**: Data updates, fixes

## Post-Release

After creating a release, pel-shopify-views should automatically detect it and build a new SQLite DB release.
