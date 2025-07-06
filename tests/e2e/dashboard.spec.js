// End-to-end tests for dashboard functionality
const { test, expect } = require('@playwright/test');

test.describe('Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });
  
  test.describe('Navigation', () => {
    test('should display main navigation menu', async ({ page }) => {
      // Check if navigation elements are present
      await expect(page.locator('nav')).toBeVisible();
      
      // Check for main navigation links
      await expect(page.locator('a[href="/"]')).toBeVisible();
      await expect(page.locator('a[href="/covid"]')).toBeVisible();
      await expect(page.locator('a[href="/mpox"]')).toBeVisible();
      await expect(page.locator('a[href="/compare"]')).toBeVisible();
      await expect(page.locator('a[href="/data"]')).toBeVisible();
    });
    
    test('should navigate between pages', async ({ page }) => {
      // Navigate to COVID page
      await page.click('a[href="/covid"]');
      await expect(page).toHaveURL(/.*covid/);
      await expect(page.locator('h1')).toContainText(/covid/i);
      
      // Navigate to MPOX page
      await page.click('a[href="/mpox"]');
      await expect(page).toHaveURL(/.*mpox/);
      await expect(page.locator('h1')).toContainText(/mpox/i);
      
      // Navigate to Compare page
      await page.click('a[href="/compare"]');
      await expect(page).toHaveURL(/.*compare/);
      
      // Navigate to Data page
      await page.click('a[href="/data"]');
      await expect(page).toHaveURL(/.*data/);
    });
  });
  
  test.describe('Homepage', () => {
    test('should display overview statistics', async ({ page }) => {
      // Check for overview cards
      await expect(page.locator('[data-testid="overview-stats"]')).toBeVisible({ timeout: 10000 });
      
      // Check for statistics cards
      const statsCards = page.locator('[data-testid="stat-card"]');
      await expect(statsCards).toHaveCount(4); // COVID cases, deaths, MPOX cases, MPOX deaths
      
      // Verify each card has title and value
      for (let i = 0; i < 4; i++) {
        const card = statsCards.nth(i);
        await expect(card.locator('.card-title')).toBeVisible();
        await expect(card.locator('.card-value')).toBeVisible();
      }
    });
    
    test('should display charts', async ({ page }) => {
      // Wait for charts to load
      await page.waitForLoadState('networkidle');
      
      // Check for chart containers
      await expect(page.locator('[data-testid="covid-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="mpox-chart"]')).toBeVisible();
      
      // Verify charts are rendered (SVG elements should be present)
      await expect(page.locator('[data-testid="covid-chart"] svg')).toBeVisible();
      await expect(page.locator('[data-testid="mpox-chart"] svg')).toBeVisible();
    });
  });
  
  test.describe('COVID Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/covid');
    });
    
    test('should display COVID data table', async ({ page }) => {
      // Wait for data to load
      await page.waitForLoadState('networkidle');
      
      // Check for data table
      await expect(page.locator('[data-testid="covid-table"]')).toBeVisible();
      
      // Check table headers
      await expect(page.locator('th')).toContainText(['Country', 'Date', 'Cases', 'Deaths', 'Recovered']);
      
      // Check for data rows
      const rows = page.locator('tbody tr');
      await expect(rows.first()).toBeVisible();
    });
    
    test('should filter COVID data by country', async ({ page }) => {
      // Wait for data to load
      await page.waitForLoadState('networkidle');
      
      // Find and use country filter
      const countryFilter = page.locator('[data-testid="country-filter"]');
      await expect(countryFilter).toBeVisible();
      
      // Select a specific country
      await countryFilter.selectOption('United States');
      
      // Wait for filtered results
      await page.waitForTimeout(1000);
      
      // Verify filtered results
      const tableRows = page.locator('tbody tr');
      const firstRowCountry = tableRows.first().locator('td').first();
      await expect(firstRowCountry).toContainText('United States');
    });
    
    test('should sort COVID data by columns', async ({ page }) => {
      // Wait for data to load
      await page.waitForLoadState('networkidle');
      
      // Click on Cases column header to sort
      await page.click('th:has-text("Cases")');
      
      // Wait for sort to complete
      await page.waitForTimeout(1000);
      
      // Get first two rows to verify sorting
      const firstRowCases = page.locator('tbody tr').first().locator('td').nth(2);
      const secondRowCases = page.locator('tbody tr').nth(1).locator('td').nth(2);
      
      const firstCases = parseInt(await firstRowCases.textContent());
      const secondCases = parseInt(await secondRowCases.textContent());
      
      // Should be sorted in descending order
      expect(firstCases).toBeGreaterThanOrEqual(secondCases);
    });
  });
  
  test.describe('MPOX Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/mpox');
    });
    
    test('should display MPOX data visualization', async ({ page }) => {
      // Wait for data to load
      await page.waitForLoadState('networkidle');
      
      // Check for MPOX chart
      await expect(page.locator('[data-testid="mpox-chart"]')).toBeVisible();
      
      // Verify chart is rendered
      await expect(page.locator('[data-testid="mpox-chart"] svg')).toBeVisible();
    });
    
    test('should display MPOX data table', async ({ page }) => {
      // Wait for data to load
      await page.waitForLoadState('networkidle');
      
      // Check for data table
      await expect(page.locator('[data-testid="mpox-table"]')).toBeVisible();
      
      // Check table headers
      await expect(page.locator('th')).toContainText(['Country', 'Date', 'Cases', 'Deaths']);
      
      // Check for data rows
      const rows = page.locator('tbody tr');
      await expect(rows.first()).toBeVisible();
    });
  });
  
  test.describe('Compare Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/compare');
    });
    
    test('should display comparison charts', async ({ page }) => {
      // Wait for data to load
      await page.waitForLoadState('networkidle');
      
      // Check for comparison chart
      await expect(page.locator('[data-testid="comparison-chart"]')).toBeVisible();
      
      // Verify chart is rendered
      await expect(page.locator('[data-testid="comparison-chart"] svg')).toBeVisible();
    });
    
    test('should allow country selection for comparison', async ({ page }) => {
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Find country selectors
      const country1Select = page.locator('[data-testid="country1-select"]');
      const country2Select = page.locator('[data-testid="country2-select"]');
      
      await expect(country1Select).toBeVisible();
      await expect(country2Select).toBeVisible();
      
      // Select countries
      await country1Select.selectOption('United States');
      await country2Select.selectOption('United Kingdom');
      
      // Wait for comparison to update
      await page.waitForTimeout(2000);
      
      // Verify comparison chart updated
      await expect(page.locator('[data-testid="comparison-chart"]')).toBeVisible();
    });
  });
  
  test.describe('Data Export', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/data');
    });
    
    test('should allow data export', async ({ page }) => {
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Find export button
      const exportButton = page.locator('[data-testid="export-data"]');
      await expect(exportButton).toBeVisible();
      
      // Set up download promise before clicking
      const downloadPromise = page.waitForEvent('download');
      
      // Click export button
      await exportButton.click();
      
      // Wait for download to start
      const download = await downloadPromise;
      
      // Verify download
      expect(download.suggestedFilename()).toMatch(/\.(csv|json)$/);
    });
  });
  
  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Navigate to homepage
      await page.goto('/');
      
      // Check if mobile navigation is working
      await expect(page.locator('nav')).toBeVisible();
      
      // Check if content is responsive
      await expect(page.locator('[data-testid="overview-stats"]')).toBeVisible();
    });
    
    test('should work on tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Navigate to homepage
      await page.goto('/');
      
      // Check if content adapts to tablet size
      await expect(page.locator('[data-testid="overview-stats"]')).toBeVisible();
      
      // Check if charts are visible and responsive
      await expect(page.locator('[data-testid="covid-chart"]')).toBeVisible();
    });
  });
  
  test.describe('Performance', () => {
    test('should load pages within acceptable time', async ({ page }) => {
      // Measure page load time
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });
    
    test('should handle large datasets efficiently', async ({ page }) => {
      // Navigate to data page with full dataset
      await page.goto('/data');
      
      // Wait for initial load
      await page.waitForLoadState('networkidle');
      
      // Measure time to render table
      const startTime = Date.now();
      
      // Trigger data load (if pagination exists)
      const loadAllButton = page.locator('[data-testid="load-all-data"]');
      if (await loadAllButton.isVisible()) {
        await loadAllButton.click();
        await page.waitForLoadState('networkidle');
      }
      
      const renderTime = Date.now() - startTime;
      
      // Should render within 10 seconds
      expect(renderTime).toBeLessThan(10000);
      
      // Check if table is still responsive
      await expect(page.locator('table')).toBeVisible();
    });
  });
});