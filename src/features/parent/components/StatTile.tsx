import { View } from 'react-native';
import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { spacing } from '@/theme/tokens';
export function StatTile({label,value,icon}:{label:string;value:string|number;icon:string}) {
 return <View style={{width:'48%',minWidth:135,flexGrow:1}}><AppCard style={{alignItems:'center',padding:spacing.md}}>
 <AppText accessibilityLabel={label} variant="subtitle">{icon}</AppText>
 <AppText variant="subtitle" weight="700" style={{textAlign:'center'}}>{value}</AppText>
 <AppText tone="muted" style={{textAlign:'center'}}>{label}</AppText>
 </AppCard></View>;
}
