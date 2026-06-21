# VibeVault 🌌

Yapay zeka destekli tema ve atmosfer kürasyon motoru. Sevdiğiniz film, dizi, kitap veya oyunları yazın; size aynı "hissi (vibe)" ve benzer temaları yaşatacak diğer medya türlerinden önerileri anında getirelim.

AI-powered mood and theme curation engine. Enter a movie, TV show, book, or video game, and discover recommendations with the exact same "vibe" across different media formats.

---

## ✨ Özellikler / Features

- **Türler Arası Eşleştirme (Cross-Media Matching):** Sadece kitap için kitap değil; bir film girdiğinizde o hissiyatı veren kitap, oyun veya kutu oyunlarını da önerir.
- **Yapay Zeka Destekli Kürasyon:** Gemini 2.5 Flash modelini kullanarak eserlerin sadece kategorisini değil, arka plandaki psikolojik derinliğini ve tropes (ana temalarını) analiz eder.
- **PWA (Progressive Web App) Desteği:** iOS ve Android cihazlara tarayıcıdan tek tıkla bağımsız bir uygulama olarak kurulabilir.
- **Güvenli API Yapısı:** Üretim (production) aşamasında API anahtarınızı Vercel Serverless Functions ile gizler. Yerel kullanımda ise tarayıcı local depolama desteği sunar.
- **Çift Dil Desteği:** Dinamik Türkçe/İngilizce dil desteği ve dile duyarlı günün alıntıları veritabanı.

---

## 🛠️ Kullanılan Teknolojiler / Tech Stack

- **Arayüz:** Vanilla HTML5, Tailwind CSS, Vanilla JavaScript.
- **Sunucusuz Fonksiyon:** Node.js (Vercel Serverless Functions).
- **Yapay Zeka:** Google Gemini API (`gemini-2.5-flash`).

---

## 🚀 Kurulum ve Yayına Alma / Installation & Deployment

### Vercel ile Canlıya Alma (Deployment)
1. Bu projeyi GitHub'a yükleyin.
2. Vercel üzerinde yeni bir proje oluşturup GitHub deponuzu bağlayın.
3. Vercel panelinde `Settings > Environment Variables` kısmına giderek `GEMINI_API_KEY` adıyla kendi Gemini API anahtarınızı ekleyin.
4. Deploy butonuna basın!

### Yerel Çalıştırma (Local Development)
Klasördeki `index.html` dosyasına çift tıklayarak tarayıcınızda doğrudan açıp çalıştırabilirsiniz. Bu modda sistem kendi API anahtarınızı yerel ayarlar penceresinden girmenize olanak tanır.
