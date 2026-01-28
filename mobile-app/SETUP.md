# Mobile App Setup Guide

## Quick Start

1. **Install dependencies**
```bash
cd mobile-app
npm install
```

2. **Start the development server**
```bash
npm start
```

3. **Run on your preferred platform**
   - Press `i` for iOS simulator (Mac only)
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## Testing on Physical Devices

### iOS (iPhone/iPad)
1. Install "Expo Go" from the App Store
2. Ensure your phone and computer are on the same WiFi network
3. Open Expo Go and scan the QR code from the terminal

### Android
1. Install "Expo Go" from Google Play Store
2. Ensure your phone and computer are on the same WiFi network
3. Open Expo Go and scan the QR code from the terminal

## Building for Production

### iOS App Store
```bash
expo build:ios
```

### Google Play Store
```bash
expo build:android
```

## Troubleshooting

### Metro Bundler Issues
If you encounter issues with the Metro bundler:
```bash
npm start -- --clear
```

### Module Not Found
```bash
rm -rf node_modules
npm install
```

### iOS Simulator Not Opening
Make sure you have Xcode installed and the command line tools configured:
```bash
xcode-select --install
```

### Android Emulator Issues
Make sure Android Studio is installed and you have at least one AVD (Android Virtual Device) configured.

## Environment Setup

The app uses environment variables for configuration. These are already set up in `.env` file:
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Features Overview

- **Authentication**: Email/password login and signup
- **Wallet Management**: View balances for multiple cryptocurrencies
- **Transactions**: Send, receive, convert, and swap crypto
- **History**: View transaction history
- **Profile**: Manage user settings and preferences
- **Dark Mode**: Automatic theme switching

## Development Tips

1. Use hot reload during development - changes will reflect immediately
2. Check console logs in the terminal for debugging
3. Use React DevTools for component debugging
4. Test on both iOS and Android for platform-specific issues

## Important Notes

- The mobile app shares the same backend API with the web version
- All transactions are processed through the HyperX API
- User authentication state is persisted using Expo Secure Store
- Local data is cached using AsyncStorage for better performance
