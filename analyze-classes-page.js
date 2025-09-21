const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    devtools: true
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Enable console logging
  page.on('console', msg => {
    console.log(`BROWSER LOG: ${msg.type()}: ${msg.text()}`);
  });

  // Enable request/response logging
  page.on('request', request => {
    if (request.url().includes('/api/') || request.url().includes('classes')) {
      console.log('REQUEST:', request.method(), request.url());
    }
  });

  page.on('response', response => {
    if (response.url().includes('/api/') || response.url().includes('classes')) {
      console.log('RESPONSE:', response.status(), response.url());
    }
  });

  // Listen for errors
  page.on('pageerror', error => {
    console.error('PAGE ERROR:', error.message);
  });

  try {
    console.log('Navigating to http://localhost:3000/classes...');
    await page.goto('http://localhost:3000/classes', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for the page to load
    await page.waitForTimeout(3000);

    // Check if finance summary section exists
    console.log('\n=== Checking Finance Summary Section ===');

    const financeSection = await page.locator('text=/Finance.*Summary/i').count();
    console.log('Finance Summary sections found:', financeSection);

    // Look for financial data elements
    const totalRevenue = await page.locator('text=/Total.*Revenue/i').count();
    const totalPending = await page.locator('text=/Total.*Pending/i').count();
    const totalCollected = await page.locator('text=/Total.*Collected/i').count();

    console.log('Total Revenue elements:', totalRevenue);
    console.log('Total Pending elements:', totalPending);
    console.log('Total Collected elements:', totalCollected);

    // Check for any error messages
    const errorMessages = await page.locator('.error, .text-red-500, .text-red-600').allTextContents();
    if (errorMessages.length > 0) {
      console.log('\nError messages found:', errorMessages);
    }

    // Get the page HTML to check structure
    const bodyHTML = await page.locator('body').innerHTML();

    // Check if there are any console errors in the browser
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Check API calls for finance data
    console.log('\n=== Checking API Calls ===');
    const financeApiCalls = [];

    page.on('response', async response => {
      if (response.url().includes('finance') || response.url().includes('fee')) {
        const responseData = {
          url: response.url(),
          status: response.status(),
          ok: response.ok()
        };

        if (response.ok()) {
          try {
            responseData.body = await response.json();
          } catch (e) {
            responseData.body = 'Could not parse JSON';
          }
        }

        financeApiCalls.push(responseData);
      }
    });

    // Reload the page to capture API calls
    console.log('\nReloading page to capture API calls...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    if (financeApiCalls.length > 0) {
      console.log('\nFinance API calls:', JSON.stringify(financeApiCalls, null, 2));
    } else {
      console.log('\nNo finance-related API calls detected');
    }

    // Check the React component state using evaluate
    const componentData = await page.evaluate(() => {
      // Try to find React fiber nodes
      const findReactComponent = (dom) => {
        const key = Object.keys(dom).find(key => key.startsWith('__reactFiber'));
        return dom[key];
      };

      // Look for elements that might contain finance data
      const elements = document.querySelectorAll('[class*="finance"], [class*="Finance"], [class*="summary"], [class*="Summary"]');
      const data = [];

      elements.forEach(el => {
        const fiber = findReactComponent(el);
        if (fiber && fiber.memoizedProps) {
          data.push({
            className: el.className,
            props: fiber.memoizedProps,
            state: fiber.memoizedState
          });
        }
      });

      return data;
    });

    if (componentData.length > 0) {
      console.log('\n=== React Component Data ===');
      console.log(JSON.stringify(componentData, null, 2));
    }

    // Take a screenshot for visual inspection
    await page.screenshot({ path: 'classes-page-analysis.png', fullPage: true });
    console.log('\nScreenshot saved as classes-page-analysis.png');

    // Keep browser open for manual inspection
    console.log('\nBrowser will remain open for manual inspection. Press Ctrl+C to close.');
    await page.pause();

  } catch (error) {
    console.error('Error during analysis:', error);
  } finally {
    // Browser will stay open due to pause() above
    // await browser.close();
  }
})();