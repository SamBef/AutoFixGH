import { Redirect } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { useSession } from '../src/hooks/useSession'
import { colors } from '../src/constants/theme'

export default function Index() {
  const { session, loading } = useSession()

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.brand }}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    )
  }

  return session ? <Redirect href="/(app)/home" /> : <Redirect href="/(auth)/welcome" />
}
