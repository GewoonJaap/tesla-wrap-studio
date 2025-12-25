
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Check } from 'lucide-react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onClose: () => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, onClose }) => {
  // Helper: Hex <-> HSV
  const hexToHsv = (hex: string) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16) / 255;
    const g = parseInt(h.substring(2, 4), 16) / 255;
    const b = parseInt(h.substring(4, 6), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let hue = 0;
    let sat = 0;
    const val = max;
    const d = max - min;
    sat = max === 0 ? 0 : d / max;

    if (max !== min) {
      switch (max) {
        case r: hue = (g - b) / d + (g < b ? 6 : 0); break;
        case g: hue = (b - r) / d + 2; break;
        case b: hue = (r - g) / d + 4; break;
      }
      hue /= 6;
    }
    return { h: hue * 360, s: sat, v: val };
  };

  const hsvToHex = (h: number, s: number, v: number) => {
    let r = 0, g = 0, b = 0;
    const i = Math.floor(h / 60);
    const f = h / 60 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    
    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // State
  const [hsv, setHsv] = useState(() => hexToHsv(color));
  const [isDragging, setIsDragging] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);

  // Sync internal state if external color changes (only if not dragging)
  useEffect(() => {
    if (!isDragging) {
        setHsv(hexToHsv(color));
    }
  }, [color, isDragging]);

  const updateColor = useCallback((newHsv: {h: number, s: number, v: number}) => {
    setHsv(newHsv);
    onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
  }, [onChange]);

  // Handle Saturation/Value Area interaction
  const handleAreaMove = useCallback((e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    if (!areaRef.current) return;
    const rect = areaRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    let x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    let y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    // x is Saturation, y is (1 - Value)
    updateColor({ ...hsv, s: x, v: 1 - y });
  }, [hsv, updateColor]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleAreaMove(e);
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleAreaMove(e);
  };

  useEffect(() => {
    const handleUp = () => setIsDragging(false);
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (isDragging) handleAreaMove(e);
    };

    if (isDragging) {
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('touchend', handleUp);
      window.addEventListener('touchmove', handleMove);
    }
    return () => {
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchend', handleUp);
      window.removeEventListener('touchmove', handleMove);
    };
  }, [isDragging, handleAreaMove]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-4 w-full max-w-xs animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Select Color</h3>
            <button onClick={onClose} className="text-zinc-400 hover:text-white"><X className="w-5 h-5"/></button>
        </div>

        {/* Saturation/Value Area */}
        <div 
            ref={areaRef}
            className="w-full aspect-video rounded-lg cursor-crosshair relative mb-4 shadow-inner ring-1 ring-zinc-800"
            style={{ 
                backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
                backgroundImage: `
                    linear-gradient(to top, #000, transparent), 
                    linear-gradient(to right, #fff, transparent)
                `
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            <div 
                className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{ 
                    left: `${hsv.s * 100}%`, 
                    top: `${(1 - hsv.v) * 100}%`,
                    backgroundColor: color 
                }}
            />
        </div>

        {/* Hue Slider */}
        <div className="mb-4">
            <input 
                type="range" 
                min="0" 
                max="360" 
                value={hsv.h} 
                onChange={(e) => updateColor({ ...hsv, h: parseFloat(e.target.value) })}
                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                style={{
                    background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'
                }}
            />
        </div>

        {/* Hex Input & Preview */}
        <div className="flex items-center gap-3">
             <div className="flex-1 relative">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">#</span>
                 <input 
                    type="text" 
                    value={color.replace('#', '')} 
                    onChange={(e) => {
                        const val = e.target.value;
                        if (/^[0-9A-Fa-f]{0,6}$/.test(val)) {
                            // Only update if valid hex chars
                            if (val.length === 6) {
                                onChange('#' + val);
                            } else {
                                // Just update UI via parent prop if parent allows invalid intermediate states?
                                // Actually, better to keep local input state if we wanted robust typing.
                                // For now, let's assume valid full hex updates or strict validation.
                            }
                        }
                    }}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-2 pl-6 pr-3 text-sm text-white font-mono uppercase focus:ring-2 focus:ring-purple-500/50 outline-none"
                 />
             </div>
             <div 
                className="w-10 h-10 rounded-lg border border-zinc-700 shadow-inner"
                style={{ backgroundColor: color }}
             />
             <button 
                onClick={onClose}
                className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg shadow-lg"
             >
                <Check className="w-5 h-5" />
             </button>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
