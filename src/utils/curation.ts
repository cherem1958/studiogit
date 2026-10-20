import type {
  BpoTaskCategory,
  DailyDataInput,
  InternationalNewsItem,
  LiveWireArticle,
  MarketIndicator,
  MarketRegimeState,
  ParsedBriefing,
  PhilosophicalTradition,
  SecondOrderCausality,
  StrategicNode,
  TaskItem,
  WeatherData,
} from '../types/index.ts';

/**
 * Builds the exact structured input block for the intelligence engine.
 */
export function buildPromptBlock(data: DailyDataInput): string {
  const weatherText = [
    `City: ${data.weather.city}`,
    `Current Temperature: ${data.weather.temperature.toFixed(1)}°C (Thermal Sensation: ${(data.weather.apparentTemperature ?? data.weather.temperature).toFixed(1)}°C)`,
    `Sky Conditions: ${data.weather.condition}`,
    `Min / Max: ${data.weather.minTemp ?? '--'}°C / ${data.weather.maxTemp ?? '--'}°C`,
    `Relative Humidity: ${data.weather.humidity}%`,
    `Precipitation Probability: ${data.weather.rainProbability}%`,
    `Wind Speed: ${data.weather.windSpeed} km/h`,
  ].join('\n');

  const indicatorsText = data.indicators
    .map(ind => `- ${ind.name} (${ind.category}): ${ind.value} [${ind.change}]`)
    .join('\n');

  let prompt = `=== DAILY DATA BRIEFING: ${data.date} ===\n\n`;
  prompt += `[WEATHER DATA - BELO HORIZONTE]\n${weatherText}\n\n`;
  prompt += `[MARKET & MACROECONOMIC INDICATORS]\n${indicatorsText}\n\n`;

  if (data.internationalNews && data.internationalNews.length > 0) {
    const activeIntl = data.internationalNews.filter(n => n.selected !== false);
    if (activeIntl.length > 0) {
      prompt += `[INTERNATIONAL NEWS & KEY GLOBAL EVENTS]\n`;
      activeIntl.forEach((item, idx) => {
        prompt += `${idx + 1}. [${item.region} | ${item.category.toUpperCase()}] ${item.title}\n   Summary: ${item.summary}\n   Systemic Mechanics & Strategic Impact: ${item.systemicImpact}\n`;
      });
      prompt += '\n';
    }
  }

  prompt += `[COMPLEMENTARY FACTS & REGIONAL NEWS]\n${data.news.trim()}\n`;

  if (data.philosophicalPreference && data.philosophicalPreference !== 'auto') {
    prompt += `\n[REQUESTED PHILOSOPHICAL FOCUS]\nConnect with tradition: ${data.philosophicalPreference}.\n`;
  }

  return prompt;
}

/**
 * Helper to find section boundaries with English or Portuguese headings.
 */
function findSectionIndex(text: string, englishHdr: string, ptHdr: string): { index: number; headerLength: number } {
  let idx = text.indexOf(englishHdr);
  if (idx !== -1) return { index: idx, headerLength: englishHdr.length };
  idx = text.indexOf(ptHdr);
  if (idx !== -1) return { index: idx, headerLength: ptHdr.length };
  return { index: -1, headerLength: 0 };
}

/**
 * Validates that an output matches the 5 mandatory sections.
 */
export function validateOutputConformity(markdown: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!markdown || typeof markdown !== 'string') {
    return { valid: false, errors: ['Report content is empty.'] };
  }

  const s1 = findSectionIndex(markdown, '### 1. 🌤️ Weather in Belo Horizonte', '### 1. 🌤️ Clima em Belo Horizonte').index !== -1;
  const s2 = findSectionIndex(markdown, '### 2. 🌐 Geopolitical and Economic Radar', '### 2. 🌐 Radar Geopolítico e Econômico').index !== -1;
  const s3 = findSectionIndex(markdown, '### 3. 🏛️ Classical & Catholic Philosophical Insight', '### 3. 🏛️ Pílula de Filosofia Clássica').index !== -1;
  const s4 = findSectionIndex(markdown, '### 4. ✍️ Quote of the Day', '### 4. ✍️ Frase do Dia').index !== -1;
  const s5 = findSectionIndex(markdown, '### 5. 🧠 Ignition Point', '### 5. 🧠 Ponto de Ignição').index !== -1;

  if (!s1) errors.push('Section 1 missing or has invalid heading (expected: "### 1. 🌤️ Weather in Belo Horizonte")');
  if (!s2) errors.push('Section 2 missing or has invalid heading (expected: "### 2. 🌐 Geopolitical and Economic Radar")');
  if (!s3) errors.push('Section 3 missing or has invalid heading (expected: "### 3. 🏛️ Classical & Catholic Philosophical Insight")');
  if (!s4) errors.push('Section 4 missing or has invalid heading (expected: "### 4. ✍️ Quote of the Day")');
  if (!s5) errors.push('Section 5 missing or has invalid heading (expected: "### 5. 🧠 Ignition Point")');

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Parses raw Markdown response into dedicated structured parts for editorial display.
 */
export function parseBriefingSections(markdown: string): ParsedBriefing {
  const result: ParsedBriefing = {
    rawMarkdown: markdown,
    weatherSection: '',
    radarSection: '',
    philosophySection: '',
    quoteSection: '',
    ignitionSection: '',
  };

  if (!markdown) return result;

  const s1 = findSectionIndex(markdown, '### 1. 🌤️ Weather in Belo Horizonte', '### 1. 🌤️ Clima em Belo Horizonte');
  const s2 = findSectionIndex(markdown, '### 2. 🌐 Geopolitical and Economic Radar', '### 2. 🌐 Radar Geopolítico e Econômico');
  const s3 = findSectionIndex(markdown, '### 3. 🏛️ Classical & Catholic Philosophical Insight', '### 3. 🏛️ Pílula de Filosofia Clássica');
  const s4 = findSectionIndex(markdown, '### 4. ✍️ Quote of the Day', '### 4. ✍️ Frase do Dia');
  const s5 = findSectionIndex(markdown, '### 5. 🧠 Ignition Point', '### 5. 🧠 Ponto de Ignição');

  if (s1.index !== -1 && s2.index !== -1) {
    result.weatherSection = markdown.slice(s1.index + s1.headerLength, s2.index).trim();
  }
  if (s2.index !== -1 && s3.index !== -1) {
    result.radarSection = markdown.slice(s2.index + s2.headerLength, s3.index).trim();
  }
  if (s3.index !== -1 && s4.index !== -1) {
    result.philosophySection = markdown.slice(s3.index + s3.headerLength, s4.index).trim();
  }
  if (s4.index !== -1 && s5.index !== -1) {
    result.quoteSection = markdown.slice(s4.index + s4.headerLength, s5.index).trim();
    const quoteMatch = result.quoteSection.match(/["“](.*?)["”]\s*[—–-]\s*(.+)/s);
    if (quoteMatch) {
      result.quoteText = quoteMatch[1].trim();
      result.quoteAuthor = quoteMatch[2].trim().replace(/\s+/g, ' ');
    } else {
      result.quoteText = result.quoteSection;
    }
  }
  if (s5.index !== -1) {
    result.ignitionSection = markdown.slice(s5.index + s5.headerLength).trim();
  }

  if (!result.weatherSection && !result.radarSection && !result.philosophySection) {
    result.radarSection = markdown;
  }

  return result;
}

/**
 * Key International Geopolitical & Economic Nodes for clean flat SVG diagrams and maps
 */
