import { useRef, useEffect } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';


const LoadingView = () => {
    const animation = useRef(null);
    useEffect(() => {
        // You can control the ref programmatically, rather than using autoPlay
        animation.current?.play();
    }, []);


    return (
        <View style={styles.animationContainer}>
            <LottieView
                autoPlay
                ref={animation}
                style={{
                    width: 500,
                    height: 300,
                    backgroundColor: '#eee',
                }}
                // Find more Lottie files at https://lottiefiles.com/featured
                source={require('../assets/lottiefiles/Car_loading.json')}
            />
        </View>
    )
}
const styles = StyleSheet.create({
    animationContainer: {
        backgroundColor: '#efefef',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    buttonContainer: {
        paddingTop: 20,
    },
});
export default LoadingView