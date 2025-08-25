// Core pages test suite for ADCB documentation

import { test, expect } from '@playwright/test';
import { PageChecker } from '../lib/page-checker';
import { NavigationHelper } from '../lib/navigation-helper';
import { ROUTES, PAGE_TITLES, BREAKPOINTS } from '../lib/test-data';

test.describe('Core Pages', () => {
  let pageChecker: PageChecker;
  let navigationHelper: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    pageChecker = new PageChecker(page);
    navigationHelper = new NavigationHelper(page);
  });

  test.describe('Getting Started Section', () => {
    test('Homepage loads correctly', async ({ page }) => {
      await pageChecker.validatePageLoad(ROUTES.introduction, PAGE_TITLES.introduction);
      
      // Check critical elements
      await pageChecker.validateCriticalElements('introduction');
      
      // Verify key sections are visible
      await expect(page.getByText('Empowering Digital Finance Innovation')).toBeVisible();
      await expect(page.getByText('Quick Start Guide')).toBeVisible();
      await expect(page.getByText('API Authentication')).toBeVisible();
      await expect(page.getByText('API Reference')).toBeVisible();
      
      // Test main navigation
      await navigationHelper.validateMainNavigation();
      
      // Check for broken links
      const brokenLinks = await pageChecker.validateLinks();
      expect(brokenLinks).toEqual([]);
      
      // Validate images
      const brokenImages = await pageChecker.validateImages();
      expect(brokenImages).toEqual([]);
    });

    test('Quickstart guide works', async ({ page }) => {
      await pageChecker.validatePageLoad(ROUTES.quickstart, PAGE_TITLES.quickstart);
      
      // Should have step-by-step instructions
      await expect(page.locator('text=Step 1, text=Step 2, text=Step 3').first()).toBeVisible();
      
      // Should have code examples
      await pageChecker.validateCodeBlocks();
      
      // Test interactive elements
      await pageChecker.validateInteractiveElements();
    });

    test('Authentication guide is comprehensive', async ({ page }) => {
      await pageChecker.validatePageLoad(ROUTES.authentication, PAGE_TITLES.authentication);
      
      // Should contain key authentication concepts
      const authConcepts = [
        'OAuth 2.0',
        'mTLS',
        'certificate',
        'access token'
      ];

      for (const concept of authConcepts) {
        await expect(page.getByText(concept, { exact: false })).toBeVisible();
      }

      // Should have code examples for multiple languages
      const languages = ['Python', 'JavaScript', 'Java'];
      for (const language of languages) {
        await expect(page.getByText(language)).toBeVisible();
      }
    });

    test('Development guide has practical examples', async ({ page }) => {
      await pageChecker.validatePageLoad(ROUTES.development, PAGE_TITLES.development);
      
      // Should have development best practices
      await expect(page.getByText('best practice', { exact: false })).toBeVisible();
      await expect(page.getByText('SDK', { exact: false })).toBeVisible();
      
      // Validate code blocks
      await pageChecker.validateCodeBlocks();
    });

    test('API Playground is interactive', async ({ page }) => {
      await pageChecker.validatePageLoad(ROUTES.apiPlayground, PAGE_TITLES.apiPlayground);
      
      // Should have sandbox environment info
      await expect(page.getByText('sandbox', { exact: false })).toBeVisible();
      await expect(page.getByText('test', { exact: false })).toBeVisible();
      
      // Should have interactive elements or iframes
      const interactiveElements = page.locator('iframe, button, input, [role="button"]');
      const count = await interactiveElements.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Navigation Tests', () => {
    test('Main navigation structure is correct', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      await navigationHelper.validateMainNavigation();
      await navigationHelper.validateSidebarNavigation();
    });

    test('Global anchors work correctly', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      await navigationHelper.validateGlobalAnchors();
    });

    test('Table of contents navigation works', async ({ page }) => {
      // Test on a content-heavy page
      await page.goto(ROUTES.authentication);
      await navigationHelper.validateTableOfContents();
    });

    test('Language switcher works (if available)', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      await navigationHelper.validateLanguageSwitcher();
    });

    test('Theme toggle works (if available)', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      await navigationHelper.validateThemeToggle();
    });

    test('Keyboard navigation is accessible', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      await navigationHelper.validateKeyboardNavigation();
    });

    test('Footer navigation is complete', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      await navigationHelper.validateFooterNavigation();
    });
  });

  test.describe('Search Functionality', () => {
    test('Search works with common queries', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      
      const searchQueries = ['authentication', 'payment', 'API', 'webhook'];
      
      for (const query of searchQueries) {
        await pageChecker.validateSearch(query);
        // Reset page for next search
        await page.goto(ROUTES.introduction);
      }
    });

    test('AI-powered search prompt is visible', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      
      // Look for AI search features
      const aiSearchIndicators = [
        'Ask anything about ADCB APIs',
        'Try: \'How do I authenticate?\'',
        'AI',
        'chat',
        'assistant'
      ];

      let hasAiFeatures = false;
      for (const indicator of aiSearchIndicators) {
        if (await page.getByText(indicator, { exact: false }).isVisible().catch(() => false)) {
          hasAiFeatures = true;
          break;
        }
      }

      // AI features should be present based on our configuration
      expect(hasAiFeatures).toBeTruthy();
    });
  });

  test.describe('Responsive Design', () => {
    test('Pages work on mobile devices', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      
      const breakpoints = [
        BREAKPOINTS.mobile,
        BREAKPOINTS.tablet
      ];

      await pageChecker.validateResponsiveDesign(breakpoints);
    });

    test('Navigation adapts to mobile', async ({ page }) => {
      await page.setViewportSize(BREAKPOINTS.mobile);
      await page.goto(ROUTES.introduction);
      
      // Should have mobile menu
      const mobileMenuSelectors = [
        '[aria-label*="menu"]',
        '.mobile-menu',
        'button[aria-expanded]'
      ];

      let hasMobileMenu = false;
      for (const selector of mobileMenuSelectors) {
        if (await page.locator(selector).isVisible().catch(() => false)) {
          hasMobileMenu = true;
          break;
        }
      }

      expect(hasMobileMenu).toBeTruthy();
    });
  });

  test.describe('Performance', () => {
    test('Homepage loads within performance thresholds', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      const metrics = await pageChecker.validatePerformance();
      
      // Performance should be recorded
      expect(Object.keys(metrics).length).toBeGreaterThan(0);
    });

    test('Pages load without console errors', async ({ page }) => {
      const errors: string[] = [];
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      page.on('pageerror', error => {
        errors.push(error.message);
      });

      await page.goto(ROUTES.introduction);
      await page.waitForTimeout(3000); // Wait for any delayed errors

      // Filter out common non-critical errors
      const criticalErrors = errors.filter(error => 
        !error.includes('favicon') &&
        !error.includes('analytics') &&
        !error.includes('tracking') &&
        !error.toLowerCase().includes('network')
      );

      expect(criticalErrors).toEqual([]);
    });
  });

  test.describe('Content Validation', () => {
    test('All critical pages have required content', async ({ page }) => {
      const criticalPages = [
        { route: ROUTES.introduction, title: PAGE_TITLES.introduction },
        { route: ROUTES.quickstart, title: PAGE_TITLES.quickstart },
        { route: ROUTES.authentication, title: PAGE_TITLES.authentication },
        { route: ROUTES.development, title: PAGE_TITLES.development }
      ];

      for (const pageInfo of criticalPages) {
        await pageChecker.validatePageLoad(pageInfo.route, pageInfo.title);
        await pageChecker.validateCriticalElements('global');
        
        // Each page should have substantial content
        const textContent = await page.textContent('main');
        expect(textContent?.length || 0).toBeGreaterThan(500);
      }
    });

    test('Images have proper alt text', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      
      const images = await page.locator('img').all();
      
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        const src = await img.getAttribute('src');
        
        // All images should have meaningful alt text
        expect(alt).toBeTruthy();
        expect(alt?.trim().length).toBeGreaterThan(0);
      }
    });

    test('External links open in new tab', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      
      const externalLinks = await page.locator('a[href^="http"]').all();
      
      for (const link of externalLinks) {
        const target = await link.getAttribute('target');
        const href = await link.getAttribute('href');
        
        // External links should open in new tab
        if (href && !href.includes('adcb.mintlify.app')) {
          expect(target).toBe('_blank');
        }
      }
    });
  });

  test.describe('Arabic Language Support', () => {
    test('Arabic introduction page loads correctly', async ({ page }) => {
      await pageChecker.validatePageLoad(ROUTES.arabicIntroduction);
      
      // Should have RTL direction
      const htmlDir = await page.locator('html').getAttribute('dir');
      expect(htmlDir).toBe('rtl');
      
      // Should have Arabic text
      const hasArabicText = await page.getByText('مرحباً بكم').isVisible();
      expect(hasArabicText).toBeTruthy();
    });

    test('Language switching preserves navigation', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      
      // Switch to Arabic (if switcher exists)
      await navigationHelper.validateLanguageSwitcher();
      
      // Navigation should still work
      await navigationHelper.validateMainNavigation();
    });
  });
});