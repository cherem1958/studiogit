import React from 'react';
import type { WeatherData } from '../types/index.ts';
import {
  Sun,
  CloudSun,
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  RotateCw,
  Compass,
} from 'lucide-react';

interface WeatherDisplayCardProps {
  weather: WeatherData;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const WeatherDisplayCard: React.FC<WeatherDisplayCardProps> = ({
  weather,
  onRefresh,
  isRefreshing = false,
}) => {
  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('rain') || c.includes('drizzle') || c.includes('chuva')) {
      return <CloudRain className="w-8 h-8 text-sky-700" />;
    }
    if (c.includes('cloud') || c.includes('mist') || c.includes('overcast') || c.includes('nublado')) {
      return <CloudSun className="w-8 h-8 text-amber-700" />;
    }
    return <Sun className="w-8 h-8 text-amber-600" />;
  };

  return (
    <div className="bg-[#fcfbf9] border border-[#d8d3c7] rounded-xl p-5 shadow-sm text-[#1c1d21]">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#e5e0d5] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#8c3b2d]" />
          <span className="text-[11px] font-sans-ui uppercase tracking-wider font-semibold text-[#666055]">
            Observation Point • Southeast Brazil
          </span>
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#f4efe4] hover:bg-[#eae3d4] text-[11px] font-sans-ui text-[#4f483d] border border-[#d8d2c4] transition-colors disabled:opacity-60"
            title="Fetch latest meteorological telemetry for Belo Horizonte"
          >
            <RotateCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Updating...' : 'Sync Station'}</span>
          </button>
        )}
      </div>

      {/* Main Meteorological Reading (Display-Only) */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-5">
        <div>
          <h3 className="font-cm text-xl font-bold tracking-tight text-[#1c1d21]">
            {weather.city}
          </h3>
          <p className="font-cm text-sm text-[#5c5549] italic mt-0.5">
            {weather.condition}
          </p>
        </div>

        {/* Read-Only Temperature Callout */}
        <div className="flex items-baseline gap-2 bg-[#f6f2e9] border border-[#e2dcce] px-4 py-2.5 rounded-lg">
          <span className="font-cm text-4xl font-bold tracking-tight text-[#1c1d21]">
            {weather.temperature.toFixed(1)}°C
          </span>
          {weather.apparentTemperature !== undefined && (
            <span className="text-xs font-sans-ui text-[#6e675b] font-medium">
              Feels {weather.apparentTemperature.toFixed(1)}°C
            </span>
          )}
        </div>
      </div>

      {/* Key Meteorological Parameters (Strictly Read-Only Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        <div className="bg-[#f7f5ef] border border-[#e8e4d9] rounded p-2.5 flex items-center gap-2.5">
          <Thermometer className="w-4 h-4 text-[#8c3b2d] flex-shrink-0" />
          <div>
            <div className="text-[10px] font-sans-ui uppercase tracking-wider text-[#736c5f]">Daily Range</div>
            <div className="font-mono-data text-xs font-bold text-[#1c1d21]">
              {weather.minTemp ?? 18}° / {weather.maxTemp ?? 28}°C
            </div>
          </div>
        </div>

        <div className="bg-[#f7f5ef] border border-[#e8e4d9] rounded p-2.5 flex items-center gap-2.5">
          <Droplets className="w-4 h-4 text-sky-700 flex-shrink-0" />
          <div>
            <div className="text-[10px] font-sans-ui uppercase tracking-wider text-[#736c5f]">Humidity</div>
            <div className="font-mono-data text-xs font-bold text-[#1c1d21]">
              {weather.humidity}%
            </div>
          </div>
        </div>

        <div className="bg-[#f7f5ef] border border-[#e8e4d9] rounded p-2.5 flex items-center gap-2.5">
          <CloudRain className="w-4 h-4 text-indigo-700 flex-shrink-0" />
          <div>
            <div className="text-[10px] font-sans-ui uppercase tracking-wider text-[#736c5f]">Precipitation</div>
            <div className="font-mono-data text-xs font-bold text-[#1c1d21]">
              {weather.rainProbability}% chance
            </div>
          </div>
        </div>

        <div className="bg-[#f7f5ef] border border-[#e8e4d9] rounded p-2.5 flex items-center gap-2.5">
          <Wind className="w-4 h-4 text-emerald-800 flex-shrink-0" />
          <div>
            <div className="text-[10px] font-sans-ui uppercase tracking-wider text-[#736c5f]">Wind Speed</div>
            <div className="font-mono-data text-xs font-bold text-[#1c1d21]">
              {weather.windSpeed} km/h
            </div>
          </div>
        </div>
      </div>

      {/* Attribution & Telemetry Status */}
      <div className="mt-4 pt-3 border-t border-[#e8e3d8] flex flex-wrap items-center justify-between text-[11px] font-sans-ui text-[#7a7366]">
        <span>Telemetric source: {weather.source || 'Open-Meteo WMO Station'}</span>
        {weather.lastUpdated && <span>Station record: {weather.lastUpdated}</span>}
      </div>
    </div>
  );
};
