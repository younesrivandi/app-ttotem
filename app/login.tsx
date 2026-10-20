import { ImageBackground, KeyboardAvoidingView, Platform, ScrollView, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ParentLoginForm } from '@/features/auth/components/ParentLoginForm';

/** The artwork and form share a mobile-sized canvas on desktop web. */
export default function Login() {
  const { height } = useWindowDimensions();
  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: '#E8E5EE' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={{ flex: 1, width: '100%', maxWidth: 440, alignSelf: 'center', overflow: 'hidden' }}>
        <ImageBackground
          source={require('../assets/image/bg-login.png')}
          resizeMode="cover"
          style={{ flex: 1, backgroundColor: '#96C7F2' }}
          imageStyle={{ width: '100%', height: '100%' }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            contentContainerStyle={{
              minHeight: Math.max(height - 60, 680),
              paddingHorizontal: 30,
              paddingTop: Math.min(Math.max(height * 0.17, 100), 180),
              paddingBottom: 56,
            }}
          >
            <ParentLoginForm />
          </ScrollView>
        </ImageBackground>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
