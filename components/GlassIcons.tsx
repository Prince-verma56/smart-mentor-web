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
  blue: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',   // blue-500 to blue-700
  purple: 'linear-gradient(135deg, #a855f7, #7e22ce)', // purple-500 to purple-700
  red: 'linear-gradient(135deg, #ef4444, #b91c1c)',    // red-500 to red-700
  indigo: 'linear-gradient(135deg, #6366f1, #4338ca)', // indigo-500 to indigo-700
  orange: 'linear-gradient(135deg, #f59e0b, #b45309)', // amber-500 to amber-700
  green: 'linear-gradient(135deg, #10b981, #047857)'   // emerald-500 to emerald-700
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
        <span className="m-auto w-[1.5em] h-[1.5em] flex items-center justify-center text-white drop-shadow-md" aria-hidden="true">
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
