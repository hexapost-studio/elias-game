import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('http://localhost:5174');
await page.waitForTimeout(800);

// Skip onboarding
const passer = await page.$('button:has-text("PASSER")');
if (passer) { await passer.click(); await page.waitForTimeout(400); }

// Advance to age 35 to trigger multiple arcs
for (let i = 0; i < 35; i++) {
  const btn = await page.$('.btn-age');
  if (!btn) { console.log('no advance btn at iteration', i); break; }
  await btn.click();
  await page.waitForTimeout(200);
  
  // Handle event if present
  const choices = await page.$$('.btn-choice:not([disabled])');
  if (choices.length > 0) {
    await choices[0].click();
    await page.waitForTimeout(150);
  }
  
  // Dismiss overlay
  const compris = await page.$('button:has-text("COMPRIS")');
  if (compris) { await compris.click(); await page.waitForTimeout(100); }
}

await page.screenshot({ path: '/tmp/arctracker-test.png', fullPage: false });

const ageText = await page.$eval('.age-badge, [class*="age"]', el => el.textContent).catch(() => '?');
console.log('Âge:', ageText);

// Check arc tracker items
const arcItems = await page.$$eval('div[style*="border-radius: 10px"]', 
  els => els.map(el => el.textContent?.trim()).filter(Boolean)
);
console.log('Arcs visibles:', arcItems.length, '→', arcItems.join(' | '));

// Check if arc container wraps
const arcContainer = await page.$eval('div[style*="flexWrap"], div[style*="flex-wrap"]', 
  el => ({ wrap: window.getComputedStyle(el).flexWrap, childCount: el.children.length })
).catch(() => 'no wrap container found');
console.log('ArcContainer wrap:', arcContainer);

// Check FlowBar
const flowLabel = await page.$eval('.flow-palier-label', el => {
  const cs = window.getComputedStyle(el);
  return { display: cs.display, flexDir: cs.flexDirection, text: el.textContent };
});
console.log('FlowBar:', JSON.stringify(flowLabel));

await browser.close();
console.log('✓ Test terminé');
