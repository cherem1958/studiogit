import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPromptBlock,
  parseBriefingSections,
  validateOutputConformity,
  generateOfflineFallbackBriefing,
  PHILOSOPHICAL_TRADITIONS,
  SAMPLE_PRESETS,
  DEFAULT_INTERNATIONAL_NEWS,
  STRATEGIC_NODES,
  toggleTask,
  deleteTask,
  addTask,
  INITIAL_TASKS,
} from './curation.ts';

test('buildPromptBlock generates formatted input in English with display-only weather, indicators, and international news', () => {
  const sample = SAMPLE_PRESETS[0].data;
  const prompt = buildPromptBlock(sample);

  assert.ok(prompt.includes('=== DAILY DATA BRIEFING:'));
  assert.ok(prompt.includes('[WEATHER DATA - BELO HORIZONTE]'));
  assert.ok(prompt.includes('Current Temperature: 22.4°C'));
  assert.ok(prompt.includes('[MARKET & MACROECONOMIC INDICATORS]'));
  assert.ok(prompt.includes('Ibovespa Index (index): 129,850 pts [-1.45%]'));
  assert.ok(prompt.includes('[INTERNATIONAL NEWS & KEY GLOBAL EVENTS]'));
  assert.ok(prompt.includes('Middle East'));
  assert.ok(prompt.includes('[COMPLEMENTARY FACTS & REGIONAL NEWS]'));
});

test('parseBriefingSections extracts all 5 sections cleanly from English output', () => {
  const sample = SAMPLE_PRESETS[0].data;
  const markdown = generateOfflineFallbackBriefing(sample);

  const parsed = parseBriefingSections(markdown);
  assert.ok(parsed.weatherSection.length > 0, 'Weather section should be extracted');
  assert.ok(parsed.radarSection.length > 0, 'Radar section should be extracted');
  assert.ok(parsed.philosophySection.length > 0, 'Philosophy section should be extracted');
  assert.ok(parsed.quoteSection.length > 0, 'Quote section should be extracted');
  assert.ok(parsed.ignitionSection.length > 0, 'Ignition section should be extracted');
  assert.ok(parsed.quoteText && parsed.quoteText.length > 0, 'Quote text should be present');
});

test('validateOutputConformity checks mandatory English and Portuguese headings', () => {
  const sample = SAMPLE_PRESETS[0].data;
  const validMarkdown = generateOfflineFallbackBriefing(sample);
  const validation = validateOutputConformity(validMarkdown);
  assert.equal(validation.valid, true);
  assert.equal(validation.errors.length, 0);

  const invalidMarkdown = `### 1. 🌤️ Weather in Belo Horizonte\nSunny\n### 2. Missing other sections`;
  const invalidResult = validateOutputConformity(invalidMarkdown);
  assert.equal(invalidResult.valid, false);
  assert.ok(invalidResult.errors.length > 0);
});

test('PHILOSOPHICAL_TRADITIONS contains Catholic, Scholastic, Wolfgang Smith, and Olavo de Carvalho with quotes', () => {
  const ids = PHILOSOPHICAL_TRADITIONS.map(t => t.id);
  assert.ok(ids.includes('wolfgang-smith'), 'Should include Wolfgang Smith');
  assert.ok(ids.includes('olavo-de-carvalho'), 'Should include Olavo de Carvalho');
  assert.ok(ids.includes('escola-salamanca'), 'Should include Salamanca School');
  assert.ok(ids.includes('escolastica-tomismo'), 'Should include Scholasticism / Thomism');
  assert.ok(ids.includes('pensamento-catolico-moderno'), 'Should include Modern Catholic thinkers');

  const figures = PHILOSOPHICAL_TRADITIONS.flatMap(t => t.keyFigures);
  assert.ok(figures.includes('Wolfgang Smith'));
  assert.ok(figures.includes('Olavo de Carvalho'));
  assert.ok(figures.includes('St. Thomas Aquinas'));
  assert.ok(figures.includes('St. Augustine'));
  assert.ok(figures.includes('Francisco de Vitoria'));
  assert.ok(figures.includes('G.K. Chesterton'));

  for (const tradition of PHILOSOPHICAL_TRADITIONS) {
    assert.ok(tradition.sampleQuotes && tradition.sampleQuotes.length > 0, `${tradition.name} must have quotes`);
  }
});

