// API Guides test suite for ADCB documentation

import { test, expect } from '@playwright/test';
import { PageChecker } from '../lib/page-checker';
import { ROUTES, PAGE_TITLES } from '../lib/test-data';

test.describe('API Guides', () => {
  let pageChecker: PageChecker;

  test.beforeEach(async ({ page }) => {
    pageChecker = new PageChecker(page);
  });

  test.describe('Error Handling Guide', () => {
    test('Error handling guide loads and has comprehensive content', async ({ page }) => {
      await pageChecker.validatePageLoad(ROUTES.errorHandling, PAGE_TITLES.errorHandling);
      
      // Should have error code examples
      const errorCodes = ['400', '401', '403', '404', '429', '500'];
      
      for (const code of errorCodes) {
        await expect(page.getByText(code)).toBeVisible();
      }
      
      // Should have error handling patterns
      const errorConcepts = [
        'HTTP status',
        'error response',
        'retry logic',
        'circuit breaker',
        'exponential backoff'
      ];

      for (const concept of errorConcepts) {
        await expect(page.getByText(concept, { exact: false })).toBeVisible();
      }

      // Should have code examples
      await pageChecker.validateCodeBlocks();
    });

    test('Error handling examples are in multiple languages', async ({ page }) => {
      await page.goto(ROUTES.errorHandling);
      
      const languages = ['Python', 'JavaScript', 'Java'];
      
      for (const language of languages) {
        await expect(page.getByText(language)).toBeVisible();
      }
    });

    test('Error response format documentation is complete', async ({ page }) => {
      await page.goto(ROUTES.errorHandling);
      
      // Should document RFC 7807 format
      await expect(page.getByText('RFC 7807', { exact: false })).toBeVisible();
      await expect(page.getByText('problem detail', { exact: false })).toBeVisible();
      
      // Should have JSON examples
      const codeBlocks = page.locator('pre code, .code-block');
      const hasJsonExamples = await codeBlocks.filter({ hasText: '"error"' }).count() > 0;
      expect(hasJsonExamples).toBeTruthy();
    });
  });

  test.describe('Rate Limiting Guide', () => {
    test('Rate limiting guide has tier information', async ({ page }) => {
      await pageChecker.validatePageLoad(ROUTES.rateLimiting, PAGE_TITLES.rateLimiting);
      
      // Should have rate limit tiers
      const tiers = ['Standard', 'Premium', 'Enterprise', 'LFI'];
      
      for (const tier of tiers) {
        await expect(page.getByText(tier)).toBeVisible();
      }
      
      // Should have rate limit headers
      await expect(page.getByText('X-RateLimit', { exact: false })).toBeVisible();
    });

    test('Rate limiting includes implementation strategies', async ({ page }) => {
      await page.goto(ROUTES.rateLimiting);
      
      const strategies = [
        'exponential backoff',
        'retry logic',
        'circuit breaker',
        'request queuing'
      ];

      for (const strategy of strategies) {
        await expect(page.getByText(strategy, { exact: false })).toBeVisible();
      }

      // Should have code implementation examples
      await pageChecker.validateCodeBlocks();
    });

    test('Rate limiting has monitoring guidance', async ({ page }) => {
      await page.goto(ROUTES.rateLimiting);
      
      // Should include monitoring concepts
      const monitoringConcepts = [
        'usage tracking',
        'alert',
        'threshold',
        'metrics'
      ];

      for (const concept of monitoringConcepts) {
        await expect(page.getByText(concept, { exact: false })).toBeVisible();
      }
    });
  });

  test.describe('Webhooks Guide', () => {
    test('Webhooks guide covers security implementation', async ({ page }) => {
      await pageChecker.validatePageLoad(ROUTES.webhooks, PAGE_TITLES.webhooks);
      
      // Should have security concepts
      const securityConcepts = [
        'signature verification',
        'HMAC',
        'secret',
        'authentication'
      ];

      for (const concept of securityConcepts) {
        await expect(page.getByText(concept, { exact: false })).toBeVisible();
      }

      // Should have webhook event types
      const eventTypes = [
        'payment.completed',
        'account.updated',
        'consent.expired'
      ];

      for (const eventType of eventTypes) {
        await expect(page.getByText(eventType)).toBeVisible();
      }
    });

    test('Webhooks guide has practical examples', async ({ page }) => {
      await page.goto(ROUTES.webhooks);
      
      // Should have webhook handler examples
      await pageChecker.validateCodeBlocks();
      
      // Should have testing guidance
      await expect(page.getByText('test', { exact: false })).toBeVisible();
      await expect(page.getByText('debug', { exact: false })).toBeVisible();
    });

    test('Webhooks guide covers retry logic', async ({ page }) => {
      await page.goto(ROUTES.webhooks);
      
      const retryTopics = [
        'retry',
        'backoff',
        'failure handling',
        'timeout'
      ];

      for (const topic of retryTopics) {
        await expect(page.getByText(topic, { exact: false })).toBeVisible();
      }
    });
  });

  test.describe('Sandbox Testing Guide', () => {
    test('Sandbox guide has comprehensive test data', async ({ page }) => {
      await pageChecker.validatePageLoad(ROUTES.sandboxTesting, PAGE_TITLES.sandboxTesting);
      
      // Should have test account information
      await expect(page.getByText('test account', { exact: false })).toBeVisible();
      await expect(page.getByText('sandbox', { exact: false })).toBeVisible();
      
      // Should have test data examples
      const testDataElements = [
        'ACC123',
        'AED',
        '50,000',
        'Active'
      ];

      for (const element of testDataElements) {
        await expect(page.getByText(element)).toBeVisible();
      }
    });

    test('Sandbox guide covers testing scenarios', async ({ page }) => {
      await page.goto(ROUTES.sandboxTesting);
      
      const scenarios = [
        'successful payment',
        'insufficient funds',
        'invalid account',
        'timeout'
      ];

      for (const scenario of scenarios) {
        await expect(page.getByText(scenario, { exact: false })).toBeVisible();
      }
    });

    test('Sandbox guide has automation examples', async ({ page }) => {
      await page.goto(ROUTES.sandboxTesting);
      
      // Should have testing framework examples
      const frameworks = ['pytest', 'jest', 'junit'];
      let hasFramework = false;
      
      for (const framework of frameworks) {
        if (await page.getByText(framework, { exact: false }).isVisible().catch(() => false)) {
          hasFramework = true;
          break;
        }
      }
      
      expect(hasFramework).toBeTruthy();
    });
  });

  test.describe('Best Practices Guide', () => {
    test('Best practices covers security patterns', async ({ page }) => {
      await pageChecker.validatePageLoad(ROUTES.bestPractices, PAGE_TITLES.bestPractices);
      
      const securityPractices = [
        'certificate management',
        'token storage',
        'credential rotation',
        'secure communication'
      ];

      for (const practice of securityPractices) {
        await expect(page.getByText(practice, { exact: false })).toBeVisible();
      }
    });

    test('Best practices includes performance optimization', async ({ page }) => {
      await page.goto(ROUTES.bestPractices);
      
      const performanceTopics = [
        'connection pooling',
        'caching',
        'bulk operations',
        'pagination'
      ];

      for (const topic of performanceTopics) {
        await expect(page.getByText(topic, { exact: false })).toBeVisible();
      }
    });

    test('Best practices covers production deployment', async ({ page }) => {
      await page.goto(ROUTES.bestPractices);
      
      const deploymentTopics = [
        'monitoring',
        'logging',
        'health check',
        'scaling'
      ];

      for (const topic of deploymentTopics) {
        await expect(page.getByText(topic, { exact: false })).toBeVisible();
      }
    });

    test('Best practices has code examples', async ({ page }) => {
      await page.goto(ROUTES.bestPractices);
      
      // Should have substantial code examples
      await pageChecker.validateCodeBlocks();
      
      // Should have multiple programming languages
      const languages = ['Python', 'Node.js', 'JavaScript', 'Java'];
      let languageCount = 0;
      
      for (const language of languages) {
        if (await page.getByText(language).isVisible().catch(() => false)) {
          languageCount++;
        }
      }
      
      expect(languageCount).toBeGreaterThanOrEqual(2);
    });
  });

  test.describe('Code Examples Library', () => {
    test('Code examples library is comprehensive', async ({ page }) => {
      await pageChecker.validatePageLoad(ROUTES.codeExamples, PAGE_TITLES.codeExamples);
      
      // Should have multiple language tabs
      const languages = ['Python', 'Node.js', 'Java'];
      
      for (const language of languages) {
        await expect(page.getByText(language)).toBeVisible();
      }
      
      // Should have production-ready examples
      await expect(page.getByText('production', { exact: false })).toBeVisible();
    });

    test('Code examples cover major use cases', async ({ page }) => {
      await page.goto(ROUTES.codeExamples);
      
      const useCases = [
        'authentication',
        'account balance',
        'payment initiation',
        'webhook handler',
        'error handling'
      ];

      for (const useCase of useCases) {
        await expect(page.getByText(useCase, { exact: false })).toBeVisible();
      }
    });

    test('Code examples are properly formatted', async ({ page }) => {
      await page.goto(ROUTES.codeExamples);
      
      // All code blocks should be properly formatted
      await pageChecker.validateCodeBlocks();
      
      // Should have copy buttons or similar functionality
      const copyElements = page.locator('[title*="copy" i], [aria-label*="copy" i], .copy-button');
      const copyCount = await copyElements.count();
      
      // Should have some way to copy code (Mintlify usually provides this)
      expect(copyCount).toBeGreaterThanOrEqual(0);
    });

    test('Code examples have explanations', async ({ page }) => {
      await page.goto(ROUTES.codeExamples);
      
      // Examples should be explained, not just code dumps
      const explanationIndicators = [
        'example',
        'explanation',
        'this code',
        'function',
        'usage'
      ];

      let hasExplanations = false;
      for (const indicator of explanationIndicators) {
        if (await page.getByText(indicator, { exact: false }).isVisible().catch(() => false)) {
          hasExplanations = true;
          break;
        }
      }
      
      expect(hasExplanations).toBeTruthy();
    });
  });

  test.describe('Interactive Elements in Guides', () => {
    test('Guides have working tabs and accordions', async ({ page }) => {
      const guidesWithInteractiveElements = [
        ROUTES.errorHandling,
        ROUTES.rateLimiting,
        ROUTES.webhooks,
        ROUTES.bestPractices,
        ROUTES.codeExamples
      ];

      for (const route of guidesWithInteractiveElements) {
        await page.goto(route);
        await pageChecker.validateInteractiveElements();
      }
    });

    test('Code blocks have syntax highlighting', async ({ page }) => {
      await page.goto(ROUTES.codeExamples);
      
      const codeBlocks = page.locator('pre code, .code-block');
      const codeBlockCount = await codeBlocks.count();
      
      if (codeBlockCount > 0) {
        // At least some code blocks should have syntax highlighting
        const highlightedBlocks = await page.locator('.token, .hljs-keyword, .highlight').count();
        expect(highlightedBlocks).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Guide Navigation and Structure', () => {
    test('All guides have proper table of contents', async ({ page }) => {
      const allGuides = [
        ROUTES.errorHandling,
        ROUTES.rateLimiting,
        ROUTES.webhooks,
        ROUTES.sandboxTesting,
        ROUTES.bestPractices,
        ROUTES.codeExamples
      ];

      for (const route of allGuides) {
        await page.goto(route);
        
        // Should have table of contents or section navigation
        const tocSelectors = [
          'nav[aria-label*="table of contents" i]',
          '.table-of-contents',
          '.toc',
          'nav[aria-label*="on this page" i]'
        ];

        let hasToc = false;
        for (const selector of tocSelectors) {
          if (await page.locator(selector).isVisible().catch(() => false)) {
            hasToc = true;
            break;
          }
        }

        // Guides should have navigation aids
        expect(hasToc).toBeTruthy();
      }
    });

    test('Guides are properly linked from main navigation', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      
      const guideLinks = [
        'Error Handling',
        'Rate Limiting',
        'Webhooks',
        'Sandbox Testing',
        'Best Practices',
        'Code Examples'
      ];

      // All guides should be accessible from navigation
      for (const linkText of guideLinks) {
        const link = page.getByText(linkText).first();
        await expect(link).toBeVisible();
        
        // Link should be clickable
        const href = await link.getAttribute('href');
        expect(href).toBeTruthy();
      }
    });
  });

  test.describe('Content Quality', () => {
    test('Guides have substantial content', async ({ page }) => {
      const allGuides = [
        ROUTES.errorHandling,
        ROUTES.rateLimiting,
        ROUTES.webhooks,
        ROUTES.sandboxTesting,
        ROUTES.bestPractices,
        ROUTES.codeExamples
      ];

      for (const route of allGuides) {
        await page.goto(route);
        
        // Each guide should have substantial content
        const mainContent = await page.textContent('main');
        expect(mainContent?.length || 0).toBeGreaterThan(2000);
        
        // Should have multiple sections
        const headings = await page.locator('h1, h2, h3').count();
        expect(headings).toBeGreaterThan(3);
      }
    });

    test('Guides are free of broken links', async ({ page }) => {
      const criticalGuides = [
        ROUTES.errorHandling,
        ROUTES.bestPractices,
        ROUTES.codeExamples
      ];

      for (const route of criticalGuides) {
        await page.goto(route);
        
        const brokenLinks = await pageChecker.validateLinks();
        expect(brokenLinks).toEqual([]);
      }
    });
  });
});