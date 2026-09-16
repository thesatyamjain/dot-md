const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

let markedMinJs = '';
try {
  markedMinJs = fs.readFileSync(path.resolve(__dirname, '..', 'node_modules', 'marked', 'marked.min.js'), 'utf8');
} catch (e) {}

// Radix / Phosphor style inline SVGs
const ICONS = {
  theme: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="3.25" stroke="currentColor" stroke-width="1.35"/><path d="M8 1.5v1.5M8 13v1.5M1.5 8h1.5M13 8h1.5M3.4 3.4l1.06 1.06M11.54 11.54l1.06 1.06M3.4 12.6l1.06-1.06M11.54 4.46l1.06-1.06" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/></svg>`,
  zen: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  print: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 5.5V2.5h8v3M4 11.5H3a1 1 0 01-1-1v-4a1 1 0 011-1h10a1 1 0 011 1v4a1 1 0 01-1 1h-1M4 9.5h8v4H4v-4z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><circle cx="11.5" cy="8" r="0.75" fill="currentColor"/></svg>`,
  copy: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M10.5 5.5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v6.5a1 1 0 001 1h2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  check: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 8.5l3 3 6.5-7" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  export: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.5v8m0 0l-3-3m3 3l3-3M2.5 11.5v2h11v-2" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  toc: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4h11M2.5 8h7.5M2.5 12h9.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  note: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6.25" stroke="currentColor" stroke-width="1.3"/><path d="M8 7v4.5M8 4.75a.5.5 0 110-1 .5.5 0 010 1z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
  tip: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 13h4m-3 1.5h2M8 1.5a5 5 0 00-3.5 8.5c.7.7 1.5 1.5 1.5 2.5h4c0-1 .8-1.8 1.5-2.5A5 5 0 008 1.5z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  important: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 3v4m0 2.5v.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
  warning: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.2l6 10.8a1 1 0 01-.87 1.5H2.87A1 1 0 012 13L8 2.2zM8 6.5v3.5m0 2v.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  caution: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 1.5L1.5 8l6.5 6.5L14.5 8 8 1.5zM8 5.5v3.5m0 2v.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  wide: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2.5h3.5v3.5M6 13.5H2.5V10M13.5 2.5l-4.5 4.5M2.5 13.5l4.5-4.5" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  file: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 2h6l4 4v8a1 1 0 01-1 1h-9a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M9.5 2v4h4" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>`,
  wrap: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5h11M2.5 8h8a2 2 0 010 4H8m0 0l1.5-1.5M8 12l1.5 1.5M2.5 11.5h3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  logo: `<svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="32" height="32" rx="7.5" fill="#12141a"/><rect x="0.75" y="0.75" width="30.5" height="30.5" rx="6.75" stroke="#f5f3ef" stroke-opacity="0.08" stroke-width="0.75"/><path d="M6.05 16.05 C5.73 16.05 5.46 15.95 5.25 15.75 C5.04 15.56 4.93 15.32 4.93 15.03 C4.93 14.74 5.04 14.5 5.26 14.31 C5.48 14.13 5.75 14.03 6.08 14.03 C6.41 14.03 6.67 14.13 6.88 14.32 C7.09 14.51 7.2 14.75 7.2 15.03 C7.2 15.33 7.09 15.57 6.88 15.76 C6.66 15.95 6.39 16.05 6.05 16.05 Z M18.6 15.89 L16.68 15.89 L16.68 12.33 C16.68 11.42 16.34 10.97 15.68 10.97 C15.36 10.97 15.1 11.11 14.9 11.38 C14.7 11.65 14.6 11.99 14.6 12.4 L14.6 15.89 L12.67 15.89 L12.67 12.29 C12.67 11.41 12.35 10.97 11.69 10.97 C11.36 10.97 11.1 11.1 10.9 11.36 C10.7 11.62 10.6 11.97 10.6 12.42 L10.6 15.89 L8.68 15.89 L8.68 9.64 L10.6 9.64 L10.6 10.62 L10.63 10.62 C10.83 10.29 11.11 10.02 11.47 9.81 C11.83 9.6 12.22 9.49 12.65 9.49 C13.53 9.49 14.14 9.88 14.46 10.66 C14.94 9.88 15.64 9.49 16.56 9.49 C17.92 9.49 18.6 10.33 18.6 12.01 Z M26.58 15.89 L24.65 15.89 L24.65 15.03 L24.63 15.03 C24.19 15.71 23.55 16.05 22.7 16.05 C21.91 16.05 21.29 15.77 20.81 15.22 C20.33 14.67 20.1 13.9 20.1 12.91 C20.1 11.88 20.36 11.05 20.88 10.43 C21.41 9.8 22.1 9.49 22.95 9.49 C23.75 9.49 24.31 9.78 24.63 10.36 L24.65 10.36 L24.65 6.64 L26.58 6.64 Z M24.69 12.85 L24.69 12.39 C24.69 11.98 24.57 11.64 24.34 11.37 C24.1 11.1 23.79 10.97 23.42 10.97 C22.99 10.97 22.65 11.14 22.41 11.47 C22.17 11.81 22.05 12.27 22.05 12.85 C22.05 13.4 22.17 13.83 22.4 14.12 C22.63 14.42 22.96 14.57 23.37 14.57 C23.76 14.57 24.08 14.41 24.32 14.1 C24.57 13.79 24.69 13.37 24.69 12.85 Z" fill="#f5f3ef"/><path d="M16 19.38V26.5M12.25 23.13L16 26.88L19.75 23.13" stroke="#f5f3ef" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  visual: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 8C3 4.8 5.5 3 8 3s5 1.8 6.5 5c-1.5 3.2-4 5-6.5 5S3 11.2 1.5 8z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8" cy="8" r="2.2" stroke="currentColor" stroke-width="1.3"/></svg>`,
  raw: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 5.5L2.5 8 5 10.5M11 5.5l2.5 2.5L11 10.5M9.5 3.5l-3 9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  keyboard: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="3.5" width="12" height="9" rx="2" stroke="currentColor" stroke-width="1.3"/><path d="M4.5 6.5h.01M7 6.5h.01M9.5 6.5h.01M11.5 6.5h.01M5.5 9.5h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  edit: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.5 4.5l2 2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
  undo: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 6.5h7.5a3.5 3.5 0 010 7H6M5.5 3.5L2.5 6.5l3 3" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  redo: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 6.5H6a3.5 3.5 0 000 7h4M10.5 3.5l3 3-3 3" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  bold: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 2.5h4.5a2.5 2.5 0 012.2 3.7A2.8 2.8 0 018.5 13.5H4v-11zm2.8 4.2h1.8a1.2 1.2 0 000-2.4H6.8v2.4zm0 4.8h2a1.4 1.4 0 000-2.8H6.8v2.8z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  italic: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 3h5M5 13h5M9 3l-2 10" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  strike: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 8h12M5.5 5.5c0-1.8 1.5-2.5 3-2.5s3 .8 3 2.2c0 2-4.5 1.5-4.5 4 0 1.5 1.5 2.8 3 2.8s3-1 3-2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  h1: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 3.5v9M7 3.5v9M2.5 8H7M11.5 5.5L13 4v8.5" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  h2: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 3.5v9M7 3.5v9M2.5 8H7M10.5 5.5a1.8 1.8 0 013.2 1.2c0 1.5-3.2 3.2-3.2 5.3h3.5" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  h3: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 3.5v9M7 3.5v9M2.5 8H7M10.5 4.5h3l-1.8 2.8a1.6 1.6 0 11-.7 2.8" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  quote: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 7h2.5v3H3.5V7zm0-2c1.4 0 2.5.9 2.5 2H3.5M9.5 7H12v3H9.5V7zm0-2c1.4 0 2.5.9 2.5 2H9.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  code: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 4.5L2.5 8l3 3.5M10.5 4.5L13.5 8l-3 3.5M9 3l-2 10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  link: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.8 9.2l2.4-2.4a2.2 2.2 0 113.1 3.1l-2.4 2.4a2.2 2.2 0 01-3.1 0M9.2 6.8l-2.4 2.4a2.2 2.2 0 01-3.1-3.1l2.4-2.4a2.2 2.2 0 013.1 0" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  list: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="3" cy="4.5" r="1" fill="currentColor"/><circle cx="3" cy="8" r="1" fill="currentColor"/><circle cx="3" cy="11.5" r="1" fill="currentColor"/><path d="M6 4.5h7.5M6 8h7.5M6 11.5h7.5" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/></svg>`,
  numberList: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 3.5L3 3v4M1.5 9h2.2l-2 3h2.3M6.5 4.5h7M6.5 8h7M6.5 11.5h7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  task: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" stroke-width="1.3"/><path d="M4.5 8l2.5 2.5 4.5-5" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  table: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M2 6.5h12M6.5 3v10M10.5 3v10" stroke="currentColor" stroke-width="1.2"/></svg>`,
  rule: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 8h12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  save: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 2.5h8.5L14 5v8.5H3V2.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M5.5 2.5v3.5h5V2.5M5.5 13.5V9.5h5v4" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>`,
  settings: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="2.2" stroke="currentColor" stroke-width="1.35"/><path d="M7.2 1.5h1.6l.3 1.35a5.1 5.1 0 011 .58l1.32-.53 1.13 1.13-.53 1.32a5.1 5.1 0 01.58 1l1.35.3v1.6l-1.35.3a5.1 5.1 0 01-.58 1l.53 1.32-1.13 1.13-1.32-.53a5.1 5.1 0 01-1 .58l-.3 1.35H7.2l-.3-1.35a5.1 5.1 0 01-1-.58l-1.32.53-1.13-1.13.53-1.32a5.1 5.1 0 01-.58-1l-1.35-.3v-1.6l1.35-.3a5.1 5.1 0 01.58-1l-.53-1.32 1.13-1.13 1.32.53a5.1 5.1 0 011-.58l.3-1.35z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>`,
  close: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  search: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="6.5" cy="6.5" r="4.25" stroke="currentColor" stroke-width="1.35"/><path d="M9.5 9.5l4 4" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/></svg>`,
  chevronUp: `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 10l4.5-4.5 4.5 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  chevronDown: `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 6l4.5 4.5 4.5-4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`
};

// High-contrast SVG favicon as portable data URI (works offline in standalones and live)
const FAVICON_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='7.5' fill='%2312141a'/><rect x='0.75' y='0.75' width='30.5' height='30.5' rx='6.75' stroke='%23f5f3ef' stroke-opacity='0.08' stroke-width='0.75'/><path d='M6.05 16.05 C5.73 16.05 5.46 15.95 5.25 15.75 C5.04 15.56 4.93 15.32 4.93 15.03 C4.93 14.74 5.04 14.5 5.26 14.31 C5.48 14.13 5.75 14.03 6.08 14.03 C6.41 14.03 6.67 14.13 6.88 14.32 C7.09 14.51 7.2 14.75 7.2 15.03 C7.2 15.33 7.09 15.57 6.88 15.76 C6.66 15.95 6.39 16.05 6.05 16.05 Z M18.6 15.89 L16.68 15.89 L16.68 12.33 C16.68 11.42 16.34 10.97 15.68 10.97 C15.36 10.97 15.1 11.11 14.9 11.38 C14.7 11.65 14.6 11.99 14.6 12.4 L14.6 15.89 L12.67 15.89 L12.67 12.29 C12.67 11.41 12.35 10.97 11.69 10.97 C11.36 10.97 11.1 11.1 10.9 11.36 C10.7 11.62 10.6 11.97 10.6 12.42 L10.6 15.89 L8.68 15.89 L8.68 9.64 L10.6 9.64 L10.6 10.62 L10.63 10.62 C10.83 10.29 11.11 10.02 11.47 9.81 C11.83 9.6 12.22 9.49 12.65 9.49 C13.53 9.49 14.14 9.88 14.46 10.66 C14.94 9.88 15.64 9.49 16.56 9.49 C17.92 9.49 18.6 10.33 18.6 12.01 Z M26.58 15.89 L24.65 15.89 L24.65 15.03 L24.63 15.03 C24.19 15.71 23.55 16.05 22.7 16.05 C21.91 16.05 21.29 15.77 20.81 15.22 C20.33 14.67 20.1 13.9 20.1 12.91 C20.1 11.88 20.36 11.05 20.88 10.43 C21.41 9.8 22.1 9.49 22.95 9.49 C23.75 9.49 24.31 9.78 24.63 10.36 L24.65 10.36 L24.65 6.64 L26.58 6.64 Z M24.69 12.85 L24.69 12.39 C24.69 11.98 24.57 11.64 24.34 11.37 C24.1 11.1 23.79 10.97 23.42 10.97 C22.99 10.97 22.65 11.14 22.41 11.47 C22.17 11.81 22.05 12.27 22.05 12.85 C22.05 13.4 22.17 13.83 22.4 14.12 C22.63 14.42 22.96 14.57 23.37 14.57 C23.76 14.57 24.08 14.41 24.32 14.1 C24.57 13.79 24.69 13.37 24.69 12.85 Z' fill='%23f5f3ef'/><path d='M16 19.38V26.5M12.25 23.13L16 26.88L19.75 23.13' fill='none' stroke='%23f5f3ef' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>`;
const FAVICON_DATA_URI = `data:image/svg+xml,${FAVICON_SVG}`;

function stripHtml(text) {
  return (text || '').replace(/<[^>]+>/g, '').replace(/"/g, '&quot;').trim();
}

function slugify(text) {
  return (text || '')
    .toLowerCase()
    .replace(/@@@MATH_[A-Z]+_\d+@@@/g, 'math')
    .replace(/&[a-z0-9#]+;/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Formats and aligns a Markdown ASCII pipe table so all column delimiters line up
 */
function formatMarkdownTableText(tableText) {
  if (!tableText || !tableText.includes('|')) return tableText;
  const rawLines = tableText.trim().split('\n');
  const tableLines = rawLines.filter(l => l.includes('|'));
  if (tableLines.length < 2) return tableText;

  const parsedRows = tableLines.map(line => {
    let content = line.trim();
    if (content.startsWith('|')) content = content.substring(1);
    if (content.endsWith('|')) content = content.substring(0, content.length - 1);
    return content.split('|').map(c => c.trim());
  });

  let numCols = 0;
  parsedRows.forEach(row => {
    if (row.length > numCols) numCols = row.length;
  });
  if (numCols === 0) return tableText;

  const alignments = [];
  const delimRow = parsedRows[1] || [];
  for (let c = 0; c < numCols; c++) {
    const cell = (delimRow[c] || '').trim();
    const startColon = cell.startsWith(':');
    const endColon = cell.endsWith(':');
    if (startColon && endColon) {
      alignments.push('center');
    } else if (endColon) {
      alignments.push('right');
    } else {
      alignments.push('left');
    }
  }

  const colWidths = new Array(numCols).fill(3);
  for (let r = 0; r < parsedRows.length; r++) {
    if (r === 1) continue;
    const row = parsedRows[r];
    for (let c = 0; c < numCols; c++) {
      const val = row[c] || '';
      if (val.length > colWidths[c]) {
        colWidths[c] = val.length;
      }
    }
  }

  const formattedLines = parsedRows.map((row, rIdx) => {
    if (rIdx === 1) {
      const delimCells = [];
      for (let c = 0; c < numCols; c++) {
        const w = colWidths[c];
        const align = alignments[c];
        if (align === 'center') {
          delimCells.push(':' + '-'.repeat(Math.max(1, w - 2)) + ':');
        } else if (align === 'right') {
          delimCells.push('-'.repeat(Math.max(2, w - 1)) + ':');
        } else {
          delimCells.push(':' + '-'.repeat(Math.max(2, w - 1)));
        }
      }
      return '| ' + delimCells.join(' | ') + ' |';
    } else {
      const dataCells = [];
      for (let c = 0; c < numCols; c++) {
        const val = row[c] || '';
        const w = colWidths[c];
        const align = alignments[c];
        if (align === 'right') {
          dataCells.push(val.padStart(w, ' '));
        } else if (align === 'center') {
          const diff = Math.max(0, w - val.length);
          const padLeft = Math.floor(diff / 2);
          const padRight = diff - padLeft;
          dataCells.push(' '.repeat(padLeft) + val + ' '.repeat(padRight));
        } else {
          dataCells.push(val.padEnd(w, ' '));
        }
      }
      return '| ' + dataCells.join(' | ') + ' |';
    }
  });

  return formattedLines.join('\n');
}

/**
 * Extracts YAML frontmatter from document header if present
 */
function extractFrontmatter(markdown) {
  if (!markdown) return { frontmatter: null, body: '', rawYaml: '' };

  const cleanMd = (markdown || '').replace(/^\uFEFF/, '');
  const match = cleanMd.match(/^(?:[ \t]*\r?\n)*---[ \t]*\r?\n([\s\S]*?)\r?\n(?:---|...)[ \t]*(?:\r?\n|$)/);
  if (!match) return { frontmatter: null, body: cleanMd, rawYaml: '' };

  const rawYaml = match[1];
  const body = cleanMd.slice(match[0].length);
  const data = {};

  const lines = rawYaml.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();
    if (!key) continue;

    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    } else if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    }
    data[key] = val;
  }

  return { frontmatter: Object.keys(data).length > 0 ? data : null, body, rawYaml };
}

/**
 * Renders YAML frontmatter data as an elegant metadata card
 */
function renderFrontmatterHtml(data, rawYaml) {
  if (!data) return '';
  const entries = Object.entries(data);
  if (entries.length === 0) return '';

  let rowsHtml = '';
  for (const [key, val] of entries) {
    const safeKey = stripHtml(key);
    if (Array.isArray(val)) {
      const tagsHtml = val.map(t => `<span class="frontmatter-tag">${stripHtml(t)}</span>`).join('');
      rowsHtml += `<div class="frontmatter-row"><span class="frontmatter-key">${safeKey}</span><div class="frontmatter-tags">${tagsHtml}</div></div>`;
    } else {
      rowsHtml += `<div class="frontmatter-row"><span class="frontmatter-key">${safeKey}</span><span class="frontmatter-val">${stripHtml(String(val))}</span></div>`;
    }
  }

  const encodedYaml = encodeURIComponent(rawYaml || '');
  return `<div class="frontmatter-card" contenteditable="false" data-raw-frontmatter="${encodedYaml}">
    <div class="frontmatter-header">
      <span class="frontmatter-badge">Document Metadata</span>
    </div>
    <div class="frontmatter-grid">
      ${rowsHtml}
    </div>
  </div>`;
}

/**
 * Parses markdown while preserving math formulas and extracting TOC
 */
function processMarkdown(markdown) {
  const { frontmatter, body, rawYaml } = extractFrontmatter(markdown);

  // 1. Preserve math blocks & inline math from markdown parser mangling
  const mathStore = [];
  let protectedMd = body.replace(/\$\$([\s\S]+?)\$\$/g, (match, formula) => {
    const idx = mathStore.length;
    mathStore.push({ type: 'block', formula });
    return `@@@MATH_BLOCK_${idx}@@@`;
  });

  protectedMd = protectedMd.replace(/(^|[^\\])\$([^\$]+?)\$/g, (match, prefix, formula) => {
    const idx = mathStore.length;
    mathStore.push({ type: 'inline', formula });
    return `${prefix}@@@MATH_INLINE_${idx}@@@`;
  });

  // 2. Configure marked and extract Headings for Table of Contents
  const toc = [];
  const slugCounts = new Map();

  function getUniqueSlug(baseSlug) {
    const clean = baseSlug || 'section';
    const count = slugCounts.get(clean) || 0;
    slugCounts.set(clean, count + 1);
    return count === 0 ? clean : `${clean}-${count}`;
  }

  const renderer = new marked.Renderer();

  // Custom heading renderer to inject slug IDs and anchor links
  renderer.heading = function ({ tokens, depth }) {
    const text = this.parser.parseInline(tokens);
    const slug = getUniqueSlug(slugify(text));

    // Include headings up to depth 3 in Table of Contents / Outline
    if (depth <= 3) {
      const tocTitle = text.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, '$1').replace(/<!--[\s\S]*?-->/g, '').trim();
      // Safety guard: do not add frontmatter blocks to outline
      if (!tocTitle.includes('title:') || !tocTitle.includes('author:')) {
        toc.push({ level: depth, title: tocTitle, slug });
      }
    }

    return `<h${depth} id="${slug}" class="doc-heading doc-h${depth}">
      <span class="heading-anchor" onclick="copyHeadingLink(this, '${slug}')" title="Copy link to section">#</span>
      ${text}
    </h${depth}>`;
  };

  // Custom code renderer with header bar, language tag, and copy button
  renderer.code = function ({ text, lang }) {
    const language = (lang || 'text').toLowerCase();
    
    // Check for mermaid
    if (language === 'mermaid') {
      return `<div class="mermaid-container"><pre class="mermaid">${text}</pre></div>`;
    }

    const safeText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    return `<div class="code-block" data-lang="${language}">
      <div class="code-header">
        <span class="code-lang">${language}</span>
        <button class="code-copy-btn" onclick="copyCode(this)" aria-label="Copy code">
          ${ICONS.copy}
          <span>Copy</span>
        </button>
      </div>
      <pre><code class="language-${language}">${safeText}</code></pre>
    </div>`;
  };

  // Custom checkbox renderer for interactive GFM task lists
  renderer.checkbox = function ({ checked }) {
    return `<input type="checkbox" class="task-checkbox"${checked ? ' checked' : ''}> `;
  };

  // Custom table renderer for responsive wrapping
  renderer.table = function ({ header, rows }) {
    let headerHtml = '';
    header.forEach(cell => {
      headerHtml += `<th align="${cell.align || 'left'}">${this.parser.parseInline(cell.tokens)}</th>`;
    });
    let rowsHtml = '';
    rows.forEach(row => {
      rowsHtml += '<tr>';
      row.forEach(cell => {
        rowsHtml += `<td align="${cell.align || 'left'}">${this.parser.parseInline(cell.tokens)}</td>`;
      });
      rowsHtml += '</tr>';
    });

    return `<div class="table-container">
      <table>
        <thead><tr>${headerHtml}</tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>`;
  };

  let html = marked.parse(protectedMd, { renderer, gfm: true, breaks: true });

  // 4. Restore math formulas
  html = html.replace(/@@@MATH_BLOCK_(\d+)@@@/g, (m, idx) => {
    const item = mathStore[parseInt(idx, 10)];
    return `<div class="math-block" data-tex="${encodeURIComponent(item.formula)}">$$${item.formula}$$</div>`;
  });

  html = html.replace(/@@@MATH_INLINE_(\d+)@@@/g, (m, idx) => {
    const item = mathStore[parseInt(idx, 10)];
    return `<span class="math-inline" data-tex="${encodeURIComponent(item.formula)}">$${item.formula}$</span>`;
  });

  for (const item of toc) {
    item.title = item.title
      .replace(/@@@MATH_BLOCK_(\d+)@@@/g, (m, idx) => `$${mathStore[parseInt(idx, 10)].formula}$`)
      .replace(/@@@MATH_INLINE_(\d+)@@@/g, (m, idx) => `$${mathStore[parseInt(idx, 10)].formula}$`);
  }

  // 5. Transform GitHub Alerts / Callouts: [!NOTE], [!TIP], [!IMPORTANT], [!WARNING], [!CAUTION]
  const alertRegex = /<blockquote>\s*<p>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\s*<br\s*\/?>)?([\s\S]*?)<\/p>\s*<\/blockquote>/gi;
  html = html.replace(alertRegex, (match, type, content) => {
    const lowerType = type.toLowerCase();
    const icon = ICONS[lowerType] || ICONS.note;
    return `<div class="doc-callout doc-callout-${lowerType}">
      <div class="callout-header">
        <span class="callout-icon">${icon}</span>
        <span class="callout-title">${type}</span>
      </div>
      <div class="callout-content">${content.trim()}</div>
    </div>`;
  });

  // 6. Prepend Frontmatter Metadata Card if present
  if (frontmatter) {
    html = renderFrontmatterHtml(frontmatter, rawYaml) + html;
  }

  // 7. Calculate statistics
  const plainText = body.replace(/<[^>]+>/g, '').replace(/[#*`_~[\]()]/g, '');
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  const readTimeMin = Math.max(1, Math.ceil(words / 200));

  return { html, toc, stats: { words, readTimeMin }, frontmatter };
}