export const STRATEGIC_NODES: StrategicNode[] = [
  {
    id: 'bh-latam',
    name: 'Belo Horizonte & Iron Quadrangle',
    lat: -19.9208,
    lon: -43.9378,
    category: 'origin',
    region: 'Latin America',
    impactDescription: 'Mineral powerhouse of Brazil; iron ore and agricultural export hub via Vitória-Minas rail corridor to global Atlantic and Pacific supply chains.',
  },
  {
    id: 'hormuz',
    name: 'Strait of Hormuz (Persian Gulf)',
    lat: 26.5667,
    lon: 56.25,
    category: 'chokepoint',
    region: 'Middle East',
    impactDescription: 'Transit route for 21% of worldwide petroleum liquids and LNG. Critical nexus determining global energy risk premiums and maritime insurance.',
  },
  {
    id: 'malacca',
    name: 'Strait of Malacca (Singapore / Malaysia)',
    lat: 1.43,
    lon: 102.89,
    category: 'chokepoint',
    region: 'Asia-Pacific',
    impactDescription: 'Primary maritime vein connecting the Indian and Pacific Oceans. Carries over 80% of crude shipments destined for East Asian manufacturing hubs.',
  },
  {
    id: 'suez-babalmandeb',
    name: 'Suez Canal & Bab el-Mandeb (Red Sea)',
    lat: 27.84,
    lon: 34.29,
    category: 'chokepoint',
    region: 'Middle East & Africa',
    impactDescription: 'Essential artery for Asia-Europe trade (12% of global merchandise). Disruptions enforce Cape of Good Hope rerouting, adding 12–16 days of transit.',
  },
  {
    id: 'taiwan-strait',
    name: 'Taiwan Strait (Hsinchu - Taipei)',
    lat: 24.14,
    lon: 119.5,
    category: 'resource',
    region: 'Asia-Pacific',
    impactDescription: 'Global epicenter of advanced lithography and sub-3nm semiconductor fabrication. High systemic vulnerability for global computing infrastructure.',
  },
  {
    id: 'panama',
    name: 'Panama Canal',
    lat: 9.08,
    lon: -79.68,
    category: 'chokepoint',
    region: 'Central America',
    impactDescription: 'Interoceanic transit for bulk agricultural commodities, LNG, and container cargo between Atlantic and Pacific coasts.',
  },
  {
    id: 'wall-street',
    name: 'New York / Federal Reserve (Global Liquidity)',
    lat: 40.7128,
    lon: -74.006,
    category: 'finance',
    region: 'North America',
    impactDescription: 'Global dollar clearing hub, Treasury yield curve benchmark, and ultimate provider of emergency dollar swap liquidity.',
  },
  {
    id: 'brussels-frankfurt',
    name: 'Frankfurt / Brussels (ECB & EU Regulation)',
    lat: 50.1109,
    lon: 8.6821,
    category: 'finance',
    region: 'Europe',
    impactDescription: 'Regulatory nerve center, carbon border tax (CBAM) jurisdiction, and monetary policymaking under structural energy transformation.',
  },
];

/**
 * Default Key International News Items in English
 */
export const DEFAULT_INTERNATIONAL_NEWS: InternationalNewsItem[] = [
  {
    id: 'intl-1',
    region: 'Middle East',
    category: 'energy',
    title: 'Maritime Freight Risk Premiums Escalate in Persian Gulf Chokepoints',
    summary: 'Tensions across the Strait of Hormuz prompt tanker operators to renegotiate war-risk insurance cover and request escort protocols.',
    systemicImpact: 'Immediate upward pressure on spot Brent crude, maritime shipping rates, and downstream refinery feedstock costs across energy-importing economies.',
    selected: true,
  },
  {
    id: 'intl-2',
    region: 'North America',
    category: 'currency',
    title: 'US Treasury Yield Curve Steepens on Sovereign Debt Issuance Pressures',
    summary: 'Weak demand in benchmark 10-year and 30-year Treasury auctions drives real yields higher across sovereign borrowing markets.',
    systemicImpact: 'Liquidity drainage from emerging market assets, upward momentum in the trade-weighted US Dollar Index (DXY), and elevated borrowing costs in local currencies.',
    selected: true,
  },
  {
    id: 'intl-3',
    region: 'Asia-Pacific',
    category: 'technology',
    title: 'Advanced Lithography Export Controls Accelerate Semiconductor Bifurcation',
    summary: 'Multilateral curbs on extreme ultraviolet (EUV) fabrication equipment trigger capital expenditure duplicity and strategic stockpiling in Asia.',
    systemicImpact: 'Structural splitting of the global technological stack, elevated capital costs for artificial intelligence datacenters, and supply chain friction.',
    selected: true,
  },
  {
    id: 'intl-4',
    region: 'Europe',
    category: 'energy',
    title: 'European Industrial Base Confronts Elevated Structural Energy Input Costs',
    summary: 'Major chemical and metallurgical conglomerates relocate manufacturing operations to North America and Asia due to persistent power price premiums.',
    systemicImpact: 'Erosion of export trade competitiveness, widening trade deficits in heavy industry, and persistent currency valuation pressure.',
    selected: false,
  },
  {
    id: 'intl-5',
    region: 'Global / Multilateral',
    category: 'currency',
    title: 'Expansion of mBridge Multilateral Settlement Bypasses Correspondent Banking',
    summary: 'Central banks across emerging powers conduct multi-currency cross-border trade settlements directly through distributed ledger technology without New York routing.',
    systemicImpact: 'Gradual erosion of single-currency reserve hegemony, reduction of sanctions leverage, and emergence of localized trade clearing blocs.',
    selected: true,
  },
];

/**
 * Rich Philosophical Traditions catalog including Classical, Patristic, Scholastic,
 * Salamanca School, Wolfgang Smith, and Olavo de Carvalho.
 */
