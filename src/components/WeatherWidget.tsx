import React, { useState, useEffect } from "react";
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  Wind, 
  Droplets, 
  Thermometer, 
  Compass, 
  RotateCw,
  Calendar,
  AlertTriangle,
  Flame
} from "lucide-react";
import { Language } from "../types";

interface WeatherData {
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    weatherCode: number;
    windSpeed: number;
    precipitation: number;
  };
  daily: Array<{
    date: string;
    weatherCode: number;
    tempMax: number;
    tempMin: number;
    uvMax: number;
  }>;
}

interface WeatherWidgetProps {
  lang: Language;
  isDarkMode: boolean;
}

const getWeatherDetails = (code: number, lang: Language) => {
  // WMO weather code translation
  switch (code) {
    case 0:
      return {
        text: lang === "ar" ? "صافِ تماماً" : lang === "fr" ? "Ciel dégagé" : "Clear Sky",
        icon: <Sun className="w-10 h-10 text-amber-400 animate-spin-slow" />
      };
    case 1:
    case 2:
    case 3:
      return {
        text: lang === "ar" ? "غائم جزئياً" : lang === "fr" ? "Partiellement nuageux" : "Partly Cloudy",
        icon: <Cloud className="w-10 h-10 text-stone-400" />
      };
    case 45:
    case 48:
      return {
        text: lang === "ar" ? "ضباب كثيف" : lang === "fr" ? "Brouillard" : "Foggy",
        icon: <Cloud className="w-10 h-10 text-stone-300" />
      };
    case 51:
    case 53:
    case 55:
    case 61:
    case 63:
    case 65:
      return {
        text: lang === "ar" ? "مطر متساقط" : lang === "fr" ? "Pluie" : "Rainy",
        icon: <CloudRain className="w-10 h-10 text-blue-400" />
      };
    case 71:
    case 73:
    case 75:
      return {
        text: lang === "ar" ? "تساقط ثلوج" : lang === "fr" ? "Neige" : "Snowy",
        icon: <CloudSnow className="w-10 h-10 text-sky-200" />
      };
    case 80:
    case 81:
    case 82:
      return {
        text: lang === "ar" ? "زخات مطر" : lang === "fr" ? "Averses de pluie" : "Rain Showers",
        icon: <CloudRain className="w-10 h-10 text-blue-500 animate-bounce" />
      };
    case 95:
    case 96:
    case 99:
      return {
        text: lang === "ar" ? "عاصفة رعدية" : lang === "fr" ? "Orageux" : "Thunderstorm",
        icon: <CloudLightning className="w-10 h-10 text-amber-500" />
      };
    default:
      return {
        text: lang === "ar" ? "معتدل" : lang === "fr" ? "Clair" : "Mild",
        icon: <Sun className="w-10 h-10 text-amber-400" />
      };
  }
};

