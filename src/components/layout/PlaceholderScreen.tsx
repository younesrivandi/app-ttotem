import { Link } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { AppScreen } from './AppScreen';
import { useAppTheme } from '@/theme/ThemeProvider';
import { useResponsive } from '@/theme/useResponsive';
import { spacing, radii, typeScale } from '@/theme/tokens';
import { localeStrings } from '@/i18n/locale';

type Props = {title: string; note?: string};
const links = [
  {href:'/' as const,label:'خانه'}, {href:'/login' as const,label:'ورود'},
  {href:'/children' as const,label:'کودکان'}, {href:'/parent' as const,label:'داشبورد والد'},
  {href:'/journeys' as const,label:'سفرها'},
  {href:'/leaderboard' as const,label:'رتبه‌بندی'},
];
export function PlaceholderScreen({title,note}: Props) {
  const {colors,mode,resolvedMode,setMode}=useAppTheme();
  const {size,width} = useResponsive();
  return <AppScreen>
    <Text style={{color:colors.primary,fontSize:12,textAlign:'right',marginBottom:spacing.sm}}>TTOTEM / {localeStrings.stage}</Text>
    <Text accessibilityRole="header" style={{color:colors.text,...typeScale.hero,fontWeight:'700',textAlign:'right',writingDirection:'rtl'}}>{title}</Text>
    <Text style={{color:colors.textMuted,...typeScale.body,textAlign:'right',writingDirection:'rtl',marginTop:spacing.sm}}>{note ?? localeStrings.description}</Text>
    <View style={{backgroundColor:colors.surface,borderColor:colors.border,borderWidth:1,borderRadius:radii.lg,padding:spacing.md,marginTop:spacing.lg,gap:spacing.sm}}>
      <Text style={{color:colors.text,fontSize:16,fontWeight:'700',textAlign:'right'}}>تنظیمات نمایشی تم</Text>
      <Text style={{color:colors.textMuted,textAlign:'right'}}>حالت فعال: {resolvedMode === 'dark' ? 'تیره' : 'روشن'} | اندازه: {size} ({Math.round(width)}px)</Text>
      <View style={{flexDirection:'row-reverse',flexWrap:'wrap',gap:spacing.xs}}>
        {(['system','light','dark'] as const).map((v) => <Pressable key={v} accessibilityRole="button" accessibilityState={{selected:mode===v}}
          onPress={()=>setMode(v)} style={{backgroundColor:mode===v ? colors.primary : colors.surfaceMuted,borderRadius:radii.md,paddingVertical:spacing.sm,paddingHorizontal:spacing.md,minHeight:44,justifyContent:'center'}}>
          <Text style={{color:mode===v ? colors.primaryContrast:colors.text,fontWeight:'600'}}>{v==='system'?'سیستم':v==='light'?'روشن':'تیره'}</Text>
        </Pressable>)}
      </View>
    </View>
    <Text style={{color:colors.text,...typeScale.subtitle,fontWeight:'700',textAlign:'right',marginTop:spacing.xl,marginBottom:spacing.md}}>{localeStrings.paths}</Text>
    <View style={{flexDirection:'row-reverse',flexWrap:'wrap',gap:spacing.sm}}>
      {links.map(({href,label})=><Link key={href} href={href} asChild>
        <Pressable accessibilityRole="link" style={{width:size==='phone'?'100%':'48%',minHeight:48,justifyContent:'center',backgroundColor:colors.surface,borderRadius:radii.md,borderWidth:1,borderColor:colors.border,paddingHorizontal:spacing.md,paddingVertical:spacing.sm}}>
          <Text style={{color:colors.primary,textAlign:'right',writingDirection:'rtl',...typeScale.body}}>{label}</Text>
        </Pressable>
      </Link>)}
    </View>
    <Text style={{color:colors.textMuted,textAlign:'right',marginTop:spacing.xl,...typeScale.caption}}>{localeStrings.offline}</Text>
  </AppScreen>;
}
