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
        </Stack>
    )
}

export default HomeLayout