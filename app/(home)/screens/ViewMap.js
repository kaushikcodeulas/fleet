import React, { useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { StatusBar } from 'expo-status-bar';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Linking, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ViewMap() {
    const [locationCoords, setLocationCoords] = useState([])
    const mapRef = useRef(null);
    const route = useRouter();
    const { data } = useLocalSearchParams();
    const tripDetails = data ? JSON.parse(data) : route.back();

    const origin = "place_id:"+tripDetails?.pick_up_place_id;
    const destination = "place_id:"+tripDetails?.drop_in_place_id;
    const stops = tripDetails?.stops?.map((elem)=>{
        return "place_id:"+elem.place_id
    });

    const whiteMapStyle = [
        {
            "elementType": "geometry",
            "stylers": [{ "color": "#ffffff" }] // Set base map to white
        },
        {
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#000000" }] // Labels to black
        },
        {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [{ "color": "#c5c5c5" }] // Roads to light grey
        },
        {
            "featureType": "poi",
            "elementType": "labels",
            "stylers": [{ "color": "#eeeeee", "visibility": "off" }] // POI to light grey
        },
        {
            "featureType": "transit",
            "elementType": "labels",
            "stylers": [{ "visibility": "off" }]
        }
        // Add more features to turn white if needed
    ];




    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={{ flex: 1 }}
                customMapStyle={whiteMapStyle}
            >
                {/* 1. Draw the Route */}
                <MapViewDirections
                    origin={origin}
                    destination={destination}
                    waypoints={stops}
                    apikey={'AIzaSyBGIm2P5Vav9zkOABLCe5QIEjkhyoFpD7g'}
                    strokeWidth={8}
                    strokeColor="#004bc4" // Google Maps Blue
                    optimizeWaypoints={true} // Reorders stops for efficiency
                    onReady={(result) => {
                        // 2. Auto-scale map to show all stops
                        mapRef.current.fitToCoordinates(result.coordinates, {
                            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                        });
                        const Coords = [];
                        result.legs.forEach((element, index) => {
                            Coords.push({ "latitude": element.start_location.lat, "longitude": element.start_location.lng })
                            if ((result.legs.length - 1) == index) {
                                Coords.push({ "latitude": element.end_location.lat, "longitude": element.end_location.lng })
                            }
                        })
                        setLocationCoords(Coords)
                        // console.log(result.coordinates)
                    }}
                />
                {locationCoords.length > 0 && (locationCoords.map((cords, index) => {
                    return <Marker key={index} coordinate={cords}>
                        <View style={styles.customMarkerView}>
                            {
                                index == 0 ?
                                    <Image source={require("../../../assets/images/truck-icon.png")} style={{ width: 40, height: 40 }} />
                                    :
                                    (locationCoords.length - 1 == index)
                                        ?
                                        <View style={{backgroundColor: "#fff"}}>
                                            <FontAwesome6 name="warehouse" size={24} color="#048500" />
                                        </View>
                                        :
                                        <MaterialIcons name="add-location-alt" size={40} color="#e20008" />
                            }
                        </View>
                    </Marker>
                }))}

            </MapView>
            {/* 2. The Top Layer: The Overlay */}
            <View style={styles.overlayContainer} pointerEvents="box-none">
                <TouchableOpacity style={styles.floatingCard} onPress={() => { route.push({pathname: '/screens/ViewDirection', params: { cordsData: JSON.stringify(locationCoords)}}) }}>
                    <View style={styles.button}>
                        <FontAwesome6 name="location-arrow" size={26} color="black" />
                        <Text style={styles.buttonText}>Get Started</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end', // Aligns overlay to bottom (Uber style)
        padding: 10,
        paddingBottom: 15
    },
    floatingCard: {
        backgroundColor: '#ffc107',
        paddingVertical: 15,
        borderRadius: 15,
        elevation: 5, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        top: 0,
    },
    button: {
        flexDirection: "row",
        gap: 7,
        justifyContent: "center",
        alignItems: "center"
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 600
    }
});