/**
 * Builds the full standalone HTML page
 */
function renderTemplate({ markdown, filename = 'Document', isLive = false, livePort = 3000 }) {
  const { html, toc, stats } = processMarkdown(markdown);

  const rawLines = markdown.split('\n');
  const lineCount = rawLines.length;
  const charCount = markdown.length;
  const byteCount = Buffer.byteLength(markdown, 'utf8');
  const fileSizeStr = byteCount < 1024 ? `${byteCount} B` : `${(byteCount / 1024).toFixed(1)} KB`;

  const safeFilename = (filename || 'Document').replace(/[\\/:*?"<>|]/g, '_');
  const rawDownloadFilename = safeFilename.endsWith('.md') ? safeFilename : `${safeFilename}.md`;

  const gutterDigits = Math.max(2, String(lineCount).length);
  const gutterWidthEm = (gutterDigits * 0.65 + 1.4).toFixed(2);
  const lineSpans = '<span></span>'.repeat(lineCount);
  const rawMarkdownEscaped = markdown.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeRawMarkdown = rawLines.map((line, i) => {
    const escaped = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<span class="raw-line" data-line="${i + 1}">${escaped}</span>`;
  }).join('\n');

  const hasToc = toc.length > 0;
  const tocItems = toc.map(item => `
    <a href="#${item.slug}" class="toc-item toc-level-${item.level}" data-slug="${item.slug}" title="${stripHtml(item.title)}">
      <span class="toc-bullet"></span>
      <span class="toc-text">${item.title}</span>
    </a>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#0e1117">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <link rel="icon" type="image/svg+xml" href="${FAVICON_DATA_URI}">
  <link rel="alternate icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="${FAVICON_DATA_URI}">
  ${isLive ? '<link rel="manifest" href="/manifest.json">' : ''}
  <title>${filename} - dot md</title>
  
  <!-- Premium Typography: Satoshi Display & Geist Mono -->
  <link rel="preconnect" href="https://api.fontshare.com">
  <link href="https://api.fontshare.com/v2/css?f[]=satoshi@700,500,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/geist@1.3.0/dist/fonts/geist-mono/style.css">

  <!-- PrismJS Syntax Highlighting -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css" id="prism-theme">
  
  <!-- KaTeX Math CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">

  <style>
    /* -------------------------------------------------------------
       CSS Design System - Editorial Dark, Alabaster Light & Sepia
       ------------------------------------------------------------- */
    :root {
      --font-display: "Satoshi", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --font-serif: Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif;
      --font-mono: "Geist Mono", ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace;
      --font-body-family: var(--font-display);
      --line-height-body: 1.65;
      --radius-sm: 6px;
      --radius-md: 8px;
      --radius-lg: 12px;
      --transition-fast: 0.15s cubic-bezier(0.16, 1, 0.3, 1);
      --transition-base: 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      --content-measure: 65ch;
      --content-max: 1040px;
      --base-font-size: 16px;
    }

    /* Dark Mode (Default) */
    html[data-theme="dark"] {
      --bg-canvas: #0e1117;
      --bg-surface: #151820;
      --bg-elevated: #1d212b;
      --bg-hover: #252a36;
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-strong: rgba(255, 255, 255, 0.16);
      --text-primary: #e6edf3;
      --text-secondary: #8b949e;
      --text-muted: #5e6673;
      --accent: #df703c;
      --accent-tint: rgba(223, 112, 60, 0.12);
      --code-bg: #12141a;
      --code-border: rgba(255, 255, 255, 0.07);
      --shadow-soft: 0 4px 20px -2px rgba(0, 0, 0, 0.4);
      --badge-bg: rgba(255, 255, 255, 0.06);
    }

    /* Light Mode (Alabaster Paper) */
    html[data-theme="light"] {
      --bg-canvas: #fcfbfa;
      --bg-surface: #ffffff;
      --bg-elevated: #f4f3f0;
      --bg-hover: #eae8e3;
      --border-subtle: rgba(0, 0, 0, 0.07);
      --border-strong: rgba(0, 0, 0, 0.15);
      --text-primary: #191b1f;
      --text-secondary: #5f6672;
      --text-muted: #8c939f;
      --accent: #c85826;
      --accent-tint: rgba(200, 88, 38, 0.09);
      --code-bg: #f3f2ee;
      --code-border: rgba(0, 0, 0, 0.07);
      --shadow-soft: 0 4px 20px -2px rgba(0, 0, 0, 0.06);
      --badge-bg: rgba(0, 0, 0, 0.05);
    }

    /* Warm Sepia Mode */
    html[data-theme="sepia"] {
      --bg-canvas: #f4efe6;
      --bg-surface: #ece5d8;
      --bg-elevated: #e3dacf;
      --bg-hover: #dacfc2;
      --border-subtle: rgba(60, 50, 40, 0.1);
      --border-strong: rgba(60, 50, 40, 0.2);
      --text-primary: #2b2620;
      --text-secondary: #6e6459;
      --text-muted: #94887c;
      --accent: #a85223;
      --accent-tint: rgba(168, 82, 35, 0.1);
      --code-bg: #e6dfd1;
      --code-border: rgba(60, 50, 40, 0.12);
      --shadow-soft: 0 4px 20px -2px rgba(50, 40, 30, 0.08);
      --badge-bg: rgba(60, 50, 40, 0.06);
    }

    html {
      scroll-behavior: smooth;
      scroll-padding-top: 76px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-canvas);
      color: var(--text-primary);
      font-family: var(--font-body-family, var(--font-display));
      font-size: var(--base-font-size);
      line-height: var(--line-height-body, 1.65);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      transition: background-color var(--transition-base), color var(--transition-base);
    }

    /* Reading Progress Bar */
    #progress-bar {
      position: fixed;
      top: 0;
      left: 0;
      height: 2.5px;
      background: var(--accent);
      width: 0%;
      z-index: 1000;
      transition: width 0.1s ease-out;
    }

    /* Top Command Header */
    .top-header {
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      background: color-mix(in srgb, var(--bg-canvas) 85%, transparent);
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1.5rem;
      height: 56px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      min-width: 0;
      flex: 0 1 auto;
      overflow: hidden;
    }

    .header-brand {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: var(--text-primary);
      flex-shrink: 0;
      transition: opacity 0.15s ease;
      cursor: pointer;
    }

    .header-brand:hover {
      opacity: 0.85;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    .brand-logo svg {
      width: 100%;
      height: 100%;
      display: block;
      border-radius: var(--radius-sm);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    .brand-name {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 0.95rem;
      letter-spacing: -0.025em;
      color: var(--text-primary);
      white-space: nowrap;
    }

    .header-separator {
      color: var(--border-strong);
      font-size: 0.85rem;
      font-weight: 300;
      user-select: none;
      opacity: 0.6;
      flex-shrink: 0;
    }

    .header-file-info {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      min-width: 0;
      overflow: hidden;
    }

    .doc-filename {
      font-family: var(--font-display);
      font-weight: 600;
      font-size: 0.92rem;
      letter-spacing: -0.015em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--text-primary);
      max-width: clamp(140px, 25vw, 360px);
    }

    .live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #2ea043;
      box-shadow: 0 0 8px #2ea043;
      animation: pulse-dot 2s infinite ease-in-out;
      flex-shrink: 0;
    }

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .doc-badge {
      font-family: var(--font-mono);
      font-size: 0.72rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
      background: var(--badge-bg);
      color: var(--text-secondary);
      border: 1px solid var(--border-subtle);
      flex-shrink: 0;
    }

    .header-nav-sep {
      width: 1px;
      height: 18px;
      background: var(--border-subtle);
      margin: 0 0.15rem;
      flex-shrink: 0;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      flex-shrink: 0;
    }

    .btn-group {
      display: flex;
      align-items: center;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 2px;
    }

    /* View Switcher Segmented Control (Visual / Raw) */
    .view-switcher {
      display: inline-flex;
      align-items: center;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 2px;
      gap: 2px;
    }

    .view-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-family: var(--font-display);
      font-size: 0.78rem;
      font-weight: 500;
      padding: 0.28rem 0.65rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all var(--transition-fast);
      user-select: none;
      height: 28px;
      box-sizing: border-box;
      flex-shrink: 0;
    }

    .view-btn:hover {
      color: var(--text-primary);
    }

    .view-btn:active {
      transform: scale(0.96);
    }

    .view-btn.active {
      background: var(--bg-elevated);
      color: var(--text-primary);
      font-weight: 600;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
    }

    .view-btn svg {
      width: 14px;
      height: 14px;
      display: block;
      flex-shrink: 0;
      pointer-events: none;
    }

    /* Edit Mode Button & Status Pill */
    .header-edit-group {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
    }

    .edit-mode-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.38rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-family: var(--font-display);
      font-size: 0.78rem;
      font-weight: 600;
      padding: 0 0.65rem;
      height: 30px;
      cursor: pointer;
      transition: all var(--transition-fast);
      user-select: none;
      flex-shrink: 0;
      box-sizing: border-box;
    }

    .edit-mode-btn:hover {
      color: var(--text-primary);
      background: var(--bg-elevated);
      border-color: var(--border-strong);
    }

    .edit-mode-btn:active {
      transform: scale(0.96);
    }

    .edit-mode-btn.active {
      background: var(--accent-tint);
      border-color: var(--accent);
      color: var(--accent);
    }

    .edit-mode-btn svg {
      width: 14px;
      height: 14px;
      display: block;
      flex-shrink: 0;
      pointer-events: none;
    }

    .save-status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.22rem 0.6rem;
      border-radius: 9999px;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      font-weight: 500;
      background: var(--badge-bg);
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      cursor: pointer;
      user-select: none;
      outline: none;
      transition: all var(--transition-fast);
    }

    .save-status-pill:hover {
      background: var(--bg-elevated);
      border-color: var(--border-strong);
      color: var(--text-primary);
    }

    .save-status-pill:disabled {
      cursor: not-allowed;
      opacity: 0.65;
    }

    .save-status-pill .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #3fb950;
      transition: background 0.2s ease;
    }

    .save-status-pill.unsaved {
      color: var(--accent);
      background: var(--accent-tint);
      border-color: var(--accent);
    }

    .save-status-pill.unsaved .status-dot {
      background: var(--accent);
      box-shadow: 0 0 6px var(--accent);
      animation: pulse-dot 1.5s infinite;
    }

    .save-status-pill.unsaved:hover {
      background: var(--accent);
      color: #ffffff;
    }

    .save-status-pill.unsaved:hover .status-dot {
      background: #ffffff;
      box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
    }

    .save-status-pill.saving .status-dot {
      background: #d29922;
      box-shadow: 0 0 6px #d29922;
    }

    .save-status-pill.saving {
      color: #d29922;
      background: rgba(210, 153, 34, 0.12);
      border-color: rgba(210, 153, 34, 0.4);
    }

    .save-status-pill.error .status-dot {
      background: #f85149;
      box-shadow: 0 0 6px #f85149;
    }

    .save-status-pill.error {
      color: #f85149;
      background: rgba(248, 81, 73, 0.12);
      border-color: rgba(248, 81, 73, 0.4);
    }

    /* Editor Formatting Tools Toolbar */
    .editor-toolbar {
      position: sticky;
      top: 56px;
      z-index: 95;
      display: none;
      align-items: center;
      gap: 0.25rem;
      padding: 0.35rem 1.5rem;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      overflow-x: auto;
      scrollbar-width: none;
    }

    .editor-toolbar::-webkit-scrollbar {
      display: none;
    }

    body.edit-mode .editor-toolbar {
      display: flex;
    }

    .toolbar-group {
      display: inline-flex;
      align-items: center;
      gap: 0.15rem;
    }

    .toolbar-group.toolbar-right {
      margin-left: auto;
    }

    .toolbar-sep {
      width: 1px;
      height: 18px;
      background: var(--border-subtle);
      margin: 0 0.3rem;
      flex-shrink: 0;
    }

    .tool-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      min-width: 28px;
      padding: 0;
      border-radius: var(--radius-sm);
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-secondary);
      cursor: pointer;
      font-family: var(--font-display);
      transition: all var(--transition-fast);
      user-select: none;
      flex-shrink: 0;
      box-sizing: border-box;
    }

    .tool-btn:hover:not(:disabled) {
      color: var(--text-primary);
      background: var(--bg-elevated);
      border-color: var(--border-subtle);
    }

    .tool-btn:active:not(:disabled) {
      transform: scale(0.94);
    }

    .tool-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .tool-btn svg {
      width: 15px;
      height: 15px;
      display: block;
      flex-shrink: 0;
      pointer-events: none;
    }

    /* In-place editing visual cues */
    body.edit-mode #doc-content[contenteditable="true"] {
      outline: none;
      caret-color: var(--accent);
    }

    body.edit-mode #doc-content[contenteditable="true"]:focus {
      outline: none;
    }

    .raw-editor-textarea {
      display: block;
      width: 100%;
      min-height: 70vh;
      margin: 0;
      padding: 1.25rem 1.25rem;
      flex-grow: 1;
      border: none;
      outline: none;
      resize: vertical;
      background: transparent;
      color: var(--text-primary);
      font-family: var(--font-mono);
      font-size: 0.86rem;
      line-height: 1.65;
      tab-size: 2;
      white-space: pre;
      word-break: normal;
    }

    .raw-view-container.wrap-mode .raw-editor-textarea {
      white-space: pre-wrap;
      word-break: break-word;
    }

    .icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      min-width: 32px;
      min-height: 32px;
      padding: 0;
      background: transparent;
      border: 1px solid transparent;
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      cursor: pointer;
      font-family: var(--font-display);
      transition: all var(--transition-fast);
      flex-shrink: 0;
      box-sizing: border-box;
      user-select: none;
    }

    .icon-btn:hover {
      background: var(--bg-elevated);
      color: var(--text-primary);
      border-color: var(--border-subtle);
    }

    .icon-btn:active {
      transform: scale(0.94);
    }

    .icon-btn.active {
      background: var(--accent-tint);
      color: var(--accent);
      border-color: rgba(59, 130, 246, 0.25);
    }

    .icon-btn svg {
      width: 16px;
      height: 16px;
      display: block;
      flex-shrink: 0;
      pointer-events: none;
    }

    .text-btn {
      padding: 0.4rem 0.7rem;
      gap: 0.4rem;
      font-weight: 500;
    }

    /* Main Content Layout */
    .app-layout {
      display: flex;
      justify-content: center;
      position: relative;
      max-width: 1560px;
      margin: 0 auto;
      padding: 2.5rem 2rem 0;
      gap: 3rem;
      min-height: calc(100vh - 56px);
      transition: max-width var(--transition-base), padding var(--transition-base), gap var(--transition-base);
    }

    /* Left Sidebar: Table of Contents */
    .toc-sidebar {
      width: 230px;
      flex-shrink: 0;
      position: sticky;
      top: 76px;
      height: fit-content;
      max-height: calc(100vh - 96px);
      overflow-y: auto;
      overscroll-behavior: contain;
      padding-right: 0.75rem;
      border-right: 1px solid var(--border-subtle);
      transition: width var(--transition-base), opacity var(--transition-base), padding var(--transition-base), transform var(--transition-base);
    }

    /* Hide default scrollbar in TOC sidebar */
    .toc-sidebar::-webkit-scrollbar { width: 3px; }
    .toc-sidebar::-webkit-scrollbar-track { background: transparent; }
    .toc-sidebar::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 3px; }

    .toc-title {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      margin-bottom: 0.6rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.4rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border-subtle);
      font-family: var(--font-mono);
      font-weight: 600;
    }

    .toc-title-left {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
    }

    .toc-badge {
      font-size: 0.65rem;
      padding: 0.1rem 0.45rem;
      border-radius: var(--radius-sm);
      background: var(--badge-bg);
      color: var(--text-secondary);
      border: 1px solid var(--border-subtle);
      font-variant-numeric: tabular-nums;
    }

    .toc-title-right {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }

    .toc-drawer-close {
      display: none;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      padding: 0;
      border-radius: var(--radius-sm);
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-muted);
      cursor: pointer;
      transition: all var(--transition-fast);
      flex-shrink: 0;
      box-sizing: border-box;
    }

    .toc-drawer-close:hover {
      color: var(--text-primary);
      background: var(--bg-hover);
      border-color: var(--border-subtle);
    }

    .toc-drawer-close svg {
      width: 14px;
      height: 14px;
      display: block;
      flex-shrink: 0;
      pointer-events: none;
    }

    .toc-nav {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .toc-item {
      display: flex;
      align-items: baseline;
      gap: 0.45rem;
      text-decoration: none;
      font-size: 0.82rem;
      color: var(--text-muted);
      padding: 0.35rem 0.6rem;
      border-radius: var(--radius-sm);
      border-left: 2px solid transparent;
      transition: all var(--transition-fast);
      line-height: 1.4;
      min-width: 0;
    }

    .toc-item:hover {
      color: var(--text-primary);
      background: var(--bg-hover);
    }

    .toc-item.active {
      color: var(--accent);
      font-weight: 500;
      border-left-color: var(--accent);
      background: var(--accent-tint);
    }

    .toc-text {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      word-break: break-word;
      min-width: 0;
    }

    .toc-item code {
      font-family: var(--font-mono);
      font-size: 0.82em;
      padding: 0.1em 0.35em;
      border-radius: var(--radius-sm);
      background: var(--badge-bg);
      border: 1px solid var(--border-subtle);
      color: inherit;
    }

    .toc-item.active code {
      color: var(--accent);
      border-color: var(--accent-tint);
    }

    .toc-level-1 { font-weight: 600; }
    .toc-level-2 { padding-left: 0.9rem; }
    .toc-level-3 { padding-left: 1.6rem; font-size: 0.76rem; }

    .toc-bullet {
      display: none;
    }

    .toc-item.active .toc-bullet {
      display: none;
    }

    /* Desktop Outline Collapsed State */
    body.outline-collapsed .toc-sidebar {
      width: 0 !important;
      min-width: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
      border-right: none !important;
      opacity: 0 !important;
      pointer-events: none !important;
      overflow: hidden !important;
      visibility: hidden;
    }

    body.outline-collapsed .app-layout {
      gap: 0 !important;
    }

    /* No TOC in Document */
    body.no-toc .toc-sidebar {
      display: none !important;
    }

    body.no-toc .app-layout {
      gap: 0 !important;
      justify-content: center !important;
    }

    body.no-toc #toc-toggle-btn {
      display: none !important;
    }

    /* Content Canvas */
    .markdown-canvas {
      flex: 1;
      max-width: var(--content-max);
      min-width: 0;
      padding-bottom: 7rem;
    }

    .article-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--border-subtle);
      font-family: var(--font-mono);
      font-size: 0.78rem;
      color: var(--text-muted);
    }

    .meta-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    /* Typography & Hierarchy */
    .markdown-body {
      color: var(--text-primary);
    }

    .markdown-body h1,
    .markdown-body h2,
    .markdown-body h3,
    .markdown-body h4 {
      font-family: var(--font-display);
      font-weight: 700;
      line-height: 1.15;
      letter-spacing: -0.028em;
      position: relative;
    }

    .markdown-body h1 {
      font-size: clamp(1.85rem, 3.5vw + 0.8rem, 2.5rem);
      margin-top: 1rem;
      margin-bottom: 1.25rem;
      letter-spacing: -0.035em;
    }

    .markdown-body h2 {
      font-size: clamp(1.35rem, 2vw + 0.6rem, 1.75rem);
      margin-top: 2.75rem;
      margin-bottom: 1rem;
      padding-bottom: 0.4rem;
      border-bottom: 1px solid var(--border-subtle);
    }

    .markdown-body h3 {
      font-size: clamp(1.1rem, 1.5vw + 0.4rem, 1.3rem);
      margin-top: 2rem;
      margin-bottom: 0.75rem;
    }

    .markdown-body h4 {
      font-size: clamp(0.95rem, 1vw + 0.35rem, 1.05rem);
      margin-top: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .doc-heading {
      scroll-margin-top: 76px;
    }

    .heading-anchor {
      position: absolute;
      left: -1.4rem;
      color: var(--text-muted);
      opacity: 0;
      cursor: pointer;
      font-weight: 400;
      transition: opacity var(--transition-fast), color var(--transition-fast);
      user-select: none;
      padding: 0 0.2rem;
      border-radius: var(--radius-sm);
    }

    .doc-heading:hover .heading-anchor {
      opacity: 0.7;
    }

    .heading-anchor:hover {
      opacity: 1 !important;
      color: var(--accent);
      background: var(--accent-tint);
    }

    .heading-anchor.copied {
      color: #3fb950 !important;
      opacity: 1 !important;
    }

    .markdown-body p {
      max-width: 100%;
      margin-bottom: 1.4rem;
      color: var(--text-primary);
      line-height: 1.7;
    }

    .markdown-body strong {
      font-weight: 600;
      color: var(--text-primary);
    }

    .markdown-body em {
      font-style: italic;
    }

    .markdown-body a {
      color: var(--accent);
      text-decoration: underline;
      text-underline-offset: 3px;
      text-decoration-color: var(--border-strong);
      transition: all var(--transition-fast);
    }

    .markdown-body a:hover {
      text-decoration-color: var(--accent);
    }

    .markdown-body hr {
      border: none;
      height: 1px;
      background: var(--border-subtle);
      margin: 2.75rem 0;
    }

    .markdown-body ul,
    .markdown-body ol {
      max-width: 100%;
      margin-bottom: 1.4rem;
      padding-left: 1.6rem;
      line-height: 1.7;
    }

    .markdown-body li {
      margin-bottom: 0.45rem;
    }

    .markdown-body li > p {
      margin-bottom: 0.45rem;
    }

    /* Task Lists */
    .markdown-body ul.contains-task-list,
    .markdown-body li.task-list-item {
      list-style-type: none;
      padding-left: 0;
    }

    .markdown-body input[type="checkbox"],
    .task-checkbox {
      accent-color: var(--accent);
      margin-right: 0.5rem;
      cursor: pointer;
      pointer-events: auto;
      width: 1.05rem;
      height: 1.05rem;
      vertical-align: -0.15rem;
    }

    li:has(.task-checkbox:checked),
    li.task-list-item:has(input:checked) {
      color: var(--text-muted);
      text-decoration: line-through;
      text-decoration-color: var(--border-strong);
    }
    li:has(.task-checkbox:checked) a,
    li.task-list-item:has(input:checked) a {
      color: var(--text-muted);
    }

    /* Frontmatter Metadata Card */
    .frontmatter-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1.1rem 1.4rem;
      margin-bottom: 2.2rem;
      box-shadow: var(--shadow-soft);
    }
    .frontmatter-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border-subtle);
    }
    .frontmatter-badge {
      font-family: var(--font-mono);
      font-size: 0.68rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--accent);
      background: rgba(223, 112, 60, 0.1);
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
    }
    .frontmatter-grid {
      display: grid;
      gap: 0.45rem;
    }
    .frontmatter-row {
      display: flex;
      align-items: baseline;
      gap: 1.2rem;
      font-size: 0.85rem;
    }
    .frontmatter-key {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--text-muted);
      min-width: 90px;
      flex-shrink: 0;
      text-transform: capitalize;
    }
    .frontmatter-val {
      color: var(--text-primary);
      word-break: break-word;
    }
    .frontmatter-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }
    .frontmatter-tag {
      font-family: var(--font-mono);
      font-size: 0.72rem;
      color: var(--text-secondary);
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      padding: 0.1rem 0.45rem;
      border-radius: var(--radius-sm);
    }

    /* Blockquotes */
    .markdown-body blockquote {
      border-left: 3px solid var(--border-strong);
      padding-left: 1.25rem;
      margin: 1.5rem 0;
      color: var(--text-secondary);
      font-style: italic;
    }

    .markdown-body blockquote > p {
      color: var(--text-secondary);
    }

    /* GFM Alerts / Callouts */
    .doc-callout {
      border-radius: var(--radius-md);
      margin: 1.6rem 0;
      padding: 1rem 1.25rem;
      border: 1px solid transparent;
      border-left-width: 4px;
      background: var(--bg-surface);
      box-shadow: var(--shadow-soft);
    }

    .callout-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.82rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.45rem;
    }

    .callout-icon {
      display: inline-flex;
      align-items: center;
    }

    .callout-content {
      font-size: 0.95rem;
      line-height: 1.55;
    }

    .callout-content p:last-child {
      margin-bottom: 0;
    }

    /* Callout Variants */
    .doc-callout-note {
      border-color: rgba(56, 139, 253, 0.25);
      border-left-color: #388bfd;
      background: color-mix(in srgb, #388bfd 6%, var(--bg-surface));
    }
    .doc-callout-note .callout-header { color: #58a6ff; }

    .doc-callout-tip {
      border-color: rgba(46, 160, 67, 0.25);
      border-left-color: #2ea043;
      background: color-mix(in srgb, #2ea043 6%, var(--bg-surface));
    }
    .doc-callout-tip .callout-header { color: #3fb950; }

    .doc-callout-important {
      border-color: rgba(163, 113, 247, 0.25);
      border-left-color: #a371f7;
      background: color-mix(in srgb, #a371f7 6%, var(--bg-surface));
    }
    .doc-callout-important .callout-header { color: #bc8cff; }

    .doc-callout-warning {
      border-color: rgba(210, 153, 34, 0.25);
      border-left-color: #d29922;
      background: color-mix(in srgb, #d29922 6%, var(--bg-surface));
    }
    .doc-callout-warning .callout-header { color: #e3b341; }

    .doc-callout-caution {
      border-color: rgba(248, 81, 73, 0.25);
      border-left-color: #f85149;
      background: color-mix(in srgb, #f85149 6%, var(--bg-surface));
    }
    .doc-callout-caution .callout-header { color: #ff7b72; }

    /* Code Blocks */
    .code-block {
      background: var(--code-bg);
      border: 1px solid var(--code-border);
      border-radius: var(--radius-md);
      margin: 1.6rem 0;
      overflow: hidden;
      box-shadow: var(--shadow-soft);
    }

    .code-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.45rem 0.9rem;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
    }

    .code-lang {
      font-family: var(--font-mono);
      font-size: 0.72rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
    }

    .code-copy-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-secondary);
      font-size: 0.72rem;
      font-family: var(--font-mono);
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
    }

    .code-copy-btn:hover {
      background: var(--bg-elevated);
      color: var(--text-primary);
      border-color: var(--border-subtle);
    }

    .code-copy-btn.copied {
      color: #3fb950;
      background: rgba(63, 185, 80, 0.1);
    }

    .code-copy-btn svg {
      width: 14px;
      height: 14px;
      display: block;
      flex-shrink: 0;
      pointer-events: none;
    }

    pre {
      padding: 1rem 1.25rem;
      overflow-x: auto;
      font-family: var(--font-mono);
      font-size: 0.88rem;
      line-height: 1.5;
    }

    code:not(pre code) {
      font-family: var(--font-mono);
      font-size: 0.85em;
      padding: 0.2em 0.4em;
      border-radius: var(--radius-sm);
      background: var(--badge-bg);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
    }

    /* Tables */
    .table-container {
      overflow-x: auto;
      margin: 1.75rem 0;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      box-shadow: var(--shadow-soft);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.92rem;
      text-align: left;
    }

    th {
      font-weight: 600;
      background: var(--bg-elevated);
      color: var(--text-primary);
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border-subtle);
      font-family: var(--font-display);
    }

    td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border-subtle);
      color: var(--text-secondary);
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr:hover td {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    /* Math Formulas */
    .math-block {
      overflow-x: auto;
      padding: 1.2rem 1rem;
      margin: 1.5rem 0;
      text-align: center;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
    }

    /* Mermaid Diagrams */
    .mermaid-container {
      position: relative;
      margin: 2rem 0;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-soft);
      overflow: hidden;
      /* min-height keeps tiny diagrams from collapsing */
      min-height: 120px;
      user-select: none;
    }

    /* The invisible full-width hit area inside the container */
    .diagram-viewport {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      min-height: 120px;
      padding: 1.5rem;
      cursor: grab;
      touch-action: none;
    }

    .diagram-viewport:active,
    .diagram-viewport.dragging {
      cursor: grabbing;
    }

    /* Transform wrapper for the svg */
    .diagram-canvas {
      display: inline-flex;
      transform-origin: center center;
      will-change: transform;
      transition: none;
    }

    .diagram-canvas svg {
      display: block;
      max-width: 100%;
      height: auto;
    }

    /* Reset + zoom toolbar */
    .diagram-toolbar {
      position: absolute;
      top: 0.55rem;
      right: 0.55rem;
      display: flex;
      gap: 0.3rem;
      z-index: 10;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .mermaid-container:hover .diagram-toolbar,
    .mermaid-container:focus-within .diagram-toolbar {
      opacity: 1;
    }

    .diagram-tool-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.75rem;
      height: 1.75rem;
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      font-family: var(--font-mono);
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.12s ease, color 0.12s ease;
      line-height: 1;
    }

    .diagram-tool-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    /* Zoom level badge */
    .diagram-zoom-badge {
      display: inline-flex;
      align-items: center;
      height: 1.75rem;
      padding: 0 0.4rem;
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      color: var(--text-muted);
      font-family: var(--font-mono);
      font-size: 0.7rem;
      min-width: 2.8rem;
      justify-content: center;
      pointer-events: none;
    }

    /* Outline Collapse & Focus Mode */
    body.zen-mode .toc-sidebar {
      width: 0 !important;
      min-width: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
      border-right: none !important;
      opacity: 0 !important;
      pointer-events: none !important;
      overflow: hidden !important;
      transform: translateX(-24px) !important;
      visibility: hidden;
    }
    body.zen-mode .app-layout {
      gap: 0 !important;
      justify-content: center !important;
    }
    body.zen-mode .markdown-canvas {
      max-width: 820px;
      width: 100%;
      margin: 0 auto;
    }

    /* Wide View Mode */
    body.wide-mode {
      --content-max: 1440px;
    }
    body.wide-mode .app-layout {
      max-width: 1800px;
      padding-left: 2.5rem;
      padding-right: 2.5rem;
    }
    body.wide-mode .markdown-canvas {
      max-width: var(--content-max);
    }
    body.wide-mode.zen-mode .markdown-canvas {
      max-width: 1140px;
    }

    /* Raw Markdown View Mode */
    .raw-view-container {
      display: none;
      background: var(--code-bg);
      border: 1px solid var(--code-border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-soft);
      overflow: hidden;
      margin: 0.5rem 0 3rem;
    }

    .raw-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
      padding: 0.55rem 0.85rem;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--text-secondary);
      user-select: none;
    }

    .raw-toolbar-left {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex-wrap: wrap;
    }

    .raw-file-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.2rem 0.55rem;
      background: var(--bg-primary);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      font-weight: 600;
      color: var(--text-primary);
      letter-spacing: -0.01em;
    }

    .raw-file-badge svg {
      color: var(--accent);
      opacity: 0.9;
    }

    .raw-stats {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--text-muted);
      font-size: 0.72rem;
    }

    .raw-stats strong {
      color: var(--text-secondary);
      font-weight: 500;
    }

    .raw-stats .stat-sep {
      opacity: 0.4;
    }

    .raw-toolbar-right {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
    }

    .raw-action-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: var(--bg-primary);
      color: var(--text-secondary);
      border: 1px solid var(--border-subtle);
      padding: 0.28rem 0.6rem;
      border-radius: var(--radius-sm);
      font-family: var(--font-mono);
      font-size: 0.72rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
    }

    .raw-action-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
      border-color: var(--border-strong);
    }

    .raw-action-btn.active {
      background: var(--accent-tint);
      color: var(--accent);
      border-color: var(--accent);
    }

    .raw-action-btn svg {
      width: 14px;
      height: 14px;
      display: block;
      flex-shrink: 0;
      pointer-events: none;
    }

    .raw-code-wrapper {
      position: relative;
      display: flex;
      background: var(--code-bg);
      overflow-x: auto;
      font-family: var(--font-mono);
      font-size: 0.86rem;
      line-height: 1.65;
      tab-size: 2;
    }

    .raw-line-numbers {
      position: sticky;
      left: 0;
      z-index: 2;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      min-width: var(--gutter-width, 3.2em);
      padding: 1.25rem 0.75rem 1.25rem 0.6rem;
      background: var(--bg-surface);
      border-right: 1px solid var(--border-subtle);
      color: var(--text-muted);
      text-align: right;
      user-select: none;
      pointer-events: none;
      font-variant-numeric: tabular-nums;
      counter-reset: linenumber;
    }

    .raw-line-numbers span {
      counter-increment: linenumber;
      display: block;
      height: 1.65em;
    }

    .raw-line-numbers span::before {
      content: counter(linenumber);
      display: block;
      opacity: 0.6;
      font-size: 0.82rem;
    }

    .raw-editor-pre {
      margin: 0;
      padding: 1.25rem 1.25rem;
      flex-grow: 1;
      min-width: 0;
      overflow-x: visible;
      font-family: var(--font-mono);
      font-size: 0.86rem;
      line-height: 1.65;
      background: transparent !important;
      color: var(--text-primary);
      tab-size: 2;
      white-space: pre;
      word-break: normal;
    }

    .raw-editor-pre code {
      display: block;
      font-family: inherit;
      background: transparent !important;
      border: none !important;
      padding: 0 !important;
      white-space: inherit;
      word-break: inherit;
      min-width: 0;
    }

    .raw-line {
      display: block;
      min-height: 1.65em;
    }

    .raw-view-container.wrap-mode .raw-code-wrapper {
      overflow-x: hidden !important;
    }

    .raw-view-container.wrap-mode .raw-editor-pre,
    .raw-view-container.wrap-mode .raw-editor-pre code,
    .raw-view-container.wrap-mode #raw-markdown-code,
    .raw-view-container.wrap-mode .raw-line {
      white-space: pre-wrap !important;
      word-break: break-word !important;
      overflow-wrap: anywhere !important;
    }

    body.raw-mode .toc-sidebar {
      display: none !important;
    }

    body.raw-mode .app-layout {
      gap: 0 !important;
      justify-content: center !important;
    }

    body.raw-mode .markdown-canvas {
      max-width: var(--content-max);
      margin: 0 auto;
    }

    @media (max-width: 640px) {
      .raw-stats .stat-secondary {
        display: none;
      }
      .raw-toolbar {
        padding: 0.5rem;
      }
      .raw-toolbar-left, .raw-toolbar-right {
        width: 100%;
        justify-content: space-between;
      }
    }

    /* Keyboard Shortcuts Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      z-index: 999;
      display: none;
      align-items: center;
      justify-content: center;
    }

    .modal-overlay.open {
      display: flex;
    }

    .modal-box {
      background: var(--bg-surface);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-lg);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      width: 90%;
      max-width: 440px;
      padding: 1.5rem;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.2rem;
    }

    .modal-header h3 {
      font-size: 1.1rem;
      font-weight: 600;
    }

    .shortcut-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border-subtle);
      font-size: 0.88rem;
    }

    .shortcut-key {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
    }

    /* Settings Modal & Controls */
    .settings-modal-box {
      background: var(--bg-surface);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-lg);
      box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.5);
      width: 92%;
      max-width: 520px;
      max-height: 88vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .settings-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.1rem 1.4rem;
      border-bottom: 1px solid var(--border-subtle);
      background: var(--bg-surface);
    }

    .settings-modal-header h3 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .settings-modal-header h3 svg {
      color: var(--accent);
    }

    .settings-modal-body {
      padding: 1.25rem 1.4rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .settings-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding-bottom: 0.85rem;
      border-bottom: 1px solid var(--border-subtle);
    }

    .settings-group:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .settings-group-title {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-muted);
      margin-bottom: 0.15rem;
    }

    .settings-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.35rem 0;
      gap: 1rem;
    }

    .settings-label-wrap {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      min-width: 0;
    }

    .settings-label {
      font-size: 0.88rem;
      font-weight: 500;
      color: var(--text-primary);
    }

    .settings-desc {
      font-size: 0.76rem;
      color: var(--text-muted);
      line-height: 1.35;
    }

    /* Segmented Control */
    .segmented-control {
      display: inline-flex;
      background: var(--bg-canvas);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 2px;
      gap: 2px;
      flex-shrink: 0;
    }

    .segment-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      padding: 0.35rem 0.65rem;
      font-size: 0.78rem;
      font-weight: 500;
      font-family: inherit;
      border-radius: calc(var(--radius-sm) - 2px);
      cursor: pointer;
      transition: all var(--transition-fast);
      white-space: nowrap;
    }

    .segment-btn:hover {
      color: var(--text-primary);
      background: var(--bg-hover);
    }

    .segment-btn.active {
      background: var(--bg-surface);
      color: var(--accent);
      font-weight: 600;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
      border: 1px solid var(--border-subtle);
    }

    /* Toggle Switch */
    .toggle-control {
      position: relative;
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      flex-shrink: 0;
    }

    .toggle-control input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-track {
      width: 38px;
      height: 22px;
      background: var(--bg-elevated);
      border: 1px solid var(--border-strong);
      border-radius: 12px;
      transition: all var(--transition-fast);
      position: relative;
    }

    .toggle-thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 16px;
      height: 16px;
      background: var(--text-secondary);
      border-radius: 50%;
      transition: all var(--transition-fast);
    }

    .toggle-control input:checked + .toggle-track {
      background: var(--accent);
      border-color: var(--accent);
    }

    .toggle-control input:checked + .toggle-track .toggle-thumb {
      transform: translateX(16px);
      background: #ffffff;
    }

    .settings-modal-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.85rem 1.4rem;
      border-top: 1px solid var(--border-subtle);
      background: var(--bg-elevated);
    }

    .settings-reset-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 0.78rem;
      cursor: pointer;
      padding: 0.35rem 0.5rem;
      border-radius: var(--radius-sm);
      transition: color var(--transition-fast);
    }

    .settings-reset-btn:hover {
      color: var(--accent);
      text-decoration: underline;
    }

    .settings-done-btn {
      background: var(--accent);
      color: #ffffff;
      border: none;
      padding: 0.4rem 1.1rem;
      border-radius: var(--radius-sm);
      font-size: 0.82rem;
      font-weight: 500;
      cursor: pointer;
      transition: opacity var(--transition-fast);
    }

    .settings-done-btn:hover {
      opacity: 0.9;
    }

    /* Code block soft wrap preference */
    body.code-wrap-active .code-block pre,
    body.code-wrap-active .code-block pre code {
      white-space: pre-wrap !important;
      word-break: break-word !important;
    }

    /* Mobile Drawer & Responsive Navigation */
    .mobile-toc-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      backdrop-filter: blur(4px);
      z-index: 190;
      display: none;
      opacity: 0;
      transition: opacity var(--transition-base);
    }
    .mobile-toc-overlay.open {
      display: block;
      opacity: 1;
    }

    /* ── Responsive Adaptations for All Window Sizes ─────────────────────── */

    /* Tier 1: Ultrawide & High-Res Monitors (> 1440px) */
    @media (min-width: 1440px) {
      .app-layout {
        max-width: 1600px;
        gap: 3.5rem;
      }
      .toc-sidebar {
        width: 250px;
      }
    }

    /* Tier 2: Medium Desktop & Windows Half-Snap (1025px - 1280px) */
    @media (max-width: 1280px) {
      .doc-filename {
        max-width: 240px;
      }
      .hide-on-compact {
        display: none !important;
      }
      .app-layout {
        gap: 2rem;
        padding: 2rem 1.5rem 0;
      }
      .toc-sidebar {
        width: 210px;
      }
    }

    /* Tier 3: Compact Desktop & Tablet (769px - 1024px) */
    @media (max-width: 1024px) {
      .mobile-only-btn {
        display: inline-flex;
      }
      .doc-filename {
        max-width: 190px;
      }
      .hide-on-tablet {
        display: none !important;
      }
      .toc-sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        width: 290px;
        max-width: 85vw;
        max-height: 100vh;
        background: var(--bg-surface);
        z-index: 200;
        padding: 1.5rem 1.25rem;
        border-right: 1px solid var(--border-strong);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
        transform: translateX(-100%);
        transition: transform var(--transition-base);
        display: block !important;
      }
      .toc-sidebar.mobile-open {
        transform: translateX(0) !important;
      }
      .toc-drawer-close {
        display: inline-flex !important;
      }
      .app-layout {
        padding: 1.75rem 1.25rem 0;
        gap: 0;
      }
    }

    /* Tier 4: Small Windows & Mobile (< 768px down to 320px) */
    @media (max-width: 768px) {
      .top-header {
        height: 52px;
        padding: 0.4rem 0.75rem;
      }
      .brand-name {
        display: none !important;
      }
      .doc-filename {
        max-width: 140px;
      }
      .hide-on-mobile {
        display: none !important;
      }
      .header-right {
        gap: 0.35rem;
      }
      .edit-mode-btn {
        padding: 0.28rem 0.45rem;
      }
      .edit-mode-btn span {
        display: none;
      }
      .save-status-pill {
        padding: 0.2rem 0.45rem;
      }
      .save-status-pill .status-text {
        display: none;
      }
      .view-btn {
        padding: 0.25rem 0.45rem;
      }
      .view-btn span {
        display: none;
      }
      .app-layout {
        padding: 1.25rem 0.85rem 0;
      }
      .markdown-canvas {
        padding-bottom: 5rem;
      }
      .editor-toolbar {
        top: 52px;
        padding: 0.25rem 0.5rem;
      }
      .modal-box,
      .settings-modal-box {
        width: 95vw;
        max-width: 95vw;
        margin: 10px auto;
        padding: 0;
      }
      .code-header {
        padding: 0.35rem 0.65rem;
      }
      pre {
        padding: 0.75rem 0.85rem;
        font-size: 0.82rem;
      }
      .table-container {
        margin: 1.25rem 0;
      }
      th, td {
        padding: 0.5rem 0.65rem;
        font-size: 0.85rem;
      }
    }

    /* Tier 5: Extra-Small Windows (< 480px) */
    @media (max-width: 480px) {
      .top-header {
        height: 48px;
        padding: 0.35rem 0.5rem;
      }
      .header-separator {
        display: none !important;
      }
      .doc-filename {
        max-width: 110px;
      }
      .header-right {
        gap: 0.25rem;
      }
      .icon-btn {
        width: 30px;
        height: 30px;
        padding: 4px;
      }
      .app-layout {
        padding: 1rem 0.5rem 0;
      }
      .article-meta {
        flex-wrap: wrap;
        gap: 0.4rem 0.75rem;
        font-size: 0.72rem;
      }
    }

    /* ── Floating Toast System ─────────────────────────────────────── */
    .app-toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 10001;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      background: var(--bg-elevated);
      color: var(--text-primary);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.22);
      backdrop-filter: blur(12px);
      font-size: 0.84rem;
      font-weight: 500;
      opacity: 0;
      transform: translateY(12px) scale(0.97);
      pointer-events: none;
      transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .app-toast.visible {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }
    .toast-icon {
      display: inline-flex;
      align-items: center;
      color: var(--accent);
    }
    .toast-icon svg {
      width: 16px;
      height: 16px;
      stroke-width: 2;
    }

    /* ── Table Modal Styles ────────────────────────────────────────── */
    .table-modal-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1.2fr;
      gap: 12px;
      margin-top: 6px;
    }
    .table-field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .table-field-group label {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .table-modal-input,
    .table-modal-select {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 7px 10px;
      font-family: inherit;
      font-size: 0.85rem;
      color: var(--text-primary);
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .table-modal-input:focus,
    .table-modal-select:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 2px var(--accent-tint);
    }
    .table-align-btn {
      width: 100%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 8px 14px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      color: var(--text-primary);
      font-family: inherit;
      font-size: 0.82rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s ease, border-color 0.15s ease;
    }
    .table-align-btn:hover {
      background: var(--bg-hover);
      border-color: var(--border-strong);
    }

    /* ── In-Page Document Search Bar ───────────────────────────────── */
    .doc-search-bar {
      position: fixed;
      top: 4.25rem;
      right: 1.5rem;
      z-index: 1200;
      display: none;
      align-items: center;
      gap: 0.45rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.28);
      padding: 0.35rem 0.65rem;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
    .doc-search-bar.open {
      display: flex;
      animation: searchBarIn 0.16s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes searchBarIn {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .doc-search-bar .search-icon {
      color: var(--text-muted);
      display: flex;
      align-items: center;
    }
    #doc-search-input {
      background: transparent;
      border: none;
      outline: none;
      font-family: var(--font-display);
      font-size: 0.85rem;
      color: var(--text-primary);
      width: 13.5rem;
    }
    .search-count-badge {
      font-family: var(--font-mono);
      font-size: 0.72rem;
      color: var(--text-muted);
      background: var(--bg-elevated);
      padding: 0.15rem 0.4rem;
      border-radius: var(--radius-sm);
      white-space: nowrap;
    }
    .search-nav-group {
      display: flex;
      align-items: center;
      gap: 0.15rem;
    }
    .search-nav-btn, .search-close-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0.25rem;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.12s ease, color 0.12s ease;
    }
    .search-nav-btn:hover, .search-close-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
    mark.search-match {
      background: rgba(223, 112, 60, 0.35);
      color: inherit;
      border-radius: 2px;
      padding: 0 1px;
    }
    mark.search-match.active {
      background: var(--accent);
      color: #ffffff;
      outline: 2px solid rgba(223, 112, 60, 0.7);
    }

    /* ── Print / PDF Stylesheet ────────────────────────────────────── */
    @media print {
      /* Reset all theme variables to high-contrast print values */
      :root,
      html,
      html[data-theme="dark"],
      html[data-theme="light"],
      html[data-theme="sepia"] {
        --bg-canvas: #ffffff !important;
        --bg-surface: #ffffff !important;
        --bg-elevated: #f5f5f5 !important;
        --bg-hover: #eeeeee !important;
        --border-subtle: #d0d0d0 !important;
        --border-strong: #888888 !important;
        --text-primary: #111111 !important;
        --text-secondary: #2b2b2b !important;
        --text-muted: #555555 !important;
        --accent: #b84518 !important;
        --accent-tint: rgba(184, 69, 24, 0.08) !important;
        --code-bg: #f6f6f6 !important;
        --code-border: #cccccc !important;
        --badge-bg: #eeeeee !important;
      }

      /* Page setup - auto paper size with standard margins */
      @page {
        size: auto;
        margin: 15mm;
      }

      /* Reset chrome and force color printing */
      *,
      *::before,
      *::after {
        box-shadow: none !important;
        text-shadow: none !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      /* Hide interactive chrome, editors, toolbars, overlays, and modals */
      .top-header,
      .editor-toolbar,
      .header-edit-group,
      .toc-sidebar,
      .mobile-toc-overlay,
      #progress-bar,
      .code-copy-btn,
      .heading-anchor,
      .modal-overlay,
      .settings-modal-box,
      .live-dot,
      .raw-toolbar,
      .app-toast,
      #table-modal,
      body:not(.raw-mode) #raw-view {
        display: none !important;
      }

      /* Raw mode print styling */
      body.raw-mode #doc-content,
      body.raw-mode #visual-meta {
        display: none !important;
      }

      body.raw-mode #raw-view {
        display: block !important;
        border: 1pt solid #cccccc !important;
        border-radius: 4pt !important;
      }

      body.raw-mode .raw-code-wrapper {
        background: #ffffff !important;
        overflow: visible !important;
      }

      body.raw-mode .raw-editor-pre {
        background: #ffffff !important;
        color: #111111 !important;
        white-space: pre-wrap !important;
        word-break: break-word !important;
      }

      body.raw-mode .raw-line-numbers {
        background: #f5f5f5 !important;
        border-right: 1pt solid #dddddd !important;
        color: #777777 !important;
      }

      /* Clean print typography & suppress edit outlines */
      .markdown-body {
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        outline: none !important;
      }

      [contenteditable] {
        outline: none !important;
        box-shadow: none !important;
        caret-color: transparent !important;
      }

      /* Canvas & Layout */
      body {
        background: #ffffff !important;
        color: #111111 !important;
        font-family: "Satoshi", Georgia, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        font-size: 10pt !important;
        line-height: 1.6 !important;
      }

      .app-layout {
        display: block !important;
        padding: 0 !important;
        margin: 0 !important;
        max-width: 100% !important;
        gap: 0 !important;
      }

      .markdown-canvas {
        max-width: 100% !important;
        min-width: 0 !important;
      }

      /* Ensure all document text is dark and fully visible */
      .markdown-body,
      .markdown-body p,
      .markdown-body li,
      .markdown-body span,
      .markdown-body div,
      .markdown-body strong,
      .markdown-body em,
      .markdown-body blockquote,
      .article-meta,
      .article-meta * {
        color: #1a1a1a !important;
      }

      .markdown-body h1,
      .markdown-body h2,
      .markdown-body h3,
      .markdown-body h4,
      .markdown-body h5,
      .markdown-body h6 {
        color: #111111 !important;
        page-break-after: avoid !important;
        break-after: avoid !important;
      }

      .markdown-body h1 {
        font-size: 20pt !important;
        border-bottom: 2pt solid #111111 !important;
        padding-bottom: 4pt !important;
        margin-bottom: 12pt !important;
      }

      .markdown-body h2 {
        font-size: 14pt !important;
        border-bottom: 0.75pt solid #cccccc !important;
        margin-top: 18pt !important;
        margin-bottom: 8pt !important;
      }

      .markdown-body h3 {
        font-size: 11.5pt !important;
        margin-top: 14pt !important;
        margin-bottom: 4pt !important;
      }

      .markdown-body h4 {
        font-size: 10pt !important;
        margin-top: 10pt !important;
        margin-bottom: 4pt !important;
      }

      .markdown-body p,
      .markdown-body li {
        max-width: 100% !important;
        orphans: 3;
        widows: 3;
      }

      .markdown-body a {
        color: #111111 !important;
        text-decoration: underline !important;
        text-decoration-color: #888888 !important;
      }

      .article-meta {
        font-size: 8pt !important;
        color: #555555 !important;
        border-bottom: 1px solid #dddddd !important;
        margin-bottom: 14pt !important;
        padding-bottom: 6pt !important;
      }

      /* Code Blocks & Prism Syntax Highlighting */
      .code-block {
        border: 0.75pt solid #cccccc !important;
        border-radius: 4pt !important;
        margin: 10pt 0 !important;
        background: #f7f7f7 !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      .code-header {
        background: #ececec !important;
        border-bottom: 0.75pt solid #cccccc !important;
        padding: 3pt 8pt !important;
      }

      .code-lang {
        color: #444444 !important;
        font-size: 7pt !important;
        font-weight: 700 !important;
      }

      pre,
      pre[class*="language-"] {
        background: #f7f7f7 !important;
        color: #111111 !important;
        padding: 8pt 10pt !important;
        font-size: 8.5pt !important;
        line-height: 1.4 !important;
        white-space: pre-wrap !important;
        word-break: break-word !important;
      }

      pre code,
      code[class*="language-"],
      pre code * {
        background: transparent !important;
        color: #111111 !important;
        text-shadow: none !important;
      }

      /* Prism token colors: deep rich high-contrast tones for paper */
      .token {
        text-shadow: none !important;
      }
      .token.comment,
      .token.prolog,
      .token.doctype,
      .token.cdata {
        color: #5c6370 !important;
        font-style: italic !important;
      }
      .token.punctuation,
      .token.operator {
        color: #24292f !important;
        font-weight: 600 !important;
      }
      .token.property,
      .token.tag,
      .token.boolean,
      .token.number,
      .token.constant,
      .token.symbol {
        color: #953800 !important;
        font-weight: 600 !important;
      }
      .token.selector,
      .token.attr-name,
      .token.string,
      .token.char,
      .token.builtin,
      .token.inserted {
        color: #0a7037 !important;
      }
      .token.atrule,
      .token.attr-value,
      .token.keyword {
        color: #0550ae !important;
        font-weight: 600 !important;
      }
      .token.function,
      .token.class-name {
        color: #6639ba !important;
        font-weight: 600 !important;
      }
      .token.regex,
      .token.important,
      .token.variable {
        color: #a40e26 !important;
      }

      code:not(pre code) {
        background: #f0f0f0 !important;
        color: #b31d28 !important;
        border: 0.5pt solid #dddddd !important;
        padding: 0.1em 0.35em !important;
        font-size: 8.5pt !important;
      }

      /* Tables */
      .table-container {
        border: 0.75pt solid #cccccc !important;
        border-radius: 4pt !important;
        margin: 10pt 0 !important;
        background: #ffffff !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        overflow: visible !important;
      }

      table {
        width: 100% !important;
        font-size: 9pt !important;
        border-collapse: collapse !important;
      }

      thead {
        display: table-header-group !important;
      }

      tr {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      th {
        background: #f0f0f0 !important;
        color: #111111 !important;
        font-weight: 700 !important;
        padding: 5pt 8pt !important;
        border-bottom: 0.75pt solid #cccccc !important;
      }

      td {
        padding: 4pt 8pt !important;
        border-bottom: 0.5pt solid #e5e5e5 !important;
        color: #222222 !important;
      }

      tr:last-child td {
        border-bottom: none !important;
      }

      /* Callouts / Alerts */
      .doc-callout {
        border-radius: 4pt !important;
        margin: 10pt 0 !important;
        padding: 8pt 10pt !important;
        border: 1pt solid #d0d7de !important;
        border-left-width: 3.5pt !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      .doc-callout-note      { background: #f0f6fc !important; border-left-color: #0969da !important; }
      .doc-callout-tip       { background: #dafbe1 !important; border-left-color: #1a7f37 !important; }
      .doc-callout-important { background: #fbefff !important; border-left-color: #8250df !important; }
      .doc-callout-warning   { background: #fff8c5 !important; border-left-color: #9a6700 !important; }
      .doc-callout-caution   { background: #ffebe9 !important; border-left-color: #cf222e !important; }

      .callout-header {
        font-size: 8pt !important;
        font-weight: 700 !important;
        margin-bottom: 3pt !important;
      }

      .doc-callout-note .callout-header      { color: #0969da !important; }
      .doc-callout-tip .callout-header       { color: #1a7f37 !important; }
      .doc-callout-important .callout-header { color: #8250df !important; }
      .doc-callout-warning .callout-header   { color: #9a6700 !important; }
      .doc-callout-caution .callout-header   { color: #cf222e !important; }

      .callout-content,
      .callout-content p,
      .callout-content * {
        color: #111111 !important;
        font-size: 9.5pt !important;
        line-height: 1.5 !important;
      }

      /* KaTeX Math Equations */
      .katex,
      .katex *,
      .math-block,
      .math-block *,
      .math-inline,
      .math-inline * {
        color: #111111 !important;
        fill: #111111 !important;
        border-color: #111111 !important;
        text-shadow: none !important;
      }

      .math-block {
        background: #fafafa !important;
        border: 0.75pt solid #dddddd !important;
        border-radius: 4pt !important;
        padding: 8pt !important;
        margin: 10pt 0 !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      /* Mermaid Diagrams & Images */
      .mermaid-container,
      .markdown-body img,
      figure {
        background: #fafafa !important;
        border: 0.75pt solid #dddddd !important;
        border-radius: 4pt !important;
        padding: 10pt !important;
        margin: 12pt 0 !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        max-width: 100% !important;
      }

      .mermaid svg text,
      .mermaid svg text *,
      .mermaid svg tspan,
      .mermaid svg .nodeLabel,
      .mermaid svg .edgeLabel,
      .mermaid svg .label,
      .mermaid svg span {
        fill: #111111 !important;
        color: #111111 !important;
      }

      .mermaid svg .node rect,
      .mermaid svg .node circle,
      .mermaid svg .node polygon,
      .mermaid svg .node path {
        fill: #f5f5f5 !important;
        stroke: #333333 !important;
      }

      .mermaid svg .flowchart-link,
      .mermaid svg .edgePath .path {
        stroke: #333333 !important;
      }

      .mermaid svg .marker {
        fill: #333333 !important;
        stroke: #333333 !important;
      }

      /* Blockquotes */
      .markdown-body blockquote {
        border-left: 3pt solid #cccccc !important;
        color: #333333 !important;
        padding-left: 10pt !important;
        font-style: italic !important;
        margin: 10pt 0 !important;
      }

      .markdown-body hr {
        border: none !important;
        border-top: 0.75pt solid #cccccc !important;
        margin: 14pt 0 !important;
      }
    }
  </style>
</head>
<body class="${!hasToc ? 'no-toc' : ''}">
  <div id="progress-bar"></div>

  <div class="mobile-toc-overlay" id="mobile-toc-overlay" onclick="toggleMobileToc(false)"></div>

  <!-- Floating In-Page Document Search Bar -->
  <div class="doc-search-bar" id="doc-search-bar" role="search" aria-label="Find in document">
    <span class="search-icon">${ICONS.search}</span>
    <input type="text" id="doc-search-input" placeholder="Find in document... (Ctrl+F)" aria-label="Search query" autocomplete="off" spellcheck="false" />
    <span class="search-count-badge" id="search-count-badge">0/0</span>
    <div class="search-nav-group">
      <button class="search-nav-btn" id="search-prev-btn" onclick="searchNavigate(-1)" title="Previous match (Shift+Enter)" aria-label="Previous match">${ICONS.chevronUp}</button>
      <button class="search-nav-btn" id="search-next-btn" onclick="searchNavigate(1)" title="Next match (Enter)" aria-label="Next match">${ICONS.chevronDown}</button>
    </div>
    <button class="search-close-btn" onclick="toggleSearch(false)" title="Close (Esc)" aria-label="Close search">${ICONS.close}</button>
  </div>

  <!-- Top Header Navigation -->
  <header class="top-header">
    <div class="header-left">
      <a href="#" class="header-brand" title="dot md - Top of document" onclick="window.scrollTo({top: 0, behavior: 'smooth'}); return false;">
        <span class="brand-logo">${ICONS.logo}</span>
        <span class="brand-name">dot md</span>
      </a>
      <span class="header-separator" aria-hidden="true">/</span>
      <div class="header-file-info">
        ${isLive ? '<span class="live-dot" title="Live sync active"></span>' : ''}
        <span class="doc-filename" id="app-doc-title" title="${filename}">${filename}</span>
        ${isLive ? '<span class="doc-badge">LIVE</span>' : ''}
      </div>
    </div>

    <div class="header-right">
      <!-- Edit Mode Toggle & Status Pill -->
      <div class="header-edit-group">
        <button class="edit-mode-btn" id="toggle-edit-btn" onclick="toggleEditMode()" title="Toggle Edit Mode (Ctrl+E)" aria-label="Toggle Edit Mode">
          ${ICONS.edit}
          <span id="edit-mode-label">Edit</span>
        </button>
        <button class="save-status-pill saved" id="save-status-pill" onclick="saveDocument()" title="Saved to disk" aria-label="Save document">
          <span class="status-dot"></span>
          <span class="status-text">Saved</span>
        </button>
      </div>

      <!-- View Mode Switcher (Visual / Raw) -->
      <div class="view-switcher" role="tablist" aria-label="Document view modes">
        <button class="view-btn active" id="view-visual-btn" onclick="setViewMode('visual')" role="tab" aria-selected="true" title="Rendered Visual Document">${ICONS.visual}<span>Visual</span></button>
        <button class="view-btn" id="view-raw-btn" onclick="setViewMode('raw')" role="tab" aria-selected="false" title="Raw Markdown Source (R)">${ICONS.raw}<span>Raw</span></button>
      </div>

      <div class="header-nav-sep hide-on-mobile"></div>

      <!-- Outline Toggle Button (Desktop & Mobile) -->
      <button class="icon-btn active" id="toc-toggle-btn" onclick="toggleOutline()" title="Toggle Outline (O / Z)" aria-label="Toggle Outline">
        ${ICONS.toc}
      </button>

      <!-- In-Page Search Button -->
      <button class="icon-btn" id="search-toggle-btn" onclick="toggleSearch()" title="Find in document (Ctrl+F / /)" aria-label="Find in document">
        ${ICONS.search}
      </button>

      <!-- Wide View Toggle -->
      <button class="icon-btn hide-on-tablet" id="wide-btn" onclick="toggleWide()" title="Wide view (W)" aria-label="Toggle wide view">
        ${ICONS.wide}
      </button>

      <div class="header-nav-sep hide-on-tablet"></div>

      <!-- Theme Switcher -->
      <button class="icon-btn" onclick="cycleTheme()" title="Switch theme (T)" aria-label="Cycle theme">
        ${ICONS.theme}
      </button>

      <!-- Print / PDF -->
      <button class="icon-btn hide-on-mobile" onclick="triggerPrint()" title="Print / PDF (P)" aria-label="Print document">
        ${ICONS.print}
      </button>

      <!-- Export Standalone HTML -->
      <button class="icon-btn hide-on-mobile" onclick="downloadStandalone()" title="Save offline HTML" aria-label="Download HTML">
        ${ICONS.export}
      </button>

      <!-- App Settings Modal -->
      <button class="icon-btn" id="settings-btn" onclick="toggleSettingsModal(true)" title="Settings (,)" aria-label="Settings">${ICONS.settings}</button>

      <!-- Help Shortcuts Modal -->
      <button class="icon-btn hide-on-tablet" onclick="toggleModal(true)" title="Keyboard shortcuts (?)" aria-label="Keyboard shortcuts">${ICONS.keyboard}</button>
    </div>
  </header>

  <!-- Editor Formatting Tools Toolbar -->
  <div class="editor-toolbar" id="editor-toolbar" role="toolbar" aria-label="Editor Tools">
    <div class="toolbar-group">
      <button class="tool-btn" id="tool-undo" onclick="editorUndo()" title="Undo (Ctrl+Z)" aria-label="Undo" disabled>${ICONS.undo}</button>
      <button class="tool-btn" id="tool-redo" onclick="editorRedo()" title="Redo (Ctrl+Y)" aria-label="Redo" disabled>${ICONS.redo}</button>
    </div>
    <div class="toolbar-sep"></div>
    <div class="toolbar-group">
      <button class="tool-btn" onclick="applyFormat('h1')" title="Heading 1" aria-label="Heading 1">${ICONS.h1}</button>
      <button class="tool-btn" onclick="applyFormat('h2')" title="Heading 2" aria-label="Heading 2">${ICONS.h2}</button>
      <button class="tool-btn" onclick="applyFormat('h3')" title="Heading 3" aria-label="Heading 3">${ICONS.h3}</button>
    </div>
    <div class="toolbar-sep"></div>
    <div class="toolbar-group">
      <button class="tool-btn" onclick="applyFormat('bold')" title="Bold (Ctrl+B)" aria-label="Bold">${ICONS.bold}</button>
      <button class="tool-btn" onclick="applyFormat('italic')" title="Italic (Ctrl+I)" aria-label="Italic">${ICONS.italic}</button>
      <button class="tool-btn" onclick="applyFormat('strike')" title="Strikethrough" aria-label="Strikethrough">${ICONS.strike}</button>
      <button class="tool-btn" onclick="applyFormat('code')" title="Inline Code" aria-label="Inline Code">${ICONS.code}</button>
    </div>
    <div class="toolbar-sep"></div>
    <div class="toolbar-group">
      <button class="tool-btn" onclick="applyFormat('list')" title="Bullet List" aria-label="Bullet List">${ICONS.list}</button>
      <button class="tool-btn" onclick="applyFormat('numberList')" title="Numbered List" aria-label="Numbered List">${ICONS.numberList}</button>
      <button class="tool-btn" onclick="applyFormat('task')" title="Task Checklist" aria-label="Task Checklist">${ICONS.task}</button>
      <button class="tool-btn" onclick="applyFormat('quote')" title="Blockquote" aria-label="Blockquote">${ICONS.quote}</button>
    </div>
    <div class="toolbar-sep"></div>
    <div class="toolbar-group">
      <button class="tool-btn" onclick="applyFormat('link')" title="Insert Link (Ctrl+K)" aria-label="Insert Link">${ICONS.link}</button>
      <button class="tool-btn" onclick="toggleTableModal(true)" title="Table Tools (Ctrl+Shift+T)" aria-label="Table Tools">${ICONS.table}</button>
      <button class="tool-btn" onclick="applyFormat('rule')" title="Horizontal Rule" aria-label="Horizontal Rule">${ICONS.rule}</button>
    </div>
  </div>

  <!-- Main Container -->
  <div class="app-layout">
    <!-- Sticky Table of Contents -->
    <aside class="toc-sidebar" id="toc-sidebar">
      <div class="toc-title">
        <div class="toc-title-left">
          ${ICONS.toc}
          <span>Outline</span>
        </div>
        <div class="toc-title-right">
          ${hasToc ? `<span class="toc-badge">${toc.length}</span>` : ''}
          <button class="toc-drawer-close" onclick="toggleMobileToc(false)" aria-label="Close outline drawer">${ICONS.close}</button>
        </div>
      </div>
      <nav class="toc-nav">
        ${hasToc ? tocItems : '<div class="toc-empty" style="padding: 0.5rem 0.6rem; color: var(--text-muted); font-size: 0.78rem;">No headings</div>'}
      </nav>
    </aside>

    <!-- Main Content Canvas -->
    <main class="markdown-canvas">
      <div class="article-meta" id="visual-meta">
        <span class="meta-tag">
          <strong>${stats.words}</strong> words
        </span>
        <span>·</span>
        <span class="meta-tag">
          <strong>${stats.readTimeMin}</strong> min read
        </span>
        <span>·</span>
        <span class="meta-tag">
          Updated ${new Date().toLocaleTimeString()}
        </span>
      </div>

      <article class="markdown-body" id="doc-content">
        ${html}
      </article>

      <!-- Raw Markdown Source View -->
      <section class="raw-view-container" id="raw-view" style="--gutter-width: ${gutterWidthEm}em;">
        <div class="raw-toolbar">
          <div class="raw-toolbar-left">
            <span class="raw-file-badge">
              ${ICONS.file}
              <span>${rawDownloadFilename}</span>
            </span>
            <div class="raw-stats">
              <span><strong>${lineCount}</strong> lines</span>
              <span class="stat-sep">·</span>
              <span><strong>${fileSizeStr}</strong></span>
              <span class="stat-sep stat-secondary">·</span>
              <span class="stat-secondary"><strong>${stats.words.toLocaleString()}</strong> words</span>
              <span class="stat-sep stat-secondary">·</span>
              <span class="stat-secondary"><strong>${charCount.toLocaleString()}</strong> chars</span>
            </div>
          </div>
          <div class="raw-toolbar-right">
            <button class="raw-action-btn" id="raw-wrap-btn" onclick="toggleRawWrap()" title="Toggle Soft Line Wrap">
              ${ICONS.wrap}
              <span id="raw-wrap-label">Wrap: Off</span>
            </button>
            <button class="raw-action-btn" onclick="downloadRawMarkdown()" title="Download raw markdown file">
              ${ICONS.export}
              <span>Download .md</span>
            </button>
            <button class="raw-action-btn raw-copy-btn" onclick="copyRawMarkdown(this)" title="Copy raw markdown to clipboard">
              ${ICONS.copy}
              <span>Copy Raw</span>
            </button>
          </div>
        </div>
        <div class="raw-code-wrapper">
          <div class="raw-line-numbers" id="raw-line-numbers" aria-hidden="true">${lineSpans}</div>
          <pre class="raw-editor-pre" id="raw-editor-pre" style="display:none;"><code class="raw-code" id="raw-markdown-code">${safeRawMarkdown}</code></pre>
          <textarea class="raw-editor-textarea" id="raw-editor-textarea" spellcheck="false" placeholder="Type Markdown here...">${rawMarkdownEscaped}</textarea>
        </div>
      </section>
    </main>
  </div>

  <!-- Shortcuts Modal -->
  <div class="modal-overlay" id="shortcut-modal" onclick="if(event.target === this) toggleModal(false)">
    <div class="modal-box">
      <div class="modal-header">
        <h3>Keyboard Shortcuts</h3>
        <button class="icon-btn" onclick="toggleModal(false)" aria-label="Close shortcuts">${ICONS.close}</button>
      </div>
      <div class="shortcut-row">
        <span>Toggle Edit Mode</span>
        <kbd class="shortcut-key">Ctrl+E</kbd>
      </div>
      <div class="shortcut-row">
        <span>Save to Disk</span>
        <kbd class="shortcut-key">Ctrl+S</kbd>
      </div>
      <div class="shortcut-row">
        <span>Undo / Redo</span>
        <kbd class="shortcut-key">Ctrl+Z / Y</kbd>
      </div>
      <div class="shortcut-row">
        <span>Cycle Theme (Dark / Light / Sepia)</span>
        <kbd class="shortcut-key">T</kbd>
      </div>
      <div class="shortcut-row">
        <span>Toggle Outline (Sidebar)</span>
        <kbd class="shortcut-key">O / Z</kbd>
      </div>
      <div class="shortcut-row">
        <span>Toggle Wide View</span>
        <kbd class="shortcut-key">W</kbd>
      </div>
      <div class="shortcut-row">
        <span>Toggle Visual / Raw Markdown</span>
        <kbd class="shortcut-key">R</kbd>
      </div>
      <div class="shortcut-row">
        <span>Find in Document</span>
        <kbd class="shortcut-key">Ctrl+F / /</kbd>
      </div>
      <div class="shortcut-row">
        <span>Print to PDF</span>
        <kbd class="shortcut-key">P</kbd>
      </div>
      <div class="shortcut-row">
        <span>Auto-Align Table (Edit Mode)</span>
        <kbd class="shortcut-key">Ctrl+Shift+T</kbd>
      </div>
      <div class="shortcut-row">
        <span>Open Settings</span>
        <kbd class="shortcut-key">, or S</kbd>
      </div>
      <div class="shortcut-row">
        <span>Toggle Shortcuts Cheat-Sheet</span>
        <kbd class="shortcut-key">?</kbd>
      </div>
      <div class="shortcut-row">
        <span>Close Modal / Exit Zen</span>
        <kbd class="shortcut-key">Esc</kbd>
      </div>
    </div>
  </div>

  <!-- Settings Modal -->
  <div class="modal-overlay" id="settings-modal" onclick="if(event.target === this) toggleSettingsModal(false)">
    <div class="settings-modal-box">
      <div class="settings-modal-header">
        <h3>${ICONS.settings} <span>Settings</span></h3>
        <button class="icon-btn" onclick="toggleSettingsModal(false)" aria-label="Close Settings">${ICONS.close}</button>
      </div>
      <div class="settings-modal-body">
        
        <!-- Theme & Appearance -->
        <div class="settings-group">
          <div class="settings-group-title">Theme &amp; Styling</div>
          <div class="settings-row">
            <div class="settings-label-wrap">
              <span class="settings-label">Color Theme</span>
              <span class="settings-desc">Select visual appearance mode</span>
            </div>
            <div class="segmented-control" id="setting-theme-control">
              <button type="button" class="segment-btn" data-val="dark" onclick="updateSetting('theme', 'dark')">Dark</button>
              <button type="button" class="segment-btn" data-val="light" onclick="updateSetting('theme', 'light')">Light</button>
              <button type="button" class="segment-btn" data-val="sepia" onclick="updateSetting('theme', 'sepia')">Sepia</button>
            </div>
          </div>

          <div class="settings-row">
            <div class="settings-label-wrap">
              <span class="settings-label">Font Family</span>
              <span class="settings-desc">Typeface used for reading text</span>
            </div>
            <div class="segmented-control" id="setting-font-family-control">
              <button type="button" class="segment-btn" data-val="sans" onclick="updateSetting('fontFamily', 'sans')">Sans</button>
              <button type="button" class="segment-btn" data-val="serif" onclick="updateSetting('fontFamily', 'serif')">Serif</button>
              <button type="button" class="segment-btn" data-val="mono" onclick="updateSetting('fontFamily', 'mono')">Mono</button>
            </div>
          </div>

          <div class="settings-row">
            <div class="settings-label-wrap">
              <span class="settings-label">Font Size</span>
              <span class="settings-desc">Base reading scale: <strong id="setting-font-size-label">16px</strong></span>
            </div>
            <div class="segmented-control" id="setting-font-size-control">
              <button type="button" class="segment-btn" data-val="14" onclick="updateSetting('fontSize', 14)">14px</button>
              <button type="button" class="segment-btn" data-val="16" onclick="updateSetting('fontSize', 16)">16px</button>
              <button type="button" class="segment-btn" data-val="18" onclick="updateSetting('fontSize', 18)">18px</button>
              <button type="button" class="segment-btn" data-val="20" onclick="updateSetting('fontSize', 20)">20px</button>
            </div>
          </div>

          <div class="settings-row">
            <div class="settings-label-wrap">
              <span class="settings-label">Line Spacing</span>
              <span class="settings-desc">Reading text line height</span>
            </div>
            <div class="segmented-control" id="setting-line-height-control">
              <button type="button" class="segment-btn" data-val="1.5" onclick="updateSetting('lineHeight', '1.5')">Compact</button>
              <button type="button" class="segment-btn" data-val="1.65" onclick="updateSetting('lineHeight', '1.65')">Balanced</button>
              <button type="button" class="segment-btn" data-val="1.85" onclick="updateSetting('lineHeight', '1.85')">Relaxed</button>
            </div>
          </div>
        </div>

        <!-- Layout & Outline -->
        <div class="settings-group">
          <div class="settings-group-title">Layout &amp; Outline</div>
          <div class="settings-row">
            <div class="settings-label-wrap">
              <span class="settings-label">Content Measure</span>
              <span class="settings-desc">Reading column width</span>
            </div>
            <div class="segmented-control" id="setting-width-control">
              <button type="button" class="segment-btn" data-val="focused" onclick="updateSetting('contentWidth', 'focused')">740px</button>
              <button type="button" class="segment-btn" data-val="standard" onclick="updateSetting('contentWidth', 'standard')">860px</button>
              <button type="button" class="segment-btn" data-val="wide" onclick="updateSetting('contentWidth', 'wide')">1200px</button>
              <button type="button" class="segment-btn" data-val="full" onclick="updateSetting('contentWidth', 'full')">100%</button>
            </div>
          </div>

          <div class="settings-row">
            <div class="settings-label-wrap">
              <span class="settings-label">Reading Progress Bar</span>
              <span class="settings-desc">Show indicator line at top of viewport</span>
            </div>
            <label class="toggle-control">
              <input type="checkbox" id="setting-progress-toggle" onchange="updateSetting('showProgressBar', this.checked)">
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
            </label>
          </div>

          <div class="settings-row">
            <div class="settings-label-wrap">
              <span class="settings-label">Outline Sidebar Default</span>
              <span class="settings-desc">Keep outline sidebar open by default</span>
            </div>
            <label class="toggle-control">
              <input type="checkbox" id="setting-outline-toggle" onchange="updateSetting('outlineOpen', this.checked)">
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
            </label>
          </div>
        </div>

        <!-- Code & Raw Viewer -->
        <div class="settings-group">
          <div class="settings-group-title">Code &amp; Editor</div>
          <div class="settings-row">
            <div class="settings-label-wrap">
              <span class="settings-label">Code Block Soft Wrap</span>
              <span class="settings-desc">Wrap long lines in rendered code blocks</span>
            </div>
            <label class="toggle-control">
              <input type="checkbox" id="setting-code-wrap-toggle" onchange="updateSetting('codeWrap', this.checked)">
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
            </label>
          </div>

          <div class="settings-row">
            <div class="settings-label-wrap">
              <span class="settings-label">Raw View Default Wrap</span>
              <span class="settings-desc">Auto-enable soft wrap when switching to raw</span>
            </div>
            <label class="toggle-control">
              <input type="checkbox" id="setting-raw-wrap-toggle" onchange="updateSetting('rawWrapDefault', this.checked)">
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
            </label>
          </div>
        </div>

      </div>
      <div class="settings-modal-footer">
        <button type="button" class="settings-reset-btn" onclick="resetSettings()">Reset to Defaults</button>
        <button type="button" class="settings-done-btn" onclick="toggleSettingsModal(false)">Done</button>
      </div>
    </div>
  </div>

  <!-- Table Tools Modal -->
  <div class="modal-overlay" id="table-modal" onclick="if(event.target === this) toggleTableModal(false)">
    <div class="settings-modal-box" style="max-width: 440px;">
      <div class="settings-modal-header">
        <h3>${ICONS.table} <span>Table Tools</span></h3>
        <button class="icon-btn" onclick="toggleTableModal(false)" aria-label="Close Table Tools">${ICONS.close}</button>
      </div>
      <div class="settings-modal-body">
        <div class="settings-section-title">Insert New Table</div>
        <div class="table-modal-grid">
          <div class="table-field-group">
            <label for="table-input-cols">Columns</label>
            <input type="number" id="table-input-cols" class="table-modal-input" min="1" max="20" value="3">
          </div>
          <div class="table-field-group">
            <label for="table-input-rows">Rows</label>
            <input type="number" id="table-input-rows" class="table-modal-input" min="1" max="50" value="3">
          </div>
          <div class="table-field-group">
            <label for="table-input-align">Alignment</label>
            <select id="table-input-align" class="table-modal-select">
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
        <div class="settings-section-title" style="margin-top: 1.2rem;">Format &amp; Auto-Align</div>
        <div class="settings-desc" style="margin-bottom: 0.8rem;">
          Format ASCII pipe table with uniform column widths (Shortcut: <kbd class="shortcut-key">Ctrl+Shift+T</kbd>)
        </div>
        <button type="button" class="table-align-btn" onclick="formatCurrentTable(); toggleTableModal(false);">
          Auto-Align Table at Cursor
        </button>
      </div>
      <div class="settings-modal-footer">
        <button type="button" class="settings-reset-btn" onclick="toggleTableModal(false)">Cancel</button>
        <button type="button" class="settings-done-btn" onclick="confirmInsertTable()">Insert Table</button>
      </div>
    </div>
  </div>

  <!-- Toast Notification Container -->
  <div class="app-toast" id="app-toast" aria-live="polite" aria-atomic="true">
    <span class="toast-icon" id="toast-icon"></span>
    <span class="toast-message" id="toast-message"></span>
  </div>

  <!-- Client-side Scripts: KaTeX, Prism, Mermaid, Scrollspy, Live Sync -->
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10.8.0/dist/mermaid.min.js"></script>
  ${markedMinJs ? `<script>${markedMinJs}</script>` : '<script src="https://cdn.jsdelivr.net/npm/marked@12.0.0/marked.min.js"></script>'}

  <script>
    window.__DOTMD_INITIAL_DATA__ = null;
  </script>

  <script>
    // 0. Client Markdown Processing Engine & Icons
    const CLIENT_ICONS = ${JSON.stringify(ICONS)};

    function stripHtml(text) {
      return (text || '').replace(/<[^>]+>/g, '').replace(/"/g, '&quot;').trim();
    }

    function slugify(text) {
      return (text || '')
        .toLowerCase()
        .replace(/@@@MATH_[A-Z]+_\\d+@@@/g, 'math')
        .replace(/&[a-z0-9#]+;/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/[^\\w\\s-]/g, '')
        .trim()
        .replace(/\\s+/g, '-');
    }

    function extractClientFrontmatter(md) {
      if (!md) return { frontmatter: null, body: '', rawYaml: '' };

      const cleanMd = (md || '').replace(/^\\uFEFF/, '');
      const match = cleanMd.match(/^(?:[ \\t]*\\r?\\n)*---[ \\t]*\\r?\\n([\\s\\S]*?)\\r?\\n(?:---|...)[ \\t]*(?:\\r?\\n|$)/);
      if (!match) return { frontmatter: null, body: cleanMd, rawYaml: '' };

      const rawYaml = match[1];
      const body = cleanMd.slice(match[0].length);
      const data = {};

      const lines = rawYaml.split(/\\r?\\n/);
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) continue;
        const key = line.slice(0, colonIdx).trim();
        let val = line.slice(colonIdx + 1).trim();
        if (!key) continue;

        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        } else if (val.startsWith('[') && val.endsWith(']')) {
          val = val.slice(1, -1).split(',').map(function (s) {
            return s.trim().replace(/^[\\"']|[\\"']$/g, '');
          }).filter(Boolean);
        }
        data[key] = val;
      }

      return { frontmatter: Object.keys(data).length > 0 ? data : null, body: body, rawYaml: rawYaml };
    }

    function renderClientFrontmatterHtml(data, rawYaml) {
      if (!data) return '';
      const entries = Object.entries(data);
      if (entries.length === 0) return '';

      let rowsHtml = '';
      for (let i = 0; i < entries.length; i++) {
        const key = entries[i][0];
        const val = entries[i][1];
        const safeKey = stripHtml(key);
        if (Array.isArray(val)) {
          let tagsHtml = '';
          for (let j = 0; j < val.length; j++) {
            tagsHtml += '<span class="frontmatter-tag">' + stripHtml(val[j]) + '</span>';
          }
          rowsHtml += '<div class="frontmatter-row"><span class="frontmatter-key">' + safeKey + '</span><div class="frontmatter-tags">' + tagsHtml + '</div></div>';
        } else {
          rowsHtml += '<div class="frontmatter-row"><span class="frontmatter-key">' + safeKey + '</span><span class="frontmatter-val">' + stripHtml(String(val)) + '</span></div>';
        }
      }

      const encodedYaml = encodeURIComponent(rawYaml || '');
      return '<div class="frontmatter-card" contenteditable="false" data-raw-frontmatter="' + encodedYaml + '">' +
        '<div class="frontmatter-header">' +
          '<span class="frontmatter-badge">Document Metadata</span>' +
        '</div>' +
        '<div class="frontmatter-grid">' +
          rowsHtml +
        '</div>' +
      '</div>';
    }

    function clientProcessMarkdown(markdown) {
      if (!markdown) {
        return { html: '', toc: [], stats: { words: 0, readTimeMin: 1 } };
      }
      if (!window.marked || typeof marked.parse !== 'function') {
        const safeMd = (markdown || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return { html: '<pre>' + safeMd + '</pre>', toc: [], stats: { words: 0, readTimeMin: 1 } };
      }

      const fmRes = extractClientFrontmatter(markdown);
      const frontmatter = fmRes.frontmatter;
      const body = fmRes.body;
      const rawYaml = fmRes.rawYaml;

      const mathStore = [];
      let protectedMd = body.replace(/\\$\\$([\\s\\S]+?)\\$\\$/g, (match, formula) => {
        const idx = mathStore.length;
        mathStore.push({ type: 'block', formula: formula });
        return '@@@MATH_BLOCK_' + idx + '@@@';
      });

      protectedMd = protectedMd.replace(/(^|[^\\\\])\\$([^\\$]+?)\\$/g, (match, prefix, formula) => {
        const idx = mathStore.length;
        mathStore.push({ type: 'inline', formula: formula });
        return prefix + '@@@MATH_INLINE_' + idx + '@@@';
      });

      const toc = [];
      const slugCounts = new Map();
      function getUniqueSlug(baseSlug) {
        const clean = baseSlug || 'section';
        const count = slugCounts.get(clean) || 0;
        slugCounts.set(clean, count + 1);
        return count === 0 ? clean : clean + '-' + count;
      }

      const renderer = new marked.Renderer();
      renderer.heading = function ({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        const slug = getUniqueSlug(slugify(text));
        if (depth <= 3) {
          const tocTitle = text.replace(/<a\\b[^>]*>([\\s\\S]*?)<\\/a>/gi, '$1').replace(/<!--[\\s\\S]*?-->/g, '').trim();
          // Safety guard: do not add frontmatter blocks to outline
          if (!tocTitle.includes('title:') || !tocTitle.includes('author:')) {
            toc.push({ level: depth, title: tocTitle, slug: slug });
          }
        }
        return '<h' + depth + ' id="' + slug + '" class="doc-heading doc-h' + depth + '">' +
          '<span class="heading-anchor" onclick="copyHeadingLink(this, \\'' + slug + '\\')" title="Copy link to section">#</span>' +
          text +
        '</h' + depth + '>';
      };

      renderer.code = function ({ text, lang }) {
        const language = (lang || 'text').toLowerCase();
        if (language === 'mermaid') {
          return '<div class="mermaid-container"><pre class="mermaid">' + text + '</pre></div>';
        }
        const safeText = text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
        return '<div class="code-block" data-lang="' + language + '">' +
          '<div class="code-header">' +
            '<span class="code-lang">' + language + '</span>' +
            '<button class="code-copy-btn" onclick="copyCode(this)" aria-label="Copy code">' +
              CLIENT_ICONS.copy +
              '<span>Copy</span>' +
            '</button>' +
          '</div>' +
          '<pre><code class="language-' + language + '">' + safeText + '</code></pre>' +
        '</div>';
      };

      renderer.checkbox = function ({ checked }) {
        return '<input type="checkbox" class="task-checkbox"' + (checked ? ' checked' : '') + '> ';
      };

      renderer.table = function ({ header, rows }) {
        let headerHtml = '';
        header.forEach(cell => {
          headerHtml += '<th align="' + (cell.align || 'left') + '">' + this.parser.parseInline(cell.tokens) + '</th>';
        });
        let rowsHtml = '';
        rows.forEach(row => {
          rowsHtml += '<tr>';
          row.forEach(cell => {
            rowsHtml += '<td align="' + (cell.align || 'left') + '">' + this.parser.parseInline(cell.tokens) + '</td>';
          });
          rowsHtml += '</tr>';
        });
        return '<div class="table-container">' +
          '<table>' +
            '<thead><tr>' + headerHtml + '</tr></thead>' +
            '<tbody>' + rowsHtml + '</tbody>' +
          '</table>' +
        '</div>';
      };

      let html = marked.parse(protectedMd, { renderer: renderer, gfm: true, breaks: true });

      html = html.replace(/@@@MATH_BLOCK_(\\d+)@@@/g, (m, idx) => {
        const item = mathStore[parseInt(idx, 10)];
        return '<div class="math-block" data-tex="' + encodeURIComponent(item.formula) + '">$$' + item.formula + '$$</div>';
      });

      html = html.replace(/@@@MATH_INLINE_(\\d+)@@@/g, (m, idx) => {
        const item = mathStore[parseInt(idx, 10)];
        return '<span class="math-inline" data-tex="' + encodeURIComponent(item.formula) + '">$' + item.formula + '$</span>';
      });

      for (const item of toc) {
        item.title = item.title
          .replace(/@@@MATH_BLOCK_(\\d+)@@@/g, (m, idx) => '$' + mathStore[parseInt(idx, 10)].formula + '$')
          .replace(/@@@MATH_INLINE_(\\d+)@@@/g, (m, idx) => '$' + mathStore[parseInt(idx, 10)].formula + '$');
      }

      const alertRegex = /<blockquote>\\s*<p>\\s*\\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\\](?:\\s*<br\\s*\\/?>)?([\\s\\S]*?)<\\/p>\\s*<\\/blockquote>/gi;
      html = html.replace(alertRegex, (match, type, content) => {
        const lowerType = type.toLowerCase();
        const icon = CLIENT_ICONS[lowerType] || CLIENT_ICONS.note;
        return '<div class="doc-callout doc-callout-' + lowerType + '">' +
          '<div class="callout-header">' +
            '<span class="callout-icon">' + icon + '</span>' +
            '<span class="callout-title">' + type + '</span>' +
          '</div>' +
          '<div class="callout-content">' + content.trim() + '</div>' +
        '</div>';
      });

      if (frontmatter) {
        html = renderClientFrontmatterHtml(frontmatter, rawYaml) + html;
      }

      const plainText = body.replace(/<[^>]+>/g, '').replace(/[#*\\x60_~[\\]()]/g, '');
      const words = plainText.trim().split(/\\s+/).filter(Boolean).length;
      const readTimeMin = Math.max(1, Math.ceil(words / 200));

      return { html, toc, stats: { words, readTimeMin }, frontmatter };
    }

    function renderMarkdownDocument(markdown, filename) {
      if (filename) {
        const titleEl = document.getElementById('app-doc-title');
        if (titleEl) titleEl.textContent = filename;
        document.title = filename + ' - dot md';
      }

      const processed = clientProcessMarkdown(markdown);

      const docContent = document.getElementById('doc-content');
      if (docContent) {
        docContent.innerHTML = processed.html;
      }

      const tocSidebar = document.getElementById('toc-sidebar');
      if (tocSidebar) {
        const hasToc = processed.toc.length > 0;
        document.body.classList.toggle('no-toc', !hasToc);
        tocSidebar.innerHTML = '<div class="toc-title">' +
          '<div class="toc-title-left">' +
            (CLIENT_ICONS.toc || '') +
            '<span>Outline</span>' +
          '</div>' +
          '<div class="toc-title-right">' +
            (hasToc ? '<span class="toc-badge">' + processed.toc.length + '</span>' : '') +
            '<button class="toc-drawer-close" onclick="toggleMobileToc(false)" aria-label="Close outline drawer">' + (CLIENT_ICONS.close || '') + '</button>' +
          '</div>' +
        '</div>' +
        '<nav class="toc-nav">' +
          (hasToc ? processed.toc.map(item =>
            '<a href="#' + item.slug + '" class="toc-item toc-level-' + item.level + '" data-slug="' + item.slug + '" title="' + stripHtml(item.title) + '">' +
              '<span class="toc-bullet"></span>' +
              '<span class="toc-text">' + item.title + '</span>' +
            '</a>'
          ).join('') : '<div class="toc-empty" style="padding: 0.5rem 0.6rem; color: var(--text-muted); font-size: 0.78rem;">No headings</div>') +
        '</nav>';
      }

      const metaContainer = document.querySelector('.article-meta');
      if (metaContainer) {
        metaContainer.innerHTML =
          '<span class="meta-tag"><strong>' + processed.stats.words.toLocaleString() + '</strong> words</span>' +
          '<span>·</span>' +
          '<span class="meta-tag"><strong>' + processed.stats.readTimeMin + '</strong> min read</span>';
      }

      const rawTextarea = document.getElementById('raw-editor-textarea');
      const rawCode = document.getElementById('raw-markdown-code');
      if (rawTextarea && rawTextarea.value !== markdown) {
        rawTextarea.value = markdown || '';
        if (rawCode) rawCode.textContent = markdown || '';
        if (typeof syncRawLineNumbersAndStats === 'function') syncRawLineNumbersAndStats();
      }

      renderEnhancements();
      if (typeof initScrollspy === 'function') initScrollspy();
    }

    // 1. Settings & Preference Engine
    const DEFAULT_SETTINGS = {
      theme: 'dark',
      fontFamily: 'sans',
      fontSize: 16,
      lineHeight: '1.65',
      contentWidth: 'standard',
      showProgressBar: true,
      outlineOpen: true,
      codeWrap: false,
      rawWrapDefault: false
    };

    let appSettings = Object.assign({}, DEFAULT_SETTINGS);

    // 1b. Theme Management
    const themes = ['dark', 'light', 'sepia'];
    function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      if (appSettings) appSettings.theme = theme;
      
      // Update Prism theme according to mode
      const prismLink = document.getElementById('prism-theme');
      if (prismLink) {
        if (theme === 'light' || theme === 'sepia') {
          prismLink.href = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css';
        } else {
          prismLink.href = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css';
        }
      }
      try {
        localStorage.setItem('md-visual-theme', theme);
      } catch (err) {}
    }

    function cycleTheme() {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = themes[(themes.indexOf(current) + 1) % themes.length];
      applyTheme(next);
      if (typeof updateSetting === 'function') {
        updateSetting('theme', next);
      }
    }

    function loadSettings() {
      try {
        const stored = localStorage.getItem('md-visual-settings');
        if (stored) {
          appSettings = Object.assign({}, DEFAULT_SETTINGS, JSON.parse(stored));
        } else {
          const legacyTheme = localStorage.getItem('md-visual-theme');
          if (legacyTheme) appSettings.theme = legacyTheme;
          const legacyWide = localStorage.getItem('md-visual-wide');
          if (legacyWide === 'true') appSettings.contentWidth = 'wide';
          const legacyRawWrap = localStorage.getItem('md-visual-raw-wrap');
          if (legacyRawWrap === 'true') appSettings.rawWrapDefault = true;
          const legacyOutline = localStorage.getItem('md-visual-outline');
          if (legacyOutline === 'collapsed') appSettings.outlineOpen = false;
        }
      } catch (e) {}
    }

    function applySettings(save = true) {
      // 1. Theme
      applyTheme(appSettings.theme);

      // 2. Font Family
      const fontFamilies = {
        sans: '"Satoshi", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        serif: 'Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif',
        mono: '"Geist Mono", ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace'
      };
      document.documentElement.style.setProperty('--font-body-family', fontFamilies[appSettings.fontFamily] || fontFamilies.sans);

      // 3. Font Size
      currentFontSize = parseInt(appSettings.fontSize, 10) || 16;
      document.documentElement.style.setProperty('--base-font-size', currentFontSize + 'px');

      // 4. Line Height
      document.documentElement.style.setProperty('--line-height-body', appSettings.lineHeight);

      // 5. Content Width
      const widths = {
        focused: '740px',
        standard: '860px',
        wide: '1200px',
        full: '100%'
      };
      const maxW = widths[appSettings.contentWidth] || '860px';
      document.documentElement.style.setProperty('--content-max', maxW);
      const isWide = appSettings.contentWidth === 'wide' || appSettings.contentWidth === 'full';
      document.body.classList.toggle('wide-mode', isWide);
      const wideBtn = document.getElementById('wide-btn');
      if (wideBtn) wideBtn.classList.toggle('active', isWide);

      // 6. Progress Bar
      const progressBar = document.getElementById('progress-bar');
      if (progressBar) {
        progressBar.style.display = appSettings.showProgressBar ? 'block' : 'none';
      }

      // 7. Outline
      if (!appSettings.outlineOpen && window.innerWidth > 1024) {
        document.body.classList.add('outline-collapsed');
        const tocBtn = document.getElementById('toc-toggle-btn');
        if (tocBtn) tocBtn.classList.remove('active');
      } else if (appSettings.outlineOpen && window.innerWidth > 1024) {
        document.body.classList.remove('outline-collapsed');
        const tocBtn = document.getElementById('toc-toggle-btn');
        if (tocBtn) tocBtn.classList.add('active');
      }

      // 8. Code Wrap
      document.body.classList.toggle('code-wrap-active', !!appSettings.codeWrap);

      // 9. Sync Controls in Settings Modal
      syncSettingsUI();

      if (save) {
        try {
          localStorage.setItem('md-visual-settings', JSON.stringify(appSettings));
          localStorage.setItem('md-visual-theme', appSettings.theme);
        } catch (e) {}
      }
    }

    function updateSetting(key, value) {
      appSettings[key] = value;
      applySettings(true);
    }

    function resetSettings() {
      appSettings = Object.assign({}, DEFAULT_SETTINGS);
      applySettings(true);
    }

    function syncSettingsUI() {
      const modal = document.getElementById('settings-modal');
      if (!modal) return;

      ['theme', 'fontFamily', 'fontSize', 'lineHeight', 'contentWidth'].forEach(prop => {
        const id = 'setting-' + (prop === 'fontFamily' ? 'font-family' : prop === 'fontSize' ? 'font-size' : prop === 'lineHeight' ? 'line-height' : prop === 'contentWidth' ? 'width' : prop) + '-control';
        const container = document.getElementById(id);
        if (container) {
          const val = String(appSettings[prop]);
          container.querySelectorAll('.segment-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-val') === val);
          });
        }
      });

      const sizeLabel = document.getElementById('setting-font-size-label');
      if (sizeLabel) sizeLabel.textContent = appSettings.fontSize + 'px';

      const progToggle = document.getElementById('setting-progress-toggle');
      if (progToggle) progToggle.checked = !!appSettings.showProgressBar;

      const outToggle = document.getElementById('setting-outline-toggle');
      if (outToggle) outToggle.checked = !!appSettings.outlineOpen;

      const codeWrapToggle = document.getElementById('setting-code-wrap-toggle');
      if (codeWrapToggle) codeWrapToggle.checked = !!appSettings.codeWrap;

      const rawWrapToggle = document.getElementById('setting-raw-wrap-toggle');
      if (rawWrapToggle) rawWrapToggle.checked = !!appSettings.rawWrapDefault;
    }

    function toggleSettingsModal(open) {
      const modal = document.getElementById('settings-modal');
      if (!modal) return;
      const isOpen = typeof open === 'boolean' ? open : !modal.classList.contains('open');
      modal.classList.toggle('open', isOpen);
      if (isOpen) {
        syncSettingsUI();
      }
    }

    // 2. Font Size Scaling
    let currentFontSize = 16;
    function adjustFont(delta) {
      currentFontSize = Math.min(22, Math.max(13, currentFontSize + delta));
      document.documentElement.style.setProperty('--base-font-size', currentFontSize + 'px');
      appSettings.fontSize = currentFontSize;
      syncSettingsUI();
      try {
        localStorage.setItem('md-visual-settings', JSON.stringify(appSettings));
      } catch (e) {}
    }
    function resetFont() {
      currentFontSize = 16;
      document.documentElement.style.setProperty('--base-font-size', '16px');
      appSettings.fontSize = 16;
      syncSettingsUI();
      try {
        localStorage.setItem('md-visual-settings', JSON.stringify(appSettings));
      } catch (e) {}
    }

    // Initialize Settings
    loadSettings();
    applySettings(false);

    // 3. Outline / Focus Mode Toggle (O / Z)
    function toggleZen(forceState) {
      toggleOutline(forceState);
    }

    // 3b. Wide View Toggle
    function toggleWide(forceState) {
      const willBeWide = typeof forceState === 'boolean'
        ? forceState
        : !document.body.classList.contains('wide-mode');

      document.body.classList.toggle('wide-mode', willBeWide);
      const btn = document.getElementById('wide-btn');
      if (btn) {
        btn.classList.toggle('active', willBeWide);
        btn.title = willBeWide ? 'Standard view (W)' : 'Wide view (W)';
        btn.setAttribute('aria-label', willBeWide ? 'Switch to standard view' : 'Switch to wide view');
      }
      try {
        if (willBeWide) {
          localStorage.setItem('md-visual-wide', 'true');
        } else {
          localStorage.removeItem('md-visual-wide');
        }
      } catch (err) {}
    }

    try {
      if (localStorage.getItem('md-visual-wide') === 'true') {
        toggleWide(true);
      }
    } catch (err) {}

    // 3b. Frictionless View vs Edit Anchor Synchronization (No Jumping Cursor)
    function getVisualScrollAnchor() {
      const headings = Array.from(document.querySelectorAll('.doc-heading[id]'));
      for (let i = headings.length - 1; i >= 0; i--) {
        const rect = headings[i].getBoundingClientRect();
        if (rect.top <= 140) {
          return { type: 'heading', id: headings[i].id, text: headings[i].innerText.replace(/^[#\s]+/, '').trim() };
        }
      }
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollRatio = totalHeight > 0 ? (window.scrollY / totalHeight) : 0;
      return { type: 'ratio', ratio: scrollRatio };
    }

    function scrollRawToAnchor(anchor) {
      const textarea = document.getElementById('raw-editor-textarea');
      if (!textarea) return;
      if (anchor && anchor.type === 'heading' && anchor.text) {
        const lines = textarea.value.split('\\n');
        const searchLower = anchor.text.toLowerCase();
        let targetLine = -1;
        let charOffset = 0;
        for (let i = 0; i < lines.length; i++) {
          const l = lines[i];
          if (/^#{1,6}\\s+/.test(l)) {
            const cleanTitle = l.replace(/^#{1,6}\\s+/, '').replace(/[*_~]/g, '').split(String.fromCharCode(96)).join('').trim().toLowerCase();
            if (cleanTitle.includes(searchLower) || searchLower.includes(cleanTitle)) {
              targetLine = i;
              break;
            }
          }
          charOffset += l.length + 1;
        }
        if (targetLine !== -1) {
          textarea.setSelectionRange(charOffset, charOffset);
          const lineEl = document.querySelector('.raw-line[data-line="' + (targetLine + 1) + '"]');
          if (lineEl) {
            textarea.scrollTop = Math.max(0, lineEl.offsetTop - 40);
          } else {
            textarea.scrollTop = Math.max(0, targetLine * 24 - 40);
          }
          return;
        }
      }
      if (anchor && typeof anchor.ratio === 'number') {
        const maxScroll = textarea.scrollHeight - textarea.clientHeight;
        textarea.scrollTop = Math.max(0, anchor.ratio * maxScroll);
      }
    }

    function getRawScrollAnchor() {
      const textarea = document.getElementById('raw-editor-textarea');
      if (!textarea) return { type: 'ratio', ratio: 0 };
      const text = textarea.value;
      const cursorPos = textarea.selectionStart || 0;
      const textBefore = text.substring(0, cursorPos);
      const cursorLine = textBefore.split('\\n').length - 1;
      const approxScrollLine = Math.floor(textarea.scrollTop / 24);
      const lines = text.split('\\n');

      for (let i = Math.max(cursorLine, approxScrollLine); i >= 0; i--) {
        const l = lines[i] || '';
        const match = l.match(/^#{1,6}\\s+(.+)$/);
        if (match) {
          const cleanTitle = match[1].replace(/[*_~]/g, '').split(String.fromCharCode(96)).join('').trim().toLowerCase();
          return { type: 'heading', title: cleanTitle };
        }
      }
      const maxScroll = textarea.scrollHeight - textarea.clientHeight;
      const scrollRatio = maxScroll > 0 ? (textarea.scrollTop / maxScroll) : 0;
      return { type: 'ratio', ratio: scrollRatio };
    }

    function scrollVisualToAnchor(anchor) {
      if (anchor && anchor.type === 'heading' && anchor.title) {
        const headings = Array.from(document.querySelectorAll('.doc-heading'));
        const search = anchor.title.toLowerCase();
        let target = headings.find(h => {
          const ht = h.innerText.replace(/^[#\\s]+/, '').replace(/[*_~]/g, '').split(String.fromCharCode(96)).join('').trim().toLowerCase();
          return ht.includes(search) || search.includes(ht);
        });
        if (target) {
          const targetY = target.getBoundingClientRect().top + window.pageYOffset - 85;
          window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
          return;
        }
      }
      if (anchor && typeof anchor.ratio === 'number') {
        const maxVisualScroll = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: Math.max(0, anchor.ratio * maxVisualScroll), behavior: 'smooth' });
      }
    }

    // 3c. View Mode Switcher (Visual vs Raw Markdown)
    function setViewMode(mode) {
      const isRaw = mode === 'raw';
      const wasRaw = document.body.classList.contains('raw-mode');

      const visualBtn = document.getElementById('view-visual-btn');
      const rawBtn = document.getElementById('view-raw-btn');
      const docContent = document.getElementById('doc-content');
      const visualMeta = document.getElementById('visual-meta');
      const rawView = document.getElementById('raw-view');
      const rawTextarea = document.getElementById('raw-editor-textarea');

      let visualAnchor = null;
      let rawAnchor = null;
      if (!wasRaw && isRaw) {
        visualAnchor = getVisualScrollAnchor();
      } else if (wasRaw && !isRaw) {
        rawAnchor = getRawScrollAnchor();
      }

      if (!wasRaw && isRaw && docContent && rawTextarea) {
        if (isDirty || isEditMode) {
          const md = cleanMarkdown(htmlToMarkdown(docContent));
          rawTextarea.value = md;
          syncRawLineNumbersAndStats();
        }
      }

      if (wasRaw && !isRaw && docContent && rawTextarea) {
        if (isDirty || isEditMode) {
          if (typeof renderMarkdownDocument === 'function') {
            const currentTitle = (window.__DOTMD_INITIAL_DATA__ && window.__DOTMD_INITIAL_DATA__.filename) || (document.getElementById('app-doc-title') ? document.getElementById('app-doc-title').textContent : '');
            renderMarkdownDocument(rawTextarea.value, currentTitle);
          } else if (typeof clientProcessMarkdown === 'function') {
            const processed = clientProcessMarkdown(rawTextarea.value);
            docContent.innerHTML = processed.html;
            renderEnhancements();
          }
        }
      }

      document.body.classList.toggle('raw-mode', isRaw);

      if (visualBtn) {
        visualBtn.classList.toggle('active', !isRaw);
        visualBtn.setAttribute('aria-selected', !isRaw ? 'true' : 'false');
      }
      if (rawBtn) {
        rawBtn.classList.toggle('active', isRaw);
        rawBtn.setAttribute('aria-selected', isRaw ? 'true' : 'false');
      }

      if (docContent) docContent.style.display = isRaw ? 'none' : 'block';
      if (visualMeta) visualMeta.style.display = isRaw ? 'none' : 'flex';
      if (rawView) rawView.style.display = isRaw ? 'block' : 'none';

      if (isRaw) {
        requestAnimationFrame(() => {
          syncRawLineHeights();
          if (visualAnchor) scrollRawToAnchor(visualAnchor);
        });
      } else {
        requestAnimationFrame(() => {
          if (rawAnchor) scrollVisualToAnchor(rawAnchor);
        });
      }

      try {
        localStorage.setItem('md-visual-view', mode);
      } catch (err) {}
    }

    function toggleViewMode() {
      const isCurrentlyRaw = document.body.classList.contains('raw-mode');
      setViewMode(isCurrentlyRaw ? 'visual' : 'raw');
    }

    try {
      if (localStorage.getItem('md-visual-view') === 'raw') {
        setViewMode('raw');
      }
    } catch (err) {}

    function copyRawMarkdown(btn) {
      const rawCode = document.getElementById('raw-markdown-code');
      if (!rawCode) return;
      const lines = Array.from(rawCode.querySelectorAll('.raw-line')).map(el => el.textContent);
      const text = lines.length ? lines.join('\\n') : rawCode.textContent;
      navigator.clipboard.writeText(text).then(() => {
        btn.classList.add('copied');
        btn.innerHTML = \`${ICONS.check} <span>Copied!</span>\`;
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = \`${ICONS.copy} <span>Copy Raw</span>\`;
        }, 1800);
      });
    }

    function syncRawLineHeights() {
      const container = document.getElementById('raw-view');
      if (!container) return;
      const gutterSpans = container.querySelectorAll('.raw-line-numbers span');
      const codeLines = container.querySelectorAll('.raw-editor-pre .raw-line');
      if (!gutterSpans.length || gutterSpans.length !== codeLines.length) return;

      const isWrap = container.classList.contains('wrap-mode');
      if (!isWrap) {
        gutterSpans.forEach(s => { s.style.height = ''; });
        return;
      }

      for (let i = 0; i < codeLines.length; i++) {
        const h = codeLines[i].offsetHeight;
        gutterSpans[i].style.height = h + 'px';
      }
    }

    function toggleRawWrap() {
      const container = document.getElementById('raw-view');
      const label = document.getElementById('raw-wrap-label');
      const btn = document.getElementById('raw-wrap-btn');
      if (!container) return;
      const isWrap = container.classList.toggle('wrap-mode');
      if (label) label.textContent = isWrap ? 'Wrap: On' : 'Wrap: Off';
      if (btn) btn.classList.toggle('active', isWrap);
      syncRawLineHeights();
      try {
        localStorage.setItem('md-visual-raw-wrap', isWrap ? 'true' : 'false');
      } catch (err) {}
    }

    try {
      if (localStorage.getItem('md-visual-raw-wrap') === 'true') {
        const container = document.getElementById('raw-view');
        const label = document.getElementById('raw-wrap-label');
        const btn = document.getElementById('raw-wrap-btn');
        if (container) container.classList.add('wrap-mode');
        if (label) label.textContent = 'Wrap: On';
        if (btn) btn.classList.add('active');
        requestAnimationFrame(syncRawLineHeights);
      }
    } catch (err) {}

    window.addEventListener('resize', () => {
      if (document.body.classList.contains('raw-mode')) {
        syncRawLineHeights();
      }
    });

    function downloadRawMarkdown() {
      const rawCode = document.getElementById('raw-markdown-code');
      if (!rawCode) return;
      const lines = Array.from(rawCode.querySelectorAll('.raw-line')).map(el => el.textContent);
      const content = lines.length ? lines.join('\\n') : rawCode.textContent;
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '${rawDownloadFilename.replace(/'/g, "\\'")}';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    }

    // 3d. Editor Engine (In-Place Visual & Raw Editing, Formatting, History, Persistence)
    let isEditMode = false;
    let isDirty = false;
    let historyStack = [];
    let historyIndex = -1;
    const MAX_HISTORY = 60;
    let isHistoryAction = false;
    let historyDebounceTimer = null;

    function cleanMarkdown(md) {
      return (md || '').replace(/\\n{3,}/g, '\\n\\n').trim() + '\\n';
    }

    function htmlToMarkdown(node) {
      if (!node) return '';
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return '';
      }

      if (node.classList && (
        node.classList.contains('code-header') ||
        node.classList.contains('diagram-toolbar') ||
        node.classList.contains('mobile-toc-overlay') ||
        node.classList.contains('diagram-viewport')
      )) {
        return '';
      }

      const tag = node.tagName.toLowerCase();

      if (node.classList && node.classList.contains('frontmatter-card')) {
        const rawAttr = node.getAttribute('data-raw-frontmatter');
        if (rawAttr) {
          try {
            const decoded = decodeURIComponent(rawAttr).trim();
            if (decoded) {
              return '---\\n' + decoded + '\\n---\\n\\n';
            }
          } catch (e) {}
        }
        const rows = Array.from(node.querySelectorAll('.frontmatter-row'));
        if (!rows.length) return '';
        const lines = rows.map(r => {
          const keyEl = r.querySelector('.frontmatter-key');
          const key = keyEl ? keyEl.innerText.trim() : '';
          const tags = Array.from(r.querySelectorAll('.frontmatter-tag')).map(t => t.innerText.trim());
          if (tags.length) {
            return key + ': [' + tags.join(', ') + ']';
          }
          const valEl = r.querySelector('.frontmatter-val');
          const val = valEl ? valEl.innerText.trim() : '';
          return key + ': ' + val;
        });
        return '---\\n' + lines.join('\\n') + '\\n---\\n\\n';
      }

      if (node.classList && node.classList.contains('mermaid-container')) {
        const src = node.getAttribute('data-mermaid-src') || (node.querySelector('pre.mermaid') ? node.querySelector('pre.mermaid').textContent : '');
        return '\\n\\n\`\`\`mermaid\\n' + src.trim() + '\\n\`\`\`\\n\\n';
      }

      if (node.classList && node.classList.contains('math-block')) {
        const formula = node.getAttribute('data-formula') || node.textContent.trim();
        return '\\n\\n$$\\n' + formula + '\\n$$\\n\\n';
      }

      if (tag === 'pre') {
        const codeEl = node.querySelector('code');
        const langClass = (codeEl ? codeEl.className : node.className) || '';
        const match = langClass.match(/language-(\\w+)/);
        const lang = match ? match[1] : '';
        const codeText = codeEl ? codeEl.innerText : node.innerText;
        return '\\n\\n\`\`\`' + lang + '\\n' + codeText.replace(/\\n$/, '') + '\\n\`\`\`\\n\\n';
      }

      if (tag === 'table') {
        const rows = Array.from(node.querySelectorAll('tr'));
        if (!rows.length) return '';
        let res = '\\n\\n';
        const headers = Array.from(rows[0].querySelectorAll('th, td'));
        if (headers.length) {
          res += '| ' + headers.map(c => c.innerText.trim()).join(' | ') + ' |\\n';
          res += '| ' + headers.map(() => '---').join(' | ') + ' |\\n';
        }
        for (let i = (rows[0].querySelector('th') ? 1 : 0); i < rows.length; i++) {
          const cells = Array.from(rows[i].querySelectorAll('td'));
          res += '| ' + cells.map(c => c.innerText.trim()).join(' | ') + ' |\\n';
        }
        return '\\n\\n' + (typeof formatMarkdownTableText === 'function' ? formatMarkdownTableText(res.trim()) : res.trim()) + '\\n\\n';
      }

      const childMd = Array.from(node.childNodes).map(htmlToMarkdown).join('');

      switch (tag) {
        case 'h1': return '\\n\\n# ' + childMd.trim() + '\\n\\n';
        case 'h2': return '\\n\\n## ' + childMd.trim() + '\\n\\n';
        case 'h3': return '\\n\\n### ' + childMd.trim() + '\\n\\n';
        case 'h4': return '\\n\\n#### ' + childMd.trim() + '\\n\\n';
        case 'h5': return '\\n\\n##### ' + childMd.trim() + '\\n\\n';
        case 'h6': return '\\n\\n###### ' + childMd.trim() + '\\n\\n';
        case 'p': return '\\n\\n' + childMd.trim() + '\\n\\n';
        case 'strong':
        case 'b': return '**' + childMd + '**';
        case 'em':
        case 'i': return '*' + childMd + '*';
        case 's':
        case 'del':
        case 'strike': return '~~' + childMd + '~~';
        case 'code':
          return '\`' + childMd + '\`';
        case 'blockquote': {
          const lines = childMd.trim().split('\\n');
          return '\\n\\n' + lines.map(l => '> ' + l).join('\\n') + '\\n\\n';
        }
        case 'ul': {
          const items = Array.from(node.children)
            .filter(c => c.tagName.toLowerCase() === 'li')
            .map(li => {
              const chk = li.querySelector('input[type="checkbox"]');
              if (chk) {
                const checked = chk.checked ? '[x]' : '[ ]';
                const text = Array.from(li.childNodes).filter(n => n !== chk).map(htmlToMarkdown).join('').trim();
                return '- ' + checked + ' ' + text;
              }
              return '- ' + Array.from(li.childNodes).map(htmlToMarkdown).join('').trim();
            });
          return '\\n\\n' + items.join('\\n') + '\\n\\n';
        }
        case 'ol': {
          let idx = 1;
          const items = Array.from(node.children)
            .filter(c => c.tagName.toLowerCase() === 'li')
            .map(li => (idx++) + '. ' + Array.from(li.childNodes).map(htmlToMarkdown).join('').trim());
          return '\\n\\n' + items.join('\\n') + '\\n\\n';
        }
        case 'hr': return '\\n\\n---\\n\\n';
        case 'a': {
          const href = node.getAttribute('href') || '';
          return '[' + childMd + '](' + href + ')';
        }
        case 'img': {
          const alt = node.getAttribute('alt') || '';
          const src = node.getAttribute('src') || '';
          return '![' + alt + '](' + src + ')';
        }
        case 'br': return '\\n';
        default:
          return childMd;
      }
    }

    function getCurrentMarkdown() {
      const isRaw = document.body.classList.contains('raw-mode');
      const rawTextarea = document.getElementById('raw-editor-textarea');
      const docContent = document.getElementById('doc-content');
      if (isRaw && rawTextarea) {
        return rawTextarea.value;
      }
      if (!isRaw && docContent) {
        return cleanMarkdown(htmlToMarkdown(docContent));
      }
      return rawTextarea ? rawTextarea.value : '';
    }

    function pushHistory(force = false) {
      if (isHistoryAction) return;
      const rawTextarea = document.getElementById('raw-editor-textarea');
      const docContent = document.getElementById('doc-content');
      const isRaw = document.body.classList.contains('raw-mode');

      const snapshot = {
        isRaw,
        rawText: rawTextarea ? rawTextarea.value : '',
        visualHtml: docContent ? docContent.innerHTML : '',
        timestamp: Date.now()
      };

      if (!force && historyIndex >= 0 && historyStack[historyIndex]) {
        const prev = historyStack[historyIndex];
        if (prev.rawText === snapshot.rawText && prev.visualHtml === snapshot.visualHtml) {
          return;
        }
      }

      historyStack = historyStack.slice(0, historyIndex + 1);
      historyStack.push(snapshot);
      if (historyStack.length > MAX_HISTORY) {
        historyStack.shift();
      } else {
        historyIndex++;
      }
      updateHistoryButtons();
      markUnsaved();
    }

    function debouncedPushHistory() {
      if (historyDebounceTimer) clearTimeout(historyDebounceTimer);
      historyDebounceTimer = setTimeout(() => {
        pushHistory(false);
      }, 450);
    }

    function updateHistoryButtons() {
      const undoBtn = document.getElementById('tool-undo');
      const redoBtn = document.getElementById('tool-redo');
      if (undoBtn) undoBtn.disabled = historyIndex <= 0;
      if (redoBtn) redoBtn.disabled = historyIndex >= historyStack.length - 1;
    }

    function editorUndo() {
      if (historyIndex <= 0) return;
      isHistoryAction = true;
      historyIndex--;
      restoreHistorySnapshot(historyStack[historyIndex]);
      isHistoryAction = false;
      updateHistoryButtons();
      markUnsaved();
    }

    function editorRedo() {
      if (historyIndex >= historyStack.length - 1) return;
      isHistoryAction = true;
      historyIndex++;
      restoreHistorySnapshot(historyStack[historyIndex]);
      isHistoryAction = false;
      updateHistoryButtons();
      markUnsaved();
    }

    function restoreHistorySnapshot(snapshot) {
      if (!snapshot) return;
      const rawTextarea = document.getElementById('raw-editor-textarea');
      const docContent = document.getElementById('doc-content');
      if (rawTextarea && snapshot.rawText !== undefined) {
        rawTextarea.value = snapshot.rawText;
        syncRawLineNumbersAndStats();
      }
      if (docContent && snapshot.visualHtml !== undefined) {
        docContent.innerHTML = snapshot.visualHtml;
        renderEnhancements();
      }
    }

    function setSaveStatus(status) {
      const pill = document.getElementById('save-status-pill');
      if (!pill) return;
      pill.className = 'save-status-pill ' + status;
      const textEl = pill.querySelector('.status-text');
      if (textEl) {
        if (status === 'saved') {
          textEl.textContent = 'Saved';
          pill.title = 'Saved to disk';
        } else if (status === 'unsaved') {
          textEl.textContent = 'Save (Ctrl+S)';
          pill.title = 'Click to save (Ctrl+S)';
        } else if (status === 'saving') {
          textEl.textContent = 'Saving...';
          pill.title = 'Saving document...';
        } else if (status === 'error') {
          textEl.textContent = 'Save Error';
          pill.title = 'Error saving document';
        }
      }
    }

    function markUnsaved() {
      if (!isDirty) {
        isDirty = true;
        setSaveStatus('unsaved');
      }
    }

    function toggleEditMode(forceState) {
      const willBeEdit = typeof forceState === 'boolean'
        ? forceState
        : !isEditMode;
      isEditMode = willBeEdit;

      document.body.classList.toggle('edit-mode', willBeEdit);
      const editBtn = document.getElementById('toggle-edit-btn');
      const docContent = document.getElementById('doc-content');
      const label = document.getElementById('edit-mode-label');

      if (editBtn) {
        editBtn.classList.toggle('active', willBeEdit);
        editBtn.title = willBeEdit ? 'Exit Edit Mode (Ctrl+E)' : 'Edit Mode (Ctrl+E)';
      }
      if (label) {
        label.textContent = willBeEdit ? 'Editing' : 'Edit';
      }

      if (docContent) {
        docContent.setAttribute('contenteditable', willBeEdit ? 'true' : 'false');
        docContent.setAttribute('spellcheck', willBeEdit ? 'true' : 'false');
        if (willBeEdit && !document.body.classList.contains('raw-mode')) {
          docContent.focus();
        }
      }

      const rawTextarea = document.getElementById('raw-editor-textarea');
      if (willBeEdit && document.body.classList.contains('raw-mode') && rawTextarea) {
        rawTextarea.focus();
      }

      if (willBeEdit && historyStack.length === 0) {
        pushHistory(true);
      }
    }

    // Floating Toast Notification System
    let toastTimeout = null;
    function showToast(message, iconSvg) {
      const toast = document.getElementById('app-toast');
      const msgEl = document.getElementById('toast-message');
      const iconEl = document.getElementById('toast-icon');
      if (!toast || !msgEl) return;

      msgEl.textContent = message;
      if (iconEl) {
        iconEl.innerHTML = iconSvg || CLIENT_ICONS.logo || '';
      }

      toast.classList.add('visible');
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toast.classList.remove('visible');
      }, 2600);
    }

    // Markdown ASCII Table Formatter & Auto-Aligner
    function formatMarkdownTableText(tableText) {
      if (!tableText || !tableText.includes('|')) return tableText;
      const rawLines = tableText.trim().split('\\n');
      const tableLines = rawLines.filter(l => l.includes('|'));
      if (tableLines.length < 2) return tableText;

      const parsedRows = tableLines.map(line => {
        let content = line.trim();
        if (content.startsWith('|')) content = content.substring(1);
        if (content.endsWith('|')) content = content.substring(0, content.length - 1);
        return content.split('|').map(c => c.trim());
      });

      let numCols = 0;
      parsedRows.forEach(row => {
        if (row.length > numCols) numCols = row.length;
      });
      if (numCols === 0) return tableText;

      const alignments = [];
      const delimRow = parsedRows[1] || [];
      for (let c = 0; c < numCols; c++) {
        const cell = (delimRow[c] || '').trim();
        const startColon = cell.startsWith(':');
        const endColon = cell.endsWith(':');
        if (startColon && endColon) {
          alignments.push('center');
        } else if (endColon) {
          alignments.push('right');
        } else {
          alignments.push('left');
        }
      }

      const colWidths = new Array(numCols).fill(3);
      for (let r = 0; r < parsedRows.length; r++) {
        if (r === 1) continue;
        const row = parsedRows[r];
        for (let c = 0; c < numCols; c++) {
          const val = row[c] || '';
          if (val.length > colWidths[c]) {
            colWidths[c] = val.length;
          }
        }
      }

      const formattedLines = parsedRows.map((row, rIdx) => {
        if (rIdx === 1) {
          const delimCells = [];
          for (let c = 0; c < numCols; c++) {
            const w = colWidths[c];
            const align = alignments[c];
            if (align === 'center') {
              delimCells.push(':' + '-'.repeat(Math.max(1, w - 2)) + ':');
            } else if (align === 'right') {
              delimCells.push('-'.repeat(Math.max(2, w - 1)) + ':');
            } else {
              delimCells.push(':' + '-'.repeat(Math.max(2, w - 1)));
            }
          }
          return '| ' + delimCells.join(' | ') + ' |';
        } else {
          const dataCells = [];
          for (let c = 0; c < numCols; c++) {
            const val = row[c] || '';
            const w = colWidths[c];
            const align = alignments[c];
            if (align === 'right') {
              dataCells.push(val.padStart(w, ' '));
            } else if (align === 'center') {
              const diff = Math.max(0, w - val.length);
              const padLeft = Math.floor(diff / 2);
              const padRight = diff - padLeft;
              dataCells.push(' '.repeat(padLeft) + val + ' '.repeat(padRight));
            } else {
              dataCells.push(val.padEnd(w, ' '));
            }
          }
          return '| ' + dataCells.join(' | ') + ' |';
        }
      });

      return formattedLines.join('\\n');
    }

    function formatCurrentTable() {
      const isRaw = document.body.classList.contains('raw-mode');
      const textarea = document.getElementById('raw-editor-textarea');

      if (isRaw && textarea) {
        const val = textarea.value;
        const selStart = textarea.selectionStart;
        const selEnd = textarea.selectionEnd;
        const selected = val.substring(selStart, selEnd);

        if (selected && selected.includes('|')) {
          const formatted = formatMarkdownTableText(selected);
          textarea.setRangeText(formatted, selStart, selEnd, 'select');
          syncRawLineNumbersAndStats();
          pushHistory();
          showToast('Table columns aligned');
          return;
        }

        const lines = val.split('\\n');
        let charCount = 0;
        let lineIdx = 0;
        for (let i = 0; i < lines.length; i++) {
          const lineLen = lines[i].length + 1;
          if (charCount + lineLen > selStart) {
            lineIdx = i;
            break;
          }
          charCount += lineLen;
        }

        if (!lines[lineIdx] || !lines[lineIdx].includes('|')) {
          showToast('Place cursor inside a Markdown table to align');
          return;
        }

        let startLine = lineIdx;
        while (startLine > 0 && lines[startLine - 1].includes('|')) {
          startLine--;
        }
        let endLine = lineIdx;
        while (endLine < lines.length - 1 && lines[endLine + 1].includes('|')) {
          endLine++;
        }

        const tableText = lines.slice(startLine, endLine + 1).join('\\n');
        const formatted = formatMarkdownTableText(tableText);
        lines.splice(startLine, endLine - startLine + 1, formatted);
        textarea.value = lines.join('\\n');
        syncRawLineNumbersAndStats();
        pushHistory();
        showToast('Table columns aligned');
      } else {
        const docContent = document.getElementById('doc-content');
        if (!docContent) return;
        const sel = window.getSelection();
        let tableEl = null;
        if (sel && sel.anchorNode) {
          let node = sel.anchorNode;
          while (node && node !== docContent) {
            if (node.nodeName === 'TABLE') {
              tableEl = node;
              break;
            }
            node = node.parentNode;
          }
        }
        if (!tableEl) {
          const allTables = docContent.querySelectorAll('table');
          if (allTables.length === 1) tableEl = allTables[0];
        }
        if (tableEl) {
          showToast('Visual table columns are balanced');
        } else {
          showToast('Place cursor inside a table to align');
        }
      }
    }

    function toggleTableModal(show) {
      const modal = document.getElementById('table-modal');
      if (!modal) return;
      const willShow = typeof show === 'boolean' ? show : !modal.classList.contains('open');
      modal.classList.toggle('open', willShow);
      if (willShow) {
        const input = document.getElementById('table-input-cols');
        if (input) setTimeout(() => input.focus(), 60);
      }
    }

    function confirmInsertTable() {
      const colsInput = document.getElementById('table-input-cols');
      const rowsInput = document.getElementById('table-input-rows');
      const alignSelect = document.getElementById('table-input-align');

      const cols = Math.min(Math.max(parseInt(colsInput ? colsInput.value : 3, 10) || 3, 1), 20);
      const rows = Math.min(Math.max(parseInt(rowsInput ? rowsInput.value : 3, 10) || 3, 1), 50);
      const align = alignSelect ? alignSelect.value : 'left';

      toggleTableModal(false);

      if (!isEditMode) {
        toggleEditMode(true);
      }

      const isRaw = document.body.classList.contains('raw-mode');
      if (isRaw) {
        const headers = [];
        const separators = [];
        const sepStr = align === 'center' ? ':---:' : align === 'right' ? '---:' : '---';
        for (let c = 1; c <= cols; c++) {
          headers.push('Header ' + c);
          separators.push(sepStr);
        }
        const rowLines = [];
        for (let r = 1; r <= rows; r++) {
          const cells = [];
          for (let c = 1; c <= cols; c++) {
            cells.push('Cell ' + r + '-' + c);
          }
          rowLines.push('| ' + cells.join(' | ') + ' |');
        }
        const rawTable = '\\n| ' + headers.join(' | ') + ' |\\n| ' + separators.join(' | ') + ' |\\n' + rowLines.join('\\n') + '\\n\\n';
        const alignedTable = formatMarkdownTableText(rawTable);

        const textarea = document.getElementById('raw-editor-textarea');
        if (textarea) {
          textarea.focus();
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          textarea.setRangeText(alignedTable, start, end, 'select');
          textarea.setSelectionRange(start + alignedTable.length, start + alignedTable.length);
          syncRawLineNumbersAndStats();
          pushHistory();
        }
      } else {
        let thead = '<thead><tr>';
        for (let c = 1; c <= cols; c++) {
          thead += '<th style="text-align:' + align + ';">Header ' + c + '</th>';
        }
        thead += '</tr></thead>';

        let tbody = '<tbody>';
        for (let r = 1; r <= rows; r++) {
          tbody += '<tr>';
          for (let c = 1; c <= cols; c++) {
            tbody += '<td style="text-align:' + align + ';">Cell ' + r + '-' + c + '</td>';
          }
          tbody += '</tr>';
        }
        tbody += '</tbody>';

        const tableHtml = '<div class="table-container"><table>' + thead + tbody + '</table></div><p><br></p>';
        document.execCommand('insertHTML', false, tableHtml);
        pushHistory();
      }
      showToast('Table inserted (' + cols + '×' + rows + ')');
    }

    // Clipboard Image Pasting (Base64 Inline Data URIs)
    function handleImagePaste(e) {
      if (!isEditMode) return;
      const clipboardData = e.clipboardData || window.clipboardData;
      if (!clipboardData || !clipboardData.items) return;

      let imageItem = null;
      for (let i = 0; i < clipboardData.items.length; i++) {
        const item = clipboardData.items[i];
        if (item.type && item.type.indexOf('image') !== -1) {
          imageItem = item;
          break;
        }
      }

      if (!imageItem) return;

      const file = imageItem.getAsFile();
      if (!file) return;

      e.preventDefault();

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target.result;
        const isRaw = document.body.classList.contains('raw-mode');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const altText = 'Pasted Image ' + timestamp;

        if (isRaw) {
          const textarea = document.getElementById('raw-editor-textarea');
          if (textarea) {
            const mdImage = '\\n![' + altText + '](' + base64Data + ')\\n';
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            textarea.setRangeText(mdImage, start, end, 'select');
            textarea.setSelectionRange(start + mdImage.length, start + mdImage.length);
            syncRawLineNumbersAndStats();
            pushHistory();
          }
        } else {
          const imgHtml = '<p><img src="' + base64Data + '" alt="' + altText + '" /></p>';
          document.execCommand('insertHTML', false, imgHtml);
          pushHistory();
        }

        showToast('Image embedded as portable Base64');
      };
      reader.readAsDataURL(file);
    }

    function applyFormat(type) {
      if (type === 'table') {
        toggleTableModal(true);
        return;
      }
      if (!isEditMode) {
        toggleEditMode(true);
      }
      const isRaw = document.body.classList.contains('raw-mode');
      if (isRaw) {
        applyRawFormat(type);
      } else {
        applyVisualFormat(type);
      }
    }

    function applyRawFormat(type) {
      const textarea = document.getElementById('raw-editor-textarea');
      if (!textarea) return;
      textarea.focus();

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      const selected = val.substring(start, end);

      let replacement = '';
      let cursorOffset = 0;

      switch (type) {
        case 'bold':
          replacement = '**' + (selected || 'bold text') + '**';
          cursorOffset = selected ? replacement.length : 2;
          break;
        case 'italic':
          replacement = '*' + (selected || 'italic text') + '*';
          cursorOffset = selected ? replacement.length : 1;
          break;
        case 'strike':
          replacement = '~~' + (selected || 'strikethrough text') + '~~';
          cursorOffset = selected ? replacement.length : 2;
          break;
        case 'code':
          if (selected.includes('\\n')) {
            replacement = '\`\`\`\\n' + selected + '\\n\`\`\`';
            cursorOffset = replacement.length;
          } else {
            replacement = '\`' + (selected || 'code') + '\`';
            cursorOffset = selected ? replacement.length : 1;
          }
          break;
        case 'h1':
        case 'h2':
        case 'h3': {
          const prefix = type === 'h1' ? '# ' : type === 'h2' ? '## ' : '### ';
          const lineStart = val.lastIndexOf('\\n', start - 1) + 1;
          const currentLine = val.substring(lineStart, end);
          const cleaned = currentLine.replace(/^#{1,6}\\s*/, '');
          textarea.setSelectionRange(lineStart, end);
          document.execCommand('insertText', false, prefix + cleaned);
          syncRawLineNumbersAndStats();
          pushHistory();
          return;
        }
        case 'list': {
          const lines = (selected || 'List item').split('\\n');
          replacement = lines.map(l => l.startsWith('- ') ? l.substring(2) : '- ' + l).join('\\n');
          break;
        }
        case 'numberList': {
          const lines = (selected || 'List item').split('\\n');
          let num = 1;
          replacement = lines.map(l => {
            const cleaned = l.replace(/^\\d+\\.\\s*/, '');
            return (num++) + '. ' + cleaned;
          }).join('\\n');
          break;
        }
        case 'task': {
          const lines = (selected || 'Task item').split('\\n');
          replacement = lines.map(l => l.startsWith('- [ ] ') ? l.substring(6) : '- [ ] ' + l).join('\\n');
          break;
        }
        case 'quote': {
          const lines = (selected || 'Quote text').split('\\n');
          replacement = lines.map(l => l.startsWith('> ') ? l.substring(2) : '> ' + l).join('\\n');
          break;
        }
        case 'link': {
          const url = prompt('Enter URL:', 'https://') || 'https://';
          replacement = '[' + (selected || 'link text') + '](' + url + ')';
          cursorOffset = replacement.length;
          break;
        }
        case 'table':
          replacement = '\\n| Column 1 | Column 2 | Column 3 |\\n| -------- | -------- | -------- |\\n| Item 1   | Value A  | Details  |\\n| Item 2   | Value B  | Details  |\\n\\n';
          cursorOffset = replacement.length;
          break;
        case 'rule':
          replacement = '\\n---\\n\\n';
          cursorOffset = replacement.length;
          break;
      }

      if (replacement) {
        textarea.setRangeText(replacement, start, end, 'select');
        textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
        syncRawLineNumbersAndStats();
        pushHistory();
      }
    }

    function applyVisualFormat(type) {
      const docContent = document.getElementById('doc-content');
      if (!docContent) return;
      docContent.focus();

      switch (type) {
        case 'bold':
          document.execCommand('bold', false, null);
          break;
        case 'italic':
          document.execCommand('italic', false, null);
          break;
        case 'strike':
          document.execCommand('strikeThrough', false, null);
          break;
        case 'h1':
          document.execCommand('formatBlock', false, '<h1>');
          break;
        case 'h2':
          document.execCommand('formatBlock', false, '<h2>');
          break;
        case 'h3':
          document.execCommand('formatBlock', false, '<h3>');
          break;
        case 'list':
          document.execCommand('insertUnorderedList', false, null);
          break;
        case 'numberList':
          document.execCommand('insertOrderedList', false, null);
          break;
        case 'quote':
          document.execCommand('formatBlock', false, '<blockquote>');
          break;
        case 'code': {
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            const code = document.createElement('code');
            code.textContent = range.toString() || 'code';
            range.deleteContents();
            range.insertNode(code);
          }
          break;
        }
        case 'task': {
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            const p = document.createElement('p');
            p.innerHTML = '<input type="checkbox"> Task item';
            range.insertNode(p);
          }
          break;
        }
        case 'link': {
          const url = prompt('Enter URL:', 'https://') || 'https://';
          document.execCommand('createLink', false, url);
          break;
        }
        case 'table': {
          const tableHtml = '<div class="table-container"><table><thead><tr><th>Header 1</th><th>Header 2</th></tr></thead><tbody><tr><td>Cell 1</td><td>Cell 2</td></tr></tbody></table></div>';
          document.execCommand('insertHTML', false, tableHtml);
          break;
        }
        case 'rule':
          document.execCommand('insertHorizontalRule', false, null);
          break;
      }
      pushHistory();
    }

    async function saveDocument() {
      const saveBtn = document.getElementById('save-status-pill');
      setSaveStatus('saving');
      if (saveBtn) saveBtn.disabled = true;

      const currentMarkdown = getCurrentMarkdown();

      // 1. Tauri v2 IPC direct save (Pure Native Rust Host)
      if (window.__TAURI__ && window.__TAURI__.core && typeof window.__TAURI__.core.invoke === 'function') {
        try {
          const targetPath = (window.__DOTMD_INITIAL_DATA__ && window.__DOTMD_INITIAL_DATA__.filePath) || '';
          await window.__TAURI__.core.invoke('save_document', { filePath: targetPath, markdown: currentMarkdown });
          setSaveStatus('saved');
          isDirty = false;
          if (typeof showToast === 'function') showToast('Saved changes to disk');
          const rawTextarea = document.getElementById('raw-editor-textarea');
          const rawCode = document.getElementById('raw-markdown-code');
          if (rawTextarea && rawTextarea.value !== currentMarkdown) {
            rawTextarea.value = currentMarkdown;
          }
          if (rawCode) {
            rawCode.textContent = currentMarkdown;
          }
          if (saveBtn) saveBtn.disabled = false;
          return;
        } catch (tauriErr) {
          console.error('Tauri IPC save failed, trying fallback:', tauriErr);
        }
      }


      ${isLive ? `
      try {
        const res = await fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ markdown: currentMarkdown })
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          setSaveStatus('saved');
          isDirty = false;
          const rawTextarea = document.getElementById('raw-editor-textarea');
          const rawCode = document.getElementById('raw-markdown-code');
          if (rawTextarea && rawTextarea.value !== currentMarkdown) {
            rawTextarea.value = currentMarkdown;
          }
          if (rawCode) {
            rawCode.textContent = currentMarkdown;
          }
        } else {
          setSaveStatus('unsaved');
          alert('Save failed: ' + (data.error || 'Server error'));
        }
      } catch (err) {
        setSaveStatus('unsaved');
        console.error('Save error:', err);
        alert('Failed to connect to server to save changes.');
      } finally {
        if (saveBtn) saveBtn.disabled = false;
      }
      ` : `
      try {
        const blob = new Blob([currentMarkdown], { type: 'text/markdown;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = '${rawDownloadFilename.replace(/'/g, "\\'")}';
        a.click();
        URL.revokeObjectURL(a.href);
        setSaveStatus('saved');
        isDirty = false;
      } catch (err) {
        setSaveStatus('unsaved');
      } finally {
        if (saveBtn) saveBtn.disabled = false;
      }
      `}
    }

    function syncRawLineNumbersAndStats() {
      const textarea = document.getElementById('raw-editor-textarea');
      const gutter = document.getElementById('raw-line-numbers');
      const rawCode = document.getElementById('raw-markdown-code');
      if (!textarea) return;

      const text = textarea.value;
      if (rawCode) rawCode.textContent = text;

      const lines = text.split('\\n');
      const lineCount = lines.length;

      if (gutter) {
        gutter.innerHTML = '<span></span>'.repeat(lineCount);
      }

      const words = (text.match(/\\S+/g) || []).length;
      const chars = text.length;
      const statsEl = document.querySelector('.raw-stats');
      if (statsEl) {
        const bytes = new Blob([text]).size;
        const sizeStr = bytes < 1024 ? bytes + ' B' : (bytes / 1024).toFixed(1) + ' KB';
        statsEl.innerHTML = '<span><strong>' + lineCount + '</strong> lines</span>' +
          '<span class="stat-sep">·</span>' +
          '<span><strong>' + sizeStr + '</strong></span>' +
          '<span class="stat-sep stat-secondary">·</span>' +
          '<span class="stat-secondary"><strong>' + words.toLocaleString() + '</strong> words</span>' +
          '<span class="stat-sep stat-secondary">·</span>' +
          '<span class="stat-secondary"><strong>' + chars.toLocaleString() + '</strong> chars</span>';
      }
    }

    // Wire input listeners for live change tracking
    const rawEditorTextareaEl = document.getElementById('raw-editor-textarea');
    const docContentEl = document.getElementById('doc-content');

    if (rawEditorTextareaEl) {
      rawEditorTextareaEl.addEventListener('input', () => {
        syncRawLineNumbersAndStats();
        markUnsaved();
        debouncedPushHistory();
      });
      const gutterEl = document.getElementById('raw-line-numbers');
      if (gutterEl) {
        rawEditorTextareaEl.addEventListener('scroll', () => {
          gutterEl.scrollTop = rawEditorTextareaEl.scrollTop;
        }, { passive: true });
      }
    }

    if (docContentEl) {
      docContentEl.addEventListener('input', () => {
        markUnsaved();
        debouncedPushHistory();
      });
    }

    // 4. Modal
    function toggleModal(open) {
      const modal = document.getElementById('shortcut-modal');
      modal.classList.toggle('open', open);
    }

    // 5. Code Copying
    function copyCode(btn) {
      const pre = btn.closest('.code-block').querySelector('pre code');
      if (!pre) return;
      navigator.clipboard.writeText(pre.innerText).then(() => {
        btn.classList.add('copied');
        const span = btn.querySelector('span');
        const originalText = span.innerText;
        span.innerText = 'Copied';
        btn.innerHTML = \`${ICONS.check} <span>Copied</span>\`;
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = \`${ICONS.copy} <span>Copy</span>\`;
        }, 1800);
      });
    }

    // 5b. Heading Link Copying
    function copyHeadingLink(el, slug) {
      const url = window.location.origin + window.location.pathname + '#' + slug;
      navigator.clipboard.writeText(url).then(() => {
        const prev = el.innerText;
        el.innerText = '✓';
        el.classList.add('copied');
        history.pushState(null, null, '#' + slug);
        setTimeout(() => {
          el.innerText = prev;
          el.classList.remove('copied');
        }, 1500);
      });
    }

    // 5c. Universal Outline Sidebar Toggle (Desktop & Mobile)
    function toggleMobileToc(open) {
      const sidebar = document.getElementById('toc-sidebar');
      const overlay = document.getElementById('mobile-toc-overlay');
      if (!sidebar || !overlay) return;
      const isOpen = typeof open === 'boolean' ? open : !sidebar.classList.contains('mobile-open');
      sidebar.classList.toggle('mobile-open', isOpen);
      overlay.classList.toggle('open', isOpen);
    }

    function toggleOutline(force) {
      if (window.innerWidth <= 1024) {
        toggleMobileToc(force);
      } else {
        const sidebar = document.getElementById('toc-sidebar');
        if (!sidebar) return;
        const willCollapse = typeof force === 'boolean' ? !force : !document.body.classList.contains('outline-collapsed');
        document.body.classList.toggle('outline-collapsed', willCollapse);
        const btn = document.getElementById('toc-toggle-btn');
        if (btn) btn.classList.toggle('active', !willCollapse);
        try {
          localStorage.setItem('md-visual-outline', willCollapse ? 'collapsed' : 'open');
        } catch (err) {}
      }
    }

    try {
      if (localStorage.getItem('md-visual-outline') === 'collapsed' && window.innerWidth > 1024) {
        document.body.classList.add('outline-collapsed');
        const btn = document.getElementById('toc-toggle-btn');
        if (btn) btn.classList.remove('active');
      }
    } catch (err) {}

    // Instant outline activation and smooth click handling
    let isClickScrolling = false;
    let clickScrollTimer = null;

    document.addEventListener('click', (e) => {
      const tocLink = e.target.closest('.toc-item');
      if (!tocLink) return;

      const slug = tocLink.dataset.slug;
      if (slug) {
        document.querySelectorAll('.toc-item').forEach(item => {
          item.classList.toggle('active', item.dataset.slug === slug);
        });
        isClickScrolling = true;
        clearTimeout(clickScrollTimer);
        clickScrollTimer = setTimeout(() => {
          isClickScrolling = false;
        }, 850);
      }

      if (window.innerWidth <= 1024) {
        toggleMobileToc(false);
      }
    });

    // 6. Standalone File Downloader
    function downloadStandalone() {
      const clone = document.documentElement.cloneNode(true);
      // Remove live dot indicator for static export
      const dot = clone.querySelector('.live-dot');
      if (dot) dot.remove();
      const blob = new Blob([clone.outerHTML], { type: 'text/html;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = '${filename.replace(/\.md$/i, '')}.html';
      a.click();
      URL.revokeObjectURL(a.href);
    }

    // 7. MathJax & Mermaid Rendering
    function renderEnhancements() {
      // Render KaTeX
      if (window.renderMathInElement) {
        renderMathInElement(document.getElementById('doc-content'), {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false
        });
      }

      // Render Mermaid
      if (window.mermaid) {
        mermaid.initialize({
          startOnLoad: false,
          theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'neutral',
          fontFamily: 'var(--font-display)'
        });
        mermaid.run({
          nodes: document.querySelectorAll('.mermaid')
        }).then(() => {
          initDiagramPanZoom();
        }).catch(() => {
          // mermaid.run may not return a promise in older builds; fall back
          setTimeout(initDiagramPanZoom, 400);
        });
      }

      // Trigger Prism
      if (window.Prism) {
        Prism.highlightAll();
      }
    }

    // 7b. Pan & Zoom for Mermaid diagrams
    function initDiagramPanZoom() {
      document.querySelectorAll('.mermaid-container').forEach(container => {
        // Idempotent — skip if already set up
        if (container.dataset.panzoom) return;
        container.dataset.panzoom = '1';

        const pre = container.querySelector('.mermaid');
        if (!pre) return;
        const svg = pre.querySelector('svg');
        if (!svg) return;

        // Ensure svg is not width-constrained by mermaid's inline styles
        svg.removeAttribute('height');
        svg.style.maxWidth = '100%';

        // Scaffold: container > .diagram-toolbar + .diagram-viewport > .diagram-canvas > svg
        const viewport = document.createElement('div');
        viewport.className = 'diagram-viewport';

        const canvas = document.createElement('div');
        canvas.className = 'diagram-canvas';

        // Move svg into canvas, move canvas into viewport
        pre.parentNode.insertBefore(viewport, pre);
        canvas.appendChild(svg);
        viewport.appendChild(canvas);
        // Hide the now-empty pre so it doesn't take space
        pre.style.display = 'none';

        // Toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'diagram-toolbar';

        const btnIn = document.createElement('button');
        btnIn.className = 'diagram-tool-btn';
        btnIn.title = 'Zoom in (+)';
        btnIn.textContent = '+';
        btnIn.onclick = () => container._pz.zoom(0.25);

        const badge = document.createElement('span');
        badge.className = 'diagram-zoom-badge';
        badge.textContent = '100%';

        const btnOut = document.createElement('button');
        btnOut.className = 'diagram-tool-btn';
        btnOut.title = 'Zoom out (−)';
        btnOut.textContent = '−';
        btnOut.onclick = () => container._pz.zoom(-0.25);

        const btnReset = document.createElement('button');
        btnReset.className = 'diagram-tool-btn';
        btnReset.title = 'Reset view';
        btnReset.style.fontSize = '0.8rem';
        btnReset.textContent = '⟳';
        btnReset.onclick = () => container._pz.reset();

        toolbar.appendChild(btnIn);
        toolbar.appendChild(badge);
        toolbar.appendChild(btnOut);
        toolbar.appendChild(btnReset);
        container.appendChild(toolbar);

        // State
        let scale = 1, tx = 0, ty = 0;
        let dragging = false, startX = 0, startY = 0, startTx = 0, startTy = 0;
        const MIN = 0.25, MAX = 8;

        function apply() {
          canvas.style.transform = 'translate(' + tx + 'px, ' + ty + 'px) scale(' + scale + ')';
          badge.textContent = Math.round(scale * 100) + '%';
        }

        function clampScale(s) {
          return Math.min(MAX, Math.max(MIN, s));
        }

        // Expose on container node for external control
        container._pz = {
          zoom(delta) {
            scale = clampScale(scale + delta);
            apply();
          },
          reset() {
            scale = 1; tx = 0; ty = 0;
            apply();
          }
        };

        // Wheel zoom (centered on cursor)
        viewport.addEventListener('wheel', e => {
          e.preventDefault();
          const rect = viewport.getBoundingClientRect();
          const ox = e.clientX - rect.left - rect.width / 2;
          const oy = e.clientY - rect.top - rect.height / 2;
          const delta = e.deltaY < 0 ? 0.12 : -0.12;
          const prev = scale;
          scale = clampScale(scale + delta * scale);
          // Adjust translation so the cursor point stays fixed
          const factor = scale / prev;
          tx = ox - factor * (ox - tx);
          ty = oy - factor * (oy - ty);
          apply();
        }, { passive: false });

        // Pointer drag (mouse + touch)
        viewport.addEventListener('pointerdown', e => {
          if (e.button !== undefined && e.button !== 0) return;
          dragging = true;
          viewport.classList.add('dragging');
          viewport.setPointerCapture(e.pointerId);
          startX = e.clientX; startY = e.clientY;
          startTx = tx; startTy = ty;
        });

        viewport.addEventListener('pointermove', e => {
          if (!dragging) return;
          tx = startTx + (e.clientX - startX);
          ty = startTy + (e.clientY - startY);
          apply();
        });

        viewport.addEventListener('pointerup', () => {
          dragging = false;
          viewport.classList.remove('dragging');
        });

        viewport.addEventListener('pointercancel', () => {
          dragging = false;
          viewport.classList.remove('dragging');
        });

        // Double-click to reset
        viewport.addEventListener('dblclick', () => container._pz.reset());

        apply();
      });
    }

    window.addEventListener('DOMContentLoaded', () => {
      renderEnhancements();
    });

    // 8. Reading Progress Bar
    window.addEventListener('scroll', () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      document.getElementById('progress-bar').style.width = scrolled + '%';
    });

    // 8b. Scrollspy via IntersectionObserver & scroll telemetry — reliable & smooth
    let scrollspyObserver = null;
    let scrollspyScrollHandler = null;

    function initScrollspy() {
      const tocItems = document.querySelectorAll('.toc-item');
      if (!tocItems.length) return;

      let currentActiveSlug = null;

      function setActive(slug) {
        if (!slug || slug === currentActiveSlug) return;
        currentActiveSlug = slug;

        tocItems.forEach(item => {
          item.classList.toggle('active', item.dataset.slug === slug);
        });

        // Safely adjust internal scroll of sidebar without affecting window scroll
        const activeEl = document.querySelector('.toc-item.active');
        const sidebar = document.getElementById('toc-sidebar');
        if (activeEl && sidebar && !isClickScrolling && !document.body.classList.contains('zen-mode') && !document.body.classList.contains('outline-collapsed')) {
          const sidebarRect = sidebar.getBoundingClientRect();
          const itemRect = activeEl.getBoundingClientRect();
          if (itemRect.top < sidebarRect.top + 30) {
            sidebar.scrollTop -= (sidebarRect.top + 30 - itemRect.top);
          } else if (itemRect.bottom > sidebarRect.bottom - 20) {
            sidebar.scrollTop += (itemRect.bottom - sidebarRect.bottom + 20);
          }
        }
      }

      // Track headings in DOM order; header offset matches scroll-padding-top (76px) + margin
      const HEADER_H = 82;
      const headings = Array.from(document.querySelectorAll('.doc-heading[id]'));
      if (!headings.length) return;

      function syncFromScroll() {
        if (isClickScrolling) return;

        // Bottom of document edge case: activate the last heading
        const isAtBottom = (window.innerHeight + window.pageYOffset) >= (document.documentElement.scrollHeight - 25);
        if (isAtBottom) {
          setActive(headings[headings.length - 1].id);
          return;
        }

        let active = null;
        for (const h of headings) {
          if (h.getBoundingClientRect().top <= HEADER_H) {
            active = h.id;
          }
        }
        setActive(active || headings[0].id);
      }

      syncFromScroll();

      if (scrollspyObserver) {
        scrollspyObserver.disconnect();
      }

      scrollspyObserver = new IntersectionObserver(
        () => {
          syncFromScroll();
        },
        {
          rootMargin: '-' + HEADER_H + 'px 0px -55% 0px',
          threshold: 0,
        }
      );

      headings.forEach(h => scrollspyObserver.observe(h));

      if (scrollspyScrollHandler) {
        window.removeEventListener('scroll', scrollspyScrollHandler);
      }

      let rafPending = false;
      scrollspyScrollHandler = () => {
        if (!rafPending) {
          rafPending = true;
          requestAnimationFrame(() => {
            syncFromScroll();
            rafPending = false;
          });
        }
      };
      window.addEventListener('scroll', scrollspyScrollHandler, { passive: true });
    }

    // 8c. In-Page Quick Find & Highlight Engine
    let searchMatches = [];
    let searchMatchIndex = -1;

    function clearSearchHighlights() {
      const marks = document.querySelectorAll('mark.search-match');
      marks.forEach(mark => {
        const parent = mark.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(mark.textContent), mark);
          parent.normalize();
        }
      });
      searchMatches = [];
      searchMatchIndex = -1;
      const countBadge = document.getElementById('search-count-badge');
      if (countBadge) countBadge.textContent = '0/0';
    }

    function executeSearch(query) {
      clearSearchHighlights();
      if (!query || query.length < 1) return;

      const isRaw = document.body.classList.contains('raw-mode');
      if (isRaw) {
        const textarea = document.getElementById('raw-editor-textarea');
        if (!textarea) return;
        const tLower = text.toLowerCase();
        const qLower = query.toLowerCase();
        let idx = tLower.indexOf(qLower);
        const rawMatches = [];
        while (idx !== -1) {
          rawMatches.push({ index: idx, length: query.length });
          idx = tLower.indexOf(qLower, idx + query.length);
        }
        searchMatches = rawMatches;
        const countBadge = document.getElementById('search-count-badge');
        if (countBadge) countBadge.textContent = searchMatches.length ? ('1/' + searchMatches.length) : '0/0';
        if (searchMatches.length) {
          searchMatchIndex = 0;
          textarea.focus();
          textarea.setSelectionRange(searchMatches[0].index, searchMatches[0].index + searchMatches[0].length);
          const linesBefore = text.substring(0, searchMatches[0].index).split('\\n').length - 1;
          textarea.scrollTop = Math.max(0, linesBefore * 24 - 60);
        }
        return;
      }

      const docContent = document.getElementById('doc-content');
      if (!docContent) return;

      const walker = document.createTreeWalker(
        docContent,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            const tag = parent.tagName.toLowerCase();
            if (tag === 'script' || tag === 'style' || tag === 'svg' || parent.classList.contains('code-header') || parent.classList.contains('diagram-toolbar')) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      const textNodes = [];
      while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
      }

      const qLower = query.toLowerCase();
      textNodes.forEach(node => {
        const text = node.textContent;
        const tLower = text.toLowerCase();
        let idx = tLower.indexOf(qLower);
        if (idx === -1) return;

        const frag = document.createDocumentFragment();
        let lastIdx = 0;
        while (idx !== -1) {
          if (idx > lastIdx) {
            frag.appendChild(document.createTextNode(text.substring(lastIdx, idx)));
          }
          const mark = document.createElement('mark');
          mark.className = 'search-match';
          mark.textContent = text.substring(idx, idx + query.length);
          frag.appendChild(mark);
          searchMatches.push(mark);
          lastIdx = idx + query.length;
          idx = tLower.indexOf(qLower, lastIdx);
        }
        if (lastIdx < text.length) {
          frag.appendChild(document.createTextNode(text.substring(lastIdx)));
        }
        if (node.parentNode) {
          node.parentNode.replaceChild(frag, node);
        }
      });

      const countBadge = document.getElementById('search-count-badge');
      if (countBadge) {
        countBadge.textContent = searchMatches.length ? ('1/' + searchMatches.length) : '0/0';
      }

      if (searchMatches.length) {
        searchMatchIndex = 0;
        searchMatches[0].classList.add('active');
        searchMatches[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    function searchNavigate(direction) {
      if (!searchMatches.length) return;
      const isRaw = document.body.classList.contains('raw-mode');
      if (isRaw) {
        const textarea = document.getElementById('raw-editor-textarea');
        if (!textarea) return;
        searchMatchIndex = (searchMatchIndex + direction + searchMatches.length) % searchMatches.length;
        const m = searchMatches[searchMatchIndex];
        textarea.focus();
        textarea.setSelectionRange(m.index, m.index + m.length);
        const linesBefore = textarea.value.substring(0, m.index).split('\\n').length - 1;
        textarea.scrollTop = Math.max(0, linesBefore * 24 - 60);
        const countBadge = document.getElementById('search-count-badge');
        if (countBadge) countBadge.textContent = (searchMatchIndex + 1) + '/' + searchMatches.length;
        return;
      }

      if (searchMatchIndex >= 0 && searchMatches[searchMatchIndex]) {
        searchMatches[searchMatchIndex].classList.remove('active');
      }
      searchMatchIndex = (searchMatchIndex + direction + searchMatches.length) % searchMatches.length;
      const cur = searchMatches[searchMatchIndex];
      cur.classList.add('active');
      cur.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const countBadge = document.getElementById('search-count-badge');
      if (countBadge) countBadge.textContent = (searchMatchIndex + 1) + '/' + searchMatches.length;
    }

    function toggleSearch(force) {
      const bar = document.getElementById('doc-search-bar');
      const input = document.getElementById('doc-search-input');
      if (!bar) return;
      const isOpen = typeof force === 'boolean' ? force : !bar.classList.contains('open');
      bar.classList.toggle('open', isOpen);
      const btn = document.getElementById('search-toggle-btn');
      if (btn) btn.classList.toggle('active', isOpen);
      if (isOpen) {
        setTimeout(() => {
          if (input) {
            input.focus();
            input.select();
            if (input.value) executeSearch(input.value);
          }
        }, 60);
      } else {
        clearSearchHighlights();
      }
    }

    // Connect search input events
    const searchInputEl = document.getElementById('doc-search-input');
    if (searchInputEl) {
      searchInputEl.addEventListener('input', () => {
        executeSearch(searchInputEl.value);
      });
      searchInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          searchNavigate(e.shiftKey ? -1 : 1);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          toggleSearch(false);
        }
      });
    }

    // 9. Global Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // Search shortcut (Ctrl+F / Cmd+F)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        toggleSearch();
        return;
      }

      // Save shortcut (Ctrl+S / Cmd+S)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        saveDocument();
        return;
      }

      // Toggle edit mode (Ctrl+E / Cmd+E)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        toggleEditMode();
        return;
      }

      // In-editor formatting and history shortcuts
      if (isEditMode) {
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
          e.preventDefault();
          editorUndo();
          return;
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y' || (e.shiftKey && (e.key === 'z' || e.key === 'Z')))) {
          e.preventDefault();
          editorRedo();
          return;
        }
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 't' || e.key === 'T')) {
          e.preventDefault();
          formatCurrentTable();
          return;
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
          e.preventDefault();
          applyFormat('bold');
          return;
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'i' || e.key === 'I')) {
          e.preventDefault();
          applyFormat('italic');
          return;
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
          e.preventDefault();
          applyFormat('link');
          return;
        }
      }

      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      if (e.key === '/') {
        e.preventDefault();
        toggleSearch(true);
        return;
      }
      if (e.key === 't' || e.key === 'T') cycleTheme();
      if (e.key === 'z' || e.key === 'Z') toggleZen();
      if (e.key === 'o' || e.key === 'O') toggleOutline();
      if (e.key === 'w' || e.key === 'W') toggleWide();
      if (e.key === 'r' || e.key === 'R') toggleViewMode();
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        triggerPrint();
        return;
      }
      if (e.key === 'p' || e.key === 'P') {
        triggerPrint();
        return;
      }
      if ((e.key === 's' || e.key === 'S' || e.key === ',') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        const settingsModal = document.getElementById('settings-modal');
        const isOpen = settingsModal && settingsModal.classList.contains('open');
        toggleSettingsModal(!isOpen);
      }
      if (e.key === '?') toggleModal(true);
      if (e.key === 'Escape') {
        const searchBar = document.getElementById('doc-search-bar');
        if (searchBar && searchBar.classList.contains('open')) {
          toggleSearch(false);
          return;
        }
        const tblModal = document.getElementById('table-modal');
        if (tblModal && tblModal.classList.contains('open')) {
          toggleTableModal(false);
          return;
        }
        const setModal = document.getElementById('settings-modal');
        if (setModal && setModal.classList.contains('open')) {
          toggleSettingsModal(false);
          return;
        }
        const modal = document.getElementById('shortcut-modal');
        if (modal && modal.classList.contains('open')) {
          toggleModal(false);
        } else if (document.body.classList.contains('zen-mode')) {
          toggleZen(false);
        }
      }
    });

    // 9b. Clipboard Paste Listener (Self-contained image embedding)
    document.addEventListener('paste', handleImagePaste);

    // 9c. Interactive GFM Task List Checkboxes
    function handleTaskCheckboxToggle(checkbox) {
      const allCheckboxes = Array.from(document.querySelectorAll('#doc-content .task-checkbox'));
      const taskIndex = allCheckboxes.indexOf(checkbox);
      if (taskIndex === -1) return;

      let md = '';
      const textarea = document.getElementById('raw-editor-textarea');
      if (textarea && textarea.value) {
        md = textarea.value;
      } else if (window.__DOTMD_INITIAL_DATA__ && window.__DOTMD_INITIAL_DATA__.markdown) {
        md = window.__DOTMD_INITIAL_DATA__.markdown;
      }

      if (!md) return;

      const taskRegex = /^(\\s*[-*+]|\\s*\\d+\\.)\\s+\\[([ xX])\\]/gm;
      let currentIdx = 0;
      let replaced = false;

      const newMd = md.replace(taskRegex, function (match, prefix, checkState) {
        if (currentIdx === taskIndex && !replaced) {
          replaced = true;
          currentIdx++;
          const newState = checkbox.checked ? 'x' : ' ';
          return prefix + ' [' + newState + ']';
        }
        currentIdx++;
        return match;
      });

      if (replaced) {
        if (textarea) textarea.value = newMd;
        if (window.__DOTMD_INITIAL_DATA__) window.__DOTMD_INITIAL_DATA__.markdown = newMd;
        saveDocument();
        const statusText = checkbox.checked ? 'Task marked complete' : 'Task marked pending';
        if (typeof showToast === 'function') {
          showToast(statusText, 'check');
        }
      }
    }

    document.addEventListener('change', function (e) {
      if (e.target && e.target.classList.contains('task-checkbox')) {
        handleTaskCheckboxToggle(e.target);
      }
    });

    // 10. Universal Print Trigger & Lifecycle
    function triggerPrint() {
      // Close open modals and overlays before printing
      toggleModal(false);
      toggleSettingsModal(false);
      toggleTableModal(false);
      toggleMobileToc(false);
      toggleSearch(false);

      window.print();
    }

    window.addEventListener('beforeprint', () => {
      toggleModal(false);
      toggleSettingsModal(false);
      toggleTableModal(false);
      toggleMobileToc(false);
      toggleSearch(false);
    });

    ${isLive ? `
    // 10. Live Reload via Server-Sent Events (SSE)
    const eventSource = new EventSource('/events');
    eventSource.onmessage = (event) => {
      if (event.data === 'reload') {
        if (isDirty || isEditMode) {
          console.log('[live-reload] Editor active or unsaved changes present, skipping SSE overwrite.');
          return;
        }
        fetch(window.location.href)
          .then(res => res.text())
          .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newContent = doc.getElementById('doc-content');
            const newToc = doc.getElementById('toc-sidebar');
            const newMeta = doc.querySelector('.article-meta');

            if (newContent) document.getElementById('doc-content').innerHTML = newContent.innerHTML;
            if (newToc) document.getElementById('toc-sidebar').innerHTML = newToc.innerHTML;
            if (newMeta) document.querySelector('.article-meta').innerHTML = newMeta.innerHTML;

            renderEnhancements();
          })
          .catch(() => window.location.reload());
      }
    };
    eventSource.onerror = () => {
      console.log('SSE connection interrupted, retrying...');
    };
    ` : ''}

    // 11. Tauri v2 IPC Bridge & Event Listener (Rust Host)
    if (window.__TAURI__) {
      if (window.__TAURI__.core && typeof window.__TAURI__.core.invoke === 'function') {
        window.__TAURI__.core.invoke('get_initial_document')
          .then(doc => {
            if (doc && doc.markdown) {
              window.__DOTMD_INITIAL_DATA__ = {
                filename: doc.filename,
                filePath: doc.file_path,
                markdown: doc.markdown
              };
              if (typeof renderMarkdownDocument === 'function') {
                renderMarkdownDocument(doc.markdown, doc.filename);
              }
            }
          })
          .catch(err => console.log('Tauri initial load error:', err));
      }

      if (window.__TAURI__.event && typeof window.__TAURI__.event.listen === 'function') {
        window.__TAURI__.event.listen('md-file-updated', (event) => {
          if (isDirty || isEditMode) {
            console.log('[live-reload] Editor active or unsaved changes present, skipping Tauri reload.');
            return;
          }
          const payload = event.payload;
          if (payload && payload.markdown && typeof renderMarkdownDocument === 'function') {
            renderMarkdownDocument(payload.markdown, payload.filename);
          }
        });
      }
    }

    // 12. Check for initial document payload injected by native host
    function checkInitialRender() {
      if (window.__DOTMD_INITIAL_DATA__ && window.__DOTMD_INITIAL_DATA__.markdown) {
        if (typeof renderMarkdownDocument === 'function') {
          renderMarkdownDocument(window.__DOTMD_INITIAL_DATA__.markdown, window.__DOTMD_INITIAL_DATA__.filename);
        }
      }
    }
    checkInitialRender();
    window.addEventListener('DOMContentLoaded', checkInitialRender);
    window.addEventListener('load', checkInitialRender);
  </script>
</body>
</html>`;
}

module.exports = {
  renderTemplate,
  processMarkdown,
  formatMarkdownTableText,
  extractFrontmatter,
  renderFrontmatterHtml,
};
