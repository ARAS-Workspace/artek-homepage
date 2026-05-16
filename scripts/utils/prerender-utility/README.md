# SSG Pre-Rendering Utility

Playwright tabanlı statik site oluşturma (SSG) aracı. React Router yapılandırmasından otomatik route discovery yaparak, 
çoklu dil ve tema desteğiyle statik HTML dosyaları üretir.

## Mimari

```mermaid
flowchart TB
    subgraph stage1["<b>1️⃣ Route Discovery (AST-based)</b>"]
        direction TB
        router["<b>src/router/index.tsx</b><br/>React Router Config"]
        babel["<b>@babel/parser</b><br/>TypeScript AST Parsing"]
        builder["<b>build_routes.js</b><br/>(scripts/)"]

        router -->|parse| babel
        babel -->|traverse| builder
    end

    subgraph stage2["<b>2️⃣ Route Configuration</b>"]
        routes["<b>routes.yaml</b><br/>(Project Root)<br/>━━━━━━━━<br/>routes:<br/>  - /<br/>  - /contact<br/>  - /services/..."]
        builder --> routes
    end

    subgraph stage3["<b>3️⃣ SSG Rendering (Playwright)</b>"]
        direction LR
        config["<b>config.yaml</b><br/>• locales: tr, en<br/>• themes: white, g90<br/>• concurrency: 5<br/>• timeouts"]
        prerender["<b>prerender.js</b><br/>• Load routes<br/>• DNS override<br/>• Playwright browser<br/>• Parallel render"]

        routes -->|read| prerender
        config -->|merge| prerender
    end

    subgraph stage4["<b>4️⃣ Preview Server</b>"]
        direction TB
        vite["<b>Vite Preview</b><br/>localhost:5175"]
        dns["<b>DNS Override</b><br/>www.artek.tc<br/>↓<br/>localhost:5175"]

        prerender -->|start| vite
        vite --> dns
    end

    subgraph stage5["<b>5️⃣ HTML Generation (Multi-variant)</b>"]
        dist["<b>dist/ Directory</b><br/>━━━━━━━━<br/>index.html (tr, white)<br/>index.en.html (en, white)<br/>index.g90.html (tr, g90)<br/>index.g90.en.html (en, g90)<br/>contact/index.html<br/>contact/index.g90.en.html<br/>..."]

        dns -->|render| dist
    end

    subgraph stage6["<b>6️⃣ Cloudflare Workers</b>"]
        worker["<b>_worker.js</b><br/>(Config Injected)<br/>━━━━━━━━<br/>• Cookie detection<br/>• Accept-Language<br/>• Fallback chain<br/>• LOCALES, THEMES"]

        prerender -.->|build & inject| worker
        worker -->|deploy to| dist
    end

    style stage1 fill:#d0e2ff,stroke:#0f62fe,stroke-width:2px,color:#161616
    style stage2 fill:#e8daff,stroke:#8a3ffc,stroke-width:2px,color:#161616
    style stage3 fill:#9ef0f0,stroke:#007d79,stroke-width:2px,color:#161616
    style stage4 fill:#d2f4ea,stroke:#24a148,stroke-width:2px,color:#161616
    style stage5 fill:#ffd6e8,stroke:#d02670,stroke-width:2px,color:#161616
    style stage6 fill:#d2a106,stroke:#8a3800,stroke-width:2px,color:#161616

    style router fill:#a6c8ff,stroke:#0043ce,color:#161616
    style babel fill:#a6c8ff,stroke:#0043ce,color:#161616
    style builder fill:#a6c8ff,stroke:#0043ce,color:#161616
    style routes fill:#d4bbff,stroke:#6929c4,color:#161616
    style config fill:#3ddbd9,stroke:#005d5d,color:#161616
    style prerender fill:#3ddbd9,stroke:#005d5d,color:#161616
    style vite fill:#a7f0ba,stroke:#0e6027,color:#161616
    style dns fill:#a7f0ba,stroke:#0e6027,color:#161616
    style dist fill:#ffafd2,stroke:#9f1853,color:#161616
    style worker fill:#f1c21b,stroke:#8a3800,color:#161616
```

## Çalışma Prensibi

SSG Pre-Rendering süreci beş aşamadan oluşur:

### 1. Route Discovery

**build_routes.js** (scripts/ dizininde), `src/router/index.tsx` dosyasını Babel ile parse ederek otomatik route keşfi yapar:

- TypeScript kodunu AST'ye dönüştürür
- `createBrowserRouter([...])` çağrısını bulur
- Nested `children` array'lerini recursive traverse eder
- Dynamic route'ları (`:id` gibi) filtreler
- Sonuçları `routes.yaml` dosyasına yazar (project root)

### 2. Configuration Loading

