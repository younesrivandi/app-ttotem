import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { AppText } from '@/components/ui/AppText';

const ITEM_HEIGHT = 44;
type Props = { label: string; options: { value: number; label: string }[]; value: number; onChange: (value: number) => void };
export function DateWheel({ label, options, value, onChange }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const index = Math.max(0, options.findIndex((option) => option.value === value));
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: false });
  }, [index]);
  const choose = (indexToSelect: number) => {
    const item = options[Math.max(0, Math.min(indexToSelect, options.length - 1))];
    if (item && item.value !== value) onChange(item.value);
  };
  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    choose(Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT));
  };
  return <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
    <AppText weight="600" style={{ textAlign: 'center', fontSize: 13 }}>{label}</AppText>
    <View style={{ height: ITEM_HEIGHT * 3, borderRadius: 14, overflow: 'hidden', backgroundColor: '#F8F4FC' }}>
      <View pointerEvents="none" style={{ position: 'absolute', top: ITEM_HEIGHT, height: ITEM_HEIGHT, left: 0, right: 0, borderColor: '#B18BDC', borderWidth: 1, borderRadius: 10, backgroundColor: 'rgba(154,94,213,0.1)', zIndex: 1 }} />
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} snapToInterval={ITEM_HEIGHT} decelerationRate="fast"
        onMomentumScrollEnd={onScrollEnd} onScrollEndDrag={onScrollEnd}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}>
        {options.map((item, itemIndex) => <Pressable key={item.value} onPress={() => choose(itemIndex)}
          accessibilityRole="button" accessibilityLabel={item.label} accessibilityState={{ selected: value === item.value }}
          style={{ height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 }}>
          <AppText numberOfLines={1} style={{ textAlign: 'center', color: value === item.value ? '#6533AC' : '#82778B', fontSize: 14, fontWeight: value === item.value ? '700' : '400' }}>{item.label}</AppText>
        </Pressable>)}
      </ScrollView>
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`گزینه قبلی ${label}`} disabled={index === 0} onPress={() => choose(index - 1)} style={{ paddingHorizontal: 12, paddingVertical: 4 }}>
        <AppText style={{ color: '#7542B8', textAlign: 'center' }}>▲</AppText>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`گزینه بعدی ${label}`} disabled={index === options.length - 1} onPress={() => choose(index + 1)} style={{ paddingHorizontal: 12, paddingVertical: 4 }}>
        <AppText style={{ color: '#7542B8', textAlign: 'center' }}>▼</AppText>
      </Pressable>
    </View>
  </View>;
}
