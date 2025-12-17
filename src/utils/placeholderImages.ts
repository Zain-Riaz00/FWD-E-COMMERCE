// Generate SVG placeholder images with colors
export function generatePlaceholderImage(seed: string, color: string = '#3B82F6'): string {
  const svg = `
    <svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad-${seed}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0.4" />
        </linearGradient>
      </defs>
      <rect width="800" height="800" fill="url(#grad-${seed})"/>
      <circle cx="400" cy="400" r="200" fill="white" opacity="0.1"/>
      <text x="400" y="420" font-family="Arial" font-size="48" fill="white" opacity="0.7" text-anchor="middle">${seed}</text>
    </svg>
  `.trim()
  
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

// Color-specific placeholders
export const placeholderImages = {
  black: generatePlaceholderImage('Black', '#1F2937'),
  white: generatePlaceholderImage('White', '#F3F4F6'),
  blue: generatePlaceholderImage('Blue', '#3B82F6'),
  red: generatePlaceholderImage('Red', '#EF4444'),
  green: generatePlaceholderImage('Green', '#10B981'),
  cyan: generatePlaceholderImage('Cyan', '#06B6D4'),
  purple: generatePlaceholderImage('Purple', '#8B5CF6'),
  yellow: generatePlaceholderImage('Yellow', '#F59E0B'),
}

// Generate product placeholder
export function getProductPlaceholder(id: number | string): string {
  const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4']
  const color = colors[Number(id) % colors.length]
  return generatePlaceholderImage(`Product ${id}`, color)
}