**prerender.js**, iki yapılandırma dosyasını merge eder:
- `config.yaml` (bu dizinde) → locales, themes, timeouts, concurrency
- `routes.yaml` (project root) → render edilecek route listesi

### 3. Parallel Rendering

Her `route × locale × theme` kombinasyonu için:
- Vite preview server başlatılır (localhost:5175)
- Playwright chromium browser açılır
- DNS override ile `production_url` → `localhost:5175` yönlendirmesi
- React app hazır olana kadar beklenir (`#root innerHTML > 100`)
- Network idle durumu kontrol edilir
- HTML içerik kaydedilir

### 4. File Naming Convention

```
Kural: {path}/index{.theme}{.locale}.html

Örnekler:
  / → index.html                    (default theme + default locale)
  / → index.g90.html                (g90 theme, tr locale)
  / → index.en.html                 (white theme, en locale)
  / → index.g90.en.html             (g90 theme, en locale)
  /contact → contact/index.html
  /contact → contact/index.g90.en.html
```

### 5. Cloudflare Workers

**_worker.js** template'i, config değerleriyle inject edilip `dist/_worker.js` olarak kaydedilir. Production'da:
- Cookie'den `preferred_locale` ve `preferred_theme` okur
- Accept-Language header'ını parse eder
- Fallback chain ile doğru HTML dosyasını serve eder

## Desteklenen Yapılandırmalar

| Parametre        | Değer                        | Açıklama                                    |
|------------------|------------------------------|---------------------------------------------|
| **Diller**       | `tr`, `en`                   | Çoklu dil desteği                           |
| **Temalar**      | `white`, `g90`               | Carbon Design System temaları               |
| **Concurrency**  | `5` (varsayılan)             | Paralel render edilen page sayısı           |
| **DNS Override** | `production_url → localhost` | Production URL'i preview server'a yönlendir |
| **Route Source** | `routes.yaml`                | build_routes.js tarafından üretilir         |

## Özellikler

| Özellik                        | Açıklama                                                                          |
|--------------------------------|-----------------------------------------------------------------------------------|
| **Otomatik Route Discovery**   | React Router yapılandırmasından AST-based route extraction                        |
| **Multi-Locale Rendering**     | Her route için tüm dil varyantları (tr, en)                                       |
| **Multi-Theme Rendering**      | Her route için tüm tema varyantları (white, g90)                                  |
| **Parallel Processing**        | p-limit ile configurable concurrency control                                      |
| **DNS Override Testing**       | Production URL'i localhost'a yönlendirerek gerçekçi test                          |
| **Cookie/Header Detection**    | Cloudflare Workers ile dynamic locale/theme serving                               |
| **Fallback Chain**             | Eksik varyantlar için otomatik fallback (theme+locale → locale → theme → default) |
| **Playwright Integration**     | Gerçek browser rendering (React hydration guaranteed)                             |
| **Resource Preload Injection** | Network-based CSS/JS chunk detection ve otomatik preload hint enjeksiyonu         |

## Hızlı Başlangıç

### Ön Gereksinimler

```bash
# 1. Playwright chromium kurulumu
npx playwright install chromium

# 2. Bağımlılıklar
npm install
```

### Adım Adım Kullanım

#### 1. routes.yaml Oluşturma

Router'dan route'ları extract edin:

```bash
npm run routes
```

Bu komut:
- `src/router/index.tsx` dosyasını parse eder
- Tüm route'ları bulur
- `routes.yaml` dosyasını project root'a yazar

**Örnek Çıktı** (routes.yaml):

```yaml
routes:
  - /
  - /company
  - /contact
  - /services/consultancy
```

#### 2. Production Build

Vite build çalıştırarak `dist/` klasörünü oluşturun:

```bash
npm run build
```

#### 3. Pre-Rendering

SSG rendering başlatın:

```bash
npm run prerender
```

Bu komut:
- config.yaml ve routes.yaml yükler
- Vite preview server başlatır (port 5175)
- Her route × locale × theme için HTML üretir
- `_worker.js` dosyasını dist/'e kopyalar (config inject edilmiş)

**Console Output Örneği**:
```
[INFO] SSG Pre-Rendering - Starting
[INFO] Config: 12 routes
[INFO] Cloudflare Worker built (locales: tr, en, themes: white, g90)
[INFO] Starting preview server on port 5175
[INFO] Preview server started (PID: 12345)
[INFO] Pre-rendering 12 routes
[INFO] DNS Override: www.artek.tc → localhost:5175
[INFO] Rendering with concurrency: 5 parallel pages
[INFO] Rendering / [tr] [white]
[INFO] Success: /
...
[INFO] Complete: 48/48 successful (12 routes × 2 locales × 2 themes)
```

#### 4. Full Production Build (Önerilen)

Tüm adımları tek komutla çalıştırın:

