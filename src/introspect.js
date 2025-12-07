#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const API_VERSION = '2024-01';

if (!SHOPIFY_STORE_URL || !SHOPIFY_ACCESS_TOKEN) {
  console.error('Error: SHOPIFY_STORE_URL and SHOPIFY_ACCESS_TOKEN environment variables are required');
  console.error('Usage: SHOPIFY_STORE_URL=your-store.myshopify.com SHOPIFY_ACCESS_TOKEN=shpat_xxx node src/introspect.js');
  process.exit(1);
}

const TYPES_TO_INTROSPECT = [
  'Product',
  'ProductVariant',
  'Collection',
  'InventoryItem',
  'InventoryLevel',
  'Location',
  'Metafield',
];

const INTROSPECTION_QUERY = `
query IntrospectType($typeName: String!) {
  __type(name: $typeName) {
    name
    kind
    description
    fields {
      name
      description
      type {
        name
        kind
        ofType {
          name
          kind
          ofType {
            name
            kind
            ofType {
              name
              kind
            }
          }
        }
      }
    }
    enumValues {
      name
      description
    }
  }
}
`;

function graphqlRequest(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const hostname = SHOPIFY_STORE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const postData = JSON.stringify({ query, variables });

    const options = {
      hostname,
      port: 443,
      path: `/admin/api/${API_VERSION}/graphql.json`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.errors) {
            reject(new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`));
          } else {
            resolve(json.data);
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function resolveType(typeObj) {
  if (!typeObj) return 'Unknown';

  if (typeObj.name) {
    return typeObj.name;
  }

  if (typeObj.kind === 'NON_NULL') {
    return `${resolveType(typeObj.ofType)}!`;
  }

  if (typeObj.kind === 'LIST') {
    return `[${resolveType(typeObj.ofType)}]`;
  }

  return typeObj.kind || 'Unknown';
}

function formatFieldType(typeObj) {
  const typeName = resolveType(typeObj);
  const baseType = typeName.replace(/[!\[\]]/g, '');
  const isRequired = typeName.endsWith('!');
  const isList = typeName.includes('[');

  return { typeName, baseType, isRequired, isList };
}

async function introspectType(typeName) {
  console.log(`Introspecting ${typeName}...`);
  const data = await graphqlRequest(INTROSPECTION_QUERY, { typeName });

  if (!data.__type) {
    console.warn(`  Warning: Type ${typeName} not found in schema`);
    return null;
  }

  return data.__type;
}

function generateTypeDefinition(typeInfo) {
  if (!typeInfo || !typeInfo.fields) {
    return null;
  }

  const fields = {};
  for (const field of typeInfo.fields) {
    const { typeName, baseType, isRequired, isList } = formatFieldType(field.type);
    fields[field.name] = {
      type: typeName,
      baseType,
      required: isRequired,
      list: isList,
      description: field.description || undefined,
    };
  }

  return {
    name: typeInfo.name,
    kind: typeInfo.kind,
    description: typeInfo.description || undefined,
    fields,
  };
}

const QUERY_MAPPINGS = {
  Product: {
    listQuery: 'products',
    singleQuery: 'product(id: ID!)',
    scope: 'read_products',
  },
  ProductVariant: {
    listQuery: 'productVariants',
    singleQuery: 'productVariant(id: ID!)',
    scope: 'read_products',
  },
  Collection: {
    listQuery: 'collections',
    singleQuery: 'collection(id: ID!)',
    scope: 'read_products',
  },
  InventoryItem: {
    listQuery: 'inventoryItems',
    singleQuery: 'inventoryItem(id: ID!)',
    scope: 'read_inventory, read_products',
  },
  InventoryLevel: {
    listQuery: 'inventoryLevels (via inventoryItem)',
    singleQuery: 'inventoryLevel(id: ID!)',
    scope: 'read_inventory',
  },
  Location: {
    listQuery: 'locations',
    singleQuery: 'location(id: ID)',
    scope: 'read_locations',
  },
  Metafield: {
    listQuery: 'metafields (via parent object)',
    singleQuery: 'metafield(id: ID!)',
    scope: 'varies by owner type',
  },
};

async function main() {
  console.log('Shopify GraphQL Schema Introspection');
  console.log('====================================\n');
  console.log(`Store: ${SHOPIFY_STORE_URL}`);
  console.log(`API Version: ${API_VERSION}\n`);

  const types = {};
  const queryMappings = {};

  for (const typeName of TYPES_TO_INTROSPECT) {
    try {
      const typeInfo = await introspectType(typeName);
      const typeDef = generateTypeDefinition(typeInfo);

      if (typeDef) {
        types[typeName] = typeDef;
        queryMappings[typeName] = QUERY_MAPPINGS[typeName] || { note: 'Query mapping not defined' };
        console.log(`  Found ${Object.keys(typeDef.fields).length} fields`);
      }
    } catch (error) {
      console.error(`  Error introspecting ${typeName}: ${error.message}`);
    }
  }

  const output = {
    generatedAt: new Date().toISOString(),
    apiVersion: API_VERSION,
    store: SHOPIFY_STORE_URL.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    types,
    queryMappings,
  };

  const outputPath = path.join(__dirname, '..', 'api', 'types.js');
  const jsContent = `// Auto-generated Shopify API response schemas
// Generated: ${output.generatedAt}
// API Version: ${output.apiVersion}
//
// This file is generated by src/introspect.js
// Do not edit manually - regenerate with:
//   SHOPIFY_STORE_URL=xxx SHOPIFY_ACCESS_TOKEN=xxx node src/introspect.js

/**
 * Shopify API types for pel-shopify-views
 *
 * Query Mappings:
 * - Product: products / product(id: ID!) - scope: read_products
 * - ProductVariant: productVariants / productVariant(id: ID!) - scope: read_products
 * - Collection: collections / collection(id: ID!) - scope: read_products
 * - InventoryItem: inventoryItems / inventoryItem(id: ID!) - scope: read_inventory, read_products
 * - InventoryLevel: inventoryLevels (via inventoryItem) / inventoryLevel(id: ID!) - scope: read_inventory
 * - Location: locations / location(id: ID) - scope: read_locations
 * - Metafield: metafields (via parent object) / metafield(id: ID!) - scope: varies by owner type
 */

module.exports = ${JSON.stringify(output, null, 2)};
`;

  fs.writeFileSync(outputPath, jsContent);
  console.log(`\nGenerated ${outputPath}`);
  console.log(`Total types introspected: ${Object.keys(types).length}`);

  console.log('\n--- Summary ---');
  for (const [name, typeDef] of Object.entries(types)) {
    console.log(`${name}: ${Object.keys(typeDef.fields).length} fields`);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
