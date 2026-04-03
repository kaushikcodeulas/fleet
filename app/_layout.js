// app/_layout.tsx

import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CommonContextProvider } from "../context/CommonContext";
import { Provider, useDispatch } from "react-redux";
import { store } from "../redux/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setDriverDetails, setUserData } from "../redux/homeSlice";
import { useIsFocused } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { NavigationProvider, NavigationView, useNavigation } from '@googlemaps/react-native-navigation-sdk'


export default function RootLayout() {
  const MainLayout = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const focus = useIsFocused();
    async function getItem(key) {
      try {
        const response = await AsyncStorage.getItem(key);
        return JSON.parse(response);
      } catch (error) {
        return undefined;
      }
    }
    useEffect(() => {
      getItem('userData').then((data) => {
        if (data) {
          dispatch(setUserData({ details: data }));
          if (data?.token) {
            getDriverDetails(data?.token).then((resData) => {
              if (resData?.status) {
                dispatch(setDriverDetails({ details: resData?.details }))
                router.replace('home')
              }
            })
          }
        } else {
          router.replace('/signin')
        }
      })
    }, [])

    async function getDriverDetails(token) {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/driver_details/profile`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      })
      return response.json()
    }

    return <Slot />
  }
  return (
    <NavigationProvider termsAndConditionsDialogOptions={{ title: 'Terms', companyName: 'My App' }}>
      <Provider store={store}>
        <CommonContextProvider>
          <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <MainLayout />
          </SafeAreaView>
        </CommonContextProvider>
      </Provider>
    </NavigationProvider >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ECF0F1',
  },
  buttonsContainer: {
    padding: 10,
  },
  textStyle: {
    textAlign: 'center',
    marginBottom: 8,
  },
});