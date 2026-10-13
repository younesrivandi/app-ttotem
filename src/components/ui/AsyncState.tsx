import { ActivityIndicator, View } from 'react-native';
import { useAppTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import { AppText } from './AppText';
import { AppButton } from './AppButton';
type Props={title?:string;description?:string;onRetry?:()=>void};
function StateFrame({title,description,action}:Props & {action?:React.ReactNode}) {return <View style={{alignItems:'center',justifyContent:'center',padding:spacing.lg,gap:spacing.sm,minHeight:140}}><AppText variant="subtitle" weight="700">{title}</AppText>{!!description&&<AppText tone="muted">{description}</AppText>}{action}</View>}
export function LoadingState({title='در حال بارگذاری…'}:Pick<Props,'title'>){const {colors}=useAppTheme();return <StateFrame title={title} action={<ActivityIndicator color={colors.primary}/>}/>}
export function EmptyState({title='موردی پیدا نشد',description}:Props){return <StateFrame title={title} description={description}/>}
export function ErrorState({title='خطایی رخ داده',description='لطفاً دوباره تلاش کنید.',onRetry}:Props){return <StateFrame title={title} description={description} action={onRetry?<AppButton title="تلاش دوباره" onPress={onRetry} variant="outline"/>:undefined}/>}
