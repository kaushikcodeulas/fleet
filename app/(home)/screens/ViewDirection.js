import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import {
    NavigationView,
    useNavigation,
    TravelMode,
} from '@googlemaps/react-native-navigation-sdk';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Entypo from '@expo/vector-icons/Entypo';

const ViewDirection = () => {
    const { navigationController, isInitialized } = useNavigation();
    const [isReady, setIsReady] = useState(false);
    const [status, setStatus] = useState('Waiting for map...');
    const { cordsData } = useLocalSearchParams();
    console.log(cordsData)

    const requestLocationPermission = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
            setStatus('Location permission denied ❌');
            return false;
        }

        return true;
    };
    // ── Step 1: Initialize navigator when map is ready ─────────────
    const onMapReady = async () => {
        try {
            setStatus('Checking location permission...');

            const granted = await requestLocationPermission();
            if (!granted) return;

            setStatus('Initializing navigator...');

            const response = await navigationController.init();
            console.log(response)
            // 🔥 IMPORTANT FIX (wait for native layer)
            setTimeout(() => {
                setIsReady(true);
                setStatus('Navigator ready ✅');
            }, 5000); // 1.5 sec delay

        } catch (error) {
            setStatus('Init failed: ' + error.message);
            console.error('Navigator init failed:', error);
        }
    };

    // ── Step 2: Start navigation only after init ───────────────────
    const startTripWithStops = async () => {
        if (!isReady || !navigationController) {
            setStatus('Navigator not ready yet!');
            return;
        }

        try {
            setStatus('Setting destinations...');
            // const cords = cordsData.map((elem, index)=>{ 
            //     if(index == 0){
            //         return {
            //             title: 'Start',
            //             position: { lat: elem.longitude, lng: elem.latitude }
            //         }
            //     }else if(index == cordsData.length - 1){
            //         return {
            //             title: 'End',
            //             position: { lat: elem.longitude, lng: elem.latitude }
            //         }
            //     }else{
            //         return {
            //             title: `Stop ${index}`,
            //             position: { lat: elem.longitude, lng: elem.latitude }
            //         }
            //     }
            // })
            await navigationController.setDestinations(
                [
                    {
                        title: 'Stop 1',
                        position: { lat: 22.8895, lng: 88.4220 },
                    },
                    {
                        title: 'Final Destination',
                        position: { lat: 22.5744, lng: 88.3629 },
                    },
                ],
                {
                    travelMode: TravelMode.DRIVING,
                }
            );

            // 🔥 Add small delay again
            await new Promise(resolve => setTimeout(resolve, 1000));

            await navigationController.startGuidance();

            setStatus('Navigation started ✅');
        } catch (error) {
            setStatus('Navigation failed: ' + error.message);
            console.error(error);
        }
    };

    const stopNavigation = async () => {
        try {
            await navigationController.stopGuidance();
            setStatus('Navigation stopped');
        } catch (error) {
            console.error('Stop failed:', error);
        }
    };

    useEffect(() => {
        if (isInitialized) {
            setTimeout(() => {
                setIsReady(true);
                setStatus('Navigator ready ✅');
            }, 1500);
        }
    }, [isInitialized]);

    return (
        <View style={styles.container}>
            {/* ── Map View ── */}
            <NavigationView
                style={styles.map}
                onMapReady={onMapReady}           // ← initialize here
                androidStylingOptions={{
                    primaryDayModeThemeColor: '#34aadc',
                    headerDistanceValueTextColor: '#ffffff',
                }}
            />

            {/* ── Controls ── */}
            <View style={styles.controls}>
                {!isReady && <Text style={styles.status}>{status}</Text>}
                {isReady && <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                    <TouchableOpacity style={[styles.floatingCard, {backgroundColor: "red"}]} onPress={()=>{isReady ? stopNavigation() : null}}>
                        <View style={styles.button}>
                            <Entypo name="cross" size={24} color="#fff" />
                            <Text style={[styles.buttonText]}>End Trip</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.floatingCard} onPress={()=>{isReady ? startTripWithStops() : null}}>
                        <View style={styles.button}>
                            <FontAwesome6 name="location-arrow" size={26} color="#fff" />
                            <Text style={styles.buttonText}>Start Trip</Text>
                        </View>
                    </TouchableOpacity>
                </View>}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    controls: {
        padding: 16,
        backgroundColor: '#fff',
        gap: 8,
    },
    status: {
        textAlign: 'center',
        marginBottom: 8,
        color: '#555',
        fontSize: 13,
    },
    spacer: {
        height: 8,
    },
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end', // Aligns overlay to bottom (Uber style)
        padding: 10,
        paddingBottom: 15
    },
    floatingCard: {
        backgroundColor: '#198754',
        paddingVertical: 10,
        borderRadius: 10,
        elevation: 5, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        top: 0,
        width: "48%"
    },
    button: {
        flexDirection: "row",
        gap: 7,
        justifyContent: "center",
        alignItems: "center"
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 600,
        color: "#fff"
    }
});

export default ViewDirection;