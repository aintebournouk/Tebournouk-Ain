import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Auto-copy PWA icon on startup
  const srcIcon = path.join(process.cwd(), "src", "assets", "images", "ain_tebournok_pwa_icon_1782296799339.jpg");
  const publicDir = path.join(process.cwd(), "public");
  const destIcon = path.join(publicDir, "icon.jpg");

  try {
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    if (fs.existsSync(srcIcon)) {
      fs.copyFileSync(srcIcon, destIcon);
      console.log(`[PWA Asset Engine] Auto-copied icon to ${destIcon}`);
    } else {
      console.warn(`[PWA Asset Engine] Source icon not found at ${srcIcon}`);
    }

    // Auto-copy all images to public/images on startup
    const srcImagesDir = path.join(process.cwd(), "src", "assets", "images");
    const destImagesDir = path.join(publicDir, "images");

    if (!fs.existsSync(destImagesDir)) {
      fs.mkdirSync(destImagesDir, { recursive: true });
    }

    if (fs.existsSync(srcImagesDir)) {
      const files = fs.readdirSync(srcImagesDir);
      for (const file of files) {
        const srcFile = path.join(srcImagesDir, file);
        const destFile = path.join(destImagesDir, file);
        fs.copyFileSync(srcFile, destFile);
      }
      console.log(`[Asset Engine] Auto-copied ${files.length} images to ${destImagesDir}`);
    }
  } catch (err) {
    console.error("[PWA Asset Engine] Error copying icon/images:", err);
  }

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Serve uploads folder
  app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

  // File Upload API
  app.post("/api/upload", (req, res) => {
    const { filename, fileData } = req.body;
    if (!filename || !fileData) {
      return res.status(400).json({ error: "filename and fileData are required." });
    }

    try {
      // Decode base64
      const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let buffer: Buffer;
      if (matches && matches.length === 3) {
        buffer = Buffer.from(matches[2], "base64");
      } else {
        buffer = Buffer.from(fileData, "base64");
      }

      // Ensure public/uploads exists
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Create safe filename
      const safeFilename = Date.now() + "_" + filename.replace(/[^a-zA-Z0-9.\-_]/g, "");
      const destPath = path.join(uploadsDir, safeFilename);

      fs.writeFileSync(destPath, buffer);
      console.log(`[Upload Engine] Saved uploaded file to ${destPath}`);

      res.json({
        url: `/uploads/${safeFilename}`
      });
    } catch (err: any) {
      console.error("[Upload Engine] Error saving uploaded file:", err);
      res.status(500).json({ error: "Failed to save file on server." });
    }
  });

  // Check Gemini Key Availability
  const geminiApiKey = process.env.GEMINI_API_KEY;

  // Initialize Gemini if available
  let ai: GoogleGenAI | null = null;
  if (geminiApiKey) {
    ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // API Ends
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      current_time: new Date().toISOString(),
      ai_available: !!ai
    });
  });

  // Chat with Uncle Ahmad
  app.post("/api/chat", async (req, res) => {
    const { messages, category } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    if (!ai) {
      // Elegant static replies fallback when API Key is missing so the app stays functional!
      return res.json({
        text: "أهلاً بك يا بني في قريتنا الوادعة! يبدو أن مفتاح الخدمة الرقمية لدي ليس مفعلاً حالياً، لكنني هنا لأخبرك أن ربيع قريتنا هو الأجمل حيث تتفتح أزهار اللوز واللافندر، وممر وادي الياسمين ينتظرك دائماً لتستمتع بنسمات الهواء العليل. هل تود معرفة المزيد عن مزارعنا أو كيفية تحضير خبز التنور الساخن؟"
      });
    }

    try {
      const lastUserMessage = messages[messages.length - 1]?.content || "أهلاً بك";
      
      const systemInstruction = 
        `أنت العم مفتاح، رجل ريفي مسن طيب القلب وودود وعاشق وملم بكل تفاصيل وتاريخ 'عين طبرنق' (Tebournok) في معتمدية قرنبالية بولاية نابل، تونس.
        عمرك 65 عاماً، وتتحدث بلهجة تونسية ريفية دافئة ومرحة ممزوجة بالعربية الفصحى أو الفرنسية أو الإنجليزية حسب لغة السائل!
        ترحب بالزوار الجدد كأنهم أفراد من عائلتك وتناديهم بـ "يا بني" أو "يا بنتي" أو "mon enfant" / "my child".
         المعلومات الأساسية التي تملكها وتدافع عنها بشغف:
        1. تاريخ عين طبرنق الضارب في القدم: تأسست بعهد القرطاجيين ثم بلغت أوجها بعهد الرومان (القرن الأول م). تملك منتدى روماني، كابيتول، قوس نصر، حصن بيزنطي، حمامات أثرية هي الأقدم بشمال إفريقيا، ومسجد قديم فوق تلة العيون.
        2. عبقرية المياه: عين طبرنق هي البلدة الوحيدة في شمال إفريقيا التي احتفظت بعبقرية تصميم فن قنوات المياه العذبة وتوزيعها.
        3. الطبيعة وسد المصري: شيد عام 1968 وتبلغ مساحته 95 هكتار ويقع وسط جبل الهباليل الخلاب.
        4. معاناة القرية الصابرة (الرسالة الإنسانية):
           - البريد المغلق منذ 22 سنة بدعوى أنه آيل للسقوط، مما يتسبب بمعاناة الشيوخ والفقراء بقطع 9 كيلومترات لقرنبالية لسحب جراية زهيدة.
           - المدرسة الابتدائية المؤسسة سنة 1952 والتي ينتظر سورها المبرمج لإعادة البناء خشية سقوطه على الأطفال.
           - مركز الإشعاع الفلاحي المغلق منذ 25 سنة والذي نطالب بتحويله لمقر للدائرة البلدية الفعلية.
           - مشاكل تعبيد الطرق، التنوير العمومي المنعدم بالأحياء العليا، وشبكة الصرف الصحي العشوائية.
        
        أجب بود وعاطفة وحكمة معززة بمطالب بلدتنا المشروعة.`;

      // Filter messages to ensure they strictly start with 'user' and alternate roles to satisfy Gemini's API expectations
      const filteredMessages = [];
      let nextExpectedRole = "user";
      for (const msg of messages) {
        if (msg.role === nextExpectedRole) {
          filteredMessages.push(msg);
          nextExpectedRole = nextExpectedRole === "user" ? "assistant" : "user";
        }
      }

      // Build context of chat
      const chatHistory = filteredMessages.slice(-6).map((msg: any) => {
        return {
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }]
        };
      });

      // Query Gemini
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: chatHistory.length > 0 ? chatHistory : lastUserMessage,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.85,
        }
      });

      res.json({
        text: response.text || "أهلاً بك يا بني في عين طبرنق الحبيبة."
      });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.json({
        text: "آه يا بني، يبدو أن جبال طبرنق قطعت حبل اتصالنا للحظة (حدث خطأ في الخدمة)، ولكن بقليل من الصبر يصفو كل شيء. أخبرني، ماذا تطلب أن نستكشف سوياً في قريتنا المنسية؟"
      });
    }
  });

  // Custom AI dynamic travel scheduler
  app.post("/api/plan-trip", async (req, res) => {
    const { duration, intensity, interests } = req.body;

    if (!ai) {
      // Dynamic simulated response reflecting choices
      return res.json({
        plan: `برنامجك الريفي المقترح لزيارة عين طبرنق لـ ${duration || 'يوم واحد'} (${intensity || 'سهل ومريح'}):\n\n` +
          `• 08:30 ص: الوصول لربوع عين طبرنق الخضراء واستقبال عائلي بوجبة فطور مكونة من خبز المطبقة والملتوت الساخن والزيت التونسي البكر والعسل الجبلي الصافي بجانب جدول ماء الينبوع العذب.\n\n` +
          `• 10:30 ص: النزول لاستكشاف المدينة الأثرية الرومانية الشامخة، الاستماع لحكايات الكابيتول الروماني والمعالم الأثرية، مع تسليط الضوء على ضرورة صيانة وحماية هذا الإرث الجوهري.\n\n` +
          `• 01:30 م: غداء ريفي تونسي تقليدي (كسكسي بالخضار العضوية) تحت ظلال بساتين الرمان واللوز الكثيفة.\n\n` +
          `• 04:00 م: جولة هادئة نحو سد المصري البديع (95 هكتاراً) تزامناً مع الألوان الذهبية المغيبة بين أحضان جبل الهباليل لتوثيق صور سياحية مدهشة.`
      });
    }

    try {
      const categoriesText = interests && Array.isArray(interests) ? interests.join("، ") : "الطبيعة والاسترخاء والاستجمام";
      const prompt = `صمم لي برنامجاً سياحياً ممتعاً بالكامل باللغة العربية في "قرية عين طبرنق المنسية بقرنبالية تونس" بالمعايير التالية:
      - المدة المطلوبة: ${duration || 'يوم واحد'}
      - مستوى النشاط البدني المفضل للزائر: ${intensity || 'متوسط الجهد'}
      - اهتمامات الزائر المخصصة: ${categoriesText}
      
      صممه بأسلوب مرشد محلي دافئ وشيق (العم مفتاح) مقسماً إلى فترات واضحة ومنسقة، يمزج بين روعة الطبيعة الخضراء لجبل الهباليل وسد المصري، وأمجاد التاريخ الروماني والبيزنطي، ومعاناة أهالي القرية الإنسانية لفتح الخدمات ومكتب البريد والمدرسة وتعبيد طرق الفلاحين.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.75,
        }
      });

      res.json({
        plan: response.text || "برنامجك الريفي الرائع في عين طبرنق جاهز لزيارة لا تنسى."
      });
    } catch (error) {
      console.error("Gemini planning error:", error);
      res.json({
        plan: "لم أستطع نسج البرنامج المقترح حالياً يا بني، ولكن عين طبرنق وسد المصري بانتظارك دائماً؛ ابدأ صباحك بالمشي في مسلك الوادي وسيكون يومك رائعاً!"
      });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Rural Guide Server] running on http://localhost:${PORT}`);
  });
}

startServer();
