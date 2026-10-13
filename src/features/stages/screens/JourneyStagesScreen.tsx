import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, ImageBackground, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/AsyncState';
import { bootstrapSession, currentSession, subscribeSession } from '@/services/auth/session';
import { queryKeys } from '@/services/api/queryKeys';
import { listJourneys } from '@/features/journeys/api/journeysApi';
import { getJourneyStages } from '../api/stagesApi';
import { tabArtwork } from '@/components/navigation/tabArtwork';
import { completed, isStageLocked, stageStars } from '../model/stages';

const message = (e: unknown) => e instanceof Error ? e.message : 'خطای ناشناخته';
const stageArtwork = require('../../../../assets/image/item.png');
const NODE_SIZE = 100;
const ROW_STEP = 146;
const TOP_SPACER = 215;
const BOTTOM_SPACER = 154;

export function JourneyStagesScreen({ journeyId }: { journeyId: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const mapWidth = Math.max(250, Math.min(width - 36, 430 - 36));
  const laneWidth = Math.min(mapWidth * 0.66, 245);
  const left = (mapWidth - laneWidth) / 2;
  const [childId, setChildId] = useState('');
  const [ready, setReady] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const lastScrolled = useRef('');

  useEffect(() => {
    let alive = true;
    const sync = () => {
      if (alive) { setChildId(currentSession().childId ?? ''); setReady(true); }
    };
    void bootstrapSession().then(sync);
    const unsub = subscribeSession(sync);
    return () => { alive = false; unsub(); };
  }, []);

  const authorized = ready && !!childId && !!currentSession().child?.accessToken;
  const stagesQuery = useQuery({
    queryKey: queryKeys.stages(childId, journeyId),
    queryFn: () => getJourneyStages(journeyId),
    enabled: authorized && !!journeyId,
  });
  const journeysQuery = useQuery({
    queryKey: queryKeys.journeys(childId),
    queryFn: listJourneys,
    enabled: authorized && !!journeyId,
  });

  const stages = useMemo(
    () => [...(stagesQuery.data?.stages ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [stagesQuery.data?.stages],
  );
  const journey = journeysQuery.data?.find(item => item.journeyId === journeyId);
  const title = journey?.name ?? stagesQuery.data?.journeyName ?? 'دنیای من';
  const backgroundUrl = stagesQuery.data?.backgroundUrl ??
    stagesQuery.data?.journeyBackgroundUrl ?? journey?.thumbnailUrl ?? null;
  const earned = stages.reduce((sum, stage) => sum + stageStars(stage), 0);
  const total = stages.length * 5;
  const done = stages.filter(completed).length;
  const progress = total ? Math.min(100, earned / total * 100) : 0;
  const pathHeight = TOP_SPACER + BOTTOM_SPACER + stages.length * ROW_STEP;
  const nodeX = (index: number) => left + (index % 2 === 0 ? 0 : laneWidth - NODE_SIZE);
  // The first stage sits at the bottom, mirroring the Next.js journey map.
  const nodeY = (index: number) => pathHeight - BOTTOM_SPACER - NODE_SIZE - index * ROW_STEP;
  const route = stages.slice(0, -1).map((_, index) => {
    const x1 = nodeX(index) + NODE_SIZE / 2;
    const y1 = nodeY(index) + NODE_SIZE / 2;
    const x2 = nodeX(index + 1) + NODE_SIZE / 2;
    const y2 = nodeY(index + 1) + NODE_SIZE / 2;
    const mid = (y1 + y2) / 2;
    return `M ${x1} ${y1} C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${y2}`;
  }).join(' ');

  useEffect(() => {
    const key = childId + ':' + journeyId;
    if (!stages.length || lastScrolled.current === key) return;
    lastScrolled.current = key;
    const frame = requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: false }));
    return () => cancelAnimationFrame(frame);
  }, [childId, journeyId, stages.length]);

  const stageMap = <View style={{ width: mapWidth, height: pathHeight, alignSelf: 'center' }}>
    <Svg pointerEvents="none" width={mapWidth} height={pathHeight} style={{ position: 'absolute', top: 0, left: 0 }}>
      <Path d={route} stroke="#FFFFFF" strokeWidth={7} strokeDasharray="2 15"
        strokeLinecap="round" fill="none" opacity={0.96} />
    </Svg>
    {stages.map((stage, index) => {
      const locked = isStageLocked(stage, index, stages);
      const finished = completed(stage);
      const active = !locked && !finished;
      const titleText = stage.title ?? `مرحله ${index + 1}`;
      return <Pressable key={stage.stageId} disabled={locked}
        accessibilityRole="button" accessibilityLabel={`${titleText}، ${locked ? 'قفل' : finished ? 'انجام‌شده' : 'شروع مرحله'}`}
        accessibilityState={{ disabled: locked }}
        onPress={() => router.push({ pathname: '/stages/[stageId]', params: { stageId: stage.stageId } })}
        style={{
          position: 'absolute', left: nodeX(index), top: nodeY(index),
          width: NODE_SIZE, height: 150, alignItems: 'center', opacity: locked ? 0.66 : 1,
        }}>
        <View style={{ width: NODE_SIZE, height: NODE_SIZE, alignItems: 'center', justifyContent: 'center',
          borderRadius: NODE_SIZE / 2, backgroundColor: active ? 'rgba(255,231,147,0.65)' : 'rgba(255,255,255,0.18)',
          borderWidth: active ? 3 : 2, borderColor: active ? '#FFF3A2' : finished ? '#A9EFCC' : 'rgba(255,255,255,0.6)',
          shadowColor: active ? '#FFBE3F' : '#38285A', shadowOpacity: active ? 0.7 : 0.27,
          shadowRadius: active ? 17 : 8, elevation: active ? 11 : 5 }}>
          <Image source={stageArtwork} resizeMode="contain"
            style={{ width: NODE_SIZE - 7, height: NODE_SIZE - 7, opacity: locked ? 0.78 : 1 }} />
          <View style={{
            position: 'absolute', right: -7, bottom: 4, minWidth: 33, height: 33,
            paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center',
            borderRadius: 17, borderWidth: 2, borderColor: '#FFFFFF',
            backgroundColor: locked ? '#9699A7' : finished ? '#50B980' : '#7E47D0',
          }}>
            <AppText weight="700" style={{ color: '#FFFFFF', fontSize: locked ? 16 : 15, textAlign: 'center' }}>
              {locked ? '🔒' : finished ? '✓' : index + 1}
            </AppText>
          </View>
          {active && <View style={{
            position: 'absolute', top: -16, paddingHorizontal: 12, paddingVertical: 3,
            backgroundColor: '#FFD554', borderRadius: 999, borderWidth: 2, borderColor: '#FFF9D4',
          }}>
            <AppText weight="700" style={{ color: '#633D11', fontSize: 11, textAlign: 'center' }}>بازی کن!</AppText>
          </View>}
        </View>
        <AppText numberOfLines={1} weight="700"
          style={{ color: '#FFFFFF', textShadowColor: '#3D2E25', textShadowRadius: 4,
            fontSize: 12, textAlign: 'center', width: 148, marginTop: 5 }}>{titleText}</AppText>
        <View style={{ flexDirection: 'row', gap: 1, marginTop: 3, paddingHorizontal: 8,
          backgroundColor: 'rgba(45,35,70,0.45)', borderRadius: 99 }}>
          {Array.from({ length: 5 }, (_, star) =>
            <AppText key={star} style={{ color: star < stageStars(stage) ? '#FFC845' : '#E5DFD5',
              fontSize: 12, textShadowColor: '#4D3A34', textShadowRadius: 2 }}>★</AppText>)}
        </View>
      </Pressable>;
    })}
  </View>;

  return <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: '#FFF7EC' }}>
    <View style={{ flex: 1, maxWidth: 430, width: '100%', alignSelf: 'center', backgroundColor: '#FFF7EC' }}>
      <View style={{ height: 60, backgroundColor: '#FFF8EF', flexDirection: 'row-reverse',
        alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18 }}>
        <AppText weight="700" numberOfLines={1} style={{ fontSize: 16, flex: 1, color: '#28356A' }}>{title}</AppText>
        <Pressable accessibilityRole="button" accessibilityLabel="بازگشت به سفرها"
          onPress={() => router.replace('/journeys')}
          style={{ width: 35, height: 35, backgroundColor: '#FFFFFF', borderRadius: 11,
            justifyContent: 'center', alignItems: 'center', marginLeft: 12,
            borderColor: '#EEE2D3', borderWidth: 1 }}>
          <AppText style={{ color: '#312768', fontSize: 24, textAlign: 'center' }}>‹</AppText>
        </Pressable>
      </View>

      {!ready ? <LoadingState title="بررسی نشست…" /> :
        !authorized ? <View style={{ padding: 20, gap: 12 }}>
          <ErrorState title="ابتدا کودک را انتخاب کنید" />
          <AppButton title="انتخاب کودک" onPress={() => router.push('/children')} />
        </View> :
        stagesQuery.isLoading ? <LoadingState title="دریافت مراحل…" /> :
        stagesQuery.isError ? <ErrorState description={message(stagesQuery.error)}
          onRetry={() => { void stagesQuery.refetch(); }} /> :
        stages.length === 0 ? <EmptyState title="مرحله‌ای برای این سفر پیدا نشد" /> :
        <>
          <View style={{ flex: 1, borderRadius: 26, marginHorizontal: 18, marginTop: 10,
            marginBottom: 102 + Math.max(insets.bottom, 0), overflow: 'hidden',
            backgroundColor: '#C3D8D0' }}>
            {backgroundUrl ? <ImageBackground source={{ uri: backgroundUrl }}
              resizeMode="cover" style={{ flex: 1 }}>
              <ScrollView ref={scrollRef} style={{ flex: 1 }} showsVerticalScrollIndicator={false}
                contentContainerStyle={{ minHeight: pathHeight }}>
                {stageMap}
              </ScrollView>
            </ImageBackground> :
              <ScrollView ref={scrollRef} style={{ flex: 1 }} showsVerticalScrollIndicator={false}
                contentContainerStyle={{ minHeight: pathHeight }}>
                {stageMap}
              </ScrollView>}
          </View>
          <View style={{
            position: 'absolute', left: 18, right: 18, bottom: 102 + Math.max(insets.bottom, 0),
            minHeight: 88, backgroundColor: 'rgba(255,248,239,0.96)',
            borderColor: '#FFFFFF', borderWidth: 1, borderRadius: 26,
            paddingHorizontal: 14, paddingVertical: 12,
            shadowColor: '#5F493B', shadowOpacity: 0.2, shadowRadius: 15, elevation: 7,
          }}>
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: '#E9FFF7',
                alignItems: 'center', justifyContent: 'center' }}>
                <Image source={stageArtwork} resizeMode="contain" style={{ width: 52, height: 52 }} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <AppText weight="700" style={{ color: '#352D49', fontSize: 13 }}>⭐ {earned} از {total} ستاره</AppText>
                <AppText style={{ color: '#85808C', fontSize: 10 }}>
                  {done} مرحله کامل‌شده؛ تا جایزهٔ تکمیل دنیا
                </AppText>
              </View>
            </View>
            <View style={{ height: 9, borderRadius: 10, backgroundColor: '#DED8D5',
              overflow: 'hidden', marginTop: 10, marginHorizontal: 4 }}>
              <View style={{ width: `${progress}%`, height: '100%', borderRadius: 10,
                backgroundColor: '#FFC845' }} />
            </View>
          </View>
          <View style={{ position: 'absolute', bottom: 10 + Math.max(insets.bottom, 0),
            left: 18, right: 18, height: 64, backgroundColor: '#FFFAF4',
            borderRadius: 32, borderWidth: 2, borderColor: '#FFFFFF',
            flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
            shadowColor: '#55412C', shadowOpacity: 0.18, shadowRadius: 11, elevation: 8 }}>
            {([
              { key: 'trophy', href: '/leaderboard' },
              { key: 'home', href: '/journeys' },
              { key: 'compass', href: '/parent' },
            ] as const).map(item =>
              <Pressable key={item.key} accessibilityRole="button"
                accessibilityLabel={item.key === 'home' ? 'خانه' : item.key === 'trophy' ? 'رتبه‌بندی' : 'بخش والدین'}
                onPress={() => router.replace(item.href)}
                style={{ width: 64, height: 60, justifyContent: 'center', alignItems: 'center' }}>
                <Image source={{ uri: tabArtwork[item.key] }} resizeMode="contain"
                  style={{ width: 44, height: 44 }} />
                {item.key === 'home' && <View style={{ position: 'absolute', bottom: 0,
                  width: 24, height: 3, borderRadius: 2, backgroundColor: '#8141C6' }} />}
              </Pressable>)}
          </View>
        </>}
    </View>
  </SafeAreaView>;
}
