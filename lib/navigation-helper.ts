// Navigation testing utilities for ADCB documentation

import { Page, expect, Locator } from '@playwright/test';
import { MAIN_TABS, NAVIGATION_SECTIONS } from './test-data';

export class NavigationHelper {
  constructor(private page: Page) {}

  /**
   * Validate main navigation structure
   */
  async validateMainNavigation(): Promise<void> {
    // Check main tabs exist
    for (const tab of MAIN_TABS) {
      const tabElement = this.page.getByText(tab, { exact: false });
      await expect(tabElement).toBeVisible();
    }
  }

  /**
   * Validate sidebar navigation sections
   */
  async validateSidebarNavigation(): Promise<void> {
    // Look for sidebar or navigation menu
    const sidebarSelectors = [
      'nav[aria-label*="navigation" i]',
      '.sidebar',
      '[data-testid="sidebar"]',
      '.navigation-menu',
      'aside nav'
    ];

    let sidebar: Locator | null = null;
    for (const selector of sidebarSelectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible().catch(() => false)) {
        sidebar = element;
        break;
      }
    }

    if (sidebar) {
      // Check navigation sections exist
      for (const section of NAVIGATION_SECTIONS) {
        const sectionElement = sidebar.getByText(section, { exact: false });
        await expect(sectionElement).toBeVisible();
      }
    }
  }

  /**
   * Navigate to a specific tab and validate
   */
  async navigateToTab(tabName: string): Promise<void> {
    const tabElement = this.page.getByText(tabName, { exact: false });
    await tabElement.click();
    
    // Wait for navigation
    await this.page.waitForLoadState('networkidle');
    
    // Verify tab is active/selected
    const tabParent = tabElement.locator('..');
    const isActive = await tabParent.getAttribute('aria-selected') === 'true' ||
                    await tabParent.getAttribute('class').then(cls => cls?.includes('active')) ||
                    await tabElement.getAttribute('aria-current') === 'page';
    
    expect(isActive).toBeTruthy();
  }

  /**
   * Test navigation breadcrumbs
   */
  async validateBreadcrumbs(expectedPath: string[]): Promise<void> {
    const breadcrumbSelectors = [
      '[aria-label*="breadcrumb" i]',
      '.breadcrumbs',
      '.breadcrumb',
      '[data-testid="breadcrumb"]',
      'nav ol'
    ];

    let breadcrumb: Locator | null = null;
    for (const selector of breadcrumbSelectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible().catch(() => false)) {
        breadcrumb = element;
        break;
      }
    }

    if (breadcrumb && expectedPath.length > 0) {
      for (const pathItem of expectedPath) {
        await expect(breadcrumb.getByText(pathItem)).toBeVisible();
      }
    }
  }

  /**
   * Test table of contents navigation
   */
  async validateTableOfContents(): Promise<void> {
    const tocSelectors = [
      'nav[aria-label*="table of contents" i]',
      '.table-of-contents',
      '.toc',
      '[data-testid="toc"]',
      'nav[aria-label*="on this page" i]'
    ];

    let toc: Locator | null = null;
    for (const selector of tocSelectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible().catch(() => false)) {
        toc = element;
        break;
      }
    }

    if (toc) {
      // Get TOC links
      const tocLinks = toc.locator('a');
      const linkCount = await tocLinks.count();

      if (linkCount > 0) {
        // Test first TOC link
        const firstLink = tocLinks.first();
        const href = await firstLink.getAttribute('href');
        
        if (href?.startsWith('#')) {
          await firstLink.click();
          await this.page.waitForTimeout(500);
          
          // Verify scrolled to section
          const targetElement = this.page.locator(href);
          await expect(targetElement).toBeVisible();
        }
      }
    }
  }

  /**
   * Test global navigation anchors
   */
  async validateGlobalAnchors(): Promise<void> {
    const expectedAnchors = ['Quick Start', 'API Status', 'Developer Forum', 'Support'];
    
    for (const anchor of expectedAnchors) {
      const anchorElement = this.page.getByText(anchor).first();
      
      // Check if anchor exists and is clickable
      if (await anchorElement.isVisible().catch(() => false)) {
        const href = await anchorElement.getAttribute('href');
        expect(href).toBeTruthy();
        
        // External links should have target="_blank"
        if (href?.startsWith('http')) {
          const target = await anchorElement.getAttribute('target');
          expect(target).toBe('_blank');
        }
      }
    }
  }

  /**
   * Test language switcher
   */
  async validateLanguageSwitcher(): Promise<void> {
    const languageSelectors = [
      '[data-testid="language-toggle"]',
      '.language-switcher',
      '[aria-label*="language" i]',
      'select[name*="language" i]',
      'button[title*="language" i]'
    ];

    let languageToggle: Locator | null = null;
    for (const selector of languageSelectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible().catch(() => false)) {
        languageToggle = element;
        break;
      }
    }

    if (languageToggle) {
      // Test language switching
      await languageToggle.click();
      
      // Look for language options
      const arabicOption = this.page.getByText('العربية').or(this.page.getByText('Arabic'));
      if (await arabicOption.isVisible().catch(() => false)) {
        await arabicOption.click();
        
        // Wait for page to change
        await this.page.waitForLoadState('networkidle');
        
        // Verify Arabic content or URL change
        const url = this.page.url();
        const hasArabicUrl = url.includes('/ar/') || url.includes('lang=ar');
        const hasArabicText = await this.page.locator('html[dir="rtl"]').isVisible().catch(() => false);
        
        expect(hasArabicUrl || hasArabicText).toBeTruthy();
      }
    }
  }

  /**
   * Test theme toggle (dark/light mode)
   */
  async validateThemeToggle(): Promise<void> {
    const themeSelectors = [
      '[data-testid="theme-toggle"]',
      '.theme-toggle',
      '[aria-label*="theme" i]',
      '[aria-label*="dark" i]',
      '[title*="theme" i]'
    ];

    let themeToggle: Locator | null = null;
    for (const selector of themeSelectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible().catch(() => false)) {
        themeToggle = element;
        break;
      }
    }

    if (themeToggle) {
      // Get initial theme
      const initialTheme = await this.page.locator('html').getAttribute('class') || '';
      
      // Toggle theme
      await themeToggle.click();
      await this.page.waitForTimeout(500);
      
      // Check theme changed
      const newTheme = await this.page.locator('html').getAttribute('class') || '';
      expect(newTheme).not.toBe(initialTheme);
    }
  }

  /**
   * Test keyboard navigation
   */
  async validateKeyboardNavigation(): Promise<void> {
    // Test Tab navigation through main elements
    await this.page.keyboard.press('Tab');
    const firstFocused = await this.page.evaluate(() => document.activeElement?.tagName);
    
    // Should focus on a focusable element
    const focusableElements = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
    expect(focusableElements).toContain(firstFocused);

    // Test Skip to content link (common accessibility feature)
    await this.page.keyboard.press('Tab');
    const skipLink = this.page.locator('a[href="#main"], a[href="#content"], .skip-link');
    
    if (await skipLink.isVisible().catch(() => false)) {
      await this.page.keyboard.press('Enter');
      
      // Verify focus moved to main content
      const mainContent = this.page.locator('#main, #content, main[role="main"]');
      await expect(mainContent).toBeFocused();
    }
  }

  /**
   * Test navigation consistency across pages
   */
  async validateNavigationConsistency(pages: string[]): Promise<void> {
    let previousNavStructure: string[] = [];

    for (let i = 0; i < pages.length; i++) {
      await this.page.goto(pages[i]);
      await this.page.waitForLoadState('networkidle');

      // Get navigation structure
      const navElements = await this.page.locator('nav a, .nav-item, .menu-item')
        .allTextContents();

      if (i === 0) {
        previousNavStructure = navElements;
      } else {
        // Compare with previous page (navigation should be consistent)
        expect(navElements.length).toBeGreaterThan(0);
        
        // Core navigation items should be present
        const coreItems = ['Introduction', 'Quick', 'Auth', 'Guide'];
        const hasCore = coreItems.some(item => 
          navElements.some(nav => nav.toLowerCase().includes(item.toLowerCase()))
        );
        expect(hasCore).toBeTruthy();
      }
    }
  }

  /**
   * Test footer navigation
   */
  async validateFooterNavigation(): Promise<void> {
    const footer = this.page.locator('footer');
    await expect(footer).toBeVisible();

    // Check for social links
    const socialLinks = footer.locator('a[href*="linkedin"], a[href*="github"], a[href*="twitter"]');
    const socialCount = await socialLinks.count();
    expect(socialCount).toBeGreaterThan(0);

    // Verify social links open in new tab
    for (let i = 0; i < socialCount; i++) {
      const link = socialLinks.nth(i);
      const target = await link.getAttribute('target');
      expect(target).toBe('_blank');
    }
  }

  /**
   * Get current navigation state
   */
  async getCurrentNavigationState(): Promise<{
    activeTab: string | null;
    activeSection: string | null;
    breadcrumb: string[];
    url: string;
  }> {
    const url = this.page.url();
    
    // Find active tab
    const activeTabElement = this.page.locator('[aria-selected="true"], .active-tab, .current-tab').first();
    const activeTab = await activeTabElement.textContent().catch(() => null);

    // Find active section
    const activeSectionElement = this.page.locator('.active-section, .current-section, [aria-current="page"]').first();
    const activeSection = await activeSectionElement.textContent().catch(() => null);

    // Get breadcrumb
    const breadcrumbElements = this.page.locator('[aria-label*="breadcrumb"] a, .breadcrumb a');
    const breadcrumb = await breadcrumbElements.allTextContents().catch(() => []);

    return {
      activeTab,
      activeSection,
      breadcrumb,
      url
    };
  }
}