```bash
npm run prod
```

Bu komut sırayla:
1. `npm run build` → Vite build
2. `npm run prerender` → SSG rendering


## Dosya Yapısı

```
scripts/utils/prerender-utility/
├── prerender.js         # Ana SSG rendering motoru
├── _worker.js           # Cloudflare Workers template (config injection)
└── config.yaml          # Rendering ayarları (locales, themes, timeouts)

scripts/
└── build_routes.js      # Route extractor (AST-based, upstream dependency)

Project Root/
├── routes.yaml          # Generated routes (build_routes.js tarafından üretilir)
└── dist/                # Build output
    ├── _worker.js       # Cloudflare Workers script (injected config)
    ├── index.html       # / (tr, white)
    ├── index.en.html    # / (en, white)
    ├── index.g90.html   # / (tr, g90)
    ├── index.g90.en.html # / (en, g90)
    └── contact/
        ├── index.html
        └── index.g90.en.html
```

## Yapılandırma Dosyaları

### config.yaml

```yaml
production_url: https://www.artek.tc  # DNS override için
preview_port: 5175                    # Vite preview server portu
default_locale: tr                    # Varsayılan dil
default_theme: white                  # Varsayılan tema
locales:
  - tr
  - en
themes:
  - white
  - g90

# Playwright Ayarları
playwright:
  headless: false                     # Debug için false, production için true
  concurrency: 5                      # Paralel render sayısı (CPU core'a göre)

# Timeout Değerleri (saniye)
page_load_timeout: 30                 # Sayfa yükleme timeout
wait_for_ready_timeout: 15            # React app hazır olma timeout
network_idle_timeout: 10              # Network idle timeout
additional_wait: 2                    # Lazy content için ek bekleme
```

### routes.yaml (Otomatik Üretilir)

```yaml
routes:
  - /
  - /company
  - /contact
  - /under-construction
  - /services/consultancy
  - /services/consultancy/legal-government-sources
  - /services/consultancy/project
  - /services/consultancy/technical-education
  - /services/consultancy/centers/setup
  - /services/consultancy/centers/statistics/design-centers
  - /services/consultancy/centers/statistics/rd-centers
```

**Not**: Bu dosya `build_routes.js` tarafından üretilir. Manuel düzenleme önerilmez.

## Cloudflare Workers Deployment

### _worker.js Config Injection

Build sırasında template değişkenler replace edilir:

```javascript
// Template (_worker.js)
const LOCALES = __LOCALES__;
const DEFAULT_LOCALE = __DEFAULT_LOCALE__;
const THEMES = __THEMES__;
const DEFAULT_THEME = __DEFAULT_THEME__;

// Build sonrası (dist/_worker.js)
const LOCALES = ["tr", "en"];
const DEFAULT_LOCALE = "tr";
const THEMES = ["white", "g90"];
const DEFAULT_THEME = "white";
```

### Worker Logic

#### 1. Locale Detection (Öncelik Sırası)
```text
1. Cookie: preferred_locale=en
2. Accept-Language header (ilk dil): en-US,en;q=0.9 → en
3. Fallback: default_locale (tr)
```

#### 2. Theme Detection
```text
1. Cookie: preferred_theme=g90
2. Fallback: default_theme (white)
```

#### 3. Fallback Chain
```text
// Örnek: /contact?locale=en&theme=g90

Try Order:
1. contact/index.g90.en.html    (full match)
2. contact/index.en.html        (theme fallback)
3. contact/index.g90.html       (locale fallback)
4. contact/index.html           (full fallback)

// İlk 200 status dönen dosya serve edilir
```

### Deployment (Cloudflare Pages)

```bash
# 1. Production build
npm run prod

# 2. Cloudflare Pages deploy
npx wrangler pages deploy dist

# 3. _worker.js otomatik algılanır ve edge'de çalışır
```

## Performance ve Optimizasyon

### Render Performansı

| Metrik                     | Değer            | Açıklama                    |
|----------------------------|------------------|-----------------------------|
| **Örnek Route Sayısı**     | 12 routes        | routes.yaml'dan             |
| **Locale Sayısı**          | 2 (tr, en)       | config.yaml'dan             |
| **Tema Sayısı**            | 2 (white, g90)   | config.yaml'dan             |
| **Total HTML Files**       | 48 (12 × 2 × 2)  | Toplam varyant sayısı       |
| **Concurrency**            | 5 parallel pages | config.yaml'dan             |
| **Ortalama Render Süresi** | ~3-5 saniye/page | Network ve içeriğe bağlı    |
| **Total Build Time**       | ~2-4 dakika      | 48 HTML için (5 concurrent) |

### Optimizasyon Önerileri

#### 1. Concurrency Ayarlama

```yaml
# CPU core sayısına göre ayarlayın
playwright:
  concurrency: 8  # 8 core CPU için
```

