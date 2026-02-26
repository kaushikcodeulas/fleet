// app/_layout.tsx

import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  const MainLayout = () => {
    const router = useRouter()
    useEffect(()=>{
      setTimeout(() => {
        router.replace('/signin')
      }, 1500);
    },[])
    return <Slot />
  }
  return (
    <SafeAreaView style={styles.container}>
        <MainLayout />
    </SafeAreaView>
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