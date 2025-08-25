# ADCB Documentation Testing Framework

A comprehensive Playwright-based testing framework for the ADCB API documentation site at https://adcb.mintlify.app.

## 🎯 Overview

This testing framework validates that all 31 documentation pages are working correctly across multiple browsers and devices. It tests functionality, performance, accessibility, and content quality.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Git repository cloned locally

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run all tests
npm test
```

## 📋 Test Suites

### 1. Core Pages (`tests/core-pages.spec.ts`)
Tests the main documentation pages:
- Homepage and introduction
- Quickstart guide
- Authentication documentation
- Development guide
- API playground
- Navigation structure
- Search functionality
- Responsive design

### 2. API Guides (`tests/api-guides.spec.ts`)
Validates all API guide pages:
- Error Handling Guide
- Rate Limiting Guide
- Webhooks Guide
- Sandbox Testing Guide
- Best Practices Guide
- Code Examples Library

### 3. Resources (`tests/resources.spec.ts`)
Tests resource pages:
- SDK Documentation
- Postman Collection
- API Changelog
- Pricing & Usage Tiers
- Developer Support
- Community Hub

### 4. Performance (`tests/performance.spec.ts`)
Validates performance metrics:
- Page load times (< 5 seconds)
- Time to First Byte (< 1 second)
- Resource optimization
- Mobile performance
- Caching effectiveness

### 5. Accessibility (`tests/accessibility.spec.ts`)
Ensures WCAG compliance:
- WCAG 2.1 AA standards
- Keyboard navigation
- Screen reader support
- Color contrast
- Mobile accessibility

## 🛠️ Test Commands

```bash
# Run specific test suites
npm run test:core          # Core pages only
npm run test:guides        # API guides only  
npm run test:resources     # Resources only
npm run test:performance   # Performance tests
npm run test:accessibility # Accessibility tests

# Run on specific browsers
npm run test:chrome        # Chrome only
npm run test:firefox       # Firefox only
npm run test:safari        # Safari only
npm run test:mobile        # Mobile devices

# Development and debugging
npm run test:headed        # Run with browser UI
npm run test:debug         # Debug mode
npm run test:ui            # Interactive UI mode

# Reports and results
npm run report             # View HTML report
```

## 🏗️ Project Structure

```
.
├── tests/                     # Test files
│   ├── core-pages.spec.ts    # Core page tests
│   ├── api-guides.spec.ts    # Guide tests
│   ├── resources.spec.ts     # Resource tests
│   ├── performance.spec.ts   # Performance tests
│   └── accessibility.spec.ts # Accessibility tests
├── lib/                       # Test utilities
│   ├── page-checker.ts       # Page validation utilities
│   ├── navigation-helper.ts  # Navigation testing helpers
│   ├── test-data.ts          # Test data and constants
│   ├── global-setup.ts       # Global test setup
│   └── global-teardown.ts    # Global test cleanup
├── playwright.config.ts      # Playwright configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── .github/workflows/        # CI/CD workflows
    └── test.yml             # GitHub Actions workflow
