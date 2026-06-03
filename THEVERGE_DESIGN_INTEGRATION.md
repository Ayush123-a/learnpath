# The Verge Design System Integration Guide

This document outlines how The Verge design system has been integrated into LearnPath. Use this guide when building new components and pages.

## 🎨 Color System

### Primary Brand Colors (Hazard Tape Accents)
- **Jelly Mint** (`#3cffd0` / `hsl(175 100% 50%)`): Primary accent, CTAs, links
- **Verge Ultraviolet** (`#5200ff` / `hsl(275 100% 50%)`): Secondary accent, promotional elements

### Canvas & Surfaces
- **Canvas Black** (`#131313` / `hsl(0 0% 7%)`): Default dark background
- **Surface Slate** (`#2d2d2d` / `hsl(0 0% 18%)`): Secondary card background
- **Hazard White** (`#ffffff` / `hsl(0 0% 100%)`): Primary text, borders

### Text Colors
- **Primary Text** (`#ffffff`): Headlines and main content
- **Secondary Text** (`#949494`): Bylines, timestamps, captions
- **Inverted Text** (`#131313`): Text on accent backgrounds

## 🔤 Typography

### Font Stack
- **Display/Headlines**: Space Grotesk (700 weight recommended)
- **UI/Body**: Space Grotesk
- **Monospaced**: Space Mono (for labels, timestamps)

### Typography Utility Classes
```tsx
// Display headlines
<h1 className="text-display-xl">Extra Large Display</h1>
<h2 className="text-display-lg">Large Display</h2>
<h3 className="text-display-md">Medium Display</h3>

// Headings
<div className="text-headline-lg">Large Headline</div>
<div className="text-headline-md">Medium Headline</div>

// Monospaced labels
<span className="text-label-mono">UPPERCASE LABEL</span>
```

## 🧩 Component Patterns

### Verge Cards
Theverge-style cards with rounded corners and minimal borders:
```tsx
<div className="verge-card">
  <div className="h-1 bg-gradient-to-r from-primary to-secondary" />
  <div className="p-6">
    <h3 className="font-bold">Card Title</h3>
    <p className="text-muted-foreground">Description</p>
  </div>
</div>
```

### Gradient Text
Hazard-tape accent text:
```tsx
<span className="gradient-text">Emphasized Text</span>
<span className="gradient-secondary">Secondary Emphasis</span>
```

### Pills & Badges
Rounded pill-style buttons and badges:
```tsx
<span className="verge-pill border border-primary/25 bg-background text-primary">
  BCA
</span>

<div className="accent-badge">Featured</div>
```

### Buttons
```tsx
// Primary hazard gradient
<Button className="btn-gradient">Action</Button>

// Outline variant with primary border
<Button className="btn-outline-verge">Secondary Action</Button>
```

## 🎯 Layout Guidelines

### Spacing
- Use Tailwind's default spacing scale
- Rounded corners: `rounded-2xl` (24px) or `rounded-3xl` (36px) for cards
- Icon badges: `rounded-lg` (8px) to `rounded-2xl` (16px)

### Borders
- Use `border-primary/20` to `border-primary/50` for subtle to prominent
- Thickness: Always `border` (1px) - no thick borders per Theverge style
- Avoid pure borders without accent colors where possible

### Shadows
- Use `shadow-lg` on hover for verge-card elements
- Shadows should have a slight primary color tint for cohesion

## 🌈 Implementation Examples

### Hero Section
```tsx
<section className="relative overflow-hidden py-16 md:py-40">
  <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
  <div className="absolute inset-0 section-pattern opacity-40 hidden md:block" />
  
  {/* Floating hazard-tape accents */}
  <div className="absolute top-20 right-10 h-72 w-72 rounded-full bg-primary/8 blur-3xl animate-float hidden md:block" />
  <div className="absolute bottom-10 left-10 h-56 w-56 rounded-full bg-secondary/8 blur-3xl animate-float hidden md:block" style={{ animationDelay: "3s" }} />
  
  {/* Content */}
</section>
```

### Feature Cards Grid
```tsx
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
  {features.map((f, idx) => (
    <div key={f.title} className="verge-card group overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-primary to-secondary" />
      <div className="p-6">
        <div className="mb-4 inline-flex rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-3 shadow-lg">
          <f.icon className="h-6 w-6 text-foreground" />
        </div>
        <h3 className="text-lg font-bold text-foreground">{f.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
      </div>
    </div>
  ))}
</div>
```

### Accent CTA Section
```tsx
<section className="relative rounded-3xl overflow-hidden py-20">
  <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-primary/60" />
  <div className="absolute inset-0 section-pattern opacity-15" />
  <div className="relative p-10 text-center md:p-16">
    <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
      Ready to Start?
    </h2>
    <Button className="mt-8 bg-primary-foreground text-primary hover:bg-primary-foreground/90">
      Get Started
    </Button>
  </div>
</section>
```

## 📝 CSS Variables Reference

All design tokens are available as CSS variables in `:root` and `.dark`:

```css
/* Colors */
--primary: 175 100% 50%;           /* Jelly Mint */
--secondary: 275 100% 50%;         /* Ultraviolet */
--background: 0 0% 7%;             /* Canvas Black */
--foreground: 0 0% 100%;           /* Hazard White */
--muted: 0 0% 45%;                 /* Gray */

/* Gradients */
--gradient-primary: linear-gradient(135deg, hsl(175 100% 50%), hsl(200 100% 55%));
--gradient-secondary: linear-gradient(135deg, hsl(275 100% 50%), hsl(250 100% 55%));
--gradient-hero: linear-gradient(160deg, hsl(175 100% 50% / 0.12), hsl(275 100% 50% / 0.08), transparent);

/* Shadows */
--shadow-card: 0 1px 3px hsl(0 0% 0% / 0.3), 0 4px 12px hsl(0 0% 0% / 0.15);
--shadow-card-hover: 0 4px 16px hsl(175 100% 50% / 0.25), 0 8px 32px hsl(0 0% 0% / 0.3);
```

## 🚀 Quick Start Checklist

When creating a new page or component:

- [ ] Use `bg-background` and `text-foreground` for base colors
- [ ] Use `border-primary/20` for subtle borders
- [ ] Add `verge-card` class to card components
- [ ] Use `gradient-text` for important emphasis
- [ ] Apply `rounded-2xl` or `rounded-3xl` for card borders
- [ ] Use `btn-gradient` for primary CTAs
- [ ] Use `section-pattern` for subtle background patterns
- [ ] Add `animate-float` to floating decorative elements
- [ ] Use Space Grotesk throughout (already configured as default)

## 📦 Tailwind Config

The Theverge design system colors are available in Tailwind config:
```tsx
// Primary brand hazards
bg-primary, text-primary              // Jelly Mint
bg-secondary, text-secondary          // Ultraviolet

// Additional utilities
bg-verge-mint, bg-verge-ultraviolet   // Direct color access
border-primary/20                      // Alpha variants
```

## 🎬 Animation

- `animate-float`: Floating decoration animation (3s loop)
- Use `animation-delay` for staggered animations
- Transitions: Keep `duration-200` to `duration-300` for snappy feel

---

**Last Updated**: June 3, 2026
**Design System**: The Verge (theverge.com)
**Integration**: Full dark-mode first, editorial canvas aesthetic
