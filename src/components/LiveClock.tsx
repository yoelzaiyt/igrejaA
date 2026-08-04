import React, { useState, useEffect } from 'react';

interface LiveClockProps {
  size?: 'sm' | 'md' | 'lg';
  layout?: 'inline' | 'stacked';
  prominent?: boolean;
  tone?: 'on-dark' | 'on-light';
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export default function LiveClock({
  size = 'md',
  layout = 'inline',
  prominent = false,
  tone = 'on-dark',
  align = 'center',
  className = '',
}: LiveClockProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const dateString = time.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const textSize =
    size === 'lg'
      ? 'text-xl sm:text-2xl md:text-3xl'
      : size === 'sm'
      ? 'text-sm sm:text-base md:text-lg'
      : 'text-lg sm:text-xl md:text-2xl';

  const textClass = `font-black tracking-wide tabular-nums ${textSize}`;

  const alignClass =
    align === 'end'
      ? 'items-end text-right'
      : align === 'start'
      ? 'items-start text-left'
      : 'items-center text-center';

  const content =
    layout === 'stacked' ? (
      <div className={`flex flex-col ${alignClass} leading-none gap-1`}>
        <span className={textClass}>{timeString}</span>
        <span className={textClass}>{dateString}</span>
      </div>
    ) : (
      <div className={`flex flex-row ${align === 'end' ? 'justify-end' : align === 'start' ? 'justify-start' : 'justify-center'} items-center gap-2 sm:gap-3`}>
        <span className={textClass}>{timeString}</span>
        <span className={`text-current/25 font-light ${textSize}`} aria-hidden="true">
          |
        </span>
        <span className={textClass}>{dateString}</span>
      </div>
    );

  const prominentClass =
    tone === 'on-light'
      ? 'px-3 sm:px-4 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md text-brand-dark'
      : 'px-3 sm:px-5 py-1.5 sm:py-2 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/20 shadow-lg text-white';

  return (
    <div
      className={`font-sans select-none ${prominent ? prominentClass : ''} ${className}`}
      role="timer"
      aria-live="off"
      aria-label={`${timeString}, ${dateString}`}
    >
      {content}
    </div>
  );
}

/** Relógio padronizado para cabeçalhos de totem — hora e data inline à direita */
export function HeaderClock({
  tone = 'on-light',
  prominent = true,
}: {
  tone?: 'on-dark' | 'on-light';
  prominent?: boolean;
}) {
  return (
    <LiveClock
      size="lg"
      layout="inline"
      prominent={prominent}
      tone={tone}
      align="end"
    />
  );
}
