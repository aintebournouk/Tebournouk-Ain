import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Compass, 
  BookOpen, 
  Sprout, 
  Calendar, 
  MapPin, 
  MessageSquare, 
  Radio as RadioIcon, 
  Mail, 
  Inbox,
  Bell,
  Heart, 
  ChevronRight, 
  Languages, 
  ChevronLeft, 
  CheckCircle2, 
  Info, 
  Sparkles, 
  AlertCircle,
  Clock,
  ArrowRight,
  Lock,
  Unlock,
  Trash2,
  UploadCloud,
  Plus,
  Send,
  Sun,
  Moon,
  Eye,
  Gift,
  Video,
  Share2,
  Link,
  Smartphone,
  Download,
  Laptop,
  Cloud,
  ExternalLink,
  Menu,
  X
} from "lucide-react";

import { Language, TRANSLATIONS, Landmark, LANDMARKS, GALLERY_PHOTOS } from "./types";
import InteractiveMap from "./components/InteractiveMap";
import WeatherWidget from "./components/WeatherWidget";
import { db } from "./lib/firebase";
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc, setDoc } from "firebase/firestore";

// Custom Sleek Share Widget
const ShareButtons = ({ 
  title, 
  text, 
  url, 
  lang 
}: { 
  title: string; 
  text: string; 
  url?: string; 
  lang: string; 
}) => {
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const shareUrl = url || window.location.href;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareFacebook = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + '\n' + text + '\n' + shareUrl)}`, '_blank');
  };

  const shareTwitter = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  return (
    <div className="relative inline-block text-right" ref={dropdownRef} dir="rtl">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowOptions(!showOptions);
        }}
        className="flex items-center gap-1 bg-black/60 hover:bg-emerald-800/90 backdrop-blur-md text-white text-[9px] font-black px-2 py-1 rounded-lg transition-all"
        title={lang === "ar" ? "نشر ومشاركة" : "Share"}
      >
        <Share2 className="w-3 h-3 text-white" />
        <span>{lang === "ar" ? "نشر" : "Share"}</span>
      </button>

      {showOptions && (
        <div 
          className="absolute right-0 mt-1.5 w-32 bg-white dark:bg-zinc-900 border border-stone-250 dark:border-zinc-800 rounded-xl shadow-lg py-1 z-30 flex flex-col font-sans animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={shareFacebook}
            className="flex items-center gap-2 px-2.5 py-1 text-[9px] text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-850 text-right font-bold transition-all"
          >
            <span className="w-3.5 h-3.5 bg-[#1877F2] text-white rounded-full flex items-center justify-center font-serif text-[9px] font-black">f</span>
            <span>{lang === "ar" ? "فيسبوك" : "Facebook"}</span>
          </button>
          
          <button
            onClick={shareWhatsApp}
            className="flex items-center gap-2 px-2.5 py-1 text-[9px] text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-850 text-right font-bold transition-all"
          >
            <span className="w-3.5 h-3.5 bg-[#25D366] text-white rounded-full flex items-center justify-center text-[8px] font-bold">W</span>
            <span>{lang === "ar" ? "واتساب" : "WhatsApp"}</span>
          </button>

          <button
            onClick={shareTwitter}
            className="flex items-center gap-2 px-2.5 py-1 text-[9px] text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-850 text-right font-bold transition-all"
          >
            <span className="w-3.5 h-3.5 bg-black text-white rounded-full flex items-center justify-center text-[7px] font-black">𝕏</span>
            <span>{lang === "ar" ? "تويتر" : "Twitter"}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-2.5 py-1 text-[9px] text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-right font-bold transition-all border-t border-stone-100 dark:border-zinc-850 mt-1"
          >
            <Link className="w-2.5 h-2.5" />
            <span>{copied ? (lang === "ar" ? "✓ تم النسخ" : "✓ Copied") : (lang === "ar" ? "نسخ الرابط" : "Copy Link")}</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Default Preset Village Discussion Board Messages ( مجلس القرية )
const DEFAULT_COUNCIL_MESSAGES: any[] = [];

// Default Preset Ancestors/Departed Loved Ones ( كانوا معنا ورحلوا )
const DEFAULT_PASSED_LOVED_ONES: any[] = [
  {
    id: "passed-1",
    name: "العم الهادي بن فرج (أبو الطيب) رحمه الله",
    dates: "1942 - 2021",
    relation: "من كبار شيوخ ومزارعي القرية البررة",
    bio: "عاش طيلة حياته محباً لتراب عين طبرنق، وساهم في خدمة مجتمعنا الفلاحي بعرقه وتواضعه ودعمه الدائم لشباب القرية الأوفياء. ربي يرحمه وينعمه ويرزقه جنة الفردوس.",
    imageUrl: "/images/regenerated_image_1782205001341.png",
    likes: 38,
    comments: [
      {
        id: "passed-c-1",
        author: "عبد المطلب النفزي",
        text: "رحمه الله وغفر له، كان نعم الرجل والمربي والقدوة الحسنة لكل شباب البلدة.",
        date: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ]
  }
];

// Default Preset Village Joy Celebrations ( قسم أفراحنا )
const DEFAULT_JOYS: any[] = [
  {
    id: "joy-1",
    title: "أفراح وعقد قران آل الماجري بالقرية 🌸",
    author: "الطيب الماجري",
    description: "وسط أجواء من الغبطة والسرور وبالعادات التقليدية لبلدتنا العزيزة عين طبرنق، احتفلنا بعقد قران ابننا البار. شكراً لكل من شاركنا هذه اللحظات السعيدة ودامت ديارنا عامرة بالأفراح والمسرات والزغاريد.",
    mediaUrl: "", 
    mediaType: "image",
    likes: 12,
    comments: [
      {
        id: "c-1",
        author: "الهادي بن فرج",
        text: "ألف مبروك للعروسين بالرفاه والبنين، دامت دياركم عامرة بالمسرات والبهجة!",
        date: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: "c-2",
        author: "آمنة النفزي",
        text: "ما شاء الله، ربي يهنيكم ويسعدكم ويرزقكم الذرية الصالحة يا رب.",
        date: new Date(Date.now() - 86400000 * 1).toISOString()
      }
    ],
    date: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: "joy-2",
    title: "مهرجان الفروسية التقليدي وألعاب الحصان العربي بجبل الهباليل 🐎",
    author: "جمعية المحافظة على التراث بعين طبرنق",
    description: "لقطات رائعة تجسد الموروث التقليدي الأصیل لقرية عين طبرنق في ترويض الخيول العربية الأصيلة وفنون الفروسية البدوية بحضور شيوخ وشباب القرية والزوار الكرام من قرمبالية والوطن القبلي.",
    mediaUrl: "",
    mediaType: "image",
    likes: 19,
    comments: [
      {
        id: "c-3",
        author: "فتحي بن صالح",
        text: "موروث عظيم وجميل جداً يجب الحفاظ عليه وتعليمه للأجيال القادمة لتظل القرية شامخة.",
        date: new Date(Date.now() - 86400000 * 4).toISOString()
      }
    ],
    date: new Date(Date.now() - 86400000 * 7).toISOString()
  }
];

// Default Preset Village News ( قسم الأخبار بالتفصيل )
const DEFAULT_NEWS: any[] = [
  {
    id: "news-1",
    titleAr: "📢 انطلاق تعبيد وإصلاح المسلك الفلاحي الرابط بين عين طبرنق والمدينة",
    titleFr: "📢 Début des travaux de goudronnage de la piste reliant le village",
    titleEn: "📢 Start of paving works for the agricultural path linking the village",
    contentAr: "بدأت بفضل الله وجهود أهالينا الكرام ومتابعة المشرفين أشغال إعادة تهيئة الطريق والمسالك الفلاحية لفك العزلة وتيسير حركة المرور خاصة في فصل الشتاء لأبنائنا التلاميذ والفلاحين الأوفياء من قرية عين طبرنق إلى مدينة قرمبالية.",
    contentFr: "Grâce aux efforts conjoints de nos citoyens et de nos partenaires de la société civile, les engins ont commencé à paver le chemin agricole reliant le village, ce qui facilitera l'accès hivernal aux écoliers et agriculteurs.",
    contentEn: "Thanks to the efforts of our local collective, infrastructure machines started paving the historic dirt road linking our village to the nearby national road, easing access for pupils and farmers.",
    imageUrl: "",
    date: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: "news-2",
    titleAr: "💧 تقدم ملحوظ في حماية عيون الماء الرومانية الأثرية بالبلدة",
    titleFr: "💧 Progrès dans la protection des sources d'eau romaines d'Ain Tebournok",
    titleEn: "💧 Solid progress in preserving our Roman freshwater springs in Tebournok",
    contentAr: "في إطار مبادرة تطوعية مشتركة، قام شباب القرية اليوم بتنظيف محيط عيون الماء الأثرية وحمايتها من التلوث بهدف المحافظة على هذا الإرث المائي النادر الذي تتميز به قرية عين طبرنق تاريخياً.",
    contentFr: "Une initiative citoyenne menée par la jeunesse d'Ain Tebournok a permis de nettoyer et de sécuriser le périmètre de nos sources d'eau antiques romaines pour éviter toute pollution.",
    contentEn: "A beautiful youth volunteering initiative succeeded in clearing and protecting the surrounding ancient Roman mountain springs, preserving our historic freshwater legacy.",
    imageUrl: "",
    date: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

interface Announcement {
  id: string;
  textAr: string;
  textFr: string;
  textEn: string;
  date: string;
}

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "welcome-1",
    textAr: "🌿 مرحباً بكم في فضاء عين طبرنق الشامخ؛ ملتقى عبق التاريخ وعزم الأجيال لصناعة غد أجمل لبلدتنا المباركة الأبية. 🌟",
    textFr: "🌿 Bienvenue sur la plateforme d'Ain Tebournok ; les brises de nos montagnes majestueuses et les parfums du patrimoine carthaginois et romain saluent vos cœurs. Ensemble, faisons revivre la mémoire de nos ancêtres pour un avenir prospère. 🌟",
    textEn: "🌿 Welcome to the Ain Tebournok platform; the fresh breezes of our majestic mountains and the fragrance of Carthaginian & Roman history greet your hearts. Together, we revive our heritage for a brighter tomorrow. 🌟",
    date: new Date().toISOString()
  },
  {
    id: "welcome-2",
    textAr: "🌿 انطلاق امتحانات الدخول إلى المعاهد النموذجية؛ تمنياتنا بالتوفيق والنجاح لأبناء وبنات قريتنا الأوفياء. 🌟",
    textFr: "🌿 Lancement des examens d'entrée aux collèges pilotes ; tous nos vœux de réussite pour les enfants de notre village. 🌟",
    textEn: "🌿 Launch of pilot middle schools entrance exams; wishing success to all children of our beloved village. 🌟",
    date: new Date().toISOString()
  }
];

// Default preset village gallery photos
const DEFAULT_PHOTOS = [
  {
    id: "photo-1",
    titleAr: "🏛️ القوس الروماني الأثري الشامخ بعين طبرنق",
    titleFr: "🏛️ L'Arc Romain Antique d'Ain Tebournok",
    titleEn: "🏛️ The Ancient Roman Arch of Ain Tebournok",
    descriptionAr: "شاهد أثري عظيم يعبر عن عمق التاريخ الروماني والحضارات المتعاقبة التي مرت من بلدتنا الجميلة.",
    descriptionFr: "Un vestige historique majestueux témoignant de l'époque romaine et des civilisations passées.",
    descriptionEn: "A majestic archaeological trace showcasing the deep Roman history of our beautiful village.",
    imageUrl: "/images/tebournok_roman_arch_1781799144664.jpg",
    category: "heritage",
    likes: 24,
    date: new Date(Date.now() - 86400000 * 10).toISOString()
  },
  {
    id: "photo-2",
    titleAr: "💧 مجرى السد الجبلي بعين طبرنق",
    titleFr: "💧 Le Déversoir du Barrage d'Ain Tebournok",
    titleEn: "💧 Mountain Dam Spillway of Ain Tebournok",
    descriptionAr: "تدفق المياه العذبة من السد الجبلي وسط الخضرة الساحرة وجبال البلدة الأبية.",
    descriptionFr: "L'eau fraîche s'écoulant du barrage de montagne au milieu de paysages verdoyants.",
    descriptionEn: "Freshwater flowing from our mountain dam surrounded by breathtaking green hills.",
    imageUrl: "/images/tebournok_masri_spillway_1781799161994.jpg",
    category: "nature",
    likes: 18,
    date: new Date(Date.now() - 86400000 * 8).toISOString()
  },
  {
    id: "photo-3",
    titleAr: "⛺ ليلة التخييم الساحرة تحت النجوم بعين طبرنق",
    titleFr: "⛺ Camping féerique sous les étoiles à Ain Tebournok",
    titleEn: "⛺ Enchanting Camping Night Under the Stars",
    descriptionAr: "تجمع شبابي رائع للاستمتاع بالطبيعة الخلابة والهواء الجبلي النقي بعيداً عن صخب المدينة.",
    descriptionFr: "Une expérience inoubliable de camping en pleine nature, sous un ciel étoilé et pur.",
    descriptionEn: "A magnificent youth gathering enjoying the pristine mountain air and night sky.",
    imageUrl: "/images/tebournok_camping_night_1781799178352.jpg",
    category: "nature",
    likes: 31,
    date: new Date(Date.now() - 86400000 * 6).toISOString()
  },
  {
    id: "photo-4",
    titleAr: "🍲 الوليمة والاحتفالات التقليدية بالقرية",
    titleFr: "🍲 Le Festin Traditionnel du Village",
    titleEn: "🍲 Traditional Village Feast & Gathering",
    descriptionAr: "كرم الضيافة والاحتفالات الفولكلورية الدافئة لأهالي القرية الصابرين في المناسبات والأعياد.",
    descriptionFr: "L'hospitalité chaleureuse et les traditions culinaires lors des fêtes du village.",
    descriptionEn: "Warm hospitality and traditional folkloric cuisine during our beloved community celebrations.",
    imageUrl: "/images/tebournok_traditional_feast_1781799198468.jpg",
    category: "social",
    likes: 45,
    date: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: "photo-5",
    titleAr: "🚶‍♂️ مسالك المشي الرياضي والاستكشاف الطبيعية",
    titleFr: "🚶‍♂️ Piste de Randonnée et d'Exploration Sauvage",
    titleEn: "🚶‍♂️ Natural Hiking & Exploration Trails",
    descriptionAr: "مسالك جبلية ساحرة تجذب عشاق الطبيعة والرياضة لاستكشاف غابات وجبال عين طبرنق الخلابة.",
    descriptionFr: "Des sentiers magnifiques qui attirent les amateurs de randonnée et d'écotourisme.",
    descriptionEn: "Enchanting mountain paths attracting hikers and nature lovers to explore our forests.",
    imageUrl: "/images/rural_hiking_trail_1781793647115.jpg",
    category: "nature",
    likes: 15,
    date: new Date(Date.now() - 86400000 * 12).toISOString()
  },
  {
    id: "photo-6",
    titleAr: "🍯 جني عسل النحل الجبلي الحر والنوعي",
    titleFr: "🍯 Récolte du Miel Pur de Montagne",
    titleEn: "🍯 Wild Mountain Honey Harvesting",
    descriptionAr: "إنتاج العسل الطبيعي الممتاز من مناحلنا الجبلية التي تعتمد على زهور الجبل البرية والنقية.",
    descriptionFr: "La récolte artisanale de miel sauvage réputé pour sa pureté et ses bienfaits.",
    descriptionEn: "Artisanal harvesting of pure mountain honey from hives feeding on wild mountain flowers.",
    imageUrl: "/images/rural_honey_harvest_1781793660794.jpg",
    category: "social",
    likes: 27,
    date: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: "photo-7",
    titleAr: "🏺 ورشة صناعة الفخار التقليدي اليدوي",
    titleFr: "🏺 Atelier de Poterie Traditionnelle à la Main",
    titleEn: "🏺 Traditional Handmade Pottery Craft",
    descriptionAr: "إحياء الحرف اليدوية القديمة وتشكيل الطين بأيدي محلية ماهرة تحافظ على هوية الآباء والأجداد.",
    descriptionFr: "La transmission du savoir-faire ancestral du façonnage de l'argile locale.",
    descriptionEn: "Preserving ancestral skills by shaping local clay into beautiful traditional pottery.",
    imageUrl: "/images/rural_pottery_workshop_1781793680298.jpg",
    category: "social",
    likes: 22,
    date: new Date(Date.now() - 86400000 * 15).toISOString()
  }
];

export default function App() {
  const [lang, setLang] = useState<Language>("ar");
  const [navigationMode, setNavigationMode] = useState<"independent" | "all">("all");
  const [activeSection, setActiveSection] = useState<string>("hero-section");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("tebournok_dark_mode") === "true";
  });

  // =======================================================
  // ADMIN CONTROLLED SITE CONFIGURATION (FIRESTORE PERSISTENT)
  // =======================================================
  const [logoUrl, setLogoUrl] = useState<string>("/images/ain_tebournok_logo_icon_1782210636883.jpg");
  const [siteTitleAr, setSiteTitleAr] = useState<string>("عين طبرنق");
  const [siteTitleFr, setSiteTitleFr] = useState<string>("Ain Tebournok");
  const [siteTitleEn, setSiteTitleEn] = useState<string>("Ain Tebournok");
  const [siteSloganAr, setSiteSloganAr] = useState<string>("قريتي المنسية");
  const [siteSloganFr, setSiteSloganFr] = useState<string>("Mon Village Oublié");
  const [siteSloganEn, setSiteSloganEn] = useState<string>("The Forgotten Village");
  const [fontFamilyChoice, setFontFamilyChoice] = useState<string>("Inter");
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState<number>(1.0);
  const [heroCoverUrl, setHeroCoverUrl] = useState<string>("/images/rural_heritage_cover_1781793628664.jpg");
  const [customTranslations, setCustomTranslations] = useState<any>({});
  const [mapCoords, setMapCoords] = useState<Record<string, string>>({
    "ruin-1": "36.534167,10.456611",
    "nature-1": "36.531306,10.486583",
    "utility-1": "36.534167,10.456611",
    "utility-2": "36.534167,10.455667",
    "utility-3": "36.534472,10.456944"
  });

  const AVAILABLE_FONTS = [
    { name: "Inter", label: "Inter (عصري لاتيني)", labelAr: "إنتر (عصري لاتيني)" },
    { name: "Cairo", label: "Cairo (هندسي عصري)", labelAr: "القاهرة (هندسي عصري)" },
    { name: "Tajawal", label: "Tajawal (ناعم متناسق)", labelAr: "تجول (ناعم متناسق)" },
    { name: "Amiri", label: "Amiri (خط نسخ كلاسيكي)", labelAr: "الأميري (خط نسخ كلاسيكي)" },
    { name: "Changa", label: "Changa (عريض للعناوين)", labelAr: "شانغا (عريض للعناوين)" },
    { name: "El Messiri", label: "El Messiri (فني منحنٍ)", labelAr: "المسيري (فني منحنٍ)" },
    { name: "Alexandria", label: "Alexandria (حديث وواضح)", labelAr: "الإسكندرية (حديث وواضح)" },
    { name: "Kufam", label: "Kufam (كوفي عريق)", labelAr: "كوفام (كوفي عريق)" }
  ];

  // Dynamic Google Font Loader
  useEffect(() => {
    if (fontFamilyChoice) {
      const fontId = "dynamic-google-font";
      let link = document.getElementById(fontId) as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.id = fontId;
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
      const encodedFont = encodeURIComponent(fontFamilyChoice);
      link.href = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@300;400;500;700;900&display=swap`;

      const styleId = "dynamic-font-style";
      let style = document.getElementById(styleId) as HTMLStyleElement;
      if (!style) {
        style = document.createElement("style");
        style.id = styleId;
        document.head.appendChild(style);
      }
      style.innerHTML = `
        body, html, .font-sans, p, span, h1, h2, h3, h4, h5, h6, button, input, textarea {
          font-family: '${fontFamilyChoice}', "Inter", ui-sans-serif, system-ui, sans-serif !important;
        }
      `;
    }
  }, [fontFamilyChoice]);

  // Dynamic Font Size Multiplier applying CSS proportional scaling
  useEffect(() => {
    const multiplierId = "dynamic-font-size-multiplier";
    let style = document.getElementById(multiplierId) as HTMLStyleElement;
    if (!style) {
      style = document.createElement("style");
      style.id = multiplierId;
      document.head.appendChild(style);
    }
    style.innerHTML = `
      html {
        font-size: ${fontSizeMultiplier * 100}% !important;
      }
    `;
  }, [fontSizeMultiplier]);

  const [sectionBgs, setSectionBgs] = useState<Record<string, {
    type: 'default' | 'color' | 'image';
    colorLight: string;
    colorDark: string;
    imageUrl: string;
    opacity: number;
  }>>(() => {
    const saved = localStorage.getItem("tebournok_section_bgs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      about: { type: 'default', colorLight: '#FAF8F5', colorDark: '#191612', imageUrl: '', opacity: 70 },
      news: { type: 'default', colorLight: '#EDF5F1', colorDark: '#091E16', imageUrl: '', opacity: 70 },
      'quick-tab': { type: 'default', colorLight: '#F3F7FA', colorDark: '#0F1821', imageUrl: '', opacity: 70 },
      council: { type: 'default', colorLight: '#F2EDE4', colorDark: '#1C1814', imageUrl: '', opacity: 70 },
      chat: { type: 'default', colorLight: '#FAF9FF', colorDark: '#131122', imageUrl: '', opacity: 70 },
      appeal: { type: 'default', colorLight: '#FDFBF7', colorDark: '#241710', imageUrl: '', opacity: 70 },
      'interactive-map': { type: 'default', colorLight: '#F3F4F6', colorDark: '#1E2024', imageUrl: '', opacity: 70 },
      joys: { type: 'default', colorLight: '#FFF8F8', colorDark: '#221215', imageUrl: '', opacity: 70 },
      passed: { type: 'default', colorLight: '#FAF6F0', colorDark: '#141210', imageUrl: '', opacity: 70 },
      contact: { type: 'default', colorLight: '#F3F7EF', colorDark: '#0F1C0D', imageUrl: '', opacity: 70 },
    };
  });

  const saveSectionBgs = (newBgs: any) => {
    setSectionBgs(newBgs);
    localStorage.setItem("tebournok_section_bgs", JSON.stringify(newBgs));
  };

  const [editingSectionKey, setEditingSectionKey] = useState<string>("news");

  const updateSingleSectionBg = (key: string, field: string, value: any) => {
    const updated = {
      ...sectionBgs,
      [key]: {
        ...sectionBgs[key],
        [field]: value
      }
    };
    saveSectionBgs(updated);
  };

  const getSectionBgStyle = (key: string, defaultClasses: string) => {
    const config = sectionBgs[key] || { type: 'default', colorLight: '', colorDark: '', imageUrl: '', opacity: 70 };
    
    if (config.type === 'color') {
      const activeColor = isDarkMode ? config.colorDark : config.colorLight;
      return {
        style: { backgroundColor: activeColor },
        className: `transition-all duration-300`,
        hasOverlay: false,
        overlayStyle: {}
      };
    } else if (config.type === 'image') {
      return {
        style: {
          backgroundImage: `url(${config.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'scroll',
        },
        className: `relative overflow-hidden transition-all duration-300`,
        hasOverlay: true,
        overlayStyle: {
          backgroundColor: isDarkMode ? '#000000' : '#ffffff',
          opacity: (100 - config.opacity) / 100,
        }
      };
    }
    
    return {
      style: {},
      className: `${defaultClasses} transition-all duration-300`,
      hasOverlay: false,
      overlayStyle: {}
    };
  };
  
  // Real-time ticking Clock & Calendar Date State
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [visitorCount, setVisitorCount] = useState<number>(() => {
    const saved = localStorage.getItem("tebournok_visitor_count");
    if (saved) {
      return parseInt(saved, 10);
    }
    const baseCount = 1380;
    localStorage.setItem("tebournok_visitor_count", baseCount.toString());
    return baseCount;
  });
  const [activeUsers, setActiveUsers] = useState<number>(4);
  const [activeQuickTab, setActiveQuickTab] = useState<string>("history");
  const [newsReadMode, setNewsReadMode] = useState<boolean>(false);
  const [historyReadMode, setHistoryReadMode] = useState<boolean>(false);
  const [galleryFilter, setGalleryFilter] = useState<string>("all");
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);

  // Gallery Dynamic CMS & Admin
  const [photos, setPhotos] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isInboxOpen, setIsInboxOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [pwaAppUrl, setPwaAppUrl] = useState<string>(() => {
    return localStorage.getItem("tebournok_pwa_app_url") || "";
  });
  const [pwaQrUrl, setPwaQrUrl] = useState<string>(() => {
    return localStorage.getItem("tebournok_pwa_qr_url") || "";
  });

  // PWA Install Event state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPWAInstallBtn, setShowPWAInstallBtn] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>("");
  const [adminLoginError, setAdminLoginError] = useState<string>("");

  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return localStorage.getItem("tebournok_admin_password") || "99633891";
  });
  const [newAdminPasswordInput, setNewAdminPasswordInput] = useState<string>("");
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<boolean>(false);
  const [passwordChangeError, setPasswordChangeError] = useState<string>("");

  // New Image addition fields
  const [photoUrlInput, setPhotoUrlInput] = useState<string>("");
  const [selectedFileBase64, setSelectedFileBase64] = useState<string>("");
  const [newPhotoCaptionAr, setNewPhotoCaptionAr] = useState<string>("");
  const [newPhotoCaptionFr, setNewPhotoCaptionFr] = useState<string>("");
  const [newPhotoCaptionEn, setNewPhotoCaptionEn] = useState<string>("");
  const [newPhotoCategory, setNewPhotoCategory] = useState<string>("heritage");
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Village Council state (مجلس القرية)
  const [councilMessages, setCouncilMessages] = useState<any[]>([]);
  const [newCouncilName, setNewCouncilName] = useState<string>("");
  const [newCouncilMessage, setNewCouncilMessage] = useState<string>("");
  const [newCouncilCategory, setNewCouncilCategory] = useState<string>("general");

  // Departed states (كانوا معنا ورحلوا)
  const [passedLovedOnes, setPassedLovedOnes] = useState<any[]>([]);
  const [newPassedName, setNewPassedName] = useState<string>("");
  const [newPassedDates, setNewPassedDates] = useState<string>("");
  const [newPassedRelation, setNewPassedRelation] = useState<string>("");
  const [newPassedBio, setNewPassedBio] = useState<string>("");
  const [newPassedUrl, setNewPassedUrl] = useState<string>("");
  const [newPassedFileBase64, setNewPassedFileBase64] = useState<string>("");
  const [newPassedDragActive, setNewPassedDragActive] = useState<boolean>(false);

  // Memorial Comments Maps
  const [passedCommentAuthors, setPassedCommentAuthors] = useState<Record<string, string>>({});
  const [passedCommentTexts, setPassedCommentTexts] = useState<Record<string, string>>({});
  
  // Aunt/Uncle Meftah AI Advisor states
  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: "أهلاً بك يا بني في عين طبرنق، قريتي التي عشت فيها عمري الطويل وسط عروق الزيتون وسدّ المصري. اسألني عن التاريخ الروماني، طبيعة جبل الهباليل، أو حتى هموم قريتنا المنسية ومطالب أهالينا الكرام."
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  
  // Solidarity Signatures guestbook simulator (persistent in localStorage!)
  const [supportName, setSupportName] = useState<string>("");
  const [supportCity, setSupportCity] = useState<string>("");
  const [signatures, setSignatures] = useState<Array<{ name: string; city: string; date: string }>>([]);
  const [signedSuccess, setSignedSuccess] = useState<boolean>(false);

  // Joys Section States (أفراحنا)
  const [joys, setJoys] = useState<any[]>([]);
  const [newJoyTitle, setNewJoyTitle] = useState<string>("");
  const [newJoyAuthor, setNewJoyAuthor] = useState<string>("");
  const [newJoyDescription, setNewJoyDescription] = useState<string>("");
  const [newJoyMediaUrl, setNewJoyMediaUrl] = useState<string>("");
  const [newJoyMediaType, setNewJoyMediaType] = useState<"image" | "video">("image");
  const [newJoyFileBase64, setNewJoyFileBase64] = useState<string>("");
  const [newJoyDragActive, setNewJoyDragActive] = useState<boolean>(false);
  const [joyCommentAuthors, setJoyCommentAuthors] = useState<Record<string, string>>({});
  const [joyCommentTexts, setJoyCommentTexts] = useState<Record<string, string>>({});

  // News Section States (أخبار القرية)
  const [newsList, setNewsList] = useState<any[]>([]);
  const [newNewsTitleAr, setNewNewsTitleAr] = useState<string>("");
  const [newNewsTitleFr, setNewNewsTitleFr] = useState<string>("");
  const [newNewsTitleEn, setNewNewsTitleEn] = useState<string>("");
  const [newNewsContentAr, setNewNewsContentAr] = useState<string>("");
  const [newNewsContentFr, setNewNewsContentFr] = useState<string>("");
  const [newNewsContentEn, setNewNewsContentEn] = useState<string>("");
  const [newNewsImageUrl, setNewNewsImageUrl] = useState<string>("");
  const [newNewsFileBase64, setNewNewsFileBase64] = useState<string>("");
  const [newNewsDragActive, setNewNewsDragActive] = useState<boolean>(false);

  // Administrator contact form states
  const [contactName, setContactName] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactSubject, setContactSubject] = useState<string>("");
  const [contactMessage, setContactMessage] = useState<string>("");
  const [isContactSubmitting, setIsContactSubmitting] = useState<boolean>(false);
  const [contactFormSuccess, setContactFormSuccess] = useState<boolean>(false);

  const [contactMessages, setContactMessages] = useState<any[]>(() => {
    const saved = localStorage.getItem("tebournok_contact_messages");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "msg-1",
        name: "منير الجبالي",
        email: "mounir.jebali@outlook.com",
        subject: "طلب تطوع لتنظيف المسلك السياحي بجبل الهباليل",
        message: "السلام عليكم، نحن مجموعة من شباب تونس العاصمة نود تنظيم رحلة تنظيف وتوضيب للمسلك الجبلي لعين طبرنق، هل يمكن التنسيق معكم لتسهيل مبيتنا أو الحصول على موافقة محلية؟ بارك الله في جهودكم.",
        date: "2026-06-22T14:30:00Z",
        read: false
      },
      {
        id: "msg-2",
        name: "إلهام الشابي",
        email: "elham.ch@gmail.com",
        subject: "استفسار بخصوص المعالم الأثرية الرومانية",
        message: "مرحباً إدارتنا الموقرة، أنا باحثة دكتوراه في علم الآثار بجامعة سوسة، وأود الاستفسار إذا كان هناك دراسات منشورة محلياً حول حمامات عين طبرنق أو مخطط لتهيئة الموقع قريباً. تحياتي لكم على هذا الموقع الرائع الذي يحيي تراثنا.",
        date: "2026-06-23T09:15:00Z",
        read: true
      },
      {
        id: "msg-3",
        name: "الحبيب بن رمضان",
        email: "habib.ramadan@topnet.tn",
        subject: "مسألة تزويد العائلات بمياه الشرب الصالحة",
        message: "نرجو من لجنة التواصل بالقرية تفعيل النداء الموجه للشركة الوطنية لاستغلال وتوزيع المياه بخصوص الأعطال المتكررة في أنابيب السقاية بجهة عين طبرنق العليا. نحن معكم قلباً وقالباً.",
        date: "2026-06-23T18:45:00Z",
        read: true
      }
    ];
  });

  const [emailAlerts, setEmailAlerts] = useState<any[]>(() => {
    const saved = localStorage.getItem("tebournok_email_alerts");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "alert-1",
        recipient: "aintebournouk.tunisia@gmail.com",
        subject: "📧 تنبيه: توقيع تضامني جديد على عريضة البنية التحتية",
        body: "قام الزائر 'سليم الماجري' من مدينة 'قرمبالية' بالتوقيع على العريضة للمطالبة بتهيئة الطريق الجبلية وتوفير مياه الشرب الصالحة لعائلات عين طبرنق.",
        type: "signature",
        timestamp: "2026-06-23T20:11:00Z"
      },
      {
        id: "alert-2",
        recipient: "aintebournouk.tunisia@gmail.com",
        subject: "📧 تنبيه: إضافة فرح جديد في قسم 'أفراحنا'",
        body: "تم نشر فرح جديد بعنوان 'حفل زفاف تقليدي لعائلة الباجي' بواسطة الكاتب 'نزار الباجي'. نرجو مراجعة المحتوى وتأكيده.",
        type: "joy",
        timestamp: "2026-06-24T01:05:00Z"
      }
    ];
  });

  const [latestEmailAlert, setLatestEmailAlert] = useState<any | null>(null);
  const [showEmailToast, setShowEmailToast] = useState<boolean>(false);

  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");
  const [showToast, setShowToast] = useState<boolean>(false);

  const triggerToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
  };

  const sendEmailAlert = (type: string, subject: string, body: string) => {
    const newAlert = {
      id: "alert-" + Date.now(),
      recipient: "aintebournouk.tunisia@gmail.com",
      subject: `📧 [بوابة عين طبرنق] ${subject}`,
      body: body,
      type: type,
      timestamp: new Date().toISOString()
    };
    
    const updatedAlerts = [newAlert, ...emailAlerts];
    setEmailAlerts(updatedAlerts);
    localStorage.setItem("tebournok_email_alerts", JSON.stringify(updatedAlerts));
    
    setLatestEmailAlert(newAlert);
    setShowEmailToast(true);
    
    // Auto close toast after 7 seconds
    setTimeout(() => {
      setShowEmailToast(false);
    }, 7000);
  };

  // Announcements (شريط الأخبار)
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newAnnAr, setNewAnnAr] = useState<string>("");
  const [newAnnFr, setNewAnnFr] = useState<string>("");
  const [newAnnEn, setNewAnnEn] = useState<string>("");
  const [isAnnouncementPanelExpanded, setIsAnnouncementPanelExpanded] = useState<boolean>(false);

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnAr.trim()) return;

    const newAnnouncement = {
      id: "ann-" + Date.now(),
      textAr: newAnnAr.trim(),
      textFr: (newAnnFr || newAnnAr).trim(),
      textEn: (newAnnEn || newAnnAr).trim(),
      date: new Date().toISOString()
    };

    const updated = [newAnnouncement, ...announcements];
    setAnnouncements(updated);
    localStorage.setItem("tebournok_announcements", JSON.stringify(updated));
    
    sendEmailAlert(
      "announcement",
      "نشر إعلان عاجل جديد بشريط الأخبار",
      `تم نشر خبر عاجل جديد ببلدتنا بقرار الإدارة:\n\nالعربية: ${newAnnouncement.textAr}\nالفرنسية: ${newAnnouncement.textFr}\nالإنجليزية: ${newAnnouncement.textEn}`
    );

    setNewAnnAr("");
    setNewAnnFr("");
    setNewAnnEn("");
  };

  const handleDeleteAnnouncement = (id: string) => {
    const updated = announcements.filter(ann => ann.id !== id);
    setAnnouncements(updated);
    localStorage.setItem("tebournok_announcements", JSON.stringify(updated));
  };

  // Load signatures & custom photos from Firestore in real-time with auto-seeding
  useEffect(() => {
    // See if admin was logged in
    const cachedAdmin = localStorage.getItem("tebournok_is_admin");
    if (cachedAdmin === "true") {
      setIsAdmin(true);
    }

    // 1. Signatures
    const unsubscribeSignatures = onSnapshot(collection(db, "signatures"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSignatures(list);
    });

    // 2. Photos
    const unsubscribePhotos = onSnapshot(collection(db, "photos"), (snapshot) => {
      if (snapshot.empty) {
        // Seed default photos
        DEFAULT_PHOTOS.forEach(async (p) => {
          await addDoc(collection(db, "photos"), { ...p, date: new Date().toISOString() });
        });
      } else {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPhotos(list);
      }
    });

    // 3. Council messages
    const unsubscribeCouncil = onSnapshot(collection(db, "council_messages"), (snapshot) => {
      if (snapshot.empty) {
        // Seed default council messages
        DEFAULT_COUNCIL_MESSAGES.forEach(async (m) => {
          await addDoc(collection(db, "council_messages"), m);
        });
      } else {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort by date descending
        const sorted = (list as any[]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setCouncilMessages(sorted);
      }
    });

    // 4. Passed Loved Ones
    const unsubscribePassed = onSnapshot(collection(db, "passed_loved_ones"), (snapshot) => {
      if (snapshot.empty) {
        // Seed default passed loved ones
        DEFAULT_PASSED_LOVED_ONES.forEach(async (p) => {
          await addDoc(collection(db, "passed_loved_ones"), p);
        });
      } else {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPassedLovedOnes(list);
      }
    });

    // 5. Announcements
    const unsubscribeAnnouncements = onSnapshot(collection(db, "announcements"), (snapshot) => {
      if (snapshot.empty) {
        // Seed default announcements
        DEFAULT_ANNOUNCEMENTS.forEach(async (a) => {
          await addDoc(collection(db, "announcements"), a);
        });
      } else {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort by date descending
        const sorted = (list as any[]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setAnnouncements(sorted);
      }
    });

    // 6. Joys
    const unsubscribeJoys = onSnapshot(collection(db, "joys"), (snapshot) => {
      if (snapshot.empty) {
        // Seed default joys
        DEFAULT_JOYS.forEach(async (j) => {
          await addDoc(collection(db, "joys"), j);
        });
      } else {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort by date descending
        const sorted = (list as any[]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setJoys(sorted);
      }
    });

    // 7. News list
    const unsubscribeNews = onSnapshot(collection(db, "news"), (snapshot) => {
      if (snapshot.empty) {
        // Seed default news
        DEFAULT_NEWS.forEach(async (n) => {
          await addDoc(collection(db, "news"), n);
        });
      } else {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort by date descending
        const sorted = (list as any[]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setNewsList(sorted);
      }
    });

    // 8. Site settings real-time subscription
    const unsubscribeSettings = onSnapshot(doc(db, "site_settings", "config"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.logoUrl) setLogoUrl(data.logoUrl);
        if (data.siteTitleAr) setSiteTitleAr(data.siteTitleAr);
        if (data.siteTitleFr) setSiteTitleFr(data.siteTitleFr);
        if (data.siteTitleEn) setSiteTitleEn(data.siteTitleEn);
        if (data.siteSloganAr) setSiteSloganAr(data.siteSloganAr);
        if (data.siteSloganFr) setSiteSloganFr(data.siteSloganFr);
        if (data.siteSloganEn) setSiteSloganEn(data.siteSloganEn);
        if (data.fontFamilyChoice) setFontFamilyChoice(data.fontFamilyChoice);
        if (data.fontSizeMultiplier !== undefined) setFontSizeMultiplier(Number(data.fontSizeMultiplier));
        if (data.heroCoverUrl) setHeroCoverUrl(data.heroCoverUrl);
        if (data.customTranslations) setCustomTranslations(data.customTranslations);
        if (data.mapCoords) setMapCoords(data.mapCoords);
      } else {
        // Initialize default settings in Firestore
        setDoc(doc(db, "site_settings", "config"), {
          logoUrl: "/images/ain_tebournok_logo_icon_1782210636883.jpg",
          siteTitleAr: "عين طبرنق",
          siteTitleFr: "Ain Tebournok",
          siteTitleEn: "Ain Tebournok",
          siteSloganAr: "قريتي المنسية",
          siteSloganFr: "Mon Village Oublié",
          siteSloganEn: "The Forgotten Village",
          fontFamilyChoice: "Inter",
          fontSizeMultiplier: 1.0,
          heroCoverUrl: "/images/rural_heritage_cover_1781793628664.jpg",
          customTranslations: {},
          mapCoords: {
            "ruin-1": "36.534167,10.456611",
            "nature-1": "36.531306,10.486583",
            "utility-1": "36.534167,10.456611",
            "utility-2": "36.534167,10.455667",
            "utility-3": "36.534472,10.456944"
          }
        }).catch(err => console.error("Error initialization site settings:", err));
      }
    });

    return () => {
      unsubscribeSignatures();
      unsubscribePhotos();
      unsubscribeCouncil();
      unsubscribePassed();
      unsubscribeAnnouncements();
      unsubscribeJoys();
      unsubscribeNews();
      unsubscribeSettings();
    };
  }, []);

  // =======================================================
  // ADMIN LOCAL EDIT STATES FOR DYNAMIC CUSTOMIZER
  // =======================================================
  const [editLogoUrl, setEditLogoUrl] = useState<string>("");
  const [editHeroCoverUrl, setEditHeroCoverUrl] = useState<string>("");
  const [editSiteTitleAr, setEditSiteTitleAr] = useState<string>("");
  const [editSiteTitleFr, setEditSiteTitleFr] = useState<string>("");
  const [editSiteTitleEn, setEditSiteTitleEn] = useState<string>("");
  const [editSiteSloganAr, setEditSiteSloganAr] = useState<string>("");
  const [editSiteSloganFr, setEditSiteSloganFr] = useState<string>("");
  const [editSiteSloganEn, setEditSiteSloganEn] = useState<string>("");
  const [editFontFamilyChoice, setEditFontFamilyChoice] = useState<string>("");
  const [editFontSizeMultiplier, setEditFontSizeMultiplier] = useState<number>(1.0);
  const [editCustomTranslations, setEditCustomTranslations] = useState<any>({});
  const [editMapCoords, setEditMapCoords] = useState<Record<string, string>>({
    "ruin-1": "36.534167,10.456611",
    "nature-1": "36.531306,10.486583",
    "utility-1": "36.534167,10.456611",
    "utility-2": "36.534167,10.455667",
    "utility-3": "36.534472,10.456944"
  });
  
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);
  const [saveSettingsSuccess, setSaveSettingsSuccess] = useState<boolean>(false);

  // Sync loaded database state values to form edit states
  useEffect(() => {
    setEditLogoUrl(logoUrl);
    setEditHeroCoverUrl(heroCoverUrl);
    setEditSiteTitleAr(siteTitleAr);
    setEditSiteTitleFr(siteTitleFr);
    setEditSiteTitleEn(siteTitleEn);
    setEditSiteSloganAr(siteSloganAr);
    setEditSiteSloganFr(siteSloganFr);
    setEditSiteSloganEn(siteSloganEn);
    setEditFontFamilyChoice(fontFamilyChoice);
    setEditFontSizeMultiplier(fontSizeMultiplier);
    setEditCustomTranslations(customTranslations);
    if (mapCoords && Object.keys(mapCoords).length > 0) {
      setEditMapCoords(mapCoords);
    }
  }, [
    logoUrl, 
    heroCoverUrl, 
    siteTitleAr, 
    siteTitleFr, 
    siteTitleEn, 
    siteSloganAr, 
    siteSloganFr, 
    siteSloganEn, 
    fontFamilyChoice, 
    fontSizeMultiplier, 
    customTranslations,
    mapCoords
  ]);

  // Submit Handler to save dynamic configurations to Firestore
  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await setDoc(doc(db, "site_settings", "config"), {
        logoUrl: editLogoUrl.trim(),
        heroCoverUrl: editHeroCoverUrl.trim(),
        siteTitleAr: editSiteTitleAr.trim(),
        siteTitleFr: editSiteTitleFr.trim(),
        siteTitleEn: editSiteTitleEn.trim(),
        siteSloganAr: editSiteSloganAr.trim(),
        siteSloganFr: editSiteSloganFr.trim(),
        siteSloganEn: editSiteSloganEn.trim(),
        fontFamilyChoice: editFontFamilyChoice,
        fontSizeMultiplier: Number(editFontSizeMultiplier),
        customTranslations: editCustomTranslations,
        mapCoords: editMapCoords
      });
      setSaveSettingsSuccess(true);
      setTimeout(() => setSaveSettingsSuccess(false), 4000);
    } catch (err) {
      console.error("Error saving site configurations:", err);
      alert(lang === "ar" ? "حدث خطأ أثناء حفظ التعديلات!" : "An error occurred while saving configurations.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Sync dark mode style in document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("tebournok_dark_mode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("tebournok_dark_mode", "false");
    }
  }, [isDarkMode]);

  // Visitor Counter and live activity simulation
  useEffect(() => {
    const hasVisitedThisSession = sessionStorage.getItem("tebournok_visited_session");
    if (!hasVisitedThisSession) {
      sessionStorage.setItem("tebournok_visited_session", "true");
      setVisitorCount(prev => {
        const next = prev + 1;
        localStorage.setItem("tebournok_visitor_count", next.toString());
        return next;
      });
    }

    const interval = setInterval(() => {
      setActiveUsers(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return next < 2 ? 2 : next > 8 ? 8 : next;
      });
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  // PWA beforeinstallprompt handler
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPWAInstallBtn(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // Sync translation triggers on language change for Initial AI greeting
  useEffect(() => {
    if (lang === "fr") {
      setChatMessages([
        {
          role: "assistant",
          content: "Bienvenue mon enfant à Ain Tebournok! Mon village oublié au flanc du Jebel El Hbalil. Pose-moi tes questions sur l'antique Capitole, le majestueux barrage Masri ou nos luttes quotidiennes pour redonner vie à cette terre."
        }
      ]);
    } else if (lang === "en") {
      setChatMessages([
        {
          role: "assistant",
          content: "Welcome, my child, to Ain Tebournok! My forgotten village nestled near the Jebel El Hbalil climbs. Ask me about our Roman baths, El Masri Dam, or our struggles for basic public rights."
        }
      ]);
    } else {
      setChatMessages([
        {
          role: "assistant",
          content: "أهلاً بك يا بني في عين طبرنق، قريتي التي عشت فيها عمري الطويل وسط عروق الزيتون وسدّ المصري. اسألني عن التاريخ الروماني، طبيعة جبل الهباليل، أو حتى هموم قريتنا المنسية ومطالب أهالينا الكرام."
        }
      ]);
    }
  }, [lang]);

  // Admin and form functions
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === adminPassword) {
      setIsAdmin(true);
      localStorage.setItem("tebournok_is_admin", "true");
      setIsAdminModalOpen(false);
      setIsInboxOpen(true); // Auto-open the secure message inbox modal
      setAdminPasswordInput("");
      setAdminLoginError("");
    } else {
      setAdminLoginError(lang === "ar" ? "رمز المرور خاطئ!" : lang === "fr" ? "Code d'accès incorrect !" : "Incorrect password code!");
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPwd = newAdminPasswordInput.trim();
    if (!cleanPwd) {
      setPasswordChangeError(lang === "ar" ? "لا يمكن ترك كلمة المرور فارغة!" : "Password cannot be empty!");
      return;
    }
    if (cleanPwd.length < 4) {
      setPasswordChangeError(lang === "ar" ? "رمز المرور قصير جداً (الحد الأدنى 4 رموز)!" : "Code is too short (minimum 4 characters)!");
      return;
    }
    setAdminPassword(cleanPwd);
    localStorage.setItem("tebournok_admin_password", cleanPwd);
    setPasswordChangeSuccess(true);
    setPasswordChangeError("");
    setNewAdminPasswordInput("");
    setTimeout(() => {
      setPasswordChangeSuccess(false);
    }, 4500);
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem("tebournok_is_admin");
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsContactSubmitting(true);
    
    const senderName = contactName.trim();
    const senderEmail = contactEmail.trim() || "visitor@example.com";
    const subjectLine = contactSubject.trim() || `بوابة عين طبرنق - رسالة تواصل جديدة`;
    const messageText = contactMessage.trim();

    // Create the persistent contact message
    const newMessage = {
      id: "msg-" + Date.now(),
      name: senderName,
      email: senderEmail,
      subject: subjectLine,
      message: messageText,
      date: new Date().toISOString(),
      read: false
    };

    const updatedMessages = [newMessage, ...contactMessages];
    setContactMessages(updatedMessages);
    localStorage.setItem("tebournok_contact_messages", JSON.stringify(updatedMessages));

    // Send the administration alert email!
    sendEmailAlert(
      "contact",
      `رسالة تواصل جديدة من ${senderName}`,
      `اسم المرسل: ${senderName}\nالبريد الإلكتروني: ${senderEmail}\nالموضوع: ${subjectLine}\n\nنص الرسالة:\n${messageText}`
    );
    
    setContactFormSuccess(true);
    setIsContactSubmitting(false);
    
    // Reset form inputs
    setContactName("");
    setContactEmail("");
    setContactSubject("");
    setContactMessage("");
    
    setTimeout(() => {
      setContactFormSuccess(false);
    }, 5500);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileChange(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFileChange(file);
    }
  };

  const handleFileChange = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let resolvedUrl = photoUrlInput;
    if (selectedFileBase64) {
      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: `photo_${Date.now()}.png`,
            fileData: selectedFileBase64
          })
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          resolvedUrl = uploadData.url;
        }
      } catch (err) {
        console.error("Image upload failed", err);
      }
    }

    if (!resolvedUrl) {
      alert(lang === "ar" ? "يرجى تحميل صورة أو وضع رابط لها!" : "Veuillez charger une photo ou spécifier son lien !");
      return;
    }

    const newPhoto = {
      imageUrl: resolvedUrl,
      captionAr: newPhotoCaptionAr.trim() || "صورة جديدة لملامح عين طبرنق",
      captionFr: newPhotoCaptionFr.trim() || "Nouvelle photo de Ain Tebournok",
      captionEn: newPhotoCaptionEn.trim() || "New photo from Ain Tebournok",
      category: newPhotoCategory,
      date: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, "photos"), newPhoto);

      sendEmailAlert(
        "photo",
        "إضافة صورة جديدة لمعرض معالم القرية",
        `تم نشر صورة فوتوغرافية جديدة بالمعرض البصري لعين طبرنق:\n\nالتسمية التوضيحية (العربية): ${newPhoto.captionAr}\nالتصنيف: ${newPhoto.category}`
      );

      // Reset inputs
      setPhotoUrlInput("");
      setSelectedFileBase64("");
      setNewPhotoCaptionAr("");
      setNewPhotoCaptionFr("");
      setNewPhotoCaptionEn("");
    } catch (err) {
      console.error("Error adding photo to Firestore:", err);
    }
  };

  const handleDeletePhoto = async (idToDelete: string) => {
    try {
      await deleteDoc(doc(db, "photos", idToDelete));
    } catch (err) {
      console.error("Error deleting photo:", err);
    }
  };

  // ==========================================
  // Joys Section Handlers (أفراحنا)
  // ==========================================
  const handleJoyFileChange = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewJoyFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddJoy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJoyTitle.trim() || !newJoyDescription.trim() || !newJoyAuthor.trim()) {
      alert(lang === "ar" ? "يرجى ملء جميع الحقول المطلوبة!" : "Please fill in all required fields!");
      return;
    }

    let resolvedMedia = newJoyMediaUrl;
    if (newJoyFileBase64) {
      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: `joy_${Date.now()}.png`,
            fileData: newJoyFileBase64
          })
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          resolvedMedia = uploadData.url;
        }
      } catch (err) {
        console.error("Joy image upload failed", err);
      }
    }

    const newItem = {
      title: newJoyTitle.trim(),
      author: newJoyAuthor.trim(),
      description: newJoyDescription.trim(),
      mediaUrl: resolvedMedia,
      mediaType: newJoyMediaType,
      likes: 0,
      comments: [],
      date: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, "joys"), newItem);

      sendEmailAlert(
        "joy",
        "إضافة مناسبة فرح جديدة في القرية",
        `تم نشر مناسبة فرح جديدة بالقرية بواسطة الكاتب ${newItem.author}:\n\nالعنوان: ${newItem.title}\nالتفاصيل: ${newItem.description}`
      );

      // Reset fields
      setNewJoyTitle("");
      setNewJoyAuthor("");
      setNewJoyDescription("");
      setNewJoyMediaUrl("");
      setNewJoyMediaType("image");
      setNewJoyFileBase64("");
    } catch (err) {
      console.error("Error adding joy to Firestore:", err);
    }
  };

  const handleLikeJoy = async (id: string) => {
    const targetJoy = joys.find(j => j.id === id);
    if (!targetJoy) return;
    try {
      await updateDoc(doc(db, "joys", id), {
        likes: (targetJoy.likes || 0) + 1
      });
    } catch (err) {
      console.error("Error liking joy:", err);
    }
  };

  const handleAddJoyComment = async (joyId: string, e: React.FormEvent) => {
    e.preventDefault();
    const author = (joyCommentAuthors[joyId] || "").trim();
    const text = (joyCommentTexts[joyId] || "").trim();

    if (!author || !text) {
      alert(lang === "ar" ? "يرجى كتابة الاسم والتعليق!" : "Please type your name and comment!");
      return;
    }

    const targetJoy = joys.find(j => j.id === joyId);
    if (!targetJoy) return;

    const newComment = {
      id: "comment-" + Date.now(),
      author,
      text,
      date: new Date().toISOString()
    };

    const updatedComments = [...(targetJoy.comments || []), newComment];

    try {
      await updateDoc(doc(db, "joys", joyId), {
        comments: updatedComments
      });

      sendEmailAlert(
        "comment",
        "إضافة تهنئة/تعليق جديد بقسم الأفراح",
        `قام الزائر '${author}' بإضافة تهنئة جديدة:\n\nنص التهنئة: "${text}"`
      );

      // Reset comment inputs for this item
      setJoyCommentAuthors((prev) => ({ ...prev, [joyId]: "" }));
      setJoyCommentTexts((prev) => ({ ...prev, [joyId]: "" }));
    } catch (err) {
      console.error("Error adding joy comment:", err);
    }
  };

  const handleDeleteJoy = async (id: string) => {
    if (!window.confirm(lang === "ar" ? "هل أنت متأكد من حذف هذا الفرح؟" : "Are you sure you want to delete this celebration?")) return;
    try {
      await deleteDoc(doc(db, "joys", id));
    } catch (err) {
      console.error("Error deleting joy:", err);
    }
  };

  // ==========================================
  // News Section Handlers (أخبار القرية بالتفصيل)
  // ==========================================
  const handleNewsFileChange = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewNewsFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNewsTitleAr.trim() || !newNewsContentAr.trim()) {
      alert(lang === "ar" ? "يرجى ملء عنوان الخبر وتفاصيله بالعربية!" : "Please provide at least Arabic Title and content!");
      return;
    }

    let resolvedImage = newNewsImageUrl;
    if (newNewsFileBase64) {
      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: `news_${Date.now()}.png`,
            fileData: newNewsFileBase64
          })
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          resolvedImage = uploadData.url;
        }
      } catch (err) {
        console.error("News image upload failed", err);
      }
    }

    const newNewsItem = {
      titleAr: newNewsTitleAr.trim(),
      titleFr: (newNewsTitleFr || newNewsTitleAr).trim(),
      titleEn: (newNewsTitleEn || newNewsTitleAr).trim(),
      contentAr: newNewsContentAr.trim(),
      contentFr: (newNewsContentFr || newNewsContentAr).trim(),
      contentEn: (newNewsContentEn || newNewsContentAr).trim(),
      imageUrl: resolvedImage,
      date: new Date().toISOString()
    };

    try {
      // 1. Add news item to Firestore
      await addDoc(collection(db, "news"), newNewsItem);

      // 2. Add announcement to Firestore
      const newAnnouncement = {
        textAr: `📢 خبر عاجل: ${newNewsTitleAr.trim()}`,
        textFr: `📢 Urgent: ${(newNewsTitleFr || newNewsTitleAr).trim()}`,
        textEn: `📢 Breaking: ${(newNewsTitleEn || newNewsTitleAr).trim()}`,
        date: new Date().toISOString()
      };
      await addDoc(collection(db, "announcements"), newAnnouncement);

      sendEmailAlert(
        "news",
        "نشر مقال إخباري جديد في بوابة القرية",
        `تم نشر مقال إخباري جديد بواسطة إدارة عين طبرنق:\n\nالعنوان: ${newNewsItem.titleAr}\nالمحتوى: ${newNewsItem.contentAr}\nالصورة المرفقة: ${newNewsItem.imageUrl ? "نعم" : "لا"}`
      );

      // Reset inputs
      setNewNewsTitleAr("");
      setNewNewsTitleFr("");
      setNewNewsTitleEn("");
      setNewNewsContentAr("");
      setNewNewsContentFr("");
      setNewNewsContentEn("");
      setNewNewsImageUrl("");
      setNewNewsFileBase64("");

      alert(
        lang === "ar"
          ? "تم إضافة الخبر وتحديث شريط الأخبار المتحرك تلقائياً!"
          : "News added successfully and ticker has been updated!"
      );
    } catch (err) {
      console.error("Error adding news to Firestore:", err);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!window.confirm(lang === "ar" ? "هل أنت متأكد من حذف هذا الخبر؟" : "Are you sure you want to delete this news item?")) return;
    try {
      await deleteDoc(doc(db, "news", id));
    } catch (err) {
      console.error("Error deleting news:", err);
    }
  };

  // Village Council interaction handlers
  const handleAddCouncilMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouncilMessage.trim()) return;

    const nameToUse = newCouncilName.trim() || (lang === "ar" ? "ابن عين طبرنق" : lang === "fr" ? "Enfant de Ain Tebournok" : "Child of Tebournok");
    const newMessage = {
      name: nameToUse,
      message: newCouncilMessage.trim(),
      category: newCouncilCategory,
      likes: 0,
      votesYes: 0,
      votesNo: 0,
      date: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, "council_messages"), newMessage);

      sendEmailAlert(
        "comment",
        "طرح فكرة/مسألة جديدة للمجلس البلدي",
        `قام المواطن/الزائر '${nameToUse}' بطرح مسألة للمجلس البلدي في تصنيف [${newCouncilCategory}]:\n\nالمضمون: "${newMessage.message}"`
      );

      setNewCouncilName("");
      setNewCouncilMessage("");
    } catch (err) {
      console.error("Error adding council message to Firestore:", err);
    }
  };

  const handleLikeCouncilMessage = async (msgId: string) => {
    const target = councilMessages.find(m => m.id === msgId);
    if (!target) return;
    try {
      await updateDoc(doc(db, "council_messages", msgId), {
        likes: (target.likes || 0) + 1
      });
    } catch (err) {
      console.error("Error liking council message:", err);
    }
  };

  const handleVoteCouncilMessage = async (msgId: string, voteType: 'yes' | 'no') => {
    const target = councilMessages.find(m => m.id === msgId);
    if (!target) return;
    const votesYes = target.votesYes !== undefined ? target.votesYes : 0;
    const votesNo = target.votesNo !== undefined ? target.votesNo : 0;
    try {
      if (voteType === 'yes') {
        await updateDoc(doc(db, "council_messages", msgId), {
          votesYes: votesYes + 1
        });
      } else {
        await updateDoc(doc(db, "council_messages", msgId), {
          votesNo: votesNo + 1
        });
      }
    } catch (err) {
      console.error("Error voting on council message:", err);
    }
  };

  const handleDeleteCouncilMessage = async (msgId: string) => {
    try {
      await deleteDoc(doc(db, "council_messages", msgId));
    } catch (err) {
      console.error("Error deleting council message:", err);
    }
  };

  // Departed ancestors interaction handlers
  const handlePassedDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setNewPassedDragActive(true);
    } else if (e.type === "dragleave") {
      setNewPassedDragActive(false);
    }
  };

  const handlePassedDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNewPassedDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileForPassed(file);
    }
  };

  const handlePassedFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFileForPassed(file);
    }
  };

  const handleFileForPassed = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewPassedFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddPassedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassedName.trim()) {
      alert(lang === "ar" ? "يرجى كتابة الاسم الكريم للفقيد" : "Please provide names for the deceased.");
      return;
    }

    let resolvedImg = newPassedUrl.trim() || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400";
    if (newPassedFileBase64) {
      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: `passed_${Date.now()}.png`,
            fileData: newPassedFileBase64
          })
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          resolvedImg = uploadData.url;
        }
      } catch (err) {
        console.error("Passed loved one image upload failed", err);
      }
    }

    const newPassed = {
      name: newPassedName.trim(),
      dates: newPassedDates.trim() || (lang === "ar" ? "غير محدد" : "Dates non spécifiées"),
      relation: newPassedRelation.trim() || (lang === "ar" ? "فقيد غالي من القرية" : "Cher membre de la communauté"),
      bio: newPassedBio.trim() || (lang === "ar" ? "ذكراه العطرة باقية في قلوبنا وعقولنا جميعاً." : "En doux souvenir de sa belle et noble vie."),
      imageUrl: resolvedImg,
      candles: 1,
      comments: [],
      dateAdded: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, "passed_loved_ones"), newPassed);

      sendEmailAlert(
        "passed",
        "إضافة تأبين/فقيد جديد في لوحة الخلود والذاكرة",
        `تم نشر بطاقة تأبين لفقيد جديد بالقرية:\n\nالاسم: ${newPassed.name}\nالعلاقة/العنوان: ${newPassed.relation}\nنبذة: ${newPassed.bio}`
      );

      // Reset fields
      setNewPassedName("");
      setNewPassedDates("");
      setNewPassedRelation("");
      setNewPassedBio("");
      setNewPassedUrl("");
      setNewPassedFileBase64("");
    } catch (err) {
      console.error("Error adding passed loved one to Firestore:", err);
    }
  };

  const handleLightCandle = async (id: string) => {
    const target = passedLovedOnes.find(p => p.id === id);
    if (!target) return;
    try {
      await updateDoc(doc(db, "passed_loved_ones", id), {
        candles: (target.candles || 0) + 1
      });
    } catch (err) {
      console.error("Error lighting candle:", err);
    }
  };

  const handleDeletePassed = async (id: string) => {
    try {
      await deleteDoc(doc(db, "passed_loved_ones", id));
    } catch (err) {
      console.error("Error deleting passed loved one:", err);
    }
  };

  const handleAddPassedComment = async (e: React.FormEvent, itemId: string) => {
    e.preventDefault();
    const commentText = passedCommentTexts[itemId]?.trim();
    if (!commentText) return;

    const authorName = passedCommentAuthors[itemId]?.trim() || (lang === "ar" ? "فاعل خير" : "Visiteur de Tebournok");
    const newComment = {
      id: `cmt-${Date.now()}`,
      author: authorName,
      text: commentText,
      date: new Date().toISOString()
    };

    const targetItem = passedLovedOnes.find(item => item.id === itemId);
    if (!targetItem) return;

    const updatedComments = [...(targetItem.comments || []), newComment];

    try {
      await updateDoc(doc(db, "passed_loved_ones", itemId), {
        comments: updatedComments
      });

      sendEmailAlert(
        "comment",
        "إضافة تعليق مواساة جديد في لوحة الخلود",
        `قام الزائر '${authorName}' بإرسال تعزية ومواساة جديدة:\n\nنص التعزية: "${commentText}"`
      );

      // Reset input for this item
      setPassedCommentTexts({ ...passedCommentTexts, [itemId]: "" });
      setPassedCommentAuthors({ ...passedCommentAuthors, [itemId]: "" });
    } catch (err) {
      console.error("Error adding comment to departed:", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    const updatedMessages = [...chatMessages, { role: "user" as const, content: userMsg }];
    setChatMessages(updatedMessages);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages })
      });
      const data = await response.json();
      setChatMessages((prev) => [...prev, { role: "assistant", content: data.text }]);
    } catch (err) {
      console.error(err);
      const fallbackText = lang === "ar" 
        ? "يا بني، حالت ظروف الجبال والوديان دون اتصالي المؤقت، ولكن قلبي ينبض بحب عين طبرنق الشامخة. ما زالت سدودنا وحجارتنا البيزنطية تحكي الصمود."
        : lang === "fr"
          ? "Mon enfant, la connexion montagnarde est faible, mais notre ferveur reste totale. Que souhaitez-vous découvrir d'autre ?"
          : "My child, mountain winds halted our transmission for a bit, but Ain Tebournok stays open for your passionate discovery!";
      setChatMessages((prev) => [...prev, { role: "assistant", content: fallbackText }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleAddSignature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportName.trim() || !supportCity.trim()) return;

    const newSig = {
      name: supportName.trim(),
      city: supportCity.trim(),
      date: new Date().toISOString().split("T")[0]
    };

    try {
      await addDoc(collection(db, "signatures"), newSig);

      sendEmailAlert(
        "signature",
        "توقيع تضامني جديد على العريضة التنموية",
        `قام الزائر '${newSig.name}' من '${newSig.city}' بالتوقيع على العريضة للمطالبة بتهيئة عين طبرنق وتحسين بنيتها التحتية.`
      );

      setSupportName("");
      setSupportCity("");
      setSignedSuccess(true);
      setTimeout(() => setSignedSuccess(false), 5000);
    } catch (err) {
      console.error("Error adding signature to Firestore:", err);
    }
  };

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    setActiveSection(id);
    if (navigationMode === "all") {
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Dynamically merge base translations with custom translations configured by the admin
  const t = useMemo(() => {
    const base = { ...TRANSLATIONS[lang] };
    const overrides = customTranslations[lang] || {};
    return { ...base, ...overrides };
  }, [lang, customTranslations]);

  // Live formatted clock & calendar helper
  const getFormattedDateTime = () => {
    const locale = lang === "ar" ? "ar-TN" : lang === "fr" ? "fr-FR" : "en-US";
    const dateStr = currentTime.toLocaleDateString(locale, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    const timeStr = currentTime.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    return { dateStr, timeStr };
  };
  const { dateStr: clockDate, timeStr: clockTime } = getFormattedDateTime();

  return (
    <div className={`min-h-screen font-sans flex flex-col selection:bg-emerald-950 selection:text-white transition-colors duration-300 ${
      isDarkMode 
        ? "bg-stone-950 text-zinc-100" 
        : "bg-stone-50 text-stone-850"
    }`} dir={lang === "ar" ? "rtl" : "ltr"}>
      
      {/* Sticky Top Header Area */}
      <div className="sticky top-0 z-[100] w-full flex flex-col shadow-xs">
        
        {/* Admin Broadcast Scrolling Ticker */}
        <div className="bg-emerald-900 border-b border-emerald-950 text-white text-xs py-1.5 overflow-hidden flex items-center relative z-50">
          <div className="bg-amber-400 text-emerald-950 font-black px-2.5 py-0.5 text-[9px] sm:text-[10px] uppercase shrink-0 flex items-center gap-1 shadow-xs rounded-r-md min-w-[90px] sm:min-w-[110px] justify-center select-none font-sans" dir="ltr">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-950 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-850"></span>
            </span>
            <span>{lang === "ar" ? "أخبار المشرف 📢" : lang === "fr" ? "Infos Admin 📢" : "Admin News 📢"}</span>
          </div>
          
          <marquee
            behavior="scroll"
            direction={lang === "ar" ? "right" : "left"}
            scrollamount="3"
            onMouseEnter={(e: any) => e.currentTarget.stop()}
            onMouseLeave={(e: any) => e.currentTarget.start()}
            className="flex-1 font-sans text-[11px] sm:text-xs font-semibold select-none pr-3 pl-3"
          >
            {announcements.map((ann, idx) => (
              <span key={ann.id} className="inline-block mx-6 text-stone-100 font-sans">
                {lang === "ar" ? ann.textAr : lang === "fr" ? ann.textFr : ann.textEn}
                {idx < announcements.length - 1 && <span className="mx-4 text-amber-300 font-bold">✦</span>}
              </span>
            ))}
          </marquee>

          {/* Small Settings / Edit Card toggle for admin only */}
          {isAdmin && (
            <button
              onClick={() => setIsAnnouncementPanelExpanded(!isAnnouncementPanelExpanded)}
              className="mx-2 p-1 text-[10px] bg-emerald-950 hover:bg-emerald-800 border border-emerald-700 rounded text-amber-300 hover:text-amber-200 transition-all shrink-0 flex items-center gap-1 font-sans font-black"
            >
              <Lock className="w-2.5 h-2.5" />
              <span>{isAnnouncementPanelExpanded ? (lang === "ar" ? "إغلاق التحكم" : "Close") : (lang === "ar" ? "تعديل الشريط" : "Edit ticker")}</span>
            </button>
          )}
        </div>

        {/* Admin Announcement Editor Drawer / Row */}
        {isAdmin && isAnnouncementPanelExpanded && (
          <div className="bg-stone-100 border-b border-stone-250 p-4 font-sans text-right relative z-50 max-h-[70vh] overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-3">
              <h4 className="text-xs font-black text-amber-950 flex items-center gap-1.5 justify-end">
                <span>{lang === "ar" ? "🛠️ لوحة التحكم بشريط الأخبار العاجلة للمشرفين" : "🛠️ Admin Breaking News Ticker Console"}</span>
              </h4>
              <p className="text-[10px] text-stone-500">
                {lang === "ar" 
                  ? "هنا يمكنك إضافة أخبار عاجلة أو توجيهات بخصوص قريتنا عين طبرنق لتظهر فورا بالشريط للمتصفحين."
                  : "Here you can append priority notifications or directives regarding our village Ain Tebournok."}
              </p>

              <form onSubmit={handleAddAnnouncement} className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-1">{lang === "ar" ? "الخبر بالعربية (مطلوب)" : "Arabic text (Required)"}</label>
                    <input
                      type="text"
                      value={newAnnAr}
                      required
                      onChange={(e) => setNewAnnAr(e.target.value)}
                      placeholder="مثال: 📢 اجتماع مع الإدارة الجهوية للبريد الأسبوع المقبل..."
                      className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1 text-xs text-stone-900 focus:outline-none focus:border-emerald-800 text-right font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-1">{lang === "ar" ? "الترجمة للفرنسية (اختياري)" : "French Translate (Optional)"}</label>
                    <input
                      type="text"
                      value={newAnnFr}
                      onChange={(e) => setNewAnnFr(e.target.value)}
                      placeholder="Ex: Réunion programmée avec la direction de Régionale..."
                      className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1 text-xs text-stone-900 focus:outline-none focus:border-emerald-800 text-left font-sans animate-none"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-1">{lang === "ar" ? "الترجمة للإنجليزية (اختياري)" : "English Translate (Optional)"}</label>
                    <input
                      type="text"
                      value={newAnnEn}
                      onChange={(e) => setNewAnnEn(e.target.value)}
                      placeholder="Ex: Upcoming meeting with the Postal Service..."
                      className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1 text-xs text-stone-900 focus:outline-none focus:border-emerald-800 text-left font-sans animate-none"
                      dir="ltr"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[9px] text-stone-400">
                    {lang === "ar" ? "* سيتم ملء اللغات البديلة تلقائياً باللغة العربية إن تركت فارغة." : "* Missing translations fallback automatically to Arabic."}
                  </span>
                  <button
                    type="submit"
                    className="bg-emerald-850 hover:bg-emerald-900 text-white font-black text-[10px] px-4 py-1.5 rounded shadow-sm flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-white" />
                    <span>{lang === "ar" ? "إضافة الخبر" : "Add Announcement"}</span>
                  </button>
                </div>
              </form>

              {/* Existing Announcements List with delete button */}
              <div className="space-y-1.5 pt-1.5">
                <span className="block text-[10px] font-black text-stone-500">{lang === "ar" ? "الأخبار المبثوثة حالياً (انقر لحذف الخبر):" : "Current Active Ticker News (click to remove):"}</span>
                {announcements.length === 0 ? (
                  <div className="text-center p-2 text-[10px] text-stone-400 bg-white/50 border rounded-lg">{lang === "ar" ? "لا توجد أخبار مبثوثة" : "No active news items."}</div>
                ) : (
                  <div className="max-h-[140px] overflow-y-auto space-y-1 bg-white p-2 rounded-xl border border-stone-200">
                    {announcements.map((ann) => (
                      <div key={ann.id} className="flex justify-between items-center text-[10px] bg-stone-50 hover:bg-red-50 hover:border-red-200 p-2 rounded-lg border border-stone-150 transition-all group">
                        <button
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="text-stone-400 group-hover:text-red-600 flex items-center gap-1 font-mono font-bold transition-colors"
                        >
                          <Trash2 className="w-3 h-3 text-stone-400 group-hover:text-red-500" />
                          <span>{lang === "ar" ? "إزالة" : "Remove"}</span>
                        </button>
                        <div className="text-right text-stone-800 font-sans max-w-[80%] truncate">
                          <span className="font-bold text-emerald-950">[{lang === "ar" ? "خبر" : "News"}] </span>
                          <span>{ann.textAr}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Dynamic Navigation Top Bar */}
        <header className={`backdrop-blur-md border-b transition-colors duration-300 relative z-50 ${
          isDarkMode 
            ? "bg-zinc-900/95 border-zinc-800 text-zinc-100" 
            : "bg-white/95 border-stone-200"
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Left side: Logo & Brand, and Hamburger Trigger */}
            <div className="flex items-center justify-between w-full lg:w-auto">
              <div 
                className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
                onClick={() => scrollToSection("admin-console-section")}
              >
                <img
                  src={logoUrl}
                  alt="Ain Tebournok Logo"
                  className="w-12 h-12 rounded-xl object-cover border border-emerald-700/20 shadow-xs shrink-0 bg-stone-50"
                  referrerPolicy="no-referrer"
                />
                <div className="text-right">
                  <span className={`text-sm sm:text-base font-black font-sans tracking-tight block leading-tight ${
                    isDarkMode ? "text-emerald-400" : "text-emerald-950"
                  }`}>
                    {lang === "ar" ? siteTitleAr : lang === "fr" ? siteTitleFr : siteTitleEn}
                  </span>
                  <span className={`text-[9px] sm:text-[10px] block font-bold uppercase tracking-wider ${
                    isDarkMode ? "text-zinc-400" : "text-stone-500"
                  }`}>
                    {lang === "ar" ? siteSloganAr : lang === "fr" ? siteSloganFr : siteSloganEn}
                  </span>
                </div>
              </div>

              {/* Hamburger and Quick Switchers for Mobile Grid */}
              <div className="flex items-center gap-2 lg:hidden">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className={`p-2 rounded-xl border transition-all ${
                    isDarkMode 
                      ? "bg-zinc-800 border-zinc-700 text-zinc-100" 
                      : "bg-stone-100 border-stone-200 text-stone-900"
                  }`}
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Middle Section: Quick Anchor Links in two structured rows for Desktop */}
            <nav className="hidden lg:flex flex-col gap-2 items-end flex-1 max-w-2xl">
              {/* Row 1: الرئيسية - التاريخ والتراث - إذاعة القرية - مجلس القرية - حديث العم مفتاح - رسالة الأهالي */}
              <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-1">
                <button onClick={() => scrollToSection("hero-section")} className="text-xs font-black text-stone-600 dark:text-zinc-400 hover:text-[#006045] dark:hover:text-emerald-400 transition-colors cursor-pointer">
                  {t.navHome}
                </button>
                <button onClick={() => scrollToSection("quick-tab-section")} className="text-xs font-black text-stone-600 dark:text-zinc-400 hover:text-[#006045] dark:hover:text-emerald-400 transition-colors cursor-pointer">
                  {t.navHistory}
                </button>
                <button onClick={() => scrollToSection("council-section")} className="text-xs font-black text-stone-600 dark:text-zinc-400 hover:text-[#006045] dark:hover:text-emerald-400 transition-colors cursor-pointer">
                  {lang === "ar" ? "🏛️ مجلس القرية" : "Village Council"}
                </button>
                <button onClick={() => scrollToSection("chat-section")} className="text-xs font-black text-stone-600 dark:text-zinc-400 hover:text-[#006045] dark:hover:text-emerald-400 transition-colors cursor-pointer">
                  {lang === "ar" ? "💬 حديث العم مفتاح" : "Uncle Meftah Talk"}
                </button>
                <button onClick={() => scrollToSection("appeal-section")} className="text-xs font-black text-stone-600 dark:text-zinc-400 hover:text-[#006045] dark:hover:text-emerald-400 transition-colors cursor-pointer">
                  {t.navAppeal}
                </button>
              </div>

              {/* Row 2: الخريطة التفاعلية - أفراحنا - دائما في قلوبنا - اتصل بنا - صندوق الرسائل (shows only if isAdmin) - تطبيق الجوال - الإشراف */}
              <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-1 border-t border-stone-150 dark:border-zinc-800/60 pt-1.5 w-full">
                <button onClick={() => scrollToSection("interactive-map-section")} className="text-xs font-black text-stone-600 dark:text-zinc-400 hover:text-[#006045] dark:hover:text-emerald-400 transition-colors cursor-pointer">
                  {t.navMap}
                </button>
                <button onClick={() => scrollToSection("joys-section")} className="text-xs font-black text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors cursor-pointer">
                  {lang === "ar" ? "🎉 أفراحنا" : "🎉 Our Joys"}
                </button>
                <button onClick={() => scrollToSection("passed-section")} className="text-xs font-black text-[#5C4033] dark:text-[#EEDC82] hover:text-rose-700 dark:hover:text-rose-400 transition-colors cursor-pointer">
                  {lang === "ar" ? "🕊️ دائما في قلوبنا" : lang === "fr" ? "🕊️ Toujours dans nos cœurs" : "🕊️ Always in our hearts"}
                </button>
                <button onClick={() => scrollToSection("contact-section")} className="text-xs font-black text-emerald-600 dark:text-emerald-400 hover:text-[#006045] dark:hover:text-white transition-colors cursor-pointer">
                  {lang === "ar" ? "📞 اتصل بنا" : "📞 Contact"}
                </button>
                {isAdmin && (
                  <button 
                    onClick={() => setIsInboxOpen(true)} 
                    className="text-xs font-black text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Inbox className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                    <span>{lang === "ar" ? "📬 صندوق الرسائل" : "📬 Inbox"}</span>
                  </button>
                )}
                <button onClick={() => scrollToSection("mobile-deployment-section")} className="text-xs font-black text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors flex items-center gap-1 shrink-0 cursor-pointer">
                  <Smartphone className="w-3.5 h-3.5 shrink-0 text-purple-600" />
                  <span>{lang === "ar" ? "📱 تطبيق الجوال" : "📱 Mobile App"}</span>
                </button>
                <button onClick={() => scrollToSection("admin-console-section")} className="text-xs font-black text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors cursor-pointer">
                  {lang === "ar" ? "🔐 الإشراف" : "🔐 Admin Portal"}
                </button>
              </div>
            </nav>

            {/* Right side controls: theme, clock, language switcher */}
            <div className="flex flex-col sm:flex-row items-center justify-between lg:justify-end gap-3 w-full lg:w-auto border-t lg:border-t-0 border-stone-100 dark:border-zinc-800/80 pt-3 lg:pt-0 shrink-0">
              
              {/* Row 2.1 on small mobile: Stats & Theme Toggle */}
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                {/* Visitors & Online Users (Now fully visible on mobile as well!) */}
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold font-sans transition-all duration-300 bg-stone-50 dark:bg-zinc-950 border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-zinc-300 shadow-2xs">
                  <Eye className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-mono font-black">{visitorCount.toLocaleString()}</span>
                  <span className="text-stone-300 dark:text-zinc-700">|</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-black">{activeUsers} {lang === "ar" ? "نشط" : "online"}</span>
                </div>

                {/* Theme toggle */}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  title={lang === "ar" ? "تبديل المظهر" : "Toggle Theme"}
                  className={`p-2 rounded-xl border transition-all duration-300 flex items-center justify-center shrink-0 cursor-pointer ${
                    isDarkMode 
                      ? "bg-zinc-800 border-zinc-700 text-amber-400 hover:bg-zinc-700" 
                      : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-400 fill-amber-400" /> : <Moon className="w-4 h-4 text-slate-800 fill-slate-800" />}
                </button>
              </div>

              {/* Row 2.1.5 on small mobile: Navigation Mode Switcher */}
              <div className="flex items-center justify-center w-full sm:w-auto shrink-0">
                <div className={`flex rounded-xl p-0.5 border transition-all w-full sm:w-auto justify-between ${
                  isDarkMode 
                    ? "bg-zinc-950 border-zinc-800" 
                    : "bg-stone-50 border-stone-200"
                }`}>
                  <button
                    onClick={() => {
                      setNavigationMode("independent");
                      setActiveSection("hero-section");
                    }}
                    title={lang === "ar" ? "عرض الأقسام كصفحات مستقلة مريحة للقراءة" : "View sections as independent, easy-to-read pages"}
                    className={`flex-1 sm:flex-initial px-2.5 py-1.5 text-[10px] sm:text-[11px] font-black rounded-lg transition-all cursor-pointer text-center flex items-center gap-1 justify-center ${
                      navigationMode === "independent"
                        ? "bg-[#5C4033] text-white shadow-xs font-black"
                        : "text-zinc-800 hover:text-[#5C4033] dark:text-zinc-300 dark:hover:text-[#EEDC82] font-bold"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>{lang === "ar" ? "تصفح مستقل" : lang === "fr" ? "Pages Solo" : "Pages"}</span>
                  </button>
                  <button
                    onClick={() => {
                      setNavigationMode("all");
                    }}
                    title={lang === "ar" ? "عرض الموقع كاملاً في صفحة واحدة ممتدة" : "View the entire website in a single continuous layout"}
                    className={`flex-1 sm:flex-initial px-2.5 py-1.5 text-[10px] sm:text-[11px] font-black rounded-lg transition-all cursor-pointer text-center flex items-center gap-1 justify-center ${
                      navigationMode === "all"
                        ? "bg-[#006045] text-white shadow-xs font-black"
                        : "text-zinc-800 hover:text-[#006045] dark:text-zinc-300 dark:hover:text-emerald-400 font-bold"
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5 shrink-0" />
                    <span>{lang === "ar" ? "الموقع الكامل" : lang === "fr" ? "Tout en Un" : "Continuous"}</span>
                  </button>
                </div>
              </div>

              {/* Row 2.2 on small mobile: Language Switcher */}
              <div className="flex items-center justify-center w-full sm:w-auto shrink-0">
                <div className={`flex rounded-xl p-0.5 border transition-all w-full sm:w-auto justify-between ${
                  isDarkMode 
                    ? "bg-zinc-950 border-zinc-800" 
                    : "bg-stone-50 border-stone-200"
                }`}>
                  {(["ar", "fr", "en"] as Language[]).map((l) => (
                    <button
                      id={`lang-switcher-${l}`}
                      key={l}
                      onClick={() => setLang(l)}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 text-[10px] sm:text-[11px] font-black rounded-lg transition-all uppercase cursor-pointer text-center ${
                        lang === l
                          ? "bg-[#006045] text-white shadow-xs font-black"
                          : "text-zinc-800 hover:text-[#006045] dark:text-zinc-300 dark:hover:text-emerald-400 font-bold"
                      }`}
                    >
                      {l === "ar" ? "العربية" : l.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Mobile Navigation Drawer Dropdown */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-stone-150 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-4 space-y-4 animate-fade-in shadow-lg">
              {/* Row 1: الأقسام الرئيسية */}
              <div className="space-y-2 text-right">
                <p className="text-[10px] font-black uppercase text-stone-400 dark:text-zinc-500 border-b border-stone-100 dark:border-zinc-800 pb-1">
                  {lang === "ar" ? "الأقسام الرئيسية" : "Main Sections"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => scrollToSection("hero-section")} className="p-2.5 text-right text-xs font-black bg-stone-50 hover:bg-stone-100 dark:bg-zinc-950 dark:hover:bg-zinc-800/80 rounded-xl transition-all text-stone-700 dark:text-zinc-300 cursor-pointer">
                    {t.navHome}
                  </button>
                  <button onClick={() => scrollToSection("quick-tab-section")} className="p-2.5 text-right text-xs font-black bg-stone-50 hover:bg-stone-100 dark:bg-zinc-950 dark:hover:bg-zinc-800/80 rounded-xl transition-all text-stone-700 dark:text-zinc-300 cursor-pointer">
                    {t.navHistory}
                  </button>
                  <button onClick={() => scrollToSection("council-section")} className="p-2.5 text-right text-xs font-black bg-stone-50 hover:bg-stone-100 dark:bg-zinc-950 dark:hover:bg-zinc-800/80 rounded-xl transition-all text-stone-700 dark:text-zinc-300 cursor-pointer">
                    {lang === "ar" ? "🏛️ مجلس القرية" : "Village Council"}
                  </button>
                  <button onClick={() => scrollToSection("chat-section")} className="p-2.5 text-right text-xs font-black bg-stone-50 hover:bg-stone-100 dark:bg-zinc-950 dark:hover:bg-zinc-800/80 rounded-xl transition-all text-stone-700 dark:text-zinc-300 cursor-pointer">
                    {lang === "ar" ? "💬 حديث العم مفتاح" : "Uncle Meftah Talk"}
                  </button>
                  <button onClick={() => scrollToSection("appeal-section")} className="p-2.5 text-right text-xs font-black bg-stone-50 hover:bg-stone-100 dark:bg-zinc-950 dark:hover:bg-zinc-800/80 rounded-xl transition-all text-stone-700 dark:text-zinc-300 cursor-pointer">
                    {t.navAppeal}
                  </button>
                </div>
              </div>

              {/* Row 2: المزيد من الخدمات */}
              <div className="space-y-2 text-right">
                <p className="text-[10px] font-black uppercase text-stone-400 dark:text-zinc-500 border-b border-stone-100 dark:border-zinc-800 pb-1">
                  {lang === "ar" ? "المزيد من الخدمات والمزايا" : "More Services"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => scrollToSection("interactive-map-section")} className="p-2.5 text-right text-xs font-black bg-stone-50 hover:bg-stone-100 dark:bg-zinc-950 dark:hover:bg-zinc-800/80 rounded-xl transition-all text-stone-700 dark:text-zinc-300 cursor-pointer">
                    {t.navMap}
                  </button>
                  <button onClick={() => scrollToSection("joys-section")} className="p-2.5 text-right text-xs font-black bg-amber-500/5 hover:bg-amber-500/10 dark:bg-amber-400/5 rounded-xl transition-all text-amber-700 dark:text-amber-400 cursor-pointer">
                    {lang === "ar" ? "🎉 أفراحنا" : "🎉 Our Joys"}
                  </button>
                  <button onClick={() => scrollToSection("passed-section")} className="p-2.5 text-right text-xs font-black bg-rose-500/5 hover:bg-rose-500/10 dark:bg-rose-400/5 rounded-xl transition-all text-rose-700 dark:text-rose-455 cursor-pointer">
                    {lang === "ar" ? "🕊️ دائما في قلوبنا" : "🕊️ In Hearts"}
                  </button>
                  <button onClick={() => scrollToSection("contact-section")} className="p-2.5 text-right text-xs font-black bg-emerald-500/5 hover:bg-emerald-500/10 dark:bg-emerald-400/5 rounded-xl transition-all text-emerald-700 dark:text-emerald-400 cursor-pointer">
                    {lang === "ar" ? "📞 اتصل بنا" : "📞 Contact"}
                  </button>
                  <button onClick={() => scrollToSection("mobile-deployment-section")} className="p-2.5 text-right text-xs font-black bg-purple-500/5 hover:bg-purple-500/10 dark:bg-purple-400/5 rounded-xl transition-all text-purple-700 dark:text-purple-400 cursor-pointer">
                    {lang === "ar" ? "📱 تطبيق الجوال" : "📱 Mobile App"}
                  </button>
                  <button onClick={() => scrollToSection("admin-console-section")} className="p-2.5 text-right text-xs font-black bg-teal-500/5 hover:bg-teal-500/10 dark:bg-teal-400/5 rounded-xl transition-all text-teal-700 dark:text-teal-400 cursor-pointer">
                    {lang === "ar" ? "🔐 الإشراف" : "🔐 Admin Portal"}
                  </button>
                  {isAdmin && (
                    <button 
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsInboxOpen(true);
                      }}
                      className="col-span-2 p-2.5 text-center text-xs font-black bg-blue-500/5 hover:bg-blue-500/10 dark:bg-blue-400/5 rounded-xl transition-all text-blue-700 dark:text-blue-400 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Inbox className="w-4 h-4 text-blue-500" />
                      <span>{lang === "ar" ? "📬 صندوق الرسائل" : "📬 Inbox"}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </header>
      </div>

      {/* Hero Section */}
      {(navigationMode === "all" || activeSection === "hero-section") && (
        <section id="hero-section" className="relative bg-stone-900 text-white overflow-hidden py-16 md:py-24">
          {/* Real landscape photo backdrop */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroCoverUrl}
              alt="Ain Tebournok scenery"
              className="w-full h-full object-cover opacity-65 object-center brightness-[0.80] contrast-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-900/40 to-emerald-950/10" />
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-700 text-[11px] sm:text-xs font-black tracking-wide text-emerald-250 animate-bounce mb-[24px]">
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{t.heroBadge}</span>
            </span>

            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-[#fffa00] font-black heading-display tracking-tight leading-tight">
              {t.heroTitle}
            </h1>

            <p className={`max-w-2xl mx-auto text-stone-300 font-medium transition-all duration-300 ${
              newsReadMode 
                ? "text-base sm:text-lg leading-loose" 
                : "text-sm sm:text-base leading-relaxed"
            }`}>
              {t.heroSubtitle}
            </p>

            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <button
                id="hero-explore-btn"
                onClick={() => scrollToSection("about-section")}
                className="bg-amber-400 hover:bg-amber-500 active:scale-95 text-stone-950 font-black text-xs px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-1.5 focus:outline-none"
              >
                <span>{t.discoverBtn}</span>
                <ChevronLeft className={`w-4 h-4 ${lang !== "ar" ? "rotate-180" : ""}`} />
              </button>
              <button
                id="hero-appeal-btn"
                onClick={() => scrollToSection("appeal-section")}
                className="bg-white/10 hover:bg-white/20 text-white font-black text-xs px-6 py-3 rounded-xl transition-all border border-white/20 flex items-center gap-1.5 focus:outline-none"
              >
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                <span>{t.tabAppealTitle}</span>
              </button>
            </div>
          </div>

          {/* Dynamic Wave separator */}
          <div className={`absolute bottom-0 inset-x-0 h-8 transition-colors duration-300 ${isDarkMode ? "bg-[#191612]" : "bg-[#FAF8F5]"}`} style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }} />
        </section>
      )}

      {/* About Section - Sandstone & Olive Heritage Theme */}
      {(navigationMode === "all" || activeSection === "hero-section" || activeSection === "about-section") && (
        <section 
          id="about-section" 
          style={getSectionBgStyle("about", "").style} 
          className={`py-12 relative ${getSectionBgStyle("about", isDarkMode ? "bg-gradient-to-tr from-zinc-950 via-[#191612] to-zinc-950 text-zinc-100" : "bg-gradient-to-tr from-[#FAF8F5] via-[#F5EFE6] to-[#FAF8F5] text-stone-850").className}`}
        >
          {getSectionBgStyle("about", "").hasOverlay && (
            <div className="absolute inset-0 z-0 pointer-events-none" style={getSectionBgStyle("about", "").overlayStyle} />
          )}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
            <div className={`rounded-3xl p-6 sm:p-10 border shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center transition-colors duration-300 ${
              isDarkMode 
                ? "bg-zinc-900 border-zinc-800 text-zinc-100" 
                : "bg-white border-stone-200"
            }`}>
              
              <div className="md:col-span-7 space-y-4 text-right">
                <span className={`text-[10px] uppercase font-black tracking-widest font-mono block ${isDarkMode ? "text-emerald-400" : "text-emerald-800"}`}>
                  {lang === "ar" ? "قريتنا المنسية في ريف قرنبالية" : "GROMBALIA COMMUNITY PORTAL"}
                </span>
                <h2 className={`text-xl sm:text-2xl font-black ${isDarkMode ? "text-zinc-100" : "text-stone-900"}`}>
                  {t.aboutTitle}
                </h2>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? "text-zinc-350" : "text-stone-600"}`}>
                  {t.aboutText}
                </p>
                
                <div className={`border-r-4 p-3.5 rounded-l-xl text-xs font-bold leading-relaxed transition-colors duration-300 ${
                  isDarkMode 
                    ? "bg-emerald-950/40 border-emerald-500 text-emerald-250" 
                    : "bg-emerald-50 border-emerald-800 text-emerald-950"
                }`}>
                  {t.aboutHighlight}
                </div>
              </div>

              <div className="md:col-span-5 relative">
                <img
                  src="/images/regenerated_image_1782205001341.png"
                  alt="Green Tebournok paths"
                  className="rounded-2xl shadow-md border border-stone-100 object-cover h-64 w-full"
                />
                <div className="absolute -bottom-3 -left-3 bg-amber-400 text-stone-950 font-mono text-[10px] font-black px-3 py-1.5 rounded-lg shadow-sm">
                  9 KM TO GROMBALIA
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* ========================================== */}
      {/* Detailed News Section (أخبار البلدة بالتفصيل) - Emerald Bulletin Theme */}
      {(navigationMode === "all" || activeSection === "hero-section" || activeSection === "news-section") && (
        <section 
          id="news-section" 
          style={getSectionBgStyle("news", "").style} 
          className={`py-12 border-t relative ${getSectionBgStyle("news", isDarkMode ? "bg-gradient-to-b from-[#091E16] via-zinc-950 to-[#0A2219] border-zinc-800 text-zinc-100" : "bg-gradient-to-b from-[#EDF5F1] via-white to-[#EDF5F1] border-stone-200 text-stone-850").className}`}
        >
        {getSectionBgStyle("news", "").hasOverlay && (
          <div className="absolute inset-0 z-0 pointer-events-none" style={getSectionBgStyle("news", "").overlayStyle} />
        )}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-10">
            <span className={`text-[10px] uppercase font-black tracking-widest font-mono px-3 py-1 rounded-full ${
              isDarkMode ? "bg-emerald-950/50 text-emerald-400" : "bg-emerald-50 text-emerald-800"
            }`}>
              {lang === "ar" ? "الجريدة الرسمية لعين طبرنق" : "Official Village Bulletin"}
            </span>
            <h2 className={`text-xl sm:text-2xl font-black mt-3 ${isDarkMode ? "text-zinc-100" : "text-stone-900"}`}>
              {lang === "ar" ? "📰 أخبار القرية بالتفصيل" : "📰 Detailed Village News"}
            </h2>
            <p className={`text-xs mt-1.5 ${isDarkMode ? "text-zinc-400" : "text-stone-500"}`}>
              {lang === "ar" 
                ? "تغطية شاملة ومباشرة لكافة الأحداث التنموية والاجتماعية والثقافية بعين طبرنق" 
                : "Comprehensive coverage of developmental, social, and cultural events in Ain Tebournok"}
            </p>
          </div>

          {/* Read Mode Toggle Banner */}
          <div className="flex justify-center mb-8">
            <button
              type="button"
              onClick={() => setNewsReadMode(!newsReadMode)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all duration-300 border ${
                newsReadMode
                  ? "bg-amber-100 border-amber-300 text-amber-950 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-100 shadow-md scale-105"
                  : isDarkMode
                  ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white"
                  : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
              }`}
            >
              <BookOpen className={`w-4 h-4 ${newsReadMode ? "animate-pulse text-amber-700 dark:text-amber-400" : "text-stone-500"}`} />
              <span>
                {newsReadMode
                  ? (lang === "ar" ? "📖 إلغاء وضع القراءة المريح" : "📖 Disable Comfort Read Mode")
                  : (lang === "ar" ? "👓 تفعيل وضع القراءة المريح (تكبير الخط وتباعد الأسطر)" : "👓 Enable Comfortable Read Mode (Large Fonts & Sepia Glow)")}
              </span>
            </button>
          </div>

          {/* Admin-only Add News Form */}
          {isAdmin && (
            <div className={`mb-10 p-5 sm:p-6 rounded-3xl border text-right transition-all ${
              isDarkMode ? "bg-zinc-950 border-zinc-800" : "bg-emerald-50/20 border-emerald-100"
            }`}>
              <h3 className="text-sm font-black text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5 justify-end mb-4">
                <Plus className="w-4 h-4" />
                <span>{lang === "ar" ? "إضافة خبر جديد (خاص بالمشرفين)" : "Publish New News Item (Admin Only)"}</span>
              </h3>

              <form onSubmit={handleAddNews} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 dark:text-zinc-400 mb-1">
                      {lang === "ar" ? "العنوان بالعربية (مطلوب)" : "Arabic Title (Required)"}
                    </label>
                    <input
                      type="text"
                      required
                      value={newNewsTitleAr}
                      onChange={(e) => setNewNewsTitleAr(e.target.value)}
                      placeholder="مثال: انطلاق القافلة الصحية السنوية..."
                      className="w-full bg-white dark:bg-zinc-900 border border-stone-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-stone-950 dark:text-zinc-150 focus:outline-none focus:border-emerald-800 text-right font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 dark:text-zinc-400 mb-1">
                      {lang === "ar" ? "العنوان بالفرنسية (اختياري)" : "French Title (Optional)"}
                    </label>
                    <input
                      type="text"
                      value={newNewsTitleFr}
                      onChange={(e) => setNewNewsTitleFr(e.target.value)}
                      placeholder="Ex: Lancement de la caravane médicale..."
                      className="w-full bg-white dark:bg-zinc-900 border border-stone-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-stone-950 dark:text-zinc-150 focus:outline-none focus:border-emerald-800 text-left font-sans"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 dark:text-zinc-400 mb-1">
                      {lang === "ar" ? "العنوان بالإنجليزية (اختياري)" : "English Title (Optional)"}
                    </label>
                    <input
                      type="text"
                      value={newNewsTitleEn}
                      onChange={(e) => setNewNewsTitleEn(e.target.value)}
                      placeholder="Ex: Launch of the medical caravan..."
                      className="w-full bg-white dark:bg-zinc-900 border border-stone-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-stone-950 dark:text-zinc-150 focus:outline-none focus:border-emerald-800 text-left font-sans"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 dark:text-zinc-400 mb-1">
                      {lang === "ar" ? "التفاصيل بالعربية (مطلوب)" : "Arabic Details (Required)"}
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={newNewsContentAr}
                      onChange={(e) => setNewNewsContentAr(e.target.value)}
                      placeholder="اكتب تفاصيل الخبر هنا..."
                      className="w-full bg-white dark:bg-zinc-900 border border-stone-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-stone-950 dark:text-zinc-150 focus:outline-none focus:border-emerald-800 text-right font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 dark:text-zinc-400 mb-1">
                      {lang === "ar" ? "التفاصيل بالفرنسية (اختياري)" : "French Details (Optional)"}
                    </label>
                    <textarea
                      rows={3}
                      value={newNewsContentFr}
                      onChange={(e) => setNewNewsContentFr(e.target.value)}
                      placeholder="Ex: Détails de l'article..."
                      className="w-full bg-white dark:bg-zinc-900 border border-stone-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-stone-950 dark:text-zinc-150 focus:outline-none focus:border-emerald-800 text-left font-sans"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 dark:text-zinc-400 mb-1">
                      {lang === "ar" ? "التفاصيل بالإنجليزية (اختياري)" : "English Details (Optional)"}
                    </label>
                    <textarea
                      rows={3}
                      value={newNewsContentEn}
                      onChange={(e) => setNewNewsContentEn(e.target.value)}
                      placeholder="Ex: Details of the news item..."
                      className="w-full bg-white dark:bg-zinc-900 border border-stone-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-stone-950 dark:text-zinc-150 focus:outline-none focus:border-emerald-800 text-left font-sans"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* News Image Upload & drag drop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 dark:text-zinc-400 mb-1">
                      {lang === "ar" ? "رابط الصورة (اختياري)" : "Image Link (Optional)"}
                    </label>
                    <input
                      type="text"
                      value={newNewsImageUrl}
                      onChange={(e) => setNewNewsImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-white dark:bg-zinc-900 border border-stone-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-stone-950 dark:text-zinc-150 focus:outline-none focus:border-emerald-800 text-left font-sans"
                      dir="ltr"
                    />
                  </div>
                  
                  <div>
                    <span className="block text-[11px] font-bold text-stone-600 dark:text-zinc-400 mb-1">
                      {lang === "ar" ? "أو تحميل ملف صورة مباشرة" : "Or upload an image file directly"}
                    </span>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setNewNewsDragActive(true); }}
                      onDragLeave={() => setNewNewsDragActive(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setNewNewsDragActive(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleNewsFileChange(e.dataTransfer.files[0]);
                        }
                      }}
                      className={`border-2 border-dashed rounded-xl p-3.5 text-center transition-all ${
                        newNewsFileBase64 
                          ? "border-emerald-600 bg-emerald-50/10" 
                          : newNewsDragActive 
                            ? "border-emerald-500 bg-stone-50" 
                            : "border-stone-300 dark:border-zinc-800"
                      }`}
                    >
                      <input
                        id="news-image-uploader"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleNewsFileChange(e.target.files[0]);
                          }
                        }}
                      />
                      <label htmlFor="news-image-uploader" className="cursor-pointer text-[10px] text-stone-500 flex flex-col items-center gap-1">
                        <UploadCloud className="w-5 h-5 text-stone-400" />
                        {newNewsFileBase64 ? (
                          <span className="text-emerald-600 font-bold">{lang === "ar" ? "✓ تم تجهيز الصورة بنجاح" : "✓ Image ready"}</span>
                        ) : (
                          <span>{lang === "ar" ? "اسحب الصورة هنا أو اضغط للاختيار" : "Drag image here or click to choose"}</span>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-white" />
                    <span>{lang === "ar" ? "نشر الخبر وتحديث شريط الأخبار العاجلة" : "Publish News & Update Ticker"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* News List Grid */}
          {newsList.length === 0 ? (
            <div className="text-center py-12 bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-3xl">
              <p className="text-xs text-stone-400 font-bold">{lang === "ar" ? "لا توجد أخبار مفصلة منشورة حالياً." : "No news items published currently."}</p>
            </div>
          ) : (
            <div className={newsReadMode ? "grid grid-cols-1 gap-8 max-w-3xl mx-auto" : "grid grid-cols-1 md:grid-cols-2 gap-6"}>
              {newsList.map((item) => {
                // Select locale translations
                const title = lang === "ar" ? item.titleAr : lang === "fr" ? item.titleFr : item.titleEn;
                const content = lang === "ar" ? item.contentAr : lang === "fr" ? item.contentFr : item.contentEn;
                const formattedDate = new Date(item.date).toLocaleDateString(
                  lang === "ar" ? "ar-TN" : lang === "fr" ? "fr-FR" : "en-US",
                  { year: "numeric", month: "long", day: "numeric" }
                );

                return (
                  <div 
                    key={item.id} 
                    className={`rounded-3xl border shadow-xs overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-stone-300 dark:hover:border-zinc-700 ${
                      newsReadMode
                        ? isDarkMode
                          ? "bg-stone-900/80 border-amber-900/30 text-amber-50 shadow-lg"
                          : "bg-[#FDF9F3] border-amber-900/15 text-stone-900 shadow-md"
                        : isDarkMode
                        ? "bg-zinc-950 border-zinc-850"
                        : "bg-white border-stone-200"
                    }`}
                  >
                    <div>
                      {/* Image header */}
                      <div className={`relative bg-stone-100 dark:bg-zinc-900 overflow-hidden transition-all duration-300 ${newsReadMode ? "h-64 sm:h-80" : "h-44"}`}>
                        <img 
                          src={item.imageUrl || "/images/regenerated_image_1782205001341.png"} 
                          alt={title}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 right-3 bg-emerald-800 text-white font-mono text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                          {lang === "ar" ? "أخبار عين طبرنق" : "Village News"}
                        </div>
                      </div>

                      <div className="p-5 text-right space-y-3">
                        <div className="flex items-center justify-between text-[10px] text-stone-400 dark:text-zinc-500 font-sans">
                          <span className="font-mono">{formattedDate}</span>
                          <span className="bg-stone-100 dark:bg-zinc-900 px-2 py-0.5 rounded text-stone-500 font-bold">{lang === "ar" ? "الإدارة" : "Official"}</span>
                        </div>
                        <h4 className={`font-black tracking-tight leading-snug ${
                          newsReadMode 
                            ? "text-xl sm:text-2xl md:text-3xl text-amber-950 dark:text-amber-400 font-serif" 
                            : `text-sm ${isDarkMode ? "text-zinc-100" : "text-stone-900"}`
                        }`}>
                          {title}
                        </h4>
                        <p className={`whitespace-pre-wrap ${
                          newsReadMode
                            ? "text-sm sm:text-base md:text-lg leading-loose font-sans font-medium text-stone-800 dark:text-zinc-200"
                            : "text-[11px] leading-relaxed dark:text-zinc-400 text-stone-600 line-clamp-4"
                        }`}>
                          {content}
                        </p>
                      </div>
                    </div>

                    {/* Social Share Footer */}
                    <div className="px-5 pb-3 pt-2.5 flex justify-between items-center border-t border-stone-100/60 dark:border-zinc-900/40">
                      <span className="text-[10px] text-stone-400 dark:text-zinc-500 font-bold">{lang === "ar" ? "شارك هذا الخبر:" : "Share:"}</span>
                      <ShareButtons 
                        title={title}
                        text={content}
                        url={`${window.location.origin}/#news-section`}
                        lang={lang}
                      />
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && (
                      <div className="px-5 pb-4 pt-1 flex justify-between items-center border-t border-stone-100 dark:border-zinc-850">
                        <button
                          onClick={() => handleDeleteNews(item.id)}
                          className="text-red-500 hover:text-red-700 font-bold text-[10px] flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          <span>{lang === "ar" ? "إزالة الخبر" : "Remove item"}</span>
                        </button>
                        <span className="text-[9px] text-stone-400 font-mono">ID: {item.id}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
      )}

      {/* Styled Grid for Quick tabs: History, Mountain, Dam, Photo walls - Mountain Limestone & Blue Spring Theme */}
      {(navigationMode === "all" || activeSection === "quick-tab-section") && (
        <section 
          id="quick-tab-section" 
          style={getSectionBgStyle("quick-tab", "").style} 
          className={`py-12 border-y relative ${getSectionBgStyle("quick-tab", isDarkMode ? "bg-gradient-to-br from-[#0F1821] via-zinc-950 to-[#0C141D] border-zinc-850" : "bg-gradient-to-br from-[#F3F7FA] via-[#E9F0F4] to-[#F3F7FA] border-stone-200").className}`}
        >
        {getSectionBgStyle("quick-tab", "").hasOverlay && (
          <div className="absolute inset-0 z-0 pointer-events-none" style={getSectionBgStyle("quick-tab", "").overlayStyle} />
        )}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          
          {/* Section heading */}
          <div className="text-center mb-8">
            <h2 className={`text-lg sm:text-xl font-black uppercase ${isDarkMode ? "text-zinc-100" : "text-stone-900"}`}>
              {lang === "ar" ? "الأقسام التي تظهر مباشرة تحت الصورة" : "Explore Quick Portals"}
            </h2>
            <p className={`text-xs mt-1 ${isDarkMode ? "text-zinc-400" : "text-stone-500"}`}>
              {lang === "ar" ? "اضغط على الأزرار للتنقل السلس واستكشاف موروث ومعالم عين طبرنق" : "Click below to review archaeological, environmental and social dimensions"}
            </p>
          </div>

          {/* Symmetrical tab selectors bar */}
          <div className={`flex p-1.5 rounded-2xl gap-1 mb-6 max-w-4xl mx-auto overflow-x-auto justify-start sm:justify-center border transition-all duration-300 ${
            isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-stone-200/50 border-transparent"
          }`}>
            {[
              { id: "history", icon: <BookOpen className="w-3.5 h-3.5" />, title: t.tabHistoryTitle },
              { id: "hiking", icon: <Compass className="w-3.5 h-3.5" />, title: t.tabHikingTitle },
              { id: "dam", icon: <Sprout className="w-3.5 h-3.5" />, title: t.tabDamTitle },
              { id: "gallery", icon: <Compass className="w-3.5 h-3.5" />, title: t.tabGalleryTitle }
            ].map((tab) => (
              <button
                id={`quick-tab-${tab.id}`}
                key={tab.id}
                onClick={() => setActiveQuickTab(tab.id)}
                className={`py-2 px-3.5 rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center gap-1.5 shrink-0 outline-none focus:outline-none ${
                  activeQuickTab === tab.id 
                    ? "bg-emerald-850 text-white shadow-sm" 
                    : isDarkMode
                    ? "text-zinc-400 hover:text-white"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {tab.icon}
                <span>{tab.title}</span>
              </button>
            ))}
          </div>

          {/* Quick tab view panel viewport */}
          <div className={`rounded-3xl border p-5 md:p-8 shadow-sm text-right min-h-[300px] flex flex-col justify-between transition-all duration-300 ${
            historyReadMode
              ? isDarkMode
                ? "bg-stone-900/80 border-amber-900/30 text-amber-50 shadow-lg"
                : "bg-[#FDF9F3] border-amber-900/15 text-stone-900 shadow-md"
              : isDarkMode 
              ? "bg-zinc-900 border-zinc-800 text-zinc-100" 
              : "bg-white border-stone-250"
          }`}>
            
            {activeQuickTab === "history" && (
              <div className="space-y-5 animate-fade-in">
                <div className={`border-b pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                  isDarkMode ? "border-zinc-800" : "border-stone-150"
                }`}>
                  <button
                    type="button"
                    onClick={() => setHistoryReadMode(!historyReadMode)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1.5 transition-all duration-300 border ${
                      historyReadMode
                        ? "bg-amber-100 border-amber-300 text-amber-950 dark:bg-amber-950 dark:border-amber-900 dark:text-amber-100"
                        : isDarkMode
                        ? "bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200"
                        : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>
                      {historyReadMode
                        ? (lang === "ar" ? "📖 الخط الافتراضي" : "📖 Normal Font")
                        : (lang === "ar" ? "👓 خط القراءة المريح" : "👓 Comfort Read Mode")}
                    </span>
                  </button>
                  <div className="text-right">
                    <h3 className={`font-black ${historyReadMode ? "text-lg sm:text-xl font-serif text-amber-950 dark:text-amber-400" : "text-sm sm:text-base"}`}>
                      🏛️ {lang === "ar" ? "المدينة الأثرية وعجائب الحضارة" : "The Roman forum, Capitole & baths"}
                    </h3>
                    <p className={`text-[10px] mt-0.5 ${isDarkMode ? "text-zinc-400" : "text-stone-500"}`}>
                      {lang === "ar" ? "نضالات وتاريخ يمتد لآلاف السنين" : "Centuries of rich Phoenician and Byzantine heritage"}
                    </p>
                  </div>
                </div>
                
                <p className={`${
                  historyReadMode
                    ? "text-sm sm:text-base md:text-lg leading-loose font-sans font-medium text-stone-800 dark:text-zinc-200"
                    : "text-xs leading-relaxed text-stone-700 dark:text-zinc-300"
                } whitespace-pre-line`}>
                  {lang === "ar" ? (
                    `تحتوي قرية عين طبرنق على ثروات أثرية فريدة مصنفة ومحمية قانونياً في البلاد التونسية. 
                    شيد هذا الموقع الخلاب في البداية بعهد الفينيقيين والقرطاجيين، ثم بلغ قمة مجده في العهد الروماني (القرن الأول ميلادي).
                    
                    أبرز المعالم التي ما زالت قائمة بين الحشائش:
                    • الكابيتول الروماني والمعبد الشامخ.
                    • قوس النصر المنتصب.
                    • عين الماء الجوفية التي تسري حتى اليوم.
                    • بقايا الحصن البيزنطي المتين.
                    • المسجد الإسلامي القديم المبني فوق قمة تلة العيون المنسابة.
                    
                    هذه المعالم الفريدة تعبر عن عبقرية هندسية استثنائية بفن استخراج وتوجيه مياه الينابيع النادرة.`
                  ) : (
                    `Ain Tebournok's historic site is one of Cap Bon's most beautiful archaeological remnants. 
                    Dating back to the Punic Era in the 1st millennium BC, it flourished during the Roman Empire.
                    
                    Its main features:
                    • Symmetrical Roman Forum and the main Capitol.
                    • The Arch of Triumph.
                    • The Byzantine defensive fortress overlooking natural basins.
                    • Some of the oldest thermal Roman baths recorded in North Africa.
                    • An ancient Islamic mosque erected above the sweet mountain springs.`
                  )}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                  <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200 text-xs">
                    <span className="font-mono text-amber-950 font-black block text-sm">القرن الأول م</span>
                    <span className="text-[10px] text-stone-500 block mt-0.5">{lang === "ar" ? "عصر الإمباطورية الرومانية" : "First century AD"}</span>
                  </div>
                  <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200 text-xs">
                    <span className="font-mono text-amber-950 font-black block text-sm">حصن بيزنطي</span>
                    <span className="text-[10px] text-stone-500 block mt-0.5">{lang === "ar" ? "حماية عسكرية عتيقة" : "Byzantine heavy military fort"}</span>
                  </div>
                  <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200 text-xs">
                    <span className="font-mono text-amber-950 font-black block text-sm">مسجد التلة</span>
                    <span className="text-[10px] text-stone-500 block mt-0.5">{lang === "ar" ? "إعمار إسلامي مبكر" : "Early Islamic presence"}</span>
                  </div>
                </div>
              </div>
            )}

            {activeQuickTab === "hiking" && (
              <div className="space-y-5 animate-fade-in">
                <div className={`border-b pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                  isDarkMode ? "border-zinc-800" : "border-stone-150"
                }`}>
                  <button
                    type="button"
                    onClick={() => setHistoryReadMode(!historyReadMode)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1.5 transition-all duration-300 border ${
                      historyReadMode
                        ? "bg-amber-100 border-amber-300 text-amber-950 dark:bg-amber-950 dark:border-amber-900 dark:text-amber-100"
                        : isDarkMode
                        ? "bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200"
                        : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>
                      {historyReadMode
                        ? (lang === "ar" ? "📖 الخط الافتراضي" : "📖 Normal Font")
                        : (lang === "ar" ? "👓 خط القراءة المريح" : "👓 Comfort Read Mode")}
                    </span>
                  </button>
                  <div className="text-right">
                    <h3 className={`font-black ${historyReadMode ? "text-lg sm:text-xl font-serif text-amber-950 dark:text-amber-400" : "text-sm sm:text-base text-stone-900 dark:text-zinc-100"}`}>
                      🌲 {lang === "ar" ? "السياحة الجبلية وممرات الصعود" : "Grombalia Mountains & Hiking Trails"}
                    </h3>
                    <p className={`text-[10px] mt-0.5 ${isDarkMode ? "text-zinc-400" : "text-stone-500"}`}>
                      {lang === "ar" ? "جبل الهباليل ونسمات البلوط العذبة" : "High clean atmosphere of the forgotten ridges"}
                    </p>
                  </div>
                </div>
                
                <p className={`${
                  historyReadMode
                    ? "text-sm sm:text-base md:text-lg leading-loose font-sans font-medium text-stone-800 dark:text-zinc-200"
                    : "text-xs leading-relaxed text-stone-700 dark:text-zinc-300"
                } whitespace-pre-line`}>
                  {lang === "ar" ? (
                    `تتميز عين طبرنق بموقع جغرافي ساحر يقع كحلقة وصل وتلاقي بين جبال تونسية مهيبة أهمها جبل الهباليل الخلاب.` +
                    `أصبحت المنطقة مؤخراً قبلة مفضلة للمجموعات الشبابية وعشاق السياحة البديلة والهاربين من تلوث المدن المعاصرة.\n\n` +
                    `هذه الممرات الطبيعية توفر دخلاً إضافياً لشباب المنطقة، ولكنها تنتظر بلهفة قرار بلدياً وإدارياً رسمياً لإنشاء 'مسلك سياحي بيئي معتمد' لفتح مساكن ضيافة وتسهيل وصول زوار الطبيعة إليها بسلام دون معرقلات.`
                  ) : (
                    `Surrounded by breathtaking cliffs, Jebel El Hbalil offers some of the most scenic views of Cap Bon's countryside.
                    These routes attract hundreds of domestic ecotourists and trekkers weekly, providing a highly needed sustainable income for the local youth.`
                  )}
                </p>

                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 flex flex-col sm:flex-row justify-between items-center text-xs">
                  <span className="text-[10px] text-stone-500 font-bold leading-normal mb-1 sm:mb-0 text-center sm:text-right">
                    {lang === "ar" ? "تمتاز القرية بالمسالك الفلاحية الصالحة لمشي المغامرين وتصوير المنحدرات" : "Rural trails require local guides for safe navigation and community help"}
                  </span>
                  <span className="bg-emerald-900 text-white font-mono font-black text-[10px] py-1 px-3.5 rounded-lg shrink-0">
                    {lang === "ar" ? "مسلك معزول" : "Eco-Tourism Zone"}
                  </span>
                </div>

                {/* Integration of Mount Ecotourism Live Barometer Widget */}
                <div className="pt-2">
                  <WeatherWidget lang={lang} isDarkMode={isDarkMode} />
                </div>
              </div>
            )}

            {activeQuickTab === "dam" && (
              <div className="space-y-5 animate-fade-in">
                <div className={`border-b pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                  isDarkMode ? "border-zinc-800" : "border-stone-150"
                }`}>
                  <button
                    type="button"
                    onClick={() => setHistoryReadMode(!historyReadMode)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1.5 transition-all duration-300 border ${
                      historyReadMode
                        ? "bg-amber-100 border-amber-300 text-amber-950 dark:bg-amber-950 dark:border-amber-900 dark:text-amber-100"
                        : isDarkMode
                        ? "bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200"
                        : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>
                      {historyReadMode
                        ? (lang === "ar" ? "📖 الخط الافتراضي" : "📖 Normal Font")
                        : (lang === "ar" ? "👓 خط القراءة المريح" : "👓 Comfort Read Mode")}
                    </span>
                  </button>
                  <div className="text-right">
                    <h3 className={`font-black ${historyReadMode ? "text-lg sm:text-xl font-serif text-amber-950 dark:text-amber-400" : "text-sm sm:text-base text-stone-900 dark:text-zinc-100"}`}>
                      💧 {lang === "ar" ? "سد المصري الأنيق وذخائر الري" : "Barrage El Masri - Water Reservoir"}
                    </h3>
                    <p className={`text-[10px] mt-0.5 ${isDarkMode ? "text-zinc-400" : "text-stone-500"}`}>
                      {lang === "ar" ? "مسطح مائي بمساحة 95 هكتار وبناء 1968" : "Constructed in 1968 near Grombalia olives"}
                    </p>
                  </div>
                </div>
                
                <p className={`${
                  historyReadMode
                    ? "text-sm sm:text-base md:text-lg leading-loose font-sans font-medium text-stone-800 dark:text-zinc-200"
                    : "text-xs text-stone-700 dark:text-zinc-300 leading-relaxed"
                } whitespace-pre-line`}>
                  {lang === "ar" ? (
                    `يبعد سد المصري عن وسط القرية مسافة 1.5 كيلومتر فقط، وهو تحفة مائية حيوية شيدت عام 1968 بقرار سيادي لاستغلال مياه الأودية المحلية.
                    
                    حقائق هامة:
                    • المساحة الكلية: 95 هكتاراً.
                    • ارتفاع الحاجز الترابي: 38 متراً بمسار طول 290 متراً.
                    • الطاقة التخزينية: أكثر من 5.7 مليون متر مكعب من المياه العذبة.
                    
                    رغم تواجده ترابياً بموطن عين طبرنق، إلا أن مزارع القرية محرومة ولحد اللحظة من 'منطقة سقوية حقيقية'، حيث يتم توجيه كامل مياه السد لري المناطق المجاورة، وهناك مطالب بإعطاء الأولوية للقرية لدعم الفلاحين المحليين الصامدين.`
                  ) : (
                    `Located 1.5km from the village core, Barrage El Masri is a scenic lake spanning 95 hectares.
                    
                    Key details:
                    • Established: 1968.
                    • Max capacity: 5.7 million cubic meters of high quality mountain runoff water.
                    • Length of barrier: 290m at an elvation of 38m.
                    
                    Irony of resources: While the dam is situated within Ain Tebournok's lands and fed by its rivers, the water is utilized downstream in other regional sectors, leaving Ain Tebournok farmers without modern irrigational supplies.`
                  )}
                </p>

                <div className="p-3 bg-blue-50 text-blue-950 rounded-xl border border-blue-200 text-xs flex justify-between items-center">
                  <span className="font-mono font-black text-sm text-blue-900">5,780,000 m³</span>
                  <span className="text-[10px] text-blue-800 font-bold">{lang === "ar" ? "سعة تخزينية كلية" : "Max holding capacity"}</span>
                </div>
              </div>
            )}

            {activeQuickTab === "gallery" && (
              <div className="space-y-6 animate-fade-in">
                {/* Admin Status Header & Trigger */}
                <div className="flex flex-col sm:flex-row justify-between items-center bg-stone-50 p-4 rounded-2xl border border-stone-200 gap-3">
                  <div className="text-right w-full sm:w-auto">
                    {isAdmin ? (
                      <div className="flex items-center gap-2 text-emerald-850 text-xs font-black justify-end">
                        <Unlock className="w-4 h-4 text-emerald-700" />
                        <span>{lang === "ar" ? "🔓 وضع الإشراف نشط باللوحة الأمنية المشتركة" : "Unified Admin Mode Active via Console"}</span>
                      </div>
                    ) : (
                      <div className="text-stone-500 text-xs">
                        {lang === "ar" ? "🔒 وضع المشرفين مغلق. يسمح للأدمين فقط بإضافة وحذف صور وتصنيفها." : "Admin space is locked. Only administrators are permitted to add and categorize photos."}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 flex gap-2 w-full sm:w-auto justify-end">
                    {!isAdmin && (
                      <button
                        onClick={() => {
                          document.getElementById("admin-console-section")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="px-3 py-1.5 rounded-xl text-[10px] font-black bg-emerald-900 hover:bg-emerald-950 text-white transition-all flex items-center gap-1.5 shadow-xs border border-emerald-950 cursor-pointer"
                      >
                        <Lock className="w-3 h-3" />
                        <span>{lang === "ar" ? "تفعيل الصلاحيات من اللوحة المشتركة 🔑" : "Unlock via Consolidated Console 🔑"}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* File Upload Form (Visible only to Admin) */}
                {isAdmin && (
                  <form onSubmit={handleAddPhotoSubmit} className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 space-y-4 text-right">
                    <h4 className="text-xs font-black text-emerald-950 border-b border-emerald-100 pb-2">
                      {lang === "ar" ? "📥 إضافة صورة جديدة للمعرض" : "Add New Classified Photo"}
                    </h4>

                    {/* Drag and Drop File Selector */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-stone-600">
                          {lang === "ar" ? "تحميل صورة مباشرة أو سحبها وإفلاتها" : "Direct file upload / drag-and-drop"}
                        </label>
                        <div
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                            dragActive ? "border-emerald-700 bg-emerald-50" : "border-stone-250 bg-white"
                          }`}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileInputChange}
                            className="hidden"
                            id="admin-photo-file-picker"
                          />
                          <label htmlFor="admin-photo-file-picker" className="cursor-pointer space-y-1 block">
                            <UploadCloud className="w-6 h-6 text-stone-400 mx-auto" />
                            <div className="text-[10px] font-semibold text-stone-600">
                              {selectedFileBase64 ? (
                                <span className="text-emerald-700 font-bold">{lang === "ar" ? "✅ تم تحميل الملف بنجاح" : "File selected successfully"}</span>
                              ) : (
                                <span>{lang === "ar" ? "اضغط هنا لاختيار ملف أو اسحبه هنا" : "Click to browse or drop image here"}</span>
                              )}
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-stone-600">
                          {lang === "ar" ? "أو ضع رابط الصورة المباشر هنا (URL)" : "Or paste a direct Image URL source"}
                        </label>
                        <input
                          type="text"
                          value={photoUrlInput}
                          onChange={(e) => setPhotoUrlInput(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="w-full text-xs p-3.5 border border-stone-250 bg-white rounded-xl text-left font-mono focus:outline-none focus:ring-1 focus:ring-emerald-800"
                          disabled={!!selectedFileBase64}
                        />
                        <p className="text-[9px] text-stone-400">
                          {lang === "ar" ? "ملاحظة: حقل الملف له الأولوية في حال تفعيله." : "Note: file attachment takes priority if supplied."}
                        </p>
                      </div>
                    </div>

                    {/* Captions and Categories */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-stone-600">
                          {lang === "ar" ? "تصنيف فئة الصورة" : "Select Photo Classification Category"}
                        </label>
                        <select
                          value={newPhotoCategory}
                          onChange={(e) => setNewPhotoCategory(e.target.value)}
                          className="w-full text-xs p-3.5 border border-stone-250 bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-800 text-right"
                        >
                          <option value="heritage">{lang === "ar" ? "🏛️ الآثار التاريخية" : "Patrimoine"}</option>
                          <option value="nature">{lang === "ar" ? "💧 سد المصري والطبيعة" : "Barrage Masri"}</option>
                          <option value="camping">{lang === "ar" ? "⛺ التخييم والمغامرة" : "Camping & Rando"}</option>
                          <option value="food">{lang === "ar" ? "🥘 الأكلات التقليدية" : "Art Culinaire"}</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-stone-600">
                          {lang === "ar" ? "التعليق بالعربية" : "Arabic Caption"}
                        </label>
                        <input
                          type="text"
                          required
                          value={newPhotoCaptionAr}
                          onChange={(e) => setNewPhotoCaptionAr(e.target.value)}
                          placeholder="مثال: قوس النصر الروماني الشامخ"
                          className="w-full text-xs p-3.5 border border-stone-250 bg-white rounded-xl focus:outline-none text-right"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-stone-600">
                          {lang === "ar" ? "التعليق بالفرنسية" : "French Caption"}
                        </label>
                        <input
                          type="text"
                          value={newPhotoCaptionFr}
                          onChange={(e) => setNewPhotoCaptionFr(e.target.value)}
                          placeholder="Ex: L'arc romain de triomphe"
                          className="w-full text-xs p-3.5 border border-stone-250 bg-white rounded-xl focus:outline-none text-left"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-stone-600">
                          {lang === "ar" ? "التعليق بالإنجليزية" : "English Caption"}
                        </label>
                        <input
                          type="text"
                          value={newPhotoCaptionEn}
                          onChange={(e) => setNewPhotoCaptionEn(e.target.value)}
                          placeholder="Ex: The Roman triumphal arch"
                          className="w-full text-xs p-3.5 border border-stone-250 bg-white rounded-xl focus:outline-none text-left"
                        />
                      </div>
                    </div>

                    <div className="flex justify-start pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-900 hover:bg-emerald-950 text-white transition-all shadow-xs"
                      >
                        {lang === "ar" ? "حفظ وإضافة الصورة بنجاح 🚀" : "Add Photo & Publish"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Horizontal tags filter bar */}
                <div className="flex flex-wrap gap-2 justify-start sm:justify-end border-b border-stone-200 pb-4">
                  {[
                    { id: "all", ar: "🏷️ الكل", fr: "🏷️ Tout", en: "🏷️ All" },
                    { id: "heritage", ar: "🏛️ الآثار التاريخية", fr: "🏛️ Patrimoine", en: "🏛️ Ruins" },
                    { id: "nature", ar: "💧 سد المصري", fr: "💧 Barrage Masri", en: "💧 Lake & Dam" },
                    { id: "camping", ar: "⛺ التخييم والمغامرة", fr: "⛺ Camping & Rando", en: "⛺ Camping" },
                    { id: "food", ar: "🥘 الأكلات التقليدية", fr: "🥘 Art Culinaire", en: "🥘 Gastronomy" }
                  ].map((filter) => (
                    <button
                      id={`gallery-filter-${filter.id}`}
                      key={filter.id}
                      onClick={() => setGalleryFilter(filter.id)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-all border outline-none focus:outline-none ${
                        galleryFilter === filter.id
                          ? "bg-emerald-900 border-emerald-950 text-white shadow-xs"
                          : "bg-stone-50 border-stone-250 text-stone-605 hover:bg-stone-100 hover:text-stone-900"
                      }`}
                    >
                      {lang === "ar" ? filter.ar : lang === "fr" ? filter.fr : filter.en}
                    </button>
                  ))}
                </div>

                {/* Symmetrical Photo grid */}
                {photos.filter((pic) => galleryFilter === "all" || pic.category === galleryFilter).length === 0 ? (
                  <div className="p-12 border border-dashed border-stone-300 rounded-3xl bg-stone-50 text-center text-stone-500">
                    <p className="text-xs font-bold leading-relaxed">
                      {lang === "ar" 
                        ? "📸 معرض الصور فارغ حالياً. يسمح فقط للأدمينات بإضافة وعمل تصنيفات للصور بعد تسجيل الدخول عبر زر 'دخول المشرف'." 
                        : lang === "fr"
                          ? "📸 La galerie est actuellement vide. Seuls les administrateurs peuvent se connecter pour ajouter et catégoriser de nouvelles photos réelles de la région."
                          : "📸 The photo gallery is currently empty. Only administrators can secure login to upload and structure regional classifications for new pictures."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 pt-2">
                    {photos.filter((pic) => galleryFilter === "all" || pic.category === galleryFilter).map((pic, index) => (
                      <div 
                        key={index} 
                        className="group relative rounded-2xl overflow-hidden bg-stone-900 border border-stone-250 h-52 shadow-sm cursor-zoom-in transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                      >
                        <img
                          src={pic.imageUrl}
                          alt="Ain Tebournok gallery"
                          onClick={() => setSelectedPhoto(pic)}
                          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                        />
                        {/* Gradient bottom cover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent p-4 flex flex-col justify-between items-start pointer-events-none">
                          {/* Elegant mini category tag */}
                          <span className="bg-emerald-800/90 backdrop-blur-xs text-white text-[8px] font-black uppercase tracking-wider py-1 px-2.5 rounded-md">
                            {pic.category === "heritage" ? (lang === "ar" ? "آثار رومانية" : "Heritage") :
                             pic.category === "nature" ? (lang === "ar" ? "سد المصري والطبيعة" : "Nature") :
                             pic.category === "camping" ? (lang === "ar" ? "تخييم بري" : "Camping") : (lang === "ar" ? "فخار ومطعم ريفي" : "Gastronomy")}
                          </span>
                          
                          <p className="text-[11px] font-black text-white leading-relaxed text-right w-full">
                            {lang === "ar" ? pic.captionAr : lang === "fr" ? pic.captionFr : pic.captionEn}
                          </p>
                        </div>

                        {/* Floating Share Buttons */}
                        <div 
                          className="absolute bottom-2 left-2 flex gap-1 z-20"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ShareButtons 
                            title={lang === "ar" ? pic.captionAr : lang === "fr" ? pic.captionFr : pic.captionEn}
                            text={lang === "ar" ? pic.captionAr : lang === "fr" ? pic.captionFr : pic.captionEn}
                            url={pic.imageUrl}
                            lang={lang}
                          />
                        </div>

                        {/* Admin delete overlay */}
                        {isAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePhoto(pic.id);
                            }}
                            className="absolute top-2 left-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-all transform hover:scale-110"
                            title={lang === "ar" ? "حذف هذه الصورة" : "Delete photo"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Council tab content removed and made independent */}

            {activeQuickTab === "passed" && false && (
              <div className="space-y-6 animate-fade-in text-right" dir="rtl">
                {/* Header */}
                <div className="bg-[#FAF6F0] p-5 rounded-2xl border border-amber-900/10">
                  <h3 className="text-base sm:text-lg font-black text-[#5C4033] flex items-center gap-2 justify-end">
                    <span>🕊️ دائما في قلوبنا — روضة وفاء لرواد وأجداد عين طبرنق</span>
                  </h3>
                  <p className="text-xs text-stone-700 mt-1.5 leading-relaxed">
                    {lang === "ar"
                      ? "سنون مضت ولم تُمحَ ملامحهم من ذاكرة ومزارع 'عين طبرنق'. نخصص هذه اللوحة الرفيعة لتكريم وتخليد ذكرى شيوخنا الأبرار، أمهاتنا القدامى، وعائلاتنا الذين غرسوا فينا الثبات ورحلوا لبارئهم. نفتح الباب للجميع لرفع صور تذكارية قديمة وتدوين أدعية ترحم عطرة."
                      : "We dedicate this solemn panel to keep the memories of our ancestors, parents, and village elders alive. Feel free to upload photos or write warm tributes for departed loved ones."
                    }
                  </p>
                </div>

                {/* Addition Form layout */}
                <div className="bg-white p-5 rounded-3xl border border-stone-200">
                  <h4 className="text-xs sm:text-sm font-black text-stone-900 border-b border-stone-100 pb-2 mb-4">
                    {lang === "ar" ? "📥 تخليد ذكرى فقيد جديد (المشاركة مفتوحة للجميع)" : "Add Memorial Entry"}
                  </h4>

                  <form onSubmit={handleAddPassedSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    
                    <div className="md:col-span-4 space-y-3">
                      <div>
                        <label className="block text-[11px] font-black text-stone-700 mb-1">
                          {lang === "ar" ? "الاسم الكامل للمتوفى الكريم:" : "Full Name of Deceased:"}
                        </label>
                        <input
                          type="text"
                          required
                          value={newPassedName}
                          onChange={(e) => setNewPassedName(e.target.value)}
                          placeholder={lang === "ar" ? "مثال: الحاج عمار بن صالح بياشة" : "e.g. Haj Ammar"}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-850 text-right"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-stone-700 mb-1">
                          {lang === "ar" ? "سنين العمر / فترة التواجد (اختياري):" : "Years / Lifespan:"}
                        </label>
                        <input
                          type="text"
                          value={newPassedDates}
                          onChange={(e) => setNewPassedDates(e.target.value)}
                          placeholder={lang === "ar" ? "مثال: 1930 - 2012 (أو في السبعينيات)" : "e.g. 1930 - 2012"}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-850 text-right"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-stone-700 mb-1">
                          {lang === "ar" ? "الكنيية أو الصفة الاجتماعية بالقرية:" : "Relation or Title:"}
                        </label>
                        <input
                          type="text"
                          value={newPassedRelation}
                          onChange={(e) => setNewPassedRelation(e.target.value)}
                          placeholder={lang === "ar" ? "مثال: من كبار فلاحي حي بياشة / معلم الفوج الأول" : "Title / Bio summary"}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-850 text-right"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-4 space-y-3">
                      <div>
                        <label className="block text-[11px] font-black text-stone-700 mb-1">
                          {lang === "ar" ? "لمحة عطرة عن سيرته أو دعاء ترحم له:" : "Tribute message / Memories:"}
                        </label>
                        <textarea
                          rows={6}
                          value={newPassedBio}
                          onChange={(e) => setNewPassedBio(e.target.value)}
                          placeholder={lang === "ar" ? "اكتب محاسنه الحياتية، أعماله التضامنية بالبلدة، خصاله أو دعاء خالصاً لروحه وسيرته الطاهرة..." : "Bio details..."}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-850 text-right leading-relaxed"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-4 space-y-3 flex flex-col justify-between">
                      <div>
                        <label className="block text-[11px] font-black text-stone-700 mb-1">
                          {lang === "ar" ? "إرفاق صورة تذكارية:" : "Deceased Commemorative Photo:"}
                        </label>
                        
                        {/* Drag and Drop Container */}
                        <div
                          onDragEnter={handlePassedDrag}
                          onDragOver={handlePassedDrag}
                          onDragLeave={handlePassedDrag}
                          onDrop={handlePassedDrop}
                          className={`border-2 border-dashed rounded-xl p-3 text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                            newPassedDragActive 
                              ? "border-amber-700 bg-amber-50" 
                              : "border-stone-300 bg-stone-50 hover:bg-stone-100"
                          }`}
                        >
                          <input
                            type="file"
                            id="passed-file-uploader"
                            accept="image/*"
                            onChange={handlePassedFileInputChange}
                            className="hidden"
                          />
                          <label htmlFor="passed-file-uploader" className="w-full cursor-pointer">
                            {newPassedFileBase64 ? (
                              <div className="relative">
                                <img
                                  src={newPassedFileBase64}
                                  alt="Preview"
                                  className="w-16 h-16 object-cover mx-auto rounded-lg border border-stone-300"
                                />
                                <span className="text-[9px] text-emerald-800 font-bold block mt-1">✓ تم تحميل الصورة بنجاح</span>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <UploadCloud className="w-6 h-6 text-stone-400 mx-auto" />
                                <span className="text-[10px] text-stone-500 block">اسحب صورتك هنا أو تصفح الملفات المتاحة</span>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      <div className="pt-2">
                        <span className="text-stone-400 text-[10px] block mb-2">أو ضع رابط صورة مباشر من الإنترنت:</span>
                        <input
                          type="text"
                          value={newPassedUrl}
                          onChange={(e) => setNewPassedUrl(e.target.value)}
                          placeholder="https://example.com/photo.jpg"
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-[10px] text-stone-900 focus:outline-none focus:border-amber-850 text-left"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#5C4033] hover:bg-[#4A3228] text-white rounded-xl py-2 px-3 text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm mt-3"
                      >
                        <Heart className="w-4 h-4 text-rose-300 animate-pulse fill-rose-300" />
                        <span>{lang === "ar" ? "تخليد الذكرى وحفظها بالروضة" : "Save Memorial Record"}</span>
                      </button>
                    </div>

                  </form>
                </div>

                {/* List of memorials */}
                <div className="space-y-4">
                  <h4 className="text-xs sm:text-sm font-black text-stone-900 border-b border-stone-200 pb-2 mb-2">
                    {lang === "ar" ? "🕊️ لوحة الخلود لراحلين عين طبرنق" : "Ancestor Gallery"}
                  </h4>

                  {passedLovedOnes.length === 0 ? (
                    <div className="text-center py-12 text-stone-400 text-sm">
                      {lang === "ar" ? "المرقد الشريف فارغ حالياً، شاركنا أول صورة لفقيد غالي!" : "No Memorials yet."}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {passedLovedOnes.map((item) => (
                        <div key={item.id} className="bg-[#FAF9F6] rounded-3xl border border-amber-900/10 p-5 flex flex-col justify-between hover:shadow-md transition-all duration-300 group">
                          
                          {/* Profile Header */}
                          <div>
                            <div className="flex flex-col sm:flex-row-reverse gap-4 items-center sm:items-start text-center sm:text-right">
                              {/* Picture with premium sepia hover effect */}
                              <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden shadow-md border-2 border-white bg-white">
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover transition-all duration-700 filter grayscale group-hover:grayscale-0 group-hover:scale-105"
                                  referrerPolicy="no-referrer"
                                />
                              </div>

                              {/* Text info */}
                              <div className="space-y-1 flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-1 sm:gap-2">
                                  <h5 className="text-sm sm:text-base font-black text-[#5C4033]">{item.name}</h5>
                                  <span className="font-mono text-xs text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 self-center sm:self-auto shrink-0">
                                    {item.dates}
                                  </span>
                                </div>
                                <p className="text-xs font-bold text-amber-800">{item.relation}</p>
                                <p className="text-xs text-stone-600 mt-2 leading-relaxed text-right">
                                  {item.bio}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Tributes & Comments section below each photo */}
                          <div className="mt-5 pt-4 border-t border-stone-200/80 space-y-4">
                            
                            {/* Actions bar (Candles / Likes) */}
                            <div className="flex justify-between items-center bg-white/60 p-2 rounded-xl border border-stone-150">
                              <button
                                onClick={() => handleLightCandle(item.id)}
                                className="flex items-center gap-1.5 bg-amber-100/80 hover:bg-amber-100 text-[#5C4033] px-3.5 py-1.5 rounded-xl text-[10px] font-black transition-all"
                              >
                                <span>🕯️ {lang === "ar" ? "أوقد شمعة ترحم وفاءً لروحه" : "Light a Memory Candle"}</span>
                                <span className="font-mono bg-white/90 px-2 py-0.2 rounded-md text-amber-950 font-bold">
                                  {item.candles || 0}
                                </span>
                              </button>

                              {isAdmin && (
                                <button
                                  onClick={() => handleDeletePassed(item.id)}
                                  className="text-red-500 hover:text-red-750 flex items-center gap-1 text-[10px] font-mono font-black border border-red-200 bg-red-50 px-2 py-1 rounded-md"
                                >
                                  <Trash2 className="w-3 h-3 text-red-500" />
                                  <span>{lang === "ar" ? "حذف (أدمين)" : "Delete Record"}</span>
                                </button>
                              )}
                            </div>

                            {/* Dynamic Comments List */}
                            <div className="space-y-2">
                              <span className="text-[10px] font-black text-stone-500 block">
                                {lang === "ar" ? "💬 دعوات وتذكارات أهالي وزوار القرية:" : "Visitor Comments & Prayers:"}
                              </span>

                              {(!item.comments || item.comments.length === 0) ? (
                                <p className="text-[10px] text-stone-400 italic text-right bg-white p-1.5 rounded-lg text-center">
                                  {lang === "ar" ? "لا توجد أدعية مكتوبة بعد. اكتب دعاءً طيباً لفقيدنا الكريم أدناه لتبقى ذكراه." : "No prayers yet."}
                                </p>
                              ) : (
                                <div className="space-y-2 max-h-[160px] overflow-y-auto bg-stone-50 p-2.5 rounded-xl border border-stone-150">
                                  {item.comments.map((cmt: any) => (
                                    <div key={cmt.id} className="text-right text-[11px] leading-relaxed border-b border-stone-200/50 pb-1.5 last:border-b-0 last:pb-0">
                                      <div className="flex justify-between items-center mb-0.5">
                                        <span className="text-[9px] text-stone-400 font-mono">
                                          {new Date(cmt.date).toLocaleDateString(lang === "ar" ? 'ar-TN' : 'fr-TN', { day: 'numeric', month: 'short' })}
                                        </span>
                                        <span className="font-bold text-[#5C4033] bg-[#FAF6F0] px-1.5 py-0.2 rounded-sm border border-stone-200">{cmt.author}</span>
                                      </div>
                                      <p className="text-stone-700 bg-white/70 p-1.5 rounded-lg mt-1 border border-stone-200">{cmt.text}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Comment Form */}
                            <form onSubmit={(e) => handleAddPassedComment(e, item.id)} className="space-y-2 bg-stone-100/50 p-2.5 rounded-xl border border-stone-200">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={passedCommentTexts[item.id] || ""}
                                  required
                                  onChange={(e) => setPassedCommentTexts({ ...passedCommentTexts, [item.id]: e.target.value })}
                                  placeholder={lang === "ar" ? "اكتب دعاءً أو ترحماً (مثال: رحمه الله وغفر له)..." : "Write a prayer or comment..."}
                                  className="flex-1 bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-[11px] text-stone-900 focus:outline-none focus:border-amber-800 text-right"
                                />
                                <input
                                  type="text"
                                  value={passedCommentAuthors[item.id] || ""}
                                  onChange={(e) => setPassedCommentAuthors({ ...passedCommentAuthors, [item.id]: e.target.value })}
                                  placeholder={lang === "ar" ? "اسمك الكريم" : "Your Name"}
                                  className="w-1/3 min-w-[70px] bg-white border border-stone-300 rounded-lg px-2 py-1 text-[11px] text-stone-900 focus:outline-none focus:border-amber-800 text-right"
                                />
                              </div>
                              <button
                                type="submit"
                                className="w-full bg-[#FAF6F0] hover:bg-amber-100/80 text-[#5C4033] border border-amber-900/10 rounded-lg py-1 px-3 text-[10px] font-bold transition-all flex items-center justify-center gap-1"
                              >
                                <Send className="w-3 h-3 text-[#5C4033]" />
                                <span>{lang === "ar" ? "إرسال الدعاء العطر والتعليق" : "Post Tribute Comment"}</span>
                              </button>
                            </form>

                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* General dynamic anchor link */}
            <div className="mt-6 pt-4 border-t border-stone-100 flex justify-between items-center text-xs">
              <span className="text-stone-400 font-mono text-[9px]">
                {lang === "ar" ? "عين طبرنق — ثبات وحضارة" : "Ain Tebournok - Preserved Identity"}
              </span>
              <button 
                onClick={() => scrollToSection("chat-section")} 
                className="text-emerald-800 font-black hover:text-emerald-950 flex items-center gap-1"
              >
                <span>{lang === "ar" ? "تحدّث مباشرة مع العم مفتاح حول هذه المعالم" : "Discuss this detail with Uncle Meftah"}</span>
                <ChevronLeft className={`w-3.5 h-3.5 ${lang !== "ar" ? "rotate-180" : ""}`} />
              </button>
            </div>

          </div>

        </div>
      </section>
      )}

      {/* Independent Ain Tebournok Community Live Council Section - Civic Municipal Stone Theme */}
      {(navigationMode === "all" || activeSection === "council-section") && (
        <section 
          id="council-section" 
          style={getSectionBgStyle("council", "").style} 
          className={`py-12 border-t relative ${getSectionBgStyle("council", isDarkMode ? "bg-gradient-to-b from-[#1C1814] via-zinc-950 to-[#1C1814] border-zinc-800" : "bg-gradient-to-b from-[#F2EDE4] via-white to-[#F2EDE4] border-stone-200").className}`}
        >
        {getSectionBgStyle("council", "").hasOverlay && (
          <div className="absolute inset-0 z-0 pointer-events-none" style={getSectionBgStyle("council", "").overlayStyle} />
        )}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="space-y-6 text-right animate-fade-in" dir="rtl">
            {/* Header */}
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 shadow-xs">
              <h3 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2 justify-end">
                <span>🏛️ مجلس قرية عين طبرنق الحية</span>
              </h3>
              <p className="text-xs text-stone-600 mt-1.5 leading-relaxed font-sans">
                {lang === "ar" 
                  ? "مجلس تشاركي حر يعبّر فيه أهالي القرية وأبناؤها والزوار عن مطالبهم، اقتراحاتهم، شكاوى الخدمات، ومبادرات التضامن والنهوض ببلدتنا العريقة."
                  : "A free participatory discussion board where village residents, youth, and visitors post grievances, requests or solidary ideas."
                }
              </p>
            </div>

            {/* Grid for form and messages */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Submit message card - 5 cols */}
              <div className="lg:col-span-5 bg-[#FAF9F6] p-5 rounded-3xl border border-stone-200 h-fit shadow-xs">
                <h4 className="text-xs sm:text-sm font-black text-stone-900 border-b border-stone-200 pb-2 mb-4">
                  {lang === "ar" ? "✍️ إضافة مشاركة أو مطلب جديد" : "Write a New Post"}
                </h4>
                
                <form onSubmit={handleAddCouncilMessage} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-black text-stone-700 mb-1">
                      {lang === "ar" ? "الاسم الكامل (أو صفة لتمثيلك):" : "Your Name / Title:"}
                    </label>
                    <input
                      type="text"
                      value={newCouncilName}
                      onChange={(e) => setNewCouncilName(e.target.value)}
                      placeholder={lang === "ar" ? "مثال: مروان الطبرنقي / ابن طبرنق الصامدة" : "e.g. Marouane"}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-800 text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-stone-700 mb-1">
                      {lang === "ar" ? "نوع المشاركة / التصنيف:" : "Category:"}
                    </label>
                    <select
                      value={newCouncilCategory}
                      onChange={(e) => setNewCouncilCategory(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl px-2 py-2 text-xs text-stone-910 focus:outline-none focus:border-emerald-800 text-right"
                    >
                      <option value="general">{lang === "ar" ? "💬 نقاش عام وتواصل اجتماعي" : "General debate"}</option>
                      <option value="suggestions">{lang === "ar" ? "💡 اقتراح وبناء تنموي للبلدة" : "Suggestion"}</option>
                      <option value="urgent">{lang === "ar" ? "🚨 مطلب خدمي عاجل" : "Urgent appeal"}</option>
                      <option value="complain">{lang === "ar" ? "❌ تقصير وتهميش إداري / شكوى" : "Complaint"}</option>
                      <option value="social">{lang === "ar" ? "🤝 مبادرة وتكافل اجتماعي" : "Social work"}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-stone-700 mb-1">
                      {lang === "ar" ? "نص رسالتك أو شكواك:" : "Your Message:"}
                    </label>
                    <textarea
                      rows={4}
                      value={newCouncilMessage}
                      onChange={(e) => setNewCouncilMessage(e.target.value)}
                      required
                      placeholder={lang === "ar" ? "اكتب هنا بالتفصيل (مثل: غياب التنوير ليلاً لحي...)" : "Describe detail here..."}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-800 text-right leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl py-2 px-4 text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{lang === "ar" ? "نشر في المجلس الآن" : "Post to Council"}</span>
                  </button>
                </form>
              </div>

              {/* Messages timeline - 7 cols */}
              <div className="lg:col-span-7 space-y-4">
                <h4 className="text-xs sm:text-sm font-black text-stone-900 border-b border-stone-200 pb-2 flex justify-between items-center">
                  <span className="text-stone-400 font-mono text-[10px]">
                    {councilMessages.length} {lang === "ar" ? "مشاركة مسجلة" : "posts"}
                  </span>
                  <span>{lang === "ar" ? "📋 سجل مناقشات المجلس الحالية" : "Council timeline"}</span>
                </h4>

                {councilMessages.length === 0 ? (
                  <div className="text-center py-12 text-stone-400 text-xs">
                    {lang === "ar" ? "لا توجد نقاشات حالياً بالمجلس، كن أول من يضيف مطلباً!" : "Empty board."}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {councilMessages.map((msg) => {
                      const categoryDetails = 
                        msg.category === "urgent" ? { text: lang === "ar" ? "نداء عاجل" : "Urgent", bg: "bg-red-50 text-red-700 border-red-200 animate-pulse" } :
                        msg.category === "complain" ? { text: lang === "ar" ? "شكوى خدمات" : "Complaint", bg: "bg-amber-50 text-amber-700 border-amber-200" } :
                        msg.category === "suggestions" ? { text: lang === "ar" ? "اقتراح تنموي" : "Suggestion", bg: "bg-blue-50 text-blue-700 border-blue-200" } :
                        msg.category === "social" ? { text: lang === "ar" ? "مبادرة تضامنية" : "Voluntary", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" } :
                        { text: lang === "ar" ? "حوار عام" : "General", bg: "bg-stone-50 text-stone-600 border-stone-200" };

                      return (
                        <div key={msg.id} className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col justify-between hover:shadow-xs transition-colors text-right font-sans">
                          <div className="flex justify-between items-start gap-2 mb-2 pb-2 border-b border-stone-100">
                            <span className={`text-[9px] font-black py-0.5 px-2 rounded-md border ${categoryDetails.bg}`}>
                              {categoryDetails.text}
                            </span>
                            <div className="text-right font-sans">
                              <h5 className="text-xs font-black text-stone-900">{msg.name}</h5>
                              <span className="text-[9px] text-stone-400 block font-mono">
                                {new Date(msg.date).toLocaleDateString(lang === "ar" ? 'ar-TN' : 'fr-TN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-stone-850 leading-relaxed text-right mb-3 whitespace-pre-wrap font-sans">
                            {msg.message}
                          </p>

                          {/* Visual Voting Section */}
                          {(() => {
                            const votesYes = msg.votesYes || 0;
                            const votesNo = msg.votesNo || 0;
                            const totalVotes = votesYes + votesNo;
                            const yesPercent = totalVotes > 0 ? Math.round((votesYes / totalVotes) * 100) : 0;
                            const noPercent = totalVotes > 0 ? Math.round((votesNo / totalVotes) * 100) : 0;

                            return (
                              <div className="mt-1 mb-3.5 p-3 rounded-2xl bg-stone-50 dark:bg-zinc-900 border border-stone-150 dark:border-zinc-800 text-right space-y-2">
                                <div className="flex justify-between items-center text-[10px] font-black text-stone-500 dark:text-zinc-400">
                                  <span className="font-mono text-stone-400">
                                    {totalVotes} {lang === "ar" ? "صوت" : "votes"}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <span>🗳️ {lang === "ar" ? "التصويت على الاقتراح:" : "Vote on this proposal:"}</span>
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {/* Yes Button */}
                                  <button
                                    onClick={() => handleVoteCouncilMessage(msg.id, 'yes')}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-[10px] font-black bg-white hover:bg-emerald-50 dark:bg-zinc-950 dark:hover:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-stone-200 dark:border-zinc-800 transition-all cursor-pointer active:scale-95"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>{lang === "ar" ? "نعم" : "Yes"}</span>
                                    <span className="font-mono bg-emerald-100/50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded text-[9px]">
                                      {votesYes}
                                    </span>
                                  </button>

                                  {/* No Button */}
                                  <button
                                    onClick={() => handleVoteCouncilMessage(msg.id, 'no')}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-[10px] font-black bg-white hover:bg-rose-50 dark:bg-zinc-950 dark:hover:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-stone-200 dark:border-zinc-800 transition-all cursor-pointer active:scale-95"
                                  >
                                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                                    <span>{lang === "ar" ? "لا" : "No"}</span>
                                    <span className="font-mono bg-rose-100/50 dark:bg-rose-950/40 px-1.5 py-0.2 rounded text-[9px]">
                                      {votesNo}
                                    </span>
                                  </button>
                                </div>

                                {/* Visual Split Bar */}
                                <div className="relative w-full h-2 bg-stone-200 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                                  {totalVotes > 0 ? (
                                    <>
                                      <div 
                                        className="h-full bg-emerald-500 transition-all duration-300" 
                                        style={{ width: `${yesPercent}%` }}
                                      />
                                      <div 
                                        className="h-full bg-rose-500 transition-all duration-300" 
                                        style={{ width: `${noPercent}%` }}
                                      />
                                    </>
                                  ) : (
                                    <div className="w-full h-full bg-stone-150 dark:bg-zinc-850" />
                                  )}
                                </div>

                                {totalVotes > 0 && (
                                  <div className="flex justify-between text-[8px] font-mono font-bold text-stone-400 dark:text-zinc-500 px-0.5">
                                    <span>{lang === "ar" ? "لا:" : "No:"} {noPercent}%</span>
                                    <span>{lang === "ar" ? "نعم:" : "Yes:"} {yesPercent}%</span>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                          
                          <div className="flex justify-between items-center bg-stone-50/50 p-2 rounded-xl">
                            {/* Admin actions */}
                            {isAdmin ? (
                              <button
                                onClick={() => handleDeleteCouncilMessage(msg.id)}
                                className="text-red-500 hover:text-red-750 flex items-center gap-1 text-[10px] font-mono font-black animate-none"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>{lang === "ar" ? "حذف (إشراف)" : "Delete Admin"}</span>
                              </button>
                            ) : (
                              <div />
                            )}

                            <button
                              onClick={() => handleLikeCouncilMessage(msg.id)}
                              className="flex items-center gap-1.5 bg-white hover:bg-rose-50 hover:text-rose-600 px-3 py-1 rounded-xl text-[10px] font-black text-stone-700 transition-all border border-stone-250 font-sans"
                            >
                              <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                              <span>{lang === "ar" ? "أؤيد هذا المطلب" : "Agree"}</span>
                              <span className="font-mono text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded-md">
                                {msg.likes}
                              </span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </section>
      )}

      {/* Chat Area with virtual elder Uncle Meftah - Cozy Lavender Lounge Theme */}
      {(navigationMode === "all" || activeSection === "chat-section") && (
        <section 
          id="chat-section" 
          style={getSectionBgStyle("chat", "").style} 
          className={`py-12 border-t relative ${getSectionBgStyle("chat", isDarkMode ? "bg-gradient-to-tr from-[#131122] via-zinc-950 to-[#18152D] border-zinc-850 text-zinc-100" : "bg-gradient-to-tr from-[#FAF9FF] via-white to-[#F2EFFF] border-stone-250 text-stone-850").className}`}
        >
        {getSectionBgStyle("chat", "").hasOverlay && (
          <div className="absolute inset-0 z-0 pointer-events-none" style={getSectionBgStyle("chat", "").overlayStyle} />
        )}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
          
          {/* Section title */}
          <div className="text-center mb-6">
            <h2 className={`text-lg sm:text-xl font-black flex items-center justify-center gap-2 ${isDarkMode ? "text-zinc-100" : "text-stone-900"}`}>
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span>{t.chatTitle}</span>
            </h2>
            <p className={`text-xs mt-1 ${isDarkMode ? "text-zinc-400" : "text-stone-500"}`}>
              {t.chatSubtitle}
            </p>
          </div>

          {/* Chat dialog bubble window */}
          <div className="bg-stone-50 rounded-3xl border border-stone-200 p-4 md:p-6 shadow-sm flex flex-col space-y-4 h-[420px]">
            
            {/* Scrollable container viewport */}
            <div className="flex-1 overflow-y-auto space-y-4 p-2" id="chat-viewport">
              {chatMessages.map((msg, i) => {
                const isAssistant = msg.role === "assistant";
                return (
                  <div key={i} className={`flex ${isAssistant ? "justify-start text-right" : "justify-end text-left"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs md:text-sm leading-relaxed ${
                      isAssistant 
                        ? "bg-white text-stone-900 border border-stone-200 shadow-xs" 
                        : "bg-emerald-900 text-stone-50 border border-emerald-950 font-medium"
                    }`}>
                      {/* Avatar label for styling clarity */}
                      <span className="text-[9px] uppercase font-black tracking-wider block mb-1 text-stone-400">
                        {isAssistant ? (lang === "ar" ? "العم مفتاح الحكيم (مرشد ذكي)" : "Uncle Meftah (Virtual Elder)") : (lang === "ar" ? "أنت (ضيف مكرّم)" : "You (Groombalia Guest)")}
                      </span>
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                  </div>
                );
              })}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-stone-200/50 text-stone-500 rounded-2xl px-4 py-3 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-stone-400 animate-pulse" />
                    <span className="w-2 h-2 rounded-full bg-stone-400 animate-pulse delay-100" />
                    <span>{lang === "ar" ? "العم مفتاح يتدبّر ويفكر..." : "Uncle Meftah is searching memory..."}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick pre-formulated buttons queries to keep user engaged */}
            <div className="flex flex-wrap gap-1.5 justify-end pt-2 border-t border-stone-200/65">
              {[
                lang === "ar" ? "ما قصة مكتب البريد المغلق؟" : "Pourquoi la poste est fermée ?",
                lang === "ar" ? "حدثني عن معالم الكابيتول الروماني" : "Parle-moi du Capitole romain",
                lang === "ar" ? "كيف نصل لسد المصري بالهاتف؟" : "Où se situe le barrage Masri ?",
                lang === "ar" ? "تاريخ مدرسة 1952 الابتدائية" : "Histoire de l'école 1952"
              ].map((query, idx) => (
                <button
                  id={`quick-query-${idx}`}
                  key={idx}
                  onClick={() => {
                    setChatInput(query);
                  }}
                  className="bg-white hover:bg-stone-100 text-[10px] px-2.5 py-1.5 rounded-xl border border-stone-300 font-bold text-stone-700 transition-all outline-none"
                >
                  {query}
                </button>
              ))}
            </div>

            {/* Message composition Area */}
            <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-stone-200">
              <input
                id="chat-user-textbox"
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={t.chatPlaceholder}
                className="flex-1 bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:ring-1 focus:ring-emerald-800 focus:outline-none text-right"
              />
              <button
                id="chat-submit-btn"
                type="submit"
                className="bg-emerald-800 hover:bg-emerald-950 text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm focus:outline-none"
              >
                {t.chatSendBtn}
              </button>
            </form>

          </div>

        </div>
      </section>
      )}

      {/* Human Appeal & Infrastructure Struggles Checklist - Warm Clay Desert Theme */}
      {(navigationMode === "all" || activeSection === "appeal-section") && (
        <section 
          id="appeal-section" 
          style={getSectionBgStyle("appeal", "").style} 
          className={`py-12 border-t relative ${getSectionBgStyle("appeal", isDarkMode ? "bg-gradient-to-br from-[#241710] via-zinc-950 to-[#2A170C] border-zinc-850" : "bg-gradient-to-br from-[#FDFBF7] via-[#FFF5EB] to-[#FFF0E0] border-stone-200").className}`}
        >
        {getSectionBgStyle("appeal", "").hasOverlay && (
          <div className="absolute inset-0 z-0 pointer-events-none" style={getSectionBgStyle("appeal", "").overlayStyle} />
        )}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* The actual petition checklist with concrete info */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 text-right space-y-6">
              
              <div>
                <span style={{ fontSize: "13px" }} className="inline-block px-2.5 py-1 font-black uppercase tracking-wider text-red-800 bg-red-50 border border-red-100 rounded-md">
                  {lang === "ar" ? "قضية تضامنية إنسانية" : "Human Rights & Services Petition"}
                </span>
                <h3 className="text-base sm:text-lg font-black text-stone-950 mt-2">
                  {t.amenitiesTitle}
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  {t.amenitiesSubtitle}
                </p>
              </div>

              {/* Service list checker */}
              <div className="space-y-4">
                {[
                  {
                    titleAr: "مكتب البريد📮",
                    titleOther: "Post Office",
                    descAr: "مغلق منذ 22 عاماً كاملة بتعلة واهية (آيل للسقوط)، مما يكبّد العجائز وكبار السن مخاطر وتكلفة السفر اليومية إلى مدينة قرنبالية (9كم) للحصول على جراياتهم التقاعدية المتواضعة.",
                    descOther: "Abandoned structure shut down for over 22 years, isolating seniors."
                  },
                  {
                    titleAr: "مركز الصحة الأساسية مريض ومعدوم الدواء🏥",
                    titleOther: "Local Clinic Needs Medical Staff",
                    descAr: "يغطي 5 قرى محيطة، لكنه يعاني من فقر شديد بالأدوية الأساسية ونقص حضور الكادر الطبي، ناهيك عن ضيق حجمه المهين.",
                    descOther: "Serves five isolated villages with near-zero chronic medicines."
                  },
                  {
                    titleAr: "المدرسة الابتدائية التاريخية (منذ 1952)🏫",
                    titleOther: "Primary School Containment Wall",
                    descAr: "سور المدرسة متهالك وآيل للسقوط وقد تكررت برمجته للصيانة دون أثر في الواقع، مما يشكل خطراً كبيراً يهدد سلامة الطلاب الصغار.",
                    descOther: "Established 1952, retaining wall poses real risk to local toddlers."
                  },
                  {
                    titleAr: "مركز الإشعاع الفلاحي المهجور لأكثر من 25 سنة🌿",
                    titleOther: "Vacant Agriculture Station Conversion",
                    descAr: "كان يوفر الموارد للفلاحين. يطالب المتساكنون بتنازل ولاية نابل عنه وتسليمه للبلدية ليكون مقراً لـ 'الدائرة البلدية السريعة' لخدمة الناس وصيانة المصالح.",
                    descOther: "Request to convert a defunct over 25-year-old site into an administrative sub-town hall."
                  },
                  {
                    titleAr: "شوارع مظلمة وتعبيد منقوص ومهمل💡",
                    titleOther: "Streetlights & Road Asphalt",
                    descAr: "توقف تعبيد المسالك بحجج تغيير المقاولين بينما يتم تعبيد كل قرى جهة قرنبالية الغربية كنيانو وتركي، فضلاً عن غياب الإنارة العمومية تماماً بغالبية الأحياء.",
                    descOther: "Asphalt suspended indefinitely due to municipal contractor changes."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-stone-50/50 rounded-2xl border border-stone-200 space-y-2 text-right relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-1.5 w-1.5 bg-red-500 rounded-full mt-4 mr-4" />
                    <div className="pr-4">
                      <h4 className="text-xs sm:text-sm font-black text-rose-950">
                        {lang === "ar" ? item.titleAr : item.titleOther}
                      </h4>
                      <p className="text-[11px] text-stone-605 mt-1 leading-relaxed">
                        {lang === "ar" ? item.descAr : item.descOther}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Signature Guestbook and quote of local notable */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Symmetrical Paper Quote */}
              <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200/80 text-right space-y-4 shadow-sm relative">
                {/* Background water seal */}
                <span className="absolute -top-1 right-2 font-serif text-8xl text-amber-900/5 select-none pointer-events-none">“</span>
                
                <p className="text-xs text-amber-900 font-bold leading-relaxed pr-2 select-all text-center not-italic">
                  "{t.humanMessageQuotes}"
                </p>

                <div className="border-t border-amber-200/60 pt-3 flex items-center justify-end gap-2.5">
                  <div className="w-full">
                    <h5 className="text-xs font-black text-[#e81212] text-center">{t.humanMessageAuthor}</h5>
                    <p style={{ textAlign: "center" }} className="text-[10px] text-stone-500 mt-0.5">{t.humanMessageRole}</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-amber-400 font-black text-sm text-stone-900 flex items-center justify-center border border-amber-300">
                    {lang === "ar" ? "م.أ" : "M.A"}
                  </div>
                </div>
              </div>

              {/* Instant support guestbook for Ain Tebournok! */}
              <div className="bg-white rounded-3xl p-6 border border-stone-250 shadow-sm text-right space-y-5">
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-stone-900 block">{lang === "ar" ? "سجل تضامنك — دفتر زوار عين طبرنق" : "Solidarity Registry - Ain Tebournok Guestbook"}</h4>
                  <p className="text-[10px] text-stone-400 mt-1 leading-normal">
                    {lang === "ar" ? "اكتب اسمك واهتمامك لإظهار الدعم المعنوي والضغط لتوفير المرافق وفتح مكتب البريد والمدرسة." : "Support our campaign for local access to postal care, medical staff and safety."}
                  </p>
                </div>

                {signedSuccess && (
                  <div className="bg-emerald-50 text-emerald-950 p-2.5 rounded-xl text-[10px] font-bold border border-emerald-200 leading-normal flex items-center gap-1.5 justify-end">
                    <span>{lang === "ar" ? "رائع! تم تسجيل تضامنك بالدفتر المحلي بنجاح" : "Success! Your name was written down. Solidarity wins."}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
                  </div>
                )}

                <form onSubmit={handleAddSignature} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600 block">{lang === "ar" ? "الاسم الكامل / الجهة:" : "Full Name / Organization:"}</label>
                    <input
                      id="input-guestbook-name"
                      type="text"
                      required
                      value={supportName}
                      onChange={(e) => setSupportName(e.target.value)}
                      placeholder={lang === "ar" ? "مثال: مروان القادري (مهندس)" : "Your full name..."}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-800 text-right"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-650 block">{lang === "ar" ? "المدينة / دولة الإقامة:" : "City / Country:"}</label>
                    <input
                      id="input-guestbook-city"
                      type="text"
                      required
                      value={supportCity}
                      onChange={(e) => setSupportCity(e.target.value)}
                      placeholder={lang === "ar" ? "سوسة، تونس" : "e.g. Grombalia, Tunisia"}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-800 text-right"
                    />
                  </div>

                  <button
                    id="submit-solidarity-signature"
                    type="submit"
                    className="w-full bg-rose-800 hover:bg-rose-900 text-white font-black py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 focus:outline-none"
                  >
                    <Heart className="w-3.5 h-3.5 text-white animate-pulse" />
                    <span>{t.humanMessageActionBtn}</span>
                  </button>
                </form>

                {/* Simulated list of signatures */}
                {signatures.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[9px] font-black uppercase text-stone-400 block mb-2">{lang === "ar" ? "آخر المسجلين بالدفتر التضامني:" : "Recent signed supporters:"}</span>
                    <div className="space-y-1 max-h-[85px] overflow-y-auto border-t border-stone-100 pt-2 pr-1">
                      {signatures.map((sig, uidx) => (
                        <div key={uidx} className="flex justify-between items-center text-[10px] py-1 border-b border-stone-50 text-stone-600">
                          <span className="font-mono text-[9px] text-stone-400">{sig.date}</span>
                          <span className="font-bold">
                            {sig.name} <span className="text-stone-400 font-normal">({sig.city})</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>

        </div>
      </section>
      )}

      {/* Interactive Map Block - Cartographic Technical Grid Theme */}
      {(navigationMode === "all" || activeSection === "interactive-map-section") && (
        <section 
          id="interactive-map-section" 
          style={getSectionBgStyle("interactive-map", "").style} 
          className={`py-12 border-t relative ${getSectionBgStyle("interactive-map", isDarkMode ? "bg-gradient-to-b from-zinc-950 via-[#1E2024] to-zinc-950 border-zinc-850" : "bg-gradient-to-b from-stone-50 via-[#F3F4F6] to-stone-50 border-stone-200").className}`}
        >
        {getSectionBgStyle("interactive-map", "").hasOverlay && (
          <div className="absolute inset-0 z-0 pointer-events-none" style={getSectionBgStyle("interactive-map", "").overlayStyle} />
        )}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <InteractiveMap lang={lang} mapCoords={mapCoords} />
        </div>
      </section>
      )}

      {/* ========================================== */}
      {/* Our Joys Section (أفراحنا والأعراس التقليدية) - Golden Jasmine & Rose Sunset Theme */}
      {/* ========================================== */}
      {(navigationMode === "all" || activeSection === "joys-section") && (
        <section 
          id="joys-section" 
          style={getSectionBgStyle("joys", "").style} 
          className={`py-12 border-t relative ${getSectionBgStyle("joys", isDarkMode ? "bg-gradient-to-tr from-[#221215] via-zinc-950 to-[#26160F] text-zinc-100 border-zinc-800" : "bg-gradient-to-tr from-[#FFF8F8] via-[#FFF9F2] to-[#FFF5EB] text-stone-850 border-stone-200").className}`}
        >
        {getSectionBgStyle("joys", "").hasOverlay && (
          <div className="absolute inset-0 z-0 pointer-events-none" style={getSectionBgStyle("joys", "").overlayStyle} />
        )}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-10">
            <span className={`text-[10px] uppercase font-black tracking-widest font-mono px-3 py-1 rounded-full ${
              isDarkMode ? "bg-amber-950/50 text-amber-400" : "bg-amber-50 text-amber-800"
            }`}>
              {lang === "ar" ? "أفراح عين طبرنق والمسرات" : "Ain Tebournok's Joyful Celebrations"}
            </span>
            <h2 className={`text-xl sm:text-2xl font-black mt-3 ${isDarkMode ? "text-zinc-100" : "text-stone-900"}`}>
              {lang === "ar" ? "🎉 قسم أفراحنا ومناسباتنا السعيدة" : "🎉 Our Joys & Celebrations"}
            </h2>
            <p className={`text-xs mt-1.5 ${isDarkMode ? "text-zinc-400" : "text-stone-500"}`}>
              {lang === "ar" 
                ? "مساحة مخصصة لأهالي القرية والزوار لمشاركة صور وفيديوهات الأعراس والمناسبات السعيدة والتهاني" 
                : "A digital space for villagers and visitors to share photos, videos of traditional weddings and joys"}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side: Add Joy Form (Anyone can add!) */}
            <div className="lg:col-span-4 space-y-4">
              <div className={`p-5 rounded-3xl border text-right transition-colors ${
                isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-stone-200"
              }`}>
                <h3 className="text-xs font-black text-amber-950 dark:text-amber-400 flex items-center gap-1.5 justify-end mb-3">
                  <Gift className="w-4 h-4 text-amber-600" />
                  <span>{lang === "ar" ? "شاركنا فرحتك ومناسبتك السعيدة!" : "Share Your Joy with Us!"}</span>
                </h3>
                <p className="text-[10px] text-stone-500 dark:text-zinc-400 mb-4">
                  {lang === "ar" 
                    ? "هل لديك صور أو فيديو لعرس تقليدي، نجاح، عقيقة أو لمة سعيدة بعين طبرنق؟ شاركها الآن معنا!" 
                    : "Have photos/videos of a wedding, graduation, or happy event in Tebournok? Post them here!"}
                </p>

                <form onSubmit={handleAddJoy} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 dark:text-zinc-400 mb-1">
                      {lang === "ar" ? "عنوان المناسبة (مطلوب)" : "Title of Joy (Required)"}
                    </label>
                    <input
                      type="text"
                      required
                      value={newJoyTitle}
                      onChange={(e) => setNewJoyTitle(e.target.value)}
                      placeholder="مثال: عرس آل الورتاني ببلدتنا..."
                      className="w-full bg-stone-50 dark:bg-zinc-950 border border-stone-300 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-stone-900 dark:text-zinc-150 focus:outline-none focus:border-amber-800 text-right font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 dark:text-zinc-400 mb-1">
                      {lang === "ar" ? "اسم المرسل (مطلوب)" : "Your Name (Required)"}
                    </label>
                    <input
                      type="text"
                      required
                      value={newJoyAuthor}
                      onChange={(e) => setNewJoyAuthor(e.target.value)}
                      placeholder="مثال: محمد الماجري..."
                      className="w-full bg-stone-50 dark:bg-zinc-950 border border-stone-300 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-stone-900 dark:text-zinc-150 focus:outline-none focus:border-amber-800 text-right font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 dark:text-zinc-400 mb-1">
                      {lang === "ar" ? "تفاصيل وتهنئة المناسبة (مطلوب)" : "Description / Congrats (Required)"}
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={newJoyDescription}
                      onChange={(e) => setNewJoyDescription(e.target.value)}
                      placeholder="اكتب التهنئة وتفاصيل العرس والأجواء الجميلة هنا..."
                      className="w-full bg-stone-50 dark:bg-zinc-950 border border-stone-300 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-stone-900 dark:text-zinc-150 focus:outline-none focus:border-amber-800 text-right font-sans"
                    />
                  </div>

                  {/* Media type switch */}
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 dark:text-zinc-400 mb-1">
                      {lang === "ar" ? "نوع المرفق" : "Attachment Type"}
                    </label>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setNewJoyMediaType("video")}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          newJoyMediaType === "video" 
                            ? "bg-amber-850 text-white" 
                            : "bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400"
                        }`}
                      >
                        {lang === "ar" ? "🎥 مقطع فيديو" : "🎥 Video"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewJoyMediaType("image")}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          newJoyMediaType === "image" 
                            ? "bg-amber-850 text-white" 
                            : "bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400"
                        }`}
                      >
                        {lang === "ar" ? "📸 صورة" : "📸 Photo"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 dark:text-zinc-400 mb-1">
                      {lang === "ar" ? "رابط الصورة/الفيديو (اختياري)" : "Media URL (Optional)"}
                    </label>
                    <input
                      type="text"
                      value={newJoyMediaUrl}
                      onChange={(e) => setNewJoyMediaUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-stone-50 dark:bg-zinc-950 border border-stone-300 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-stone-900 dark:text-zinc-150 focus:outline-none focus:border-amber-800 text-left font-sans"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-stone-600 dark:text-zinc-400 mb-1">
                      {lang === "ar" ? "أو تحميل ملف مباشرة" : "Or upload file directly"}
                    </span>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setNewJoyDragActive(true); }}
                      onDragLeave={() => setNewJoyDragActive(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setNewJoyDragActive(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleJoyFileChange(e.dataTransfer.files[0]);
                        }
                      }}
                      className={`border border-dashed rounded-xl p-2.5 text-center transition-all ${
                        newJoyFileBase64 
                          ? "border-emerald-600 bg-emerald-50/10" 
                          : newJoyDragActive 
                            ? "border-amber-500 bg-stone-50" 
                            : "border-stone-300 dark:border-zinc-800"
                      }`}
                    >
                      <input
                        id="joy-file-uploader"
                        type="file"
                        accept={newJoyMediaType === "image" ? "image/*" : "video/*"}
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleJoyFileChange(e.target.files[0]);
                          }
                        }}
                      />
                      <label htmlFor="joy-file-uploader" className="cursor-pointer text-[10px] text-stone-500 flex flex-col items-center gap-1">
                        <UploadCloud className="w-4 h-4 text-stone-400" />
                        {newJoyFileBase64 ? (
                          <span className="text-emerald-600 font-bold">{lang === "ar" ? "✓ تم تجهيز الملف" : "✓ File loaded"}</span>
                        ) : (
                          <span>{lang === "ar" ? "اضغط هنا لتحميل الملف" : "Click to select a file"}</span>
                        )}
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-600 text-white font-black text-xs py-2 rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-white" />
                    <span>{lang === "ar" ? "نشر في فضاء الأفراح 🎉" : "Publish Celebration 🎉"}</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Right side: Joy Feed Grid */}
            <div className="lg:col-span-8 space-y-6">
              {joys.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl">
                  <p className="text-xs text-stone-400 font-bold">{lang === "ar" ? "كن أول من يشارك فرحة عائلتك أو بلدتنا هنا!" : "Be the first to share a joyful moment here!"}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {joys.map((joy) => {
                    const formattedJoyDate = new Date(joy.date).toLocaleDateString(
                      lang === "ar" ? "ar-TN" : "fr-FR",
                      { year: "numeric", month: "long", day: "numeric" }
                    );

                    return (
                      <div 
                        key={joy.id} 
                        className={`rounded-3xl border shadow-xs overflow-hidden flex flex-col justify-between transition-all ${
                          isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-stone-200"
                        }`}
                      >
                        {/* Header */}
                        <div className="p-5 border-b border-stone-100 dark:border-zinc-850 flex justify-between items-center text-right">
                          <div className="flex items-center gap-2">
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteJoy(joy.id)}
                                className="text-red-500 hover:text-red-700 font-bold text-[10px] flex items-center gap-0.5 border border-red-200 dark:border-red-900/30 px-2 py-1 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                                <span>{lang === "ar" ? "حذف" : "Delete"}</span>
                              </button>
                            )}
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-black text-amber-950 dark:text-amber-400">{joy.title}</h4>
                            <div className="flex items-center justify-end gap-1.5 text-[9px] text-stone-400 mt-1 font-sans">
                              <span>{formattedJoyDate}</span>
                              <span>•</span>
                              <span className="font-bold text-stone-600 dark:text-zinc-300">{lang === "ar" ? "بواسطة" : "by"}: {joy.author}</span>
                            </div>
                          </div>
                        </div>

                        {/* Media display if any */}
                        {joy.mediaUrl && (
                          <div className="bg-stone-50 dark:bg-zinc-950 border-b border-stone-100 dark:border-zinc-850 max-h-[350px] overflow-hidden flex items-center justify-center">
                            {joy.mediaType === "video" ? (
                              <video 
                                src={joy.mediaUrl} 
                                controls 
                                className="w-full max-h-[350px] object-contain"
                              />
                            ) : (
                              <img 
                                src={joy.mediaUrl} 
                                alt={joy.title}
                                className="w-full max-h-[350px] object-contain"
                                referrerPolicy="no-referrer"
                              />
                            )}
                          </div>
                        )}

                        {/* Body description */}
                        <div className="p-5 text-right space-y-4">
                          <p className="text-xs leading-relaxed text-stone-700 dark:text-zinc-300 whitespace-pre-wrap">
                            {joy.description}
                          </p>

                          {/* Action panel (Likes & Shares) */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 dark:border-zinc-850">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleLikeJoy(joy.id)}
                                className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 border border-rose-100 dark:border-rose-950/30 bg-rose-50/30 dark:bg-rose-950/10 px-3.5 py-1.5 rounded-full transition-all"
                              >
                                <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                                <span>{lang === "ar" ? "ألف مبروك" : "Congratulations"}</span>
                                <span className="bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 px-1.5 py-0.5 rounded-full text-[10px]">{joy.likes || 0}</span>
                              </button>

                              <ShareButtons 
                                title={joy.title}
                                text={joy.description}
                                url={joy.mediaUrl || `${window.location.origin}/#joys-section`}
                                lang={lang}
                              />
                            </div>
                            
                            <span className="text-[10px] text-stone-400 dark:text-zinc-500 font-bold">
                              {joy.comments?.length || 0} {lang === "ar" ? "تهاني وتعليقات" : "comments"}
                            </span>
                          </div>

                          {/* Comments section */}
                          <div className="space-y-3 pt-2">
                            {/* Comments list */}
                            {joy.comments && joy.comments.length > 0 && (
                              <div className="space-y-2 max-h-[200px] overflow-y-auto bg-stone-50 dark:bg-zinc-950 p-3 rounded-2xl border border-stone-100 dark:border-zinc-850">
                                {joy.comments.map((comment: any) => (
                                  <div key={comment.id} className="text-right text-[10px] border-b border-stone-100 dark:border-zinc-900/50 pb-2 last:border-0 last:pb-0 font-sans">
                                    <div className="flex items-center justify-between text-[8px] text-stone-400 mb-0.5 font-sans">
                                      <span>{new Date(comment.date).toLocaleDateString(lang === "ar" ? "ar-TN" : "fr-FR")}</span>
                                      <span className="font-bold text-stone-600 dark:text-zinc-300">{comment.author}</span>
                                    </div>
                                    <p className="text-stone-800 dark:text-zinc-200">{comment.text}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Add comment form */}
                            <form 
                              onSubmit={(e) => handleAddJoyComment(joy.id, e)} 
                              className="bg-stone-50/50 dark:bg-zinc-900/30 p-3 rounded-2xl border border-stone-150 dark:border-zinc-850/50 space-y-2 text-right"
                            >
                              <span className="block text-[10px] font-bold text-stone-600 dark:text-zinc-400">
                                {lang === "ar" ? "✍️ اكتب تهنئة أو تعليقاً للآل الكرام:" : "✍️ Write a congratulatory message:"}
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div className="sm:col-span-1">
                                  <input
                                    type="text"
                                    required
                                    placeholder={lang === "ar" ? "اسمك..." : "Your name..."}
                                    value={joyCommentAuthors[joy.id] || ""}
                                    onChange={(e) => setJoyCommentAuthors({ ...joyCommentAuthors, [joy.id]: e.target.value })}
                                    className="w-full bg-white dark:bg-zinc-950 border border-stone-250 dark:border-zinc-850 rounded-lg px-2 py-1 text-xs text-stone-900 dark:text-zinc-150 focus:outline-none focus:border-amber-800 text-right font-sans"
                                  />
                                </div>
                                <div className="sm:col-span-2 flex gap-1">
                                  <input
                                    type="text"
                                    required
                                    placeholder={lang === "ar" ? "رسالة التهنئة والتباريك..." : "Congratulation text..."}
                                    value={joyCommentTexts[joy.id] || ""}
                                    onChange={(e) => setJoyCommentTexts({ ...joyCommentTexts, [joy.id]: e.target.value })}
                                    className="w-full bg-white dark:bg-zinc-950 border border-stone-250 dark:border-zinc-850 rounded-lg px-2 py-1 text-xs text-stone-900 dark:text-zinc-150 focus:outline-none focus:border-amber-800 text-right font-sans"
                                  />
                                  <button
                                    type="submit"
                                    className="bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 text-white p-1.5 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                                    title={lang === "ar" ? "إرسال التهنئة" : "Send"}
                                  >
                                    <Send className="w-3.5 h-3.5 text-white" />
                                  </button>
                                </div>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
      )}

      {/* Independent Passed Loved Ones Memorial Section - Serene Spiritual Sepia Theme */}
      {(navigationMode === "all" || activeSection === "passed-section") && (
        <section 
          id="passed-section" 
          style={getSectionBgStyle("passed", "").style} 
          className={`py-12 border-t border-b relative ${getSectionBgStyle("passed", isDarkMode ? "bg-gradient-to-b from-[#141210] via-zinc-950 to-[#141210] border-zinc-850" : "bg-gradient-to-b from-[#FAF6F0] via-stone-50 to-[#FAF6F0] border-stone-200").className}`}
        >
        {getSectionBgStyle("passed", "").hasOverlay && (
          <div className="absolute inset-0 z-0 pointer-events-none" style={getSectionBgStyle("passed", "").overlayStyle} />
        )}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="space-y-6 text-right animate-fade-in" dir="rtl">
            {/* Header */}
            <div className="bg-[#FAF6F0] p-5 rounded-2xl border border-amber-900/10 shadow-xs">
              <h3 className="text-base sm:text-lg font-black text-[#5C4033] flex items-center gap-2 justify-end">
                <span>🕊️ دائما في قلوبنا — روضة وفاء لرواد وأجداد عين طبرنق</span>
              </h3>
              <p className="text-xs text-stone-750 mt-1.5 leading-relaxed font-sans font-medium">
                {lang === "ar"
                  ? "سنون مضت ولم تُمحَ ملامحهم من ذاكرة ومزارع 'عين طبرنق'. نخصص هذه اللوحة الرفيعة لتكريم وتخليد ذكرى شيوخنا الأبرار، أمهاتنا القدامى، وعائلاتنا الذين غرسوا فينا الثبات ورحلوا لبارئهم. نفتح الباب للجميع لرفع صور تذكارية قديمة وتدوين أدعية ترحم عطرة."
                  : "We dedicate this solemn panel to keep the memories of our ancestors, parents, and village elders alive. Feel free to upload photos or write warm tributes for departed loved ones."
                }
              </p>
            </div>

            {/* Addition Form layout */}
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
              <h4 className="text-xs sm:text-sm font-black text-stone-900 border-b border-stone-100 pb-2 mb-4 font-sans text-right">
                {lang === "ar" ? "📥 تخليد ذكرى فقيد جديد (المشاركة مفتوحة للجميع)" : "Add Memorial Entry"}
              </h4>

              <form onSubmit={handleAddPassedSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-5 text-right font-sans">
                
                <div className="md:col-span-4 space-y-3">
                  <div>
                    <label className="block text-[11px] font-black text-stone-700 mb-1">
                      {lang === "ar" ? "الاسم الكامل للمتوفى الكريم:" : "Full Name of Deceased:"}
                    </label>
                    <input
                      type="text"
                      required
                      value={newPassedName}
                      onChange={(e) => setNewPassedName(e.target.value)}
                      placeholder={lang === "ar" ? "مثال: الحاج عمار بن صالح بياشة" : "e.g. Haj Ammar"}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-850 text-right font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-stone-700 mb-1">
                      {lang === "ar" ? "سنين العمر / فترة التواجد (اختياري):" : "Years / Lifespan:"}
                    </label>
                    <input
                      type="text"
                      value={newPassedDates}
                      onChange={(e) => setNewPassedDates(e.target.value)}
                      placeholder={lang === "ar" ? "مثال: 1930 - 2012 (أو في السبعينيات)" : "e.g. 1930 - 2012"}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-850 text-right font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-stone-700 mb-1">
                      {lang === "ar" ? "الكنيية أو الصفة الاجتماعية بالقرية:" : "Relation or Title:"}
                    </label>
                    <input
                      type="text"
                      value={newPassedRelation}
                      onChange={(e) => setNewPassedRelation(e.target.value)}
                      placeholder={lang === "ar" ? "مثال: من كبار فلاحي حي بياشة / معلم الفوج الأول" : "Title / Bio summary"}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-850 text-right font-sans"
                    />
                  </div>
                </div>

                <div className="md:col-span-4 space-y-3">
                  <div>
                    <label className="block text-[11px] font-black text-stone-700 mb-1">
                      {lang === "ar" ? "لمحة عطرة عن سيرته أو دعاء ترحم له:" : "Tribute message / Memories:"}
                    </label>
                    <textarea
                      rows={6}
                      value={newPassedBio}
                      onChange={(e) => setNewPassedBio(e.target.value)}
                      placeholder={lang === "ar" ? "اكتب محاسنه الحياتية، أعماله التضامنية بالبلدة، خصاله أو دعاء خالصاً لروحه وسيرته الطاهرة..." : "Bio details..."}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-850 text-right leading-relaxed font-sans"
                    />
                  </div>
                </div>

                <div className="md:col-span-4 space-y-3 flex flex-col justify-between font-sans">
                  <div>
                    <label className="block text-[11px] font-black text-stone-700 mb-1">
                      {lang === "ar" ? "إرفاق صورة تذكارية:" : "Deceased Commemorative Photo:"}
                    </label>
                    
                    {/* Drag and Drop Container */}
                    <div
                      onDragEnter={handlePassedDrag}
                      onDragOver={handlePassedDrag}
                      onDragLeave={handlePassedDrag}
                      onDrop={handlePassedDrop}
                      className={`border-2 border-dashed rounded-xl p-3 text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                        newPassedDragActive 
                          ? "border-amber-700 bg-amber-50" 
                          : "border-stone-300 bg-stone-50 hover:bg-stone-100"
                      }`}
                    >
                      <input
                        type="file"
                        id="passed-file-uploader"
                        accept="image/*"
                         onChange={handlePassedFileInputChange}
                        className="hidden"
                      />
                      <label htmlFor="passed-file-uploader" className="w-full cursor-pointer">
                        {newPassedFileBase64 ? (
                          <div className="relative">
                            <img
                              src={newPassedFileBase64}
                              alt="Preview"
                              className="w-16 h-16 object-cover mx-auto rounded-lg border border-stone-300"
                            />
                            <span className="text-[9px] text-emerald-800 font-bold block mt-1">✓ تم تحميل الصورة بنجاح</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <UploadCloud className="w-6 h-6 text-stone-400 mx-auto" />
                            <span className="text-[10px] text-stone-500 block">اسحب صورتك هنا أو تصفح الملفات المتاحة</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-stone-400 text-[10px] block mb-2">أو ضع رابط صورة مباشر من الإنترنت:</span>
                    <input
                      type="text"
                      value={newPassedUrl}
                      onChange={(e) => setNewPassedUrl(e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-[10px] text-stone-900 focus:outline-none focus:border-amber-850 text-left font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#5C4033] hover:bg-[#4A3228] text-white rounded-xl py-2 px-3 text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm mt-3"
                  >
                    <Heart className="w-4 h-4 text-rose-300 animate-pulse fill-rose-300" />
                    <span>{lang === "ar" ? "تخليد الذكرى وحفظها بالروضة" : "Save Memorial Record"}</span>
                  </button>
                </div>

              </form>
            </div>

            {/* List of memorials */}
            <div className="space-y-4 font-sans">
              <h4 className="text-xs sm:text-sm font-black text-stone-900 border-b border-stone-200 pb-2 mb-2 text-right">
                {lang === "ar" ? "🕊️ لوحة الخلود لراحلين عين طبرنق" : "Ancestor Gallery"}
              </h4>

              {passedLovedOnes.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-sm font-sans text-center">
                  {lang === "ar" ? "المرقد الشريف فارغ حالياً، شاركنا أول صورة لفقيد غالي!" : "No Memorials yet."}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
                  {passedLovedOnes.map((item) => (
                    <div key={item.id} className="bg-[#FAF9F6] rounded-3xl border border-amber-900/10 p-5 flex flex-col justify-between hover:shadow-md transition-all duration-300 group text-right font-sans">
                      
                      {/* Profile Header */}
                      <div>
                        <div className="flex flex-col sm:flex-row-reverse gap-4 items-center sm:items-start text-center sm:text-right">
                          {/* Picture with premium sepia hover effect */}
                          <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden shadow-md border-2 border-white bg-white">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover transition-all duration-700 filter grayscale group-hover:grayscale-0 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          {/* Text info */}
                          <div className="space-y-1 flex-1 font-sans">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-1 sm:gap-2">
                              <h5 className="text-sm sm:text-base font-black text-[#5C4033] font-sans text-right">{item.name}</h5>
                              <span className="font-mono text-xs text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 self-center sm:self-auto shrink-0 font-bold">
                                {item.dates}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-amber-800 font-sans text-right">{item.relation}</p>
                            <p className="text-xs text-stone-600 mt-2 leading-relaxed text-right font-sans">
                              {item.bio}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Tributes & Comments section below each photo */}
                      <div className="mt-5 pt-4 border-t border-stone-200/80 space-y-4">
                        
                        {/* Actions bar (Candles / Likes / Share) */}
                        <div className="flex flex-wrap gap-2 justify-between items-center bg-white/60 p-2 rounded-xl border border-stone-150">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleLightCandle(item.id)}
                              className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-[#5C4033] px-3.5 py-1.5 rounded-xl text-[10px] font-black transition-all font-sans"
                            >
                              <span>🕯️ {lang === "ar" ? "أوقد شمعة ترحم" : "Light Candle"}</span>
                              <span className="font-mono bg-white/90 px-2 py-0.2 rounded-md text-amber-950 font-bold">
                                {item.candles || 0}
                              </span>
                            </button>

                            <ShareButtons 
                              title={item.name}
                              text={`${item.relation} - ${item.bio}`}
                              url={item.imageUrl}
                              lang={lang}
                            />
                          </div>

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeletePassed(item.id)}
                              className="text-red-500 hover:text-red-750 flex items-center gap-1 text-[10px] font-mono font-black border border-red-200 bg-red-50 px-2 py-1 rounded-md"
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                              <span>{lang === "ar" ? "حذف (أدمين)" : "Delete Record"}</span>
                            </button>
                          )}
                        </div>

                        {/* Dynamic Comments List */}
                        <div className="space-y-2 font-sans">
                          <span className="text-[10px] font-black text-stone-500 block font-sans text-right">
                            {lang === "ar" ? "💬 دعوات وتذكارات أهالي وزوار القرية:" : "Visitor Comments & Prayers:"}
                          </span>

                          {(!item.comments || item.comments.length === 0) ? (
                            <p className="text-[10px] text-stone-400 italic text-right bg-white p-1.5 rounded-lg text-center font-sans">
                              {lang === "ar" ? "لا توجد أدعية مكتوبة بعد. اكتب دعاءً طيباً لفقيدنا الكريم أدناه لتبقى ذكراه." : "No prayers yet."}
                            </p>
                          ) : (
                            <div className="space-y-2 max-h-[160px] overflow-y-auto bg-stone-50 p-2.5 rounded-xl border border-stone-150 text-right font-sans">
                              {item.comments.map((cmt: any) => (
                                <div key={cmt.id} className="text-right text-[11px] leading-relaxed border-b border-stone-200/50 pb-1.5 last:border-b-0 last:pb-0 font-sans">
                                  <div className="flex justify-between items-center mb-0.5">
                                    <span className="text-[9px] text-stone-400 font-mono">
                                      {new Date(cmt.date).toLocaleDateString(lang === "ar" ? 'ar-TN' : 'fr-TN', { day: 'numeric', month: 'short' })}
                                    </span>
                                    <span className="font-bold text-[#5C4033] bg-[#FAF6F0] px-1.5 py-0.2 rounded-sm border border-stone-200">{cmt.author}</span>
                                  </div>
                                  <p className="text-stone-700 bg-white/70 p-1.5 rounded-lg mt-1 border border-stone-200 font-sans">{cmt.text}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Comment Form */}
                        <form onSubmit={(e) => handleAddPassedComment(e, item.id)} className="space-y-2 bg-stone-100/50 p-2.5 rounded-xl border border-stone-200 font-sans">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={passedCommentTexts[item.id] || ""}
                              required
                              onChange={(e) => setPassedCommentTexts({ ...passedCommentTexts, [item.id]: e.target.value })}
                              placeholder={lang === "ar" ? "اكتب دعاءً أو ترحماً (مثال: رحمه الله وغفر له)..." : "Write a prayer or comment..."}
                              className="flex-1 bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-[11px] text-stone-900 focus:outline-none focus:border-amber-850 text-right font-sans"
                            />
                            <input
                              type="text"
                              value={passedCommentAuthors[item.id] || ""}
                              onChange={(e) => setPassedCommentAuthors({ ...passedCommentAuthors, [item.id]: e.target.value })}
                              placeholder={lang === "ar" ? "اسمك الكريم" : "Your Name"}
                              className="w-1/3 min-w-[70px] bg-white border border-stone-300 rounded-lg px-2 py-1 text-[11px] text-stone-900 focus:outline-none focus:border-amber-850 text-right font-sans"
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full bg-[#FAF6F0] hover:bg-amber-100/80 text-[#5C4033] border border-amber-900/10 rounded-lg py-1 px-3 text-[10px] font-bold transition-all flex items-center justify-center gap-1 font-sans"
                          >
                            <Send className="w-3 h-3 text-[#5C4033]" />
                            <span>{lang === "ar" ? "إرسال الدعاء العطر والتعليق" : "Post Tribute Comment"}</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Independent Administrator Contact Section - Agricultural Soil & Olive Forest Theme */}
      {(navigationMode === "all" || activeSection === "contact-section") && (
        <section 
          id="contact-section" 
          style={getSectionBgStyle("contact", "").style} 
          className={`py-16 border-t relative overflow-hidden ${getSectionBgStyle("contact", isDarkMode ? "bg-gradient-to-b from-[#0F1C0D] via-zinc-950 to-[#122310] border-zinc-850" : "bg-gradient-to-b from-[#F3F7EF] via-[#EAEFE2] to-[#F3F7EF] border-stone-200").className}`}
        >
        {getSectionBgStyle("contact", "").hasOverlay && (
          <div className="absolute inset-0 z-0 pointer-events-none" style={getSectionBgStyle("contact", "").overlayStyle} />
        )}
        {/* Subtle decorative background badges */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60 -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-50 rounded-full blur-3xl opacity-50 -ml-20 -mb-20 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2 font-sans">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#5C4033] bg-amber-100/55 px-3 py-1 rounded-full border border-amber-200/50 inline-block font-sans">
              {lang === "ar" ? "📞 فضاء التواصل العام" : lang === "fr" ? "📞 Espace de Communication" : "📞 Communication Hub"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#5C4033] tracking-tight leading-tight font-sans">
              {lang === "ar" ? "تواصل مباشرة مع إدارة البوابة" : lang === "fr" ? "Contacter le Superviseur du Portail" : "Contact the Portal Administrator"}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed font-sans text-right sm:text-center">
              {lang === "ar" 
                ? "إذا كان لديك اقتراح، شراكة علمية، مساعدة اجتماعية، أو ترغب في توثيق جزء من تاريخ قريتك المباركة، يسعدنا جداً استقبال رسالتك."
                : lang === "fr"
                ? "Pour toute suggestion, partenariat, signalement d'erreur historique, أو بروتوكول تضامن، لا تتردد في مراسلتنا."
                : "Whether you have constructive suggestions, historical contributions, or civic initiatives for our village, we'd love to hear from you."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left/Contact Column (5 Cols) */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-6 text-right">
                
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-stone-400 block uppercase tracking-wider">
                    {lang === "ar" ? "البريد الإلكتروني الرسمي للمشرف" : "Official Administrator Email"}
                  </span>
                  <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-150 hover:border-emerald-700/30 transition-all select-all group">
                    <span className="p-2.5 bg-emerald-100 rounded-xl text-emerald-950 shrink-0 group-hover:scale-105 transition-transform">
                      <Mail className="w-5 h-5 text-emerald-999" />
                    </span>
                    <div className="text-right">
                      <span className="text-[9px] text-stone-400 font-bold block">{lang === "ar" ? "ارسل بريداً إلكترونياً" : "Official Email"}</span>
                      <a href="mailto:contact@tebournok.com" className="text-xs sm:text-sm font-black text-emerald-900 hover:underline font-mono">
                        contact@tebournok.com
                      </a>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-stone-400 block uppercase tracking-wider">
                    {lang === "ar" ? "الموقع الجغرافي" : "Geographic Location"}
                  </span>
                  <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-150 transition-all group">
                    <span className="p-2.5 bg-amber-100 rounded-xl text-amber-950 shrink-0 group-hover:scale-105 transition-transform">
                      <MapPin className="w-5 h-5 text-amber-950" />
                    </span>
                    <div className="text-right">
                      <span className="text-[9px] text-stone-400 font-bold block">{lang === "ar" ? "العنوان البريدي" : "Postal Address"}</span>
                      <p className="text-xs sm:text-sm font-black text-stone-700">
                        {lang === "ar" ? "عين طبرنق، قرمبالية، نابل، تونس" : "Ain Tebournok, Grombalia, Nabeul"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 📬 Direct Inbox Portal Button for the Administrator */}
                <div className="space-y-2 pt-4 border-t border-stone-100 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-stone-400 block uppercase tracking-wider">
                    {lang === "ar" ? "صندوق رسائل المشرف" : "Supervisor Inbox Console"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (isAdmin) {
                        setIsInboxOpen(true);
                      } else {
                        setIsAdminModalOpen(true);
                      }
                    }}
                    className="w-full flex items-center justify-between bg-blue-50/40 hover:bg-blue-50 p-3.5 rounded-2xl border border-blue-100 hover:border-blue-300 transition-all group text-right"
                  >
                    <span className="p-2.5 bg-blue-600 rounded-xl text-white shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                      <Inbox className="w-5 h-5 text-white" />
                    </span>
                    <div className="text-right flex-1 pr-3.5">
                      <span className="text-[9px] text-blue-500 font-bold block">
                        {isAdmin ? (lang === "ar" ? "● صلاحية كاملة نشطة - انقر للفتح" : "● Full access active - Click to open") : (lang === "ar" ? "🔒 يتطلب رمز مرور المشرف" : "🔒 Requires admin passcode")}
                      </span>
                      <span className="text-xs sm:text-sm font-black text-blue-900 font-sans">
                        {lang === "ar" ? "📬 فتح صندوق الرسائل المباشر" : "📬 Open Message Inbox"}
                      </span>
                    </div>
                  </button>
                </div>

              </div>
            </div>

            {/* Right/Message Form Column (7 Cols) */}
            {contactFormSuccess ? (
              <div className="md:col-span-7 bg-emerald-50 p-8 rounded-3xl border border-emerald-200 text-center space-y-4 animate-fade-in flex flex-col items-center justify-center">
                <div className="p-3 bg-emerald-100 text-emerald-800 rounded-full">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-black text-emerald-950">
                  {lang === "ar" ? "✅ تم الإرسال والتنبيه بنجاح!" : "✅ Sent and Notified Successfully!"}
                </h4>
                <p className="text-xs text-emerald-800 max-w-md font-sans leading-relaxed">
                  {lang === "ar" 
                    ? "شكراً لتواصلك الكريم! تم تسجيل رسالتك بنجاح في صندوق بريد المشرف، كما تم إرسال إشعار فوري إلى المشرف عبر البريد الإلكتروني aintebournouk.tunisia@gmail.com"
                    : "Thank you for your message! It has been recorded in the supervisor's inbox, and an instant alert has been dispatched to aintebournouk.tunisia@gmail.com"}
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="md:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-right">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5C4033]">{lang === "ar" ? "الاسم الكريم" : "Name"}</label>
                    <input 
                      type="text" 
                      required 
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder={lang === "ar" ? "مثال: أحمد بن علي" : "e.g. John Doe"} 
                      className="w-full text-xs p-3 border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-1 focus:ring-[#5C4033] text-right text-stone-900 font-sans font-medium" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5C4033]">{lang === "ar" ? "البريد الإلكتروني" : "Email"}</label>
                    <input 
                      type="email" 
                      required 
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="name@example.com" 
                      className="w-full text-xs p-3 border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-1 focus:ring-[#5C4033] text-right text-stone-900 font-sans font-medium" 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5C4033]">{lang === "ar" ? "عنوان الرسالة" : "Subject"}</label>
                  <input 
                    type="text" 
                    required 
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    placeholder={lang === "ar" ? "أمر يخص بوابة عين طبرنق" : "Subject"} 
                    className="w-full text-xs p-3 border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-1 focus:ring-[#5C4033] text-right text-stone-900 font-sans font-medium" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5C4033]">{lang === "ar" ? "نص الرسالة" : "Message"}</label>
                  <textarea 
                    rows={4} 
                    required 
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder={lang === "ar" ? "اكتب رسالتك هنا بالتفصيل..." : "Write message text..."} 
                    className="w-full text-xs p-3 border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-1 focus:ring-[#5C4033] text-right text-[#5C4033] font-sans font-medium"
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={isContactSubmitting}
                  className="w-full py-3 bg-[#5C4033] hover:bg-[#3d2a20] text-white rounded-xl text-xs font-black shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>
                    {isContactSubmitting 
                      ? (lang === "ar" ? "جاري الإرسال..." : "Sending...") 
                      : (lang === "ar" ? "إرسال الرسالة وتنبيه المشرف" : "Submit Message & Alert Admin")}
                  </span>
                </button>
              </form>
            )}

          </div>
        </div>
      </section>
      )}

      {/* 📱 Mobile Application & Google Cloud Deployment Gate */}
      {(navigationMode === "all" || activeSection === "mobile-deployment-section") && (
        <section 
          id="mobile-deployment-section" 
          className={`py-16 border-t relative overflow-hidden transition-all duration-300 ${
            isDarkMode 
              ? "bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border-zinc-800 text-zinc-100" 
              : "bg-gradient-to-b from-stone-50 via-purple-50/20 to-stone-50 border-stone-200 text-stone-900"
          }`}
        >
        {/* Ambient subtle blur glow behind */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-10">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50 rounded-full font-black uppercase tracking-wider">
              <Smartphone className="w-3.5 h-3.5" />
              {lang === "ar" ? "تطبيق الجوال" : "Mobile App"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#5C4033] dark:text-amber-400 font-sans tracking-tight leading-tight">
              {lang === "ar" ? "📱 حمّل دليل عين طبرنق على جوالك" : "Get Ain Tebournok Mobile App"}
            </h2>
          </div>

          {/* Quick installation Banner / Action */}
          <div className="bg-white dark:bg-zinc-900/90 border border-stone-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* App Icon preview mockup & PWA description - taking 5 cols */}
              <div className="md:col-span-5 flex flex-col sm:flex-row md:flex-col gap-4 items-center sm:items-start text-center sm:text-right md:text-right">
                <img 
                  src="/icon.jpg" 
                  alt="App Icon" 
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-[#5C4033]/20 dark:border-amber-400/30 shadow-lg shrink-0 animate-pulse"
                />
                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-black text-stone-900 dark:text-zinc-100 font-sans leading-tight">
                    {lang === "ar" ? "عين طبرنق — قريتي المنسية" : "Ain Tebournok Guide"}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-stone-400 dark:text-zinc-500 font-mono">
                    Version 1.0.0 (PWA Enabled)
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    {lang === "ar" ? "✓ جاهز للتثبيت السريع دون استهلاك مساحة" : "✓ Light, fast and zero-storage install"}
                  </p>
                  <p className="text-[11px] text-stone-500 dark:text-zinc-400 leading-relaxed mt-2">
                    {lang === "ar" 
                      ? "يدعم هذا التطبيق العمل دون إنترنت، وتصفح الأماكن الأثرية، والاستماع إلى إذاعة القرية الروحية، ومحادثة العم أحمد الذكية فور التثبيت!" 
                      : "Supports offline access, village radio streams, historical guides, and interactive AI Chat directly after installation!"}
                  </p>
                </div>
              </div>

              {/* Install Actions & Manual instructions - taking 4 cols */}
              <div className="md:col-span-4 flex flex-col gap-3 justify-center w-full">
                {showPWAInstallBtn ? (
                  <button
                    onClick={async () => {
                      if (!deferredPrompt) return;
                      deferredPrompt.prompt();
                      const { outcome } = await deferredPrompt.userChoice;
                      if (outcome === 'accepted') {
                        setDeferredPrompt(null);
                        setShowPWAInstallBtn(false);
                      }
                    }}
                    className="w-full px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{lang === "ar" ? "تثبيت التطبيق على جوالك فوراً" : "Install App Instantly"}</span>
                  </button>
                ) : (
                  <div className="p-3.5 bg-stone-50 dark:bg-zinc-950 rounded-2xl border border-stone-200/60 dark:border-zinc-850 text-right space-y-1.5">
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-black block uppercase tracking-wider">
                      {lang === "ar" ? "💡 كيف تقوم بتثبيته يدوياً؟" : "💡 How to install manually?"}
                    </span>
                    <p className="text-[11px] leading-relaxed text-stone-600 dark:text-zinc-400">
                      {lang === "ar" ? (
                        <>
                          • <strong>للأندرويد:</strong> افتح المتصفح، انقر على زر الخيارات <span className="font-sans font-bold">⋮</span> ثم اختر <strong className="text-purple-600">"تثبيت التطبيق"</strong>.<br/>
                          • <strong>للأيفون (Safari):</strong> انقر زر <strong className="text-purple-600">"مشاركة" (Share)</strong> ثم اختر <strong className="text-purple-600">"إضافة للشاشة الرئيسية"</strong>.
                        </>
                      ) : (
                        <>
                          • <strong>Android:</strong> Open browser, tap <span className="font-sans font-bold">⋮</span> and select <strong className="text-purple-600">"Install App"</strong>.<br/>
                          • <strong>iPhone (Safari):</strong> Tap the <strong className="text-purple-600">"Share"</strong> icon, then select <strong className="text-purple-600">"Add to Home Screen"</strong>.
                        </>
                      )}
                    </p>
                  </div>
                )}

                {/* Direct Link copy block */}
                <div className="p-3.5 bg-[#5C4033]/5 dark:bg-amber-400/5 rounded-2xl border border-[#5C4033]/10 dark:border-amber-400/10 flex items-center justify-between gap-2">
                  <button 
                    onClick={() => {
                      if (!pwaAppUrl) return;
                      navigator.clipboard.writeText(pwaAppUrl);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2500);
                    }}
                    disabled={!pwaAppUrl}
                    className="px-2.5 py-1.5 bg-[#5C4033] hover:bg-[#463026] dark:bg-amber-400 dark:hover:bg-amber-500 disabled:bg-stone-200 disabled:text-stone-400 text-white dark:text-stone-950 text-[10px] font-black rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    {copiedLink ? (lang === "ar" ? "تم النسخ!" : "Copied!") : (lang === "ar" ? "نسخ الرابط" : "Copy Link")}
                  </button>
                  <div className="text-right overflow-hidden">
                    <span className="text-[9px] text-stone-400 dark:text-zinc-500 block font-mono font-bold">
                      {lang === "ar" ? "رابط الوصول المباشر" : "Direct Share Link"}
                    </span>
                    <span className="text-[11px] font-mono text-stone-600 dark:text-zinc-400 truncate block text-left direction-ltr">
                      {pwaAppUrl || (lang === "ar" ? "قيد النشر السحابي من المشرف" : "Awaiting cloud publishing")}
                    </span>
                  </div>
                </div>
              </div>

              {/* 🎯 Interactive QR Code Scanner Block - taking 3 cols */}
              <div className="md:col-span-3 flex flex-col items-center justify-center p-4 bg-stone-50 dark:bg-zinc-950 rounded-2xl border border-stone-200/50 dark:border-zinc-850 text-center space-y-2.5">
                <span className="text-[10px] text-stone-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                  {lang === "ar" ? "🔍 امسح لفتح التطبيق" : "🔍 Scan to Open App"}
                </span>
                
                {/* QR Code image fetched from safe Google API */}
                <div className="p-2.5 bg-white rounded-xl shadow-inner border border-stone-200/80 w-32 h-32 flex items-center justify-center">
                  {pwaQrUrl ? (
                    <img 
                      src={pwaQrUrl}
                      alt="QR Code"
                      className="w-28 h-28 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-[10px] text-stone-400 dark:text-zinc-500 text-center font-bold font-sans">
                      {lang === "ar" ? "سيتم توفير الرمز قريباً" : "Awaiting QR Code"}
                    </div>
                  )}
                </div>

                <div className="space-y-0.5">
                  <span className="text-[11px] font-black text-[#5C4033] dark:text-amber-400 block">
                    {lang === "ar" ? "امسح بجوالك مباشرة" : "Scan with phone camera"}
                  </span>
                  <p className="text-[9px] text-stone-400 dark:text-zinc-500 max-w-[150px] mx-auto leading-tight">
                    {lang === "ar" ? "وجه كاميرا الهاتف نحو الرمز لفتح وتنزيل الدليل فوراً" : "Point your phone camera to instantly load and install the guide"}
                  </p>
                </div>
              </div>

            </div>



          </div>

        </div>
      </section>
      )}

      {/* Unified Administration Terminal Section - Admin Terminal Technical Theme */}
      {(navigationMode === "all" || activeSection === "admin-console-section") && (
        <section id="admin-console-section" className={`py-16 border-y relative overflow-hidden transition-all duration-300 ${
          isDarkMode 
            ? "bg-gradient-to-tr from-[#111315] via-[#1A1D20] to-[#111315] border-zinc-800 text-zinc-100" 
            : "bg-gradient-to-tr from-[#F1F3F5] via-[#E9ECEF] to-[#F1F3F5] border-stone-200 text-stone-900"
        }`}>
        {/* Ambient lighting indicators */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-8 font-sans">
          
          <div className="text-center max-w-2xl mx-auto space-y-2 font-sans text-right">
            <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border inline-block ${
              isDarkMode 
                ? "bg-zinc-800/80 border-zinc-700 text-emerald-400" 
                : "bg-emerald-100 border-emerald-200 text-emerald-950"
            }`}>
              {lang === "ar" ? "🔒 الإدارة الموحدة للبوابة" : "🔒 Consolidated Administration Console"}
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              {lang === "ar" ? "لوحة التحكم الأمنية المشتركة" : "Unified Administrative Access"}
            </h2>
            <p className={`text-xs sm:text-sm font-medium leading-relaxed font-sans ${
              isDarkMode ? "text-zinc-400" : "text-stone-500"
            }`}>
              {lang === "ar" 
                ? "تسجيل الدخول هنا يمنحك صلاحيات الإدارة الكاملة الموحدة لكافة أقسام البوابة (تعديل شريط الأخبار، رفع صور المعرض، الإشراف الفوري، وحذف المحتوى الموثق)."
                : "Authenticating through this central terminal activates global administrator credentials, enabling full editing rights over news tickers, media uploads, and community systems."}
            </p>
          </div>

          <div className={`max-w-2xl mx-auto rounded-3xl border p-6 sm:p-8 transition-colors duration-300 ${
            isDarkMode 
              ? "bg-zinc-900 border-zinc-800 shadow-2xl" 
              : "bg-white border-stone-200 shadow-sm"
          }`}>
            
            {/* Status Indicator Bar */}
            <div className={`flex flex-col sm:flex-row justify-between items-center pb-6 border-b gap-4 mb-6 ${
              isDarkMode ? "border-zinc-800" : "border-stone-150"
            }`}>
              <div className="flex items-center gap-2.5 text-right w-full sm:w-auto justify-end">
                <div>
                  <span className={`text-[9px] uppercase font-bold tracking-wider block ${
                    isDarkMode ? "text-zinc-500" : "text-stone-400"
                  }`}>
                    {lang === "ar" ? "حالة ترخيص الجلسة:" : "Session Privilege Level:"}
                  </span>
                  <div className="flex items-center gap-1.5 justify-end">
                    {isAdmin ? (
                      <span className="text-xs font-black text-emerald-500 flex items-center gap-1">
                        ● {lang === "ar" ? "وضع المشرف نشط (صلاحيات كاملة)" : "Global Admin Active"}
                      </span>
                    ) : (
                      <span className={`text-xs font-black flex items-center gap-1 ${
                        isDarkMode ? "text-zinc-400" : "text-stone-500"
                      }`}>
                        ● {lang === "ar" ? "الوضع التعريفي العام (مقيد)" : "Read-Only Visitor Mode"}
                      </span>
                    )}
                  </div>
                </div>
                <div className={`p-2.5 rounded-2xl ${
                  isAdmin 
                    ? "bg-emerald-500/10 text-emerald-400" 
                    : isDarkMode 
                    ? "bg-zinc-800 text-zinc-400" 
                    : "bg-stone-100 text-stone-500"
                }`}>
                  {isAdmin ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>
              </div>

              <div className="shrink-0">
                {isAdmin ? (
                  <button
                    onClick={handleAdminLogout}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors"
                  >
                    {lang === "ar" ? "إغلاق الجلسة وقفل الصلاحيات" : "Revoke Permissions & Lock"}
                  </button>
                ) : (
                  <span className={`text-[10px] font-bold ${
                    isDarkMode ? "text-zinc-400" : "text-stone-500"
                  }`}>
                    {lang === "ar" ? "يرجى كتابة رمز المرور بالأسفل للفتح" : "Enter access code below to login"}
                  </span>
                )}
              </div>
            </div>

            {/* If logged out: Show unified login form */}
            {!isAdmin ? (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (adminPasswordInput === adminPassword) {
                    setIsAdmin(true);
                    localStorage.setItem("tebournok_is_admin", "true");
                    setIsInboxOpen(true);
                    setAdminPasswordInput("");
                    setAdminLoginError("");
                  } else {
                    setAdminLoginError(lang === "ar" ? "رمز المرور الموحد خاطئ!" : "Incorrect unified passcode!");
                  }
                }} 
                className="space-y-4 text-right"
              >
                <div className="space-y-1.5 font-sans">
                  <label className="block text-xs font-bold text-stone-600">
                    {lang === "ar" ? "ادخل كلمة السر الموحدة لكافة الأقسام:" : "Enter Consolidated Administration Code:"}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="••••"
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      className={`w-full text-center text-sm p-3 border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-800 font-mono tracking-widest ${
                        isDarkMode ? "bg-zinc-950 border-zinc-800 text-zinc-100" : "bg-stone-50 border-stone-250 text-stone-900"
                      }`}
                    />
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-stone-400" />
                    </div>
                  </div>
                </div>

                {adminLoginError && (
                  <p className="text-[10px] text-red-500 font-bold bg-red-50 dark:bg-red-950/20 p-2.5 rounded-lg border border-red-200 text-center">
                    {adminLoginError}
                  </p>
                )}

                <div className={`p-3 rounded-2xl text-[10px] leading-relaxed border flex items-start gap-2.5 text-right justify-end ${
                  isDarkMode 
                    ? "bg-zinc-950/55 border-zinc-800 text-zinc-400" 
                    : "bg-blue-50/50 border-blue-100 text-blue-900"
                }`}>
                  <p className="flex-1">
                    {lang === "ar" 
                      ? "الدخول الافتراضي التجريبي للمشرف هو 99633891. بعد تفعيل وضع المشرف، ستتمكن فوراً من تعديل وإضافة وإلغاء أي منشور أو صورة مباشرة على كافة المستويات، بالإضافة لإمكانية تغيير كلمة المرور بالأسفل."
                      : "Default system testing passcode is 99633891. After logging in, you can modify headers, add real pictures, delete bulletins, and fully customize settings."}
                  </p>
                  <span className="text-emerald-500 text-sm">💡</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-xs font-black bg-emerald-900 hover:bg-emerald-950 text-white transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Unlock className="w-4 h-4 text-white" />
                  <span>{lang === "ar" ? "تفعيل الصلاحيات الشاملة للموقع" : "Unlock Unified Privileges"}</span>
                </button>
              </form>
            ) : (
              // If logged in: Show consolidated Password Change Manager right there at the bottom!
              <div className="space-y-6 text-right font-sans">
                <div className={`p-4 rounded-2xl border ${
                  isDarkMode ? "bg-emerald-950/20 border-emerald-800 text-emerald-300" : "bg-emerald-50 border-emerald-100 text-emerald-950"
                }`}>
                  <h4 className="text-xs font-bold mb-1 flex items-center gap-1.5 justify-end">
                    <span>{lang === "ar" ? "✨ الصلاحيات الشاملة للموقع بكامله مفعلة حالياً" : "✨ Administrative Privileges Active"}</span>
                  </h4>
                  <p className="text-[10px] font-medium leading-relaxed">
                    {lang === "ar" 
                      ? "أنت في وضع الإشراف الكامل الآن. يمكنك تصفح الموقع بالكامل وتعديل الأخبار العاجلة وإضافة/حذف صور المعرض وإدارة الإذاعة المحلية بكل حرية." 
                      : "You are currently running the system in Unified Administrative Mode. You can fully manage news, gallery items, and radio streams."}
                  </p>
                </div>

                {/* Section Background & Styling Controller */}
                <div className={`p-4 rounded-2xl border space-y-4 ${
                  isDarkMode ? "bg-zinc-950 border-zinc-800" : "bg-emerald-50/10 border-emerald-100"
                }`}>
                  <h3 className="text-xs font-black text-emerald-500 flex items-center gap-1.5 justify-end">
                    <span>🎨 {lang === "ar" ? "تخصيص خلفيات وثيمات الأقسام" : "🎨 Customize Section Backgrounds"}</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 text-right">
                      <label className="block text-[10px] font-bold text-stone-500">
                        {lang === "ar" ? "اختر القسم لتخصيص خلفيته:" : "Select Section to Customize:"}
                      </label>
                      <select
                        value={editingSectionKey}
                        onChange={(e) => setEditingSectionKey(e.target.value)}
                        className={`w-full text-xs p-2 border rounded-xl focus:outline-none ${
                          isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-stone-250 text-stone-900"
                        }`}
                      >
                        <option value="about">{lang === "ar" ? "ℹ️ حول القرية والتعريف" : "About Section"}</option>
                        <option value="news">{lang === "ar" ? "📢 الأخبار بالتفصيل" : "Detailed News"}</option>
                        <option value="quick-tab">{lang === "ar" ? "🏛️ المعالم والتاريخ" : "Sightseeing & History"}</option>
                        <option value="council">{lang === "ar" ? "🏛️ المجلس البلدي" : "Community Council"}</option>
                        <option value="chat">{lang === "ar" ? "💬 مستشار الذكاء الاصطناعي" : "AI Advisor"}</option>
                        <option value="appeal">{lang === "ar" ? "🚨 نداء الاستغاثة والبنية التحتية" : "Human Appeal"}</option>
                        <option value="interactive-map">{lang === "ar" ? "🗺️ الخريطة التفاعلية" : "Interactive Map"}</option>
                        <option value="joys">{lang === "ar" ? "🌸 أفراحنا ومناسبات القرية" : "Joys & Weddings"}</option>
                        <option value="passed">{lang === "ar" ? "🕊️ لوحة الخلود (الأحزان)" : "Memorial Section"}</option>
                        <option value="contact">{lang === "ar" ? "📬 تواصل معنا وصندوق الرسائل" : "Contact Box"}</option>
                      </select>
                    </div>

                    <div className="space-y-1 text-right">
                      <label className="block text-[10px] font-bold text-stone-500">
                        {lang === "ar" ? "نوع الخلفية للقسم المحدد:" : "Background Type:"}
                      </label>
                      <div className="flex gap-2 justify-end pt-1">
                        {[
                          { id: 'default', ar: 'الافتراضي', en: 'Default' },
                          { id: 'color', ar: 'لون سادة', en: 'Solid Color' },
                          { id: 'image', ar: 'صورة خلفية', en: 'Image' }
                        ].map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => updateSingleSectionBg(editingSectionKey, 'type', t.id)}
                            className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-all ${
                              (sectionBgs[editingSectionKey]?.type || 'default') === t.id
                                ? "bg-emerald-800 text-white border-emerald-900 shadow-xs"
                                : isDarkMode
                                ? "bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-zinc-200"
                                : "bg-white border-stone-200 text-stone-605 hover:bg-stone-50"
                            }`}
                          >
                            {lang === "ar" ? t.ar : t.en}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Settings based on type */}
                  {(sectionBgs[editingSectionKey]?.type === 'color') && (
                    <div className="p-3 bg-stone-50 dark:bg-zinc-950 rounded-xl border border-stone-150 dark:border-zinc-850 space-y-3 animate-fade-in">
                      <p className="text-[9px] text-stone-500 dark:text-zinc-400 text-right">
                        {lang === "ar" ? "اختر لون الخلفية للوضعين الفاتح والمظلم:" : "Choose colors for both light and dark modes:"}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1 text-right">
                          <label className="block text-[9px] font-bold text-stone-500">
                            {lang === "ar" ? "الوضع الفاتح ☀️" : "Light Mode Color ☀️"}
                          </label>
                          <div className="flex gap-1.5 items-center justify-end">
                            <input
                              type="text"
                              value={sectionBgs[editingSectionKey]?.colorLight || '#ffffff'}
                              onChange={(e) => updateSingleSectionBg(editingSectionKey, 'colorLight', e.target.value)}
                              className={`w-16 text-center text-[10px] p-1 border rounded-lg ${
                                isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-stone-250 text-stone-900"
                              }`}
                            />
                            <input
                              type="color"
                              value={sectionBgs[editingSectionKey]?.colorLight || '#ffffff'}
                              onChange={(e) => updateSingleSectionBg(editingSectionKey, 'colorLight', e.target.value)}
                              className="w-7 h-7 rounded-lg border cursor-pointer shrink-0"
                            />
                          </div>
                        </div>

                        <div className="space-y-1 text-right">
                          <label className="block text-[9px] font-bold text-stone-500">
                            {lang === "ar" ? "الوضع المظلم 🌙" : "Dark Mode Color 🌙"}
                          </label>
                          <div className="flex gap-1.5 items-center justify-end">
                            <input
                              type="text"
                              value={sectionBgs[editingSectionKey]?.colorDark || '#000000'}
                              onChange={(e) => updateSingleSectionBg(editingSectionKey, 'colorDark', e.target.value)}
                              className={`w-16 text-center text-[10px] p-1 border rounded-lg ${
                                isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-stone-250 text-stone-900"
                              }`}
                            />
                            <input
                              type="color"
                              value={sectionBgs[editingSectionKey]?.colorDark || '#000000'}
                              onChange={(e) => updateSingleSectionBg(editingSectionKey, 'colorDark', e.target.value)}
                              className="w-7 h-7 rounded-lg border cursor-pointer shrink-0"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Preset color suggestions for pristine design */}
                      <div className="space-y-1 text-right border-t border-stone-200 dark:border-zinc-800 pt-2">
                        <span className="text-[8px] text-stone-400 font-bold block mb-1">{lang === "ar" ? "لوحة ألوان مقترحة لجمالية البوابة:" : "Suggested Aesthetic Presets:"}</span>
                        <div className="flex flex-wrap gap-1.5 justify-end">
                          {[
                            { name: 'ترابي دافئ 🌾', light: '#FAF8F5', dark: '#191612' },
                            { name: 'زمرد جبلي 🌲', light: '#EDF5F1', dark: '#091E16' },
                            { name: 'ينابيع زرقاء 💧', light: '#F3F7FA', dark: '#0F1821' },
                            { name: 'لافندر ريفي 🌸', light: '#FAF9FF', dark: '#131122' },
                            { name: 'رمال صحراوية 🏜️', light: '#FDFBF7', dark: '#241710' }
                          ].map((p, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                updateSingleSectionBg(editingSectionKey, 'colorLight', p.light);
                                updateSingleSectionBg(editingSectionKey, 'colorDark', p.dark);
                              }}
                              className="px-2 py-0.5 rounded-md text-[8px] font-bold border border-stone-200 dark:border-zinc-800 hover:scale-105 transition-transform flex items-center gap-1 bg-white dark:bg-zinc-900 text-stone-700 dark:text-zinc-300"
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.light }} />
                              <span>{p.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {(sectionBgs[editingSectionKey]?.type === 'image') && (
                    <div className="p-3 bg-stone-50 dark:bg-zinc-950 rounded-xl border border-stone-150 dark:border-zinc-850 space-y-3 animate-fade-in">
                      <div className="space-y-1 text-right">
                        <label className="block text-[9px] font-bold text-stone-500">
                          {lang === "ar" ? "رابط الصورة الخلفية (URL):" : "Custom Image URL:"}
                        </label>
                        <input
                          type="text"
                          required
                          value={sectionBgs[editingSectionKey]?.imageUrl || ''}
                          onChange={(e) => updateSingleSectionBg(editingSectionKey, 'imageUrl', e.target.value)}
                          placeholder={lang === "ar" ? "رابط مباشر للصورة..." : "https://example.com/image.jpg"}
                          className={`w-full text-xs p-2 border rounded-xl focus:outline-none ${
                            isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-stone-250 text-stone-900"
                          }`}
                        />
                      </div>

                      {/* Preset high quality landscapes */}
                      <div className="space-y-1 text-right border-t border-stone-200 dark:border-zinc-800 pt-2">
                        <span className="text-[8px] text-stone-400 font-bold block mb-1">{lang === "ar" ? "صور طبيعية وتراثية منتقاة لمجتمعنا:" : "Suggested Tunisian Backgrounds:"}</span>
                        <div className="flex flex-wrap gap-1.5 justify-end">
                          {[
                            { name: 'جبل وزيتون 🌳', url: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=800&q=80' },
                            { name: 'مياه وينابيع 💧', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80' },
                            { name: 'نقوش رومانية 🏛️', url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80' }
                          ].map((img, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => updateSingleSectionBg(editingSectionKey, 'imageUrl', img.url)}
                              className="px-2 py-0.5 rounded-md text-[8px] font-bold border border-stone-200 dark:border-zinc-800 hover:scale-105 transition-transform bg-white dark:bg-zinc-900 text-stone-700 dark:text-zinc-300"
                            >
                              {img.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1 text-right">
                        <div className="flex justify-between items-center text-[9px] font-bold text-stone-500">
                          <span>{sectionBgs[editingSectionKey]?.opacity ?? 70}%</span>
                          <span>{lang === "ar" ? "درجة وضوح وتعتيم الصورة (Overlay Opacity):" : "Image opacity overlay:"}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={sectionBgs[editingSectionKey]?.opacity ?? 70}
                          onChange={(e) => updateSingleSectionBg(editingSectionKey, 'opacity', parseInt(e.target.value, 10))}
                          className="w-full accent-emerald-800 cursor-pointer"
                        />
                        <span className="text-[8px] text-stone-400 block leading-tight">
                          {lang === "ar" ? "💡 تعتيم الغطاء يضمن وضوح النصوص والقراءة فوق صورة الخلفية." : "💡 Overlay allows texts to remain readable on top of backgrounds."}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Reset All Button */}
                  <div className="flex justify-between items-center pt-1.5 border-t border-stone-100 dark:border-zinc-850">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(lang === "ar" ? "هل أنت متأكد من إعادة تعيين جميع الخلفيات إلى الثيمات الافتراضية؟" : "Reset all background styles to default?")) {
                          const defaults = {
                            about: { type: 'default', colorLight: '#FAF8F5', colorDark: '#191612', imageUrl: '', opacity: 70 },
                            news: { type: 'default', colorLight: '#EDF5F1', colorDark: '#091E16', imageUrl: '', opacity: 70 },
                            'quick-tab': { type: 'default', colorLight: '#F3F7FA', colorDark: '#0F1821', imageUrl: '', opacity: 70 },
                            council: { type: 'default', colorLight: '#F2EDE4', colorDark: '#1C1814', imageUrl: '', opacity: 70 },
                            chat: { type: 'default', colorLight: '#FAF9FF', colorDark: '#131122', imageUrl: '', opacity: 70 },
                            appeal: { type: 'default', colorLight: '#FDFBF7', colorDark: '#241710', imageUrl: '', opacity: 70 },
                            'interactive-map': { type: 'default', colorLight: '#F3F4F6', colorDark: '#1E2024', imageUrl: '', opacity: 70 },
                            joys: { type: 'default', colorLight: '#FFF8F8', colorDark: '#221215', imageUrl: '', opacity: 70 },
                            passed: { type: 'default', colorLight: '#FAF6F0', colorDark: '#141210', imageUrl: '', opacity: 70 },
                            contact: { type: 'default', colorLight: '#F3F7EF', colorDark: '#0F1C0D', imageUrl: '', opacity: 70 },
                          };
                          saveSectionBgs(defaults);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg text-[9px] font-bold border border-red-200 hover:bg-red-50 text-red-600 dark:hover:bg-red-950/20 transition-all"
                    >
                      {lang === "ar" ? "🔄 إعادة تعيين كافة الأقسام" : "Reset All Backgrounds"}
                    </button>

                    <p className="text-[8px] text-stone-400 font-bold">
                      {lang === "ar" ? "✨ التغييرات تحفظ تلقائياً وتطبق فوراً على كامل أرجاء البوابة." : "✨ Live changes are saved and applied automatically."}
                    </p>
                  </div>
                </div>

                {/* 🛠️ Dynamic Website Customizer Form (Consolidated Brand, Slogans, Images, Fonts and texts!) */}
                <form onSubmit={handleSaveSiteSettings} className={`p-5 rounded-2xl border space-y-5 text-right ${
                  isDarkMode ? "bg-zinc-950 border-zinc-850" : "bg-[#f5f9f6] border-emerald-100"
                }`}>
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-zinc-800 pb-3">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-black">
                      GLOBAL CONTROL PANEL
                    </span>
                    <h3 className="text-sm font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 justify-end">
                      <span>🛠️ التحكم الكامل بالهوية، الخطوط وعناوين الموقع</span>
                    </h3>
                  </div>

                  {/* Group 1: Visual Identity & Slogans */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-stone-700 dark:text-zinc-300 border-r-2 border-emerald-500 pr-2">
                      ١. الهوية البصرية والشعارات والصور
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-stone-500">
                          رابط الشعار الموحد (Logo URL):
                        </label>
                        <input
                          type="text"
                          required
                          value={editLogoUrl}
                          onChange={(e) => setEditLogoUrl(e.target.value)}
                          className={`w-full text-xs p-2 border rounded-xl focus:outline-none ${
                            isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-stone-250 text-stone-900"
                          }`}
                        />
                        {editLogoUrl && (
                          <div className="flex items-center gap-2 mt-1.5 justify-end">
                            <span className="text-[9px] text-stone-400">معاينة الشعار:</span>
                            <img src={editLogoUrl} alt="Logo Preview" className="w-8 h-8 rounded-lg object-cover border" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-stone-500">
                          رابط صورة الغلاف الكبرى (Hero Cover URL):
                        </label>
                        <input
                          type="text"
                          required
                          value={editHeroCoverUrl}
                          onChange={(e) => setEditHeroCoverUrl(e.target.value)}
                          className={`w-full text-xs p-2 border rounded-xl focus:outline-none ${
                            isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-stone-250 text-stone-900"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <span className="block text-[10px] font-bold text-stone-500">
                        العناوين والشعارات الأساسية (في الهيدر وأعلى الموقع):
                      </span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-stone-400">العنوان بالعربية:</label>
                          <input
                            type="text"
                            required
                            value={editSiteTitleAr}
                            onChange={(e) => setEditSiteTitleAr(e.target.value)}
                            className={`w-full text-xs p-2 border rounded-xl ${
                              isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-stone-250 text-stone-900"
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-stone-400">العنوان بالفرنسية:</label>
                          <input
                            type="text"
                            required
                            value={editSiteTitleFr}
                            onChange={(e) => setEditSiteTitleFr(e.target.value)}
                            className={`w-full text-xs p-2 border rounded-xl ${
                              isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-stone-250 text-stone-900"
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-stone-400">العنوان بالإنجليزية:</label>
                          <input
                            type="text"
                            required
                            value={editSiteTitleEn}
                            onChange={(e) => setEditSiteTitleEn(e.target.value)}
                            className={`w-full text-xs p-2 border rounded-xl ${
                              isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-stone-250 text-stone-900"
                            }`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-stone-400">الشعار بالعربية:</label>
                          <input
                            type="text"
                            required
                            value={editSiteSloganAr}
                            onChange={(e) => setEditSiteSloganAr(e.target.value)}
                            className={`w-full text-xs p-2 border rounded-xl ${
                              isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-stone-250 text-stone-900"
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-stone-400">الشعار بالفرنسية:</label>
                          <input
                            type="text"
                            required
                            value={editSiteSloganFr}
                            onChange={(e) => setEditSiteSloganFr(e.target.value)}
                            className={`w-full text-xs p-2 border rounded-xl ${
                              isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-stone-250 text-stone-900"
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-stone-400">الشعار بالإنجليزية:</label>
                          <input
                            type="text"
                            required
                            value={editSiteSloganEn}
                            onChange={(e) => setEditSiteSloganEn(e.target.value)}
                            className={`w-full text-xs p-2 border rounded-xl ${
                              isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-stone-250 text-stone-900"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Group 2: Font Style & Size Multiplier */}
                  <div className="space-y-4 pt-3 border-t border-stone-200 dark:border-zinc-800">
                    <h4 className="text-xs font-bold text-stone-700 dark:text-zinc-300 border-r-2 border-emerald-500 pr-2">
                      ٢. تخصيص نوعية خطوط وحجم نصوص البوابة
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-stone-500">
                          نوع الخط المعتمد لكافة اللغات (Font Family):
                        </label>
                        <select
                          value={editFontFamilyChoice}
                          onChange={(e) => setEditFontFamilyChoice(e.target.value)}
                          className={`w-full text-xs p-2 border rounded-xl focus:outline-none ${
                            isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-stone-250 text-stone-900"
                          }`}
                        >
                          {AVAILABLE_FONTS.map(f => (
                            <option key={f.name} value={f.name}>{f.labelAr}</option>
                          ))}
                        </select>
                        <span className="text-[8px] text-stone-400 block leading-tight">
                          💡 تدعم هذه الخطوط الحروف العربية واللاتينية بالكامل بشكل فائق الجاذبية.
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-bold text-stone-500">
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                            {(editFontSizeMultiplier * 100).toFixed(0)}% (مقياس {editFontSizeMultiplier === 1.0 ? "طبيعي" : editFontSizeMultiplier > 1.0 ? "تكبير" : "تصغير"})
                          </span>
                          <span>مستوى تكبير أو تصغير الخطوط (Font Size):</span>
                        </div>
                        <div className="flex items-center gap-2.5 pt-1">
                          <span className="text-[9px] text-stone-400">٠.٨×</span>
                          <input
                            type="range"
                            min="0.8"
                            max="1.4"
                            step="0.05"
                            value={editFontSizeMultiplier}
                            onChange={(e) => setEditFontSizeMultiplier(parseFloat(e.target.value))}
                            className="w-full accent-emerald-800 cursor-pointer"
                          />
                          <span className="text-[9px] text-stone-400">١.٤×</span>
                        </div>
                        <span className="text-[8px] text-stone-400 block leading-tight">
                          💡 حرك المؤشر لتكبير أو تصغير كافة كتابات وعناوين الموقع دفعة واحدة وبطريقة متناسقة جداً مع الهواتف.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Group 3: Dynamic Writings (Translations) Editor */}
                  <div className="space-y-4 pt-3 border-t border-stone-200 dark:border-zinc-800">
                    <h4 className="text-xs font-bold text-stone-700 dark:text-zinc-300 border-r-2 border-emerald-500 pr-2">
                      ٣. تعديل نصوص وكتابات وعناوين البوابة بالكامل
                    </h4>

                    <div className="bg-stone-50 dark:bg-zinc-950 p-3 rounded-xl border space-y-3 text-right">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-stone-500">
                          اختر النص أو العنوان الذي تريد تعديله وتخصيصه بالموقع:
                        </label>
                        <select
                          id="admin-translation-key-select"
                          onChange={(e) => {
                            const val = e.target.value;
                            // Set custom text state to sync
                            const arInput = document.getElementById("edit-text-ar-input") as HTMLTextAreaElement;
                            const frInput = document.getElementById("edit-text-fr-input") as HTMLTextAreaElement;
                            const enInput = document.getElementById("edit-text-en-input") as HTMLTextAreaElement;
                            
                            const arVal = editCustomTranslations.ar?.[val] || TRANSLATIONS.ar[val as keyof typeof TRANSLATIONS.ar] || "";
                            const frVal = editCustomTranslations.fr?.[val] || TRANSLATIONS.fr[val as keyof typeof TRANSLATIONS.fr] || "";
                            const enVal = editCustomTranslations.en?.[val] || TRANSLATIONS.en[val as keyof typeof TRANSLATIONS.en] || "";
                            
                            if (arInput) arInput.value = arVal;
                            if (frInput) frInput.value = frVal;
                            if (enInput) enInput.value = enVal;
                          }}
                          className={`w-full text-xs p-2 border rounded-xl focus:outline-none ${
                            isDarkMode ? "bg-zinc-900 border-zinc-850 text-zinc-100" : "bg-white border-stone-250 text-stone-900"
                          }`}
                        >
                          <option value="heroTitle">العنوان الترحيبي الذهبي الكبير بالبواية</option>
                          <option value="heroSubtitle">نص الوصف الترحيبي أسفل العنوان الذهبي</option>
                          <option value="heroBadge">شارة البداية العلوية (عين طبرنق - قريتي المنسية)</option>
                          <option value="discoverBtn">عنوان زر تصفح القرية في الواجهة</option>
                          <option value="aboutTitle">عنوان قسم نبذة عن عين طبرنق</option>
                          <option value="aboutText">النص الطويل لوصف تاريخ القرية وحالها</option>
                          <option value="aboutHighlight">المستطيل البارز بنبذة القرية (الري وعيون الماء)</option>
                          <option value="amenitiesTitle">عنوان قسم واقع البنية التحتية والمطالب الصعبة</option>
                          <option value="humanMessageQuotes">شهادة ونص رسالة الأهالي (كلام محمد أمين الفرجاني)</option>
                          <option value="chatTitle">عنوان مجلس العم مفتاح الذكي</option>
                          <option value="chatSubtitle">الوصف الفرعي لمجلس العم مفتاح المرشد المحلي</option>
                          <option value="radioTitle">عنوان إذاعة صوت طبرنق الحرة</option>
                          <option value="radioSubtitle">الوصف الفرعي لإذاعة البلدة</option>
                          <option value="mapTitle">عنوان قسم الخريطة الجغرافية والمعالم</option>
                          <option value="mapSubtitle">الوصف الفرعي للخريطة والرموز المطلوبة</option>
                        </select>
                      </div>

                      <div className="space-y-2 pt-1 text-right">
                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-stone-500">صياغة النص الحالية بالعربية:</label>
                          <textarea
                            id="edit-text-ar-input"
                            rows={3}
                            defaultValue={editCustomTranslations.ar?.["heroTitle"] || TRANSLATIONS.ar["heroTitle"] || ""}
                            onChange={(e) => {
                              const sel = (document.getElementById("admin-translation-key-select") as HTMLSelectElement).value;
                              setEditCustomTranslations((prev: any) => ({
                                ...prev,
                                ar: { ...(prev.ar || {}), [sel]: e.target.value }
                              }));
                            }}
                            className={`w-full text-xs p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 ${
                              isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-stone-250 text-stone-900"
                            }`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-stone-500 font-sans">صياغة النص الحالية بالفرنسية (French):</label>
                          <textarea
                            id="edit-text-fr-input"
                            rows={3}
                            defaultValue={editCustomTranslations.fr?.["heroTitle"] || TRANSLATIONS.fr["heroTitle"] || ""}
                            onChange={(e) => {
                              const sel = (document.getElementById("admin-translation-key-select") as HTMLSelectElement).value;
                              setEditCustomTranslations((prev: any) => ({
                                ...prev,
                                fr: { ...(prev.fr || {}), [sel]: e.target.value }
                              }));
                            }}
                            className={`w-full text-xs p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 font-sans ${
                              isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-stone-250 text-stone-900"
                            }`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-stone-500 font-sans">صياغة النص الحالية بالإنجليزية (English):</label>
                          <textarea
                            id="edit-text-en-input"
                            rows={3}
                            defaultValue={editCustomTranslations.en?.["heroTitle"] || TRANSLATIONS.en["heroTitle"] || ""}
                            onChange={(e) => {
                              const sel = (document.getElementById("admin-translation-key-select") as HTMLSelectElement).value;
                              setEditCustomTranslations((prev: any) => ({
                                ...prev,
                                en: { ...(prev.en || {}), [sel]: e.target.value }
                              }));
                            }}
                            className={`w-full text-xs p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 font-sans ${
                              isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-stone-250 text-stone-900"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {saveSettingsSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 rounded-xl text-center text-xs font-bold border border-emerald-200">
                      ✅ تم حفظ جميع تغييرات الموقع والخطوط والشعارات بنجاح ومزامنتها على قاعدة البيانات!
                    </div>
                  )}

                  <div className="flex gap-2 justify-end pt-3 border-t border-stone-200 dark:border-zinc-800">
                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-1.5 focus:outline-none"
                    >
                      {isSavingSettings ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>جاري حفظ البيانات...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-white" />
                          <span>حفظ ومزامنة كامل الموقع والشعارات</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* 🗺️ Standalone GPS Coordinates Editor Card */}
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSavingSettings(true);
                    try {
                      await setDoc(doc(db, "site_settings", "config"), {
                        logoUrl: editLogoUrl.trim(),
                        heroCoverUrl: editHeroCoverUrl.trim(),
                        siteTitleAr: editSiteTitleAr.trim(),
                        siteTitleFr: editSiteTitleFr.trim(),
                        siteTitleEn: editSiteTitleEn.trim(),
                        siteSloganAr: editSiteSloganAr.trim(),
                        siteSloganFr: editSiteSloganFr.trim(),
                        siteSloganEn: editSiteSloganEn.trim(),
                        fontFamilyChoice: editFontFamilyChoice,
                        fontSizeMultiplier: Number(editFontSizeMultiplier),
                        customTranslations: editCustomTranslations,
                        mapCoords: editMapCoords
                      });
                      setSaveSettingsSuccess(true);
                      setTimeout(() => setSaveSettingsSuccess(false), 4000);
                    } catch (err) {
                      console.error("Error saving map coordinates:", err);
                      alert(lang === "ar" ? "حدث خطأ أثناء حفظ الإحداثيات!" : "An error occurred while saving map coordinates.");
                    } finally {
                      setIsSavingSettings(false);
                    }
                  }} 
                  className={`p-5 rounded-2xl border space-y-5 text-right ${
                    isDarkMode ? "bg-zinc-950 border-zinc-850" : "bg-emerald-50/10 border-emerald-100"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-zinc-800 pb-3">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-black">
                      GPS MAP COORDINATES
                    </span>
                    <h3 className="text-sm font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 justify-end">
                      <span>🗺️ تعديل وإدارة إحداثيات الخريطة التفاعلية (GPS)</span>
                    </h3>
                  </div>

                  <p className="text-[10px] text-stone-500 dark:text-zinc-400 leading-relaxed pr-2">
                    💡 يمكنك تعديل وتخصيص مواقع كافة المعالم والمرافق على الخريطة التفاعلية مباشرة. تقبل المدخلات الإحداثيات العشرية (مثال: <span className="font-mono text-emerald-500 font-bold">36.534167, 10.456611</span>) أو الإحداثيات الجغرافية بالثواني والدرجات (مثال: <span className="font-mono text-emerald-500 font-bold">36°32'03.0"N 10°27'23.8"E</span>).
                  </p>

                  <div className="grid grid-cols-1 gap-4 bg-stone-50 dark:bg-zinc-950 p-4 rounded-xl border border-stone-150 dark:border-zinc-850">
                    
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-stone-600 dark:text-zinc-300 flex items-center gap-1.5 justify-end">
                        <span>المدينة الأثرية والأكابيتول وقوس النصر (ruin-1):</span>
                        <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-sans">معلم أثري</span>
                      </label>
                      <input
                        type="text"
                        value={editMapCoords["ruin-1"] || ""}
                        onChange={(e) => {
                          setEditMapCoords(prev => ({ ...prev, "ruin-1": e.target.value }));
                        }}
                        placeholder="36.534167, 10.456611"
                        className={`w-full text-xs p-2.5 border rounded-xl focus:outline-none ${
                          isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-stone-250 text-stone-900"
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-stone-600 dark:text-zinc-300 flex items-center gap-1.5 justify-end">
                        <span>سد المصري الشهير (nature-1):</span>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-sans">معلم طبيعي</span>
                      </label>
                      <input
                        type="text"
                        value={editMapCoords["nature-1"] || ""}
                        onChange={(e) => {
                          setEditMapCoords(prev => ({ ...prev, "nature-1": e.target.value }));
                        }}
                        placeholder="36.531306, 10.486583"
                        className={`w-full text-xs p-2.5 border rounded-xl focus:outline-none ${
                          isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-stone-250 text-stone-900"
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-stone-600 dark:text-zinc-300 flex items-center gap-1.5 justify-end">
                        <span>المدرسة الابتدائية التاريخية (utility-1):</span>
                        <span className="text-[9px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded font-sans">مرفق عام</span>
                      </label>
                      <input
                        type="text"
                        value={editMapCoords["utility-1"] || ""}
                        onChange={(e) => {
                          setEditMapCoords(prev => ({ ...prev, "utility-1": e.target.value }));
                        }}
                        placeholder="36.534167, 10.456611"
                        className={`w-full text-xs p-2.5 border rounded-xl focus:outline-none ${
                          isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-stone-250 text-stone-900"
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-stone-600 dark:text-zinc-300 flex items-center gap-1.5 justify-end">
                        <span>مركز البريد المغلق قسراً (utility-2):</span>
                        <span className="text-[9px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded font-sans">مرفق عام</span>
                      </label>
                      <input
                        type="text"
                        value={editMapCoords["utility-2"] || ""}
                        onChange={(e) => {
                          setEditMapCoords(prev => ({ ...prev, "utility-2": e.target.value }));
                        }}
                        placeholder="36.534167, 10.455667"
                        className={`w-full text-xs p-2.5 border rounded-xl focus:outline-none ${
                          isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-stone-250 text-stone-900"
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-stone-600 dark:text-zinc-300 flex items-center gap-1.5 justify-end">
                        <span>مركز الإشعاع الفلاحي المهجور (utility-3):</span>
                        <span className="text-[9px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded font-sans">مرفق عام</span>
                      </label>
                      <input
                        type="text"
                        value={editMapCoords["utility-3"] || ""}
                        onChange={(e) => {
                          setEditMapCoords(prev => ({ ...prev, "utility-3": e.target.value }));
                        }}
                        placeholder="36.534472, 10.456944"
                        className={`w-full text-xs p-2.5 border rounded-xl focus:outline-none ${
                          isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-stone-250 text-stone-900"
                        }`}
                      />
                    </div>

                  </div>

                  {saveSettingsSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 rounded-xl text-center text-xs font-bold border border-emerald-200">
                      ✅ تم حفظ ومزامنة إحداثيات الخريطة التفاعلية بنجاح!
                    </div>
                  )}

                  <div className="flex gap-2 justify-end pt-3 border-t border-stone-200 dark:border-zinc-800">
                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-1.5 focus:outline-none"
                    >
                      {isSavingSettings ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>جاري الحفظ...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-white" />
                          <span>حفظ ومزامنة إحداثيات الخريطة (GPS)</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <form onSubmit={handlePasswordChange} className={`p-4 rounded-2xl border space-y-3 ${
                  isDarkMode ? "bg-zinc-950 border-zinc-800" : "bg-amber-50/20 border-amber-100"
                }`}>
                  <h3 className="text-xs font-black text-amber-500 flex items-center gap-1.5 justify-end">
                    <span>{lang === "ar" ? "🔑 تعديل كلمة المرور الموحدة لكافة الأقسام" : "🔑 Modify Consolidated Access Passcode"}</span>
                  </h3>

                  <div className="space-y-1.5 font-sans">
                    <label className="block text-[10px] font-bold text-stone-500">
                      {lang === "ar" ? "أدخل كلمة المرور الموحدة الجديدة (الحد الأدنى 4 رموز):" : "Enter New Unified Password Code (At least 4 characters):"}
                    </label>
                    <input
                      type="text"
                      required
                      value={newAdminPasswordInput}
                      onChange={(e) => setNewAdminPasswordInput(e.target.value)}
                      placeholder={lang === "ar" ? "مثال: 9876" : "e.g. 9876"}
                      className={`w-full text-center text-xs p-2.5 border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-800 font-sans ${
                        isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-stone-250 text-stone-900"
                      }`}
                    />
                  </div>

                  {passwordChangeError && (
                    <p className="text-[10px] text-red-500 font-bold bg-red-50 dark:bg-red-950/20 p-2 rounded-lg border border-red-100 text-center font-sans">
                      {passwordChangeError}
                    </p>
                  )}

                  {passwordChangeSuccess && (
                     <p className="text-[10px] text-emerald-500 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-155 text-center font-sans">
                      {lang === "ar" ? "✅ تم تحديث كلمة السر الموحدة بنجاح!" : "✅ Consolidated admin password updated successfully!"}
                    </p>
                  )}

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl text-[10px] font-black bg-emerald-900 hover:bg-emerald-950 text-white transition-all shadow-xs font-sans"
                    >
                      {lang === "ar" ? "حفظ كلمة المرور الجديدة" : "Save New Access Key"}
                    </button>
                  </div>
                </form>

                {/* 📱 PWA Mobile App Links & QR Code Supervisor Manager */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const appUrl = (formData.get("app_url") as string) || "";
                    const qrUrl = (formData.get("qr_url") as string) || "";
                    setPwaAppUrl(appUrl);
                    setPwaQrUrl(qrUrl);
                    localStorage.setItem("tebournok_pwa_app_url", appUrl);
                    localStorage.setItem("tebournok_pwa_qr_url", qrUrl);
                    alert(lang === "ar" ? "✅ تم حفظ وتحديث روابط تطبيق الجوال والرمز التعريفي بنجاح!" : "✅ PWA application links and QR code updated successfully!");
                  }}
                  className={`p-4 rounded-2xl border space-y-3 text-right ${
                    isDarkMode ? "bg-zinc-950 border-zinc-800" : "bg-purple-50/20 border-purple-100"
                  }`}
                >
                  <h3 className="text-xs font-black text-purple-600 dark:text-purple-400 flex items-center gap-1.5 justify-end">
                    <span>📱 {lang === "ar" ? "إشراف وإدارة روابط تطبيق الجوال" : "Manage Mobile PWA Links"}</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-right font-sans">
                      <label className="block text-[10px] font-bold text-stone-500">
                        {lang === "ar" ? "رابط الوصول المباشر للتطبيق السحابي:" : "Direct App Share Link:"}
                      </label>
                      <input
                        type="url"
                        name="app_url"
                        defaultValue={pwaAppUrl}
                        placeholder={lang === "ar" ? "مثال: https://ain-tebournok.vercel.app" : "e.g. https://ain-tebournok.vercel.app"}
                        className={`w-full text-xs p-2.5 border rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans ${
                          isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-stone-250 text-stone-900"
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5 text-right font-sans">
                      <label className="block text-[10px] font-bold text-stone-500">
                        {lang === "ar" ? "رابط الرمز التعريفي (QR Code Image URL):" : "QR Code Image URL:"}
                      </label>
                      <input
                        type="url"
                        name="qr_url"
                        defaultValue={pwaQrUrl}
                        placeholder={lang === "ar" ? "مثال: رابط صورة الـ QR" : "e.g. Image URL of QR code"}
                        className={`w-full text-xs p-2.5 border rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans ${
                          isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-stone-250 text-stone-900"
                        }`}
                      />
                    </div>
                  </div>

                  <p className="text-[9px] text-stone-400 block leading-tight">
                    {lang === "ar" 
                      ? "💡 اترك الحقول فارغة ليظهر للمستخدمين إشعار 'قيد النشر السحابي' حتى تنتهي من النشر الفعلي للموقع." 
                      : "💡 Leave empty to display 'Awaiting cloud publishing' indicators until the deployment is fully ready."}
                  </p>

                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-[10px] font-black bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-xs font-sans cursor-pointer"
                    >
                      {lang === "ar" ? "تحديث روابط التطبيق" : "Update App Links"}
                    </button>
                  </div>
                </form>

                {/* 📬 Hidden Email Messages & Alerts Section (linked to aintebournouk.tunisia@gmail.com) */}
                <div className={`p-5 rounded-2xl border space-y-4 text-right ${
                  isDarkMode ? "bg-zinc-950 border-zinc-800" : "bg-blue-50/15 border-blue-100"
                }`}>
                  <div className="flex justify-between items-center pb-2 border-b border-stone-200 dark:border-zinc-800">
                    <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-full font-bold font-mono">
                      aintebournouk.tunisia@gmail.com
                    </span>
                    <h3 className="text-xs font-black text-blue-500 flex items-center gap-1.5 justify-end">
                      <Inbox className="w-4 h-4 text-blue-500" />
                      <span>{lang === "ar" ? "صندوق بريد المشرف الموحد" : "📬 Supervisor's Secure Inbox"}</span>
                    </h3>
                  </div>

                  {contactMessages.length === 0 ? (
                    <div className="text-center py-8 text-stone-400 text-xs font-sans">
                      {lang === "ar" ? "صندوق الوارد فارغ حالياً. لا توجد رسائل جديدة." : "Your secure inbox is currently empty."}
                    </div>
                  ) : (
                    <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                      {contactMessages.map((msg) => (
                        <div key={msg.id} className={`p-4 rounded-xl border text-right font-sans transition-all hover:shadow-xs ${
                          isDarkMode ? "bg-zinc-900 border-zinc-850" : "bg-white border-stone-200"
                        }`}>
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-stone-100 dark:border-zinc-800 pb-2 mb-2">
                            <span className="text-[9px] text-stone-400 font-mono">
                              {new Date(msg.timestamp).toLocaleString(lang === "ar" ? "ar-TN" : "fr-TN")}
                            </span>
                            <div className="text-right">
                              <span className="text-xs font-black text-[#5C4033] dark:text-amber-400 block">{msg.name}</span>
                              <span className="text-[10px] text-stone-500 font-mono block select-all">{msg.email}</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-stone-700 dark:text-zinc-200 block">
                              {lang === "ar" ? "الموضوع:" : "Subject:"} {msg.subject}
                            </span>
                            <p className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed bg-stone-50 dark:bg-zinc-950 p-2.5 rounded-lg border border-stone-150 dark:border-zinc-900 whitespace-pre-wrap">
                              {msg.message}
                            </p>
                          </div>
                          <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-stone-100 dark:border-zinc-850">
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(lang === "ar" ? "هل تريد حذف هذه الرسالة من صندوق البريد المخفي؟" : "Delete this message?")) {
                                  const updated = contactMessages.filter(m => m.id !== msg.id);
                                  setContactMessages(updated);
                                  localStorage.setItem("tebournok_contact_messages", JSON.stringify(updated));
                                }
                              }}
                              className="text-red-500 hover:text-red-600 text-[10px] font-bold flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                              <span>{lang === "ar" ? "إلغاء الرسالة" : "Delete Message"}</span>
                            </button>
                            <span className="text-[9px] text-emerald-650 dark:text-emerald-400 font-black">
                              {lang === "ar" ? "📨 تم توجيه تنبيه إلى البريد" : "📨 Alert dispatched to aintebournouk.tunisia@gmail.com"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 🔔 Automated Activity Notifications Log */}
                <div className={`p-5 rounded-2xl border space-y-4 text-right ${
                  isDarkMode ? "bg-zinc-950 border-zinc-800" : "bg-emerald-50/5 border-emerald-100"
                }`}>
                  <div className="flex justify-between items-center pb-2 border-b border-stone-200 dark:border-zinc-800">
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-full font-bold">
                      {lang === "ar" ? "سجل التنبيهات الفورية" : "Alert Dispatch Log"}
                    </span>
                    <h3 className="text-xs font-black text-emerald-500 flex items-center gap-1.5 justify-end">
                      <Bell className="w-4 h-4 text-emerald-400" />
                      <span>{lang === "ar" ? "سجل إرسال الإشعارات إلى المشرف" : "🔔 Outbound Notification Log"}</span>
                    </h3>
                  </div>

                  {emailAlerts.length === 0 ? (
                    <div className="text-center py-6 text-stone-400 text-xs font-sans">
                      {lang === "ar" ? "لم يتم تسجيل أي تنبيهات مرسلة بعد." : "No outbound alerts logged yet."}
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {emailAlerts.map((alertItem) => (
                        <div key={alertItem.id} className={`p-3 rounded-lg border text-right font-sans text-[11px] flex justify-between items-start gap-4 ${
                          isDarkMode ? "bg-zinc-900 border-zinc-850 text-zinc-300" : "bg-white border-stone-200 text-stone-700"
                        }`}>
                          <span className="text-[9px] text-stone-400 font-mono shrink-0">
                            {new Date(alertItem.timestamp).toLocaleTimeString(lang === "ar" ? "ar-TN" : "fr-TN")}
                          </span>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-1.5 justify-end">
                              <span className="font-bold text-[#5C4033] dark:text-amber-400">{alertItem.subject}</span>
                              <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.2 rounded-md uppercase font-bold font-mono">{alertItem.type}</span>
                            </div>
                            <p className="text-[10px] text-stone-500 dark:text-zinc-400 leading-relaxed">
                              {alertItem.body}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

        </div>
      </section>
      )}

      {/* Modern interactive Footer and credit notes */}
      <footer className="bg-stone-900 text-stone-100 border-t-2 border-stone-850 mt-auto select-none">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 text-center space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-stone-800 pb-6">
            <div className="text-right">
              <span className="text-base font-black text-amber-400 font-sans tracking-tight">
                {lang === "ar" ? "عين طبرنق — بوابة الصعود والأمل" : "Ain Tebournok Community & Tour Portal"}
              </span>
              <p style={{ fontSize: "11px", lineHeight: "16px" }} className="text-[10px] text-stone-400 mt-1">
                {lang === "ar" ? "تطبيق مجتمعي تعريفي غير ربحي صمم بمجهودات تضامنية لتسليط الضوء على السياحة الجبلية بحجاب نابل وتونس." : "An interactive non-profit platform addressing local issues & promoting green tourism."}
              </p>
            </div>
            
            {/* Quick social sharing links and Digital Counter */}
            <div className="flex flex-wrap items-center justify-center gap-3.5">
              
              {/* Detailed Live Digital Visitor Counter widget */}
              <div className="bg-stone-950 border border-stone-800 p-3 rounded-2xl flex items-center gap-3 shadow-inner text-right">
                <span className="p-2 bg-emerald-950/40 text-emerald-400 rounded-xl shrink-0">
                  <Eye className="w-4 h-4 text-emerald-400 animate-pulse" />
                </span>
                <div>
                  <span className="text-[9px] text-stone-400 uppercase tracking-widest font-bold block">
                    {lang === "ar" ? "إحصائيات البوابة الرقمية" : "Live Portal Metrics"}
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5 justify-end">
                    <span className="text-[10px] text-stone-500">
                      ({activeUsers} {lang === "ar" ? "نشط" : "online"})
                    </span>
                    <span className="text-xs sm:text-sm font-mono font-black text-amber-400 tracking-wider">
                      {visitorCount.toLocaleString()} {lang === "ar" ? "زائر" : "visits"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                id="footer-share-btn-fb"
                onClick={() => alert(lang === "ar" ? "تم نسخ الرابط! شاركه على فيسبوك لدعم قضيتنا." : "Link copied! Share it to Facebook to champion Tebournok's values.")}
                className="bg-stone-800 hover:bg-stone-700 text-xs text-stone-200 px-3.5 py-2.5 rounded-xl border border-stone-700 font-bold transition-all h-[42px] flex items-center justify-center"
              >
                <span>{lang === "ar" ? "📤 شارك الرابط" : "Share Portal Link"}</span>
              </button>

            </div>
          </div>

          {/* Embedded live mountain weather details specifically optimized for Grombalia / Tebournok */}
          <div className="w-full">
            <WeatherWidget lang={lang} isDarkMode={true} />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] text-stone-500 font-medium">
            <span style={{ fontSize: "11px" }}>© 2026 {lang === "ar" ? "عين طبرنق — قريتي المنسية" : "Ain Tebournok Portal"}. All rights preserved.</span>
            <div className="flex gap-4">
              <span>Grombalia, Cap Bon, Tunisia</span>
              <span>•</span>
              <span style={{ fontSize: "12px" }}>Daira 4 Municipal</span>
            </div>
          </div>

        </div>
      </footer>

      {/* Lightbox / High resolution photo modal viewer */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-100 bg-stone-950/90 flex flex-col items-center justify-center p-4 backdrop-blur-md cursor-zoom-out" 
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl w-full flex flex-col space-y-4" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button 
              id="close-lightbox-btn"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all cursor-pointer shadow-md focus:outline-none z-50 text-sm font-mono"
            >
              ✕
            </button>
            <div className="rounded-3xl overflow-hidden border border-stone-800 bg-stone-905 shadow-2x">
              <img
                src={selectedPhoto.imageUrl}
                alt="Selected panoramic view"
                className="w-full max-h-[70vh] object-contain mx-auto"
              />
            </div>
            {/* Legend & caption */}
            <div className="bg-stone-900/90 max-w-2xl mx-auto rounded-2xl p-4 border border-stone-800 text-center text-white backdrop-blur-xs space-y-1.5 shadow-xl">
              <span className="bg-emerald-800 text-white text-[8px] font-black uppercase tracking-wider py-1 px-3 rounded-md inline-block">
                {selectedPhoto.category === "heritage" ? (lang === "ar" ? "🏛️ شواهد أثرية وتاريخية" : "🏛️ Historical Heritage") :
                 selectedPhoto.category === "nature" ? (lang === "ar" ? "💧 سد المصري والطبيعة الخضراء" : "💧 El Masri Dam & Nature") :
                 selectedPhoto.category === "camping" ? (lang === "ar" ? "⛺ التخييم ومغامرات الطبيعة" : "⛺ Mountain Camping") : (lang === "ar" ? "🥘 المطبخ الريفي والضيافة" : "🥘 Traditional Gastronomy")}
              </span>
              <p className="text-xs sm:text-sm font-bold text-stone-100 leading-normal">
                {lang === "ar" ? selectedPhoto.captionAr : lang === "fr" ? selectedPhoto.captionFr : selectedPhoto.captionEn}
              </p>
              <p className="text-[9px] text-stone-505 font-medium">
                {lang === "ar" ? "انقر في أي مكان خارج الإطار للإغلاق والعودة" : "Click anywhere outside the white box to close and go back"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Login Dialog Modal */}
      {isAdminModalOpen && (
        <div 
          className="fixed inset-0 z-120 bg-stone-950/75 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setIsAdminModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-sm border border-stone-200 p-6 shadow-2xl space-y-4 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <button 
                onClick={() => setIsAdminModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 font-bold transition-all text-sm"
              >
                ✕
              </button>
              <h3 className="text-sm font-black text-stone-900 flex items-center gap-1.5 leading-none">
                <Lock className="w-4 h-4 text-emerald-850" />
                <span>{lang === "ar" ? "بوابة المشرفين" : "Admin Portal"}</span>
              </h3>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">
                  {lang === "ar" ? "كلمة المرور الإدارية" : "Admin Access Code"}
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="w-full text-center text-sm p-3 border border-stone-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-800 font-mono tracking-widest bg-stone-50"
                  autoFocus
                />
              </div>

              {adminLoginError && (
                <p className="text-[10px] text-red-605 font-bold bg-red-50 p-2 rounded-lg border border-red-100 text-center">
                  {adminLoginError}
                </p>
              )}

              <p className="text-[9px] text-stone-400 leading-normal text-center bg-stone-50 p-2 rounded-lg border border-stone-100">
                {lang === "ar" 
                  ? "ملاحظة: رمز الدخول الافتراضي للتجربة هو 99633891 (ويمكنك تغييره لاحقاً بعد تسجيل الدخول)." 
                  : "Note: Default testing authorization passcode is 99633891 (and you can customize it afterwards inside the dashboard)."}
              </p>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs font-black bg-emerald-950 hover:bg-black text-white transition-all shadow-xs"
              >
                {lang === "ar" ? "تأكيد الدخول" : "Verify & Unlock"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 📬 Secure Supervisor Inbox Popup Modal */}
      {isInboxOpen && isAdmin && (
        <div 
          className="fixed inset-0 z-120 bg-stone-950/70 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setIsInboxOpen(false)}
        >
          <div 
            className={`w-full max-w-2xl rounded-3xl border p-6 shadow-2xl space-y-5 text-right transition-colors ${
              isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-stone-200 text-stone-900"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-stone-100 dark:border-zinc-800 pb-3">
              <button 
                onClick={() => setIsInboxOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-zinc-300 font-bold transition-all text-sm cursor-pointer"
              >
                ✕
              </button>
              <div className="flex items-center gap-2 justify-end">
                <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-full font-bold font-mono">
                  aintebournouk.tunisia@gmail.com
                </span>
                <h3 className="text-sm font-black flex items-center gap-1.5 leading-none text-blue-600">
                  <Inbox className="w-4 h-4 text-blue-500 animate-pulse" />
                  <span>{lang === "ar" ? "صندوق بريد المشرف الموحد" : "📬 Supervisor's Secure Inbox"}</span>
                </h3>
              </div>
            </div>

            {/* Content: Messages list */}
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl text-[10.5px] leading-relaxed border ${
                isDarkMode ? "bg-blue-950/15 border-blue-900/30 text-blue-300" : "bg-blue-50/50 border-blue-100 text-blue-955"
              }`}>
                {lang === "ar" 
                  ? "مرحباً بك في صندوق الرسائل المؤمن. جميع البيانات مخزنة محلياً بشكل آمن وتتم مزامنتها مع إشعارات البريد الإلكتروني الفورية لضمان أمان الرد والخصوصية."
                  : "Welcome to your secure communications center. Messages logged here are persisted locally and linked with active supervisor notification logs."}
              </div>

              {contactMessages.length === 0 ? (
                <div className="text-center py-12 text-stone-400 dark:text-zinc-500 text-xs font-sans">
                  {lang === "ar" ? "صندوق الوارد فارغ حالياً. لا توجد رسائل جديدة." : "Your secure inbox is currently empty."}
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                  {contactMessages.map((msg) => (
                    <div key={msg.id} className={`p-4 rounded-xl border text-right font-sans transition-all hover:shadow-xs ${
                      isDarkMode ? "bg-zinc-950 border-zinc-850" : "bg-stone-50 border-stone-200"
                    }`}>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-stone-150 dark:border-zinc-800 pb-2 mb-2">
                        <span className="text-[9px] text-stone-400 font-mono">
                          {new Date(msg.timestamp).toLocaleString(lang === "ar" ? "ar-TN" : "fr-TN")}
                        </span>
                        <div className="text-right">
                          <span className="text-xs font-black text-[#5C4033] dark:text-amber-400 block">{msg.name}</span>
                          <span className="text-[10px] text-stone-500 font-mono block select-all">{msg.email}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-stone-700 dark:text-zinc-200 block">
                          {lang === "ar" ? "الموضوع:" : "Subject:"} {msg.subject}
                        </span>
                        <p className={`text-xs leading-relaxed p-2.5 rounded-lg border whitespace-pre-wrap ${
                          isDarkMode ? "bg-zinc-900 border-zinc-850 text-zinc-300" : "bg-white border-stone-150 text-stone-600"
                        }`}>
                          {msg.message}
                        </p>
                      </div>
                      <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-stone-150 dark:border-zinc-850">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(lang === "ar" ? "هل تريد حذف هذه الرسالة من صندوق البريد؟" : "Delete this message?")) {
                              const updated = contactMessages.filter(m => m.id !== msg.id);
                              setContactMessages(updated);
                              localStorage.setItem("tebournok_contact_messages", JSON.stringify(updated));
                            }
                          }}
                          className="text-red-500 hover:text-red-600 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          <span>{lang === "ar" ? "إلغاء الرسالة" : "Delete Message"}</span>
                        </button>
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-black">
                          {lang === "ar" ? "📨 تم توجيه تنبيه إلى البريد" : "📨 Alert dispatched to aintebournouk.tunisia@gmail.com"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="flex justify-end pt-3 border-t border-stone-100 dark:border-zinc-800">
              <button
                onClick={() => setIsInboxOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#5C4033] hover:bg-black text-white transition-all shadow-xs cursor-pointer"
              >
                {lang === "ar" ? "إغلاق نافذة الرسائل" : "Close Inbox"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
