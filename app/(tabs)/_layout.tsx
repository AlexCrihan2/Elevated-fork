import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/contexts/LocalizationContext';

interface TabIconProps {
  name: keyof typeof MaterialIcons.glyphMap;
  focused: boolean;
  color: string;
  size?: number;
  tabIndex: number;
}

// Color palette for each tab dot — Warm spectrum (Reds, Oranges, Yellows, Browns)
const TAB_COLORS = [
  ['#D35400', '#A04000'],   // Home - burnt orange
  ['#E67E22', '#BA4A00'],   // Tags - orange
  ['#F39C12', '#CA6F1E'],   // News - amber
  ['#F1C40F', '#D4AC0D'],   // Trending - yellow
  ['#8D6E63', '#6D4C41'],   // Chat - warm brown
  ['#A1887F', '#795548'],   // Branding - light brown
  ['#5D4037', '#3E2723'],   // Weather - dark brown
  ['#E67E22', '#D35400'],   // Profile - orange-red
];

const TabIcon = ({ name, focused, color, size = 24, tabIndex }: TabIconProps) => {
  const dotColors = TAB_COLORS[tabIndex] || TAB_COLORS[0];
  return (
    <View style={{ alignItems: 'center' }}>
      <MaterialIcons
        name={name}
        size={size}
        color={focused ? dotColors[0] : color}
        style={{ opacity: focused ? 1 : 0.6 }}
      />
      {focused && (
        <View style={{
          width: 18,
          height: 4,
          borderRadius: 2,
          marginTop: 2,
          backgroundColor: dotColors[0],
          shadowColor: dotColors[0],
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.7,
          shadowRadius: 4,
          elevation: 4,
        }} />
      )}
    </View>
  );
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { t } = useLocalization();
  
  const tabBarHeight = Platform.select({
    ios: 70 + Math.max(insets.bottom, 0),
    android: 70 + Math.max(insets.bottom, 0),
    web: 70,
    default: 70
  });
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.iconActive,
        tabBarInactiveTintColor: theme.colors.iconInactive,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
          borderTopWidth: 0.5,
          borderTopColor: theme.colors.border,
          paddingBottom: Platform.select({
            ios: Math.max(insets.bottom, 8),
            android: Math.max(insets.bottom, 8),
            web: 8,
            default: 8
          }),
          paddingTop: 8,
          height: tabBarHeight,
          elevation: Platform.select({ android: 8, default: 0 }),
          shadowOpacity: Platform.select({ ios: isDark ? 0.3 : 0.1, default: 0 }),
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 0,
        },
        tabBarHideOnKeyboard: Platform.OS !== 'web',
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" focused={focused} color={color} tabIndex={0} />
          ),
        }}
      />
      <Tabs.Screen
        name="tags"
        options={{
          title: 'Tags',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="local-offer" focused={focused} color={color} tabIndex={1} />
          ),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: t('news'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="article" focused={focused} color={color} tabIndex={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="trending"
        options={{
          title: t('trending'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="trending-up" focused={focused} color={color} tabIndex={3} />
          ),
        }}
      />
      <Tabs.Screen
        name="subs"
        options={{
          title: t('chat'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="chat-bubble-outline" focused={focused} color={color} tabIndex={4} />
          ),
        }}
      />
      <Tabs.Screen
        name="branding"
        options={{
          title: 'Branding',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="palette" focused={focused} color={color} tabIndex={5} />
          ),
        }}
      />
      <Tabs.Screen 
        name="weather"
        options={{
          title: 'Weather',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="wb-sunny" focused={focused} color={color} tabIndex={6} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person" focused={focused} color={color} tabIndex={7} />
          ),
        }}
      />
      <Tabs.Screen name="marketplace" options={{ href: null }} />
    </Tabs>
  );
}