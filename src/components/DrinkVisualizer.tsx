import React from 'react';
import { BubbleTea, Customization } from '../types/types';

interface Props {
  tea: BubbleTea;
  customization: Customization;
}

// Map tea names to colors (approximate hex values)
const TEA_COLORS: Record<string, string | string[]> = {
  'Original Milk Tea': '#fcf3e1ff', // light beige
  'Black Milk Tea': '#926f35ff',
  'Oolong Milk Tea': '#dea150ff', // slight amber
  'Green Milk Tea': '#e8f3e6', // pale creamy green
  'Capuccino Milk Tea': '#cd966bff', // coffee brown
  'Coconut Milk Tea': '#fbf8f2',
  'Ube Milk Tea': '#d8b6f0',
  'Protein Shake Milk Tea': '#efe2c9',
  'Ice Blend Latte': '#e6d6c7',
  'Winter Melon Green Tea': '#d8a86b',
  'Passionfruit Green Tea': '#f6b64b',
  'Mango Green Tea': '#ffd24a',
  'Strawberry Lemonade Tea': '#ffb3b3',
  'Strawberry Matcha': ['#e8f3e6', '#ff6b6b'], // layered: matcha (green) then strawberry (red)
  'Peach Oolong Tea': '#ffd6b3',
  'Peach Oolong Tea (transparent)': 'rgba(255,200,150,0.55)',
};

const TOPPING_COLORS: Record<string, string> = {
  'boba': '#111111',
  'lychee-jelly': '#ff7fb3',
  'pudding': '#f1c232',
};

export const DrinkVisualizer: React.FC<Props> = ({ tea, customization }) => {
  const sizeScale = customization.size === 'small' ? 0.8 : customization.size === 'large' ? 1.15 : 1;

  const baseColor = ((): string | string[] => {
    // try direct match
    const direct = TEA_COLORS[tea.name];
    if (direct) return direct;
    // fallback by keyword
    if (/milk tea/i.test(tea.name)) return '#f2e7d0';
    if (/matcha/i.test(tea.name)) return '#e8f3e6';
    if (/strawberry/i.test(tea.name) && /matcha/i.test(tea.name)) return TEA_COLORS['Strawberry Matcha'];
    return '#f2e7d0';
  })();

  const width = 140 * sizeScale;
  const height = 220 * sizeScale;

  // Generate topping circles positions
  const renderBoba = () => {
    const count = 16;
    const circles = [] as JSX.Element[];
    for (let i = 0; i < count; i++) {
      const x = 25 + (i % 5) * 22 + (Math.random() * 8 - 4);
      const y = height - 30 - Math.floor(i / 5) * 18 + (Math.random() * 8 - 4);
      circles.push(
        <circle key={`boba-${i}`} cx={x} cy={y} r={8 * sizeScale} fill={TOPPING_COLORS['boba']} opacity={0.95} />
      );
    }
    return circles;
  };

  const renderJelly = () => {
    // floating jelly squares throughout the drink
    const colors = ['#ff7fb3', '#ff9fb3', '#ff6f9f'];
    const pieces = [] as JSX.Element[];
    const count = 22;
    for (let i = 0; i < count; i++) {
      const x = 25 + (i % 5) * 22 + (Math.random() * 8 - 4);
      const y = height - 30 - Math.floor(i / 5) * 18 + (Math.random() * 8 - 4);
      pieces.push(
        <rect key={`jelly-${i}`} x={x} y={y} width={10} height={10} rx={2} fill={colors[i % colors.length]} opacity={0.9} />
      );
    }
    return pieces;
  };

  const renderPudding = () => {
    const x = width / 2 - 22;
    const y = height - 60;
    return (
      <g>
        <ellipse cx={x + 22} cy={y + 18} rx={28} ry={15} fill={TOPPING_COLORS['pudding']} opacity={0.95} />
        <rect x={x} y={y + 8} width={44} height={24} rx={8} fill={TOPPING_COLORS['pudding']} opacity={0.95} />
      </g>
    );
  };

  const toppingsElements: JSX.Element[] = [];
  if (customization.toppings.includes('boba')) toppingsElements.push(<g key="boba">{renderBoba()}</g>);
  if (customization.toppings.includes('lychee-jelly')) toppingsElements.push(<g key="jelly">{renderJelly()}</g>);
  if (customization.toppings.includes('pudding')) toppingsElements.push(<g key="pudding">{renderPudding()}</g>);

  // Liquid fill: handle layered for Strawberry Matcha
  const liquid = Array.isArray(baseColor) ? (
    <g>
      <rect x={20} y={height * 0.28} width={width - 40} height={height * 0.56} rx={18} fill={(baseColor as string[])[0]} />
      <rect x={20} y={height * 0.48} width={width - 40} height={height * 0.36} rx={18} fill={(baseColor as string[])[1]} />
    </g>
  ) : (
    <rect x={20} y={height * 0.28} width={width - 40} height={height * 0.56} rx={18} fill={baseColor as string} />
  );

  return (
    <div style={{ width: `${width}px`, transform: `scale(1)`, padding: 8 }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* cup shadow */}
        <ellipse cx={width / 2} cy={height - 6} rx={width / 3} ry={6} fill="rgba(0,0,0,0.08)" />

        {/* cup body */}
        <rect x={10} y={18} width={width - 20} height={height - 36} rx={26} fill="#ffffff" stroke="#e6e6e6" strokeWidth={1} />

        {/* liquid area */}
        <g clipPath="url(#cup-clip)">
          <defs>
            <clipPath id="cup-clip">
              <rect x={20} y={height * 0.28} width={width - 40} height={height * 0.56} rx={18} />
            </clipPath>
          </defs>
          {liquid}

          {/* toppings */}
          <g>{toppingsElements}</g>
        </g>

        {/* lid and straw */}
        <rect x={width / 2 - 34} y={6} width={68} height={10} rx={6} fill="#f3f3f3" />
        <rect x={width / 2 - 6} y={-10} width={12} height={36} rx={6} fill="#d1d1d1" />

        {/* highlight on cup */}
        <path d={`M${20} ${height * 0.36} Q ${width * 0.3} ${height * 0.2}, ${width - 20} ${height * 0.36}`} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={8} strokeLinecap="round" />
      </svg>
    </div>
  );
};

export default DrinkVisualizer;
