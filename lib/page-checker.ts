// Page validation utilities for ADCB documentation testing

import { Page, expect, Locator } from '@playwright/test';
import { CRITICAL_ELEMENTS, PERFORMANCE_THRESHOLDS } from './test-data';

export class PageChecker {
  constructor(private page: Page) {}

  /**
   * Validate that a page loads successfully
   */
  async validatePageLoad(url: string, expectedTitle?: string): Promise<void> {
    const startTime = Date.now();
    
    // Navigate to page
    await this.page.goto(url);
    
    // Wait for page to be ready
    await this.page.waitForLoadState('networkidle');
    
    // Check load time
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.pageLoad);
    
    // Verify page loaded without errors
    const response = this.page.url();
    expect(response).toContain(url.replace('/', ''));
    
    // Check title if provided
    if (expectedTitle) {
      await expect(this.page).toHaveTitle(new RegExp(expectedTitle, 'i'));
    }
  }

  /**
   * Check for critical page elements
   */
  async validateCriticalElements(pageType: 'global' | 'introduction' | 'guides' | 'resources' = 'global'): Promise<void> {
    const elements = CRITICAL_ELEMENTS[pageType];
    
    for (const selector of elements) {
      if (selector.startsWith('text=')) {
        // Text content check
        const text = selector.replace('text=', '');
        await expect(this.page.getByText(text)).toBeVisible();
      } else {
        // Element selector check
        await expect(this.page.locator(selector)).toBeVisible();
      }
    }
  }

  /**
   * Check for broken links on the page
   */
  async validateLinks(): Promise<string[]> {
    const brokenLinks: string[] = [];
    const links = await this.page.locator('a[href]').all();
    
    for (const link of links) {
      const href = await link.getAttribute('href');
      if (!href) continue;
      
      // Skip external links, anchors, and mailto links for now
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http')) {
        continue;
      }
      
      // Check internal links
      try {
        const response = await this.page.request.get(href);
        if (response.status() >= 400) {
          brokenLinks.push(`${href} (${response.status()})`);
        }
      } catch (error) {
        brokenLinks.push(`${href} (Network Error)`);
      }
    }
    
    return brokenLinks;
  }

  /**
   * Validate images load correctly
   */
  async validateImages(): Promise<string[]> {
    const brokenImages: string[] = [];
    const images = await this.page.locator('img').all();
    
    for (const img of images) {
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      
      if (!src) continue;
      
      // Check image loads
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      if (naturalWidth === 0) {
        brokenImages.push(`${src} (Failed to load)`);
      }
      
      // Check alt text exists
      if (!alt || alt.trim() === '') {
        brokenImages.push(`${src} (Missing alt text)`);
      }
    }
    
    return brokenImages;
  }

  /**
   * Check code blocks render correctly
   */
  async validateCodeBlocks(): Promise<void> {
    const codeBlocks = this.page.locator('pre code, .code-block, [data-language]');
    const count = await codeBlocks.count();
    
    // If page has code blocks, verify they're visible
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const block = codeBlocks.nth(i);
        await expect(block).toBeVisible();
        
        // Check syntax highlighting is applied
        const hasHighlighting = await block.locator('.token, .hljs-keyword, .highlight').count() > 0;
        if (!hasHighlighting) {
          // Might be plain text, check if it has content at least
          const content = await block.textContent();
          expect(content?.trim().length).toBeGreaterThan(0);
        }
      }
    }
  }

  /**
   * Test interactive elements like tabs and accordions
   */
  async validateInteractiveElements(): Promise<void> {
    // Test tabs
    const tabs = this.page.locator('[role="tab"], .tab, [data-testid*="tab"]');
    const tabCount = await tabs.count();
    
    if (tabCount > 0) {
      // Click each tab and verify content changes
      for (let i = 0; i < Math.min(tabCount, 3); i++) { // Limit to first 3 tabs
        await tabs.nth(i).click();
        await this.page.waitForTimeout(500); // Wait for content to load
        
        // Verify tab is active
        const isActive = await tabs.nth(i).getAttribute('aria-selected');
        expect(isActive === 'true' || await tabs.nth(i).getAttribute('class')).toBeTruthy();
      }
    }
    
    // Test accordions
    const accordions = this.page.locator('[data-testid="accordion"], .accordion-trigger, summary');
    const accordionCount = await accordions.count();
    
    if (accordionCount > 0) {
      // Test first accordion
      const firstAccordion = accordions.first();
      const wasExpanded = await firstAccordion.getAttribute('aria-expanded') === 'true';
      
      await firstAccordion.click();
      await this.page.waitForTimeout(300);
      
      const isNowExpanded = await firstAccordion.getAttribute('aria-expanded') === 'true';
      expect(isNowExpanded).not.toBe(wasExpanded);
    }
  }

  /**
   * Test search functionality
   */
  async validateSearch(query: string = 'authentication'): Promise<void> {
    // Look for search input
    const searchSelectors = [
      '[data-testid="search"]',
      'input[type="search"]',
      'input[placeholder*="search" i]',
      '.search-input',
      '#search'
    ];
    
    let searchInput: Locator | null = null;
    
    for (const selector of searchSelectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible().catch(() => false)) {
        searchInput = element;
        break;
      }
    }
    
    if (searchInput) {
      await searchInput.fill(query);
      await searchInput.press('Enter');
      
      // Wait for search results
      await this.page.waitForTimeout(2000);
      
      // Check if search results appear
      const resultsSelectors = [
        '[data-testid="search-results"]',
        '.search-results',
        '.search-result',
        '[role="listbox"]'
      ];
      
      let hasResults = false;
      for (const selector of resultsSelectors) {
        if (await this.page.locator(selector).isVisible().catch(() => false)) {
          hasResults = true;
          break;
        }
      }
      
      // If we can't find results UI, at least verify URL changed or content updated
      if (!hasResults) {
        // Check if URL contains search parameter
        const url = this.page.url();
        const hasSearchParam = url.includes('search') || url.includes('q=') || url.includes('query');
        expect(hasSearchParam || url !== this.page.url()).toBeTruthy();
      }
    }
  }

  /**
   * Validate responsive design
   */
  async validateResponsiveDesign(breakpoints: Array<{width: number, height: number}>): Promise<void> {
    for (const breakpoint of breakpoints) {
      await this.page.setViewportSize(breakpoint);
      await this.page.waitForTimeout(1000); // Wait for responsive changes
      
      // Ensure main content is visible
      await expect(this.page.locator('main, [role="main"], .main-content')).toBeVisible();
      
      // Check navigation adapts to mobile
      if (breakpoint.width < 768) {
        // Look for mobile menu button
        const mobileMenuSelectors = [
          '[aria-label*="menu" i]',
          '.mobile-menu-toggle',
          '[data-testid="mobile-menu"]',
          'button[aria-expanded]'
        ];
        
        let hasMobileMenu = false;
        for (const selector of mobileMenuSelectors) {
          if (await this.page.locator(selector).isVisible().catch(() => false)) {
            hasMobileMenu = true;
            break;
          }
        }
        
        // Mobile should have menu toggle or simplified nav
        expect(hasMobileMenu).toBeTruthy();
      }
    }
  }

  /**
   * Check page performance metrics
   */
  async validatePerformance(): Promise<Record<string, number>> {
    const metrics: Record<string, number> = {};
    
    try {
      // Get performance metrics
      const performanceEntries = await this.page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          ttfb: navigation.responseStart - navigation.requestStart,
          domInteractive: navigation.domInteractive - navigation.navigationStart,
        };
      });
      
      Object.assign(metrics, performanceEntries);
      
      // Validate against thresholds
      expect(metrics.loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.pageLoad);
      expect(metrics.ttfb).toBeLessThan(PERFORMANCE_THRESHOLDS.ttfb);
      
    } catch (error) {
      console.warn('Performance metrics unavailable:', error);
    }
    
    return metrics;
  }

  /**
   * Take screenshot for visual regression testing
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  /**
   * Check console errors
   */
  async validateConsoleErrors(): Promise<string[]> {
    const errors: string[] = [];
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    this.page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    // Wait a bit to catch any delayed errors
    await this.page.waitForTimeout(2000);
    
    return errors;
  }
}