#### 2. Timeout Optimizasyonu

```yaml
# Hızlı network için timeout'ları azaltın
page_load_timeout: 15      # 30 → 15
network_idle_timeout: 5    # 10 → 5
additional_wait: 1         # 2 → 1
```

#### 3. Headless Mode (Production)

```yaml
playwright:
  headless: true  # Debug: false, Production: true
```

## npm Scripts İlişkisi

```text
"scripts": {
  "routes": "node scripts/build_routes.js",
  // → routes.yaml oluşturur (route discovery)

  "build": "vite build",
  // → dist/ klasörünü oluşturur

  "preview": "vite preview",
  // → dist/ klasörünü serve eder (SSG için gerekli)

  "prerender": "node scripts/utils/prerender-utility/prerender.js",
  // → SSG rendering (routes.yaml okur, HTML üretir)

  "minify:html": "node scripts/minify_html.js",
  // → HTML dosyalarını minify eder

  "prod": "npm run build && npm run prerender",
  // → Full production build
}
```

### Kullanım Senaryoları

```bash
# Senaryo 1: Router değişti, routes.yaml güncelle
npm run routes

# Senaryo 2: Sadece prerender (dist/ mevcut)
npm run prerender

# Senaryo 3: Full production build (önerilen)
npm run prod
```

## Sorun Giderme

### routes.yaml Bulunamadı
```
[ERROR] File not found: routes.yaml
```
**Çözüm**: Route discovery çalıştırın:
```bash
npm run routes
```

### dist/ Klasörü Yok
```
[ERROR] dist/ not found. Run npm run build first
```
**Çözüm**: Önce Vite build yapın:
```bash
npm run build
```

### Preview Server Başlatılamadı
```
[ERROR] Server exited with code 1
```
**Çözüm**: Port kullanımda olabilir, port değiştirin:
```yaml
# config.yaml
preview_port: 5176  # 5175 → 5176
```

### Boş HTML Çıktısı
```
[ERROR] Empty HTML for /contact
```
**Olası Nedenler**:
- React app yüklenmedi (timeout çok kısa)
- JavaScript hatası (console logları kontrol edin)
- Network idle timeout yetersiz

**Çözüm**: Timeout değerlerini artırın:
```yaml
wait_for_ready_timeout: 30  # 15 → 30
network_idle_timeout: 20    # 10 → 20
```

### Playwright Chromium Yüklü Değil
```
[ERROR] Executable doesn't exist
```
**Çözüm**: Chromium kurulumu:
```bash
npx playwright install chromium
```

### Timeout Hataları
```
[ERROR] Failed /contact: Timeout 30000ms exceeded
```
**Çözüm**: Yavaş network için timeout artırın:
```yaml
page_load_timeout: 60       # 30 → 60
network_idle_timeout: 30    # 10 → 30
```

### DNS Override Çalışmıyor
```
[ERROR] net::ERR_CONNECTION_REFUSED
```
**Çözüm**: Preview server'ın çalıştığından emin olun:
```bash
# Manuel test
npm run preview -- --port 5175
```

## Geliştirme Notları

### Debug Mode

Rendering sürecini debug etmek için:

1. **Headless Mode'u kapatın**:
    ```yaml
    playwright:
      headless: false  # Browser görünür olur
    ``` 
2. **Console logları izleyin**: Browser'da developer tools otomatik açılır.

3. **Tek route test edin**:
    ```yaml
    # routes.yaml (test için)
    routes:
      - /  # Sadece homepage
    ```

### AST-based Route Discovery

`build_routes.js` şu mantıkla çalışır:

```javascript
// src/router/index.tsx
const router = createBrowserRouter([
  {
    path: '/',
    children: [
      { path: 'contact' },        // → /contact
      {
        path: 'services',         // → /services
        children: [
          { path: 'consultancy' } // → /services/consultancy
        ]
      }
    ]
  }
]);

// Extracted routes:
// - /
// - /contact
// - /services
// - /services/consultancy
```

**Not**: Dynamic route'lar (`:id`, `:slug`) otomatik exclude edilir.

### Worker Fallback Logic

```text
// Örnek: Kullanıcı cookie'sini en+g90 olarak ayarlamış
// Route: /contact

Try Order:
1. /contact/index.g90.en.html  ✓ (full match, serve)
2. /contact/index.en.html      (skip)
3. /contact/index.g90.html     (skip)
4. /contact/index.html         (skip)

// Eğer 1 yoksa:
1. /contact/index.g90.en.html  ✗ (not found)
2. /contact/index.en.html      ✓ (locale match, serve)

// Eğer 1 ve 2 yoksa:
1. /contact/index.g90.en.html  ✗
2. /contact/index.en.html      ✗
3. /contact/index.g90.html     ✓ (theme match, serve)

// Hiçbiri yoksa:
4. /contact/index.html         ✓ (default fallback, serve)
```

