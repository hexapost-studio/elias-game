import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 430, height: 932 });
const shot = (n) => page.screenshot({ path: `/tmp/sync-${n}.png` });

await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
const passer = page.getByText('PASSER');
if (await passer.isVisible({ timeout:2000 }).catch(()=>false)) { await passer.click(); await page.waitForTimeout(600); }

// Lit l'état visuel de la page (JS pur, sans TypeScript)
const readUi = () => page.evaluate(() => {
  const fills = Array.from(document.querySelectorAll('[class*="fill"], [class*="bar"] > div'))
    .map(el => el.style.width).filter(Boolean);
  const flowLabel = document.querySelector('.flow-palier-label') ? document.querySelector('.flow-palier-label').textContent.trim() : null;
  const flowFill  = document.querySelector('.flow-fill') ? document.querySelector('.flow-fill').style.width : null;
  const combo     = document.querySelector('.combo-badge') ? document.querySelector('.combo-badge').textContent.trim() : null;
  const age       = document.querySelector('.elias-age-label') ? document.querySelector('.elias-age-label').textContent.trim().replace(/\s+/g,' ') : null;
  const infoBar   = document.querySelector('#info-bar') ? document.querySelector('#info-bar').textContent.trim().replace(/\s+/g,' ') : null;
  const timer     = document.querySelector('.timer-fill') ? document.querySelector('.timer-fill').style.width : null;
  const hasEventCard = !!document.querySelector('.event-card');
  const choiceCount  = document.querySelectorAll('.btn-choice').length;
  const correctCount = document.querySelectorAll('.btn-choice.correct').length;
  const wrongCount   = document.querySelectorAll('.btn-choice.wrong').length;
  // Stat numbers — texte dans les spans à côté des barres
  const statSpans = Array.from(document.querySelectorAll('#stat-bar span, .stat-number, [class*="stat-val"]'))
    .map(el => el.textContent.trim()).filter(t => /^\d+$/.test(t));
  // ActionPanel buttons
  const actionBtns = Array.from(document.querySelectorAll('button'))
    .filter(b => /prier|jeûner|servir|appeler|lire/i.test(b.textContent || ''))
    .map(b => ({ label: b.textContent.trim().slice(0,25), disabled: b.disabled }));
  return { fills, flowLabel, flowFill, combo, age, infoBar, timer, hasEventCard, choiceCount, correctCount, wrongCount, statSpans, actionBtns };
});

const dismiss = async () => {
  await page.waitForTimeout(1600);
  const jc = page.getByText("J'AI COMPRIS");
  if (await jc.isVisible({ timeout:500 }).catch(()=>false)) { await jc.click(); await page.waitForTimeout(400); }
};
const advance = async () => {
  await dismiss();
  const btn = page.locator('button.btn-age').first();
  if (await btn.isVisible({ timeout:800 }).catch(()=>false)) { await btn.click(); await page.waitForTimeout(600); return true; }
  return false;
};
const handleEvent = async (idx) => {
  const choices = page.locator('.btn-choice');
  const n = await choices.count();
  if (n > 0) { await choices.nth((idx||0) % n).click(); await page.waitForTimeout(500); await dismiss(); return true; }
  return false;
};

// ─── ÂGE 0 ──────────────────────────────────────────────────────────────────
await shot('00-age0');
let ui = await readUi();
console.log('\n═══ ÂGE 0 ═══');
console.log('Age affiché:', ui.age);
console.log('Stat fills (barres pleines %):', ui.fills.slice(0, 8).join(' | '));
console.log('Stat numbers lus:', ui.statSpans.join(', ') || '(non trouvés via classe)');
console.log('FlowBar:', ui.flowLabel, '| fill:', ui.flowFill);
console.log('ActionPanel buttons:', ui.actionBtns.length);
console.log('InfoBar:', ui.infoBar);

