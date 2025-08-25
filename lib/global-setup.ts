// Global setup for Playwright tests

import { chromium, FullConfig } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for ADCB documentation tests...');

  // Create necessary directories
  const dirs = [
    'test-results',
    'test-results/screenshots',
    'test-results/artifacts',
    'test-results/html-report'
  ];

  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }

  // Create a baseline browser context for setup tasks
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Verify the site is accessible
    console.log('📡 Verifying site accessibility...');
    await page.goto('https://adcb.mintlify.app', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    const title = await page.title();
    console.log(`✅ Site accessible. Title: ${title}`);

    // Warm up critical pages (optional - helps with cache)
    const criticalPages = [
      '/',
      '/quickstart',
      '/authentication',
      '/guides/error-handling',
      '/resources/sdks'
    ];

    console.log('🔥 Warming up critical pages...');
    for (const pagePath of criticalPages) {
      try {
        await page.goto(`https://adcb.mintlify.app${pagePath}`);
        await page.waitForLoadState('domcontentloaded');
      } catch (error) {
        console.warn(`⚠️  Could not warm up ${pagePath}:`, error);
      }
    }

    // Generate test manifest
    await generateTestManifest();
    
    console.log('✅ Global setup completed successfully');

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function generateTestManifest() {
  const manifest = {
    timestamp: new Date().toISOString(),
    site: 'https://adcb.mintlify.app',
    testSuites: [
      'core-pages',
      'api-guides', 
      'resources',
      'api-reference',
      'content-validation',
      'performance',
      'accessibility'
    ],
    expectedPages: [
      '/',
      '/quickstart',
      '/authentication',
      '/development',
      '/api-playground',
      '/guides/error-handling',
      '/guides/rate-limiting',
      '/guides/webhooks',
      '/guides/sandbox-testing',
      '/guides/best-practices',
      '/guides/code-examples',
      '/resources/sdks',
      '/resources/postman',
      '/resources/changelog',
      '/resources/pricing',
      '/resources/support',
      '/resources/community',
      '/api-reference/versions',
      '/tutorials/integration-paths',
      '/developer-tools',
      '/deployment-status'
    ],
    browsers: [
      'chromium',
      'firefox', 
      'webkit'
    ],
    devices: [
      'Desktop',
      'Mobile Chrome',
      'Mobile Safari',
      'iPad'
    ]
  };

  await fs.writeFile(
    'test-results/test-manifest.json',
    JSON.stringify(manifest, null, 2)
  );

  console.log('📋 Test manifest generated');
}

export default globalSetup;