import React from 'react';

export interface GlassIconsItem {
  icon: React.ReactElement;
  color: string;
  label: string;
  customClass?: string;
}

export interface GlassIconsProps {
  items: GlassIconsItem[];
  className?: string;
}

const gradientMapping: Record<string, string> = {
  blue: 'linear-gradient(135deg, #60a5fa, #2563eb)',
  purple: 'linear-gradient(135deg, #c084fc, #9333ea)',
  red: 'linear-gradient(135deg, #f87171, #dc2626)',
  indigo: 'linear-gradient(135deg, #818cf8, #4f46e5)',
  orange: 'linear-gradient(135deg, #fbbf24, #d97706)',
  green: 'linear-gradient(135deg, #34d399, #059669)'
};

export const SingleGlassIcon: React.FC<{ item: GlassIconsItem, className?: string }> = ({ item, className }) => {
  const getBackgroundStyle = (color: string): React.CSSProperties => {
    if (gradientMapping[color]) {
      return { background: gradientMapping[color] };
    }
    return { background: color };
  };

  return (
    <div
      aria-label={item.label}
      className={`relative bg-transparent outline-none border-none w-[4.5em] h-[4.5em] [perspective:24em] [transform-style:preserve-3d] [-webkit-tap-highlight-color:transparent] group ${
        item.customClass || ''
      } ${className || ''}`}
    >
      <span
        className="absolute top-0 left-0 w-full h-full rounded-[1.25em] block transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[100%_100%] rotate-[15deg] [will-change:transform] group-hover:[transform:rotate(25deg)_translate3d(-0.5em,-0.5em,0.5em)]"
        style={{
          ...getBackgroundStyle(item.color),
          boxShadow: '0.5em -0.5em 0.75em hsla(223, 10%, 10%, 0.15)'
        }}
      ></span>

      <span
        className="absolute top-0 left-0 w-full h-full rounded-[1.25em] bg-[hsla(0,0%,100%,0.08)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[80%_50%] flex backdrop-blur-[0.75em] [-webkit-backdrop-filter:blur(0.75em)] [-moz-backdrop-filter:blur(0.75em)] [will-change:transform] transform group-hover:[transform:translate3d(0,0,2em)]"
        style={{
          boxShadow: '0 0 0 0.05em hsla(0, 0%, 100%, 0.2) inset'
        }}
      >
        <span className="m-auto w-[2.4em] h-[2.4em] flex items-center justify-center text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" aria-hidden="true">
          {item.icon}
        </span>
      </span>

      {item.label && (
        <span className="absolute top-full left-0 right-0 text-center whitespace-nowrap leading-[2] text-base opacity-0 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] translate-y-0 group-hover:opacity-100 group-hover:[transform:translateY(20%)]">
          {item.label}
        </span>
      )}
    </div>
  );
};

const GlassIcons: React.FC<GlassIconsProps> = ({ items, className }) => {
  return (
    <div className={`grid gap-[5em] grid-cols-2 md:grid-cols-3 mx-auto py-[3em] overflow-visible ${className || ''}`}>
      {items.map((item, index) => (
        <SingleGlassIcon key={index} item={item} />
      ))}
    </div>
  );
};

export default GlassIcons;