export const PHILOSOPHICAL_TRADITIONS: PhilosophicalTradition[] = [
  {
    id: 'escolastica-tomismo',
    name: 'Thomism & Medieval Catholic Philosophy',
    school: 'Scholasticism & Moderate Realism',
    period: 'Patristic & Medieval',
    keyFigures: ['St. Thomas Aquinas', 'St. Augustine', 'Boethius', 'Duns Scotus'],
    coreConcepts: [
      'Act and Potency in Sovereign Power Relations',
      'Order of Reason and the Common Good (Summa Theologiae)',
      'The Four Causes: Material, Formal, Efficient, and Final',
      'Commutative vs. Distributive Justice',
      'The City of God vs. The City of Man (Augustine)',
    ],
    sampleQuotes: [
      { text: 'Reason in the mind of the sovereign possesses the character of royal prudence, by which he governs the common good.', author: 'St. Thomas Aquinas' },
      { text: 'Justice being taken away, what are kingdoms but great bands of robbers?', author: 'St. Augustine' },
      { text: 'Virtue is the order of love; where right measure in intent is lacking, civic stability inevitably crumbles.', author: 'St. Augustine' },
      { text: 'There is no legitimate authority that is not subordinated to the rule of right reason.', author: 'St. Thomas Aquinas' },
    ],
    strategicRelevance: 'Recognition that temporal power and financial markets do not create reality ex-nihilo; they operate within immutable formal causes and teleological boundaries.',
  },
  {
    id: 'escola-salamanca',
    name: 'School of Salamanca & Moral Philosophy of the Market',
    school: 'Late Catholic Scholasticism',
    period: 'Scholastic & Renaissance',
    keyFigures: ['Francisco de Vitoria', 'Domingo de Soto', 'Martín de Azpilcueta', 'Francisco Suárez'],
    coreConcepts: [
      'Subjective Theory of Value and Utility in Trade',
      'Quantity Theory of Money and Natural Inflation (Dr. Navarrus)',
      'Natural Law as a Barrier Against Sovereign Arbitrariness',
      'Ius Gentium (Law of Nations & International Trade Jurisprudence)',
    ],
    sampleQuotes: [
      { text: 'Money is worth more where it is scarce than where it is abundant; the ruler’s edict cannot repeal the natural law of value.', author: 'Martín de Azpilcueta (Dr. Navarrus)' },
      { text: 'No sovereign possesses arbitrary authority to disrupt peaceful, legitimate commerce between free nations.', author: 'Francisco de Vitoria' },
      { text: 'An unjust human ordinance does not bind conscience before the bar of natural law.', author: 'Francisco Suárez' },
    ],
    strategicRelevance: 'Pioneered monetary analysis and the moral ethics of exchange; demonstrates that artificial currency debasement and debt expansion invariably erode contracts and social trust.',
  },
  {
    id: 'wolfgang-smith',
    name: 'Wolfgang Smith: Vertical Causation & Ontological Realism',
    school: 'Traditional Philosophy of Science & Catholic Ontology',
    period: 'Modern & Contemporary',
    keyFigures: ['Wolfgang Smith', 'Titus Burckhardt', 'René Guénon'],
    coreConcepts: [
      'Vertical Causation vs. Horizontal Temporal Causality',
      'Critique of the Cartesian Bifurcation of Nature',
      'The Corporeal Domain vs. The Quantitative Physical Construct',
      'Epistemological Limits of Mechanistic Reductionism',
    ],
    sampleQuotes: [
      { text: 'The corporeal domain is not a mathematical aggregate of particles, but a reality actualized under the sway of vertical causation.', author: 'Wolfgang Smith' },
      { text: 'By reducing reality to purely quantitative measurements, modern man loses perception of the formal principles that govern the whole.', author: 'Wolfgang Smith' },
      { text: 'Horizontal causality operates in time as a chain of impacts; vertical causality acts instantaneously upon form and substance.', author: 'Wolfgang Smith' },
    ],
    strategicRelevance: 'Exposes the technocratic illusion that complex markets and geopolitical systems can be reduced to linear econometric equations; sovereign decisions alter the system boundary conditions instantaneously.',
  },
  {
    id: 'olavo-de-carvalho',
    name: 'Olavo de Carvalho: Strategic Epistemology & Metacapitalism',
    school: 'Political Philosophy & Practical Epistemology',
    period: 'Modern & Contemporary',
    keyFigures: ['Olavo de Carvalho', 'Eric Voegelin', 'Konstantin Leontiev'],
    coreConcepts: [
      'Theory of the Four Discourses (Poetics, Rhetoric, Dialectics, Logic)',
      'Cognitive Parallax (structural fracture between experience and discourse)',
      'Metacapitalism and the Oligarchic-Bureaucratic Alliance',
      'The Revolutionary Mindset and Temporal Inversion',
      'The Garden of Afflictions (Global Governance vs. Moral Sovereignty)',
    ],
    sampleQuotes: [
      { text: 'Cognitive parallax is the structural disjunction between a thinker’s actual reality and the conceptual system he proclaims to explain it.', author: 'Olavo de Carvalho' },
      { text: 'The metacapitalist is the magnate who amassed wealth through economic liberty and subsequently enlists the state to lock the door behind him.', author: 'Olavo de Carvalho' },
      { text: 'Judge institutions not by their elevated rhetoric, but by the concrete mechanics of power they actually deploy.', author: 'Olavo de Carvalho' },
      { text: 'The loss of dialectical rigor reduces public deliberation to mere manipulative theater.', author: 'Olavo de Carvalho' },
    ],
    strategicRelevance: 'Enables analysts to identify the cognitive divergence between public institutional narratives and the actual mechanics of regulatory cartels consolidating market share.',
  },
  {
    id: 'pensamento-catolico-moderno',
    name: 'Modern Catholic Thinkers: Order & Moral Prudence',
    school: 'Modern Catholic Philosophy & Political Realism',
    period: 'Modern & Contemporary',
    keyFigures: ['G.K. Chesterton', 'Blaise Pascal', 'John Henry Newman', 'Alasdair MacIntyre'],
    coreConcepts: [
      'The Paradox of Modernity and Distributism (Chesterton)',
      'The Heart Has Reasons Which Reason Knows Nothing Of (Pascal)',
      'The Illative Sense and the Judgment of Conscience (Newman)',
      'After Virtue and the Breakdown of Enlightenment Moral Systems (MacIntyre)',
    ],
    sampleQuotes: [
      { text: 'Too much of modern capitalism is imperfect monopoly masquerading as free enterprise.', author: 'G.K. Chesterton' },
      { text: 'Force is the queen of the world, not opinion; yet it is opinion that directs the use of force.', author: 'Blaise Pascal' },
      { text: 'If you do not think according to your own first principles, someone else will think for you using theirs.', author: 'John Henry Newman' },
    ],
    strategicRelevance: 'Provides the moral and systemic discernment required to distinguish productive economic vitality from sterile debt centralization, emphasizing long-term institutional resilience.',
  },
  {
    id: 'estoicismo-classico',
    name: 'Classical Stoicism & Imperial Prudence',
    school: 'Classical Greco-Roman Philosophy',
    period: 'Classical Greco-Roman',
    keyFigures: ['Marcus Aurelius', 'Seneca', 'Epictetus', 'Cicero'],
    coreConcepts: [
      'Dichotomy of Control: Things in Our Power vs. Beyond Our Power (Epictetus)',
      'The Hegemonikon and the Inner Citadel (Marcus Aurelius)',
      'Amor Fati and Equanimity Amidst Market Turmoil',
      'Phronesis (Prudence) and Tactical Temperance',
    ],
    sampleQuotes: [
      { text: 'You have power over your mind, not outside events. Realize this, and you will find your true strength.', author: 'Marcus Aurelius' },
      { text: 'No wind is favorable to the sailor who knows not to which harbor he navigates.', author: 'Seneca' },
      { text: 'Men are disturbed not by things, but by the view which they take of them.', author: 'Epictetus' },
    ],
    strategicRelevance: 'Psychological fortitude and executive clarity during systemic liquidity shocks, sudden supply interruptions, and acute macro volatility.',
  },
  {
    id: 'aristotelismo-tucidides',
    name: 'Classical Political Realism & Strategy',
    school: 'Classical Hellenic Thought',
    period: 'Classical Greco-Roman',
    keyFigures: ['Aristotle', 'Thucydides', 'Polybius', 'Heraclitus'],
    coreConcepts: [
      'The Thucydides Trap (Rising Hegemon vs. Incumbent Power)',
      'The Melian Dialogue: The Strong Do What They Can, the Weak Suffer What They Must',
      'Anacyclosis: The Cyclical Succession of Regimes (Polybius)',
      'The Golden Mean and Practical Equity (Aristotle)',
    ],
    sampleQuotes: [
      { text: 'The real cause of the war was the growth of Athenian power and the fear which this caused in Sparta.', author: 'Thucydides' },
      { text: 'Courage is the first of human virtues because it makes all others possible.', author: 'Aristotle' },
      { text: 'There is nothing permanent except change.', author: 'Heraclitus' },
    ],
    strategicRelevance: 'Rigorous calculation of deterrence, balance-of-power equations between continental and maritime empires, and equilibrium management under friction.',
  },
];

/**
 * Curated preset scenarios in English
 */
