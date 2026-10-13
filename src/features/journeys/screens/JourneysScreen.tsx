import { useEffect, useRef, useState } from 'react';
import { Image, ImageBackground, Pressable, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Carousel, type CarouselRef } from 'react-native-reanimated-carousel';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppScreen } from '@/components/layout/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/AsyncState';
import { ChildAvatar } from '@/features/children/components/ChildAvatar';
import { listChildren } from '@/features/children/api/childrenApi';
import { spacing } from '@/theme/tokens';
import { bootstrapSession, currentSession, subscribeSession } from '@/services/auth/session';
import { queryKeys } from '@/services/api/queryKeys';
import { listJourneys, chooseJourney } from '../api/journeysApi';
import { JourneyCard } from '../components/JourneyCard';

const background = require('../../../../assets/image/bg-app.png');
const logo = require('../../../../assets/image/logo.png');
const errorMessage = (e: unknown) => e instanceof Error ? e.message : 'خطایی رخ داد.';

export function JourneysScreen() {
  const router = useRouter();
  const client = useQueryClient();
  const carouselRef = useRef<CarouselRef>(null);
  const { width, height } = useWindowDimensions();
  const [ready, setReady] = useState(false);
  const [childId, setChildId] = useState('');
  const [selected, setSelected] = useState(0);
  const selectedId = useRef<string | null>(null);
  const initialSelectionFor = useRef('');

  useEffect(() => {
    let active = true;
    const sync = () => {
      if (active) {
        const nextId = currentSession().childId ?? '';
        setChildId(previous => {
          if (previous !== nextId) { selectedId.current = null; initialSelectionFor.current = ''; setSelected(0); }
          return nextId;
        });
        setReady(true);
      }
    };
    const unsubscribe = subscribeSession(sync);
    void bootstrapSession().then(sync);
    return () => { active = false; unsubscribe(); };
  }, []);

  const session = currentSession();
  const authorized = ready && !!session.child?.accessToken;
  const journeysQuery = useQuery({
    queryKey: queryKeys.journeys(childId),
    queryFn: listJourneys,
    enabled: authorized && !!childId,
  });
  const childrenQuery = useQuery({
    queryKey: queryKeys.children,
    queryFn: listChildren,
    enabled: authorized && !!session.parent?.accessToken,
  });
  const children = childrenQuery.data ?? [];
  const childIndex = children.findIndex(child => child.childProfileId === childId);
  const child = childIndex >= 0 ? children[childIndex] : undefined;
  const journeys = journeysQuery.data ?? [];
  const mutation = useMutation({
    mutationFn: chooseJourney,
    onSuccess: async () => { await client.invalidateQueries({ queryKey: queryKeys.journeys(childId) }); },
  });

  // Restore the initial selection once per child and journey set. Query invalidation
  // must never jump a looping carousel back to its initial physical offset.
  const journeyIds = journeys.map(j => j.journeyId).join('|');
  useEffect(() => {
    if (!journeys.length) return;
    const datasetKey = childId + ':' + journeyIds;
    if (initialSelectionFor.current === datasetKey) return;
    initialSelectionFor.current = datasetKey;
    const existing = selectedId.current ? journeys.findIndex(j => j.journeyId === selectedId.current) : -1;
    const latest = journeys.findIndex(j => j.isLatestSelected);
    const next = existing >= 0 ? existing : latest >= 0 ? latest : 0;
    selectedId.current = journeys[next]?.journeyId ?? null;
    setSelected(next);
    carouselRef.current?.scrollTo({ index: next, animated: false });
  }, [childId, journeyIds]);

  // Keep snapping and selecting separate: a swipe must not trigger a second scroll.
  const activateIndex = (index: number) => {
    const item = journeys[index];
    if (!item || selectedId.current === item.journeyId) return;
    selectedId.current = item.journeyId;
    setSelected(index);
    if (!item.isLocked && !mutation.isPending) mutation.mutate(item.journeyId);
  };
  const selectIndex = (index: number) => {
    if (index < 0 || index >= journeys.length) return;
    carouselRef.current?.scrollTo({ index, animated: true });
    // Selection is committed by onSnapToItem after the card reaches the center.
  };
  const open = (index: number) => {
    const item = journeys[index];
    if (!item) return;
    if (index !== selected) { selectIndex(index); return; }
    if (item.isLocked) return;
    router.push({ pathname: '/journeys/[journeyId]', params: { journeyId: item.journeyId } });
  };

  const canvasWidth = Math.min(width, 560);
  const cardWidth = Math.min(224, Math.max(172, canvasWidth * 0.52));
  // In v5 the snap step must match the viewport for centered parallax items.
  // Smaller itemSize with wider cards caused the visible overlap and left alignment.
  const itemSize = canvasWidth;
  const cardHeight = Math.min(310, Math.max(236, height * 0.34));

  if (!ready) return <AppScreen><LoadingState title="بررسی نشست کودک…" /></AppScreen>;
  if (!authorized || !childId) return <AppScreen contentStyle={{ gap: spacing.md }}>
    <ErrorState title="پروفایل کودک انتخاب نشده" description="برای دیدن سفرها، ابتدا کودک را انتخاب کنید." />
    <AppButton title="انتخاب کودک" onPress={() => router.push('/children')} />
  </AppScreen>;

  return <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: '#e4eee1' }}>
    <View style={{ flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center', overflow: 'hidden' }}>
      <ImageBackground source={background} resizeMode="cover" style={{ flex: 1 }} imageStyle={{ width: '100%', height: '100%' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 22 }}>
          <Pressable onPress={() => router.push('/children')} accessibilityRole="button" accessibilityLabel="مدیریت کودکان" hitSlop={10}
            style={{ borderRadius: 999, padding: 4, backgroundColor: '#fff', shadowColor: '#8c30db', shadowOpacity: 0.8, shadowRadius: 13, elevation: 9 }}>
            {child
              ? <ChildAvatar child={child} index={childIndex} size={56} />
              : <Image source={require('../../../../assets/avatars/boy-01.png')} style={{ height: 56, width: 56, borderRadius: 28 }} />}
          </Pressable>
          <View accessibilityLabel={`امتیاز کودک: ${child?.totalScore ?? 0}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 7, paddingHorizontal: 14, backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: 40, borderWidth: 2, borderColor: '#fff' }}>
            <AppText weight="700" style={{ color: '#19156b', fontSize: 17 }}>{child?.totalScore ?? 0}</AppText>
            <AppText style={{ fontSize: 23 }}>⭐</AppText>
          </View>
        </View>

        <Image source={logo} resizeMode="contain" accessible accessibilityLabel="تی تو تم" style={{ alignSelf: 'center', width: Math.min(canvasWidth * 0.53, 230), height: 87, marginTop: 9 }} />

        <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 102 }}>
          {journeysQuery.isLoading ? <LoadingState title="دریافت سفرها…" /> :
            journeysQuery.isError ? <ErrorState description={errorMessage(journeysQuery.error)} onRetry={() => { void journeysQuery.refetch(); }} /> :
            journeys.length === 0 ? <EmptyState title="هنوز سفری آماده نشده است" /> :
            <>
              <View accessibilityLabel="فهرست سفرها" style={{ height: cardHeight + 26 }}>
                <Carousel
                  key={`${childId}:${journeys.map(j => j.journeyId).join(',')}`}
                  ref={carouselRef}
                  style={{ width: canvasWidth, height: cardHeight + 26, overflow: 'hidden' }}
                  itemSize={itemSize}
                  data={journeys}
                  keyExtractor={item => item.journeyId}
                  defaultIndex={selected}
                  loop={journeys.length > 1}
                  autoFillData={journeys.length === 2}
                  windowSize={Math.max(5, journeys.length)}
                  snapMode="nearest"
                  animation={{ type: 'spring', damping: 20, stiffness: 180 }}
                  layout={{ type: 'parallax', offset: Math.min(canvasWidth * 0.37, 150), scale: 0.84, adjacentScale: 0.76 }}
                  onSnapToItem={index => {
                    activateIndex(index);
                  }}
                  renderItem={({ item, index }) =>
                    <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingVertical: 10 }}>
                      <JourneyCard journey={item} index={index} active={index === selected}
                        width={cardWidth} height={cardHeight} onPress={() => open(index)} />
                    </View>}
                />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginVertical: 8 }}>
                {journeys.map((journey, index) =>
                  <Pressable key={journey.journeyId} accessibilityRole="button" accessibilityLabel={`انتخاب سفر ${index + 1}`}
                    accessibilityState={{ selected: index === selected }} onPress={() => selectIndex(index)}
                    style={{ minWidth: 24, minHeight: 24, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: index === selected ? '#fff' : '#b2a8a2' }} />
                  </Pressable>)}
              </View>
              {!!mutation.error && <AppText tone="error" accessibilityRole="alert" style={{ textAlign: 'center' }}>{errorMessage(mutation.error)}</AppText>}
            </>}
        </View>
      </ImageBackground>
    </View>
  </SafeAreaView>;
}
