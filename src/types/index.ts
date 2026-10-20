export interface WeatherData {
  city: string;
  temperature: number; // e.g. 22.4
  condition: string; // e.g. "Clear sky with dry morning mist"
  humidity: number; // e.g. 62%
  apparentTemperature?: number; // e.g. 23.0
  rainProbability: number; // e.g. 10%
  windSpeed: number; // e.g. 12 km/h
  minTemp?: number;
  maxTemp?: number;
  dateStr?: string;
  source?: string;
  lastUpdated?: string;
}

export interface MarketIndicator {
  id: string;
  name: string;
  category: 'currency' | 'index' | 'commodities' | 'rates' | 'crypto';
  value: string;
  change: string;
  changeType: 'up' | 'down' | 'neutral';
  highlight?: boolean;
}

export interface InternationalNewsItem {
  id: string;
  region: 'Middle East' | 'Asia-Pacific' | 'North America' | 'Europe' | 'Latin America & Africa' | 'Global / Multilateral';
  title: string;
  summary: string;
  systemicImpact: string;
  category: 'energy' | 'geopolitics' | 'currency' | 'technology' | 'trade';
  selected?: boolean;
}

export interface DailyDataInput {
  date: string;
  weather: WeatherData;
  indicators: MarketIndicator[];
  news: string;
  internationalNews?: InternationalNewsItem[];
  philosophicalPreference?: string;
}

export interface ParsedBriefing {
  rawMarkdown: string;
  weatherSection: string;
  radarSection: string;
  philosophySection: string;
  quoteSection: string;
  ignitionSection: string;
  quoteAuthor?: string;
  quoteText?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  date: string;
  dataInput: DailyDataInput;
  briefing: ParsedBriefing;
  philosophicalFocus?: string;
}

export interface PhilosophicalTradition {
  id: string;
  name: string;
  school: string;
  period: 'Classical Greco-Roman' | 'Patristic & Medieval' | 'Scholastic & Renaissance' | 'Modern & Contemporary';
  keyFigures: string[];
  coreConcepts: string[];
  sampleQuotes: { text: string; author: string }[];
  strategicRelevance: string;
}

export interface StrategicNode {
  id: string;
  name: string;
  lat: number;
  lon: number;
  category: 'chokepoint' | 'finance' | 'resource' | 'origin';
  impactDescription: string;
  region: string;
}

/**
 * Six core Financial BPO operational and analytical workflow categories
 */
export type BpoTaskCategory =
  | 'bank_reconciliation'
  | 'future_entries'
  | 'optimization_analysis'
  | 'report_review'
  | 'compliance_audit'
  | 'urgent_settlement'
  // Backward compatibility aliases
  | 'reconciliation'
  | 'reporting'
  | 'compliance'
  | 'urgent'
  | 'strategic'
  | 'tactical'
  | 'intel'
  | 'review';

export interface BpoCategoryMeta {
  id: BpoTaskCategory;
  label: string;
  shortLabel: string;
  description: string;
  colorBorder: string;
  colorBg: string;
  colorText: string;
  badgeClass: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  entityOrAccount?: string;
  completed: boolean;
  createdAt: number;
  category: BpoTaskCategory;
  priority?: 'high' | 'medium' | 'normal';
  dueTime?: string;
}

export interface BpoRoutineTemplate {
  id: string;
  name: string;
  description: string;
  estimatedMinutes: number;
  tasks: Array<{
    title: string;
    description?: string;
    entityOrAccount?: string;
    category: BpoTaskCategory;
    priority: 'high' | 'medium' | 'normal';
    dueTime?: string;
  }>;
}

export interface LiveWireArticle {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  url: string;
  category: 'Geopolitics' | 'Markets' | 'Energy' | 'Technology' | 'Trade';
  summary?: string;
}

export interface SecondOrderCausality {
  id: string;
  triggerTitle: string;
  category: 'fx' | 'rates' | 'fiscal' | 'energy';
  tier1Trigger: {
    headline: string;
    metric: string;
    mechanism: string;
  };
  tier2Transmission: {
    headline: string;
    channel: string;
    friction: string;
  };
  tier3BpoImplication: {
    headline: string;
    operationalAction: string;
    kpiImpact: string;
  };
}

export interface MarketRegimeState {
  regime: 'Risk-On' | 'Risk-Off' | 'Neutral / Transition';
  divergenceNote: string;
  primaryDrivers: string[];
  bpoHedgingGuidance: string;
  sentimentScore: number; // -100 to +100
}

export interface GroundingSourceWeb {
  uri: string;
  title: string;
}

export interface GroundingPlaceMap {
  title: string;
  uri: string;
  address?: string;
  rating?: number;
}

export interface GroundingSearchResponse {
  success: boolean;
  text: string;
  sources: GroundingSourceWeb[];
  searchQueries?: string[];
  timestamp: string;
  fallback?: boolean;
}

export interface GroundingMapsResponse {
  success: boolean;
  text: string;
  places: GroundingPlaceMap[];
  timestamp: string;
  fallback?: boolean;
}

export interface PrintExportOptions {
  includeBriefing: boolean;
  includeTaskMatrix: boolean;
  includeSecondOrder: boolean;
  includeTelemetry: boolean;
  includeAuditSignoff: boolean;
  taskFilter: 'all' | 'pending' | 'completed' | 'high_priority';
  categoryFilter: string;
  documentTitle: string;
  analystName: string;
  department: string;
  notes: string;
}
