export type Language = "ar" | "fr" | "en";

export interface TranslationSchema {
  navHome: string;
  navHistory: string;
  navMap: string;
  navRadio: string;
  navChat: string;
  navAppeal: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  discoverBtn: string;
  tabHistoryTitle: string;
  tabHikingTitle: string;
  tabDamTitle: string;
  tabGalleryTitle: string;
  tabAppealTitle: string;
  aboutTitle: string;
  aboutText: string;
  aboutHighlight: string;
  amenitiesTitle: string;
  amenitiesSubtitle: string;
  humanMessageAuthor: string;
  humanMessageRole: string;
  humanMessageQuotes: string;
  humanMessageActionBtn: string;
  chatPlaceholder: string;
  chatSendBtn: string;
  chatTitle: string;
  chatSubtitle: string;
  radioTitle: string;
  radioSubtitle: string;
  radioStatusOnline: string;
  radioNowPlaying: string;
  radioPlayBtn: string;
  radioPauseBtn: string;
  mapTitle: string;
  mapSubtitle: string;
  mapLegendKey: string;
}

export const TRANSLATIONS: Record<Language, TranslationSchema> = {
  ar: {
    navHome: "الرئيسية",
    navHistory: "التاريخ والتراث",
    navMap: "الخريطة التفاعلية",
    navRadio: "إذاعة القرية 📻",
    navChat: "حديث العم مفتاح 💬",
    navAppeal: "رسالة الأهالي",
    heroBadge: "عين طبرنق — قريتي المنسية 🌿",
    heroTitle: "حيث التاريخ يمتزج بالطبيعة الخضراء",
    heroSubtitle: "دائرة بلديّة وكنز سياحي معزول في سفح جبال قرنبالية بالوطن القبلي، تونس.",
    discoverBtn: "اكتشف القرية 🌄",
    tabHistoryTitle: "🏛️ التاريخ والتراث",
    tabHikingTitle: "🌿 السياحة الجبلية",
    tabDamTitle: "💧 سد المصري",
    tabGalleryTitle: "📸 معرض الصور",
    tabAppealTitle: "❤️ رسالة من أهل القرية",
    aboutTitle: "🌿 نبذة عن عين طبرنق",
    aboutText: "قرية جبلية خلابة تقع شرق مدينة قرنبالية (بمسافة 9 كيلومترات)، تستند فوق سفح جبل يفوح بروح الماضي البوني والروماني والبيزنطي، مجاورة لسلسلة جبل الهباليل. يسكنها قرابة 5000 مواطن يعيشون على الزراعة التقليدية ويربأون بأنفسهم على حب هذه الأرض رغم التهميش ونقص البنية الأساسية العمومية.",
    aboutHighlight: "القرية الوحيدة في شمال إفريقيا التي احتفظت بعبقرية استخراج مياه الينابيع والري بقنوات وأحواض محكمة.",
    amenitiesTitle: "المرافق الخدمية الضائعة والواقع الصعب",
    amenitiesSubtitle: "شهادة حية لحال البنية التحتية والمطالب الملحة لأهالي عين طبرنق لإنقاذ قريتهم:",
    humanMessageAuthor: "محمد أمين الفرجاني",
    humanMessageRole: "مؤسس موقع عين طبرنق قريتي المنسية",
    humanMessageQuotes: "إن هذه القرية موطني وموطن أولادي وأهلي، حيث ترعرعنا وعشنا أجمل لحظات حياتنا. صحيح أننا لا يمكننا إصلاح كل شيء في آن واحد، ولكن بتضامننا وتسليط الضوء على السياحة الجبلية والموروث التاريخي، لا بد أن تتغير الأشياء تدريجياً. يشرفنا ويسعدنا أن ندعوكم لزيارتنا وتذوق مياه عيوننا العذبة.",
    humanMessageActionBtn: "ادعم قضية عين طبرنق تضامنياً",
    chatPlaceholder: "اسأل العم مفتاح الحكيم عن أسرار الرومان، سد المصري، أو مشاغل القرية...",
    chatSendBtn: "إرسال",
    chatTitle: "مجلس العم مفتاح المرشد المحلي",
    chatSubtitle: "رجل مسن طيب القلب تشرب عشق الأرض والتاريخ، يجيبك عن أسرار عين طبرنق.",
    radioTitle: "📻 إذاعة صوت طبرنق الحرّة",
    radioSubtitle: "بث إذاعي تراثي حي ينقل لكم فلوت الطبيعة الجبلية، الموشّحات الخالدة ومناشدات أهالينا الصادقة.",
    radioStatusOnline: "مباشر الآن",
    radioNowPlaying: "الآن يشتغل: معزوفة نسيم جبال قرنبالية والوديان",
    radioPlayBtn: "تشغيل الإذاعة",
    radioPauseBtn: "إيقاف مؤقت",
    mapTitle: "🗺️ معالم الجغرافيا والصمود",
    mapSubtitle: "تخطيط ذكي يوضح البعد الأثري والجغرافي ومواقع المطالب الأساسية بالقرية.",
    mapLegendKey: "دليل الخريطة المعبرة"
  },
  fr: {
    navHome: "Accueil",
    navHistory: "Histoire & Patrimoine",
    navMap: "Carte Interactive",
    navRadio: "Radio Village 📻",
    navChat: "Discussion Oncle Meftah 💬",
    navAppeal: "Lettre des Habitants",
    heroBadge: "Ain Tebournok — Mon Village Oublié 🌿",
    heroTitle: "Là où l'histoire se mêle à la nature luxuriante",
    heroSubtitle: "Une perle mémorable et oubliée sur les pentes de Grombalia, Cap Bon, Tunisie.",
    discoverBtn: "Découvrir le Village 🌄",
    tabHistoryTitle: "🏛️ Histoire & Ruines",
    tabHikingTitle: "🌿 Randonnées Vertes",
    tabDamTitle: "💧 Barrage Masri",
    tabGalleryTitle: "📸 Galerie Photo",
    tabAppealTitle: "❤️ Appel Solidaire",
    aboutTitle: "🌿 À propos de Ain Tebournok",
    aboutText: "Un village fortifié exceptionnel situé à 9 km à l'est de Grombalia. Niché au pied de la montagne de Jebel El Hbalil, il abrite environ 5000 habitants qui luttent vaillamment pour préserver leur héritage face à l'enclavement administratif et le manque cruel d'infrastructures publiques.",
    aboutHighlight: "Le seul village d'Afrique du Nord à préserver le génie hydraulique punique et romain de captage des sources naturelles.",
    amenitiesTitle: "Infrastructures en Ruine : Un Cri du Cœur",
    amenitiesSubtitle: "Le bilan réaliste des services publics de Ain Tebournok réclamant une intervention d'urgence :",
    humanMessageAuthor: "Mohamed Amine Ferjani",
    humanMessageRole: "Fondateur du site Ain Tebournok — Mon Village Oublié",
    humanMessageQuotes: "Ce village est notre terre, le berceau de nos ancêtres et de nos enfants. Nous ne pouvons certes pas tout réparer d'un coup, mais en redonnant vie à l'écotourisme montagnard et en valorisant nos ruines oubliées, nous redonnerons espoir à notre jeunesse. Soyez les bienvenus chez nous.",
    humanMessageActionBtn: "Soutenir la cause solidaire d'Ain Tebournok",
    chatPlaceholder: "Posez vos questions sur le Capitole, le Barrage, ou les coutumes locales de Ain Tebournok...",
    chatSendBtn: "Envoyer",
    chatTitle: "Chez l'Oncle Meftah, Guide Local",
    chatSubtitle: "Mémoire vivante de notre montagne, l'Oncle Meftah vous répond sur l'histoire et le quotidien.",
    radioTitle: "📻 Radio Tebournok Libéré",
    radioSubtitle: "Une station communautaire mêlant flûte traditionnelle, chants du Cap Bon et témoignages poignants.",
    radioStatusOnline: "En direct",
    radioNowPlaying: "Lecture : Hymne des montagnes bleues de Grombalia",
    radioPlayBtn: "Écouter la Radio",
    radioPauseBtn: "Pause",
    mapTitle: "🗺️ Carte Géographique & Revendications",
    mapSubtitle: "Visualisation de nos trésors antiques et des installations de base réclamées par la communauté.",
    mapLegendKey: "Légende explicative"
  },
  en: {
    navHome: "Home",
    navHistory: "History & Heritage",
    navMap: "Interactive Map",
    navRadio: "Village Radio 📻",
    navChat: "Talk with Uncle Meftah 💬",
    navAppeal: "The People's Message",
    heroBadge: "Ain Tebournok — The Forgotten Village 🌿",
    heroTitle: "Where Ancient History Blends with Wild Nature",
    heroSubtitle: "A marginalized historic sanctuary nestled under Grombalia Mountains, Tunisia.",
    discoverBtn: "Discover the Village 🌄",
    tabHistoryTitle: "🏛️ History & Ruins",
    tabHikingTitle: "🌿 Green Trekking",
    tabDamTitle: "💧 El Masri Dam",
    tabGalleryTitle: "📸 Photo Gallery",
    tabAppealTitle: "❤️ Human Message",
    aboutTitle: "🌿 About Ain Tebournok",
    aboutText: "A breathtaking mountainous village situated 9km east of Grombalia, Cap Bon, Tunisia. Inhabited by around 5,000 residents, it sits on the slopes of Jebel El Hbalil, retaining Roman and Byzantine treasures while suffering from severe administrative neglect and lack of public infrastructure.",
    aboutHighlight: "The only village in North Africa that captured the antique Punic/Roman genius of extracting and distributing fresh spring mountain water.",
    amenitiesTitle: "Public Infrastructure Neglect & Community Realities",
    amenitiesSubtitle: "A living testimony of the state of civic amenities and urgencies raised by our local collective:",
    humanMessageAuthor: "Mohamed Amine Ferjani",
    humanMessageRole: "Founder of Ain Tebournok — My Forgotten Village Website",
    humanMessageQuotes: "This village is our sanctuary, where we grew up and where our grandchildren belong. We know we can't mend everything in a single day, but by nurturing sustainable mountain tourism and preserving our historical heritage, we can restore dignity and provide sustainable livelihoods for our youth. It's our absolute honor to welcome you to our paradise.",
    humanMessageActionBtn: "Support Ain Tebournok's Solidarity Cause",
    chatPlaceholder: "Ask Uncle Meftah about the Capitol, Byzantine fortress, the 1952 school, or local recipes...",
    chatSendBtn: "Send",
    chatTitle: "The Majlis of Uncle Meftah",
    chatSubtitle: "Chat with our 65-year-old passionate local guide about historical secrets and municipal needs.",
    radioTitle: "📻 Voice of Tebournok Free Radio",
    radioSubtitle: "A heartwarming local radio streaming peaceful nature sounds, traditional Tunisian flutes, and community stories.",
    radioStatusOnline: "Live Now",
    radioNowPlaying: "Now Playing: 'Whispers of Grombalia's Ancient Valleys'",
    radioPlayBtn: "Listen Stream",
    radioPauseBtn: "Pause",
    mapTitle: "🗺️ Map of Heritage & Resilience",
    mapSubtitle: "An illustrative geographic view highlighting our historical ruins and community's basic rights.",
    mapLegendKey: "Map Legend"
  }
};

