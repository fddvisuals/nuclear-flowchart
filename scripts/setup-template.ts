#!/usr/bin/env tsx

import { TemplateConfigManager } from './template-config-manager';

async function setupTemplate() {
  console.log('🚀 Setting up FDD Visual Template...\n');
  
  const configManager = new TemplateConfigManager();
  const config = configManager.loadConfig();
  
  console.log('📝 Project Config:');
  console.log(`   Name: ${config.project.name}`);
  console.log(`   Repository: ${config.project.githubPages.repository}`);
  console.log(`   Base URL: ${config.project.githubPages.baseUrl}\n`);
  
  // Update configuration files
  configManager.updateViteConfig(config);
  configManager.updatePackageJson(config);
  configManager.generateIndexHtml(config);
  configManager.generateStructuredData(config);
  
  console.log('\n✨ Template setup complete!');
  console.log('\nNext steps:');
  console.log('1. Update template.config.json with your project details');
  console.log('2. Customize the InteractiveContainer component');
  console.log('3. Add your data files to the public/ directory');
  console.log('4. Run `npm run dev` to start development');
  console.log('5. Run `npm run build` to build for production\n');
}

setupTemplate().catch(console.error);
