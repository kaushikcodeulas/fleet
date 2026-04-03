import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from '@expo/vector-icons/AntDesign';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import TimeConvert from "../common/TimeConvert";
import { useRouter } from "expo-router";

const getStatusColor = (status) => {
    switch (status) {
        case '1':
            return "#999";
        case '2':
            return "#f1c40f";
        case '3':
            return "#2ecc71";
        default:
            return "#e74c3c";
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


const TripCard = ({ item, length }) => {
    const router = useRouter();
    return (
        <View style={styles.card}>
            <View style={[styles.row, { flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start" }]}>
                <View style={styles.row}>
                    <Ionicons name="location-outline" size={20} color="#2ecc71" />
                    <Text style={styles.route}>
                        {item.pick_up}
                    </Text>
                </View>
                <View style={{ marginStart: 25, marginBottom: 8, flexDirection: "row" }}>
                    <FontAwesome6 name="arrow-down-short-wide" size={24} color="#6e6e6e" />
                    {/* <FontAwesome6 name="truck-front" size={24} color="#6e6e6e" /> */}
                </View>
                <View style={styles.row}>
                    <Ionicons name="location-outline" size={20} color="#e74c3c" />
                    <Text style={styles.route}>
                        {item.drop_in}
                    </Text>
                </View>
            </View>

            <View style={styles.rowBetween}>
                <View>
                    <Text style={styles.label}><EvilIcons name="calendar" size={18} color="black" /> {item.end_date ? <TimeConvert time={item.end_date} /> : 'Ongoing'}</Text>
                    <Text style={styles.label}><AntDesign name="truck" size={15} color="black" /> {item.approx_km}km</Text>
                </View>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => { router.push({pathname: "/screens/TripDetails", params: {id : item.id}})}}
                >
                    <Text style={styles.buttonText}>View Details</Text>
                </TouchableOpacity>
            </View>

            <Text
                style={[
                    styles.status,
                    { backgroundColor: getStatusColor(item.trip_status) },
                ]}
            >
                {getStatusStatus(item.trip_status)}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f7fb",
        padding: 15,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 15,
    },
    card: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 3,
        position: "relative"
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 5,
    },
    route: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: "600",
    },
    label: {
        color: "#666",
        fontSize: 13,
    },
    fare: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    status: {
        color: "#fff",
        paddingHorizontal: 10,
        paddingVertical: 4,
        fontSize: 12,
        position: "absolute",
        top: 0,
        right: 0,
        borderTopEndRadius: 5,
        borderBottomStartRadius: 5
    },
    button: {
        marginTop: 10,
        borderColor: "#3498db",
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: "center",
        borderWidth: 1,
        padding: 10
    },
    buttonText: {
        color: "#555",
        fontWeight: "600",
    }
});

export default TripCard