'use client';

import { hexToHsl, hexToRgb, isLightColor } from '@/utils/colors';
import { toast } from '@mosespace/toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ColorColumnProps {
  color: string;
  index: number;
  total: number;
}

export default function ColorColumn({ color, index, total }: ColorColumnProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [copyFormat, setCopyFormat] = useState<'hex' | 'rgb' | 'hsl'>('hex');
  const router = useRouter();

  const isLight = isLightColor(color);
  const textColor = isLight ? 'text-gray-800' : 'text-white';
  const dropdownBg = isLight ? 'bg-white/80' : 'bg-black/30';
  const buttonHoverBg = isLight ? 'hover:bg-black/10' : 'hover:bg-white/10';

  const formats = {
    hex: color,
    rgb: hexToRgb(color),
    hsl: hexToHsl(color),
  };

  const handleCopyClick = () => {
    const textToCopy = formats[copyFormat];
    navigator.clipboard.writeText(textToCopy);

    toast.success(
      'Success:',
      `You have successfully copied ${copyFormat.toUpperCase()}: ${textToCopy}`,
    );
  };

  const toggleFormat = () => {
    if (copyFormat === 'hex') setCopyFormat('rgb');
    else if (copyFormat === 'rgb') setCopyFormat('hsl');
    else setCopyFormat('hex');
  };

  // Animation delays based on index for staggered appearance
  const animationDelay = `${index * 0.08}s`;

  return (
    <div
      className="relative flex-1 flex flex-col items-center justify-center animate-color-fade overflow-hidden"
      style={{
        backgroundColor: color,
        animationDelay,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover overlay with backdrop filter */}
      <div
        className={`absolute inset-0 transition-all duration-500 ease-in-out ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backdropFilter: 'brightness(0.95)',
          WebkitBackdropFilter: 'brightness(0.95)',
        }}
      />

      {/* Content when hovered */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center ${textColor} transition-all duration-500 ease-in-out transform ${
          isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="flex flex-col items-center space-y-4">
          <div
            className={`text-lg md:text-2xl font-medium cursor-pointer rounded-md px-3 py-1.5 transition-all duration-300 ${buttonHoverBg}`}
            onClick={toggleFormat}
          >
            {formats[copyFormat]}
          </div>

          <button
            onClick={handleCopyClick}
            className={`mt-2 px-4 py-1.5 rounded-full backdrop-blur-sm ${dropdownBg} transition-all duration-300 text-sm ${buttonHoverBg}`}
          >
            Copy {copyFormat.toUpperCase()}
          </button>

          <button
            onClick={() =>
              router.push(`/d/${color.replace('#', '').toLocaleLowerCase()}`)
            }
            className={`mt-2 px-4 py-1.5 rounded-md backdrop-blur-sm ${dropdownBg} transition-all duration-300 text-sm ${buttonHoverBg}`}
          >
            View Details
          </button>
        </div>
      </div>

      {/* Color hex code display (visible when not hovered) */}
      <div
        className={`transition-all duration-500 ease-in-out transform ${
          isHovered ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
        } ${textColor}`}
      >
        <p className="text-xl md:text-3xl font-medium tracking-wider">
          {color}
        </p>
      </div>
    </div>
  );
}
