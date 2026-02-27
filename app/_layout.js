// app/_layout.tsx

import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CommonContextProvider } from "../context/CommonContext";
import { Provider, useDispatch } from "react-redux";
import { store } from "../redux/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setDriverDetails } from "../redux/homeSlice";

export default function RootLayout() {
  const MainLayout = () => {
    const router = useRouter();
    const dispatch = useDispatch();

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
          if (data?.token) {
            getDriverDetails(data?.token).then((resData) => {
              if (resData?.status) {
                dispatch(setDriverDetails({ details: resData }))
                router.replace('(tabs)')
              }
            })
          }
        } else {
          router.replace('/signin')
        }
      })
    }, [])

    async function getDriverDetails(token) {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}api/driver_details/profile`, {
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
    <Provider store={store}>
      <CommonContextProvider>
        <SafeAreaView style={styles.container}>
          <MainLayout />
        </SafeAreaView>
      </CommonContextProvider>
    </Provider>
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