// ─── ÂGE ~10 ────────────────────────────────────────────────────────────────
for (let i = 0; i < 10; i++) { await handleEvent(i); await advance(); }
await shot('01-age10');
ui = await readUi();
console.log('\n═══ ÂGE ~10 ═══');
console.log('Age:', ui.age);
console.log('Fills:', ui.fills.slice(0, 8).join(' | '));
console.log('ActionPanel:', ui.actionBtns.map(b => `${b.label}(dis:${b.disabled})`).join(' / '));
console.log('Flow:', ui.flowLabel, ui.flowFill);

// ─── PENDANT UN EVENT ────────────────────────────────────────────────────────
let foundEvent = false;
for (let i = 0; i < 10; i++) {
  await advance();
  if (await page.locator('.event-card').isVisible({ timeout:400 }).catch(()=>false)) {
    await shot('02-event-open');
    ui = await readUi();
    console.log('\n═══ PENDANT EVENT ═══');
    console.log('Age:', ui.age);
    console.log('Event card:', ui.hasEventCard, '| choix:', ui.choiceCount);
    console.log('Timer fill:', ui.timer);
    console.log('Fills stats pendant event:', ui.fills.slice(0,8).join(' | '));
    // Vérifier que le timer bouge (prendre 2 snapshots à 500ms d'écart)
    const t1 = ui.timer;
    await page.waitForTimeout(600);
    const t2 = (await readUi()).timer;
    console.log('Timer t0:', t1, '→ t1 (600ms plus tard):', t2, t1 !== t2 ? '✓ TIMER BOUGE' : '✗ TIMER FIGÉ');
    // Répondre
    await page.locator('.btn-choice').first().click();
    await page.waitForTimeout(700);
    await shot('03-answered');
    ui = await readUi();
    console.log('Après réponse → correct:', ui.correctCount, '| wrong:', ui.wrongCount);
    console.log('Fills après réponse:', ui.fills.slice(0,8).join(' | '));
    await dismiss();
    foundEvent = true;
    break;
  }
}
if (!foundEvent) console.log('Aucun event rencontré en 10 tours');

// ─── TESTER PRIER + SYNCHRONISATION STAT FOI ────────────────────────────────
await advance();
await shot('04-idle-with-actions');
ui = await readUi();
const prierBtn = page.locator('button').filter({ hasText: /prier/i }).first();
const prierOk = await prierBtn.isVisible({ timeout:400 }).catch(()=>false);
console.log('\n═══ TEST ACTION PRIER ═══');
console.log('ActionPanel visible:', ui.actionBtns.length, 'boutons');
console.log('Fills avant prier:', ui.fills.slice(0,4).join(' | '));
if (prierOk) {
  await prierBtn.click();
  await page.waitForTimeout(400);
  await shot('05-after-pray');
  const ui2 = await readUi();
  console.log('Fills après prier:', ui2.fills.slice(0,4).join(' | '));
  // Vérifier si foi a changé (1ère barre = foi normalement)
  const changed = ui.fills[0] !== ui2.fills[0];
  console.log('1ère barre (Foi) changée:', changed ? '✓ Synchronisée' : '✗ Pas changée (vérifier ordre)');
  // Vérifier que Prier est maintenant coché/disabled
  const prierDisabled = await prierBtn.isDisabled().catch(()=>false);
  const prierTxt = await prierBtn.textContent().catch(()=>'');
  console.log('Prier disabled après clic:', prierDisabled, '| texte:', prierTxt.trim().slice(0,30));
}

// ─── ÂGE 25-30 : VÉRIFIER DECAY STATS ──────────────────────────────────────
for (let i = 0; i < 18; i++) { await handleEvent(); await advance(); }
await shot('06-age30');
ui = await readUi();
console.log('\n═══ ÂGE ~30 ═══');
console.log('Age:', ui.age);
console.log('Fills:', ui.fills.slice(0,8).join(' | '));
console.log('Combo:', ui.combo || 'absent');
console.log('Flow:', ui.flowLabel, ui.flowFill);
console.log('InfoBar (crises?):', ui.infoBar);

// ─── FINAL SCREENSHOT ────────────────────────────────────────────────────────
await shot('07-final');
await browser.close();
console.log('\n✓ Test terminé');
