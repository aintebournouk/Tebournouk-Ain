import React, { useState } from "react";
import { Landmark, LANDMARKS, Language, TRANSLATIONS } from "../types";
import { MapPin, Info, ArrowUpRight, Compass, Sprout, Building, AlertTriangle } from "lucide-react";

interface InteractiveMapProps {
  lang: Language;
  mapCoords?: Record<string, string>;
}

export default function InteractiveMap({ lang, mapCoords }: InteractiveMapProps) {
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string>("ruin-1");

  const defaultCoords: Record<string, string> = {
    "ruin-1": "36.534167,10.456611",
    "nature-1": "36.531306,10.486583",
    "utility-1": "36.534167,10.456611",
    "utility-2": "36.534167,10.455667",
    "utility-3": "36.534472,10.456944"
  };

  const coords = mapCoords || defaultCoords;

  const getMapSrc = (id: string) => {
    const latLon = coords[id] || defaultCoords[id] || "36.5298,10.4632";
    if (id === "nature-1") {
      return `https://maps.google.com/maps?q=${latLon}&t=k&z=15&output=embed`;
    } else if (id === "ruin-1") {
      return `https://maps.google.com/maps?q=${latLon}&t=k&z=17&output=embed`;
    } else {
      return `https://maps.google.com/maps?q=${latLon}&t=m&z=17&output=embed`;
    }
  };

  const activeLandmark = LANDMARKS.find((l) => l.id === selectedLandmarkId) || LANDMARKS[0];
  const t = TRANSLATIONS[lang];

  // Map category icons
  const getCategoryIcon = (category: "ruin" | "utility" | "nature") => {
    switch (category) {
      case "ruin":
        return <Building className="w-4 h-4 text-amber-500" />;
      case "nature":
        return <Sprout className="w-4 h-4 text-emerald-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const currentLandmarkName = (l: Landmark) => {
    return lang === "ar" ? l.nameAr : lang === "fr" ? l.nameFr : l.nameEn;
  };

  const currentLandmarkStatus = (l: Landmark) => {
    return lang === "ar" ? l.statusAr : lang === "fr" ? l.statusFr : l.statusEn;
  };

  const currentLandmarkDesc = (l: Landmark) => {
    return lang === "ar" ? l.descriptionAr : lang === "fr" ? l.descriptionFr : l.descriptionEn;
  };

  return (
    <div id="interactive-map-section" className="bg-white border border-stone-200 rounded-3xl p-4 md:p-6 shadow-sm max-w-4xl mx-auto select-none">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-100 pb-4 mb-5 gap-2">
        <div className="text-right w-full sm:w-auto">
          <h3 className="text-sm font-black text-stone-900 flex items-center justify-end gap-1.5">
            <span>{t.mapTitle}</span>
            <Compass className="w-4 h-4 text-emerald-700 animate-spin-slow" />
          </h3>
          <p className="text-[10px] text-stone-500 mt-1 leading-normal">
            {t.mapSubtitle}
          </p>
        </div>
        <div className="font-mono text-[9px] text-stone-400 bg-stone-50 px-2.5 py-1 rounded-md border border-stone-100 w-full sm:w-auto text-center">
          GPS: 36.5684° N, 10.4578° E (9km to Grombalia)
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
               {/* Interactive Google Maps Card */}
        <div className="lg:col-span-7 bg-stone-100 rounded-2xl border border-stone-200 overflow-hidden h-72 sm:h-[340px] relative shadow-inner">
          <iframe
            title="Interactive Google Map for Ain Tebournok"
            src={getMapSrc(selectedLandmarkId)}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full"
          />

          {/* Symmetrical Google Maps Badge */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm border border-stone-200 px-2.5 py-1 rounded-xl text-[9px] font-bold text-stone-700 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>Google Maps Live</span>
          </div>

          <a 
            href={`https://www.google.com/maps?q=${coords[selectedLandmarkId] || defaultCoords[selectedLandmarkId]}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="absolute bottom-3 right-3 bg-stone-900/90 hover:bg-black text-amber-400 border border-stone-800 text-[9px] font-bold px-2.5 py-1 rounded-xl shadow-xs transition-all flex items-center gap-1"
          >
            <span>{lang === "ar" ? "افتح في خرائط Google" : "Open in Google Maps"}</span>
            <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>

        {/* Detailed side description viewport */}
        <div className="lg:col-span-5 bg-stone-50 rounded-2xl border border-stone-200/80 p-5 flex flex-col justify-between text-right">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-[10px] font-black uppercase text-stone-500 font-mono">
                {activeLandmark.category === "ruin" 
                  ? (lang === "ar" ? "معلم روماني بيزنطي" : "Site Antique") 
                  : activeLandmark.category === "nature"
                    ? (lang === "ar" ? "طبيعة خلابة وسياحة" : "Nature & Climat")
                    : (lang === "ar" ? "ممتلكات عامة معطلة" : "Service Public")}
              </span>
              <div className="p-1.5 bg-stone-200 rounded-lg">
                {getCategoryIcon(activeLandmark.category)}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-black text-stone-900 leading-snug">
                {currentLandmarkName(activeLandmark)}
              </h4>
              
              {/* Civic issue / Status warning box */}
              <div className={`mt-2.5 p-2 rounded-xl text-[10px] font-bold flex items-start gap-1 justify-end text-${activeLandmark.category === "utility" ? "red-800 bg-red-50 border border-red-100" : "amber-900 bg-amber-50/60 border border-amber-200/30"}`}>
                <span className="text-right leading-relaxed">{currentLandmarkStatus(activeLandmark)}</span>
                <Info className="w-3.5 h-3.5 mt-0.5 text-stone-600 shrink-0" />
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed pr-1 whitespace-pre-line text-center font-normal">
              {currentLandmarkDesc(activeLandmark)}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-200 space-y-3">
            <div className="text-[9px] text-stone-400 font-bold block">
              {t.mapLegendKey} :
            </div>
            
            {/* Quick quick buttons block for all landmarks */}
            <div className="flex flex-wrap gap-1.5 justify-end">
              {LANDMARKS.map((landmark) => (
                <button
                  id={`landmark-tab-btn-${landmark.id}`}
                  key={landmark.id}
                  onClick={() => setSelectedLandmarkId(landmark.id)}
                  className={`text-[10px] px-2.5 py-1.5 rounded-lg border font-bold transition-all ${
                    landmark.id === selectedLandmarkId
                      ? "bg-emerald-900 text-white border-emerald-950"
                      : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  {lang === "ar" 
                    ? landmark.nameAr.split(/(?:—|\(|:)/)[0].slice(0, 15) + "..." 
                    : landmark.nameFr.split(/(?:—|\(|:)/)[0].slice(0, 15) + "..."}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
