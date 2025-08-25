// Performance test suite for ADCB documentation

import { test, expect } from '@playwright/test';
import { ROUTES, PERFORMANCE_THRESHOLDS } from '../lib/test-data';

test.describe('Performance Tests', () => {
  
  test.describe('Page Load Performance', () => {
    test('Homepage loads within performance thresholds', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto(ROUTES.introduction);
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.pageLoad);
      
      // Get detailed performance metrics
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
          timeToFirstByte: navigation.responseStart - navigation.requestStart
        };
      });
      
      console.log('Performance metrics:', performanceMetrics);
      
      // Validate against Web Vitals thresholds
      expect(performanceMetrics.timeToFirstByte).toBeLessThan(PERFORMANCE_THRESHOLDS.ttfb);
      expect(performanceMetrics.domContentLoaded).toBeLessThan(2000);
    });

    test('Critical pages load quickly', async ({ page }) => {
      const criticalPages = [
        ROUTES.quickstart,
        ROUTES.authentication,
        ROUTES.errorHandling,
        ROUTES.sdks
      ];

      for (const route of criticalPages) {
        const startTime = Date.now();
        
        await page.goto(route);
        await page.waitForLoadState('domcontentloaded');
        
        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.pageLoad);
        
        console.log(`${route}: ${loadTime}ms`);
      }
    });

    test('Search functionality is responsive', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      
      // Find search input
      const searchSelectors = [
        '[data-testid="search"]',
        'input[type="search"]',
        'input[placeholder*="search" i]'
      ];

      let searchInput = null;
      for (const selector of searchSelectors) {
        const element = page.locator(selector);
        if (await element.isVisible().catch(() => false)) {
          searchInput = element;
          break;
        }
      }

      if (searchInput) {
        const startTime = Date.now();
        
        await searchInput.fill('authentication');
        await searchInput.press('Enter');
        
        // Wait for search results or URL change
        await page.waitForTimeout(2000);
        
        const searchTime = Date.now() - startTime;
        expect(searchTime).toBeLessThan(5000); // Search should be fast
        
        console.log(`Search response time: ${searchTime}ms`);
      }
    });
  });

  test.describe('Resource Loading', () => {
    test('Images load efficiently', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      
      // Get all images
      const images = await page.locator('img').all();
      
      if (images.length > 0) {
        let totalImageLoadTime = 0;
        let loadedImages = 0;

        for (const img of images) {
          const startTime = Date.now();
          
          // Wait for image to load
          await img.waitFor({ state: 'visible', timeout: 10000 });
          
          const loadTime = Date.now() - startTime;
          totalImageLoadTime += loadTime;
          loadedImages++;
        }

        const averageImageLoadTime = totalImageLoadTime / loadedImages;
        expect(averageImageLoadTime).toBeLessThan(3000);
        
        console.log(`Average image load time: ${averageImageLoadTime}ms`);
      }
    });

    test('JavaScript bundles are optimized', async ({ page }) => {
      // Monitor network requests
      const jsRequests: any[] = [];
      
      page.on('request', request => {
        if (request.url().endsWith('.js') || request.url().includes('javascript')) {
          jsRequests.push({
            url: request.url(),
            size: 0, // Will be updated on response
            startTime: Date.now()
          });
        }
      });

      page.on('response', response => {
        const matchingRequest = jsRequests.find(req => req.url === response.url());
        if (matchingRequest) {
          matchingRequest.responseTime = Date.now() - matchingRequest.startTime;
          matchingRequest.size = response.headers()['content-length'] || 0;
        }
      });

      await page.goto(ROUTES.introduction);
      await page.waitForLoadState('networkidle');

      // Analyze JS bundle performance
      const largeBundles = jsRequests.filter(req => 
        parseInt(req.size) > 500000 // 500KB
      );

      // Should not have excessively large bundles
      expect(largeBundles.length).toBeLessThanOrEqual(2);

      const slowRequests = jsRequests.filter(req => req.responseTime > 5000);
      expect(slowRequests).toEqual([]);

      console.log(`JS requests: ${jsRequests.length}, Large bundles: ${largeBundles.length}`);
    });

    test('CSS loads without blocking', async ({ page }) => {
      const cssRequests: any[] = [];
      
      page.on('request', request => {
        if (request.url().endsWith('.css') || request.resourceType() === 'stylesheet') {
          cssRequests.push({
            url: request.url(),
            startTime: Date.now()
          });
        }
      });

      page.on('response', response => {
        const matchingRequest = cssRequests.find(req => req.url === response.url());
        if (matchingRequest) {
          matchingRequest.responseTime = Date.now() - matchingRequest.startTime;
        }
      });

      await page.goto(ROUTES.introduction);
      await page.waitForLoadState('domcontentloaded');

      // CSS should load quickly
      for (const cssRequest of cssRequests) {
        expect(cssRequest.responseTime).toBeLessThan(3000);
      }

      console.log(`CSS requests: ${cssRequests.length}`);
    });
  });

  test.describe('Interactive Performance', () => {
    test('Navigation is responsive', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      
      const navLinks = await page.locator('nav a').all();
      
      if (navLinks.length > 0) {
        for (let i = 0; i < Math.min(3, navLinks.length); i++) {
          const startTime = Date.now();
          
          await navLinks[i].click();
          await page.waitForLoadState('domcontentloaded');
          
          const navigationTime = Date.now() - startTime;
          expect(navigationTime).toBeLessThan(5000);
          
          console.log(`Navigation ${i + 1}: ${navigationTime}ms`);
        }
      }
    });

    test('Tab switching is instant', async ({ page }) => {
      // Test on a page with tabs
      await page.goto(ROUTES.codeExamples);
      
      const tabs = await page.locator('[role="tab"], .tab').all();
      
      if (tabs.length > 1) {
        for (let i = 0; i < Math.min(3, tabs.length); i++) {
          const startTime = Date.now();
          
          await tabs[i].click();
          await page.waitForTimeout(100); // Small delay for content switch
          
          const switchTime = Date.now() - startTime;
          expect(switchTime).toBeLessThan(500); // Tab switches should be nearly instant
          
          console.log(`Tab switch ${i + 1}: ${switchTime}ms`);
        }
      }
    });

    test('Accordion expansion is smooth', async ({ page }) => {
      // Test on a page with accordions
      await page.goto(ROUTES.bestPractices);
      
      const accordions = await page.locator('.accordion-trigger, summary').all();
      
      if (accordions.length > 0) {
        for (let i = 0; i < Math.min(2, accordions.length); i++) {
          const startTime = Date.now();
          
          await accordions[i].click();
          await page.waitForTimeout(300); // Wait for animation
          
          const expansionTime = Date.now() - startTime;
          expect(expansionTime).toBeLessThan(1000); // Should be smooth
          
          console.log(`Accordion expansion ${i + 1}: ${expansionTime}ms`);
        }
      }
    });
  });

  test.describe('Mobile Performance', () => {
    test('Mobile pages load acceptably', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      const startTime = Date.now();
      
      await page.goto(ROUTES.introduction);
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Mobile should load within reasonable time (bit more lenient than desktop)
      expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.pageLoad * 1.5);
      
      console.log(`Mobile load time: ${loadTime}ms`);
    });

    test('Mobile navigation is responsive', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(ROUTES.introduction);
      
      // Find mobile menu toggle
      const mobileMenuSelectors = [
        '[aria-label*="menu"]',
        '.mobile-menu-toggle',
        'button[aria-expanded]'
      ];

      let mobileMenu = null;
      for (const selector of mobileMenuSelectors) {
        const element = page.locator(selector);
        if (await element.isVisible().catch(() => false)) {
          mobileMenu = element;
          break;
        }
      }

      if (mobileMenu) {
        const startTime = Date.now();
        
        await mobileMenu.click();
        await page.waitForTimeout(500);
        
        const menuOpenTime = Date.now() - startTime;
        expect(menuOpenTime).toBeLessThan(1000);
        
        console.log(`Mobile menu open time: ${menuOpenTime}ms`);
      }
    });
  });

  test.describe('Memory and Resource Usage', () => {
    test('Pages do not leak memory excessively', async ({ page }) => {
      // Navigate between pages to test for memory leaks
      const testPages = [
        ROUTES.introduction,
        ROUTES.quickstart,
        ROUTES.authentication,
        ROUTES.errorHandling
      ];

      for (const route of testPages) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        // Get memory usage
        const memoryUsage = await page.evaluate(() => {
          return (performance as any).memory ? {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          } : null;
        });

        if (memoryUsage) {
          // Memory usage should be reasonable
          expect(memoryUsage.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024); // 50MB
          
          console.log(`${route} memory usage: ${Math.round(memoryUsage.usedJSHeapSize / 1024 / 1024)}MB`);
        }
      }
    });

    test('Large pages handle resources efficiently', async ({ page }) => {
      // Test resource-heavy pages
      const heavyPages = [
        ROUTES.bestPractices,
        ROUTES.codeExamples,
        ROUTES.changelog
      ];

      for (const route of heavyPages) {
        const startTime = Date.now();
        
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        const loadTime = Date.now() - startTime;
        
        // Even large pages should load within reasonable time
        expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.pageLoad * 2);
        
        // Check for excessive resource usage
        const resourceCount = await page.evaluate(() => {
          return {
            images: document.querySelectorAll('img').length,
            scripts: document.querySelectorAll('script').length,
            stylesheets: document.querySelectorAll('link[rel="stylesheet"]').length
          };
        });

        console.log(`${route}: ${loadTime}ms, Resources:`, resourceCount);
      }
    });
  });

  test.describe('Caching Performance', () => {
    test('Static assets are properly cached', async ({ page }) => {
      // First visit
      await page.goto(ROUTES.introduction);
      await page.waitForLoadState('networkidle');

      // Second visit should be faster due to caching
      const startTime = Date.now();
      
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      const reloadTime = Date.now() - startTime;
      
      // Reload should be significantly faster
      expect(reloadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.pageLoad * 0.7);
      
      console.log(`Reload time: ${reloadTime}ms`);
    });

    test('Navigation caching improves subsequent loads', async ({ page }) => {
      // Visit multiple pages to prime cache
      const pages = [ROUTES.introduction, ROUTES.quickstart, ROUTES.authentication];
      
      for (const route of pages) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
      }

      // Revisit first page - should be fast
      const startTime = Date.now();
      
      await page.goto(ROUTES.introduction);
      await page.waitForLoadState('domcontentloaded');
      
      const cachedLoadTime = Date.now() - startTime;
      expect(cachedLoadTime).toBeLessThan(2000);
      
      console.log(`Cached load time: ${cachedLoadTime}ms`);
    });
  });
});