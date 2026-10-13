import { ImageBackground, Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/theme/ThemeProvider';
import type { Journey } from '../model/journey';
import { earnedStars } from '../model/journey';

const fallback = [
  require('../../../../assets/journeys/journey-1.png'),
  require('../../../../assets/journeys/journey-2.png'),
  require('../../../../assets/journeys/journey-3.png'),
];

type Props = { journey: Journey; index: number; active: boolean; onPress: () => void; width?: number; height?: number };
export function JourneyCard({ journey, index, active, onPress, width = 224, height = 300 }: Props) {
  const { colors } = useAppTheme();
  const image = journey.thumbnailUrl ? { uri: journey.thumbnailUrl } : fallback[index % fallback.length];
  const stars = earnedStars(journey.progressPercent);
  return <Pressable onPress={onPress} accessibilityRole="button"
    accessibilityLabel={`${journey.name ?? `سفر ${index + 1}`}، ${stars} ستاره از ۵${journey.isLocked ? '، قفل' : ''}`}
    accessibilityState={{ selected: active, disabled: !!journey.isLocked }}
    disabled={!!journey.isLocked}
    style={{
      width, height: active ? height : height * 0.8,
      borderRadius: 34, borderWidth: active ? 4 : 3,
      borderColor: active ? '#ffda55' : 'rgba(255,255,255,0.9)',
      backgroundColor: '#019fe1', overflow: 'hidden',
      opacity: journey.isLocked ? 0.65 : active ? 1 : 0.85,
      shadowColor: '#221d30', shadowOpacity: 0.33, shadowRadius: 8,
      shadowOffset: { width: 0, height: 6 }, elevation: active ? 9 : 3,
    }}>
    <ImageBackground source={image} resizeMode="cover" style={{ flex: 1, justifyContent: 'flex-end' }}>
      {active && !journey.isLocked && <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: '#ffb900', borderWidth: 5, borderColor: '#fff0bc', alignItems: 'center', justifyContent: 'center', shadowColor: '#533308', shadowOpacity: 0.4, shadowRadius: 7, elevation: 5 }}>
          <AppText style={{ color: '#fff', fontSize: 35, lineHeight: 45, paddingLeft: 5 }}>▶</AppText>
        </View>
      </View>}
      <View style={{ margin: 9, paddingVertical: 7, paddingHorizontal: 9, backgroundColor: 'rgba(11,37,76,0.86)', borderRadius: 28, alignItems: 'center' }}>
        <AppText style={{ fontSize: 20, color: active ? '#b87afa' : '#ffd95a', letterSpacing: 1 }}>
          {Array.from({ length: 5 }, (_, i) => i < stars ? '★' : '☆').join('')}
        </AppText>
      </View>
      {journey.isLocked && <View style={{ position: 'absolute', top: 12, right: 12, backgroundColor: colors.surface, borderRadius: 16, padding: 5 }}><AppText>🔒</AppText></View>}
    </ImageBackground>
  </Pressable>;
}
