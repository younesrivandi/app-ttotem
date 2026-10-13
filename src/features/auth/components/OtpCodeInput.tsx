import { useRef } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { normalizeDigits } from '../model/otp';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  error?: string;
};

export function OtpCodeInput({ value, onChange, onSubmit, error }: Props) {
  const input = useRef<TextInput>(null);
  const digits = value.split('');
  return (
    <View style={{ gap: 10 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="ورود کد شش رقمی"
        accessibilityHint="برای تایپ کد پیامک لمس کنید"
        onPress={() => input.current?.focus()}
        style={{ position: 'relative', flexDirection: 'row', gap: 7, justifyContent: 'space-between', minHeight: 64 }}
      >
        {Array.from({ length: 6 }, (_, index) => (
          <View key={index} style={{
            flex: 1, maxWidth: 54, minWidth: 0, height: 58,
            alignItems: 'center', justifyContent: 'center',
            borderRadius: 15, borderWidth: index === value.length ? 2 : 1.5,
            borderColor: index === value.length ? '#9855E6' : '#E3DBE9',
            backgroundColor: '#F7F5FA',
          }}>
            <AppText style={{ color: '#332046', fontSize: 23, textAlign: 'center', fontWeight: '600' }}>{digits[index] ?? ''}</AppText>
          </View>
        ))}
        <TextInput
          ref={input}
          value={value}
          onChangeText={(text) => onChange(normalizeDigits(text).replace(/[^0-9]/g, '').slice(0, 6))}
          keyboardType="number-pad"
          autoComplete="sms-otp"
          textContentType="oneTimeCode"
          maxLength={6}
          caretHidden
          onSubmitEditing={onSubmit}
          accessibilityLabel="کد یک بار مصرف"
          style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.015, color: 'transparent' }}
        />
      </Pressable>
      {!!error && <AppText variant="caption" tone="error" accessibilityRole="alert">{error}</AppText>}
    </View>
  );
}