## React Entegrasyonu ve Client-Side Rendering

Pre-rendering sürecinin React tarafında nasıl handle edildiğini anlamak için `useIsClient` hook'u ve `__prerendering=true` 
URL parametresi kritik öneme sahiptir.

### URL Parametresi: `__prerendering=true`

#### Görsel Karşılaştırma

**`__prerendering=true` parametresi olmadan:**

![Client Rendering](assets/client-dark.png#gh-light-mode-only)
![Client Rendering](assets/client-light.png#gh-dark-mode-only)

**`__prerendering=true` parametresi ile:**

![Pre-rendering](assets/prerendering-dark.png#gh-light-mode-only)
![Pre-rendering](assets/prerendering-light.png#gh-dark-mode-only)

#### Playwright Tarafı (prerender.js)

Pre-rendering sırasında her URL'ye bu parametre eklenir:

```javascript
// scripts/utils/prerender-utility/prerender.js (satır 173)
const renderUrl = `${config.production_url}${route}?__prerendering=true&locale=${locale}&theme=${theme}`;

// Örnek URL:
// https://www.artek.tc/contact?__prerendering=true&locale=tr&theme=white
```

Bu parametre sayesinde:
- React app pre-rendering ortamını algılar
- Client-only component'ler (maps, charts, forms) skip edilir
- Hydration mismatch önlenir
- SEO-friendly statik HTML üretilir

#### React Tarafı (useIsClient Hook)

`src/shared/hooks/useIsClient.tsx` hook'u bu parametreyi kontrol eder:

```typescript
import { useState, useEffect } from 'react';

export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // URL parametresini kontrol et
    const params = new URLSearchParams(window.location.search);
    const isPrerendering = params.get('__prerendering') === 'true';

    // Pre-rendering değilse client-side render
    if (!isPrerendering) {
      setIsClient(true);
    }
  }, []);

  return isClient;
}
```

**Hook Davranışı:**

| Ortam                       | `__prerendering` | `isClient` | Sonuç                                 |
|-----------------------------|------------------|------------|---------------------------------------|
| Playwright (SSG)            | `true`           | `false`    | Client-only component'ler skip edilir |
| Production Browser          | yok              | `true`     | Tüm component'ler render edilir       |
| Development (`npm run dev`) | yok              | `true`     | Tüm component'ler render edilir       |

### Kullanım Örnekleri

#### Örnek 1: Mermaid Diyagram Component'i

**Dosya:** `src/shared/components/visualization/Mermaid.tsx`

```tsx
import { useIsClient } from '@shared/hooks';

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const isClient = useIsClient();

  // Pre-rendering sırasında loading state göster
  if (!isClient) {
    return (
      <div className="mermaid-loading-container">
        <InlineNotification
          kind="info"
          title="Diagram Loading"
          subtitle="Preparing visualization..."
        />
      </div>
    );
  }

  // Client-side'da gerçek component'i render et
  return <MermaidInner chart={chart} />;
};
```

**Neden Gerekli?**
- Mermaid library browser-only API'ler kullanır (`window`, `document`)
- Pre-rendering sırasında bu API'ler kullanılamaz
- SEO için statik fallback gösterilir

#### Örnek 2: Google Maps Component'i

**Dosya:** `src/pages/contact/index.tsx`

```tsx
import { useIsClient } from '@shared/hooks';

const ContactPage: React.FC = () => {
  const isClient = useIsClient();

  return (
    <div className="map-container">
      {/* GoogleMap sadece client-side'da render edilir */}
      {isClient ? (
        <Suspense fallback={<SkeletonPlaceholder />}>
          <GoogleMapComponent
            lat={39.4414677}
            lng={29.9819526}
            zoom={13}
            title="ARTEK"
          />
        </Suspense>
      ) : (
        <div style={{ height: '450px' }}>
          Harita yükleniyor...
        </div>
      )}
    </div>
  );
};
```

**Neden Gerekli?**
- Google Maps API browser-only
- Pre-rendering sırasında API çağrıları yapılamaz
- Placeholder göstererek hydration mismatch önlenir

#### Örnek 3: Contact Form Component'i

**Dosya:** `src/pages/contact/index.tsx`

```tsx
const ContactPage: React.FC = () => {
  const isClient = useIsClient();

  return (
    <>
      {isClient ? (
        <ContactForm locale={locale} translations={t.contactPage} />
      ) : (
        <div className="contact-form">
          <h2>İletişim Formu</h2>
          {/* Skeleton placeholder'lar */}
          <SkeletonPlaceholder style={{ height: '56px' }} />
          <SkeletonPlaceholder style={{ height: '56px' }} />
          <SkeletonPlaceholder style={{ height: '120px' }} />
        </div>
      )}
    </>
  );
};
```

**Neden Gerekli?**
- Form submit event handler'ları browser-only
- Pre-rendering sırasında form state yönetimi gereksiz
- SEO için statik form yapısı yeterli

### Pre-Rendering Akışı (React Perspective)

```mermaid
sequenceDiagram
    participant P as Playwright
    participant R as React App
    participant H as useIsClient Hook
    participant C as Component

    P->>R: Navigate to URL<br/>?__prerendering=true
    R->>H: useEffect() triggers
    H->>H: Check URLSearchParams
    H->>H: __prerendering=true detected
    H->>C: isClient = false
    C->>C: Render fallback/skeleton
    P->>P: Capture HTML snapshot
    P->>P: Save to dist/

    Note over P,C: Production Browser (Client-Side)

    participant B as Browser
    B->>R: Navigate to URL<br/>(no __prerendering)
    R->>H: useEffect() triggers
    H->>H: Check URLSearchParams
    H->>H: No __prerendering param
    H->>C: isClient = true
    C->>C: Render full component
    C->>C: Hydrate & initialize
```

### Best Practices

#### 1. Her Zaman useIsClient Kullanın

```tsx
// ❌ Yanlış - Browser API'si direkt kullanılıyor
const BadStorageComponent = () => {
  const [userData, setUserData] = useState(localStorage.getItem('user'));
  return <div>{userData}</div>;
};

// ✅ Doğru - useIsClient ile guard
const GoodStorageComponent = () => {
  const isClient = useIsClient();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (isClient) {
      setUserData(localStorage.getItem('user'));
    }
  }, [isClient]);

  return <div>{isClient ? userData : 'Yükleniyor...'}</div>;
};
```

#### 2. Anlamlı Fallback'ler Sağlayın

```tsx
const BadFallbackComponent = () => {
  const isClientMode = useIsClient();

  // ❌ Yanlış - Boş div
  if (!isClientMode) return <div />;

  return <InteractiveChart />;
};

const GoodFallbackComponent = () => {
  const isClientMode = useIsClient();

  // ✅ Doğru - SEO-friendly placeholder
  if (!isClientMode) {
    return (
      <div className="chart-placeholder" aria-label="Grafik yükleniyor">
        <SkeletonPlaceholder />
        <span className="sr-only">Etkileşimli grafik yüklenecek</span>
      </div>
    );
  }

  return <InteractiveChart />;
};
```

#### 3. Lazy Loading ile Kombinasyon

```tsx
import { lazy, Suspense } from 'react';

// Heavy component'i lazy load et
const LazyHeavyChart = lazy(() => import('./HeavyChart'));

const OptimizedChartWrapper = () => {
  const isClientSide = useIsClient();

  if (!isClientSide) {
    return <ChartLoader />;
  }

  return (
    <Suspense fallback={<ChartLoader />}>
      <LazyHeavyChart />
    </Suspense>
  );
};
```

### Debugging Pre-Rendering Issues

#### URL Parametresini Manuel Test Etme

```bash
# Development server'da pre-rendering simülasyonu
http://localhost:5173/contact?__prerendering=true&locale=tr&theme=white
```

Bu URL'i tarayıcıda açtığınızda:
- Client-only component'ler görünmemeli
- Skeleton/placeholder'lar görünmeli
- Console'da hata olmamalı

#### React DevTools ile Debug

1. React DevTools açın
2. `useIsClient` hook state'ini inceleyin
3. Component tree'de conditional render'ları kontrol edin

#### Common Pitfalls

```tsx
// ❌ Yanlış - useEffect içinde window kullanımı
const BadWindowComponent = () => {
  useEffect(() => {
    const width = window.innerWidth; // Pre-rendering'de hata!
    console.log('Width:', width);
  }, []);

  return <div>Component</div>;
};

// ✅ Doğru - isClient guard ile
const GoodWindowComponent = () => {
  const isClientReady = useIsClient();

  useEffect(() => {
    if (isClientReady) {
      const width = window.innerWidth;
      console.log('Width:', width);
    }
  }, [isClientReady]);

  return <div>Component</div>;
};
```

## Resource Preload Injection (Network-Based)

Pre-rendering sırasında sayfanın yüklediği tüm CSS ve JavaScript chunk'larını otomatik olarak tespit edip, HTML'e 
`<link rel="preload">` ve `<link rel="modulepreload">` tag'leri enjekte ederek sayfa performansını optimize eder.

### Çalışma Prensibi

#### 1. Network Monitoring (Playwright)

Pre-rendering sırasında Playwright'ın network event listener'ı ile tüm HTTP response'ları izlenir:

```javascript
// scripts/utils/prerender-utility/prerender.js (satır 180-203)
const resources = {
  css: new Set(),
  js: new Set(),
};

// Monitor network responses for assets
page.on('response', async (response) => {
  const url = response.url();
  if (!response.ok() || !url.includes('/assets/')) return;

  const relativePath = url.replace(config.production_url, '');

  // Track CSS chunks
  if (url.endsWith('.css')) {
    resources.css.add(relativePath);
  }
  // Track JS chunks (excluding main entry point to avoid duplication)
  else if (url.endsWith('.js') && !relativePath.includes('/assets/index-')) {
    resources.js.add(relativePath);
  }
});
```

**Tespit Kriterleri:**
- Response `200 OK` olmalı
- URL `/assets/` içermeli (Vite build output)
- CSS: `.css` uzantılı dosyalar
- JS: `.js` uzantılı dosyalar (ana entry point hariç)

#### 2. Preload Hint Enjeksiyonu

Tespit edilen kaynaklar için HTML `<head>` bölümüne preload tag'leri eklenir:

```javascript
// scripts/utils/prerender-utility/prerender.js (satır 228-244)
const preloadHints = [];

// CSS preload links (with crossorigin for CORS compatibility)
if (resources.css.size > 0) {
  Array.from(resources.css).forEach((href) => {
    preloadHints.push(`  <link rel="preload" href="${href}" as="style" crossorigin>`);
  });
}

// JS modulepreload links (for lazy chunks, with crossorigin)
if (resources.js.size > 0) {
  Array.from(resources.js).forEach((href) => {
    preloadHints.push(`  <link rel="modulepreload" href="${href}" crossorigin>`);
  });
}

// Inject all preload hints before </head>
if (preloadHints.length > 0) {
  html = html.replace('</head>', `\n${preloadHints.join('\n')}\n  </head>`);
  log.info(`  → ${resources.css.size} CSS + ${resources.js.size} JS preload(s) injected`);
}
```

#### 3. HTML Beautification (Optional)

HTML çıktısı prettier ile formatlanır (debugging için):

```javascript
// scripts/utils/prerender-utility/prerender.js (satır 251-255)
const beautifiedHtml = await prettier.format(html, {
  parser: 'html',
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
});
```

### Örnek HTML Çıktısı

#### Önce (Preload Injection Olmadan)

```html
<!DOCTYPE html>
<html lang="">
  <head>
    <meta charset="UTF-8" />
    <title>ARTEK</title>
    <script type="module" src="/assets/index-abc123.js"></script>
  </head>
  <body>
    <div id="root">...</div>
  </body>
</html>
```

#### Sonra (Preload Injection İle)

```html
<!DOCTYPE html>
<html lang="">
  <head>
    <meta charset="UTF-8" />
    <title>ARTEK</title>
    <link rel="preload" href="/assets/carbon-components-DqHF8pL1.css" as="style" crossorigin>
    <link rel="preload" href="/assets/mermaid-BZ4k9pX2.css" as="style" crossorigin>
    <link rel="modulepreload" href="/assets/vendor-react-C8kL3mP9.js" crossorigin>
    <link rel="modulepreload" href="/assets/lazy-chart-DpQ9mN4k.js" crossorigin>
    <script type="module" src="/assets/index-abc123.js"></script>
  </head>
  <body>
    <div id="root">...</div>
  </body>
</html>
```

### Performans Faydaları

| Metrik                         | Fayda                                                                   |
|--------------------------------|-------------------------------------------------------------------------|
| **Faster Resource Discovery**  | Tarayıcı kaynakları HTML parse sırasında keşfeder (JS execution öncesi) |
| **Reduced Render Blocking**    | CSS preload ile render blocking süresi azalır                           |
| **Improved Code Splitting**    | Lazy-loaded chunk'lar daha hızlı yüklenir (modulepreload)               |
| **Better Network Utilization** | Paralel resource fetching ile network bant genişliği verimli kullanılır |
| **Lighthouse Score**           | Performance score'da +5-10 puan artış (First Contentful Paint iyileşir) |

### Browser Desteği

| Browser         | `<link rel="preload">` | `<link rel="modulepreload">` | `crossorigin` Attribute |
|-----------------|------------------------|------------------------------|-------------------------|
| **Chrome/Edge** | ✅ v50+                 | ✅ v66+                       | ✅ v64+                  |
| **Firefox**     | ✅ v56+                 | ✅ v115+                      | ✅ v55+                  |
| **Safari**      | ✅ v11.1+               | ⚠️ v16.4+ (partial)          | ✅ v11.1+                |
| **Opera**       | ✅ v37+                 | ✅ v53+                       | ✅ v51+                  |

**Not**: `crossorigin` attribute'u CORS uyumluluğu için gereklidir (özellikle CDN kullanımında).

### Console Output

Pre-rendering sırasında inject edilen resource sayısı loglanır:

```bash
[INFO] Rendering / [tr] [white]
[INFO]   → 3 CSS + 5 JS preload(s) injected (8 total)
[INFO] Success: /

[INFO] Rendering /contact [en] [g90]
[INFO]   → 2 CSS + 4 JS preload(s) injected (6 total)
[INFO] Success: /contact
```

### Debugging ve Monitoring

#### 1. Network Tab İnceleme (DevTools)

Tarayıcıda **Network** tab'ı açıp preload hint'lerin çalıştığını doğrulayın:

```
Name                              Status  Type        Initiator
carbon-components-DqHF8pL1.css    200     stylesheet  Preload
vendor-react-C8kL3mP9.js          200     script      Preload
```

**"Initiator" sütunu "Preload" gösteriyorsa** → Hint çalıştı ✅

#### 2. Lighthouse Audit

```bash
# Chrome DevTools > Lighthouse > Performance audit
```

**"Preload key requests"** önerisinin kalkması beklenir.

#### 3. HTML Source İnceleme

```bash
# Üretilen HTML dosyasını inceleyin
cat dist/index.html | grep "preload"
```

**Örnek Çıktı:**
```html
<link rel="preload" href="/assets/carbon-components-DqHF8pL1.css" as="style" crossorigin>
<link rel="modulepreload" href="/assets/vendor-react-C8kL3mP9.js" crossorigin>
```

### Sık Karşılaşılan Sorunlar

#### Preload Hint'ler Eklenmedi

**Belirti:**
```bash
[INFO] Success: /contact
# "→ X CSS + Y JS preload(s) injected" mesajı yok
```

**Olası Nedenler:**
- Network timeout çok kısa (resources yüklenmeden HTML capture edildi)
- `/assets/` prefix'i yanlış (Vite build output farklı dizinde)

**Çözüm:**
```yaml
# config.yaml - timeout'ları artırın
network_idle_timeout: 20  # 10 → 20
additional_wait: 3        # 2 → 3
```

#### CORS Hataları (Console)

**Belirti:**
```
Access to CSS stylesheet blocked by CORS policy
```

**Çözüm:** Preload tag'lerine `crossorigin` attribute'u eklenir (otomatik):
```html
<link rel="preload" href="..." crossorigin>
```

#### Duplicate Preload Tag'leri

**Belirti:** Aynı resource için birden fazla preload tag'i.

**Çözüm:** `Set()` kullanımı ile otomatik deduplicate edilir:
```javascript
const resources = {
  css: new Set(),  // Duplicate entries otomatik filtrelenir
  js: new Set(),
};
```

### Best Practices

#### 1. Ana Entry Point'i Hariç Tutun

```javascript
// ❌ Yanlış - index.js zaten <script> tag'i ile yükleniyor
if (url.endsWith('.js')) {
  resources.js.add(relativePath);
}

// ✅ Doğru - Ana entry point hariç
if (url.endsWith('.js') && !relativePath.includes('/assets/index-')) {
  resources.js.add(relativePath);
}
```

#### 2. Sadece `/assets/` Altındaki Dosyaları Track Edin

```javascript
// ❌ Yanlış - Tüm JS/CSS dosyaları (external CDN dahil)
if (url.endsWith('.css')) {
  resources.css.add(url);
}

// ✅ Doğru - Sadece local build output
if (url.endsWith('.css') && url.includes('/assets/')) {
  resources.css.add(relativePath);
}
```

#### 3. Relative Path Kullanın (Absolute URL Değil)

```javascript
// ❌ Yanlış - Absolute URL
resources.css.add('https://www.artek.tc/assets/style.css');

// ✅ Doğru - Relative path
const relativePath = url.replace(config.production_url, '');
resources.css.add(relativePath);  // /assets/style.css
```

### Karşılaştırma: Manuel vs Otomatik Injection

#### Manuel Yöntem (Önceki Yaklaşım)

```html
<!-- index.html (Manuel eklenen preload'lar) -->
<head>
  <link rel="preload" href="/assets/carbon-components.css" as="style">
  <link rel="modulepreload" href="/assets/vendor-react.js">
  <!-- ❌ Sorunlar:
       - Build hash değişince güncellenmeli (carbon-DqHF8pL1.css)
       - Lazy chunk'lar eksik kalabilir
       - Her route için farklı chunk'lar olabilir
  -->
</head>
```

#### Otomatik Yöntem (Network-Based)

```javascript
// prerender.js - Otomatik tespit
page.on('response', async (response) => {
  // ✅ Avantajlar:
  // - Build hash'leri otomatik yakalanır
  // - Route-specific chunk'lar tespit edilir
  // - Lazy-loaded resources dahil
  // - Her page için optimize edilmiş preload'lar
});
```



