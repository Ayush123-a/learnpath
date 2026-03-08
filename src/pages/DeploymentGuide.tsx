import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Globe, Smartphone, Store, Server, Shield,
  CheckCircle2, Copy, Terminal, Rocket, Download, Settings,
  Monitor, Layers, Zap, Database, Lock, BarChart3,
} from "lucide-react";
import logo from "@/assets/logo.png";

const steps = {
  web: [
    {
      title: "1. Publish via Lovable",
      icon: Rocket,
      content: [
        "Click the **Publish** button in the top-right corner of the Lovable editor.",
        "Your app is instantly deployed to a `.lovable.app` subdomain.",
        "Frontend changes require clicking **Update** to go live.",
        "Backend changes (edge functions, database) deploy **automatically**.",
      ],
    },
    {
      title: "2. Connect Custom Domain",
      icon: Globe,
      content: [
        "Go to **Project → Settings → Domains** in Lovable.",
        "Enter your custom domain (e.g., `learnpath.in`).",
        "Add the provided **CNAME** or **A record** in your domain registrar's DNS settings.",
        "SSL certificate is provisioned automatically.",
        "Allow up to 24 hours for DNS propagation.",
      ],
    },
    {
      title: "3. SEO & Performance",
      icon: BarChart3,
      content: [
        "All pages include semantic HTML, meta tags, and Open Graph data.",
        "Lazy loading is enabled for images and route-level code splitting.",
        "Fonts use `font-display: swap` for fast text rendering.",
        "Supabase API calls are cached with React Query (5-min stale time).",
        "Build outputs optimized vendor chunks for browser caching.",
      ],
    },
  ],
  pwa: [
    {
      title: "1. PWA is Pre-Configured",
      icon: CheckCircle2,
      content: [
        "The app already uses `vite-plugin-pwa` with auto-update service worker.",
        "`manifest.json` is configured with app name, icons, and theme color.",
        "Offline caching is enabled for static assets, images, fonts, and API calls.",
        "The service worker uses **NetworkFirst** for API calls and **CacheFirst** for static assets.",
      ],
    },
    {
      title: "2. Install on Mobile",
      icon: Smartphone,
      content: [
        "**Android**: Open the app in Chrome → tap the 3-dot menu → **\"Add to Home Screen\"** or **\"Install app\"**.",
        "**iPhone**: Open in Safari → tap the Share icon → **\"Add to Home Screen\"**.",
        "The app launches in standalone mode (no browser UI) and works offline.",
        "Updates are applied automatically when users revisit the app.",
      ],
    },
    {
      title: "3. PWA Features Active",
      icon: Zap,
      content: [
        "✅ Installable from browser to home screen",
        "✅ Offline access for cached pages and content",
        "✅ Adaptive caching — API data cached for 5 min, images for 30 days, fonts for 1 year",
        "✅ Auto-update service worker — no manual intervention needed",
        "✅ Responsive design — works on all screen sizes",
      ],
    },
  ],
  playstore: [
    {
      title: "1. Set Up Capacitor",
      icon: Terminal,
      content: [
        "Export the project to GitHub via **Settings → GitHub → Export**.",
        "Clone the repo locally and run `npm install`.",
        "Install Capacitor dependencies:",
        "```\nnpm install @capacitor/core @capacitor/android\nnpm install -D @capacitor/cli\nnpx cap init\n```",
        "Add Android platform: `npx cap add android`",
      ],
    },
    {
      title: "2. Configure & Build",
      icon: Settings,
      content: [
        "In `capacitor.config.ts`, set:",
        "• `appId`: `com.learnpath.app`",
        "• `appName`: `Learn Path`",
        "• `webDir`: `dist`",
        "Run `npm run build` to create production build.",
        "Run `npx cap sync android` to copy web assets to Android project.",
        "Open in Android Studio: `npx cap open android`",
      ],
    },
    {
      title: "3. Generate Signed APK/AAB",
      icon: Lock,
      content: [
        "In Android Studio: **Build → Generate Signed Bundle / APK**.",
        "Create a new keystore (save it securely — you'll need it for updates).",
        "Choose **Android App Bundle (.aab)** for Play Store (recommended).",
        "Select **release** build variant and complete the build.",
        "The output `.aab` file is ready for upload.",
      ],
    },
    {
      title: "4. Prepare Play Store Listing",
      icon: Store,
      content: [
        "Create a [Google Play Developer Account](https://play.google.com/console) (one-time $25 fee).",
        "Create a new app and fill in:",
        "• **App name**: Learn Path",
        "• **Short description**: India's university learning platform for BCA, BBA, BCom, MCA & MBA",
        "• **Category**: Education",
        "• **Content rating**: Complete the questionnaire (typically rated for Everyone)",
      ],
    },
    {
      title: "5. Required Assets for Play Store",
      icon: Layers,
      content: [
        "**App Icon**: 512×512 PNG (already at `/icons/icon-512.png`)",
        "**Feature Graphic**: 1024×500 PNG (promotional banner)",
        "**Screenshots**: At least 2 phone screenshots (1080×1920 recommended)",
        "• Home page / landing screen",
        "• Course browsing screen",
        "• Quiz/test interface",
        "• Dashboard with features",
        "**Privacy Policy URL**: Required — host a privacy policy page on your domain.",
      ],
    },
    {
      title: "6. Submit for Review",
      icon: Rocket,
      content: [
        "Upload the `.aab` file to **Production → Create new release**.",
        "Complete the **App content** section (privacy policy, ads declaration, data safety).",
        "Set pricing to **Free** (monetization is via in-app subscriptions).",
        "Submit for review — Google typically reviews within **1–3 business days**.",
        "Once approved, the app goes live on the Google Play Store! 🎉",
      ],
    },
  ],
};

