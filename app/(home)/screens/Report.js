import React, { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Dimensions, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { homeValue } from "../../../redux/homeSlice";
import { useIsFocused } from "@react-navigation/native";
import axios from "axios";
import LoadingComp from "../../../component/common/LoadingComp";
import LottieFileView from "../../../component/common/LottieFileView";

const screenHeight = Dimensions.get("screen").height

const getPriorityColor = (priority) => {
    switch (priority) {
        case "High":
            return "#ff4d4d";
        case "Medium":
            return "#ffa500";
        case "Low":
            return "#4caf50";
    }
};
const Report = () => {
    const route = useRouter();
    const userData = useSelector(homeValue)?.userData;
    const tripDetails = useSelector(homeValue)?.tripDetails?.data;
    const [loading, setLoading] = useState(false);
    const [allReports, setAllReports] = useState([]);
    const focus = useIsFocused()

    async function getAllReport() {
        try {
            const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/trip/getAllReport`, {
                id: tripDetails?.trip_id
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
        getAllReport().then((data) => {
            console.log(data)
            setAllReports(data?.details)
            setLoading(false)
        }).catch((error) => {
            setLoading(false)
        })
    }, [])

    const onRefresh = useCallback(async () => {
        setLoading(true)
        getAllReport().then((data) => {
            setAllReports(data?.details)
            setLoading(false)
        }).catch((error) => {
            setLoading(false)
        })
    }, []);

    return (
        <View style={styles.container}>
            {loading ?
                <View style={{ height: screenHeight / 1.2, justifyContent: "center", alignContent: "center" }}>
                    <LoadingComp />
                </View>
                :
                <>
                    {allReports.length == 0 ?
                        <View style={{ height: screenHeight / 1.2, justifyContent: "center", alignContent: "center" }}>
                            <LottieFileView file={require("../../../assets/lottiefiles/nodata.json")} />
                        </View>
                        :
                        <>
                            <FlatList
                                data={allReports}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <View style={styles.card}>
                                        <View style={styles.row}>
                                            <Text style={styles.subject}>{item.subject}</Text>
                                            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
                                                <Text style={styles.priorityText}>{item.priority}</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.description}>{item.description}</Text>
                                    </View>
                                )}
                                refreshControl={
                                    <RefreshControl
                                        onRefresh={onRefresh}
                                        refreshing={loading}
                                    />
                                }
                            />
                        </>
                    }
                </>
            }
            <TouchableOpacity style={styles.fab} onPress={() => { route.push('screens/AddReport') }}>
                <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, padding: 15, backgroundColor: "#f5f6fa" },
    header: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },

    card: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        elevation: 1,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    subject: {
        fontSize: 16,
        fontWeight: "bold",
    },

    description: {
        marginTop: 5,
        color: "#555",
    },

    priorityBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 8,
    },

    priorityText: {
        color: "#fff",
        fontSize: 12,
    },

    fab: {
        position: "absolute",
        bottom: 20,
        right: 20,
        backgroundColor: "#007bff",
        width: 55,
        height: 55,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
    },
});
export default Report