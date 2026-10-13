import { useEffect, useRef } from 'react';
import { ScrollView, View, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import { AppText } from '@/components/ui/AppText';

const HEIGHT = 44;
type Props = { label: string; options: { value: number; label: string }[]; value: number; onChange: (value: number) => void };
export function DateWheel({ label, options, value, onChange }: Props) {
  const scroll = useRef<ScrollView>(null);
  const index = Math.max(0, options.findIndex(item => item.value === value));
  useEffect(() => { scroll.current?.scrollTo({ y: index * HEIGHT, animated: false }); }, [index]);
  const finish = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.max(0, Math.min(options.length - 1, Math.round(e.nativeEvent.contentOffset.y / HEIGHT)));
    const next = options[i]?.value;
    if (next !== undefined && next !== value) onChange(next);
  };
  return <View style={{ flex: 1, minWidth: 0, alignItems: 'stretch', gap: 7 }}>
    <AppText weight="600" style={{ textAlign: 'center', fontSize: 13 }}>{label}</AppText>
    <View style={{ height: HEIGHT * 3, overflow: 'hidden', borderRadius: 16, backgroundColor: '#F7F2FC' }}>
      <View pointerEvents="none" style={{ position: 'absolute', top: HEIGHT, height: HEIGHT, left: 0, right: 0, zIndex: 1, borderRadius: 10, borderWidth: 1.5, borderColor: '#A16AE0', backgroundColor: 'rgba(150,95,215,0.08)' }}/>
      <ScrollView ref={scroll} nestedScrollEnabled showsVerticalScrollIndicator={false} snapToInterval={HEIGHT} decelerationRate="fast"
        onLayout={() => scroll.current?.scrollTo({ y: index * HEIGHT, animated: false })}
        onMomentumScrollEnd={finish} onScrollEndDrag={finish}
        contentContainerStyle={{ paddingVertical: HEIGHT }}>
        {options.map(item => <View key={item.value} style={{ height: HEIGHT, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 2 }}>
          <AppText numberOfLines={1} style={{ textAlign: 'center', color: value === item.value ? '#6533AC' : '#837A8C', fontSize: 14, fontWeight: value === item.value ? '700' : '400' }}>{item.label}</AppText>
        </View>)}
      </ScrollView>
    </View>
  </View>;
}