const checklist = [
  { label: "Custom domain connected", category: "Web" },
  { label: "SSL certificate active", category: "Web" },
  { label: "Meta tags & Open Graph configured", category: "SEO" },
  { label: "PWA manifest.json configured", category: "PWA" },
  { label: "Service worker caching active", category: "PWA" },
  { label: "App icons (192px & 512px) created", category: "PWA" },
  { label: "Responsive design tested on mobile", category: "UI" },
  { label: "Dark/light mode working", category: "UI" },
  { label: "RLS policies on all tables", category: "Security" },
  { label: "Privacy policy page created", category: "Legal" },
  { label: "Play Store developer account created", category: "Store" },
  { label: "Feature graphic & screenshots prepared", category: "Store" },
  { label: "Signed AAB bundle generated", category: "Store" },
  { label: "Play Store listing submitted", category: "Store" },
];

const DeploymentGuide = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Learn Path" className="h-8 w-8 rounded" />
            <span className="font-display text-lg font-bold">Deployment Guide</span>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl py-8 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <h1 className="font-display text-4xl font-bold text-foreground">
            Deploy <span className="text-primary">Learn Path</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Complete guide to publishing your app on the web, configuring it as an installable PWA, and submitting to the Google Play Store.
          </p>
        </div>

        {/* Architecture Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" /> Architecture Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-lg border bg-muted/30 p-4 text-center space-y-2">
                <Monitor className="h-8 w-8 text-primary mx-auto" />
                <h3 className="font-display font-semibold">Frontend</h3>
                <p className="text-xs text-muted-foreground">React + Vite + Tailwind<br />Hosted on Lovable CDN</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4 text-center space-y-2">
                <Database className="h-8 w-8 text-primary mx-auto" />
                <h3 className="font-display font-semibold">Backend</h3>
                <p className="text-xs text-muted-foreground">Lovable Cloud<br />PostgreSQL + Edge Functions</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4 text-center space-y-2">
                <Shield className="h-8 w-8 text-primary mx-auto" />
                <h3 className="font-display font-semibold">Security</h3>
                <p className="text-xs text-muted-foreground">RLS Policies + JWT Auth<br />Role-based Access Control</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Steps */}
        <Tabs defaultValue="web" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="web" className="gap-2">
              <Globe className="h-4 w-4" /> Web Deploy
            </TabsTrigger>
            <TabsTrigger value="pwa" className="gap-2">
              <Smartphone className="h-4 w-4" /> PWA / Mobile
            </TabsTrigger>
            <TabsTrigger value="playstore" className="gap-2">
              <Store className="h-4 w-4" /> Play Store
            </TabsTrigger>
          </TabsList>

          {(["web", "pwa", "playstore"] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {steps[tab].map((step, i) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <CardTitle className="font-display text-lg flex items-center gap-2">
                      <step.icon className="h-5 w-5 text-primary" />
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {step.content.map((line, j) => (
                        <li key={j} className="text-sm text-muted-foreground leading-relaxed">
                          {line.startsWith("```") ? (
                            <pre className="mt-2 rounded-md bg-muted p-3 text-xs font-mono text-foreground overflow-x-auto">
                              {line.replace(/```\n?/g, "").trim()}
                            </pre>
                          ) : line.startsWith("✅") || line.startsWith("•") ? (
                            <span>{line}</span>
                          ) : (
                            <span>→ {line}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>

        {/* Deployment Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" /> Deployment Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {checklist.map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="h-5 w-5 rounded border-2 border-muted-foreground/30 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Environment Info */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" /> Environment Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-muted p-4 space-y-2 font-mono text-xs">
              <p className="text-muted-foreground"># Auto-configured by Lovable Cloud</p>
              <p><span className="text-primary">VITE_SUPABASE_URL</span>=https://[project-id].supabase.co</p>
              <p><span className="text-primary">VITE_SUPABASE_PUBLISHABLE_KEY</span>=eyJ...</p>
              <p><span className="text-primary">VITE_SUPABASE_PROJECT_ID</span>=[project-id]</p>
            </div>
            <p className="text-sm text-muted-foreground">
              These environment variables are automatically managed. Never edit the <code className="bg-muted px-1 rounded">.env</code> file manually.
              Backend changes (edge functions, database migrations) deploy immediately and automatically.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DeploymentGuide;
