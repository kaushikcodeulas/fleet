import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { homeValue } from '../../../redux/homeSlice';
import { useIsFocused } from '@react-navigation/native';
import { getTripDetails, updateTripStatus } from '../../../redux/homeThunks';
import { getCurrentGPSPosition, getDistanceInMeters, geocodeAddress } from '../../../utils/locationUtils';
import LoadingComp from '../../../component/common/LoadingComp';
import LottieFileView from '../../../component/common/LottieFileView';
import ManageItem from '../../../component/trip/ManageItem';
import ActionCardFull from '../../../component/trip/ActionCardFull';
import ActionCard from '../../../component/trip/ActionCard';
import ActionCardStops from '../../../component/trip/ActionCardStops';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get("window");
const screenHeight = Dimensions.get("screen").height;

export default function ManageFleetScreen() {
  const userData = useSelector(homeValue)?.userData;
  const tripDetails = useSelector(homeValue)?.tripDetails?.data;
  const tripDetailsLoading = useSelector(homeValue)?.tripDetails?.loading;
  const focus = useIsFocused();
  const dispatch = useDispatch();
  const route = useRouter();

  useEffect(() => {
    if (focus && userData?.token) {
      dispatch(getTripDetails(userData?.token));
    }
  }, [focus, userData?.token]);

  const handleCompleteTrip = async () => {
    const tripId = tripDetails?.trip_id || tripDetails?.id;
    if (!userData?.token || !tripId) return;

    try {
      // 1. Get current driver GPS position
      const gps = await getCurrentGPSPosition();

      // 2. Resolve drop location coordinates
      let dropGeo = null;
      if (tripDetails?.drop_in_place_id) {
        dropGeo = await geocodeAddress("place_id:" + tripDetails.drop_in_place_id);
      }
      if (!dropGeo) {
        const isShipment = tripDetails?.trip_category === 'shipment_order';
        const destAddr = isShipment
          ? (tripDetails?.factory_address || tripDetails?.factory_name || tripDetails?.drop_in)
          : (tripDetails?.drop_in || tripDetails?.route_drop_in);
        dropGeo = await geocodeAddress(destAddr);
      }

      const radius = tripDetails?.geofence_radius || 200;

      if (gps && dropGeo) {
        const distMeters = getDistanceInMeters(
          gps.latitude,
          gps.longitude,
          dropGeo.latitude,
          dropGeo.longitude
        );

        if (distMeters != null && distMeters > radius) {
          Alert.alert(
            "Proximity Restricted",
            `Cannot Complete Trip!\n\nYou must be within ${radius} meters of the drop location to complete this trip.\n\nYour current distance is ${Math.round(distMeters)} meters away.`
          );
          return;
        }
      }

      Alert.alert(
        "Complete Trip",
        `Are you sure you want to mark Trip #${tripId} as Completed?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Yes, Complete Trip",
            style: "default",
            onPress: async () => {
              const res = await dispatch(updateTripStatus({
                userToken: userData.token,
                trip_id: tripId,
                status: 3, // Completed
                driver_lat: gps?.latitude,
                driver_lng: gps?.longitude
              })).unwrap();

              if (res && res.status) {
                Alert.alert("Trip Completed", res.msg || "Trip has been completed successfully!");
                dispatch(getTripDetails(userData.token));
              } else {
                Alert.alert("Notice", res?.msg || "Could not complete trip.");
              }
            }
          }
        ]
      );
    } catch (err) {
      Alert.alert("Location Error", err?.message || "Failed to verify location proximity.");
    }
  };

  const isShipmentOrder = tripDetails?.trip_category === 'shipment_order';
  const pickupVal = isShipmentOrder
    ? (tripDetails?.warehouse_name || tripDetails?.pick_up || 'Warehouse Depot')
    : (tripDetails?.pick_up || 'Pickup Station');
  const pickupAddress = isShipmentOrder ? (tripDetails?.warehouse_address || '') : '';

  const dropVal = isShipmentOrder
    ? (tripDetails?.factory_name || tripDetails?.drop_in || 'Factory Destination')
    : (tripDetails?.drop_in || 'Destination');
  const dropAddress = isShipmentOrder ? (tripDetails?.factory_address || '') : '';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {tripDetailsLoading ? (
        <View style={{ height: screenHeight / 1.2, justifyContent: "center", alignItems: "center" }}>
          <LoadingComp />
        </View>
      ) : (
        <>
          {/* Top Header Row */}
          <View style={styles.headerNavRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.header}>My Active Trip</Text>
              <Text style={styles.subHeader}>Control & manage your currently started trip</Text>
            </View>

            {tripDetails && (tripDetails?.trip_id || tripDetails?.id || tripDetails?.make) ? (
              <TouchableOpacity style={styles.topNavCompleteBtn} onPress={handleCompleteTrip}>
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                <Text style={styles.topNavCompleteBtnText}>Complete Trip</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Active Trip Overview Card */}
          {tripDetails && (tripDetails?.trip_id || tripDetails?.id || tripDetails?.make) ? (
            <>
              {/* Trip ID & Status Header Card */}
              <View style={styles.tripHeaderCard}>
                <View style={styles.tripHeaderTop}>
                  <View>
                    <Text style={styles.tripIdTitle}>Trip #{tripDetails?.trip_id || tripDetails?.id}</Text>
                    <Text style={styles.tripCategoryBadgeText}>
                      {isShipmentOrder ? 'Shipment Order Trip' : 'Route Trip'}
                    </Text>
                  </View>

                  <View style={styles.activeStatusBadge}>
                    <View style={styles.activeDot} />
                    <Text style={styles.activeStatusText}>Started (Active)</Text>
                  </View>
                </View>

                {/* Customer & Receipt Details if Shipment Order */}
                {isShipmentOrder && (tripDetails?.customer_name || tripDetails?.delivery_receipt_no || tripDetails?.shipment_order_no) ? (
                  <View style={styles.shipmentMetaBox}>
                    {tripDetails?.customer_name ? (
                      <View style={styles.metaCol}>
                        <Text style={styles.metaLabel}>Customer</Text>
                        <Text style={styles.metaValue}>{tripDetails.customer_name}</Text>
                      </View>
                    ) : null}

                    {tripDetails?.delivery_receipt_no ? (
                      <View style={styles.metaCol}>
                        <Text style={styles.metaLabel}>Delivery Receipt</Text>
                        <Text style={styles.metaValueMono}>{tripDetails.delivery_receipt_no}</Text>
                      </View>
                    ) : null}

                    {tripDetails?.shipment_order_no ? (
                      <View style={styles.metaCol}>
                        <Text style={styles.metaLabel}>Shipment Order</Text>
                        <Text style={styles.metaValueMono}>{tripDetails.shipment_order_no}</Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}
              </View>

              {/* Fleet Overview Card */}
              <View style={styles.overviewCard}>
                <MaterialCommunityIcons name="truck-check" size={38} color="#fff" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.vehicleText}>{tripDetails?.make || 'Assigned Vehicle'} – {tripDetails?.license_plate || 'N/A'}</Text>
                  <Text style={styles.vehicleSubText}>
                    Type: {tripDetails?.vehicle_type || 'Commercial Fleet'} {tripDetails?.fuel_type ? `• ${tripDetails.fuel_type}` : ''}
                  </Text>
                  {tripDetails?.current_mileage ? (
                    <Text style={styles.vehicleSubTextMini}>
                      Odometer: {tripDetails.current_mileage} km {tripDetails?.vin ? `• VIN: ${tripDetails.vin}` : ''}
                    </Text>
                  ) : null}
                </View>
              </View>

              {/* Action & Location Grid */}
              <View style={styles.actionGrid}>
                <ActionCardFull
                  icon="map-marker-alt"
                  label={isShipmentOrder ? "Warehouse (Origin)" : "Pickup Location"}
                  value={pickupVal}
                  address={pickupAddress}
                  color="#2ecc71"
                />

                <View style={{ width: "100%", justifyContent: "flex-end", alignItems: "flex-end" }}>
                  {tripDetails?.stops?.map((element, index) => {
                    return (
                      <ActionCardStops
                        icon="map-marker-alt"
                        label={"Stop Location " + (index + 1)}
                        value={element?.stop_name}
                        color="#ffbb00"
                        uniqueKey={index}
                        key={index}
                      />
                    );
                  })}
                </View>

                <ActionCardFull
                  icon="map-marker-alt"
                  label={isShipmentOrder ? "Factory (Destination)" : "Drop Location"}
                  value={dropVal}
                  address={dropAddress}
                  color="#ff0000"
                />

                {/* View Route on Map Button */}
                <TouchableOpacity
                  onPress={() => {
                    route.push({
                      pathname: '/screens/ViewMap',
                      params: { data: JSON.stringify(tripDetails) }
                    });
                  }}
                  style={styles.viewMapBtn}
                >
                  <FontAwesome5 name="map-marked-alt" size={20} color="#fff" />
                  <Text style={styles.viewmapText}>View Route on Map</Text>
                </TouchableOpacity>

                <ActionCard
                  icon="gas-pump"
                  label="Estimate Fuel"
                  value={(tripDetails?.fuel_consump || '0') + " L"}
                  color="#f39c12"
                />
                <ActionCard
                  icon="road"
                  label="Estimate Distance"
                  value={(tripDetails?.approx_km || '0') + " km"}
                  color="#9b59b6"
                />
              </View>
            </>
          ) : (
            /* Animated Lottie View when NO Trip is Started */
            <View style={styles.noTripAnimatedBox}>
              <LottieFileView
                file={require('../../../assets/lottiefiles/nodata.json')}
                title="No Trip Currently Started"
                message="You currently have no trip in 'Started' status. Check your assigned Booked Trips below to start a trip."
                width={260}
                height={190}
              />
              <TouchableOpacity
                style={styles.refreshStatusBtn}
                onPress={() => dispatch(getTripDetails(userData?.token))}
              >
                <Ionicons name="refresh" size={18} color="#fff" />
                <Text style={styles.refreshStatusBtnText}>Check for Active Started Trip</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Management Options */}
          <Text style={styles.sectionTitle}>Trip Management</Text>

          <ManageItem
            icon="calendar-check"
            title="Assigned Booked Trips"
            subtitle="View assigned upcoming & booked trips"
            target="/screens/BookedTrips"
          />
          <ManageItem
            icon="clipboard-check"
            title="Trip History"
            subtitle="View all past and completed trips"
            target="/screens/AllTrips"
          />
          <ManageItem
            icon="file-alt"
            title="Activity"
            subtitle="Log expenses and trip activities"
            target="/screens/Activity"
          />
          <ManageItem
            icon="exclamation-triangle"
            title="Report Issue"
            subtitle="Report vehicle or route breakdown issues"
            target="/screens/Report"
            last={true}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    padding: 16
  },
  headerNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2c3e50',
  },
  subHeader: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  topNavCompleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  topNavCompleteBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Trip Header Card
  tripHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tripHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripIdTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  tripCategoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284C7',
    marginTop: 2,
  },
  activeStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  activeStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  shipmentMetaBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },
  metaCol: {
    flex: 1,
    minWidth: 110,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  metaValueMono: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 2,
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
    marginTop: 2,
  },
  vehicleSubTextMini: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 10,
    marginBottom: 12,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    alignItems: "flex-end"
  },
  viewMapBtn: {
    width: "100%",
    padding: 14,
    marginBottom: 16,
    backgroundColor: "#9f2779",
    elevation: 4,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10
  },
  viewmapText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff"
  },
  noTripAnimatedBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 2,
  },
  refreshStatusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    marginTop: 12,
  },
  refreshStatusBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});