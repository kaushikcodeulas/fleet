import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  Ionicons,
  FontAwesome5,
  FontAwesome6,
  MaterialIcons,
  Feather
} from "@expo/vector-icons";
import TimeConvert from "../common/TimeConvert";
import { useRouter } from "expo-router";

const getStatusConfig = (status) => {
  const statusStr = String(status);
  switch (statusStr) {
    case '1':
      return {
        label: 'Running',
        bg: '#dcfce7',
        text: '#15803d',
        dot: '#16a34a'
      };
    case '2':
      return {
        label: 'Pending',
        bg: '#fef3c7',
        text: '#b45309',
        dot: '#d97706'
      };
    case '3':
      return {
        label: 'Completed',
        bg: '#f3e8ff',
        text: '#7e22ce',
        dot: '#9333ea'
      };
    default:
      return {
        label: 'Cancelled',
        bg: '#fee2e2',
        text: '#b91c1c',
        dot: '#dc2626'
      };
  }
};

const TripCard = ({ item }) => {
  const router = useRouter();
  const statusConfig = getStatusConfig(item?.trip_status ?? item?.status);

  const isShipmentTrip = item?.trip_category === 'shipment_order';

  const pickupName = isShipmentTrip
    ? (item?.warehouse_name || 'Warehouse Depot')
    : (item?.pick_up || 'Pickup Station');
  const pickupAddress = isShipmentTrip ? (item?.warehouse_address || '') : '';

  const dropName = isShipmentTrip
    ? (item?.factory_name || 'Factory Destination')
    : (item?.drop_in || 'Destination');
  const dropAddress = isShipmentTrip ? (item?.factory_address || '') : '';

  const tripIdStr = item?.trip_code || item?.trip_id || item?.id || 'TRIP';
  const tripPrimaryId = item?.trip_id || item?.id;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={() => {
        router.push({
          pathname: "/screens/TripDetails",
          params: { id: tripPrimaryId, data: JSON.stringify(item) }
        });
      }}
    >
      {/* Top Header Row */}
      <View style={styles.cardHeader}>
        <View style={styles.idBadgeRow}>
          <View style={styles.iconBox}>
            <FontAwesome5 name="route" size={14} color="#4f46e5" />
          </View>
          <Text style={styles.tripIdText}>Trip #{tripIdStr}</Text>
          {isShipmentTrip && (
            <View style={styles.shipmentBadge}>
              <Text style={styles.shipmentBadgeText}>Shipment</Text>
            </View>
          )}
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: statusConfig.dot }]} />
          <Text style={[styles.statusText, { color: statusConfig.text }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Route Timeline Visualizer */}
      <View style={styles.routeContainer}>
        <View style={styles.routeRow}>
          <Ionicons name="ellipse" size={12} color="#10b981" style={styles.dotIcon} />
          <View style={styles.routeTextCol}>
            <Text style={styles.pointLabel}>{isShipmentTrip ? 'ORIGIN WAREHOUSE' : 'START'}</Text>
            <Text style={styles.routeAddress} numberOfLines={1}>
              {pickupName}
            </Text>
            {pickupAddress ? (
              <Text style={styles.routeSubAddress} numberOfLines={2}>
                {pickupAddress}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.timelineConnectorLine} />

        <View style={styles.routeRow}>
          <Ionicons name="location-sharp" size={14} color="#ef4444" style={styles.pinIcon} />
          <View style={styles.routeTextCol}>
            <Text style={styles.pointLabel}>{isShipmentTrip ? 'DESTINATION FACTORY' : 'DESTINATION'}</Text>
            <Text style={styles.routeAddress} numberOfLines={1}>
              {dropName}
            </Text>
            {dropAddress ? (
              <Text style={styles.routeSubAddress} numberOfLines={2}>
                {dropAddress}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      {/* Meta Specs Footer Grid */}
      <View style={styles.metaRow}>
        <View style={styles.metaPill}>
          <FontAwesome5 name="road" size={11} color="#6366f1" />
          <Text style={styles.metaText}>{item?.approx_km || 0} km</Text>
        </View>

        <View style={styles.metaPill}>
          <FontAwesome5 name="truck" size={11} color="#0284c7" />
          <Text style={styles.metaText} numberOfLines={1}>
            {item?.license_plate || item?.make || 'Vehicle'}
          </Text>
        </View>

        <View style={styles.metaPill}>
          <MaterialIcons name="schedule" size={13} color="#64748b" />
          <Text style={styles.metaText}>
            {item?.end_date ? <TimeConvert time={item.end_date} /> : (item?.start_date || 'Scheduled')}
          </Text>
        </View>
      </View>

      {/* Card Action Footer */}
      <View style={styles.footerRow}>
        <Text style={styles.detailsBtnText}>View Full Overview</Text>
        <Feather name="chevron-right" size={16} color="#9f2779" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9"
  },
  idBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center"
  },
  tripIdText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a"
  },
  shipmentBadge: {
    backgroundColor: "#f3e8ff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  shipmentBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#7e22ce"
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700"
  },
  routeContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  dotIcon: {
    width: 16,
    textAlign: "center"
  },
  pinIcon: {
    width: 16,
    textAlign: "center"
  },
  routeTextCol: {
    flex: 1
  },
  pointLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: 0.5
  },
  routeAddress: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 1
  },
  routeSubAddress: {
    fontSize: 11,
    fontWeight: "400",
    color: "#64748b",
    marginTop: 2,
    lineHeight: 15
  },
  timelineConnectorLine: {
    height: 14,
    width: 2,
    backgroundColor: "#cbd5e1",
    marginLeft: 7,
    marginVertical: 2
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  metaText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569"
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9"
  },
  detailsBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#9f2779"
  }
});

export default TripCard;