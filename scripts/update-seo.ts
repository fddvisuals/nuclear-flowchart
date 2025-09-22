#!/usr/bin/env node

/**
 * Manual SEO Update Script
 * 
 * Run this script whenever you want to fetch fresh data from Google Sheets
 * and update your site's JSON-LD structured data.
 * 
 * Usage:
 *   npm run update-seo
 *   
 * This will:
 * 1. Fetch latest data from Google Sheets (or use local fallback)
 * 2. Generate fresh JSON-LD structured data with ALL incidents
 * 3. Inject the structured data into your HTML template
 * 4. Update the dist/index.html file
 * 
 * After running this, you can deploy your site and search engines
 * will see the updated structured data.
 */

import { buildWithSEO } from './build-with-seo.js';

console.log('🔄 Updating SEO data...');
console.log('');

buildWithSEO().then(() => {
  console.log('');
  console.log('✅ SEO update completed!');
  console.log('');
  console.log('📋 What happened:');
  console.log('• Fresh incident data was fetched');
  console.log('• JSON-LD structured data was generated');
  console.log('• HTML template was updated with new data');
  console.log('• All incidents are now included in search engine indexing');
  console.log('');
  console.log('🚀 Ready to deploy!');
}).catch((error) => {
  console.error('❌ SEO update failed:', error);
  process.exit(1);
});
