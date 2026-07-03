export function placeholderImage(bg: string, fg: string, label: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="533">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${bg}" />
        <stop offset="1" stop-color="${fg}" />
      </linearGradient>
    </defs>
    <rect width="800" height="533" fill="url(#g)" />
    <circle cx="620" cy="140" r="70" fill="${fg}" opacity="0.5" />
    <text x="50%" y="52%" font-family="system-ui, sans-serif" font-size="42" fill="white" text-anchor="middle" opacity="0.85">${label}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
