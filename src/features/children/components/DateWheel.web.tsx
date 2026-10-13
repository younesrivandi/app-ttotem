import { useCallback, useEffect, useRef } from 'react';
import { AppText } from '@/components/ui/AppText';

type Option = { value: number; label: string };
type Props = { label: string; options: Option[]; value: number; onChange: (value: number) => void };
const ITEM = 46;
const VISIBLE = 5;
const CENTER = Math.floor(VISIBLE / 2);

export function DateWheel({ label, options, value, onChange }: Props) {
  const list = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentIndex = Math.max(0, options.findIndex(item => item.value === value));

  const selectAt = useCallback((index: number, smooth = true) => {
    const next = Math.max(0, Math.min(options.length - 1, index));
    list.current?.scrollTo({ top: next * ITEM, behavior: smooth ? 'smooth' : 'instant' });
    if (options[next] && options[next].value !== value) onChange(options[next].value);
  }, [onChange, options, value]);

  useEffect(() => {
    list.current?.scrollTo({ top: currentIndex * ITEM, behavior: 'instant' });
  }, [currentIndex]);

  useEffect(() => () => { if (settleTimer.current) clearTimeout(settleTimer.current); }, []);

  const settle = () => {
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      if (!list.current) return;
      selectAt(Math.round(list.current.scrollTop / ITEM));
    }, 90);
  };

  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <AppText weight="600" style={{ textAlign: 'center', fontSize: 13 }}>{label}</AppText>
      <div style={{ position: 'relative', height: ITEM * VISIBLE, borderRadius: 18, overflow: 'hidden', background: '#FAF8FC' }}>
        <div aria-hidden="true" style={{
          position: 'absolute', left: 4, right: 4, top: ITEM * CENTER, height: ITEM,
          zIndex: 2, pointerEvents: 'none', borderRadius: 12,
          background: '#EEE5FA', boxShadow: 'inset 0 0 0 1px #BB95E6',
        }} />
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, #FAF8FC 0%, rgba(250,248,252,.72) 12%, transparent 38%, transparent 62%, rgba(250,248,252,.72) 88%, #FAF8FC 100%)',
        }} />
        <div
          ref={list}
          role="listbox"
          aria-label={label}
          aria-activedescendant={`wheel-${label}-${value}`}
          tabIndex={0}
          onScroll={settle}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') { event.preventDefault(); selectAt(currentIndex + 1); }
            if (event.key === 'ArrowUp') { event.preventDefault(); selectAt(currentIndex - 1); }
            if (event.key === 'Home') { event.preventDefault(); selectAt(0); }
            if (event.key === 'End') { event.preventDefault(); selectAt(options.length - 1); }
          }}
          style={{
            height: '100%', overflowY: 'auto', overflowX: 'hidden',
            scrollSnapType: 'y mandatory', overscrollBehavior: 'contain',
            scrollbarWidth: 'none', outlineOffset: -2, touchAction: 'pan-y',
          }}
        >
          <div style={{ height: ITEM * CENTER }} aria-hidden="true" />
          {options.map((item, index) => (
            <div
              key={item.value} id={`wheel-${label}-${item.value}`}
              role="option" aria-selected={item.value === value}
              onClick={() => selectAt(index)}
              style={{
                height: ITEM, scrollSnapAlign: 'center', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 2px', textAlign: 'center', whiteSpace: 'nowrap',
                fontSize: 15, userSelect: 'none',
                fontWeight: item.value === value ? 750 : 450,
                color: item.value === value ? '#572B90' : '#8C8298',
                transition: 'color 120ms ease',
              }}
            >{item.label}</div>
          ))}
          <div style={{ height: ITEM * CENTER }} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
