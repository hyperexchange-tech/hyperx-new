import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { colors } = useTheme();

  const settingsItems = [
    {
      icon: 'lock-closed-outline',
      title: 'Change PIN',
      onPress: () => Alert.alert('Coming Soon', 'PIN change feature coming soon'),
    },
    {
      icon: 'key-outline',
      title: 'Backup Wallet',
      onPress: () => Alert.alert('Coming Soon', 'Wallet backup feature coming soon'),
    },
    {
      icon: 'cash-outline',
      title: 'Currency',
      subtitle: 'USD',
      onPress: () => Alert.alert('Coming Soon', 'Currency selection coming soon'),
    },
    {
      icon: 'language-outline',
      title: 'Language',
      subtitle: 'English',
      onPress: () => Alert.alert('Coming Soon', 'Language selection coming soon'),
    },
    {
      icon: 'document-text-outline',
      title: 'Terms of Service',
      onPress: () => Alert.alert('Terms', 'Terms of Service coming soon'),
    },
    {
      icon: 'shield-outline',
      title: 'Privacy Policy',
      onPress: () => Alert.alert('Privacy', 'Privacy Policy coming soon'),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {settingsItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.settingItem, { backgroundColor: colors.surface }]}
            onPress={item.onPress}
          >
            <Ionicons name={item.icon} size={24} color={colors.text} style={styles.icon} />
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
              {item.subtitle && (
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  {item.subtitle}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
});