export const SAMPLE_PRESETS: { name: string; description: string; data: DailyDataInput }[] = [
  {
    name: 'Persian Gulf Escalation & Vertical Causality',
    description: 'Hormuz under heightened alert, oil risk premiums, and supply chain re-routing.',
    data: {
      date: 'Tuesday, October 20, 2026',
      weather: {
        city: 'Belo Horizonte, MG',
        temperature: 22.4,
        apparentTemperature: 23.0,
        condition: 'Clear sky with dry morning mist',
        humidity: 62,
        rainProbability: 10,
        windSpeed: 12,
        minTemp: 18.0,
        maxTemp: 28.5,
        dateStr: '10/20/2026',
        source: 'Pampulha Meteorological Observatory, BH',
        lastUpdated: '07:15 AM BRT',
      },
      indicators: [
        { id: 'ibov', name: 'Ibovespa Index', category: 'index', value: '129,850 pts', change: '-1.45%', changeType: 'down', highlight: true },
        { id: 'sp500', name: 'S&P 500', category: 'index', value: '5,780 pts', change: '-0.88%', changeType: 'down' },
        { id: 'dolar', name: 'US Dollar / Brazilian Real (USD/BRL)', category: 'currency', value: 'R$ 5.684', change: '+1.15%', changeType: 'up', highlight: true },
        { id: 'euro', name: 'Euro / Brazilian Real (EUR/BRL)', category: 'currency', value: 'R$ 6.182', change: '+0.72%', changeType: 'up' },
        { id: 'brent', name: 'Brent Crude Oil (bbl)', category: 'commodities', value: '$91.40', change: '+3.82%', changeType: 'up', highlight: true },
        { id: 'gold', name: 'Gold (Troy Ounce)', category: 'commodities', value: '$2,680', change: '+1.40%', changeType: 'up', highlight: true },
        { id: 'us10y', name: 'US 10-Year Treasury Yield', category: 'rates', value: '4.48%', change: '+9 bps', changeType: 'up' },
        { id: 'selic', name: 'Brazil Selic / Interbank DI 2027', category: 'rates', value: '11.75% / 12.40%', change: '+15 bps', changeType: 'up' },
        { id: 'btc', name: 'Bitcoin (USD)', category: 'crypto', value: '$67,200', change: '-2.10%', changeType: 'down' },
      ],
      internationalNews: [
        DEFAULT_INTERNATIONAL_NEWS[0], // Hormuz
        DEFAULT_INTERNATIONAL_NEWS[1], // Treasuries
        DEFAULT_INTERNATIONAL_NEWS[4], // mBridge
      ],
      news: `1. Emergency G7 foreign ministers meeting signals reinforced multinational maritime patrols across Gulf energy transit lanes.
2. Central Bank of Brazil communique underscores fiscal asymmetry and currency depreciation pressures on core consumer price indexes.
3. Minas Gerais mining and metallurgy exporters assess logistics cost premiums for bulk shipping out of the Tubarão Atlantic terminal.`,
      philosophicalPreference: 'wolfgang-smith',
    },
  },
  {
    name: 'Technological Cartels & Metacapitalism',
    description: 'Semiconductor export controls, transnational compliance, and cognitive parallax.',
    data: {
      date: 'Monday, October 19, 2026',
      weather: {
        city: 'Belo Horizonte, MG',
        temperature: 24.1,
        apparentTemperature: 25.2,
        condition: 'Partly cloudy with pleasant afternoon breeze',
        humidity: 55,
        rainProbability: 20,
        windSpeed: 15,
        minTemp: 19.0,
        maxTemp: 29.5,
        dateStr: '10/19/2026',
        source: 'Mangabeiras Meteorological Station, BH',
        lastUpdated: '08:00 AM BRT',
      },
      indicators: [
        { id: 'ibov', name: 'Ibovespa Index', category: 'index', value: '131,200 pts', change: '+0.35%', changeType: 'up' },
        { id: 'nasdaq', name: 'Nasdaq 100', category: 'index', value: '20,310 pts', change: '+0.85%', changeType: 'up', highlight: true },
        { id: 'dolar', name: 'US Dollar / Real (USD/BRL)', category: 'currency', value: 'R$ 5.612', change: '-0.30%', changeType: 'down' },
        { id: 'selic', name: 'Brazil Selic Policy Target', category: 'rates', value: '11.75%', change: '0.00%', changeType: 'neutral' },
        { id: 'brent', name: 'Brent Crude Oil', category: 'commodities', value: '$84.20', change: '-0.60%', changeType: 'down' },
      ],
      internationalNews: [
        DEFAULT_INTERNATIONAL_NEWS[2], // Semicondutores
        DEFAULT_INTERNATIONAL_NEWS[3], // Europa
      ],
      news: `1. Supranational cybersecurity and algorithmic oversight accord establishes high regulatory compliance barriers, squeezing independent developers.
2. Brazilian industrial tech consortium reports extended lead times for specialized GPU accelerator imports destined for predictive dam safety analytics.
3. Federal legislature evaluates proposed capital framework governing foreign cloud datacenter investments in the domestic power grid.`,
      philosophicalPreference: 'olavo-de-carvalho',
    },
  },
  {
    name: 'Sovereign Debt & The Salamanca School',
    description: 'Fiscal expansion, fiat debasement, flight to gold, and late-scholastic monetary realism.',
    data: {
      date: 'Wednesday, October 21, 2026',
      weather: {
        city: 'Belo Horizonte, MG',
        temperature: 20.8,
        apparentTemperature: 21.0,
        condition: 'Overcast with isolated late afternoon rain',
        humidity: 78,
        rainProbability: 65,
        windSpeed: 10,
        minTemp: 17.5,
        maxTemp: 25.5,
        dateStr: '10/21/2026',
        source: 'Cercadinho Environmental Observatory, BH',
        lastUpdated: '07:30 AM BRT',
      },
      indicators: [
        { id: 'ibov', name: 'Ibovespa Index', category: 'index', value: '127,400 pts', change: '-1.85%', changeType: 'down', highlight: true },
        { id: 'dolar', name: 'US Dollar / Real', category: 'currency', value: 'R$ 5.745', change: '+1.60%', changeType: 'up', highlight: true },
        { id: 'gold', name: 'Gold Spot (Troy Ounce)', category: 'commodities', value: '$2,710', change: '+1.80%', changeType: 'up', highlight: true },
        { id: 'selic', name: 'DI Future Jan 2029', category: 'rates', value: '13.10%', change: '+25 bps', changeType: 'up', highlight: true },
      ],
      internationalNews: [
        DEFAULT_INTERNATIONAL_NEWS[1], // Treasuries
        DEFAULT_INTERNATIONAL_NEWS[4], // mBridge
      ],
      news: `1. Brazil gross sovereign debt projection reaches 82% of GDP; institutional asset managers demand record term premiums on fixed-rate paper.
2. Central banks across non-aligned economies expand physical bullion acquisitions to multi-decade highs, paring dollar reserve exposures.
3. Capital goods and infrastructure developers adjust hurdle rates upwards in response to elevated long-term domestic debt yields.`,
      philosophicalPreference: 'escola-salamanca',
    },
  },
];

/**
 * Deterministic offline fallback engine strictly adhering to English formatting
 */
