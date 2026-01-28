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
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { colors, toggleTheme, isDark } = useTheme();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' },
    ]);
  };

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Edit Profile',
      onPress: () => Alert.alert('Coming Soon', 'Profile editing coming soon'),
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Security',
      onPress: () => Alert.alert('Coming Soon', 'Security settings coming soon'),
    },
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      onPress: () => Alert.alert('Coming Soon', 'Notification settings coming soon'),
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      onPress: () => Alert.alert('Help', 'Contact support@hyperx.llc'),
    },
    {
      icon: 'information-circle-outline',
      title: 'About',
      onPress: () => Alert.alert('About', 'HyperX Wallet v1.0.0'),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={[styles.email, { color: colors.text }]}>{user?.email}</Text>
          <Text style={[styles.userId, { color: colors.textSecondary }]}>ID: {user?.id}</Text>
        </View>

        <View style={styles.section}>
          <View style={[styles.themeToggle, { backgroundColor: colors.surface }]}>
            <View style={styles.themeInfo}>
              <Ionicons
                name={isDark ? 'moon' : 'sunny'}
                size={24}
                color={colors.text}
                style={styles.themeIcon}
              />
              <Text style={[styles.themeText, { color: colors.text }]}>
                {isDark ? 'Dark' : 'Light'} Mode
              </Text>
            </View>
            <TouchableOpacity onPress={toggleTheme}>
              <View
                style={[
                  styles.switch,
                  { backgroundColor: isDark ? colors.primary : colors.border },
                ]}
              >
                <View
                  style={[
                    styles.switchThumb,
                    isDark && styles.switchThumbActive,
                    { backgroundColor: '#FFFFFF' },
                  ]}
                />
              </View>
            </TouchableOpacity>
          </View>

          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { backgroundColor: colors.surface }]}
              onPress={item.onPress}
            >
              <Ionicons name={item.icon} size={24} color={colors.text} style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: colors.text }]}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.error + '20' }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 32,
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  email: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  userId: {
    fontSize: 14,
  },
  section: {
    padding: 24,
    gap: 12,
  },
  themeToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  themeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeIcon: {
    marginRight: 12,
  },
  themeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
