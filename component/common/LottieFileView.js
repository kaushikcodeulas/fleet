import { useRef, useEffect } from 'react';
import { Button, StyleSheet, View, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';


const LottieFileView = ({file}) => {
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
                    backgroundColor: '#fff',
                }}
                // Find more Lottie files at https://lottiefiles.com/featured
                source={file}
            />
            <Text>No Data Found!</Text>
        </View>
    )
}
const styles = StyleSheet.create({
    animationContainer: {
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    buttonContainer: {
        paddingTop: 20,
    },
});
export default LottieFileView