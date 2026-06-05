# 🔔 DotNotify

> **iOS-glass particle notifications** — dots fly in from random positions, merge into a frosted-glass card, and explode back into dots on dismiss.

[![npm version](https://img.shields.io/npm/v/dotnotify.svg)](https://www.npmjs.com/package/dotnotify)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-zero-green.svg)]()
[![Gzipped](https://img.shields.io/badge/gzipped-~9kb-orange.svg)]()

---

## ✨ Features

| Feature | Details |
|---|---|
| 🌊 **Particle entry** | 65 dots fly in from random positions with comet trails and glow halos |
| 💥 **Particle exit** | 52 dots explode outward on dismiss |
| 🧊 **iOS glass card** | `backdrop-filter: blur(40px) saturate(220%)` — real frosted glass |
| ⏸️ **Hover pause** | Timer freezes on card hover, dots pulse up |
| 🖼️ **Developer images** | Pass a URL, File object, or `<img>` element as the notification icon |
| 🎵 **Web Audio sound** | Zero-file sound via Web Audio API |
| 📦 **Stack & queue** | Up to 4 stacked, extras queue automatically |
| 👆 **Swipe dismiss** | Drag left/right to fling away |
| 🔘 **Action buttons** | Retry, Dismiss — any labels you want |
| 💍 **Ring progress** | Circular countdown ring around the icon as alternative to dots |
| 🎨 **4 themes** | `ios-glass` · `dark` · `light` · `minimal` |
| 🔷 **TypeScript** | Full `.d.ts` included |
| ⚡ **Promise API** | `await notify.fire(...)` — knows how it was dismissed |
| 0️⃣ **Zero deps** | Pure vanilla JS, no external libraries |

---

## 📦 Installation

```bash
npm install dotnotify
```

Or via CDN (no build step):

```html
<script src="https://cdn.jsdelivr.net/npm/dotnotify/dist/dotnotify.min.js"></script>
```

---

## 🚀 Quick Start

```js
import DotNotify from 'dotnotify';

const notify = DotNotify({ position: 'top-right' });

notify.fire({
  type: 'success',
  title: 'Logged in!',
  message: 'Welcome back, Rahul.',
});
```

That's it. Dots fly in, card appears, dots explode when it disappears.

---

## 📐 Configuration

### `DotNotify(config)` — Global Config

```js
const notify = DotNotify({
  position: 'top-right',   // 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  theme:    'ios-glass',   // 'ios-glass' | 'dark' | 'light' | 'minimal'
  sound:    false,         // Web Audio ping on appear
  maxStack: 4,             // Max simultaneous notifications
  duration: 4200,          // Auto-dismiss after N milliseconds
  zIndex:   99999,         // CSS z-index
});
```

---

## 🔥 `notify.fire(options)` — Full API

```js
const result = await notify.fire({
  // ── Required ──────────────────────────────
  type:    'error',                  // 'error' | 'success' | 'warning' | 'info'
  title:   'Login Failed',
  message: 'Invalid credentials. Please try again.',

  // ── Icon / Image ──────────────────────────
  image:     'https://example.com/avatar.png',  // URL   ← developer picture
  // image:  fileInput.files[0],                // File  ← from <input type="file">
  // image:  document.querySelector('#myImg'),  // HTMLImageElement
  // icon:   '🔥',                              // Emoji (when no image)
  // icon:   '<svg>...</svg>',                  // SVG string

  thumbnail: 'https://example.com/preview.jpg', // Small image beside message

  // ── Override per-notification ─────────────
  theme:         'ios-glass',   // Override global theme
  duration:      6000,          // Override global duration (ms)
  app:           'My App',      // Override app label above title
  sound:         true,          // Override global sound setting
  progressStyle: 'dots',        // 'dots' | 'ring'

  // ── Action Buttons ────────────────────────
  actions: [
    { label: 'Retry',   primary: true,  onClick: () => retryLogin() },
    { label: 'Dismiss', primary: false, onClick: () => {}           },
  ],
});

// result = { dismissed: 'action' | 'timeout' | 'swipe-left' | 'swipe-right' | 'close', action?: 'Retry' | 'Dismiss' }
console.log(result.dismissed); // 'action'
console.log(result.action);    // 'Retry'
```

---

## 🖼️ Developer Images — Full Guide

DotNotify lets developers put **any image** — user avatar, app logo, product thumbnail — into the notification icon area. Three ways to do it:

### 1. URL string (most common)

```js
notify.fire({
  type:    'info',
  title:   'New message from Priya',
  message: 'Hey, can we jump on a call?',
  image:   'https://i.pravatar.cc/150?img=47',   // any image URL
});
```

### 2. File object — from `<input type="file">`

```html
<input type="file" id="avatar" accept="image/*">
```

```js
document.getElementById('avatar').addEventListener('change', (e) => {
  const file = e.target.files[0];

  notify.fire({
    type:    'success',
    title:   'Profile picture updated',
    message: 'Your new avatar looks great!',
    image:   file,   // ← File object directly, no FileReader needed
  });
});
```

### 3. Drag and drop

```js
document.addEventListener('drop', (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (!file?.type.startsWith('image/')) return;

  notify.fire({
    type:    'info',
    title:   'File received',
    message: file.name,
    image:   file,
  });
});
```

### 4. Existing `<img>` element

```js
const img = document.querySelector('#user-avatar');

notify.fire({
  type:    'success',
  title:   'Logged in',
  message: 'Welcome back!',
  image:   img,   // ← pass the element directly
});
```

### 5. Thumbnail (secondary image beside message)

```js
notify.fire({
  type:      'info',
  title:     'New photo shared',
  message:   'Suresh shared a photo with you.',
  image:     'https://example.com/suresh-avatar.jpg',   // icon area
  thumbnail: 'https://example.com/photo-preview.jpg',   // beside message
});
```

---

## 🎨 Themes

```js
// Per-notification theme override:
notify.fire({ type: 'error', title: 'Oops', message: '...', theme: 'light' });
```

| Theme | Look |
|---|---|
| `ios-glass` | Deep dark frosted glass — blur 40px, barely-visible tint |
| `dark` | Opaque near-black, strong shadow |
| `light` | White frosted glass, for light-background sites |
| `minimal` | Ultra-thin dark card, no sheen |

---

## 💍 Ring vs Dots Progress

```js
// Circular ring around the icon
notify.fire({
  type:          'warning',
  title:         'Session expiring',
  message:       'You will be logged out in 60 seconds.',
  progressStyle: 'ring',   // ← ring traces around the icon
});

// Default dot progress bar (14 dots at bottom)
notify.fire({
  type:          'info',
  title:         'Syncing...',
  message:       'Your data is being uploaded.',
  progressStyle: 'dots',   // default
});
```

---

## ⏸️ Hover Behaviour

When a user hovers the card:
- The **timer freezes** (remembers exact progress, resumes on mouse-leave)
- All **pending dots pulse up** and glow in the accent color
- Done dots revive slightly
- Individual dot hover **expands that dot to 12px** with full glow bloom

---

## 👆 Swipe to Dismiss

Works on both desktop (click-drag) and mobile (touch). Drag left or right past 80px threshold — the card flings away and dots explode.

```js
const result = await notify.fire({ ... });
if (result.dismissed === 'swipe-left') {
  console.log('User swiped it away');
}
```

---

## 📚 Framework Examples

### React

```jsx
import DotNotify from 'dotnotify';
import { useRef, useCallback } from 'react';

export function useNotify() {
  const notifyRef = useRef(null);

  function getNotify() {
    if (!notifyRef.current) {
      notifyRef.current = DotNotify({ position: 'top-right', theme: 'ios-glass' });
    }
    return notifyRef.current;
  }

  const fire = useCallback((opts) => getNotify().fire(opts), []);
  return { fire };
}

// In any component:
function LoginForm() {
  const { fire } = useNotify();

  async function handleSubmit() {
    try {
      await loginAPI();
      fire({ type: 'success', title: 'Welcome!', message: 'Logged in successfully.' });
    } catch (err) {
      const result = await fire({
        type:    'error',
        title:   'Login Failed',
        message: err.message,
        actions: [{ label: 'Retry', primary: true }],
      });
      if (result.action === 'Retry') handleSubmit();
    }
  }

  return <button onClick={handleSubmit}>Login</button>;
}
```

### Vue 3

```js
// plugins/notify.js
import DotNotify from 'dotnotify';
export const notify = DotNotify({ position: 'top-right', theme: 'ios-glass' });

// main.js
import { notify } from './plugins/notify';
app.config.globalProperties.$notify = notify;

// In component:
this.$notify.fire({ type: 'success', title: 'Done!', message: 'Saved.' });
```

### Vanilla JS (CDN)

```html
<script src="https://cdn.jsdelivr.net/npm/dotnotify/dist/dotnotify.min.js"></script>
<script>
  const notify = DotNotify({ position: 'top-right' });

  document.querySelector('#login-btn').addEventListener('click', async () => {
    const result = await notify.fire({
      type:    'error',
      title:   'Login Failed',
      message: 'Wrong password. Try again or reset.',
      actions: [
        { label: 'Retry',       primary: true },
        { label: 'Reset pass',  onClick: () => location.href = '/reset' },
      ],
    });
    console.log(result); // { dismissed: 'action', action: 'Retry' }
  });
</script>
```

### Next.js / Nuxt

```js
// Works only in browser — wrap in useEffect / onMounted
useEffect(() => {
  const notify = DotNotify({ position: 'top-right' });
  notify.fire({ type: 'info', title: 'Hello', message: 'Page loaded.' });
}, []);
```

---

## 🔧 Instance Methods

```js
const notify = DotNotify({ ... });

// Fire a notification (returns Promise)
await notify.fire({ ... });

// Dismiss all visible notifications immediately
notify.dismissAll();

// Update global config after init
notify.configure({ theme: 'light', sound: true });
```

---

## 🎵 Sound

DotNotify generates a subtle two-tone ping using the Web Audio API — no audio files, no network requests.

```js
const notify = DotNotify({ sound: true });     // enable globally
notify.fire({ ..., sound: false });             // override per-notification
notify.fire({ ..., sound: true });              // override per-notification
```

Sound frequencies by type:
- `error` — 440Hz → 330Hz (descending, unsettling)
- `success` — 523Hz → 659Hz (ascending, happy)
- `warning` — 466Hz → 440Hz (slight drop, cautionary)
- `info` — 587Hz → 659Hz (gentle rise, neutral)

---

## 🌐 Browser Support

| Browser | Support |
|---|---|
| Chrome 76+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Firefox 70+ | ✅ Full |
| Edge 79+ | ✅ Full |
| iOS Safari 14+ | ✅ Full (touch swipe works) |
| Android Chrome | ✅ Full |

> `backdrop-filter` requires Chrome 76+, Safari 9+, Firefox 70+.
> On older browsers the card still renders — just without the blur effect.

---

## 📁 Package Structure

```
dotnotify/
├── dist/
│   ├── dotnotify.js        ← UMD build (CommonJS + browser global)
│   ├── dotnotify.esm.js    ← ES Module build (import/export)
│   ├── dotnotify.min.js    ← Minified browser build (~9kb gzipped)
│   └── dotnotify.d.ts      ← TypeScript definitions
├── src/
│   └── dotnotify.js        ← Source
├── examples/
│   ├── vanilla.html        ← Vanilla JS demo
│   └── react-example.jsx   ← React demo
├── package.json
└── README.md
```

---

## 🗺️ Roadmap

- [ ] `dotnotify/react` — official React component wrapper
- [ ] `dotnotify/vue` — official Vue plugin
- [ ] Custom dot count and dot size
- [ ] Notification center (history panel)
- [ ] CSS custom properties for full theme control
- [ ] RTL support

---

## 📄 License

MIT © 2024 Your Name

---

## 🤝 Contributing

1. Fork the repo
2. `npm install`
3. Edit `src/dotnotify.js`
4. `npm run build`
5. Open `examples/vanilla.html` to test
6. Submit a PR

---

<p align="center">Made with ❤️ · <a href="https://github.com/yourusername/dotnotify">GitHub</a> · <a href="https://www.npmjs.com/package/dotnotify">npm</a></p>
