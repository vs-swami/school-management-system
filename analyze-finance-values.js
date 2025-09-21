const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'log' && msg.text().includes('===')) {
      console.log(`DEBUG LOG: ${msg.text()}`);
    }
  });

  try {
    console.log('Navigating to http://localhost:3000/classes...');
    await page.goto('http://localhost:3000/classes', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for the page to load
    await page.waitForTimeout(2000);

    console.log('\n=== ANALYZING FINANCE INFORMATION SUMMARY ===\n');

    // Check if Finance Information Summary exists
    const financeSection = await page.locator('h2:has-text("Finance Information Summary")').first();
    if (await financeSection.count() > 0) {
      console.log('✓ Finance Information Summary section found\n');
    } else {
      console.log('✗ Finance Information Summary section NOT found\n');
      return;
    }

    // Extract the main financial metrics
    console.log('=== MAIN METRICS ===');

    // Forecasted Revenue
    const forecastedRevenue = await page.locator('text=/Forecasted Revenue/i').locator('..').locator('p.text-2xl').textContent();
    console.log(`Forecasted Revenue: ${forecastedRevenue}`);

    // Get student count from the subtitle
    const studentCount = await page.locator('text=/Based on.*enrolled students/i').first().textContent();
    console.log(`Student Count Info: ${studentCount}`);

    // Projected Collection
    const projectedCollection = await page.locator('text=/Projected Collection/i').locator('..').locator('p.text-2xl').textContent();
    console.log(`Projected Collection: ${projectedCollection}`);

    // Expected Pending
    const expectedPending = await page.locator('text=/Expected Pending/i').locator('..').locator('p.text-2xl').textContent();
    console.log(`Expected Pending: ${expectedPending}`);

    // Transport Users
    const transportUsers = await page.locator('text=/Transport Users/i').locator('..').locator('p.text-2xl').textContent();
    console.log(`Transport Users: ${transportUsers}`);

    console.log('\n=== CLASS-WISE BREAKDOWN ===');

    // Get class-wise data
    const classRows = await page.locator('text=/Class-wise Revenue Forecast/i').locator('..').locator('div.space-y-3').locator('> div').all();

    for (const row of classRows) {
      const rowText = await row.textContent();
      // Parse the row to extract class name, students, and revenue
      const className = await row.locator('span.font-medium').first().textContent();
      const studentInfo = await row.locator('span.text-xs.text-gray-500').first().textContent();
      const revenue = await row.locator('div.text-sm.font-semibold').first().textContent();
      const perStudent = await row.locator('div.text-xs.text-gray-500').last().textContent();

      console.log(`\nClass: ${className}`);
      console.log(`  Students: ${studentInfo}`);
      console.log(`  Total Revenue: ${revenue}`);
      console.log(`  Per Student: ${perStudent}`);
    }

    console.log('\n=== SPECIFIC CLASS ANALYSIS ===');

    // Focus on Class 1 specifically
    const class1Row = await page.locator('text=/Class 1/').locator('..').locator('..');
    if (await class1Row.count() > 0) {
      console.log('\nClass 1 Details:');
      const class1Text = await class1Row.textContent();
      console.log(`  Full Row Text: ${class1Text}`);

      // Extract numbers for calculation verification
      const match = class1Text.match(/(\d+)\s*students/);
      if (match) {
        const studentCount = parseInt(match[1]);
        console.log(`  Parsed Student Count: ${studentCount}`);

        // Expected calculation with ₹10,000 fee
        const expectedWith10k = studentCount * 10000;
        console.log(`  Expected Revenue (₹10,000/student): ₹${expectedWith10k.toLocaleString('en-IN')}`);

        // Current fee structure from code (Class 1: ₹75,000)
        const expectedWith75k = studentCount * 75000;
        console.log(`  Expected Revenue (₹75,000/student): ₹${expectedWith75k.toLocaleString('en-IN')}`);

        // Parse actual displayed revenue
        const revenueMatch = class1Text.match(/₹([\d,]+)/);
        if (revenueMatch) {
          const actualRevenue = revenueMatch[1].replace(/,/g, '');
          console.log(`  Actual Displayed Revenue: ₹${revenueMatch[1]}`);

          // Calculate implied fee per student
          const impliedFee = Math.round(parseInt(actualRevenue) / studentCount);
          console.log(`  Implied Fee Per Student: ₹${impliedFee.toLocaleString('en-IN')}`);
        }
      }
    }

    console.log('\n=== SUMMARY TOTALS ===');

    // Get summary totals
    const totalForecast = await page.locator('text=/Total Forecast/i').locator('..').locator('span.text-lg').textContent();
    console.log(`Total Forecast: ${totalForecast}`);

    const tuitionTotal = await page.locator('text=/Tuition:/i').textContent();
    console.log(`${tuitionTotal}`);

    const transportTotal = await page.locator('text=/Transport:/i').first().textContent();
    console.log(`${transportTotal}`);

    const activitiesTotal = await page.locator('text=/Activities:/i').textContent();
    console.log(`${activitiesTotal}`);

    // Check the fee structure being used
    console.log('\n=== ANALYZING FEE STRUCTURE IN CODE ===');

    // Inject JavaScript to check what values are actually being used
    const feeStructureCheck = await page.evaluate(() => {
      // Try to access React DevTools or component state
      const reactElements = document.querySelectorAll('[class*="finance"], [class*="Finance"]');
      const data = {};

      // Check if we can find any fee-related data in the DOM
      const allText = document.body.innerText;
      const feeMatches = allText.match(/₹\d+[,\d]*/g);
      if (feeMatches) {
        data.feesFound = [...new Set(feeMatches)].slice(0, 10);
      }

      return data;
    });

    if (feeStructureCheck.feesFound) {
      console.log('\nUnique fee amounts found on page:');
      feeStructureCheck.feesFound.forEach(fee => console.log(`  ${fee}`));
    }

    // Take a screenshot for reference
    await page.screenshot({ path: 'finance-analysis.png', fullPage: true });
    console.log('\n✓ Screenshot saved as finance-analysis.png');

    console.log('\n=== ANALYSIS COMPLETE ===\n');

    await browser.close();

  } catch (error) {
    console.error('Error during analysis:', error);
  }
})();