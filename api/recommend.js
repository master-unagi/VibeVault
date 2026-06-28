export default async function handler(req, res) {
  // CORS ayarları
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, isEnglish, categories } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  // Vercel Environment Variable (GEMINI_API_KEY)
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server. Please add it to your Vercel Environment Variables.' });
  }

  try {
    const uiCategories = categories || ['book', 'movie', 'tv', 'game'];
    const backendCategories = [];
    if (uiCategories.includes('book')) backendCategories.push('book');
    if (uiCategories.includes('movie')) backendCategories.push('movie');
    if (uiCategories.includes('tv')) backendCategories.push('tv');
    if (uiCategories.includes('game')) {
      backendCategories.push('game');
      backendCategories.push('boardgame');
    }
    const allowedCatsStr = backendCategories.map(c => `'${c}'`).join(', ');

    const systemPrompt = `Sen edebi ve kültürel kürasyon yapan uzman bir stratejistsin. Kullanıcının verdiği filme, diziye, oyuna veya müziğe bakarak sadece "tür" olarak değil; "Ana Tema (Core Tropes)" ve "Üslup/Atmosfer (Vibe & Tone)" açısından benzer hisler uyandıran en az 5, en fazla 10 adet içerik önermelisin.
Önereceğin eserlerin kategorileri kesinlikle sadece şunlar olmalıdır: [${allowedCatsStr}]. Başka kategoride hiçbir eser önerme.
Eğer doğrudan kullanıcının aradığı evrene (franchise) ait başka eserler varsa (örneğin Star Wars aramasına The Mandalorian dizisi veya Star Wars Jedi oyunları gibi), bunları da listeye alabilirsin. Ancak aynı evrenden/franchise'dan en fazla 2 öneri yapmalısın. Kalan öneriler tamamen farklı yapımlardan olmalıdır.
Dil tercihi: ${isEnglish ? 'İngilizce içerikler ve açıklamalar İngilizce olmalı.' : 'Türkçe açıklamalar olmalı.'}
Ayrıca her öneri için kullanıcının girdisiyle ne kadar güçlü bir vibe/tema eşleşmesi olduğunu 10 üzerinden sayısal (float) bir değer olarak puanlamalısın (Örn: 9.2).
Ek olarak her eserden kısa, akılda kalıcı ve vurucu bir alıntı (veya ikonik bir replik) sunmalısın.
Yanıtın kesinlikle belirtilen JSON şemasına uymalıdır. Goodreads/IMDB/Metacritic verilerini gerçekçi bir şekilde tahmin edebilirsin.`;

    const payload = {
      contents: [{ parts: [{ text: `Şu içeriğe benzer vibe'a sahip eserler (kitap, film, dizi, oyun vb.) öner: ${query}` }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING", description: "Eserin adı" },
              author: { type: "STRING", description: "Yazar / Yönetmen / Geliştirici / Tasarımcı adı" },
              category: { type: "STRING", description: "Kategori: 'book', 'movie', 'tv', 'game', 'boardgame' değerlerinden biri" },
              reason: { type: "STRING", description: "Neden önerildi? Hangi temalar ve vibe eşleşti? Kısa bir açıklama." },
              rating: { type: "NUMBER", description: "Değerlendirme puanı (Örn: 8.5 veya 4.15)" },
              reviews: { type: "STRING", description: "Değerlendirme sayısı (Örn: 15K veya 2M)" },
              matchScore: { type: "NUMBER", description: "Eşleşme oranı, 10 üzerinden (Örn: 9.2)" },
              quote: { type: "STRING", description: "Eserden ikonik, kısa bir alıntı veya replik" }
            },
            required: ["title", "author", "category", "reason", "rating", "reviews", "matchScore", "quote"]
          }
        }
      }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message || "Gemini API Hatası" });
    }

    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      // Check if blocked by safety
      const candidate = data.candidates?.[0];
      if (candidate && candidate.finishReason === "SAFETY") {
        return res.status(500).json({ error: "İçerik güvenlik filtresine takıldı. Lütfen daha uygun kelimelerle arama yapın." });
      }
      return res.status(500).json({ error: "Yapay zeka yanıt veremedi." });
    }

    let cleanText = textResponse.trim();
    if (cleanText.startsWith("```")) {
      const match = cleanText.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
      if (match) {
        cleanText = match[1];
      }
    }

    const recommendations = JSON.parse(cleanText);
    return res.status(200).json(recommendations);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sunucu hatası veya geçersiz yanıt." });
  }
}

