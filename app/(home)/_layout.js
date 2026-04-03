import { Stack } from 'expo-router';

const HomeLayout = () => {
    return (
        <Stack
            screenOptions={{
                // headerShown: false,
            }}
        >
            {/* Configure specific screens */}
            <Stack.Screen name="(tabs)" options={{ title: '', headerShown: false }} />
            <Stack.Screen name="screens/AllTrips" options={{ title: '', headerShown: true, headerTitle: "Trip History" }} />
            <Stack.Screen name="screens/ProfileEdit" options={{ title: '', headerShown: true, headerTitle: "Edit Profile" }} />
            <Stack.Screen name="screens/TripDetails" options={{ title: '', headerShown: true, headerTitle: "Trip Overview" }} />
            <Stack.Screen name="screens/Activity" options={{ title: '', headerShown: true, headerTitle: "Activity Overview" }} />
            <Stack.Screen name="screens/AddActivity" options={{ title: '', headerShown: true, headerTitle: "" }} />
            <Stack.Screen name="screens/Report" options={{ title: '', headerShown: true, headerTitle: "Trip Reports" }} />
            <Stack.Screen name="screens/AddReport" options={{ title: '', headerShown: true, headerTitle: "" }} />
            <Stack.Screen name="screens/ViewMap" options={{ title: '', headerShown: false, headerTitle: "" }} />
            <Stack.Screen name="screens/ViewDirection" options={{ title: '', headerShown: false, headerTitle: "" }} />
        </Stack>
    )
}

export default HomeLayout