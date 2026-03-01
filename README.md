# Synkris Landing — Demo Section (Clean & Minimal) 🎯

## 🧘 Filosofia: Less is More

Ho completamente ripensato la sezione demo seguendo un principio: **l'utente deve leggere la conversazione, non essere distratto da decorazioni**.

### ❌ Rimosso (era troppo):
- Status bar iPhone (non necessaria)
- Progress bar complessa con labels
- Chat input bar decorativa
- Icone multiple nell'header
- Timestamp su ogni messaggio
- Back button e menu
- Troppi colori e gradienti

### ✅ Mantenuto (essenziale):
- **Conversazione WhatsApp** — chiara e leggibile
- **Step cards** — minimal, solo testo
- **Typing indicator** — 3 pallini semplici
- **Calendar notification** — piccola e discreta
- **Controlli** — 3 bottoni minimal (prev/restart/next)
- **Progress counter** — "Passo 1 di 5" (testo semplice)

## 🎨 Design Principles

### 1. **Spazio Bianco**
- Padding generoso ovunque
- Messaggi ben distanziati (margin-bottom: var(--space-5))
- Chat con min-height: 400px per respiro
- Layout grid con gap: var(--space-12)

### 2. **Leggibilità First**
- Font size 15px per i messaggi (leggibile senza sforzo)
- Line height 1.5 per confort
- Contrast ottimale (testi primary su background)
- Max-width: 85% per messaggi (non troppo larghi)

### 3. **Minimal Decoration**
- Bordi sottili (1px, opacity bassa)
- Background trasparenti o semi-trasparenti
- Niente ombre eccessive
- Colori tenui e non invadenti

### 4. **Focus sul Contenuto**
- Chat è il centro visivo
- Step cards sono di supporto, non protagoniste
- Controlli piccoli e discreti
- Notifica calendario appare solo quando serve

## 📐 Layout

### Mobile (< 1024px):
```
┌─────────────────────┐
│   Chat (sticky)     │
│   ↓ scroll ↓        │
├─────────────────────┤
│   Step 1            │
│   Step 2            │
│   Step 3 (scroll)   │
│   Step 4            │
│   Step 5            │
└─────────────────────┘
```

### Desktop (≥ 1024px):
```
┌───────────┬─────────────────┐
│  Step 1   │                 │
│  Step 2   │                 │
│  Step 3   │   Chat          │
│  Step 4   │   (sticky)      │
│  Step 5   │                 │
│           │                 │
└───────────┴─────────────────┘
```

## 🎯 User Experience

### Scroll Behavior
1. Utente scorri pagina
2. Step cards entrano nel viewport
3. IntersectionObserver rileva
4. Chat si aggiorna progressivamente
5. Messaggi appaiono con fade-in morbido
6. Typing indicator per messaggi bot
7. Chat auto-scroll al nuovo messaggio

### Interazioni
- **Click su step** → aggiorna chat
- **Swipe su mobile** → naviga step (solo su lista step)
- **Prev/Next buttons** → controllo manuale
- **Restart** → torna all'inizio

### Feedback Visivo
- Step attivo: bordo purple + background
- Step numero: cerchio purple pieno quando attivo
- Hover su step: leggero traslate-x
- Hover su bottoni: background + border change
- Disabled buttons: opacity 0.3

## 📱 Responsive

### Breakpoints:
- **Mobile**: < 1024px (chat sopra, steps sotto)
- **Desktop**: ≥ 1024px (2 colonne)
- **Small mobile**: < 480px (font/padding ridotti)

### Touch Gestures:
- Swipe threshold: 60px
- Solo su `.scrolly__steps` container
- Passive listeners per performance
- Smooth scroll to activated step

## 🎨 Components

### Step Card
```css
padding: var(--space-5)
border: 1px solid rgba(167, 139, 250, 0.15)
border-radius: var(--radius-lg)
hover: translateX(4px)
active: border-color primary + background
```

### Message
```css
font-size: 15px
line-height: 1.5
padding: var(--space-4) var(--space-5)
border-radius: 18px
max-width: 85%
```

