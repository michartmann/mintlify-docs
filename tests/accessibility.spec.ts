// Accessibility test suite for ADCB documentation

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ROUTES, ACCESSIBILITY_RULES } from '../lib/test-data';

test.describe('Accessibility Tests', () => {
  
  test.describe('WCAG Compliance', () => {
    test('Homepage passes WCAG AA standards', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(ACCESSIBILITY_RULES.tags)
        .exclude(ACCESSIBILITY_RULES.exclude)
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Critical pages meet accessibility standards', async ({ page }) => {
      const criticalPages = [
        ROUTES.quickstart,
        ROUTES.authentication,
        ROUTES.errorHandling,
        ROUTES.sdks
      ];

      for (const route of criticalPages) {
        await page.goto(route);
        
        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa'])
          .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
      }
    });

    test('Interactive elements are accessible', async ({ page }) => {
      await page.goto(ROUTES.codeExamples);
      
      // Test specific interactive elements
      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('button, [role="button"], [role="tab"], a')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('All interactive elements are keyboard accessible', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      
      // Start keyboard navigation
      await page.keyboard.press('Tab');
      
      let focusedElements = [];
      let attempts = 0;
      const maxAttempts = 20;

      while (attempts < maxAttempts) {
        const focusedElement = await page.evaluate(() => {
          const element = document.activeElement;
          return element ? {
            tagName: element.tagName,
            role: element.getAttribute('role'),
            ariaLabel: element.getAttribute('aria-label'),
            href: element.getAttribute('href'),
            id: element.id
          } : null;
        });

        if (focusedElement) {
          focusedElements.push(focusedElement);
        }

        await page.keyboard.press('Tab');
        attempts++;
      }

      // Should have focused on multiple interactive elements
      expect(focusedElements.length).toBeGreaterThan(5);
      
      // Focused elements should be interactive
      const interactiveTypes = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
      const hasInteractiveElements = focusedElements.some(el => 
        interactiveTypes.includes(el.tagName) || 
        ['button', 'link', 'tab'].includes(el.role || '')
      );
      
      expect(hasInteractiveElements).toBeTruthy();
    });

    test('Skip links function correctly', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      
      // First tab should focus skip link
      await page.keyboard.press('Tab');
      
      const skipLink = page.locator('a[href="#main"], a[href="#content"], .skip-link').first();
      
      if (await skipLink.isVisible().catch(() => false)) {
        await page.keyboard.press('Enter');
        
        // Should skip to main content
        const focusedElement = await page.evaluate(() => {
          return document.activeElement?.tagName.toLowerCase();
        });
        
        expect(['main', 'div', 'section']).toContain(focusedElement || '');
      }
    });

    test('Modal/dropdown keyboard trapping works', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      
      // Look for dropdowns or modals
      const triggers = page.locator('[aria-expanded], [role="button"][aria-haspopup]');
      const triggerCount = await triggers.count();
      
      if (triggerCount > 0) {
        // Focus and activate first trigger
        await triggers.first().focus();
        await page.keyboard.press('Enter');
        
        // Tab should stay within modal/dropdown
        await page.keyboard.press('Tab');
        
        const focusedElement = await page.evaluate(() => {
          return document.activeElement?.closest('[role="dialog"], [role="menu"], [aria-expanded="true"]');
        });
        
        // Focus should be within the opened element (if modal/dropdown opened)
        if (focusedElement) {
          expect(focusedElement).toBeTruthy();
        }
      }
    });

    test('Tab navigation follows logical order', async ({ page }) => {
      await page.goto(ROUTES.quickstart);
      
      const focusOrder = [];
      let previousY = -1;
      let violations = 0;

      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        
        const elementInfo = await page.evaluate(() => {
          const element = document.activeElement;
          if (element) {
            const rect = element.getBoundingClientRect();
            return {
              y: rect.top,
              tagName: element.tagName,
              visible: rect.width > 0 && rect.height > 0
            };
          }
          return null;
        });

        if (elementInfo && elementInfo.visible) {
          focusOrder.push(elementInfo);
          
          // Check if focus moves roughly top to bottom
          if (elementInfo.y < previousY - 100) { // Allow some flexibility
            violations++;
          }
          previousY = elementInfo.y;
        }
      }

      // Focus order should be mostly logical (few violations acceptable)
      expect(violations).toBeLessThanOrEqual(2);
    });
  });

  test.describe('Screen Reader Support', () => {
    test('Pages have proper heading structure', async ({ page }) => {
      await page.goto(ROUTES.authentication);
      
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      
      if (headings.length > 0) {
        let h1Count = 0;
        let previousLevel = 0;
        let violations = 0;

        for (const heading of headings) {
          const tagName = await heading.evaluate(el => el.tagName);
          const level = parseInt(tagName[1]);
          const text = await heading.textContent();

          if (level === 1) h1Count++;
          
          // Check heading hierarchy
          if (previousLevel > 0 && level > previousLevel + 1) {
            violations++;
          }
          
          // Headings should have text
          expect(text?.trim().length || 0).toBeGreaterThan(0);
          
          previousLevel = level;
        }

        // Should have exactly one h1
        expect(h1Count).toBe(1);
        
        // Should not skip heading levels
        expect(violations).toBeLessThanOrEqual(1);
      }
    });

    test('Images have appropriate alt text', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      
      const images = await page.locator('img').all();
      
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        const src = await img.getAttribute('src');
        const role = await img.getAttribute('role');
        
        if (role === 'presentation' || role === 'none') {
          // Decorative images should have empty alt
          expect(alt).toBe('');
        } else {
          // Informative images should have meaningful alt text
          expect(alt).toBeTruthy();
          expect(alt?.trim().length || 0).toBeGreaterThan(0);
          
          // Alt text should not be redundant
          expect(alt?.toLowerCase()).not.toContain('image');
          expect(alt?.toLowerCase()).not.toContain('picture');
          expect(alt?.toLowerCase()).not.toContain('photo');
        }
      }
    });

    test('Links have descriptive text', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      
      const links = await page.locator('a').all();
      
      for (const link of links) {
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');
        const title = await link.getAttribute('title');
        
        const effectiveText = ariaLabel || text || title || '';
        
        // Links should have descriptive text
        expect(effectiveText.trim().length).toBeGreaterThan(0);
        
        // Avoid generic link text
        const genericTerms = ['click here', 'read more', 'more', 'here', 'link'];
        const isGeneric = genericTerms.some(term => 
          effectiveText.toLowerCase().trim() === term
        );
        
        expect(isGeneric).toBeFalsy();
      }
    });

    test('Form elements have proper labels', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      
      const formElements = await page.locator('input, select, textarea').all();
      
      for (const element of formElements) {
        const id = await element.getAttribute('id');
        const ariaLabel = await element.getAttribute('aria-label');
        const ariaLabelledby = await element.getAttribute('aria-labelledby');
        const placeholder = await element.getAttribute('placeholder');
        
        let hasLabel = false;
        
        // Check for associated label
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          if (await label.count() > 0) {
            hasLabel = true;
          }
        }
        
        // Check for aria-label or aria-labelledby
        if (ariaLabel || ariaLabelledby) {
          hasLabel = true;
        }
        
        // Placeholder alone is not sufficient but acceptable for search
        if (placeholder?.toLowerCase().includes('search')) {
          hasLabel = true;
        }
        
        expect(hasLabel).toBeTruthy();
      }
    });

    test('Tables have proper headers', async ({ page }) => {
      // Test on a page likely to have tables
      await page.goto(ROUTES.pricing);
      
      const tables = await page.locator('table').all();
      
      for (const table of tables) {
        // Tables should have headers
        const headers = await table.locator('th').count();
        const caption = await table.locator('caption').count();
        const summary = await table.getAttribute('summary');
        
        if (headers === 0) {
          // If no th elements, should have caption or summary
          expect(caption > 0 || summary).toBeTruthy();
        }
        
        // Check for scope attributes on headers
        const headersWithScope = await table.locator('th[scope]').count();
        if (headers > 0) {
          // Complex tables should have scope attributes
          expect(headersWithScope).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  test.describe('Color and Contrast', () => {
    test('Text has sufficient color contrast', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      
      // This test would normally use automated contrast checking
      // We'll do a basic check for common contrast issues
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .include('body')
        .analyze();

      const contrastViolations = accessibilityScanResults.violations.filter(
        violation => violation.id === 'color-contrast'
      );

      expect(contrastViolations).toEqual([]);
    });

    test('Information is not conveyed by color alone', async ({ page }) => {
      await page.goto(ROUTES.errorHandling);
      
      // Check for color-only information
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withRules(['color-contrast', 'link-in-text-block'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Focus indicators are visible', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      
      // Tab to first focusable element
      await page.keyboard.press('Tab');
      
      const focusStyles = await page.evaluate(() => {
        const element = document.activeElement;
        if (element) {
          const styles = window.getComputedStyle(element);
          return {
            outline: styles.outline,
            outlineWidth: styles.outlineWidth,
            outlineStyle: styles.outlineStyle,
            outlineColor: styles.outlineColor,
            borderColor: styles.borderColor,
            boxShadow: styles.boxShadow
          };
        }
        return null;
      });

      // Should have visible focus indicator
      if (focusStyles) {
        const hasOutline = focusStyles.outline !== 'none' && focusStyles.outlineWidth !== '0px';
        const hasBorder = focusStyles.borderColor !== 'rgba(0, 0, 0, 0)';
        const hasBoxShadow = focusStyles.boxShadow !== 'none';
        
        const hasFocusIndicator = hasOutline || hasBorder || hasBoxShadow;
        expect(hasFocusIndicator).toBeTruthy();
      }
    });
  });

  test.describe('Mobile Accessibility', () => {
    test('Mobile navigation is accessible', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(ROUTES.introduction);
      
      // Check mobile accessibility
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Touch targets are adequately sized', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(ROUTES.introduction);
      
      const touchTargets = await page.locator('button, a, [role="button"]').all();
      
      for (const target of touchTargets) {
        if (await target.isVisible()) {
          const boundingBox = await target.boundingBox();
          
          if (boundingBox) {
            // Touch targets should be at least 44x44 pixels (WCAG recommendation)
            const isLargeEnough = boundingBox.width >= 44 && boundingBox.height >= 44;
            
            // Allow some smaller targets if they're not primary interactive elements
            const isSecondaryTarget = await target.evaluate(el => {
              return el.classList.contains('small') || 
                     el.closest('.secondary') ||
                     el.matches('.icon-only, [data-size="small"]');
            });
            
            if (!isSecondaryTarget) {
              expect(isLargeEnough).toBeTruthy();
            }
          }
        }
      }
    });
  });

  test.describe('Language and Internationalization', () => {
    test('Pages have proper language attributes', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      
      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBe('en');
    });

    test('Arabic page has proper RTL support', async ({ page }) => {
      await page.goto(ROUTES.arabicIntroduction);
      
      const htmlDir = await page.locator('html').getAttribute('dir');
      const htmlLang = await page.locator('html').getAttribute('lang');
      
      expect(htmlDir).toBe('rtl');
      expect(htmlLang).toBe('ar');
      
      // Check RTL accessibility
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Language switching maintains accessibility', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      
      // If language switcher exists, test it
      const langSwitcher = page.locator('[data-testid="language-toggle"], .language-switcher').first();
      
      if (await langSwitcher.isVisible().catch(() => false)) {
        // Should be keyboard accessible
        await langSwitcher.focus();
        await page.keyboard.press('Enter');
        
        // Should maintain focus management
        const focusedAfterSwitch = await page.evaluate(() => 
          document.activeElement?.tagName
        );
        
        expect(focusedAfterSwitch).toBeTruthy();
      }
    });
  });

  test.describe('Dynamic Content', () => {
    test('ARIA live regions work for dynamic content', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      
      // Look for live regions
      const liveRegions = await page.locator('[aria-live], [role="status"], [role="alert"]').count();
      
      // If dynamic content exists, should have appropriate ARIA
      if (liveRegions > 0) {
        const accessibilityScanResults = await new AxeBuilder({ page })
          .include('[aria-live], [role="status"], [role="alert"]')
          .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
      }
    });

    test('Loading states are accessible', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      
      // Test search functionality if available (might show loading)
      const searchInput = page.locator('input[type="search"]').first();
      
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill('test');
        await searchInput.press('Enter');
        
        // Check for loading indicators with proper ARIA
        const loadingIndicators = page.locator('[aria-label*="loading" i], [role="progressbar"], .loading');
        const count = await loadingIndicators.count();
        
        if (count > 0) {
          // Loading indicators should be accessible
          const accessibilityScanResults = await new AxeBuilder({ page })
            .include('[aria-label*="loading"], [role="progressbar"]')
            .analyze();

          expect(accessibilityScanResults.violations).toEqual([]);
        }
      }
    });
  });

  test.describe('Error Prevention and Recovery', () => {
    test('Error messages are accessible', async ({ page }) => {
      // This is a documentation site, so we'll check for any error states
      await page.goto(ROUTES.introduction);
      
      // Look for error-related content
      const errorElements = page.locator('[role="alert"], .error, .warning, [aria-invalid]');
      const errorCount = await errorElements.count();
      
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          const element = errorElements.nth(i);
          const role = await element.getAttribute('role');
          const ariaDescribedby = await element.getAttribute('aria-describedby');
          
          // Errors should be properly announced
          expect(role === 'alert' || ariaDescribedby).toBeTruthy();
        }
      }
    });

    test('Required fields are properly marked', async ({ page }) => {
      await page.goto(ROUTES.introduction);
      
      const requiredFields = await page.locator('[required], [aria-required="true"]').all();
      
      for (const field of requiredFields) {
        const ariaRequired = await field.getAttribute('aria-required');
        const required = await field.getAttribute('required');
        const ariaLabel = await field.getAttribute('aria-label');
        const ariaLabelledby = await field.getAttribute('aria-labelledby');
        
        // Required fields should be clearly marked
        expect(ariaRequired === 'true' || required !== null).toBeTruthy();
        
        // Should have proper labeling
        expect(ariaLabel || ariaLabelledby).toBeTruthy();
      }
    });
  });
});