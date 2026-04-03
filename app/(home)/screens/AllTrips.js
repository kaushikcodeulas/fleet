import { View, Text, Dimensions, RefreshControl } from 'react-native'
import React, { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { homeValue } from '../../../redux/homeSlice';
import { useIsFocused } from '@react-navigation/native';
import { getAllTrips } from '../../../redux/homeThunks';
import { FlatList, StyleSheet } from "react-native";
import TripCard from '../../../component/trip/TripCard';
import LoadingComp from '../../../component/common/LoadingComp';

const screenHeight = Dimensions.get("screen").height

const AllTrips = () => {
    const userData = useSelector(homeValue)?.userData;
    const allTrips = useSelector(homeValue)?.allTrips?.data;
    const allTripsLoading = useSelector(homeValue)?.allTrips?.loading;
    const allTripsError = useSelector(homeValue)?.allTrips?.error;
    const focus = useIsFocused();
    const dispatch = useDispatch();


    useEffect(() => {
        if (allTrips?.length == 0) {
            dispatch(getAllTrips(userData?.token))
        }
    }, [focus])

    const onRefresh = useCallback(async () => {
        dispatch(getAllTrips(userData?.token))
    }, []);


    return (
        <View style={styles.container}>
            {allTripsLoading ?
                <View style={{ height: screenHeight / 1.2, justifyContent: "center", alignContent: "center" }}>
                    <LoadingComp />
                </View>
                :
                <>
                    <FlatList
                        data={allTrips}
                        keyExtractor={(item) => item.trip_id}
                        renderItem={({ item }) => <TripCard item={item} length={allTrips.length} />}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={allTripsLoading}
                                onRefresh={onRefresh}
                            />
                        }
                    />
                </>}
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
        borderRadius: 8,
        fontSize: 12,
    },
});
export default AllTrips