```

## 📊 Test Coverage

The framework tests **31 documentation pages** across:

### Getting Started (5 pages)
- Introduction
- Quickstart
- Authentication
- Development
- API Playground

### API Guides (6 pages)
- Error Handling
- Rate Limiting
- Webhooks
- Sandbox Testing
- Best Practices
- Code Examples

### Resources (6 pages)
- SDK Documentation
- Postman Collection
- API Changelog
- Pricing Information
- Developer Support
- Community Hub

### Additional Pages (14 pages)
- API Reference sections
- Version documentation
- Learning paths
- Developer tools
- Arabic language pages

## 🔧 Configuration

### Browser Support
- **Desktop**: Chrome, Firefox, Safari
- **Mobile**: Chrome Mobile, Safari Mobile
- **Tablet**: iPad Pro

### Performance Thresholds
- Page load time: < 5 seconds
- Time to First Byte: < 1 second
- Largest Contentful Paint: < 2.5 seconds

### Accessibility Standards
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast validation

## 🚀 CI/CD Integration

### GitHub Actions
The framework runs automatically on:
- Every push to main branch
- Pull requests
- Daily scheduled runs (6 AM UTC)
- Manual workflow dispatch

### Test Matrix
- **3 browsers** × **5 device types** × **6 test suites**
- Parallel execution for faster results
- Artifact retention for 30-90 days

### Notifications
- Failed tests trigger team notifications
- Performance regressions are flagged
- Accessibility violations are reported

## 📈 Reporting

### HTML Reports
Interactive HTML reports with:
- Test results by browser/device
- Screenshots of failures
- Performance metrics
- Accessibility scan results

### JSON Results
Machine-readable results for:
- CI/CD integration
- Performance tracking
- Trend analysis

### Lighthouse Audits
Weekly Lighthouse audits for:
- Performance scores
- SEO optimization
- Best practices compliance

## 🐛 Debugging

### Local Debugging
```bash
# Run with browser UI visible
npm run test:headed

# Debug specific test
npx playwright test tests/core-pages.spec.ts --debug

# Generate test code
npx playwright codegen https://adcb.mintlify.app
```

### CI Debugging
- Check GitHub Actions logs
- Download test artifacts
- Review screenshots and videos
- Analyze performance reports

## 🔄 Maintenance

### Adding New Tests
1. Create test file in `tests/` directory
2. Import utilities from `lib/`
3. Follow existing test patterns
4. Update test documentation

### Updating Thresholds
1. Modify values in `lib/test-data.ts`
2. Update Lighthouse config in `lighthouserc.json`
3. Adjust Playwright config as needed

### Browser Updates
```bash
# Update browsers
npx playwright install

# Check browser versions
npx playwright --version
```

## 📚 Best Practices

### Test Organization
- One test suite per documentation section
- Clear test descriptions
- Proper setup and teardown
- Shared utilities in `lib/` folder

### Performance Testing
- Set realistic thresholds
- Test on different network conditions
- Monitor resource loading
- Track performance trends

### Accessibility Testing
- Use axe-core for automated testing
- Manual keyboard testing
- Screen reader compatibility
- Color contrast validation

### Maintenance
- Regular browser updates
- Threshold adjustments based on site changes
- Test data updates for new features
- Documentation updates

## 🆘 Troubleshooting

### Common Issues

**Tests failing on CI but passing locally**
- Check browser versions
- Verify network conditions
- Review CI-specific configurations

**Performance tests flaky**
- Increase retry attempts
- Adjust timeout values
- Check for external dependencies

**Accessibility violations**
- Review axe-core rules
- Check for Mintlify framework issues
- Validate custom CSS

**Mobile tests failing**
- Check viewport configurations
- Verify touch target sizes
- Test responsive breakpoints

### Getting Help

1. Check test logs and artifacts
2. Review similar issues in documentation
3. Contact the development team
4. Create issue in project repository

## 📊 Metrics and KPIs

### Success Criteria
- **99%+ test pass rate** across all browsers
- **< 5 second average page load** time
- **Zero critical accessibility** violations
- **All pages responsive** on mobile devices

### Monitoring
- Daily automated test runs
- Performance trend tracking
- Accessibility compliance monitoring
- User experience metrics

---

## 🎯 Next Steps

### Planned Enhancements
1. **Visual regression testing** - Screenshot comparisons
2. **API endpoint testing** - Test actual API responses
3. **Content freshness checks** - Validate documentation accuracy
4. **User journey testing** - End-to-end developer workflows
5. **International testing** - Multi-language validation

### Integration Opportunities
1. **Performance monitoring** - Real user monitoring
2. **Error tracking** - Automated issue detection
3. **Analytics integration** - Usage pattern analysis
4. **Feedback collection** - User satisfaction metrics

This comprehensive testing framework ensures the ADCB documentation provides an excellent developer experience across all platforms and use cases.

---

**Framework Version**: 1.0.0  
**Last Updated**: March 2024  
**Maintained By**: ADCB Development Team