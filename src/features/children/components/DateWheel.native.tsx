import { View } from 'react-native';
import WheelPicker from '@quidone/react-native-wheel-picker';
import { AppText } from '@/components/ui/AppText';

type Props = { label: string; options: { value: number; label: string }[]; value: number; onChange: (value: number) => void };
export function DateWheel({ label, options, value, onChange }: Props) {
  return <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
    <AppText weight="600" style={{ textAlign: 'center', fontSize: 13 }}>{label}</AppText>
    <WheelPicker
      data={options}
      value={value}
      width="100%"
      itemHeight={44}
      visibleItemCount={3}
      enableScrollByTapOnItem
      onValueChanged={({ item }) => onChange(item.value)}
      itemTextStyle={{ fontSize: 16, color: '#493459' }}
      overlayItemStyle={{ backgroundColor: '#EEE5F8', borderRadius: 12, borderWidth: 1, borderColor: '#BA91E5' }}
    />
  </View>;
}
