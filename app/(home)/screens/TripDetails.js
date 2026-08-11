import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { homeValue } from '../../../redux/homeSlice';
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, FontAwesome5, FontAwesome6, MaterialCommunityIcons, Feather, FontAwesome } from "@expo/vector-icons";
import LoadingComp from '../../../component/common/LoadingComp';

const screenHeight = Dimensions.get("screen").height;

function formatDateTime(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const day = date.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${day} ${month}, ${year} ${hours}:${minutes} ${ampm}`;
}

const getStatusConfig = (status) => {
  const statusStr = String(status);
  switch (statusStr) {
    case '1':
      return { label: 'Running', color: '#10b981', bg: '#dcfce7' };
    case '2':
      return { label: 'Pending', color: '#f59e0b', bg: '#fef3c7' };
    case '3':
      return { label: 'Completed', color: '#8b5cf6', bg: '#f3e8ff' };
    default:
      return { label: 'Cancelled', color: '#ef4444', bg: '#fee2e2' };
  }
};

const TripDetails = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const userData = useSelector(homeValue)?.userData;

  const [loading, setLoading] = useState(true);
  const [tripDetails, setTripDetails] = useState(null);

  useEffect(() => {
    if (params?.data) {
      try {
        const parsed = JSON.parse(params.data);
        setTripDetails(parsed);
        setLoading(false);
      } catch (e) {
        // Fallback to fetch via API
      }
    }

    if (params?.id) {
      async function fetchTrip() {
        try {
          const response = await axios.post(
            `${process.env.EXPO_PUBLIC_API_URL}/trip/getPaticularTrip`,
            { id: params.id },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userData?.token}`
              }
            }
          );
          if (response?.data?.details) {
            setTripDetails(response.data.details);
          }
        } catch (error) {
          // error
        } finally {
          setLoading(false);
        }
      }
      fetchTrip();
    } else {
      setLoading(false);
    }
  }, [params?.id, params?.data]);

  const statusCfg = getStatusConfig(tripDetails?.trip_status ?? tripDetails?.status);
  const isShipmentTrip = tripDetails?.trip_category === 'shipment_order';

  const pickupLocation = isShipmentTrip
    ? (tripDetails?.warehouse_name || tripDetails?.pick_up || 'Warehouse Depot')
    : (tripDetails?.pick_up || 'Pickup Station');

  const dropLocation = isShipmentTrip
    ? (tripDetails?.factory_name || tripDetails?.drop_in || 'Factory Destination')
    : (tripDetails?.drop_in || 'Destination');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {loading ? (
        <View style={{ height: screenHeight / 1.2, justifyContent: "center", alignItems: "center" }}>
          <LoadingComp />
        </View>
      ) : tripDetails ? (
        <>
          {/* Header Banner */}
          <LinearGradient colors={["#1e293b", "#0f172a"]} style={styles.header}>
            <View style={styles.headerTopRow}>
              <View>
                <View style={styles.tripCategoryBadge}>
                  <Text style={styles.tripCategoryText}>
                    {isShipmentTrip ? 'Shipment Order Trip' : 'Route / Custom Trip'}
                  </Text>
                </View>
                <Text style={styles.tripCodeText}>
                  Trip #{tripDetails?.trip_code || tripDetails?.trip_id || tripDetails?.id}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                <Text style={[styles.statusBadgeText, { color: statusCfg.color }]}>
                  {statusCfg.label}
                </Text>
              </View>
            </View>

            {/* Route timeline inside header */}
            <View style={styles.timelineContainer}>
              <View style={styles.routeRow}>
                <Ionicons name="ellipse" size={14} color="#10b981" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.pointLabel}>ORIGIN / PICKUP</Text>
                  <Text style={styles.routeText} numberOfLines={1}>
                    {pickupLocation}
                  </Text>
                </View>
              </View>

              <View style={styles.timelineLine} />

              <View style={styles.routeRow}>
                <Ionicons name="location-sharp" size={16} color="#ef4444" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.pointLabel}>DESTINATION</Text>
                  <Text style={styles.routeText} numberOfLines={1}>
                    {dropLocation}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Quick Metrics Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <FontAwesome5 name="road" size={18} color="#4f46e5" />
              <Text style={styles.statValue}>{tripDetails.approx_km || 0} km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>

            <View style={styles.statBox}>
              <FontAwesome5 name="gas-pump" size={18} color="#f59e0b" />
              <Text style={styles.statValue}>
                {tripDetails.fuel_consump ? `${tripDetails.fuel_consump} L` : 'N/A'}
              </Text>
              <Text style={styles.statLabel}>Est. Fuel</Text>
            </View>

            <View style={styles.statBox}>
              <MaterialIcons name="schedule" size={20} color="#0284c7" />
              <Text style={styles.statValue}>
                {tripDetails.estimated_time_hour || 0}h {tripDetails.estimated_time_minutes || 0}m
              </Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
          </View>

          {/* Interactive Map Shortcut Button if Place IDs exist */}
          {tripDetails?.pick_up_place_id && tripDetails?.drop_in_place_id ? (
            <TouchableOpacity
              style={styles.mapBtn}
              onPress={() => {
                router.push({
                  pathname: '/screens/ViewMap',
                  params: { data: JSON.stringify(tripDetails) }
                });
              }}
            >
              <FontAwesome5 name="map-marked-alt" size={18} color="#fff" />
              <Text style={styles.mapBtnText}>View Interactive Map Route</Text>
            </TouchableOpacity>
          ) : null}

          {/* Location & Address Details Card */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <FontAwesome5 name="route" size={18} color="#0284c7" />
              <Text style={styles.cardTitle}>
                {isShipmentTrip ? 'Warehouse & Factory Details' : 'Route Master Address Details'}
              </Text>
            </View>

            {isShipmentTrip ? (
              <>
                <View style={styles.addressBlock}>
                  <View style={styles.addressBlockHeader}>
                    <FontAwesome5 name="warehouse" size={14} color="#10b981" />
                    <Text style={styles.addressBlockTitle}>Warehouse (Pick-up Origin)</Text>
                  </View>
                  <Text style={styles.addressNameText}>{tripDetails?.warehouse_name || 'Warehouse Depot'}</Text>
                  {tripDetails?.warehouse_address ? (
                    <Text style={styles.addressText}>{tripDetails.warehouse_address}</Text>
                  ) : null}
                </View>

                <View style={styles.addressBlockDivider} />

                <View style={styles.addressBlock}>
                  <View style={styles.addressBlockHeader}>
                    <FontAwesome5 name="industry" size={14} color="#ef4444" />
                    <Text style={styles.addressBlockTitle}>Factory / Plant (Drop-in Destination)</Text>
                  </View>
                  <Text style={styles.addressNameText}>{tripDetails?.factory_name || 'Factory Destination'}</Text>
                  {tripDetails?.factory_address ? (
                    <Text style={styles.addressText}>{tripDetails.factory_address}</Text>
                  ) : null}
                </View>
              </>
            ) : (
              <>
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={18} color="#10b981" />
                  <Text style={styles.infoLabel}>Pickup Station:</Text>
                  <Text style={styles.infoValue}>{tripDetails?.pick_up || 'N/A'}</Text>
                </View>

                {tripDetails?.stops && tripDetails.stops.length > 0 && (
                  <View style={{ marginVertical: 6 }}>
                    <Text style={styles.stopHeader}>Route Waypoints / Stops:</Text>
                    {tripDetails.stops.map((stop, idx) => (
                      <View key={idx} style={styles.stopItemRow}>
                        <Ionicons name="location-sharp" size={14} color="#f59e0b" />
                        <Text style={styles.stopItemText}>
                          Stop {idx + 1}: {stop.stop_name}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={18} color="#ef4444" />
                  <Text style={styles.infoLabel}>Destination:</Text>
                  <Text style={styles.infoValue}>{tripDetails?.drop_in || 'N/A'}</Text>
                </View>
              </>
            )}

            <View style={[styles.infoRow, { marginTop: 10 }]}>
              <MaterialIcons name="calendar-today" size={16} color="#64748b" />
              <Text style={styles.infoLabel}>Schedule Date:</Text>
              <Text style={styles.infoValue}>
                {formatDateTime(tripDetails.start_date || tripDetails.created_at)}
              </Text>
            </View>
          </View>

          {/* Shipment Order Details Card (If applicable) */}
          {(isShipmentTrip || tripDetails?.shipment_order_no || tripDetails?.customer_name) ? (
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <FontAwesome5 name="box" size={18} color="#8b5cf6" />
                <Text style={styles.cardTitle}>Shipment & Customer Details</Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="document-text-outline" size={18} color="#64748b" />
                <Text style={styles.infoLabel}>Shipment Order #:</Text>
                <Text style={styles.infoValue}>{tripDetails.shipment_order_no || 'N/A'}</Text>
              </View>

              {tripDetails?.delivery_receipt_no ? (
                <View style={styles.infoRow}>
                  <Ionicons name="receipt-outline" size={18} color="#64748b" />
                  <Text style={styles.infoLabel}>Challan Receipt #:</Text>
                  <Text style={styles.infoValue}>{tripDetails.delivery_receipt_no}</Text>
                </View>
              ) : null}

              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={18} color="#64748b" />
                <Text style={styles.infoLabel}>Customer Name:</Text>
                <Text style={styles.infoValue}>{tripDetails.customer_name || 'N/A'}</Text>
              </View>
            </View>
          ) : null}

          {/* Vehicle Information Card */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <MaterialCommunityIcons name="truck-fast" size={20} color="#4f46e5" />
              <Text style={styles.cardTitle}>Assigned Vehicle Info</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="car-outline" size={18} color="#64748b" />
              <Text style={styles.infoLabel}>Make / Type:</Text>
              <Text style={styles.infoValue}>
                {tripDetails.make || 'N/A'} ({tripDetails.vehicle_type || 'Truck'})
              </Text>
            </View>

            <View style={styles.infoRow}>
              <FontAwesome name="drivers-license" size={16} color="#64748b" />
              <Text style={styles.infoLabel}>License Plate:</Text>
              <Text style={styles.infoValue}>{tripDetails.license_plate || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="identifier" size={18} color="#64748b" />
              <Text style={styles.infoLabel}>VIN Number:</Text>
              <Text style={styles.infoValue}>{tripDetails.vin || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="water-outline" size={18} color="#64748b" />
              <Text style={styles.infoLabel}>Fuel Type:</Text>
              <Text style={styles.infoValue}>{tripDetails.fuel_type || 'Diesel'}</Text>
            </View>
          </View>

          <View style={{ height: 30 }} />
        </>
      ) : (
        <View style={{ padding: 30, alignItems: "center" }}>
          <Text style={{ fontSize: 16, color: "#64748b" }}>Trip details not found.</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc"
  },
  header: {
    padding: 20,
    paddingBottom: 35,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16
  },
  tripCategoryBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 4
  },
  tripCategoryText: {
    color: "#e2e8f0",
    fontSize: 11,
    fontWeight: "700"
  },
  tripCodeText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800"
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700"
  },
  timelineContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    padding: 14
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  pointLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: 0.5
  },
  routeText: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "600"
  },
  timelineLine: {
    height: 14,
    width: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginLeft: 6,
    marginVertical: 2
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -22,
    marginHorizontal: 16,
    marginBottom: 14
  },
  statBox: {
    backgroundColor: "#fff",
    width: "31%",
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6
  },
  statValue: {
    fontWeight: "800",
    fontSize: 14,
    color: "#0f172a",
    marginTop: 6
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2
  },
  mapBtn: {
    backgroundColor: "#9f2779",
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    elevation: 2
  },
  mapBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700"
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 18,
    borderRadius: 18,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9"
  },
  cardTitle: {
    fontWeight: "700",
    fontSize: 15,
    color: "#0f172a"
  },
  addressBlock: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12
  },
  addressBlockHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4
  },
  addressBlockTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#475569",
    textTransform: "uppercase"
  },
  addressNameText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a"
  },
  addressText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
    lineHeight: 16
  },
  addressBlockDivider: {
    height: 10
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8
  },
  infoLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
    width: 120
  },
  infoValue: {
    fontSize: 13,
    color: "#0f172a",
    fontWeight: "700",
    flex: 1
  },
  stopHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginTop: 4,
    marginBottom: 4
  },
  stopItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 10,
    marginBottom: 4
  },
  stopItemText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "500"
  }
});

export default TripDetails;