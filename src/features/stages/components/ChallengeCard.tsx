import { Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import type { Challenge } from '../model/challenges';
import { challengeDone, kindIcon, kindLabel } from '../model/challenges';

export function ChallengeCard({ challenge, index, locked, onPress }: {
  challenge: Challenge; index: number; locked: boolean; onPress: () => void;
}) {
  const done = challengeDone(challenge);
  const featured = index === 0 && !locked;
  const tone = featured ? '#AD70FA' : '#EEE3F9';
  const label = locked ? 'قفل' : done ? 'دوباره' : challenge.allowResume ? 'ادامه' : 'شروع';
  return <Pressable
    accessibilityRole="button"
    accessibilityState={{ disabled: locked }}
    accessibilityLabel={`${challenge.title ?? `چالش ${index + 1}`}، ${label}`}
    disabled={locked}
    onPress={onPress}
    style={{
      minHeight: 108, borderRadius: 23,
      borderWidth: featured ? 2 : 1.5, borderColor: tone,
      padding: 12, backgroundColor: '#FFFFFF',
      shadowColor: '#7D3DB1', shadowOpacity: featured ? 0.18 : 0.08,
      shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: featured ? 5 : 2,
      opacity: locked ? 0.62 : 1,
    }}>
    <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 11, flex: 1 }}>
      <View style={{
        width: 63, height: 63, borderRadius: 20, borderWidth: 2,
        borderColor: '#FFFFFF', backgroundColor: featured ? '#FFCE54' : '#EDE0F9',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#8D6BA9', shadowOpacity: 0.15, shadowRadius: 5, elevation: 3,
      }}>
        <AppText style={{ textAlign: 'center', fontSize: 30 }}>
          {locked ? '🔒' : kindIcon(challenge.kind)}
        </AppText>
      </View>
      <View style={{ flex: 1, minWidth: 0, alignItems: 'flex-end', gap: 5 }}>
        <AppText style={{ color: '#88719B', fontSize: 10 }}>
          چالش {index + 1} · {kindLabel(challenge.kind)}
        </AppText>
        <AppText numberOfLines={1} weight="700" style={{
          color: '#30234F', fontSize: 15, textAlign: 'right',
        }}>{challenge.title ?? `چالش ${index + 1}`}</AppText>
        <View style={{ flexDirection: 'row-reverse', gap: 5, flexWrap: 'wrap' }}>
          <AppText style={{ backgroundColor: '#F5F1F9', color: '#9A89A4',
            fontSize: 10, borderRadius: 7, paddingHorizontal: 5 }}>
            ◷ {challenge.standardTime ?? '—'} ثانیه
          </AppText>
          <AppText style={{ backgroundColor: '#F5F1F9', color: '#9A89A4',
            fontSize: 10, borderRadius: 7, paddingHorizontal: 5 }}>
            ★ {challenge.baseScore ?? '—'} امتیاز
          </AppText>
        </View>
      </View>
      <View style={{
        minWidth: 43, paddingHorizontal: 8, height: 29, borderRadius: 16,
        backgroundColor: featured ? '#FFC63D' : '#7248B3',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <AppText weight="700" style={{ color: featured ? '#503414' : '#FFFFFF',
          fontSize: 10, textAlign: 'center' }}>{label}</AppText>
      </View>
    </View>
  </Pressable>;
}
