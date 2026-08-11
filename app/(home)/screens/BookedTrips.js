import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Dimensions, Platform, Alert } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { homeValue } from '../../../redux/homeSlice';
import { getBookedTrips, updateTripStatus, getTripDetails } from '../../../redux/homeThunks';
import { getCurrentGPSPosition, getDistanceInMeters, geocodeAddress } from '../../../utils/locationUtils';
import { useIsFocused } from '@react-navigation/native';
import LoadingComp from '../../../component/common/LoadingComp';
import LottieFileView from '../../../component/common/LottieFileView';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function BookedTripsScreen() {
  const userData = useSelector(homeValue)?.userData;
  const bookedTripsData = useSelector(homeValue)?.bookedTrips?.data;
  const bookedTripsLoading = useSelector(homeValue)?.bookedTrips?.loading;
  const focus = useIsFocused();
  const dispatch = useDispatch();
  const router = useRouter();

  const fetchTrips = () => {
    if (userData?.token) {
      dispatch(getBookedTrips(userData?.token));
    }
  };

  useEffect(() => {
    if (focus) {
      fetchTrips();
    }
  }, [focus, userData?.token]);

  const handleStartTrip = async (item) => {
    const tripId = item?.trip_id || item?.id;
    if (!userData?.token || !tripId) return;

    try {
      // 1. Get current driver GPS position
      const gps = await getCurrentGPSPosition();

      // 2. Resolve pickup coordinates
      let pickupGeo = null;
      if (item?.pick_up_place_id) {
        pickupGeo = await geocodeAddress("place_id:" + item.pick_up_place_id);
      }
      if (!pickupGeo) {
        const isShipment = item?.trip_category === 'shipment_order';
        const originAddr = isShipment
          ? (item?.warehouse_address || item?.warehouse_name || item?.pick_up)
          : (item?.pick_up || item?.route_pick_up);
        pickupGeo = await geocodeAddress(originAddr);
      }

      const radius = item?.geofence_radius || 200;

      if (gps && pickupGeo) {
        const distMeters = getDistanceInMeters(
          gps.latitude,
          gps.longitude,
          pickupGeo.latitude,
          pickupGeo.longitude
        );

        if (distMeters != null && distMeters > radius) {
          Alert.alert(
            "Proximity Restricted",
            `Cannot Start Trip!\n\nYou must be within ${radius} meters of the pickup location.\n\nYour current distance is ${Math.round(distMeters)} meters away.`
          );
          return;
        }
      }

      // Proximity check passed -> Confirm start
      Alert.alert(
        "Trip Started",
        `Confirm starting Trip #${tripId}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Start Now",
            onPress: async () => {
              const res = await dispatch(updateTripStatus({
                userToken: userData.token,
                trip_id: tripId,
                status: 2, // Started
                driver_lat: gps?.latitude,
                driver_lng: gps?.longitude
              })).unwrap();

              if (res && res.status) {
                Alert.alert("Trip Started", res.msg || "Trip started successfully!");
                dispatch(getTripDetails(userData.token));
                dispatch(getBookedTrips(userData.token));
                router.push({
                  pathname: '/screens/ViewMap',
                  params: { data: JSON.stringify(item) }
                });
              } else {
                Alert.alert("Notice", res?.msg || "Could not start trip.");
              }
            }
          }
        ]
      );
    } catch (err) {
      Alert.alert("Location Error", err?.message || "Failed to verify location proximity.");
    }
  };

  const renderTripCard = ({ item }) => {
    const isShipment = item?.trip_category === 'shipment_order';

    const originName = isShipment
      ? (item?.warehouse_name || item?.pick_up || 'Warehouse Depot')
      : (item?.pick_up || item?.route_pick_up || 'Pickup Station');
    const originAddress = isShipment ? (item?.warehouse_address || '') : '';

    const destName = isShipment
      ? (item?.factory_name || item?.drop_in || 'Factory Destination')
      : (item?.drop_in || item?.route_drop_in || 'Destination');
    const destAddress = isShipment ? (item?.factory_address || '') : '';

    const hasFleetInfo = item?.make || item?.license_plate || item?.vehicle_id || item?.vehicle_type;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => {
          router.push({
            pathname: '/screens/TripDetails',
            params: { tripPrimaryId: item?.trip_id || item?.id }
          });
        }}
      >
        {/* Card Top Header */}
        <View style={styles.cardHeader}>
          <View style={styles.tripBadgeContainer}>
            <View style={styles.badgeIconBg}>
              <FontAwesome5 name={isShipment ? "boxes" : "route"} size={14} color="#0284C7" />
            </View>
            <Text style={styles.tripCategoryText}>
              {isShipment ? 'Shipment Order Trip' : 'Route Trip'}
            </Text>
          </View>

          <View style={styles.bookedStatusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.bookedStatusText}>Booked / Assigned</Text>
          </View>
        </View>

        <Text style={styles.tripIdTitle}>Trip #{item?.trip_id || item?.id}</Text>

        {/* Assigned Fleet / Vehicle Information Section */}
        <View style={styles.fleetCardBox}>
          <View style={styles.fleetHeaderRow}>
            <MaterialCommunityIcons name="truck-outline" size={22} color="#0F172A" />
            <Text style={styles.fleetCardTitle}>Assigned Fleet Information</Text>
          </View>

          {hasFleetInfo ? (
            <View style={styles.fleetDetailsGrid}>
              <View style={styles.fleetInfoCol}>
                <Text style={styles.fleetInfoLabel}>Vehicle & Plate</Text>
                <Text style={styles.fleetInfoValue}>
                  {item?.make || 'Vehicle'} – {item?.license_plate || item?.vehicle_id || 'N/A'}
                </Text>
              </View>

              <View style={styles.fleetInfoCol}>
                <Text style={styles.fleetInfoLabel}>Vehicle Type</Text>
                <Text style={styles.fleetInfoValue}>{item?.vehicle_type || 'Commercial Fleet'}</Text>
              </View>

              {item?.fuel_type ? (
                <View style={styles.fleetInfoCol}>
                  <Text style={styles.fleetInfoLabel}>Fuel Type</Text>
                  <Text style={styles.fleetInfoValue}>{item?.fuel_type}</Text>
                </View>
              ) : null}

              {item?.current_mileage ? (
                <View style={styles.fleetInfoCol}>
                  <Text style={styles.fleetInfoLabel}>Current Odometer</Text>
                  <Text style={styles.fleetInfoValue}>{item?.current_mileage} km</Text>
                </View>
              ) : null}

              {item?.vin ? (
                <View style={styles.fleetInfoColFull}>
                  <Text style={styles.fleetInfoLabel}>VIN / Chassis No.</Text>
                  <Text style={styles.fleetInfoValueFontMono}>{item?.vin}</Text>
                </View>
              ) : null}
            </View>
          ) : (
            <Text style={styles.noFleetText}>No specific vehicle attached yet</Text>
          )}
        </View>

        {/* Route Visualizer (Origin & Destination) */}
        <View style={styles.routeBox}>
          <Text style={styles.routeBoxHeader}>
            <FontAwesome5 name="map-marked-alt" size={13} color="#0284C7" />  Route & Location Details
          </Text>

          {/* Origin */}
          <View style={styles.timelineRow}>
            <View style={styles.timelineLeft}>
              <View style={[styles.timelineDot, { backgroundColor: '#10B981' }]} />
              <View style={styles.timelineLine} />
            </View>
            <View style={styles.timelineRight}>
              <Text style={styles.locationRoleText}>
                {isShipment ? 'ORIGIN WAREHOUSE' : 'PICKUP LOCATION'}
              </Text>
              <Text style={styles.locationNameText}>{originName}</Text>
              {originAddress ? (
                <View style={styles.addressRow}>
                  <Ionicons name="location-sharp" size={13} color="#64748B" style={{ marginTop: 2 }} />
                  <Text style={styles.addressText}>{originAddress}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Destination */}
          <View style={styles.timelineRow}>
            <View style={styles.timelineLeft}>
              <View style={[styles.timelineDot, { backgroundColor: '#EF4444' }]} />
            </View>
            <View style={styles.timelineRight}>
              <Text style={styles.locationRoleText}>
                {isShipment ? 'DESTINATION FACTORY / PLANT' : 'DROP-OFF LOCATION'}
              </Text>
              <Text style={styles.locationNameText}>{destName}</Text>
              {destAddress ? (
                <View style={styles.addressRow}>
                  <Ionicons name="location-sharp" size={13} color="#64748B" style={{ marginTop: 2 }} />
                  <Text style={styles.addressText}>{destAddress}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* Trip Meta Information Bar */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <FontAwesome5 name="route" size={12} color="#64748B" />
            <Text style={styles.metaText}>{item?.approx_km || '0'} km</Text>
          </View>
          <View style={styles.metaItem}>
            <FontAwesome5 name="gas-pump" size={12} color="#64748B" />
            <Text style={styles.metaText}>{item?.fuel_consump || '0'} L</Text>
          </View>
          <View style={styles.metaItem}>
            <FontAwesome5 name="calendar-alt" size={12} color="#64748B" />
            <Text style={styles.metaText}>{item?.start_date ? item?.start_date.split(' ')[0] : 'N/A'}</Text>
          </View>
        </View>

        {/* Footer Action Buttons */}
        <View style={styles.cardFooterRow}>
          <TouchableOpacity
            style={styles.startTripBtn}
            onPress={() => handleStartTrip(item)}
          >
            <FontAwesome5 name="play-circle" size={15} color="#FFFFFF" />
            <Text style={styles.startTripBtnText}>Trip Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.detailsBtn}
            onPress={() => {
              router.push({
                pathname: '/screens/TripDetails',
                params: { tripPrimaryId: item?.trip_id || item?.id }
              });
            }}
          >
            <Text style={styles.viewDetailsText}>Details</Text>
            <Ionicons name="chevron-forward" size={16} color="#0284C7" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header Navigation */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.navTitle}>Assigned Booked Trips</Text>
          <Text style={styles.navSubTitle}>Trips queued & awaiting execution</Text>
        </View>
      </View>

      {bookedTripsLoading ? (
        <View style={styles.loadingContainer}>
          <LoadingComp />
        </View>
      ) : bookedTripsData && bookedTripsData.length > 0 ? (
        <FlatList
          data={bookedTripsData}
          keyExtractor={(item, index) => (item?.trip_id || item?.id || index).toString()}
          renderItem={renderTripCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={bookedTripsLoading} onRefresh={fetchTrips} colors={['#0284C7']} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <LottieFileView
            file={require('../../../assets/lottiefiles/nodata.json')}
            title="No Assigned Booked Trips Found"
            message="You currently have no queued or booked trips assigned to your driver account."
            width={240}
            height={180}
          />
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchTrips}>
            <Ionicons name="refresh" size={18} color="#FFF" />
            <Text style={styles.refreshBtnText}>Refresh Booked Trips</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  navSubTitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tripCategoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0284C7',
  },
  bookedStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
  },
  bookedStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  tripIdTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },

  // Fleet Box
  fleetCardBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  fleetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  fleetCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  fleetDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 10,
    columnGap: 14,
  },
  fleetInfoCol: {
    width: (width - 80) / 2,
  },
  fleetInfoColFull: {
    width: '100%',
  },
  fleetInfoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  fleetInfoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  fleetInfoValueFontMono: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 2,
  },
  noFleetText: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
  },

  // Route Box
  routeBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  routeBoxHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
    marginBottom: 12,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineLeft: {
    alignItems: 'center',
    width: 20,
    marginRight: 10,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 14,
  },
  locationRoleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  locationNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginTop: 4,
  },
  addressText: {
    fontSize: 12,
    color: '#475569',
    flex: 1,
    lineHeight: 16,
  },

  // Meta Row
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },

  // Footer Action Buttons
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 4,
  },
  startTripBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
  },
  startTripBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    marginTop: 16,
  },
  refreshBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