test('STRATEGIC_NODES contains Belo Horizonte, Hormuz, Malacca, and Suez', () => {
  const ids = STRATEGIC_NODES.map(n => n.id);
  assert.ok(ids.includes('bh-latam'), 'Must include Belo Horizonte');
  assert.ok(ids.includes('hormuz'), 'Must include Hormuz');
  assert.ok(ids.includes('malacca'), 'Must include Malacca');
  assert.ok(ids.includes('suez-babalmandeb'), 'Must include Suez');
  assert.ok(ids.includes('taiwan-strait'), 'Must include Taiwan');
});

test('DEFAULT_INTERNATIONAL_NEWS has key global events in English', () => {
  assert.ok(DEFAULT_INTERNATIONAL_NEWS.length >= 4);
  const regions = DEFAULT_INTERNATIONAL_NEWS.map(n => n.region);
  assert.ok(regions.includes('Middle East'));
  assert.ok(regions.includes('Asia-Pacific'));
  assert.ok(regions.includes('North America'));
});

test('Task Matrix pure functions: toggleTask, deleteTask, and addTask for Financial BPO workflows', () => {
  // Test add
  const added = addTask(INITIAL_TASKS, 'Calibrate risk model for copper freight', 'reconciliation', 'high', '10:00 AM');
  assert.equal(added.length, INITIAL_TASKS.length + 1);
  assert.equal(added[0].title, 'Calibrate risk model for copper freight');
  assert.equal(added[0].completed, false);
  assert.equal(added[0].category, 'reconciliation');
  assert.equal(added[0].priority, 'high');
  assert.equal(added[0].dueTime, '10:00 AM');

  // Test toggle
  const toggled = toggleTask(added, added[0].id);
  assert.equal(toggled[0].completed, true);
  const untoggled = toggleTask(toggled, added[0].id);
  assert.equal(untoggled[0].completed, false);

  // Test delete
  const deleted = deleteTask(untoggled, added[0].id);
  assert.equal(deleted.length, INITIAL_TASKS.length);
  assert.ok(!deleted.some(t => t.id === added[0].id));
});

test('Financial BPO priorities: INITIAL_TASKS categories and BPO_TEMPLATE_PRESETS', async () => {
  const { BPO_TEMPLATE_PRESETS } = await import('./curation.ts');
  const categories = INITIAL_TASKS.map(t => t.category);
  assert.ok(categories.includes('reconciliation'), 'Must include reconciliation category');
  assert.ok(categories.includes('compliance'), 'Must include compliance category');
  assert.ok(categories.includes('reporting'), 'Must include reporting category');
  assert.ok(categories.includes('urgent'), 'Must include urgent category');

  assert.ok(BPO_TEMPLATE_PRESETS.length >= 3, 'Must have at least 3 BPO routine presets');
  const templateIds = BPO_TEMPLATE_PRESETS.map(t => t.id);
  assert.ok(templateIds.includes('daily-treasury'));
  assert.ok(templateIds.includes('month-end-close'));
  assert.ok(templateIds.includes('ar-audit-sprint'));
});

test('Second-Order Dynamics contains 3-tier causality presets', async () => {
  const { SECOND_ORDER_CAUSALITY_PRESETS } = await import('./curation.ts');
  assert.ok(SECOND_ORDER_CAUSALITY_PRESETS.length >= 3, 'Should provide at least 3 transmission scenarios');

  for (const preset of SECOND_ORDER_CAUSALITY_PRESETS) {
    assert.ok(preset.tier1Trigger.headline.length > 0, 'Tier 1 must have headline');
    assert.ok(preset.tier1Trigger.metric.length > 0, 'Tier 1 must have metric');
    assert.ok(preset.tier2Transmission.headline.length > 0, 'Tier 2 must have headline');
    assert.ok(preset.tier2Transmission.channel.length > 0, 'Tier 2 must have channel');
    assert.ok(preset.tier3BpoImplication.headline.length > 0, 'Tier 3 must have headline');
    assert.ok(preset.tier3BpoImplication.operationalAction.length > 0, 'Tier 3 must have operational action');
  }
});

test('evaluateMarketRegime identifies Risk-Off and Risk-On with divergence notes', async () => {
  const { evaluateMarketRegime } = await import('./curation.ts');
  const sampleIndicators = SAMPLE_PRESETS[0].data.indicators;
  const result = evaluateMarketRegime(sampleIndicators);

  assert.ok(['Risk-On', 'Risk-Off', 'Neutral / Transition'].includes(result.regime));
  assert.ok(result.divergenceNote.length > 0, 'Divergence note must be generated');
  assert.ok(result.bpoHedgingGuidance.length > 0, 'BPO hedging guidance must be provided');
  assert.ok(result.primaryDrivers.length > 0, 'Primary drivers must be listed');
});

