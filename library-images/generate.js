// Generates cyberpunk library tiles (Movies / Shows / Music) for Jellyfin.
const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const W = 1920, H = 1080, HORIZON = 640, VX = 960;

const libs = {
  movies: {
    title: 'MOVIES', tag: '// FEATURE_ARCHIVE',
    sun: ['#ff2bd6', '#b026ff', '#4b0c7a'], accent: '#ff5fe0',
    icon: clapper(),
  },
  shows: {
    title: 'SHOWS', tag: '// SERIES_UPLINK',
    sun: ['#00f0ff', '#b026ff', '#3d0b6b'], accent: '#5ff6ff',
    icon: tv(),
  },
  music: {
    title: 'MUSIC', tag: '// AUDIO_STREAM',
    sun: ['#ffb347', '#ff2bd6', '#5a0f8a'], accent: '#ffc46b',
    icon: headphones(),
  },
};

// ---------- icons (drawn around 0,0, roughly 360 wide) ----------
function clapper() {
  return `
  <g stroke-linejoin="round" stroke-linecap="round">
    <rect x="-170" y="-40" width="340" height="230" rx="14"/>
    <path d="M-170 -40 L170 -40 L170 -100 L-170 -100 Z" transform="rotate(-12 -170 -40)"/>
    <g transform="rotate(-12 -170 -40)">
      <path d="M-120 -100 L-90 -40 M-50 -100 L-20 -40 M20 -100 L50 -40 M90 -100 L120 -40"/>
    </g>
    <path d="M-170 10 L170 10"/>
    <path d="M-20 60 L50 105 L-20 150 Z"/>
  </g>`;
}
function tv() {
  return `
  <g stroke-linejoin="round" stroke-linecap="round">
    <path d="M-60 -150 L0 -95 L60 -150"/>
    <rect x="-190" y="-95" width="380" height="270" rx="30"/>
    <rect x="-160" y="-65" width="260" height="210" rx="24"/>
    <circle cx="145" cy="-20" r="16"/>
    <circle cx="145" cy="35" r="16"/>
    <path d="M130 100 L160 100 M130 125 L160 125"/>
    <path d="M-120 175 L-140 215 M120 175 L140 215"/>
    <path d="M-110 20 Q-80 -20 -50 20 T10 20 T70 20"/>
  </g>`;
}
function headphones() {
  return `
  <g stroke-linejoin="round" stroke-linecap="round">
    <path d="M-160 60 L-160 0 A160 160 0 0 1 160 0 L160 60"/>
    <rect x="-200" y="40" width="80" height="140" rx="26"/>
    <rect x="120" y="40" width="80" height="140" rx="26"/>
    <path d="M-60 150 L-60 90 M-30 150 L-30 50 M0 150 L0 110 M30 150 L30 70 M60 150 L60 100"/>
  </g>`;
}

// ---------- scene ----------
function grid() {
  const lines = [];
  // horizontal lines, spacing grows towards the viewer
  for (let i = 1; i <= 16; i++) {
    const t = i / 16;
    const y = HORIZON + Math.pow(t, 2.2) * (H - HORIZON + 40);
    lines.push(`<line x1="0" y1="${y.toFixed(1)}" x2="${W}" y2="${y.toFixed(1)}" opacity="${(0.25 + t * 0.75).toFixed(2)}"/>`);
  }
  // vertical lines converging to the vanishing point
  for (let i = -24; i <= 24; i++) {
    const xb = VX + i * 160;
    lines.push(`<line x1="${VX}" y1="${HORIZON}" x2="${xb}" y2="${H + 40}"/>`);
  }
  return lines.join('');
}

function stars(seed) {
  let s = seed, out = [];
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 90; i++) {
    const x = rnd() * W, y = rnd() * (HORIZON - 60), r = rnd() * 1.6 + 0.4;
    out.push(`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" opacity="${(0.3 + rnd() * 0.6).toFixed(2)}"/>`);
  }
  return out.join('');
}

function sunStripes() {
  // gaps cut through the lower half of the sun
  const out = [];
  for (let i = 0; i < 7; i++) {
    const y = 500 + i * 22, h = 3 + i * 2.4;
    out.push(`<rect x="0" y="${y.toFixed(1)}" width="${W}" height="${h.toFixed(1)}" fill="black"/>`);
  }
  return out.join('');
}