export function generateOfflineFallbackBriefing(data: DailyDataInput): string {
  const w = data.weather;
  const intlEvents = data.internationalNews?.filter(n => n.selected !== false) || [];

  let conceptTitle = 'Vertical Causality and the Non-Linear Nature of Systems (Wolfgang Smith)';
  let philosopher = 'Wolfgang Smith';
  let quote = '"The corporeal domain is not a mathematical aggregate of particles, but a reality actualized under the sway of vertical causation."';
  let philosophyBody = `In *The Quantum Enigma* and *The Vertical Ascent*, Catholic physicist and philosopher Wolfgang Smith confronts modern mechanistic reductionism. He demonstrates that horizontal causality—the linear chain of sequential reactions across time (such as financial asset repricing, derivative shifts, and supply logistics)—is intrinsically subordinate to vertical causation: the instantaneous ordering principle that shapes the boundary conditions of the whole.
When reviewing today’s international developments—where sovereign decrees, maritime embargoes, and financial sanctions disrupt econometric risk models overnight—analysts typically attempt to explain systemic shocks through mere horizontal volatility. They overlook that geopolitics and genuine power obey vertical hierarchies: a single sovereign intervention transforms the systemic state instantaneously, neutralizing the linear projections of those who mistake quantitative matter for the formal organizing principle.`;
  let ignitionQ = `In your long-term strategic posture, are you relying solely on horizontal market indicators, or have you identified where vertical causation resides that can alter your operating environment overnight?`;

  if (data.philosophicalPreference === 'olavo-de-carvalho') {
    conceptTitle = 'Metacapitalism, Regulatory Capture, and Cognitive Parallax (Olavo de Carvalho)';
    philosopher = 'Olavo de Carvalho';
    quote = '"The metacapitalist is the magnate who amassed wealth through economic liberty and subsequently enlists the state to lock the door behind him."';
    philosophyBody = `In *The Garden of Afflictions*, Olavo de Carvalho detailed the mechanics of metacapitalism: the stage where multi-billion-dollar conglomerates, having prospered through competitive markets, align with state bureaucracies and supranational agencies to establish prohibitive regulatory barriers against new market entrants.
Today's convergence between artificial intelligence export controls, algorithmic compliance mandates, and carbon border adjustments exemplifies this mechanism. There is a structural cognitive parallax: public institutional discourse professes consumer protection and systemic safety, while the concrete mechanics consolidate insulated oligarchic cartels shielded from authentic competition.`;
    ignitionQ = `In your organizational partnerships and capital allocation, where are you accepting polished institutional rhetoric at face value, and where are you discerning the cold mechanics of bottleneck control?`;
  } else if (data.philosophicalPreference === 'escola-salamanca') {
    conceptTitle = 'Natural Law of Value and Fiat Monetary Illusion (Martín de Azpilcueta & The School of Salamanca)';
    philosopher = 'Martín de Azpilcueta (Dr. Navarrus)';
    quote = '"Money is worth more where it is scarce than where it is abundant; the ruler’s edict cannot repeal the natural law of value."';
    philosophyBody = `During the 16th century, Dominican and Jesuit masters at the School of Salamanca, led by Martín de Azpilcueta and Francisco de Vitoria, formulated the quantity theory of money and the subjective theory of value. Observing the sudden influx of New World silver and royal debasement schemes, they concluded that no sovereign holds the moral prerogative to artificially dilute currency purchasing power without committing an unjust expropriation against natural law.
The upward surge in sovereign yields and the global flight toward physical gold confirm that the natural law of value remains unforgiving: the artificial expansion of credit unbacked by productive output inevitably manifests in currency depreciation and capital flight.`;
    ignitionQ = `Amid continuous sovereign debt expansion and currency debasement, how is your balance sheet anchored in durable assets that resist bureaucratic monetary dilution?`;
  } else if (data.philosophicalPreference === 'escolastica-tomismo') {
    conceptTitle = 'The Order of Reason and the Teleology of Governance (St. Thomas Aquinas)';
    philosopher = 'St. Thomas Aquinas';
    quote = '"Reason in the mind of the sovereign possesses the character of royal prudence, by which he governs the common good."';
    philosophyBody = `In the *Summa Theologiae* (I-II, q. 90), St. Thomas Aquinas demonstrates that practical authority possesses legitimacy only when guided by right reason toward the common good. Current global events expose institutions trapped in the tyranny of the immediate, sacrificing formal causes and generational solvency to prolong unsustainable fiscal arrangements. When royal prudence is replaced by short-term political expediency, systemic friction and institutional decay are inevitable.`;
    ignitionQ = `Are your tactical priorities aligned with a well-defined final cause, or are you expending momentum reacting to daily noise without anchoring your trajectory in the enduring good?`;
  }

  const intlSummaryPoint = intlEvents.length > 0
    ? `1. **Interconnected Global Chokepoints**: Developments in ${intlEvents.map(e => e.region).slice(0, 2).join(' and ')}—specifically ${intlEvents[0].title.toLowerCase()}—directly compound freight rates and logistics uncertainty across transoceanic shipping routes. This reflects structural vulnerability in global trade corridors rather than isolated friction.`
    : `1. **Term Premium Pressures**: Sovereign yield curves reflect institutional investors demanding higher compensatory returns against persistent fiscal deficits.`;

  return `### 1. 🌤️ Weather in Belo Horizonte
The capital of Minas Gerais opens at ${w.temperature.toFixed(1)}°C with ${w.condition.toLowerCase()}, relative humidity at ${w.humidity}%, and winds of ${w.windSpeed} km/h (projected daily maximum of ${w.maxTemp ?? 28}°C). May the serene altitude of the Serra do Curral inspire clarity and disciplined focus as you navigate today's strategic demands.

### 2. 🌐 Geopolitical and Economic Radar
${intlSummaryPoint}
2. **Real Physical Constraints vs. Nominal Volatility**: While equity markets fixate on central bank forward guidance, the firmness in critical commodities (energy, fertilizers, and maritime transport) demonstrates that the real economy remains governed by thermodynamic and logistics realities rather than accounting consensus.
3. **Multilateral Settlement Decoupling**: The ongoing development of bilateral clearing channels outside the traditional correspondent banking framework signals a shift toward multi-polar trade. Sovereign states tolerate near-term settlement friction to insulate their strategic independence from single-currency jurisdictions.
4. **Impact on Domestic Balance Sheets**: In Belo Horizonte and across Brazilian industrial corridors, exchange-rate pass-through and elevated local interest rates raise the cost of working capital, mandating rigorous cash management.

### 3. 🏛️ Classical & Catholic Philosophical Insight
**${conceptTitle}**
${philosophyBody}

### 4. ✍️ Quote of the Day
${quote} — ${philosopher}

### 5. 🧠 Ignition Point
${ignitionQ}`;
}

/**
 * The six core Financial BPO operational and analytical categories with descriptions and visual roles
 */
export const BPO_CATEGORIES = [
  {
    id: 'bank_reconciliation' as const,
    label: 'Bank Reconciliation',
    shortLabel: 'Bank Recon',
    description: 'Match bank statement transactions to ERP records; investigate unmatched transactions, duplicate entries, timing differences, and balance variances.',
    colorBorder: 'border-slate-400',
    colorBg: 'bg-slate-50',
    colorText: 'text-slate-800',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
  },
  {
    id: 'future_entries' as const,
    label: 'Future Entries',
    shortLabel: 'Future Entries',
    description: 'Review and validate scheduled or pending accounting entries, payment instructions, recurring transactions, and expected settlements before they post.',
    colorBorder: 'border-blue-400',
    colorBg: 'bg-blue-50/70',
    colorText: 'text-blue-900',
    badgeClass: 'bg-blue-50 text-blue-900 border-blue-200',
  },
  {
    id: 'optimization_analysis' as const,
    label: 'Optimization & Analysis',
    shortLabel: 'Optimization',
    description: 'Identify process inefficiencies, recurring exceptions, cost-saving opportunities, liquidity risks, and working-capital improvements using available financial data.',
    colorBorder: 'border-emerald-400',
    colorBg: 'bg-emerald-50/70',
    colorText: 'text-emerald-900',
    badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  },
  {
    id: 'report_review' as const,
    label: 'Report Review',
    shortLabel: 'Report Review',
    description: 'Read and validate financial reports, including cash flow, income statement/DRE, accounts payable and receivable aging, budget-versus-actual results, and KPI reports.',
    colorBorder: 'border-indigo-400',
    colorBg: 'bg-indigo-50/70',
    colorText: 'text-indigo-900',
    badgeClass: 'bg-indigo-50 text-indigo-900 border-indigo-200',
  },
  {
    id: 'compliance_audit' as const,
    label: 'Compliance / Audit',
    shortLabel: 'Compliance',
    description: 'Verify invoices and tax documents, confirm supporting documentation, and maintain traceable audit records.',
    colorBorder: 'border-amber-400',
    colorBg: 'bg-amber-50/70',
    colorText: 'text-amber-900',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-200',
  },
  {
    id: 'urgent_settlement' as const,
    label: 'Urgent / Settlement',
    shortLabel: 'Urgent Settlement',
    description: 'Handle time-sensitive settlements, same-day payment releases, critical vendor issues, and escalated reconciliation items.',
    colorBorder: 'border-rose-400',
    colorBg: 'bg-rose-50/70',
    colorText: 'text-rose-900',
    badgeClass: 'bg-rose-50 text-rose-900 border-rose-200',
  },
];

/**
 * Normalizes legacy categories to the 6 core workflows
 */
export function normalizeTaskCategory(category: string): string {
  if (category === 'reconciliation') return 'bank_reconciliation';
  if (category === 'reporting') return 'report_review';
  if (category === 'compliance') return 'compliance_audit';
  if (category === 'urgent') return 'urgent_settlement';
  return category;
}

/**
 * Pre-seeded realistic tasks contextualized specifically for Financial BPO Analysis Workflows
 */
