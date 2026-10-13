import { View } from 'react-native';
import { AppText } from '@/components/ui/AppText';

type Option = { value: number; label: string };
type Props = {
  label: string;
  options: Option[];
  value: number;
  onChange: (value: number) => void;
};

/** Native HTML select for reliable keyboard, mouse and touch interactions on web. */
export function DateWheel({ label, options, value, onChange }: Props) {
  return (
    <View style={{ flex: 1, minWidth: 0, gap: 8 }}>
      <AppText weight="600" style={{ textAlign: 'center', fontSize: 13 }}>{label}</AppText>
      <select
        aria-label={label}
        value={String(value)}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        style={{
          width: '100%',
          height: 52,
          minWidth: 0,
          boxSizing: 'border-box',
          borderRadius: 14,
          border: '1px solid #D9C8EA',
          backgroundColor: '#F9F5FD',
          color: '#57318A',
          fontSize: 15,
          fontWeight: 600,
          fontFamily: 'inherit',
          textAlign: 'center',
          direction: 'rtl',
          padding: '0 8px',
          cursor: 'pointer',
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
    </View>
  );
}
