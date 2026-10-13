import { View } from 'react-native';
import { AppText } from '@/components/ui/AppText';

type Option = { value: number; label: string };
type Props = {
  label: string;
  options: Option[];
  value: number;
  onChange: (value: number) => void;
};

/** Accessible browser select; native platforms use DateWheel.native.tsx. */
export function DateWheel({ label, options, value, onChange }: Props) {
  return (
    <View style={{ flex: 1, minWidth: 0, gap: 8 }}>
      <AppText weight="600" style={{ textAlign: 'right', fontSize: 13, color: '#665574' }}>{label}</AppText>
      <div style={{ position: 'relative', width: '100%', minWidth: 0 }}>
        <select
          aria-label={`انتخاب ${label} تولد`}
          value={String(value)}
          onChange={(event) => onChange(Number(event.currentTarget.value))}
          style={{
            width: '100%',
            height: 54,
            minWidth: 0,
            boxSizing: 'border-box',
            appearance: 'none',
            WebkitAppearance: 'none',
            borderRadius: 14,
            border: '1px solid #D6C2E9',
            background: '#FCFAFF',
            color: '#4C2C70',
            fontSize: 15,
            fontWeight: 600,
            fontFamily: 'inherit',
            textAlign: 'right',
            direction: 'rtl',
            padding: '0 12px 0 30px',
            cursor: 'pointer',
            outlineOffset: 2,
          }}
        >
          {options.map(option => (
            <option key={option.value} value={String(option.value)}>{option.label}</option>
          ))}
        </select>
        <span aria-hidden="true" style={{
          position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
          pointerEvents: 'none', color: '#8653B4', fontSize: 12,
        }}>▾</span>
      </div>
    </View>
  );
}
