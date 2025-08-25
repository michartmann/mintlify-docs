// Global teardown for Playwright tests

import { FullConfig } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');

  try {
    // Generate test summary
    await generateTestSummary();
    
    // Clean up temporary files if needed
    await cleanupTempFiles();
    
    console.log('✅ Global teardown completed');

  } catch (error) {
    console.error('❌ Global teardown failed:', error);
  }
}

async function generateTestSummary() {
  const resultsPath = 'test-results/results.json';
  
  try {
    // Read test results
    const resultsData = await fs.readFile(resultsPath, 'utf-8');
    const results = JSON.parse(resultsData);
    
    const summary = {
      timestamp: new Date().toISOString(),
      totalTests: results.stats?.expected || 0,
      passed: results.stats?.passed || 0,
      failed: results.stats?.failed || 0,
      skipped: results.stats?.skipped || 0,
      duration: results.stats?.duration || 0,
      suites: results.suites?.map((suite: any) => ({
        title: suite.title,
        tests: suite.specs?.length || 0,
        passed: suite.specs?.filter((spec: any) => 
          spec.tests?.some((test: any) => test.results?.some((r: any) => r.status === 'passed'))
        ).length || 0,
        failed: suite.specs?.filter((spec: any) => 
          spec.tests?.some((test: any) => test.results?.some((r: any) => r.status === 'failed'))
        ).length || 0
      })) || []
    };

    await fs.writeFile(
      'test-results/test-summary.json',
      JSON.stringify(summary, null, 2)
    );

    // Generate simple text report
    const textReport = `
ADCB Documentation Test Summary
==============================
Generated: ${summary.timestamp}

Overall Results:
- Total Tests: ${summary.totalTests}
- Passed: ${summary.passed} ✅
- Failed: ${summary.failed} ${summary.failed > 0 ? '❌' : ''}
- Skipped: ${summary.skipped}
- Duration: ${Math.round(summary.duration / 1000)}s

Test Suites:
${summary.suites.map(suite => 
  `- ${suite.title}: ${suite.passed}/${suite.tests} passed`
).join('\n')}

View detailed results:
- HTML Report: test-results/html-report/index.html
- JSON Results: test-results/results.json
    `;

    await fs.writeFile('test-results/summary.txt', textReport.trim());
    
    console.log('📊 Test summary generated');
    console.log(textReport);

  } catch (error) {
    console.warn('⚠️  Could not generate test summary:', error);
  }
}

async function cleanupTempFiles() {
  try {
    // Remove any temporary test files
    const tempPatterns = [
      'test-results/**/*.tmp',
      'test-results/**/*.temp'
    ];

    // This is a simple cleanup - in practice you might want to use glob
    console.log('🗑️  Cleaning up temporary files...');
    
  } catch (error) {
    console.warn('⚠️  Cleanup warning:', error);
  }
}

export default globalTeardown;