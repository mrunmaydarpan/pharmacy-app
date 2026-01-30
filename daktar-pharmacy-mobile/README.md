# Daktar Pharmacy Mobile App

A React Native mobile application for pharmacy staff and admins to manage patients, book diagnostic tests, track commissions, and view reports.

**Target Users**: Pharmacy Staff/Admin

## Features

- **Authentication**: Login with email and password
- **Dashboard**: Quick overview of total patients, diagnostic tests, wallet balance, and commissions
- **Patient Management**: View, add, and manage patient records
- **Diagnostic Tests**: View available tests and book tests for patients
- **Reports**: View diagnostic test reports and results
- **Wallet Management**: Track wallet balance and commission earnings
- **Ledger**: View transaction history and commission details
- **Profile Management**: Manage pharmacy profile and settings

## Tech Stack

- **Framework**: React Native (Expo)
- **Navigation**: React Navigation (Bottom Tabs + Stacks)
- **State Management**: Redux Toolkit
- **API Client**: Axios
- **Storage**: AsyncStorage
- **Language**: TypeScript

## Project Structure

```
src/
├── screens/              # Screen components
│   ├── LoginScreen
│   ├── DashboardScreen
│   ├── PatientsScreen
│   ├── DiagnosticTestsScreen
│   ├── ReportsScreen
│   ├── WalletScreen
│   ├── ProfileScreen
│   ├── AddPatientScreen
│   ├── PatientDetailScreen
│   ├── BookDiagnosticScreen
│   └── ReportDetailScreen
├── navigation/           # React Navigation setup
├── store/               # Redux store & slices
├── services/            # API service layer
├── types/               # TypeScript interfaces
├── hooks/               # Custom hooks
└── utils/               # Utility functions
```

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure API URL**:
   Update `API_URL` in `src/services/apiService.ts` with your backend API server.

3. **Run the app**:
   - iOS: `npm run ios`
   - Android: `npm run android`
   - Web: `npm run web`

## Navigation Structure

**Bottom Tabs**:
- Dashboard - Overview and quick actions
- Patients - Manage patient records
- Diagnostic - Book diagnostic tests
- Reports - View diagnostic reports
- Wallet - Commission and balance tracking
- Profile - Pharmacy settings

## API Integration

All API calls go through `src/services/apiService.ts`.

### Available Endpoints

- **Authentication**: `/auth/login`, `/auth/register`, `/auth/logout`
- **Patients**: `/patient`, `/patient/:id`
- **Diagnostic Tests**: `/diagnostic`, `/diagnostic/:id`
- **Reports**: `/diagnostic/reports`, `/diagnostic/reports/:id`
- **Wallet**: `/wallet`, `/wallet/deposit`, `/wallet/withdraw`
- **Ledger**: `/ledger`
- **Pharmacy**: `/pharmacies/:id`

## Redux Store

State management with Redux includes:

- **auth**: User authentication, pharmacy information, and session management

## Running the App

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Build for production (Android)
eas build --platform android

# Build for production (iOS)
eas build --platform ios
```

## Development

The app supports both iOS and Android through Expo. Use Expo Go for quick testing during development.

## License

MIT

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
