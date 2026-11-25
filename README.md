# NEON//GRID — Cyberpunk theme for Jellyfin

A cyberpunk skin for Jellyfin Web with a neon-purple accent: a grid backdrop, subtle CRT scanlines, cut-corner cards and buttons, neon glow on hover, and Orbitron / Rajdhani / Share Tech Mono type.

## Install

1. In Jellyfin, open **Dashboard → General** (10.10+: **Dashboard → Branding**).
2. Paste this into **Custom CSS code**:

```css
@import url("https://cdn.jsdelivr.net/gh/Gonnago-Fast/jellyfin_cyberpunk_theme@main/theme.css");
```

3. Click **Save**, then hard-refresh your browser (Ctrl/Cmd + Shift + R).

For the best result, set **Settings → Display → Theme** to **Dark**.

## Customise the colours

Put overrides **below** the `@import` line:

```css
:root {
  --cp-accent: #b026ff;     /* main neon colour */
  --cp-accent-hi: #d37bff;  /* lighter shade for hovers / text */
  --cp-accent-lo: #5a0f8a;  /* deep shade */
  --cp-accent-rgb: 176, 38, 255; /* same as --cp-accent, as R, G, B */
  --cp-cut: 12px;           /* size of the clipped corners, 0 to disable */
}
```

Turn off the scanlines:

```css
body::after { display: none !important; }
```

## Updating

jsDelivr caches the `@main` URL for up to 12 hours. To pick up a change right away, open
`https://purge.jsdelivr.net/gh/Gonnago-Fast/jellyfin_cyberpunk_theme@main/theme.css` once.

## Licence

MIT

## Boot screen & effects

On load, a short "NEON//GRID OS" boot sequence plays (about 2.5 seconds, and it never blocks clicks). Hovering a card triggers a holographic light sweep and an RGB-split glitch on its title.

Turn the boot screen off:

```css
body::before { display: none !important; }
```

All animations are disabled automatically if your device has "reduce motion" enabled.
