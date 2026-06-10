import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 430, height: 932 });

const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(e.message));
const shot = (name) => page.screenshot({ path: `/tmp/elias-${name}.png` });

// 1. Chargement + skip onboarding
await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const passerBtn = page.getByText('PASSER');
if (await passerBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  await passerBtn.click();
  await page.waitForTimeout(700);
}
await shot('01-game-loaded');

const getAge = async () => {
  const t = await page.locator('.elias-age-label').textContent().catch(() => '?');
  return t?.replace(/\s+/g,' ').trim() ?? '?';
};

// Dismiss tout écran de résultat (succès auto-dismissé / échec → "J'AI COMPRIS")
const dismiss = async () => {
  // Attendre 1600ms pour auto-dismiss succès
  await page.waitForTimeout(1600);
  // Tenter bouton "J'AI COMPRIS" pour les échecs
  const jaiCompris = page.getByText("J'AI COMPRIS");
  if (await jaiCompris.isVisible({ timeout: 500 }).catch(() => false)) {
    await jaiCompris.click();
    await page.waitForTimeout(400);
  }
};

// Avancer d'un an (après avoir dismissé tout)
const nextYear = async () => {
  await dismiss();
  const btn = page.locator('button.btn-age').first();
  if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(600);
    return true;
  }
  return false;
};

// Répondre à un event si présent
const handleEvent = async () => {
  const choices = page.locator('.btn-choice');
  if (await choices.count() > 0) {
    const n = await choices.count();
    await choices.nth(Math.floor(Math.random() * n)).click();
    await page.waitForTimeout(400);
    await dismiss();
    return true;
  }
  return false;
};

// 2. Vérifier age 0 — ActionPanel absent
const ap0 = await page.locator('button').filter({ hasText: /prier|jeûner|servir|lire/i }).count();
console.log(`[AGE 0] ActionPanel: ${ap0} boutons — ${ap0 === 0 ? '✓ ABSENT (correct)' : '✗ BUG visible'}`);

// 3. Avancer 10 ans
for (let i = 0; i < 10; i++) {
  await handleEvent();
  await nextYear();
}
console.log(`[AGE ~10] Age:`, await getAge());
await shot('02-age10');
const ap10 = await page.locator('button').filter({ hasText: /prier|jeûner|servir|lire/i }).count();
console.log(`[AGE ~10] ActionPanel: ${ap10} boutons — ${ap10 > 0 ? '✓ VISIBLE' : '⚠ pas encore visible'}`);

// 4. Avancer jusqu'à ~20 ans — chercher events + verifier lisibilite
let eventScreenshot = false;
for (let i = 0; i < 15; i++) {
  await handleEvent();
  // Avant avancer, vérifier si event visible pour screenshot
  if (!eventScreenshot && await page.locator('.event-card').isVisible({ timeout: 300 }).catch(() => false)) {
    await shot('03-event-card-visible');
    const title = await page.locator('.event-title').textContent().catch(() => '');
    const desc = await page.locator('.event-description').textContent().catch(() => '');
    const n = await page.locator('.btn-choice').count();
    console.log(`\n[EVENT] Titre: ${title?.trim()}`);
    console.log(`[EVENT] Desc: ${desc?.trim().slice(0, 100)}`);
    console.log(`[EVENT] Choix disponibles: ${n}`);
    if (n > 0) {
      const c = await page.locator('.btn-choice').first().textContent().catch(() => '');
      console.log(`[EVENT] 1er choix: "${c?.trim().slice(0, 70)}"`);
    }
    eventScreenshot = true;
    await shot('04-choices');
    await handleEvent();
  } else {
    await nextYear();
  }
}
await shot('05-age20');
console.log(`\n[AGE ~20] Age:`, await getAge());

// 5. Vérifier FlowBar
const flowText = await page.locator('.flow-palier-label').first().textContent().catch(() => 'NOT FOUND');
console.log(`[FLOW] Label affiché: "${flowText?.trim()}"`);

// 6. Journal : chercher milestones
const allEntries = await page.locator('.journal-entry, .entry-milestone, .entry-cascade, .entry-success, .entry-fail').allTextContents().catch(() => []);
const journalFull = await page.locator('#journal-area').textContent().catch(() => '');
const milestones = journalFull.match(/\[[^\]]+\][^\n]*/g) || [];
console.log(`\n[JOURNAL] ${milestones.length} entrées importantes:`);
milestones.slice(-8).forEach(m => console.log(' ', m.trim().slice(0, 90)));

// 7. Avancer jusqu'à 25 ans — vérifier milestone
for (let i = 0; i < 8; i++) {
  await handleEvent();
  await nextYear();
}
await shot('06-age25');
console.log(`\n[AGE ~25] Age:`, await getAge());
const journalFull2 = await page.locator('#journal-area').textContent().catch(() => '');
const has25Milestone = journalFull2.includes('JEUNE ADULTE') || journalFull2.includes('MATURITÉ');
console.log(`[JOURNAL] Milestone 25/30 ans présent: ${has25Milestone ? '✓' : '✗ pas encore atteint'}`);

// 8. DevPanel
await page.goto('http://localhost:5174/?dev', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
const passer2 = page.getByText('PASSER');
if (await passer2.isVisible({ timeout: 1000 }).catch(() => false)) { await passer2.click(); await page.waitForTimeout(400); }
await shot('07-devpanel');
const devOk = await page.locator('text=Dev — IA Narrateur').isVisible().catch(() => false);
const aiActive = await page.locator('text=ACTIF').isVisible().catch(() => false);
const aiModel = await page.locator('text=mistral').isVisible().catch(() => false);
console.log(`\n[DEV] Panel visible: ${devOk ? '✓' : '✗'}`);
console.log(`[DEV] IA ACTIF: ${aiActive ? '✓ OpenRouter connecté' : '✗ inactif'}`);
console.log(`[DEV] Modèle mistral: ${aiModel ? '✓' : '?'}`);

// 9. Résumé
console.log(`\n════ JS ERRORS ════`);
console.log(errors.length ? errors.join('\n') : 'Aucune ✓');

await browser.close();
