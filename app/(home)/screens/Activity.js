import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    ScrollView,
    RefreshControl,
    Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { homeValue } from "../../../redux/homeSlice";
import axios from "axios";
import LoadingComp from "../../../component/common/LoadingComp";
import LottieFileView from "../../../component/common/LottieFileView";
import { useIsFocused } from "@react-navigation/native";

const screenHeight = Dimensions.get("screen").height

const getIcon = (type) => {
    switch (type) {
        case "Fuel":
            return <Ionicons name="water" size={20} color="#3498db" />;
        case "Trip Expense":
            return <Ionicons name="cash" size={20} color="#2ecc71" />;
        default:
            return <Ionicons name="document-text" size={20} color="#9b59b6" />;
    }
};

const ActivityCard = ({ item }) => {
    return (<View style={styles.card}>

        {/* 🔹 Header */}
        <View style={styles.rowBetween}>
            <View style={styles.row}>
                {getIcon(item.activity_type)}
                <View>
                    <Text style={styles.type}>{item.activity_type}</Text>
                    <Text style={[styles.type, { fontSize: 15 }]}>${item.amount}</Text>
                </View>
            </View>
            <Text style={styles.date}>{item.date}</Text>
        </View>

        {/* 📝 Description */}
        <Text style={styles.description}>{item.activity_desc}</Text>

        {/* 📎 Files */}
        {item.docs.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {item.docs.map((file, index) => (
                    <View key={index} style={styles.fileBox}>
                        {file.doc.includes("image") ? (
                            <Ionicons name="document" size={30} color="#555" />
                        ) : (
                            <Ionicons name="document" size={30} color="#555" />
                        )}
                    </View>
                ))}
            </ScrollView>
        )}
    </View>
    )
};

const Activity = () => {
    const router = useRouter();
    const userData = useSelector(homeValue)?.userData;
    const tripDetails = useSelector(homeValue)?.tripDetails?.data;
    const [loading, setLoading] = useState(false);
    const [allActivities, setAllActivities] = useState([]);
    const focus  = useIsFocused()

    async function getActivity() {
        try {
            const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/trip/getAllActivity`, {
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
        getActivity().then((data) => {
            console.log(data)
            setAllActivities(data?.details)
            setLoading(false)
        }).catch((error) => {
            setLoading(false)
        })
    }, [])

    const onRefresh = useCallback(async () => {
        setLoading(true)
        getActivity().then((data) => {
            setAllActivities(data?.details)
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
                    <TouchableOpacity
                        style={styles.fab}
                        onPress={() => router.push("/screens/AddActivity")}
                    >
                        <Ionicons name="add" size={28} color="#fff" />
                    </TouchableOpacity>
                    {allActivities.length == 0 ?
                        <View style={{ height: screenHeight / 1.2, justifyContent: "center", alignContent: "center" }}>
                            <LottieFileView file={require("../../../assets/lottiefiles/nodata.json")} />
                        </View>
                        :
                        <>
                            <FlatList
                                data={allActivities}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => <ActivityCard item={item} />}
                                showsVerticalScrollIndicator={false}
                                refreshControl={
                                    <RefreshControl
                                        onRefresh={onRefresh}
                                        refreshing={loading}
                                    />
                                }
                            />
                        </>}
                </>}
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f7fb",
        padding: 15,
    },

    header: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 15,
    },

    card: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
    },

    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    type: {
        marginLeft: 8,
        fontWeight: "600",
    },

    date: {
        fontSize: 11,
        color: "#888",
    },

    description: {
        marginTop: 8,
        color: "#444",
    },

    fileBox: {
        width: 70,
        height: 70,
        backgroundColor: "#ecf0f1",
        borderRadius: 10,
        marginTop: 10,
        marginRight: 10,
        alignItems: "center",
        justifyContent: "center",
    },

    image: {
        width: "100%",
        height: "100%",
        borderRadius: 10,
    },

    fab: {
        position: "absolute",
        bottom: 20,
        right: 20,
        backgroundColor: "#3498db",
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
        zIndex: 555
    },
});
export default Activity
