import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { homeValue } from '../../../redux/homeSlice';
import { useIsFocused } from '@react-navigation/native';
import { getTripDetails } from '../../../redux/homeThunks';
import LoadingComp from '../../../component/common/LoadingComp';
import ManageItem from '../../../component/trip/ManageItem';
import ActionCardFull from '../../../component/trip/ActionCardFull';
import ActionCard from '../../../component/trip/ActionCard';
import ActionCardStops from '../../../component/trip/ActionCardStops';
import { useRouter } from 'expo-router';

const screenHeight = Dimensions.get("screen").height

export default function ManageFleetScreen() {
  const userData = useSelector(homeValue)?.userData;
  const tripDetails = useSelector(homeValue)?.tripDetails?.data;
  const tripDetailsLoading = useSelector(homeValue)?.tripDetails?.loading;
  const focus = useIsFocused();
  const dispatch = useDispatch();
  const route = useRouter();


  useEffect(() => {
    if (!tripDetails) {
      dispatch(getTripDetails(userData?.token))
    }
    console.log(tripDetails)
  }, [focus])


  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {tripDetailsLoading ?
        <View style={{ height: screenHeight / 1.2, justifyContent: "center", alignContent: "center" }}>
          <LoadingComp />
        </View>
        :
        <>
          {/* Header */}
          <Text style={styles.header}>My Trip</Text>
          <Text style={styles.subHeader}>Control & manage your trip</Text>

          {/* Fleet Overview Card */}
          <>
            <View style={styles.overviewCard}>
              <MaterialCommunityIcons name="truck-check" size={38} color="#fff" />
              <View>
                <Text style={styles.vehicleText}>{tripDetails?.make} – {tripDetails?.license_plate}</Text>
                <Text style={styles.vehicleSubText}>{tripDetails?.vehicle_type} • {tripDetails?.fuel_type}</Text>
              </View>
            </View>
            <View style={styles.actionGrid}>
              <ActionCardFull
                icon="map-marker-alt"
                label="Pickup Location"
                value={tripDetails?.pick_up}
                color="#2ecc71"
              />
              <View style={{ width: "100%", justifyContent: "flex-end", alignItems: "flex-end" }}>
                {
                  tripDetails?.stops?.map((element, index) => {
                    return <ActionCardStops
                      icon="map-marker-alt"
                      label={"Stop Location " + (index + 1)}
                      value={element?.stop_name}
                      color="#ffbb00"
                      uniqueKey={index}
                      key={index}
                    />
                  })
                }
              </View>
              <ActionCardFull
                icon="map-marker-alt"
                label="Drop Location"
                value={tripDetails?.drop_in} 
                color="#ff0000"
              />

              {tripDetails?.pick_up_place_id && tripDetails?.drop_in_place_id ? <TouchableOpacity onPress={()=>{route.push({pathname: '/screens/ViewMap', params: { data: JSON.stringify(tripDetails) }})}} style={styles.viewMapBtn}>
                <FontAwesome5 name="map-marked-alt" size={24} color="#fff" />
                <Text style={styles.viewmapText}>View on Map</Text>
              </TouchableOpacity> : null}

              <ActionCard
                icon="gas-pump"
                label="Estimate Fuel"
                value={tripDetails?.fuel_consump + "L"}
                color="#f39c12"
              />
              <ActionCard
                icon="road"
                label="Estimate Distance"
                value={tripDetails?.approx_km + 'km'}
                color="#9b59b6"
              />
            </View>
          </>

          {/* Management Options */}
          <Text style={styles.sectionTitle}>Trip Management</Text>

          <ManageItem
            icon="clipboard-check"
            title="Trip Hisory"
            subtitle="View your all trips"
            target="/screens/AllTrips"
          />
          {/* <ManageItem
            icon="calendar-alt"
            title="Maintenance Schedule"
            subtitle="Upcoming service dates"
          /> */}
          <ManageItem
            icon="file-alt"
            title="Activity"
            subtitle="Your trip activity "
            target="/screens/Activity"
          />
          <ManageItem
            icon="exclamation-triangle"
            title="Report Issue"
            subtitle="Issues in your trip"
            target="/screens/Report"
            last={true}
          />
          {/* <ManageItem
            icon="shield-alt"
            title="Safety & Maintenance"
            subtitle="Vehicle safety and maintenance checks"
            target = "/screens/SafetyMaintenance"
            last={true}
          /> */}
        </>}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    padding: 16
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2c3e50',
  },
  subHeader: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16,
  },

  overviewCard: {
    backgroundColor: '#2c3e50',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  vehicleText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  vehicleSubText: {
    color: '#bdc3c7',
    fontSize: 13,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },

  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    alignItems: "flex-end"
  },
  actionCard: {
    backgroundColor: '#fff',
    width: '48%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
  },
  actionValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    color: '#2c3e50',
  },
  actionLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },

  manageItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
  },
  manageTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
  },
  manageSubtitle: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },

  emergencyButton: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
    gap: 10,
    marginBottom: 50
  },
  emergencyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  viewMapBtn: {
    width: "100%",
    padding: 12,
    marginBottom: 20,
    backgroundColor: "#ffc107",
    elevation: 5,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10
  },
  viewmapText: {
    fontSize: 16,
    color: "#fff"
  }
});