function svg(lib, i) {
  const { title, tag, sun, accent, icon } = lib;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#05030a"/>
      <stop offset="0.55" stop-color="#140a26"/>
      <stop offset="1" stop-color="#2a0c46"/>
    </linearGradient>
    <radialGradient id="haze" cx="0.5" cy="${HORIZON / H}" r="0.6">
      <stop offset="0" stop-color="#b026ff" stop-opacity=".55"/>
      <stop offset="1" stop-color="#b026ff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${sun[0]}"/>
      <stop offset="0.55" stop-color="${sun[1]}"/>
      <stop offset="1" stop-color="${sun[2]}"/>
    </linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#12061f"/>
      <stop offset="1" stop-color="#05030a"/>
    </linearGradient>
    <linearGradient id="gridfade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="white" stop-opacity=".45"/>
      <stop offset="0.35" stop-color="white" stop-opacity="1"/>
    </linearGradient>
    <mask id="gridmask"><rect x="0" y="${HORIZON}" width="${W}" height="${H - HORIZON}" fill="url(#gridfade)"/></mask>
    <mask id="sunmask">
      <rect width="${W}" height="${H}" fill="white"/>
      ${sunStripes()}
    </mask>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="10" result="b1"/>
      <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b2"/>
      <feMerge><feMergeNode in="b1"/><feMergeNode in="b1"/><feMergeNode in="b2"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="softglow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="40"/>
    </filter>
    <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="2" fill="black" opacity=".22"/>
    </pattern>
    <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0.6" stop-color="black" stop-opacity="0"/>
      <stop offset="1" stop-color="black" stop-opacity=".75"/>
    </radialGradient>
  </defs>

  <!-- sky -->
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <g fill="#e9e3ff">${stars(7 + i * 131)}</g>
  <rect width="${W}" height="${H}" fill="url(#haze)"/>

  <!-- sun -->
  <circle cx="${VX}" cy="470" r="300" fill="${sun[1]}" opacity=".45" filter="url(#softglow)"/>
  <circle cx="${VX}" cy="470" r="270" fill="url(#sun)" mask="url(#sunmask)"/>

  <!-- floor + grid -->
  <rect x="0" y="${HORIZON}" width="${W}" height="${H - HORIZON}" fill="url(#floor)"/>
  <g stroke="#b026ff" stroke-width="2.5" mask="url(#gridmask)" filter="url(#glow)">${grid()}</g>
  <line x1="0" y1="${HORIZON}" x2="${W}" y2="${HORIZON}" stroke="${accent}" stroke-width="3" filter="url(#glow)"/>

  <!-- icon -->
  <g transform="translate(${VX} 410) scale(1.05)" fill="none" stroke="#ffffff" stroke-width="11" filter="url(#glow)" style="color:${accent}">
    <g stroke="${accent}" stroke-width="22" opacity=".55">${icon}</g>
    ${icon}
  </g>

  <!-- dark haze behind the title for legibility -->
  <ellipse cx="${VX}" cy="870" rx="620" ry="130" fill="#05030a" opacity=".75" filter="url(#softglow)"/>

  <!-- title with chromatic split -->
  <g font-family="Orbitron" font-weight="900" font-size="168" text-anchor="middle" letter-spacing="22">
    <text x="${VX - 6}" y="880" fill="#00f0ff" opacity=".75">${title}</text>
    <text x="${VX + 6}" y="880" fill="#ff2bd6" opacity=".75">${title}</text>
    <text x="${VX}" y="880" fill="#ffffff" filter="url(#glow)">${title}</text>
  </g>
  <text x="${VX}" y="950" font-family="Share Tech Mono" font-size="40" fill="${accent}" text-anchor="middle" letter-spacing="10" opacity=".9">${tag}</text>

  <!-- HUD corners -->
  <g stroke="${accent}" stroke-width="4" fill="none" opacity=".8">
    <path d="M60 140 L60 60 L140 60"/><path d="M${W - 140} 60 L${W - 60} 60 L${W - 60} 140"/>
    <path d="M60 ${H - 140} L60 ${H - 60} L140 ${H - 60}"/><path d="M${W - 140} ${H - 60} L${W - 60} ${H - 60} L${W - 60} ${H - 140}"/>
  </g>

  <rect width="${W}" height="${H}" fill="url(#scan)"/>
  <rect width="${W}" height="${H}" fill="url(#vignette)"/>
</svg>`;
}

const fontDir = path.join(__dirname, 'fonts');
const fontFiles = ['Orbitron-Black.ttf', 'Orbitron-Bold.ttf', 'ShareTechMono.ttf'].map(f => path.join(fontDir, f));
fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });

Object.entries(libs).forEach(([key, lib], i) => {
  const s = svg(lib, i);
  fs.writeFileSync(path.join(__dirname, 'out', key + '.svg'), s);
  const png = new Resvg(s, {
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Orbitron' },
    fitTo: { mode: 'width', value: W },
  }).render().asPng();
  fs.writeFileSync(path.join(__dirname, 'out', key + '.png'), png);
  console.log(key, png.length);
});
