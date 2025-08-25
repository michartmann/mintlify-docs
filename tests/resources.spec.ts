// Resources test suite for ADCB documentation

import { test, expect } from '@playwright/test';
import { PageChecker } from '../lib/page-checker';
import { ROUTES, PAGE_TITLES } from '../lib/test-data';

test.describe('Resources', () => {
  let pageChecker: PageChecker;

  test.beforeEach(async ({ page }) => {
    pageChecker = new PageChecker(page);
  });

  test.describe('SDK Documentation', () => {
    test('SDK page lists all supported languages', async ({ page }) => {
      await pageChecker.validatePageLoad(ROUTES.sdks, PAGE_TITLES.sdks);
      
      const supportedLanguages = ['Python', 'Node.js', 'Java', 'Go', '.NET'];
      
      for (const language of supportedLanguages) {
        await expect(page.getByText(language)).toBeVisible();
      }
    });

    test('SDK installation instructions are comprehensive', async ({ page }) => {
      await page.goto(ROUTES.sdks);
      
      // Should have installation commands
      await pageChecker.validateCodeBlocks();
      
      const installationCommands = ['pip install', 'npm install', 'maven', 'go get'];
      let hasInstallCommands = false;
      
      for (const command of installationCommands) {
        if (await page.getByText(command).isVisible().catch(() => false)) {
          hasInstallCommands = true;
          break;
        }
      }
      
      expect(hasInstallCommands).toBeTruthy();
    });

    test('SDK documentation includes usage examples', async ({ page }) => {
      await page.goto(ROUTES.sdks);
      
      // Should have usage examples for each SDK
      const usageIndicators = [
        'example',
        'usage',
        'import',
        'require',
        'from adcb',
        'ADCBClient'
      ];

      let hasUsageExamples = false;
      for (const indicator of usageIndicators) {
        if (await page.getByText(indicator, { exact: false }).isVisible().catch(() => false)) {
          hasUsageExamples = true;
          break;
        }
      }
      
      expect(hasUsageExamples).toBeTruthy();
    });

    test('SDK page has feature comparison table', async ({ page }) => {
      await page.goto(ROUTES.sdks);
      
      // Should have a comparison table or feature list
      const tableOrList = page.locator('table, .comparison, .feature-list');
      const hasComparison = await tableOrList.count() > 0;
      
      expect(hasComparison).toBeTruthy();
    });
  });

  test.describe('Postman Collection', () => {
    test('Postman page has collection download', async ({ page }) => {
      await pageChecker.validatePageLoad(ROUTES.postman, PAGE_TITLES.postman);
      
      // Should have download link or button
      const downloadElements = page.locator('[href*="postman"], [href*="collection"], a[download]');
      const downloadCount = await downloadElements.count();
      
      expect(downloadCount).toBeGreaterThan(0);
    });

    test('Postman guide covers authentication setup', async ({ page }) => {
      await page.goto(ROUTES.postman);
      
      const authTopics = [
        'authentication',
        'environment',
        'variable',
        'token',
        'certificate'
      ];

      for (const topic of authTopics) {
        await expect(page.getByText(topic, { exact: false })).toBeVisible();
      }
    });

    test('Postman collection includes test scenarios', async ({ page }) => {
      await page.goto(ROUTES.postman);
      
      const testScenarios = [
        'test',
        'scenario',
        'request',
        'response',
        'validation'
      ];

      let hasTestInfo = false;
      for (const scenario of testScenarios) {
        if (await page.getByText(scenario, { exact: false }).isVisible().catch(() => false)) {
          hasTestInfo = true;
          break;
        }
      }
      
      expect(hasTestInfo).toBeTruthy();
    });

    test('Postman page has setup instructions', async ({ page }) => {
      await page.goto(ROUTES.postman);
      
      // Should have step-by-step setup
      const setupSteps = ['Step 1', 'Step 2', 'import', 'configure', 'setup'];
      let hasSteps = false;
      
      for (const step of setupSteps) {
        if (await page.getByText(step, { exact: false }).isVisible().catch(() => false)) {
          hasSteps = true;
          break;
        }
      }
      
      expect(hasSteps).toBeTruthy();
    });
  });

  test.describe('Changelog', () => {
    test('Changelog has version history', async ({ page }) => {
      await pageChecker.validatePageLoad(ROUTES.changelog, PAGE_TITLES.changelog);
      
      const versions = ['v2.1.0', 'v2.0.0', 'v1.3'];
      
      for (const version of versions) {
        await expect(page.getByText(version)).toBeVisible();
      }
    });

    test('Changelog includes breaking changes documentation', async ({ page }) => {
      await page.goto(ROUTES.changelog);
      
      const breakingChangeTerms = [
        'breaking change',
        'migration',
        'deprecated',
        'removed'
      ];

      for (const term of breakingChangeTerms) {
        await expect(page.getByText(term, { exact: false })).toBeVisible();
      }
    });

    test('Changelog has dates and descriptions', async ({ page }) => {
      await page.goto(ROUTES.changelog);
      
      // Should have release dates
      const datePattern = /\d{4}|\d{2}\/\d{2}|\d{2}-\d{2}|January|February|March|April|May|June|July|August|September|October|November|December/;
      const pageText = await page.textContent('main');
      
      expect(datePattern.test(pageText || '')).toBeTruthy();
      
      // Should have feature descriptions
      const featureTerms = ['new', 'added', 'improved', 'fixed', 'feature'];
      let hasFeatures = false;
      
      for (const term of featureTerms) {
        if (await page.getByText(term, { exact: false }).isVisible().catch(() => false)) {
          hasFeatures = true;
          break;
        }
      }
      
      expect(hasFeatures).toBeTruthy();
    });

    test('Changelog has migration guides', async ({ page }) => {
      await page.goto(ROUTES.changelog);
      
      const migrationTopics = [
        'migration',
        'upgrade',
        'guide',
        'steps',
        'before',
        'after'
      ];

      let hasMigrationInfo = false;
      for (const topic of migrationTopics) {
        if (await page.getByText(topic, { exact: false }).isVisible().catch(() => false)) {
          hasMigrationInfo = true;
          break;
        }
      }
      
      expect(hasMigrationInfo).toBeTruthy();
    });
  });

  test.describe('Pricing Documentation', () => {
    test('Pricing page has clear tier structure', async ({ page }) => {
      await pageChecker.validatePageLoad(ROUTES.pricing, PAGE_TITLES.pricing);
      
      const pricingTiers = ['Sandbox', 'Starter', 'Business', 'Enterprise'];
      
      for (const tier of pricingTiers) {
        await expect(page.getByText(tier)).toBeVisible();
      }
    });

    test('Pricing includes cost per API call', async ({ page }) => {
      await page.goto(ROUTES.pricing);
      
      // Should have pricing information
      const pricingIndicators = ['$', 'USD', 'per call', 'cost', 'price'];
      let hasPricing = false;
      
      for (const indicator of pricingIndicators) {
        if (await page.getByText(indicator, { exact: false }).isVisible().catch(() => false)) {
          hasPricing = true;
          break;
        }
      }
      
      expect(hasPricing).toBeTruthy();
    });

    test('Pricing page has usage examples', async ({ page }) => {
      await page.goto(ROUTES.pricing);
      
      // Should have usage calculations or examples
      const usageTerms = [
        'usage',
        'call',
        'request',
        'volume',
        'limit'
      ];

      let hasUsageInfo = false;
      for (const term of usageTerms) {
        if (await page.getByText(term, { exact: false }).isVisible().catch(() => false)) {
          hasUsageInfo = true;
          break;
        }
      }
      
      expect(hasUsageInfo).toBeTruthy();
    });

    test('Pricing includes cost optimization tips', async ({ page }) => {
      await page.goto(ROUTES.pricing);
      
      const optimizationTopics = [
        'optimization',
        'reduce cost',
        'efficiency',
        'bulk',
        'cache',
        'strategy'
      ];

      let hasOptimization = false;
      for (const topic of optimizationTopics) {
        if (await page.getByText(topic, { exact: false }).isVisible().catch(() => false)) {
          hasOptimization = true;
          break;
        }
      }
      
      expect(hasOptimization).toBeTruthy();
    });
  });

  test.describe('Support Documentation', () => {
    test('Support page has contact information', async ({ page }) => {
      await pageChecker.validatePageLoad(ROUTES.support, PAGE_TITLES.support);
      
      // Should have contact methods
      const contactMethods = [
        'email',
        'support@',
        'api-support@adcb.com',
        'phone',
        'chat'
      ];

      let hasContact = false;
      for (const method of contactMethods) {
        if (await page.getByText(method, { exact: false }).isVisible().catch(() => false)) {
          hasContact = true;
          break;
        }
      }
      
      expect(hasContact).toBeTruthy();
    });

    test('Support page has SLA information', async ({ page }) => {
      await page.goto(ROUTES.support);
      
      const slaTerms = [
        'SLA',
        'response time',
        'hours',
        'support tier',
        'priority'
      ];

      let hasSLA = false;
      for (const term of slaTerms) {
        if (await page.getByText(term, { exact: false }).isVisible().catch(() => false)) {
          hasSLA = true;
          break;
        }
      }
      
      expect(hasSLA).toBeTruthy();
    });

    test('Support page includes troubleshooting resources', async ({ page }) => {
      await page.goto(ROUTES.support);
      
      const troubleshootingTopics = [
        'troubleshoot',
        'FAQ',
        'common issue',
        'problem',
        'solution'
      ];

      let hasTroubleshooting = false;
      for (const topic of troubleshootingTopics) {
        if (await page.getByText(topic, { exact: false }).isVisible().catch(() => false)) {
          hasTroubleshooting = true;
          break;
        }
      }
      
      expect(hasTroubleshooting).toBeTruthy();
    });

    test('Support page has escalation procedures', async ({ page }) => {
      await page.goto(ROUTES.support);
      
      const escalationTerms = [
        'escalat',
        'urgent',
        'critical',
        'emergency',
        'priority'
      ];

      let hasEscalation = false;
      for (const term of escalationTerms) {
        if (await page.getByText(term, { exact: false }).isVisible().catch(() => false)) {
          hasEscalation = true;
          break;
        }
      }
      
      expect(hasEscalation).toBeTruthy();
    });
  });

  test.describe('Community Hub', () => {
    test('Community page has platform links', async ({ page }) => {
      await pageChecker.validatePageLoad(ROUTES.community, PAGE_TITLES.community);
      
      const communityPlatforms = [
        'GitHub',
        'Stack Overflow',
        'Discord',
        'LinkedIn'
      ];

      for (const platform of communityPlatforms) {
        await expect(page.getByText(platform)).toBeVisible();
      }
    });

    test('Community page includes events information', async ({ page }) => {
      await page.goto(ROUTES.community);
      
      const eventTypes = [
        'meetup',
        'hackathon',
        'workshop',
        'webinar',
        'conference'
      ];

      let hasEvents = false;
      for (const eventType of eventTypes) {
        if (await page.getByText(eventType, { exact: false }).isVisible().catch(() => false)) {
          hasEvents = true;
          break;
        }
      }
      
      expect(hasEvents).toBeTruthy();
    });

    test('Community page has contribution guidelines', async ({ page }) => {
      await page.goto(ROUTES.community);
      
      const contributionTopics = [
        'contribute',
        'guideline',
        'code of conduct',
        'community',
        'participate'
      ];

      let hasGuidelines = false;
      for (const topic of contributionTopics) {
        if (await page.getByText(topic, { exact: false }).isVisible().catch(() => false)) {
          hasGuidelines = true;
          break;
        }
      }
      
      expect(hasGuidelines).toBeTruthy();
    });

    test('Community page shows recognition programs', async ({ page }) => {
      await page.goto(ROUTES.community);
      
      const recognitionTerms = [
        'champion',
        'contributor',
        'badge',
        'reward',
        'recognition'
      ];

      let hasRecognition = false;
      for (const term of recognitionTerms) {
        if (await page.getByText(term, { exact: false }).isVisible().catch(() => false)) {
          hasRecognition = true;
          break;
        }
      }
      
      expect(hasRecognition).toBeTruthy();
    });
  });

  test.describe('Resource Navigation', () => {
    test('All resources are linked from main navigation', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      
      const resourceLinks = [
        'SDKs',
        'Postman',
        'Changelog',
        'Pricing',
        'Support',
        'Community'
      ];

      for (const linkText of resourceLinks) {
        const link = page.getByText(linkText).first();
        await expect(link).toBeVisible();
        
        const href = await link.getAttribute('href');
        expect(href).toBeTruthy();
      }
    });

    test('Resources have consistent layout', async ({ page }) => {
      const allResources = [
        ROUTES.sdks,
        ROUTES.postman,
        ROUTES.changelog,
        ROUTES.pricing,
        ROUTES.support,
        ROUTES.community
      ];

      for (const route of allResources) {
        await page.goto(route);
        
        // Each resource should have standard elements
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('main')).toBeVisible();
        
        // Should have substantial content
        const mainContent = await page.textContent('main');
        expect(mainContent?.length || 0).toBeGreaterThan(1000);
      }
    });
  });

  test.describe('External Links', () => {
    test('External links open in new tabs', async ({ page }) => {
      const resourcePages = [
        ROUTES.sdks,
        ROUTES.community,
        ROUTES.support
      ];

      for (const route of resourcePages) {
        await page.goto(route);
        
        const externalLinks = await page.locator('a[href^="http"]').all();
        
        for (const link of externalLinks) {
          const href = await link.getAttribute('href');
          const target = await link.getAttribute('target');
          
          // External links should open in new tab
          if (href && !href.includes('adcb.mintlify.app')) {
            expect(target).toBe('_blank');
          }
        }
      }
    });

    test('Social links are functional', async ({ page }) => {
      await page.goto(ROUTES.community);
      
      const socialPlatforms = ['github', 'linkedin', 'twitter', 'discord'];
      
      for (const platform of socialPlatforms) {
        const socialLink = page.locator(`a[href*="${platform}"]`).first();
        
        if (await socialLink.isVisible().catch(() => false)) {
          const href = await socialLink.getAttribute('href');
          const target = await socialLink.getAttribute('target');
          
          expect(href).toBeTruthy();
          expect(target).toBe('_blank');
        }
      }
    });
  });

  test.describe('Content Quality', () => {
    test('Resources have no broken links', async ({ page }) => {
      const criticalResources = [
        ROUTES.sdks,
        ROUTES.support,
        ROUTES.pricing
      ];

      for (const route of criticalResources) {
        await page.goto(route);
        
        const brokenLinks = await pageChecker.validateLinks();
        expect(brokenLinks).toEqual([]);
      }
    });

    test('Resources are mobile-responsive', async ({ page }) => {
      const testResource = ROUTES.pricing;
      await page.goto(testResource);
      
      const breakpoints = [
        { width: 375, height: 667 }, // Mobile
        { width: 768, height: 1024 }  // Tablet
      ];

      await pageChecker.validateResponsiveDesign(breakpoints);
    });
  });
});