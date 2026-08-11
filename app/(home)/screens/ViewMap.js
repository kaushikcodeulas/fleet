import React, { useRef, useState, useEffect } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform,
  StatusBar as RNStatusBar,
  Animated
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { homeValue } from '../../../redux/homeSlice';
import { updateTripStatus, getTripDetails } from '../../../redux/homeThunks';
import { getCurrentGPSPosition, getDistanceInMeters, geocodeAddress } from '../../../utils/locationUtils';

// Curated Map Styles
const SILVER_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e8e8" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9e4de" }] },
];

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#181824" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b0" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3644" }] },
  { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#4b687a" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#283d52" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#304562" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#98a6ad" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#475569" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1726" }] }
];

export default function ViewMap() {
  const [locationCoords, setLocationCoords] = useState([]);
  const [routeInfo, setRouteInfo] = useState({ distance: null, duration: null });
  const [mapTheme, setMapTheme] = useState('silver'); // 'silver' | 'dark' | 'standard'
  const [showsTraffic, setShowsTraffic] = useState(false);

  const mapRef = useRef(null);
  const route = useRouter();
  const dispatch = useDispatch();
  const userData = useSelector(homeValue)?.userData;

  const { data } = useLocalSearchParams();
  const tripDetails = data ? JSON.parse(data) : null;

  const isShipment = tripDetails?.trip_category === 'shipment_order';

  const originAddr = isShipment
    ? (tripDetails?.warehouse_address || tripDetails?.warehouse_name || tripDetails?.pick_up)
    : (tripDetails?.pick_up || tripDetails?.route_pick_up);

  const destAddr = isShipment
    ? (tripDetails?.factory_address || tripDetails?.factory_name || tripDetails?.drop_in)
    : (tripDetails?.drop_in || tripDetails?.route_drop_in);

  const [originTarget, setOriginTarget] = useState(
    tripDetails?.pick_up_place_id ? "place_id:" + tripDetails.pick_up_place_id : originAddr
  );
  const [destTarget, setDestTarget] = useState(
    tripDetails?.drop_in_place_id ? "place_id:" + tripDetails.drop_in_place_id : destAddr
  );

  useEffect(() => {
    const resolveCoordinates = async () => {
      if (!originTarget && originAddr) {
        const geo = await geocodeAddress(originAddr);
        if (geo) setOriginTarget(geo);
        else setOriginTarget(originAddr);
      }
      if (!destTarget && destAddr) {
        const geo = await geocodeAddress(destAddr);
        if (geo) setDestTarget(geo);
        else setDestTarget(destAddr);
      }
    };
    resolveCoordinates();
  }, [tripDetails]);

  const stops = tripDetails?.stops?.map((elem) => {
    return elem?.place_id ? "place_id:" + elem.place_id : elem?.stop_name;
  });

  const isTripBooked = String(tripDetails?.status || tripDetails?.trip_status) === '1';

  const handleStartTrip = async () => {
    const tripId = tripDetails?.trip_id || tripDetails?.id;
    if (!userData?.token || !tripId) return;

    try {
      const gps = await getCurrentGPSPosition();
      let pickupGeo = null;
      if (tripDetails?.pick_up_place_id) {
        pickupGeo = await geocodeAddress("place_id:" + tripDetails.pick_up_place_id);
      }
      if (!pickupGeo && originAddr) {
        pickupGeo = await geocodeAddress(originAddr);
      }

      const radius = tripDetails?.geofence_radius || 200;

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
            `Cannot Start Trip!\n\nYou must be within ${radius} meters of the pickup location to start this trip.\n\nYour current distance is ${Math.round(distMeters)} meters away.`
          );
          return;
        }
      }

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
                Alert.alert("Trip Started", res.msg || "Trip status updated to Started!");
                dispatch(getTripDetails(userData.token));
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

  const handleCompleteTrip = async () => {
    const tripId = tripDetails?.trip_id || tripDetails?.id;
    if (!userData?.token || !tripId) return;

    try {
      const gps = await getCurrentGPSPosition();
      let dropGeo = null;
      if (tripDetails?.drop_in_place_id) {
        dropGeo = await geocodeAddress("place_id:" + tripDetails.drop_in_place_id);
      }
      if (!dropGeo && destAddr) {
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
                Alert.alert("Trip Completed", res.msg || "Trip marked as completed!");
                dispatch(getTripDetails(userData.token));
                route.replace('/(home)/(tabs)/manage');
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

  const handleStartNavigation = () => {
    if (!locationCoords || locationCoords.length < 2) {
      Alert.alert("Notice", "Calculating route coordinates. Please wait a moment and try again.");
      return;
    }
    route.push({
      pathname: '/screens/ViewDirection',
      params: {
        cordsData: JSON.stringify(locationCoords),
        tripData: JSON.stringify(tripDetails)
      }
    });
  };

  const recenterMap = () => {
    if (locationCoords.length > 0) {
      mapRef.current?.fitToCoordinates(locationCoords, {
        edgePadding: { top: 120, right: 60, bottom: 240, left: 60 },
        animated: true,
      });
    }
  };

  const toggleTheme = () => {
    if (mapTheme === 'silver') setMapTheme('dark');
    else if (mapTheme === 'dark') setMapTheme('standard');
    else setMapTheme('silver');
  };

  const getCustomStyle = () => {
    if (mapTheme === 'silver') return SILVER_MAP_STYLE;
    if (mapTheme === 'dark') return DARK_MAP_STYLE;
    return [];
  };

  const tripIdStr = tripDetails?.trip_id || tripDetails?.id || '';

  return (
    <View style={styles.container}>
      <StatusBar style={mapTheme === 'dark' ? 'light' : 'dark'} />

      {/* Top Floating Glass Header Navigation Bar */}
      <View style={styles.topHeaderOverlay} pointerEvents="box-none">
        <TouchableOpacity style={styles.exitBtn} onPress={() => route.back()} activeOpacity={0.85}>
          <Ionicons name="arrow-back" size={18} color="#0F172A" />
          <Text style={styles.exitBtnText}>Exit</Text>
        </TouchableOpacity>

        {tripIdStr ? (
          <View style={styles.tripIdBadge}>
            <Feather name="truck" size={14} color="#4f46e5" />
            <Text style={styles.tripIdText}>Trip #{tripIdStr}</Text>
          </View>
        ) : null}

        {isTripBooked ? (
          <TouchableOpacity style={styles.topActionTripBtn} onPress={handleStartTrip} activeOpacity={0.85}>
            <Ionicons name="play-circle" size={18} color="#FFFFFF" />
            <Text style={styles.topActionTripText}>Start Trip</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.topActionTripBtn, { backgroundColor: '#10b981' }]} onPress={handleCompleteTrip} activeOpacity={0.85}>
            <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
            <Text style={styles.topActionTripText}>Complete</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Right Floating Control Tools */}
      <View style={styles.rightControlsOverlay} pointerEvents="box-none">
        <TouchableOpacity style={styles.floatingToolBtn} onPress={recenterMap} activeOpacity={0.8}>
          <MaterialIcons name="my-location" size={20} color="#1e293b" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.floatingToolBtn} onPress={toggleTheme} activeOpacity={0.8}>
          <Ionicons name={mapTheme === 'dark' ? 'sunny' : 'moon'} size={20} color="#1e293b" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.floatingToolBtn, showsTraffic && styles.floatingToolActive]}
          onPress={() => setShowsTraffic(!showsTraffic)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="traffic-light"
            size={20}
            color={showsTraffic ? '#ffffff' : '#1e293b'}
          />
        </TouchableOpacity>
      </View>

      {/* Main Map View */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        customMapStyle={getCustomStyle()}
        showsTraffic={showsTraffic}
        showsUserLocation={true}
        showsCompass={true}
      >
        {/* Draw Route if origin & destination target available */}
        {originTarget && destTarget ? (
          <MapViewDirections
            origin={originTarget}
            destination={destTarget}
            waypoints={stops}
            apikey={'AIzaSyBGIm2P5Vav9zkOABLCe5QIEjkhyoFpD7g'}
            strokeWidth={6}
            strokeColor={mapTheme === 'dark' ? '#38bdf8' : '#2563eb'}
            optimizeWaypoints={true}
            onReady={(result) => {
              setRouteInfo({
                distance: result.distance,
                duration: result.duration
              });

              mapRef.current?.fitToCoordinates(result.coordinates, {
                edgePadding: { top: 120, right: 60, bottom: 240, left: 60 },
                animated: true,
              });

              const Coords = [];
              if (result.legs && result.legs.length > 0) {
                result.legs.forEach((element, index) => {
                  Coords.push({ "latitude": element.start_location.lat, "longitude": element.start_location.lng });
                  if ((result.legs.length - 1) == index) {
                    Coords.push({ "latitude": element.end_location.lat, "longitude": element.end_location.lng });
                  }
                });
              } else if (result.coordinates && result.coordinates.length >= 2) {
                const first = result.coordinates[0];
                const last = result.coordinates[result.coordinates.length - 1];
                Coords.push({ latitude: first.latitude, longitude: first.longitude });
                Coords.push({ latitude: last.latitude, longitude: last.longitude });
              }
              setLocationCoords(Coords);
            }}
          />
        ) : null}

        {/* Custom Render Markers */}
        {locationCoords.length > 0 &&
          locationCoords.map((cords, index) => {
            const isOrigin = index === 0;
            const isDestination = index === locationCoords.length - 1;

            return (
              <Marker key={index} coordinate={cords}>
                <View style={styles.customMarkerView}>
                  {isOrigin ? (
                    <View style={styles.originMarkerBadge}>
                      <View style={styles.markerIconCircle}>
                        <FontAwesome6 name="truck-fast" size={14} color="#ffffff" />
                      </View>
                      <Text style={styles.markerBadgeText}>Pickup</Text>
                    </View>
                  ) : isDestination ? (
                    <View style={[styles.originMarkerBadge, { backgroundColor: '#ef4444' }]}>
                      <View style={[styles.markerIconCircle, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                        <FontAwesome6 name="warehouse" size={14} color="#ffffff" />
                      </View>
                      <Text style={styles.markerBadgeText}>Drop-off</Text>
                    </View>
                  ) : (
                    <View style={[styles.originMarkerBadge, { backgroundColor: '#f59e0b' }]}>
                      <View style={[styles.markerIconCircle, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                        <MaterialIcons name="location-on" size={16} color="#ffffff" />
                      </View>
                      <Text style={styles.markerBadgeText}>Stop #{index}</Text>
                    </View>
                  )}
                </View>
              </Marker>
            );
          })}
      </MapView>

      {/* Bottom Dashboard Card Overlay */}
      <View style={styles.bottomCardContainer} pointerEvents="box-none">
        <View style={styles.routeSummaryCard}>
          {/* Route Location Info */}
          <View style={styles.routeAddressRow}>
            <View style={styles.addressDotCol}>
              <View style={[styles.dot, { backgroundColor: '#10b981' }]} />
              <View style={styles.dotLine} />
              <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
            </View>
            <View style={styles.addressTextCol}>
              <Text style={styles.addressLabel}>PICKUP LOCATION</Text>
              <Text style={styles.addressValue} numberOfLines={1}>
                {originAddr || 'Pickup Address Unspecified'}
              </Text>

              <View style={{ height: 10 }} />

              <Text style={styles.addressLabel}>DESTINATION</Text>
              <Text style={styles.addressValue} numberOfLines={1}>
                {destAddr || 'Destination Address Unspecified'}
              </Text>
            </View>
          </View>

          {/* Metrics Pill Bar */}
          <View style={styles.metricsBar}>
            <View style={styles.metricItem}>
              <FontAwesome6 name="route" size={14} color="#4f46e5" />
              <Text style={styles.metricValue}>
                {routeInfo.distance ? `${routeInfo.distance.toFixed(1)} km` : '--'}
              </Text>
              <Text style={styles.metricLabel}>Distance</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Ionicons name="time-outline" size={16} color="#10b981" />
              <Text style={styles.metricValue}>
                {routeInfo.duration ? `${Math.round(routeInfo.duration)} min` : '--'}
              </Text>
              <Text style={styles.metricLabel}>Est. Time</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <MaterialIcons name="alt-route" size={16} color="#f59e0b" />
              <Text style={styles.metricValue}>
                {stops ? stops.length : 0}
              </Text>
              <Text style={styles.metricLabel}>Stops</Text>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.startNavBtn}
            onPress={handleStartNavigation}
            activeOpacity={0.85}
          >
            <FontAwesome6 name="location-arrow" size={18} color="#ffffff" />
            <Text style={styles.startNavText}>Start Turn-By-Turn Navigation</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const topPadding = Platform.OS === 'ios' ? 48 : (RNStatusBar.currentHeight ? RNStatusBar.currentHeight + 8 : 16);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  topHeaderOverlay: {
    position: 'absolute',
    top: topPadding,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  exitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    elevation: 4,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  exitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  tripIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
    elevation: 4,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  tripIdText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4f46e5',
  },
  topActionTripBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4f46e5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  topActionTripText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  rightControlsOverlay: {
    position: 'absolute',
    top: topPadding + 54,
    right: 14,
    zIndex: 10,
    gap: 10,
  },
  floatingToolBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  floatingToolActive: {
    backgroundColor: '#4f46e5',
  },

  customMarkerView: {
    alignItems: 'center',
  },
  originMarkerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  markerIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },

  bottomCardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    zIndex: 10,
  },
  routeSummaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    elevation: 8,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  routeAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  addressDotCol: {
    alignItems: 'center',
    marginRight: 12,
    width: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotLine: {
    width: 2,
    height: 22,
    backgroundColor: '#cbd5e1',
    marginVertical: 2,
  },
  addressTextCol: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  addressValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 1,
  },

  metricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0',
  },

  startNavBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 15,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    elevation: 4,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  startNavText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
});