export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'bpo-task-1',
    title: 'Match multi-currency bank statements to ERP cash subledger and resolve $14,250 FX variance',
    description: 'Extract MT940 daily statement from Itaú BBA & Citibank Treasury; match wire inflows against pending receivables and investigate ledger discrepancy.',
    entityOrAccount: 'Itaú Treasury Account #0492 / SAP S/4HANA',
    completed: false,
    createdAt: Date.now() - 3600000,
    category: 'bank_reconciliation',
    priority: 'high',
    dueTime: '11:00 AM',
  },
  {
    id: 'bpo-task-2',
    title: 'Pre-validate scheduled vendor payment batch ($184,500) and check banking cutoff times',
    description: 'Review batch release queue for next-day supplier settlements; verify bank account routing codes and confirm working capital availability prior to 02:00 PM.',
    entityOrAccount: 'NetSuite AP Batch #942 / Banco do Brasil',
    completed: false,
    createdAt: Date.now() - 5400000,
    category: 'future_entries',
    priority: 'high',
    dueTime: '01:30 PM',
  },
  {
    id: 'bpo-task-3',
    title: 'Evaluate supplier payment terms to capture 2/10 net 30 prompt payment discount opportunities',
    description: 'Identify $68,000 in monthly recurring vendor invoices where early payment yield exceeds 24% annualized CDI rate; propose working capital protocol.',
    entityOrAccount: 'Strategic AP Analysis / Cash Flow Model',
    completed: false,
    createdAt: Date.now() - 7200000,
    category: 'optimization_analysis',
    priority: 'medium',
    dueTime: '03:00 PM',
  },
  {
    id: 'bpo-task-4',
    title: 'Review and validate executive DRE (P&L) and 13-week rolling liquidity forecast',
    description: 'Compare budget-vs-actual variance on logistics COGS and operating SG&A; reconcile EBITDA margin trends with CFO commentary notes.',
    entityOrAccount: 'Corporate Financial Planning & Analysis / DRE',
    completed: false,
    createdAt: Date.now() - 10800000,
    category: 'report_review',
    priority: 'high',
    dueTime: '04:00 PM',
  },
  {
    id: 'bpo-task-5',
    title: 'Audit three-way invoice matching (PO, Receipt Slip, NF-e XML) and verify tax withholdings',
    description: 'Cross-check ISS, IRRF, PIS, and COFINS withholding tax calculations on service invoices against municipal tax portal guidelines and export audit trail.',
    entityOrAccount: 'Tax & Audit Gateway / SEF-MG & SPED',
    completed: true,
    createdAt: Date.now() - 14400000,
    category: 'compliance_audit',
    priority: 'medium',
    dueTime: '05:00 PM',
  },
  {
    id: 'bpo-task-6',
    title: 'Release urgent SWIFT wire for maritime logistics clearance to prevent demurrage penalty',
    description: 'Immediate dual-authorization wire release ($84,200) for containerized cargo clearance at Santos port with critical 12:30 PM cutoff.',
    entityOrAccount: 'Citibank Commercial FX / Port Logistics',
    completed: false,
    createdAt: Date.now() - 18000000,
    category: 'urgent_settlement',
    priority: 'high',
    dueTime: '12:00 PM',
  },
  // Legacy category items for test compatibility and backward support
  {
    id: 'bpo-task-7',
    title: 'Reconcile daily multi-currency treasury cash accounts and sweep surplus to CDI repo',
    description: 'Treasury surplus sweeps into overnight repo facilities at 100% CDI.',
    entityOrAccount: 'Treasury Repo Desk',
    completed: false,
    createdAt: Date.now() - 21600000,
    category: 'reconciliation',
    priority: 'high',
    dueTime: '10:30 AM',
  },
  {
    id: 'bpo-task-8',
    title: 'Validate municipal withholding tax slips (ISS/IRRF/PIS/COFINS) on vendor invoices',
    description: 'Municipal compliance validation for billing integrity.',
    entityOrAccount: 'Tax Desk',
    completed: true,
    createdAt: Date.now() - 25200000,
    category: 'compliance',
    priority: 'medium',
    dueTime: '02:00 PM',
  },
  {
    id: 'bpo-task-9',
    title: 'Consolidate monthly DRE (P&L) and 13-week rolling cash flow variance report',
    description: 'Monthly closing report for corporate review.',
    entityOrAccount: 'Accounting Management',
    completed: false,
    createdAt: Date.now() - 28800000,
    category: 'reporting',
    priority: 'high',
    dueTime: '04:30 PM',
  },
  {
    id: 'bpo-task-10',
    title: 'Execute urgent SWIFT wire release for critical maritime bunker fuel invoice ($84,200)',
    description: 'Time-sensitive trade settlement.',
    entityOrAccount: 'Trade Desk',
    completed: false,
    createdAt: Date.now() - 32400000,
    category: 'urgent',
    priority: 'high',
    dueTime: '11:45 AM',
  },
];

/**
 * Standard pre-built BPO routine templates to quickly populate standard tasks
 */
export const BPO_TEMPLATE_PRESETS = [
  {
    id: 'daily-treasury',
    name: 'Morning Settlement & Treasury Clearing',
    description: 'Standard daily workflow for treasury sweeps, wire releases, and bank reconciliation.',
    estimatedMinutes: 45,
    tasks: [
      {
        title: 'Match primary operating bank statements with ERP subledgers',
        description: 'Import daily MT940 statement and run automated reconciliation rule; flag items with variances > $500.',
        entityOrAccount: 'Itaú BBA / SAP Cash Ledger',
        category: 'bank_reconciliation' as const,
        priority: 'high' as const,
        dueTime: '10:00 AM',
      },
      {
        title: 'Execute batch wire settlements for same-day scheduled vendor invoices',
        description: 'Verify dual-approvals and trigger CNAB payment file upload to commercial banking portal.',
        entityOrAccount: 'AP Payment Queue / Banco do Brasil',
        category: 'urgent_settlement' as const,
        priority: 'high' as const,
        dueTime: '11:30 AM',
      },
      {
        title: 'Review scheduled future entries for afternoon clearing and payroll liabilities',
        description: 'Check projected bank balances against pending tax withholdings and salary transfers.',
        entityOrAccount: 'Treasury Cash Forecast',
        category: 'future_entries' as const,
        priority: 'medium' as const,
        dueTime: '01:00 PM',
      },
      {
        title: 'Sweep idle operating cash surplus into remunerated CDI overnight repo facility',
        description: 'Ensure minimum operating cash buffer ($250k) is held; place remainder in overnight repo at 100% CDI.',
        entityOrAccount: 'Treasury Overnight Desk',
        category: 'optimization_analysis' as const,
        priority: 'high' as const,
        dueTime: '04:00 PM',
      },
    ],
  },
  {
    id: 'month-end-close',
    name: 'Month-End Close & DRE Financial Reporting',
    description: 'End-of-period closing routine covering accruals, intercompany revaluation, and DRE review.',
    estimatedMinutes: 90,
    tasks: [
      {
        title: 'Reconcile all bank statements, credit card acquirers, and cash clearing accounts',
        description: 'Zero out uncleared transit items older than 5 business days and document justification memo.',
        entityOrAccount: 'General Ledger / Cash Clearing',
        category: 'bank_reconciliation' as const,
        priority: 'high' as const,
        dueTime: '11:00 AM',
      },
      {
        title: 'Validate future entry accruals for unbilled AP liabilities and utility provisions',
        description: 'Post recurring depreciation schedules and calculate prepaid insurance amortization.',
        entityOrAccount: 'ERP Journal Entries / SAP',
        category: 'future_entries' as const,
        priority: 'medium' as const,
        dueTime: '02:00 PM',
      },
      {
        title: 'Read and validate final executive DRE (P&L) statement against operational budget',
        description: 'Scrutinize EBITDA margin variances and verify gross revenue deductions (PIS, COFINS, ICMS, ISS).',
        entityOrAccount: 'Executive DRE & FP&A',
        category: 'report_review' as const,
        priority: 'high' as const,
        dueTime: '04:00 PM',
      },
      {
        title: 'Archive auditor-ready tax documentation, withholding receipts, and trial balance',
        description: 'Generate zipped compliance package for external statutory auditors with verified digital signatures.',
        entityOrAccount: 'Compliance Gateway / Audit Trail',
        category: 'compliance_audit' as const,
        priority: 'high' as const,
        dueTime: '05:30 PM',
      },
    ],
  },
  {
    id: 'ar-audit-sprint',
    name: 'Accounts Receivable & Working Capital Audit',
    description: 'Weekly review of debtor aging, dispute resolutions, and cash conversion cycle optimization.',
    estimatedMinutes: 60,
    tasks: [
      {
        title: 'Analyze 30/60/90-day aging accounts receivable report and identify at-risk balances',
        description: 'Filter overdue accounts exceeding $10,000 and calculate required doubtful debt allowance (PECLD).',
        entityOrAccount: 'Accounts Receivable Subledger',
        category: 'report_review' as const,
        priority: 'high' as const,
        dueTime: '10:00 AM',
      },
      {
        title: 'Investigate customer payment disputes, deduction claims, and credit memo requests',
        description: 'Validate billing accuracy against signed commercial contracts and shipping bills of lading.',
        entityOrAccount: 'Commercial Operations CRM',
        category: 'bank_reconciliation' as const,
        priority: 'medium' as const,
        dueTime: '11:30 AM',
      },
      {
        title: 'Identify process bottlenecks causing customer billing delays and DSO expansion',
        description: 'Diagnose whether invoicing lags originate from logistics dispatch confirmation or tax validation.',
        entityOrAccount: 'Process Optimization Sprint',
        category: 'optimization_analysis' as const,
        priority: 'medium' as const,
        dueTime: '02:30 PM',
      },
      {
        title: 'Issue formal notification and escalate delinquent corporate balances for legal protest',
        description: 'Transmit verified promissory notes and billing slips to regional protest notary (Cartório de Protesto).',
        entityOrAccount: 'Legal & Credit Recovery',
        category: 'urgent_settlement' as const,
        priority: 'high' as const,
        dueTime: '04:00 PM',
      },
    ],
  },
  {
    id: 'future-settlement-audit',
    name: 'Scheduled Entries & Accruals Pre-Validation',
    description: 'Focus on future scheduled payment instructions, recurring entries, and cash burn control.',
    estimatedMinutes: 40,
    tasks: [
      {
        title: 'Review pending ERP recurring entries scheduled for the upcoming 7 business days',
        description: 'Check loan amortization installments, lease obligations (IFRS 16), and utility debits.',
        entityOrAccount: 'Future Entries Ledger',
        category: 'future_entries' as const,
        priority: 'high' as const,
        dueTime: '10:30 AM',
      },
      {
        title: 'Audit supporting documentation (contracts, POs) for all scheduled wire instructions > $20k',
        description: 'Ensure anti-fraud compliance and verify beneficiary bank account IBAN/SWIFT matches vendor file.',
        entityOrAccount: 'Internal Controls & Compliance',
        category: 'compliance_audit' as const,
        priority: 'high' as const,
        dueTime: '01:30 PM',
      },
      {
        title: 'Optimize payment scheduling timing to preserve interest-bearing cash buffer',
        description: 'Align payment execution dates strictly with supplier invoice due dates rather than early processing.',
        entityOrAccount: 'Working Capital Desk',
        category: 'optimization_analysis' as const,
        priority: 'normal' as const,
        dueTime: '03:30 PM',
      },
    ],
  },
];

