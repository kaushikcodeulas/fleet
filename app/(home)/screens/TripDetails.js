import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native'
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { homeValue } from '../../../redux/homeSlice';
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import LoadingComp from '../../../component/common/LoadingComp';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';

const screenHeight = Dimensions.get("screen").height

function formatDateTime(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);

    const day = date.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${day} ${month}, ${year} ${hours}:${minutes} ${ampm}`;
}

const getStatusIcon = (status) => {
    switch (status) {
        case '1':
            return <AntDesign name="book" size={20} color="#999" />;
        case '2':
            return <MaterialCommunityIcons name="timer-sand" size={20} color="#f1c40f" /> ;
        case '3':
            return <AntDesign name="check-circle" size={20} color="#2ecc71" />;
        default:
            return <MaterialIcons name="cancel"  size={20} color="#e74c3c" />;
    }
};

const getStatusStatus = (status) => {
    switch (status) {
        case '1':
            return "Booked";
        case '2':
            return "Started";
        case '3':
            return "Completed";
        default:
            return "Calcelled";
    }
};

const TripDetails = () => {
    const { id } = useLocalSearchParams()
    const userData = useSelector(homeValue)?.userData;
    const [loading, setLoading] = useState(true)
    const [tripDetails, setTripDetails] = useState(null)

    async function getTripDetails() {
        try {
            const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/trip/getPaticularTrip`, {
                id: id
            },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userData?.token}`
                    }
                });
            return response.data;
        } catch (error) {
            return error;
        }
    }

    useEffect(() => {
        setLoading(true)
        getTripDetails().then((data) => {
            console.log(data)
            setTripDetails(data?.details)
            setLoading(false)
        }).catch((error) => {
            setLoading(false)
        })
    }, [])


    return (
        <ScrollView style={styles.container}>
            {loading ?
                <View style={{ height: screenHeight / 1.2, justifyContent: "center", alignContent: "center" }}>
                    <LoadingComp />
                </View>
                :
                <>
                    {/* 🔥 Header */}
                    <LinearGradient colors={["#553777", "#a7267a"]} style={styles.header}>

                        <View style={styles.routeRow}>
                            <Ionicons name="location" size={28} color="#2ecc71" />
                            <Text style={styles.routeText}>
                                {tripDetails.pick_up}
                            </Text>
                        </View>
                        <View style={[styles.routeRow, { marginLeft: 30 }]}>
                            <FontAwesome6 name="arrow-down-wide-short" size={20} color="#fff" />
                        </View>
                        <View style={styles.routeRow}>
                            <Ionicons name="location" size={28} color="#e74c3c" />
                            <Text style={styles.routeText}>
                                {tripDetails.drop_in}
                            </Text>
                        </View>
                    </LinearGradient>

                    {/* 🚀 Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statBox}>
                            <FontAwesome5 name="road" size={18} color="#4facfe" />
                            <Text style={styles.statValue}>{tripDetails.approx_km} km</Text>
                            <Text style={styles.statLabel}>Distance</Text>
                        </View>

                        <View style={styles.statBox}>
                            <MaterialIcons name="access-time" size={20} color="#4facfe" />
                            <Text style={styles.statValue}>
                                {tripDetails.estimated_time_hour}h {tripDetails.estimated_time_minutes}m
                            </Text>
                            <Text style={styles.statLabel}>Duration</Text>
                        </View>

                        <View style={styles.statBox}>
                            {getStatusIcon(tripDetails.trip_status)}
                            <Text style={styles.statValue}>{getStatusStatus(tripDetails?.trip_status)}</Text>
                            <Text style={styles.statLabel}>Status</Text>
                        </View>
                    </View>

                    {/* 🚗 Vehicle */}
                    <TouchableOpacity style={styles.card}>
                        <Text style={styles.cardTitle}>Vehicle Info</Text>
                        <View style={{position: "absolute", right: 10, top: 10}}>
                            <Feather name="arrow-right" size={28} color="black" />
                        </View>
                        <View style={styles.row}>
                            <Ionicons name="car" size={18} color="#555" />
                            <Text style={styles.text}>
                                {tripDetails.make} ({tripDetails.vehicle_type})
                            </Text>
                        </View>

                        <View style={styles.row}>
                            <FontAwesome name="drivers-license" size={16} color="#555" />
                            <Text style={styles.text}>{tripDetails.license_plate}</Text>
                        </View>
                        <View style={styles.row}>
                            <MaterialCommunityIcons name="identifier" size={18} color="#555" />
                            <Text style={styles.text}>{tripDetails.vin}</Text>
                        </View>
                        <View style={styles.row}>
                            <Ionicons name="water" size={18} color="#555" />
                            <Text style={styles.text}>{tripDetails.fuel_type}</Text>
                        </View>
                    </TouchableOpacity>


                    
                </>}

        </ScrollView>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f7fb",
    },

    header: {
        padding: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        height: 170,
        elevation: 5
    },

    headerTitle: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10,
    },

    routeRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8
    },

    routeText: {
        color: "#fff",
        marginLeft: 8,
        fontSize: 22,
    },

    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: -25,
        paddingHorizontal: 10,
    },

    statBox: {
        backgroundColor: "#fff",
        width: "30%",
        padding: 12,
        borderRadius: 12,
        alignItems: "center",
        elevation: 3,
    },

    statValue: {
        fontWeight: "bold",
        marginTop: 5,
    },

    statLabel: {
        fontSize: 12,
        color: "#777",
    },

    card: {
        backgroundColor: "#fff",
        margin: 15,
        padding: 15,
        borderRadius: 12,
        elevation: 3,
        marginBottom: 0
    },

    cardTitle: {
        fontWeight: "bold",
        marginBottom: 10,
        fontSize: 16,
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },

    text: {
        marginLeft: 10,
        color: "#333",
    },
});
export default TripDetails