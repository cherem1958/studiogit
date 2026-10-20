import React, { useState, useEffect } from 'react';
import type { LiveWireArticle } from '../types/index.ts';
import { DEFAULT_WIRE_ARTICLES } from '../utils/curation.ts';
import {
  Radio,
  ExternalLink,
  RotateCw,
  Clock,
  Globe2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export const LiveNewsWire: React.FC = () => {
  const [articles, setArticles] = useState<LiveWireArticle[]>(DEFAULT_WIRE_ARTICLES);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');
  const [fetchStatus, setFetchStatus] = useState<'live' | 'fallback'>('live');

  const fetchLiveHeadlines = async () => {
    setIsLoading(true);
    try {
      // 1. Attempt primary backend proxy / cached live wire endpoint
      const res = await fetch('/api/news-wire');
      if (res.ok) {
        const json = await res.json();
        if (json.articles && Array.isArray(json.articles) && json.articles.length > 0) {
          setArticles(json.articles);
          setFetchStatus('live');
          setLastRefreshed(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
          setIsLoading(false);
          return;
        }
      }

      // 2. Client-side fetch fallback to public news API (e.g., Spaceflight / World Tech & Geopolitics API)
      const publicRes = await fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=5');
      if (publicRes.ok) {
        const data = await publicRes.json();
        if (data.results && Array.isArray(data.results)) {
          const mapped: LiveWireArticle[] = data.results.map((item: any, idx: number) => ({
            id: `pub-${item.id || idx}`,
            title: item.title,
            source: item.news_site || 'Global Science & Defense Wire',
            timeAgo: 'Recent',
            url: item.url,
            category: 'Technology',
            summary: item.summary ? item.summary.slice(0, 140) + '...' : undefined,
          }));
          setArticles(mapped);
          setFetchStatus('live');
          setLastRefreshed(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
          setIsLoading(false);
          return;
        }
      }

      // Fallback
      setArticles(DEFAULT_WIRE_ARTICLES);
      setFetchStatus('fallback');
      setLastRefreshed(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.warn('Live wire fetch error, using curated intelligence fallback:', err);
      setArticles(DEFAULT_WIRE_ARTICLES);
      setFetchStatus('fallback');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveHeadlines();
  }, []);

  return (
    <div className="bg-[#fcfbf9] border border-[#d8d3c7] rounded-xl p-5 shadow-sm text-[#1c1d21]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#e5e0d5] pb-3 mb-4 gap-2">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#8c3b2d] animate-pulse" />
          <h3 className="font-cm text-base font-bold text-[#1c1d21]">
            Live News & Geopolitics Wire
          </h3>
          <span className="text-[10px] font-sans-ui uppercase tracking-wider px-2 py-0.5 rounded bg-[#ebd7c8] text-[#8c3b2d] font-bold">
            Real-Time Feed
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-sans-ui text-[#736c5f]">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#8a8376]" />
            <span>Updated: {lastRefreshed}</span>
          </span>

          <button
            type="button"
            onClick={fetchLiveHeadlines}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#f4efe4] hover:bg-[#eae3d4] text-[11px] text-[#4f483d] border border-[#d8d2c4] transition-colors disabled:opacity-60 cursor-pointer"
            title="Poll fresh news wire headlines"
          >
            <RotateCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Polling...' : 'Refresh Wire'}</span>
          </button>
        </div>
      </div>

      {/* Wire List - Designed for Quick Scanning */}
      <div className="divide-y divide-[#ece7db]">
        {articles.map((item, idx) => (
          <div
            key={item.id || idx}
            className="py-3 first:pt-0 last:pb-0 hover:bg-[#faf8f3] rounded px-2 transition-colors flex flex-col sm:flex-row sm:items-baseline justify-between gap-2"
          >
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-sans-ui uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-[#eee8dc] text-[#5c5445]">
                  {item.category}
                </span>
                <span className="text-[11px] font-sans-ui text-[#787163]">
                  {item.source}
                </span>
                <span className="text-[10px] font-mono-data text-[#999285]">
                  • {item.timeAgo}
                </span>
              </div>

              <h4 className="font-cm font-bold text-sm text-[#1c1d21] leading-snug">
                {item.title}
              </h4>

              {item.summary && (
                <p className="font-cm text-xs text-[#524b3e] mt-1 leading-relaxed">
                  {item.summary}
                </p>
              )}
            </div>

            <div className="flex-shrink-0 self-start sm:self-center">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-sans-ui font-medium text-[#8c3b2d] hover:text-[#783226] border border-[#e2dcce] bg-[#fdfcf9] hover:bg-[#f6f2e8] px-2.5 py-1 rounded transition-colors"
                title={`Open original report at ${item.source}`}
              >
                <span>Read Source</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Status */}
      <div className="mt-4 pt-2.5 border-t border-[#e8e3d8] flex items-center justify-between text-[11px] font-sans-ui text-[#7a7366]">
        <span>Strictly read-only intelligence stream</span>
        <span>{fetchStatus === 'live' ? 'Synchronized with Live Feeds' : 'Curated Intelligence Active'}</span>
      </div>
    </div>
  );
};