export function toggleTask(tasks: TaskItem[], id: string): TaskItem[] {
  return tasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t));
}

export function deleteTask(tasks: TaskItem[], id: string): TaskItem[] {
  return tasks.filter(t => t.id !== id);
}

export function addTask(
  tasks: TaskItem[],
  title: string,
  category: TaskItem['category'] = 'bank_reconciliation',
  priority: TaskItem['priority'] = 'medium',
  dueTime?: string,
  description?: string,
  entityOrAccount?: string
): TaskItem[] {
  const trimmed = title.trim();
  if (!trimmed) return tasks;
  const newTask: TaskItem = {
    id: `bpo-task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: trimmed,
    description: description?.trim() || undefined,
    entityOrAccount: entityOrAccount?.trim() || undefined,
    completed: false,
    createdAt: Date.now(),
    category,
    priority,
    dueTime,
  };
  return [newTask, ...tasks];
}

/**
 * Curated Second-Order Dynamics models connecting macro shocks to operational Financial BPO execution
 */
export const SECOND_ORDER_CAUSALITY_PRESETS: SecondOrderCausality[] = [
  {
    id: 'fx-shock',
    triggerTitle: 'USD/BRL Volatility & Currency Depreciation Pressure',
    category: 'fx',
    tier1Trigger: {
      headline: 'Primary Trigger: Offshore USD Surge & Currency Repricing',
      metric: 'USD/BRL tests 5.74 (+0.85%), DXY index strengthens to 104.4',
      mechanism: 'Global capital flows rebalance toward US short-term yields, placing immediate structural pressure on emerging market FX spot and forwards.',
    },
    tier2Transmission: {
      headline: 'Systemic Transmission: Trade Working Capital & Supplier Terms Compression',
      channel: 'Import landed costs rise by 4.2%; offshore vendors curtail unsecured open-account terms and demand irrevocable letters of credit or shorten DPO from Net-60 to Net-30.',
      friction: 'Corporate working capital buffer shrinks as cash conversion cycle (CCC) expands by 8.4 days.',
    },
    tier3BpoImplication: {
      headline: 'Tactical BPO Implication: Cash Desk Hedging & Urgent AP Renegotiation',
      operationalAction: 'Audit unhedged FX payable exposure; prioritize AP voucher settlement before currency adjustment cutoff; renegotiate vendor discount terms for early cash payments.',
      kpiImpact: 'Working Capital Impact: +$420k cash drain risk; immediate focus on DSO compression to offset DPO contraction.',
    },
  },
  {
    id: 'rates-steepening',
    triggerTitle: 'Sovereign Yield Curve Steepening & Selic Terminal Rate Plateau',
    category: 'rates',
    tier1Trigger: {
      headline: 'Primary Trigger: DI Interest Rate Curve Steepening',
      metric: 'DI Future 2027 rises +18 bps to 12.35%; Selic target sustained at elevated 11.25%',
      mechanism: 'Fiscal risk premiums elevate longer-dated debt yields while central bank maintains restrictive overnight policy stance.',
    },
    tier2Transmission: {
      headline: 'Systemic Transmission: Corporate Factoring & Receivable Discounting Cost Surge',
      channel: 'Commercial banks widen corporate borrowing spreads (+85 bps); accounts receivable factoring haircuts increase from 1.2% to 2.1% monthly.',
      friction: 'Overdraft line utilization rises for tier-2 corporate buyers, causing delayed milestone approvals on enterprise receivables.',
    },
    tier3BpoImplication: {
      headline: 'Tactical BPO Implication: Daily Cash Concentration & Tightened Dunning Protocol',
      operationalAction: 'Sweep end-of-day idle cash into remunerated 100% CDI repo accounts; expedite 15-day dunning escalations; mandate dual-authorization on Capex disbursements.',
      kpiImpact: 'Treasury Yield Optimization: +$14,500 monthly interest income capture; DSO targeted < 32 days.',
    },
  },
  {
    id: 'energy-logistics',
    triggerTitle: 'Maritime Chokepoint Disruption & Crude Freight Escalation',
    category: 'energy',
    tier1Trigger: {
      headline: 'Primary Trigger: Energy & War-Risk Shipping Premiums Rise',
      metric: 'Brent crude holds above $84/bbl (+1.4%); container freight rates jump 22%',
      mechanism: 'Geopolitical alert across Bab el-Mandeb and Strait of Hormuz diverts container carriers, increasing transit days by 12–16 days via Cape of Good Hope.',
    },
    tier2Transmission: {
      headline: 'Systemic Transmission: Supply Chain Lead Time Extension & Inventory Bloat',
      channel: 'Container demurrage penalties rise; transit inventory ties up operational liquidity; gross margins compress due to fuel surcharge pass-through.',
      friction: 'Accrual mismatches emerge between goods received at port and final vendor invoices, complicating period-end reconciliation.',
    },
    tier3BpoImplication: {
      headline: 'Tactical BPO Implication: 3-Way Matching Rigor & COGS Accrual Recalibration',
      operationalAction: 'Enforce strict 3-way matching (Purchase Order, Bill of Lading, Carrier Invoice) to contest excess port storage surcharges; adjust DRE freight cost accruals.',
      kpiImpact: 'Prevented Overbilling: ~$28,000 in unverified demurrage fees disputed; clean period-end DRE matching.',
    },
  },
];

/**
 * Minimalist, deterministic engine evaluating Market Regime (Risk-On vs. Risk-Off)
 * and identifying key macro divergence vectors for financial controllers and analysts.
 */
export function evaluateMarketRegime(indicators: MarketIndicator[]): MarketRegimeState {
  let score = 0; // Negative = Risk-Off, Positive = Risk-On
  const drivers: string[] = [];

  const usdBrl = indicators.find(i => i.id === 'usdBrl' || i.name.includes('USD'));
  const ibov = indicators.find(i => i.id === 'ibovespa' || i.name.includes('Ibovespa'));
  const sp500 = indicators.find(i => i.id === 'sp500' || i.name.includes('S&P'));
  const diRate = indicators.find(i => i.id === 'diRate' || i.name.includes('DI'));
  const gold = indicators.find(i => i.id === 'gold' || i.name.includes('Gold'));
  const brent = indicators.find(i => i.id === 'brent' || i.name.includes('Brent'));

  // USD evaluation
  if (usdBrl) {
    if (usdBrl.change.startsWith('+')) {
      score -= 25;
      drivers.push(`USD/BRL strengthening (${usdBrl.change}) exerts domestic liquidity pressure`);
    } else {
      score += 25;
      drivers.push(`USD/BRL easing (${usdBrl.change}) stabilizes imported cost base`);
    }
  }

  // Equity momentum
  if (ibov) {
    if (ibov.change.startsWith('+')) {
      score += 25;
      drivers.push(`Ibovespa positive equity momentum (${ibov.change})`);
    } else {
      score -= 25;
      drivers.push(`Ibovespa equity retraction (${ibov.change}) reflects risk aversion`);
    }
  }

  if (sp500) {
    if (sp500.change.startsWith('+')) score += 15;
    else score -= 15;
  }

  // Interest rate curve
  if (diRate) {
    if (diRate.change.startsWith('+')) {
      score -= 20;
      drivers.push(`DI rate curve widening (${diRate.change}) elevates corporate cost of capital`);
    } else {
      score += 20;
      drivers.push(`DI rate easing (${diRate.change}) softens working capital financing burden`);
    }
  }

  // Safe haven gold
  if (gold && gold.change.startsWith('+')) {
    score -= 15;
  }

  // Energy
  if (brent && brent.change.startsWith('+')) {
    score -= 10;
  }

  let regime: 'Risk-On' | 'Risk-Off' | 'Neutral / Transition';
  let bpoHedgingGuidance: string;
  let divergenceNote: string;

  if (score <= -15) {
    regime = 'Risk-Off';
    bpoHedgingGuidance =
      'Defensive Liquidity Stance: Mandate daily cash sweep to 100% CDI repo accounts; accelerate accounts receivable dunning to compress DSO (< 34 days); enforce pre-approval gates on discretionary accounts payable disbursements.';
    divergenceNote =
      'Divergence: USD appreciation & DI yield widening conflict with equity resilience, signaling defensive macro positioning across institutional desks.';
  } else if (score >= 15) {
    regime = 'Risk-On';
    bpoHedgingGuidance =
      'Capital Deployment Stance: Take advantage of early-payment vendor cash discounts (target annualized return > CDI + 2.5%); negotiate extended customer payment terms on high-margin contracts; evaluate working capital expansion.';
    divergenceNote =
      'Convergence: Equity buoyancy and easing currency spreads indicate favorable credit conditions and stable short-term operational liquidity.';
  } else {
    regime = 'Neutral / Transition';
    bpoHedgingGuidance =
      'Balanced Treasury Posture: Maintain standard 13-week rolling cash forecasts; cross-verify accounts receivable aging buckets; monitor DI future curve spreads weekly.';
    divergenceNote =
      'Equilibrium: Mixed signals between asset classes suggest market consolidation pending key fiscal and monetary policy decisions.';
  }

  return {
    regime,
    divergenceNote,
    primaryDrivers: drivers.slice(0, 3),
    bpoHedgingGuidance,
    sentimentScore: Math.max(-100, Math.min(100, score)),
  };
}

/**
 * Curated Live News & Geopolitics Wire feed
 */
export const DEFAULT_WIRE_ARTICLES: LiveWireArticle[] = [
  {
    id: 'wire-1',
    title: 'Gulf Energy Shippers Expand Convoys as War-Risk Insurance Premiums Rise 35%',
    source: 'Maritime & Energy Wire',
    timeAgo: '14m ago',
    url: 'https://www.reuters.com/business/energy/',
    category: 'Energy',
    summary: 'VLCC tanker operators add defensive transits through the Strait of Hormuz following heightened military alert in regional waters.',
  },
  {
    id: 'wire-2',
    title: 'US 10-Year Treasury Yield Holds at 4.48% Following Soft Auction Bid-to-Cover Ratio',
    source: 'Financial Times Global',
    timeAgo: '32m ago',
    url: 'https://www.bloomberg.com/markets',
    category: 'Markets',
    summary: 'Primary dealers absorb larger allocation as international central bank demand moderates amid expanding federal borrowing pace.',
  },
  {
    id: 'wire-3',
    title: 'European Industrial Council Warns of Accelerated Output Shift Due to Power Price Spreads',
    source: 'Brussels Economic Bureau',
    timeAgo: '1h ago',
    url: 'https://www.ft.com/europe-economy',
    category: 'Trade',
    summary: 'Chemical and base metals output across Germany and northern France drops 2.4% year-on-year, citing competitive electricity tariff disparities.',
  },
  {
    id: 'wire-4',
    title: 'Central Banks in Non-Aligned Nations Settle Over $4.2B in Bilateral Trade via Alternative Rails',
    source: 'Monetary Governance Wire',
    timeAgo: '2h ago',
    url: 'https://www.bis.org/',
    category: 'Geopolitics',
    summary: 'Distributed ledger pilot transactions for petroleum and grain bypass traditional correspondent clearing accounts.',
  },
  {
    id: 'wire-5',
    title: 'Advanced Packaging Bottlenecks Constrain Tier-1 AI Server Shipments Globally',
    source: 'Semiconductor Intelligence',
    timeAgo: '3h ago',
    url: 'https://www.reuters.com/technology/',
    category: 'Technology',
    summary: 'Lead times for high-bandwidth memory (HBM3e) substrates extend to 26 weeks as enterprise datacenter capex remains elevated.',
  },
];

/**
 * Default configuration options for the A4 Print and PDF Export Dossier
 */
export const DEFAULT_PRINT_EXPORT_OPTIONS: import('../types/index.ts').PrintExportOptions = {
  includeBriefing: true,
  includeTaskMatrix: true,
  includeSecondOrder: true,
  includeTelemetry: true,
  includeAuditSignoff: true,
  taskFilter: 'all',
  categoryFilter: 'all',
  documentTitle: 'Financial BPO Operations & Strategic Monograph Dossier',
  analystName: 'Senior Financial BPO Analyst',
  department: 'Treasury Operations & Corporate Accounting Controls',
  notes: 'Official executive intelligence and audit-ready operations status report. Formatted for standard A4 archival.',
};

/**
 * Generate a formal reference code for A4 audit dossier (e.g. BPO-SYN-2026-X892)
 */
export function generateDossierReferenceCode(dateStr?: string): string {
  const cleanDate = (dateStr || new Date().toISOString().split('T')[0]).replace(/[^0-9]/g, '');
  return `BPO-DOSSIER-${cleanDate.slice(0, 8) || '2026'}-${Math.floor(1000 + Math.random() * 9000)}`;
}

/**
 * Filter task matrix items specifically for A4 printing and PDF export
 */
export function filterTasksForPrint(
  tasks: import('../types/index.ts').TaskItem[],
  taskFilter: import('../types/index.ts').PrintExportOptions['taskFilter'],
  categoryFilter: string
): import('../types/index.ts').TaskItem[] {
  return tasks.filter(task => {
    // 1. Completion / Priority filter
    if (taskFilter === 'pending' && task.completed) return false;
    if (taskFilter === 'completed' && !task.completed) return false;
    if (taskFilter === 'high_priority' && task.priority !== 'high') return false;

    // 2. Category filter
    if (categoryFilter !== 'all') {
      const normTaskCat = normalizeTaskCategory(task.category);
      const normFilterCat = normalizeTaskCategory(categoryFilter);
      if (normTaskCat !== normFilterCat) return false;
    }

    return true;
  });
}

/**
 * Get readable category label
 */
export function getCategoryLabel(category: string): string {
  const norm = normalizeTaskCategory(category);
  const found = BPO_CATEGORIES.find(c => c.id === norm);
  return found ? found.label : category.replace(/_/g, ' ').toUpperCase();
}

