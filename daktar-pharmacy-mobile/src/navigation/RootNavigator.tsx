import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

// Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import DashboardScreen from '../screens/DashboardScreen';
import PatientsScreen from '../screens/PatientsScreen';
import DiagnosticTestsScreen from '../screens/DiagnosticTestsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import WalletScreen from '../screens/WalletScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddPatientScreen from '../screens/AddPatientScreen';
import PatientDetailScreen from '../screens/PatientDetailScreen';
import BookDiagnosticScreen from '../screens/BookDiagnosticScreen';
import ReportDetailScreen from '../screens/ReportDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
    </Stack.Navigator>
  );
}

function PatientsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="PatientsList" component={PatientsScreen} options={{ title: 'Patients' }} />
      <Stack.Screen name="AddPatient" component={AddPatientScreen} options={{ title: 'Add Patient' }} />
      <Stack.Screen name="PatientDetail" component={PatientDetailScreen} options={{ title: 'Patient Details' }} />
    </Stack.Navigator>
  );
}

function DiagnosticStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: '#0094b8' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="TestsList" component={DiagnosticTestsScreen} options={{ title: 'Diagnostic Tests' }} />
      <Stack.Screen name="BookTest" component={BookDiagnosticScreen} options={{ title: 'Book Test' }} />
    </Stack.Navigator>
  );
}

function ReportsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#0094b8' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="ReportsList" component={ReportsScreen} options={{ title: 'Reports' }} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: 'Report Details' }} />
    </Stack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0094b8',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: { 
          borderTopColor: '#f0f0f0',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
          backgroundColor: '#ffffff',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStack}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 24 }}>{focused ? '🏠' : '🏠'}</Text>
          ),
        }}
      />
      <Tab.Screen
        name="PatientsTab"
        component={PatientsStack}
        options={{
          title: 'Patients',
          tabBarLabel: 'Patients',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 24 }}>{focused ? '👥' : '👥'}</Text>
          ),
        }}
      />
      <Tab.Screen
        name="DiagnosticTab"
        component={DiagnosticStack}
        options={{
          title: 'Diagnostic',
          tabBarLabel: 'Diagnostic',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 24 }}>{focused ? '🧬' : '🧬'}</Text>
          ),
        }}
      />
      <Tab.Screen
        name="WalletTab"
        component={WalletScreen}
        options={{
          title: 'Wallet',
          tabBarLabel: 'Wallet',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 24 }}>{focused ? '💰' : '💰'}</Text>
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 24 }}>{focused ? '👤' : '👤'}</Text>
          ),
          headerShown: false,
          headerStyle: { backgroundColor: '#0094b8' },
          headerTintColor: '#fff',
        }}
      />
    </Tab.Navigator>
  );
}

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
  </Stack.Navigator>
);

export function RootNavigator() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);

  console.log('RootNavigator - isAuthenticated:', isAuthenticated, 'user:', user?.id);

  return (
    <NavigationContainer key={isAuthenticated ? 'authenticated' : 'unauthenticated'}>
      {isAuthenticated ? (
        <AppTabs />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