### Typing Indicator
```css
3 dots, 8px each
animation: 1.4s infinite
delay: 0s, 0.2s, 0.4s
bounce: translateY(-10px)
```

### Calendar Notification
```css
opacity: 0 → 1 (transition 400ms)
max-height: 0 → 200px
background: green tint (subtle)
border: 1px solid green
```

## 🚀 Performance

### Optimizations:
- GPU-accelerated animations (transform, opacity)
- Passive scroll/touch listeners
- MutationObserver invece di polling
- Debounced updates
- CSS containment (dove possibile)

### File Sizes:
- HTML: ~50KB
- CSS: ~60KB (tutto il sito)
- JS: ~20KB (tutto il sito)
- Total: ~130KB (minified)

## ♿ Accessibility

### ARIA:
- `role="tablist"` per steps
- `role="tab"` per ogni step
- `aria-selected="true/false"`
- `aria-labelledby` per chat panel
- `aria-live="polite"` per updates

### Keyboard:
- Tab navigation funzionante
- Enter/Space per attivare step
- Arrow keys per navigare (manual activation)
- Home/End per primo/ultimo step
- Focus visible con outline 2px

### Reduced Motion:
- `prefers-reduced-motion: reduce`
- Disabilita tutte le animazioni
- Position sticky → static
- Mostra transcript completo
- Transition veloci (100ms)

## 🎨 Colors

### Palette:
```css
--primary: #7c3aed (purple)
--primary-light: #a78bfa
--text-primary: #fafafa
--text-secondary: rgba(250, 250, 250, 0.75)
--text-muted: rgba(250, 250, 250, 0.5)
```

### Usage:
- Step attivo: primary
- Messaggi bot: primary tint (opacity 0.2-0.3)
- Messaggi utente: white tint (opacity 0.08)
- Bordi: primary (opacity 0.15-0.3)

## 📦 File Structure

```
synkris-landing/
├── index.html              # Pagina principale
├── styles.css              # Tutti gli stili (incluso demo)
├── app.js                  # Logica scrollytelling originale
├── app-enhanced-clean.js   # Enhancements minimal
├── logo.svg                # Logo
└── README.md               # Questa documentazione
```

## 🔧 Customization

### Cambiare colori:
```css
.scrolly-step.is-active {
  border-color: YOUR_COLOR;
}

.step-num {
  background: YOUR_COLOR;
}
```

### Cambiare timing typing:
```javascript
// In app.js, cerca:
setTimeout(() => {
  // Show message
}, 600); // ← Cambia questo
```

### Aggiungere step:
```html
<button class="scrolly-step" type="button" data-step="5">
  <span class="step-num">6</span>
  <div class="step-content">
    <h3>Titolo</h3>
    <p>Descrizione</p>
  </div>
</button>
```

```html
<div class="msg-group scrolly-msg" data-show-from="5" hidden>
  <div class="msg msg--out">Nuovo messaggio</div>
</div>
```

## ✨ Best Practices

### Do's:
- ✅ Mantieni messaggi brevi e leggibili
- ✅ Usa emoji con moderazione
- ✅ Testa su device reali
- ✅ Verifica contrast ratio
- ✅ Testa con screen reader

### Don'ts:
- ❌ Non aggiungere troppi step (max 7)
- ❌ Non usare font size < 14px
- ❌ Non rimuovere aria attributes
- ❌ Non disabilitare smooth scroll
- ❌ Non sovraccaricare di animazioni

## 🐛 Known Issues

Nessuno al momento! 🎉

## 📈 Next Steps

Se vuoi migliorare ulteriormente:

1. **Analytics**: Traccia quali step gli utenti guardano di più
2. **A/B Testing**: Testa diverse copy per i messaggi
3. **Video**: Considera un video invece del mockup
4. **Sound**: Aggiungi suono notifica (opzionale)
5. **Haptics**: Vibrazione su mobile (Navigator.vibrate)

## 🤝 Credits

- **Fonts**: Space Grotesk + Manrope (Google Fonts)
- **Device Frame**: Minimal custom CSS (no library)
- **Icons**: SVG inline
- **Inspiration**: WhatsApp, Linear, Stripe

---

**Fatto con ❤️ e minimalismo per Synkris**
