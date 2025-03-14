// Function to generate a random hex color
export const generateRandomHex = (): string => {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0')}`;
};

// Function to generate a set of 5 random colors
export const generateRandomPalette = (): string[] => {
  return Array.from({ length: 5 }, () => generateRandomHex());
};

// Function to generate a more harmonious color palette
export const generateHarmoniousPalette = (): string[] => {
  // Start with a random base hue (0-360)
  const baseHue = Math.floor(Math.random() * 360);

  // Generate palette with some variation in hue, saturation and lightness
  return [
    hslToHex(baseHue, 60 + Math.random() * 20, 20 + Math.random() * 20), // Darker shade
    hslToHex(
      (baseHue + 30) % 360,
      55 + Math.random() * 20,
      30 + Math.random() * 20,
    ), // Dark medium shade
    hslToHex(
      (baseHue + 60) % 360,
      50 + Math.random() * 25,
      45 + Math.random() * 15,
    ), // Medium shade
    hslToHex(
      (baseHue + 90) % 360,
      50 + Math.random() * 25,
      60 + Math.random() * 20,
    ), // Light medium shade
    hslToHex(
      (baseHue + 120) % 360,
      45 + Math.random() * 25,
      70 + Math.random() * 15,
    ), // Lightest shade
  ];
};

// Function to convert HSL to Hex
export const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

// Function to convert hex to RGB
export const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return 'Invalid hex color';
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgb(${r}, ${g}, ${b})`;
};

// Function to convert hex to HSL
export const hexToHsl = (hex: string): string => {
  // First convert hex to RGB
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return 'Invalid hex color';

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h = Math.round(h * 60);
  }

  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `hsl(${h}, ${s}%, ${l}%)`;
};

// Check if a color is light or dark
export const isLightColor = (hexColor: string): boolean => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate the perceived brightness using the luminance formula
  // https://www.w3.org/TR/AERT/#color-contrast
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 128;
};

// Array of predefined nice-looking palettes
export const predefinedPalettes: string[][] = [
  ['#173F5F', '#20639B', '#3CAEA3', '#F6D55C', '#ED553B'], // Example from the image
  ['#F9F7F7', '#DBE2EF', '#3F72AF', '#112D4E', '#FFA500'],
  ['#16213E', '#0F3460', '#533483', '#E94560', '#F5F5F5'],
  ['#5D8BF4', '#2B4865', '#256D85', '#5E8B7E', '#A7D2CB'],
  ['#FAF3F0', '#D4E2D4', '#FFCACC', '#DBC4F0', '#1D1A39'],
  ['#000000', '#14213D', '#FCA311', '#E5E5E5', '#FFFFFF'],
  ['#383E56', '#F69E7B', '#EEDAD1', '#D4B5B0', '#7C7C7C'],
  ['#4C3A51', '#774360', '#B25068', '#E7AB79', '#FBC687'],
  ['#011627', '#FDFFFC', '#2EC4B6', '#E71D36', '#FF9F1C'],
  ['#00B8A9', '#F8F3D4', '#F6416C', '#FFDE7D', '#3EC1D3'],
  ['#2D4059', '#EA5455', '#F07B3F', '#FFD460', '#FBEAEB'],
  ['#2C3333', '#2E4F4F', '#0E8388', '#CBE4DE', '#FFA500'],
  ['#1A1A2E', '#16213E', '#0F3460', '#E94560', '#F5F5F5'],
  ['#F4F9F9', '#CCF2F4', '#A4EBF3', '#AAAAAA', '#000000'],
  ['#FFF8E1', '#FFE0B2', '#FFB74D', '#FF9800', '#E65100'],
];

// Get a random palette from the predefined list
export const getRandomPredefinedPalette = (): string[] => {
  const randomIndex = Math.floor(Math.random() * predefinedPalettes.length);
  return predefinedPalettes[randomIndex];
};

// Generate a palette (with 30% chance of predefined, 70% chance of harmonious)
export const generatePalette = (): string[] => {
  const random = Math.random();
  if (random < 0.3) {
    return getRandomPredefinedPalette();
  } else {
    return generateHarmoniousPalette();
  }
};
