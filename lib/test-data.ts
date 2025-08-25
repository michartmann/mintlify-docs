// Test data and expected values for ADCB documentation testing

export const BASE_URL = 'https://adcb.mintlify.app';

// Page routes mapped from docs.json navigation
export const ROUTES = {
  // Getting Started
  introduction: '/',
  quickstart: '/quickstart',
  authentication: '/authentication',
  development: '/development',
  apiPlayground: '/api-playground',

  // API Guides
  errorHandling: '/guides/error-handling',
  rateLimiting: '/guides/rate-limiting',
  webhooks: '/guides/webhooks',
  sandboxTesting: '/guides/sandbox-testing',
  bestPractices: '/guides/best-practices',
  codeExamples: '/guides/code-examples',

  // Resources
  sdks: '/resources/sdks',
  postman: '/resources/postman',
  changelog: '/resources/changelog',
  pricing: '/resources/pricing',
  support: '/resources/support',
  community: '/resources/community',

  // API Versioning
  versions: '/api-reference/versions',

  // Learning Paths
  integrationPaths: '/tutorials/integration-paths',

  // Developer Tools
  developerTools: '/developer-tools',
  deploymentStatus: '/deployment-status',

  // API Reference
  apiIntroduction: '/api-reference/introduction',
  cdpOverview: '/api-reference/cdp-overview',
  tppOverview: '/api-reference/tpp-overview',
  lfiOverview: '/api-reference/lfi-overview',

  // Arabic pages
  arabicIntroduction: '/ar/introduction',
};

// Expected page titles
export const PAGE_TITLES = {
  introduction: 'Welcome to ADCB Developer Portal',
  quickstart: 'Quickstart',
  authentication: 'Authentication',
  development: 'Development Guide',
  apiPlayground: 'Interactive API Playground',
  errorHandling: 'Error Handling',
  rateLimiting: 'Rate Limiting',
  webhooks: 'Webhooks',
  sandboxTesting: 'Sandbox Testing',
  bestPractices: 'Best Practices',
  codeExamples: 'Code Examples Library',
  sdks: 'Software Development Kits (SDKs)',
  postman: 'Postman Collection',
  changelog: 'API Changelog',
  pricing: 'API Pricing & Usage Tiers',
  support: 'Developer Support',
  community: 'Developer Community',
  versions: 'API Versions',
  integrationPaths: 'Integration Learning Paths',
  developerTools: 'Developer Tools',
  deploymentStatus: 'Deployment Status',
  cdpOverview: 'Customer Data Platform (CDP) APIs',
  tppOverview: 'Third Party Provider (TPP) APIs',
  lfiOverview: 'Licensed Financial Institution (LFI) APIs',
};

// Expected navigation sections
export const NAVIGATION_SECTIONS = [
  'Getting Started',
  'API Guides', 
  'Resources',
  'API Versioning',
  'Learning Paths',
  'Developer Tools'
];

// Expected main navigation tabs
export const MAIN_TABS = [
  'Documentation',
  'CDP',
  'TPP APIs',
  'LFI APIs'
];

// Critical content elements to check on each page
export const CRITICAL_ELEMENTS = {
  // Elements that should exist on every page
  global: [
    'nav', // Navigation
    'main', // Main content
    'footer', // Footer
    'h1', // Page title
  ],
  
  // Page-specific critical elements
  introduction: [
    'text=Empowering Digital Finance Innovation',
    'text=Quick Start Guide',
    'text=API Authentication',
    'text=API Reference',
    'text=Developer Support'
  ],
  
  guides: [
    'h1', // Guide title
    'nav[aria-label="Table of contents"]', // TOC
    'code', // Code examples
  ],
  
  resources: [
    'h1', // Resource title
    '[data-testid="card"]', // Resource cards
  ]
};

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  // Page load time in milliseconds
  pageLoad: 5000,
  // Time to first byte
  ttfb: 1000,
  // Largest contentful paint
  lcp: 2500,
  // First input delay
  fid: 100,
  // Cumulative layout shift
  cls: 0.1
};

// Accessibility standards
export const ACCESSIBILITY_RULES = {
  // WCAG compliance level
  level: 'AA',
  // Rules to include/exclude
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
  exclude: [
    // Temporarily exclude rules that might fail due to Mintlify defaults
    'color-contrast', // Will test separately
    'landmark-one-main' // Mintlify handles this
  ]
};

// Test environments
export const ENVIRONMENTS = {
  production: 'https://adcb.mintlify.app',
  staging: 'https://staging-adcb.mintlify.app', // if exists
  local: 'http://localhost:3000'
};

// Mobile breakpoints
export const BREAKPOINTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
  widescreen: { width: 1920, height: 1080 }
};

// Languages to test
export const LANGUAGES = {
  english: 'en',
  arabic: 'ar'
};

// Search test queries
export const SEARCH_QUERIES = [
  'authentication',
  'payment',
  'webhook',
  'rate limit',
  'error codes',
  'SDK',
  'sandbox'
];

// Links that should be external (open in new tab)
export const EXTERNAL_LINKS = [
  'https://status.adcb.com',
  'https://developers.adcb.com',
  'https://github.com/adcb',
  'mailto:api-support@adcb.com'
];

// Forms and interactive elements to test
export const INTERACTIVE_ELEMENTS = {
  searchBox: '[data-testid="search"]',
  languageToggle: '[data-testid="language-toggle"]',
  themeToggle: '[data-testid="theme-toggle"]',
  navigationMenu: '[data-testid="nav-menu"]',
  tocLinks: '[data-testid="toc-link"]'
};