export default function WeatherWidget({ lang, isDarkMode }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      // Ain Tebournok Coordinates (approx Lat: 36.60, Lon: 10.50 near Grombalia)
      const url = `https://api.open-meteo.com/v1/forecast?latitude=36.60&longitude=10.50&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=Africa/Tunis`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Weather request failed");
      
      const data = await res.json();
      
      if (data && data.current && data.daily) {
        setWeather({
          current: {
            temp: data.current.temperature_2m,
            feelsLike: data.current.apparent_temperature,
            humidity: data.current.relative_humidity_2m,
            weatherCode: data.current.weather_code,
            windSpeed: data.current.wind_speed_10m,
            precipitation: data.current.precipitation
          },
          daily: data.daily.time.slice(0, 3).map((dayTime: string, idx: number) => ({
            date: dayTime,
            weatherCode: data.daily.weather_code[idx],
            tempMax: data.daily.temperature_2m_max[idx],
            tempMin: data.daily.temperature_2m_min[idx],
            uvMax: data.daily.uv_index_max[idx]
          }))
        });
      } else {
        throw new Error("Invalid weather payload");
      }
    } catch (err: any) {
      console.error(err);
      setError(lang === "ar" ? "تعذر جلب حالة الطقس حالياً" : lang === "fr" ? "Impossible de charger la météo" : "Unable to retrieve weather");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const getUvRecommendation = (uv: number, l: Language) => {
    if (uv <= 2) {
      return {
        label: l === "ar" ? "منخفض" : l === "fr" ? "Faible" : "Low",
        color: "text-emerald-500",
        desc: l === "ar" ? "آمن تماماً للسير والمغامرة" : "Safe for long hikes"
      };
    } else if (uv <= 5) {
      return {
        label: l === "ar" ? "متوسط" : l === "fr" ? "Modéré" : "Moderate",
        color: "text-amber-500",
        desc: l === "ar" ? "ارتدِ قبعة ونظارة شمسية" : "Sun protection recommended"
      };
    } else {
      return {
        label: l === "ar" ? "مرتفع جداً" : l === "fr" ? "Trés élevé" : "Very High",
        color: "text-rose-500 font-bold",
        desc: l === "ar" ? "احذر ضربات الشمس واستظل في الغابة بانتظام" : "Avoid direct sun exposures, seek shade"
      };
    }
  };

  const getWindAdvice = (speed: number, l: Language) => {
    if (speed > 25) {
      return l === "ar" 
        ? "💨 رياح قوية! نوصي بالحذر في أعالي المرتفعات الجبلية." 
        : l === "fr" 
        ? "💨 Vents forts! Prudence sur les sommets." 
        : "💨 High winds! Stay cautious near ridges.";
    }
    return l === "ar" 
      ? "🍃 رياح معتدلة ولطيفة؛ مثالية لممارسة المشي الجبلي." 
      : l === "fr" 
      ? "🍃 Vents calmes ; idéal pour la randonnée." 
      : "🍃 Calms winds; perfect conditions for hiking.";
  };

  const getDayName = (dateStr: string) => {
    const d = new Date(dateStr);
    const locale = lang === "ar" ? "ar-TN" : lang === "fr" ? "fr-FR" : "en-US";
    return d.toLocaleDateString(locale, { weekday: 'short', month: 'numeric', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center min-h-[180px] transition-all ${
        isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-stone-50 border-stone-200"
      }`}>
        <RotateCw className="w-6 h-6 text-emerald-700 animate-spin mb-2" />
        <span className="text-[11px] font-bold font-sans text-stone-500">
          {lang === "ar" ? "جاري جلب الطقس المباشر لعين طبرنق..." : lang === "fr" ? "Chargement de la météo..." : "Refreshing live mountain weather..."}
        </span>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className={`p-5 rounded-2xl border text-center transition-all ${
        isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-red-50/50 border-red-100 text-stone-900"
      }`}>
        <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
        <p className="text-[11px] font-sans font-bold text-stone-600 mb-2">{error || "Technical error"}</p>
        <button
          onClick={fetchWeather}
          className="px-3.5 py-1.5 bg-zinc-805 hover:bg-zinc-900 hover:text-white rounded-lg border text-[10px] uppercase font-black transition-all inline-flex items-center gap-1 cursor-pointer"
        >
          <RotateCw className="w-3 h-3" />
          <span>{lang === "ar" ? "إعادة المحاولة" : lang === "fr" ? "Réessayer" : "Retry"}</span>
        </button>
      </div>
    );
  }

  const { text, icon } = getWeatherDetails(weather.current.weatherCode, lang);
  const uvInfo = getUvRecommendation(weather.daily[0]?.uvMax || 1, lang);

  return (
    <div className={`p-5 sm:p-6 rounded-2xl border transition-all shadow-xs duration-350 ${
      isDarkMode 
        ? "bg-zinc-900 border-zinc-800 text-zinc-100" 
        : "bg-gradient-to-br from-emerald-50/20 to-stone-50 border-stone-250 text-stone-900"
    }`}>
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-center pb-3 border-b border-stone-200/60 dark:border-zinc-850 gap-2 mb-4">
        <div className="flex items-center gap-2 text-right">
          <Compass className="w-5 h-5 text-emerald-800 shrink-0" />
          <div>
            <h4 className="text-xs sm:text-xs font-black tracking-tight flex items-center justify-end gap-1">
              <span>{lang === "ar" ? "الطقس المباشر للمرتفعات الجبلية بسير سياحي" : "Live Weather for Mountain Ecotourism"}</span>
            </h4>
            <span className="text-[9px] text-stone-500 font-bold block -mt-0.5">
              {lang === "ar" ? "عين طبرنق / قرنبالية، تونس" : "Ain Tebournok / Grombalia, Tunisia"}
            </span>
          </div>
        </div>
        
        <button
          onClick={fetchWeather}
          title={lang === "ar" ? "تحديث الآن" : "Update weather data"}
          className={`p-1.5 rounded-lg border transition-all ${
            isDarkMode 
              ? "bg-zinc-800 hover:bg-zinc-750 border-zinc-700 text-zinc-300" 
              : "bg-white hover:bg-stone-100 border-stone-200 text-stone-600"
          }`}
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-right font-sans" dir={lang === "ar" ? "rtl" : "ltr"}>
        
        {/* Left or Right column depending on language direction: Current Status Card */}
        <div className={`p-4 rounded-xl border md:col-span-4 flex flex-col items-center justify-center text-center ${
          isDarkMode ? "bg-zinc-950/40 border-zinc-805" : "bg-white border-stone-150"
        }`}>
          <div className="mb-2">{icon}</div>
          <span className="text-2xl font-black font-mono tracking-tight text-emerald-990 dark:text-emerald-400">
            {Math.round(weather.current.temp)}°C
          </span>
          <span className="text-[11px] font-black tracking-wider block mt-0.5 text-stone-700 dark:text-zinc-250">
            {text}
          </span>
          <span className="text-[9px] text-stone-400 font-bold block mt-0.5">
            {lang === "ar" ? `المحسوسة: ${Math.round(weather.current.feelsLike)}°C` : `Feels like: ${Math.round(weather.current.feelsLike)}°C`}
          </span>
        </div>

        {/* Middle column: Weather details list */}
        <div className="md:col-span-4 flex flex-col justify-between space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Humidity */}
            <div className={`p-2.5 rounded-lg border text-center ${
              isDarkMode ? "bg-zinc-955/30 border-zinc-805" : "bg-stone-50/50 border-stone-150"
            }`}>
              <div className="flex items-center justify-center gap-1 mb-0.5 text-blue-500">
                <Droplets className="w-3.5 h-3.5" />
                <span className="text-[9px] font-bold text-stone-500">{lang === "ar" ? "الرطوبة" : "Humidity"}</span>
              </div>
              <span className="font-mono font-black text-[11px] text-stone-800 dark:text-zinc-200">{weather.current.humidity}%</span>
            </div>

            {/* UV Index */}
            <div className={`p-2.5 rounded-lg border text-center ${
              isDarkMode ? "bg-zinc-955/30 border-zinc-805" : "bg-stone-50/50 border-stone-150"
            }`}>
              <div className="flex items-center justify-center gap-1 mb-0.5 text-amber-500">
                <Flame className="w-3.5 h-3.5" />
                <span className="text-[9px] font-bold text-stone-500">{lang === "ar" ? "الأشعة فوق البنفسجية" : "UV Index"}</span>
              </div>
              <span className={`font-mono font-black text-[11px] ${uvInfo.color}`}>{weather.daily[0]?.uvMax || 1} ({uvInfo.label})</span>
            </div>
          </div>

          {/* Guidelines on Winds for active hikers */}
          <div className={`p-2.5 rounded-xl border text-[10px] leading-relaxed font-bold font-sans ${
            isDarkMode 
              ? "bg-zinc-950/20 border-zinc-850 text-zinc-400" 
              : "bg-emerald-50/20 border-emerald-100 text-stone-750"
          }`}>
            <div className="flex items-center gap-1.5 justify-end mb-1 text-emerald-900">
              <Wind className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[9px] font-extrabold uppercase">{lang === "ar" ? "سرعة الرياح في المسار" : "Trail Wind Assessment"}</span>
            </div>
            <p className="text-[9px] text-stone-600 dark:text-zinc-400 block mb-0.5 font-mono">
              {lang === "ar" ? `السرعة الحالية: ${weather.current.windSpeed} كم/س` : `Current Speed: ${weather.current.windSpeed} km/h`}
            </p>
            <p className="font-sans text-[10px] text-stone-500 leading-tight">
              {getWindAdvice(weather.current.windSpeed, lang)}
            </p>
          </div>
        </div>

        {/* Right column: 3-Day Forecast */}
        <div className="md:col-span-4 flex flex-col justify-between">
          <div className="text-[9px] uppercase font-black text-stone-500 tracking-wider mb-2 border-b pb-1">
            📅 {lang === "ar" ? "توقعات الأيام الثلاثة القادمة" : "3-Day Local Forecast"}
          </div>

          <div className="space-y-2">
            {weather.daily.map((day, dIdx) => {
              const dayIcon = getWeatherDetails(day.weatherCode, lang).icon;
              return (
                <div key={day.date} className={`flex items-center justify-between p-2 rounded-lg border text-[10px] ${
                  dIdx === 0 
                    ? isDarkMode ? "bg-emerald-950/20 border-emerald-800" : "bg-emerald-50/50 border-emerald-100" 
                    : isDarkMode ? "bg-zinc-950/20 border-zinc-805" : "bg-white border-stone-150"
                }`}>
                  <div className="flex items-center gap-1.5">
                    <span className="scale-60 origin-center -mx-1">{dayIcon}</span>
                    <span className="font-bold text-stone-500">
                      {dIdx === 0 ? (lang === "ar" ? "اليوم" : "Today") : getDayName(day.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono font-bold">
                    <span className="text-stone-400">{Math.round(day.tempMin)}°</span>
                    <span className="text-stone-300">|</span>
                    <span className="text-emerald-800 font-extrabold">{Math.round(day.tempMax)}°C</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hiking safety warning */}
          <div className="text-[8.5px] text-stone-400 font-bold block mt-2 leading-tight">
            ⚠ {lang === "ar" 
              ? `إرشادات جبلية: ${uvInfo.desc}` 
              : `Mountain safety: ${uvInfo.desc}`}
          </div>
        </div>

      </div>
    </div>
  );
}