test('Financial BPO 6 core categories are defined with valid labels and descriptions', async () => {
  const { BPO_CATEGORIES, normalizeTaskCategory } = await import('./curation.ts');
  assert.equal(BPO_CATEGORIES.length, 6, 'Must define exactly 6 core Financial BPO categories');

  const catIds = BPO_CATEGORIES.map(c => c.id);
  assert.ok(catIds.includes('bank_reconciliation'), 'Must include bank_reconciliation');
  assert.ok(catIds.includes('future_entries'), 'Must include future_entries');
  assert.ok(catIds.includes('optimization_analysis'), 'Must include optimization_analysis');
  assert.ok(catIds.includes('report_review'), 'Must include report_review');
  assert.ok(catIds.includes('compliance_audit'), 'Must include compliance_audit');
  assert.ok(catIds.includes('urgent_settlement'), 'Must include urgent_settlement');

  // Verify normalizeTaskCategory maps legacy names
  assert.equal(normalizeTaskCategory('reconciliation'), 'bank_reconciliation');
  assert.equal(normalizeTaskCategory('reporting'), 'report_review');
  assert.equal(normalizeTaskCategory('compliance'), 'compliance_audit');
  assert.equal(normalizeTaskCategory('urgent'), 'urgent_settlement');
  assert.equal(normalizeTaskCategory('future_entries'), 'future_entries');

  for (const cat of BPO_CATEGORIES) {
    assert.ok(cat.label.length > 0, `Category ${cat.id} must have label`);
    assert.ok(cat.description.length > 0, `Category ${cat.id} must have description`);
  }
});

test('Print/PDF Export helpers: filterTasksForPrint, generateDossierReferenceCode, getCategoryLabel', async () => {
  const {
    filterTasksForPrint,
    generateDossierReferenceCode,
    getCategoryLabel,
    DEFAULT_PRINT_EXPORT_OPTIONS,
    INITIAL_TASKS,
  } = await import('./curation.ts');

  // 1. Verify default options include both briefing and task matrix
  assert.equal(DEFAULT_PRINT_EXPORT_OPTIONS.includeBriefing, true, 'Print options must include briefing by default');
  assert.equal(DEFAULT_PRINT_EXPORT_OPTIONS.includeTaskMatrix, true, 'Print options must include task matrix by default');
  assert.equal(DEFAULT_PRINT_EXPORT_OPTIONS.taskFilter, 'all', 'Default task filter should be all');

  // 2. Verify dossier reference code generation
  const refCode = generateDossierReferenceCode('2026-03-30');
  assert.ok(refCode.startsWith('BPO-DOSSIER-20260330-'), 'Dossier ref code must follow formatted audit syntax');

  // 3. Test filterTasksForPrint: pending filter
  const pendingTasks = filterTasksForPrint(INITIAL_TASKS, 'pending', 'all');
  for (const t of pendingTasks) {
    assert.equal(t.completed, false, 'Pending filter must only return uncompleted tasks');
  }

  // 4. Test filterTasksForPrint: completed filter
  const completedTasks = filterTasksForPrint(INITIAL_TASKS, 'completed', 'all');
  for (const t of completedTasks) {
    assert.equal(t.completed, true, 'Completed filter must only return completed tasks');
  }

  // 5. Test filterTasksForPrint: category filter
  const reconTasks = filterTasksForPrint(INITIAL_TASKS, 'all', 'bank_reconciliation');
  assert.ok(reconTasks.length > 0, 'Must return bank reconciliation tasks');
  for (const t of reconTasks) {
    const norm = t.category === 'reconciliation' ? 'bank_reconciliation' : t.category;
    assert.equal(norm, 'bank_reconciliation');
  }

  // 6. Test getCategoryLabel
  assert.equal(getCategoryLabel('bank_reconciliation'), 'Bank Reconciliation');
  assert.equal(getCategoryLabel('future_entries'), 'Future Entries');
  assert.equal(getCategoryLabel('optimization_analysis'), 'Optimization & Analysis');
  assert.equal(getCategoryLabel('report_review'), 'Report Review');
  assert.equal(getCategoryLabel('compliance_audit'), 'Compliance / Audit');
  assert.equal(getCategoryLabel('urgent_settlement'), 'Urgent / Settlement');
});



