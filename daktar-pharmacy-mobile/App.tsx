import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from './src/store';
import { useAppDispatch } from './src/hooks/useAppDispatch';
import { setUser } from './src/store/authSlice';
import { RootNavigator } from './src/navigation/RootNavigator';
import { StyleSheet } from 'react-native';

function AppContent() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const user = await AsyncStorage.getItem('user');
        const pharmacy = await AsyncStorage.getItem('pharmacy');

        if (token && user && pharmacy) {
          dispatch(setUser({
            token,
            user: JSON.parse(user),
            pharmacy: JSON.parse(pharmacy),
          }));
        }
      } catch (error) {
        console.error('Error restoring session:', error);
      }
    };

    restoreSession();
  }, [dispatch]);

  return <RootNavigator />;
}

import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider style={styles.container}>
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191717ff',
    paddingBottom: 12,
    paddingTop: 35,
  },
});