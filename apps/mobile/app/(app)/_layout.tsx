import { Tabs } from 'expo-router'
import { View, StyleSheet, Text } from 'react-native'
import { colors, radius, typography } from '../../src/constants/theme'

function TabIcon({ label, active }: { label: string; active: boolean }) {
  return (
    <View style={[styles.tabIcon, active && styles.tabIconActive]}>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </View>
  )
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Home" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="sos/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.sosTab}>
              <Text style={styles.sosTabText}>SOS</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="garage/index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Garages" active={focused} />,
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    height: 72,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabIcon: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  tabIconActive: {
    backgroundColor: colors.brand + '10',
  },
  tabLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.brand,
  },
  sosTab: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  sosTabText: {
    color: colors.textInverse,
    fontSize: typography.micro,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
})