export interface Landmark {
  id: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  category: "ruin" | "utility" | "nature";
  statusAr: string;
  statusFr: string;
  statusEn: string;
  descriptionAr: string;
  descriptionFr: string;
  descriptionEn: string;
  coordX: number; // percentage from left
  coordY: number; // percentage from top
}

export const LANDMARKS: Landmark[] = [
  {
    id: "ruin-1",
    nameAr: "المدينة الأثرية والأكابيتول وقوس النصر",
    nameFr: "Cité Antique, Capitole & Arc de Triomphe",
    nameEn: "Ancient Ruins: Forum & Arch of Triumph",
    category: "ruin",
    statusAr: "مهمل وخلف الأسلاك منذ 15 سنة 🚧",
    statusFr: "Enclavé et clôturé sans restauration depuis 15 ans 🚧",
    statusEn: "Neglected and fenced off for 15 years with zero restoration 🚧",
    descriptionAr: "معلم فريد يضم المنتدى الروماني والحمامات والمسجد الأثري فوق الجبل، تعاني حالياً من تراكم الأعشاب والزواحف لتسييجها دون رعاية.",
    descriptionFr: "Un ensemble exceptionnel du Ier siècle, comprenant un temple unique et l'une des plus anciennes thermes d'Afrique.",
    descriptionEn: "A magnificent Carthage-origin Phoenician town developed by Romans, featuring a Capitol, forums, and some of the oldest bathhouses in Africa.",
    coordX: 52,
    coordY: 48
  },
  {
    id: "nature-1",
    nameAr: "سد المصري الشهير (مساحة 95 هكتار)",
    nameFr: "Barrage El Masri (Superficie 95 Ha)",
    nameEn: "Barrage El Masri (El Masri Dam)",
    category: "nature",
    statusAr: "منبع هدوء، يستغل للري لبلدات أخرى 💧",
    statusFr: "Havre de paix, sa ressource irrigue d'autres délégations 💧",
    statusEn: "Peaceful reservoir, water used primarily for other municipalities 💧",
    descriptionAr: "شُيّد عام 1968 ويخزن 5.7 مليون متر مكعب. يتميز بمناظر غروب الشمس الطبيعية التي تسلب الألباب وتجذب جولات المشي وصيد الهواة.",
    descriptionFr: "Construit en 1968, c'est l'un des pôles d'écotourisme d'avenir de Grombalia grâce à sa biodiversité extraordinaire.",
    descriptionEn: "Built in 1968 with a massive scenic scale, storing over 5.7 million m³. Popular for eco-hikers seeking peace away from city noises.",
    coordX: 30,
    coordY: 25
  },
  {
    id: "utility-1",
    nameAr: "المدرسة الابتدائية التاريخية (تأسست 1952)",
    nameFr: "École Primaire Historique (Fondée en 1952)",
    nameEn: "Historic Primary School (Est. 1952)",
    category: "utility",
    statusAr: "السور آيل للسقوط ومهمش 🏫",
    statusFr: "Mur d'enceinte en ruine, besoin de rénovation de toute urgence 🏫",
    statusEn: "Retaining wall crumbling down, desperately waiting for budget 🏫",
    descriptionAr: "تأسست قبل الاستقلال وتخرج منها المئات، لكنها تنتظر منذ سنوات صيانة بنيتها التحتية المتهالكة وإعادة بناء سورها الخارجي لحماية الأطفال.",
    descriptionFr: "Ancienne école formant des générations, aujourd'hui confrontée à des problèmes structurels majeurs.",
    descriptionEn: "An educational center built prior to Tunisian independence, now struggling with neglected safety walls and general wear.",
    coordX: 75,
    coordY: 35
  },
  {
    id: "utility-2",
    nameAr: "مركز البريد المغلق قسراً منذ 22 سنة",
    nameFr: "Bureau de Poste (Fermé depuis 22 ans!)",
    nameEn: "Post Office (Shut down for over 22 years!)",
    category: "utility",
    statusAr: "مغلق بدعوى آيل للسقوط 📮",
    statusFr: "Fermé sous prétexte de défaillance structurelle, aucune action 📮",
    statusEn: "Abandoned by authorities, forcing seniors to hike 9km to withdraw cash 📮",
    descriptionAr: "قضية إنسانية كبرى! منذ 22 عاماً يضطر كبار السن والمتقاعدون لقطع 9كم الشاقة للوصول لمدينة قرنبالية لسحب جراياتهم الضئيلة.",
    descriptionFr: "Inacceptable : les retraités doivent voyager jusqu'à Grombalia pour une simple opération postale, l'établissement étant fermé depuis 22 ans.",
    descriptionEn: "A core social concern where elderly are forced to pay for taxis and travel 9km to Grombalia just to cash out minimal pensions as the office remains shut down for over 22 years.",
    coordX: 42,
    coordY: 65
  },
  {
    id: "utility-3",
    nameAr: "مركز الإشعاع الفلاحي المهجور (أكثر من 25 سنة)",
    nameFr: "Centre de Rayonnement Agricole (Abandonné depuis plus de 25 ans)",
    nameEn: "Former Agricultural Advisory Station (Dead for over 25 years)",
    category: "utility",
    statusAr: "مهجور ومطلوب تحويله لدائرة بلدية 🌿",
    statusFr: "Inexploité, proposé comme siège administratif communal 🌿",
    statusEn: "Disused state depot, requested by citizens to house a sub-city hall 🌿",
    descriptionAr: "كان يوفر لسنوات البذور والأدوية والمشورة للفلاحين ومنذ ربع قرن وهو مهمل. يطالب الأهالي بنقل حيازته للبلدية ليكون مقراً لخدمة المعاملات الرسمية.",
    descriptionFr: "Autrefois poumon agricole abandonné depuis plus de 25 ans, le village réclame sa donation à la municipalité locale.",
    descriptionEn: "Previously supplied seeds and advice but left abandoned for more than 25 years. Now citizens demand it be transformed into the local council sub-office.",
    coordX: 82,
    coordY: 70
  }
];

export interface GalleryPhoto {
  imageUrl: string;
  captionAr: string;
  captionFr: string;
  captionEn: string;
  category: "heritage" | "nature" | "camping" | "food";
}

export const GALLERY_PHOTOS: GalleryPhoto[] = [];
