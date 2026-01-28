# HyperX Mobile Wallet

A React Native mobile application built with Expo for managing cryptocurrency wallets.

## Features

- User authentication (login/signup)
- Multiple cryptocurrency support
- Send and receive crypto
- Convert and swap between currencies
- Transaction history
- Portfolio overview
- Dark/Light theme support
- QR code scanning for addresses

## Prerequisites

- Node.js (v14 or later)
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Studio (for Android development)
- Expo Go app on your mobile device (for testing on real devices)

## Installation

1. Navigate to the mobile-app directory:
```bash
cd mobile-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## Running the App

### On iOS Simulator (Mac only)
```bash
npm run ios
```

### On Android Emulator
```bash
npm run android
```

### On Physical Device
1. Install the Expo Go app from App Store or Google Play
2. Scan the QR code shown in the terminal or Metro Bundler
3. The app will load on your device

## Project Structure

```
mobile-app/
├── App.js                 # Main app component
├── src/
│   ├── contexts/          # React Context providers
│   │   ├── AuthContext.js
│   │   ├── WalletContext.js
│   │   └── ThemeContext.js
│   ├── navigation/        # Navigation setup
│   │   └── AppNavigator.js
│   ├── screens/           # App screens
│   │   ├── WelcomeScreen.js
│   │   ├── LoginScreen.js
│   │   ├── SignupScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── SendScreen.js
│   │   ├── ReceiveScreen.js
│   │   ├── HistoryScreen.js
│   │   ├── ProfileScreen.js
│   │   ├── SettingsScreen.js
│   │   ├── ConvertScreen.js
│   │   ├── SwapScreen.js
│   │   └── AssetChartScreen.js
│   ├── lib/               # Utilities and API clients
│   │   ├── supabase.js
│   │   └── utils.js
│   └── config/            # Configuration files
│       └── env.js
├── assets/                # Images, fonts, etc.
├── .env                   # Environment variables
└── package.json
```

## Environment Variables

The app uses Supabase for authentication and data storage. Environment variables are configured in `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser

## Technologies Used

- React Native
- Expo
- React Navigation
- Supabase (Backend & Auth)
- AsyncStorage (Local storage)
- Expo Secure Store (Secure token storage)
- React Native QR Code

## API Integration

The app connects to the HyperX backend API at `https://api.hyperx.llc` for:
- User authentication
- Wallet balance retrieval
- Transaction history
- Crypto conversions and swaps

## Security

- User credentials are securely stored using Expo Secure Store
- All API requests are authenticated with JWT tokens
- Sensitive data is encrypted at rest

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.

## Support

For support, email support@hyperx.llc
