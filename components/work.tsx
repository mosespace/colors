'use client';

import React, { useState, useMemo } from 'react';
import {
  Copy,
  Check,
  Terminal,
  Zap,
  Hash,
  MoveRight,
  Layers,
  Box,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  color: string;
}

const ColorSpecPage = ({ color }: Props) => {
  const [copied, setCopied] = useState<string | null>(null);
  const baseHex = color;
  const router = useRouter();
  // Mathematical Shade Generator (Logic-based 50-950 scale)
  const generatePalette = (hex: string) => {
    const weights = [
      0.95, 0.9, 0.75, 0.6, 0.4, 0, -0.2, -0.4, -0.6, -0.8, -0.9,
    ];
    const levels = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

    const hexToRgb = (h: string) => {
      const r = parseInt(h.slice(1, 3), 16);
      const g = parseInt(h.slice(3, 5), 16);
      const b = parseInt(h.slice(5, 7), 16);
      return { r, g, b };
    };

    const rgbToHex = (r: number, g: number, b: number) =>
      `#${[r, g, b]
        .map((x) =>
          Math.round(Math.min(255, Math.max(0, x)))
            .toString(16)
            .padStart(2, '0'),
        )
        .join('')}`;

    const { r, g, b } = hexToRgb(hex);

    return levels.map((level, i) => {
      const w = weights[i];
      const newR = w > 0 ? r + (255 - r) * w : r + r * w;
      const newG = w > 0 ? g + (255 - g) * w : g + g * w;
      const newB = w > 0 ? b + (255 - b) * w : b + b * w;
      const currentHex = rgbToHex(newR, newG, newB).toUpperCase();

      // Calculate Luminance for contrast switching
      const luminance = (0.299 * newR + 0.587 * newG + 0.114 * newB) / 255;

      return { level, hex: currentHex, isDark: luminance < 0.5 };
    });
  };

  const palette = useMemo(() => generatePalette(baseHex), [baseHex]);

  const copy = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(val);
    setTimeout(() => setCopied(null), 2000);
  };

  const exports = useMemo(() => {
    return {
      cssVars: `:root {
${palette.map((p) => `  --primary-${p.level}: ${p.hex};`).join('\n')}
}`,

      tailwind: `colors: {
  primary: {
${palette.map((p) => `    ${p.level}: '${p.hex}',`).join('\n')}
  }
}`,

      json: JSON.stringify(
        {
          primary: Object.fromEntries(palette.map((p) => [p.level, p.hex])),
        },
        null,
        2,
      ),

      scss: `$primary: (
${palette.map((p) => `  ${p.level}: ${p.hex},`).join('\n')}
);`,
    };
  }, [palette]);

  return (
    <div className="min-h-screen bg-[#000] text-[#FFF] font-mono p-0 m-0 overflow-x-hidden selection:bg-white selection:text-black">
      {/* 01. TOP HUD */}
      <nav className="flex items-center justify-between border-b border-zinc-800 p-4 sticky top-0 bg-black z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 animate-pulse" />
            <span className="text-xs font-black tracking-[0.2em]">
              ENGINE_V2
            </span>
          </div>
          <div className="h-4 w-[1px] bg-zinc-800" />
          <span className="text-xs text-zinc-500 uppercase">
            System / Assets / <span className="text-white">{baseHex}</span>
          </span>
        </div>
        <div className="text-[10px] text-zinc-500 hidden md:block uppercase tracking-widest">
          Ref: {Math.random().toString(36).substring(7).toUpperCase()}
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-zinc-800">
        {/* 02. MAIN PREVIEW PANEL */}
        <section className="lg:col-span-7 border-r border-zinc-800 p-8 lg:p-16 flex flex-col justify-between min-h-[60vh]">
          <div>
            <div
              className="flex items-center gap-2 mb-8 group cursor-pointer"
              onClick={() => router.back()}
            >
              <span className="text-[10px] bg-white text-black px-2 py-0.5 font-bold">
                BASE_HEX
              </span>
              <MoveRight
                size={14}
                className="text-zinc-600 group-hover:translate-x-1 transition-transform"
              />
            </div>
            <h1 className="text-[12vw] leading-[0.85] font-black tracking-tighter uppercase break-all">
              {baseHex}
            </h1>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-zinc-800">
            {[
              { label: 'RGB', val: '255, 166, 0' },
              { label: 'HSL', val: '39, 100, 50' },
              { label: 'CMYK', val: '0, 35, 100, 0' },
              { label: 'LUM', val: '64.2%' },
            ].map((d) => (
              <div key={d.label}>
                <p className="text-[10px] text-zinc-500 mb-1">{d.label}</p>
                <p className="text-sm font-bold tracking-tight">{d.val}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 03. INTERACTIVE SHADE SCANNER */}
        <section className="lg:col-span-5 flex flex-col">
          {palette.map((s) => (
            <button
              key={s.level}
              onClick={() => copy(s.hex)}
              className="group relative flex-1 min-h-[60px] flex items-center justify-between px-8 border-b border-zinc-800 transition-all hover:pl-12"
              style={{ backgroundColor: s.hex }}
            >
              <div
                className={`flex items-center gap-8 ${s.isDark ? 'text-white' : 'text-black'}`}
              >
                <span className="text-xs font-black w-8 opacity-50">
                  {s.level}
                </span>
                <span className="text-lg font-bold tracking-tighter uppercase">
                  {s.hex}
                </span>
              </div>

              <div
                className={`flex items-center bg-white/10 px-2 p-1 rounded-md gap-2 opacity-0 group-hover:opacity-100 transition-all ${s.isDark ? 'text-white' : 'text-black'}`}
              >
                <span className="text-[10px] font-bold uppercase">
                  {copied === s.hex ? 'Copied' : 'Copy'}
                </span>
                {copied === s.hex ? (
                  <Check size={14} />
                ) : (
                  <Terminal size={14} />
                )}
              </div>
            </button>
          ))}
        </section>
      </div>

      {/* 04. DEVELOPER CONSOLE SECTION */}
      <section className="grid grid-cols-1 md:grid-cols-3 divide-x divide-zinc-800">
        {/* CSS Variables */}
        <div className="p-8 space-y-4">
          <div className="flex items-center gap-2 text-zinc-400 mb-4">
            <Hash size={16} />
            <span className="text-xs font-bold uppercase">CSS_Variables</span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4 relative group">
            <pre className="text-[11px] leading-relaxed text-zinc-400 whitespace-pre-wrap">
              {exports.cssVars}
            </pre>
            <button
              onClick={() => copy(exports.cssVars)}
              className="absolute top-2 right-2 p-1 bg-zinc-800 hover:bg-white hover:text-black"
            >
              <Copy size={12} />
            </button>
          </div>
        </div>

        {/* Tailwind Extend */}
        <div className="p-8 space-y-4">
          <div className="flex items-center gap-2 text-zinc-400 mb-4">
            <Box size={16} />
            <span className="text-xs font-bold uppercase">Tailwind_Extend</span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4 relative group">
            <pre className="text-[11px] leading-relaxed text-zinc-400 whitespace-pre-wrap">
              {exports.tailwind}
            </pre>
            <button
              onClick={() => copy(exports.tailwind)}
              className="absolute top-2 right-2 p-1 bg-zinc-800 hover:bg-white hover:text-black"
            >
              <Copy size={12} />
            </button>
          </div>
        </div>

        {/* JSON Tokens */}
        <div className="p-8 space-y-4 bg-zinc-900/30">
          <div className="flex items-center gap-2 text-zinc-400 mb-4">
            <Layers size={16} />
            <span className="text-xs font-bold uppercase">JSON_Tokens</span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4 relative group">
            <pre className="text-[11px] leading-relaxed text-zinc-400 whitespace-pre-wrap">
              {exports.json}
            </pre>
            <button
              onClick={() => copy(exports.json)}
              className="absolute top-2 right-2 p-1 bg-zinc-800 hover:bg-white hover:text-black"
            >
              <Copy size={12} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ColorSpecPage;
