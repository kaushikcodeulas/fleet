import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

const fleet = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Text style={styles.header}>My Fleet</Text>
      <Text style={styles.subHeader}>Vehicle assigned to you</Text>

      {/* Vehicle Card */}
      <View style={styles.vehicleCard}>
        <View style={styles.vehicleTop}>
          <MaterialCommunityIcons name="truck-fast" size={42} color="#fff" />
          <View>
            <Text style={styles.vehicleName}>Tata Ace – WB 24 A 5678</Text>
            <Text style={styles.vehicleType}>Mini Truck • Diesel</Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusBadge}>
            <Ionicons name="radio-button-on" size={12} color="#2ecc71" />
            <Text style={styles.statusText}> Active</Text>
          </View>
          <Text style={styles.lastUpdated}>Updated: 2 mins ago</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <MaterialIcons name="speed" size={26} color="#16a34a" />
          <Text style={styles.statValue}>62 km/h</Text>
          <Text style={styles.statLabel}>Speed</Text>
        </View>

        <View style={styles.statBox}>
          <Ionicons name="navigate" size={26} color="#2563eb" />
          <Text style={styles.statValue}>245 km</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>

        <View style={styles.statBox}>
          <MaterialIcons name="schedule" size={26} color="#f59e0b" />
          <Text style={styles.statValue}>5h 20m</Text>
          <Text style={styles.statLabel}>Running</Text>
        </View>
      </View>

      {/* Fuel Graphic */}
      <View style={styles.graphCard}>
        <Text style={styles.cardTitle}>Fuel Level</Text>

        <View style={styles.fuelRow}>
          <Ionicons name="battery-half" size={26} color="#16a34a" />
          <View style={styles.fuelBar}>
            <View style={styles.fuelFill} />
          </View>
          <Text style={styles.percent}>65%</Text>
        </View>
      </View>

    
      {/* Trip Summary */}
      <View style={styles.tripCard}>
        <Text style={styles.tripTitle}>Today’s Trip Summary</Text>

        <View style={styles.tripRow}>
          <FontAwesome5 name="play" size={14} color="#3498db" />
          <Text style={styles.tripText}>Trips Completed: 5</Text>
        </View>

        <View style={styles.tripRow}>
          <FontAwesome5 name="map-marker-alt" size={14} color="#e67e22" />
          <Text style={styles.tripText}>Current Location: Kolkata</Text>
        </View>

        <View style={styles.tripRow}>
          <FontAwesome5 name="exclamation-triangle" size={14} color="#e74c3c" />
          <Text style={styles.tripText}>Alerts: None</Text>
        </View>
      </View>
      
      {/* Alerts */}
      <View style={styles.alertCard}>
        <Ionicons name="warning" size={22} color="#dc2626" />
        <Text style={styles.alertText}>
          Maintenance due in next 500 km
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actionRow}>
        <View style={styles.actionBtn}>
          <Ionicons name="location" size={20} color="#fff" />
          <Text style={styles.actionText}>Live Track</Text>
        </View>

        <View style={[styles.actionBtn, { backgroundColor: '#16a34a' }]}>
          <Ionicons name="call" size={20} color="#fff" />
          <Text style={styles.actionText}>Call Driver</Text>
        </View>
      </View>

    </ScrollView>
  )
}
/* Small Info Card Component */
const InfoCard = ({ icon, label, value }) => (
  <View style={styles.infoCard}>
    <Ionicons name={icon} size={24} color="#3498db" />
    <Text style={styles.infoValue}>{value}</Text>
    <Text style={styles.infoLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    padding: 16,
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

  vehicleCard: {
    backgroundColor: '#34495e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 0,
  },
  vehicleTop: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  vehicleName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  vehicleType: {
    color: '#bdc3c7',
    fontSize: 12,
  },
  statusRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    color: '#2ecc71',
    fontSize: 13,
  },
  lastUpdated: {
    color: '#bdc3c7',
    fontSize: 11,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    color: '#2c3e50',
  },
  infoLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },

  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
  },
  tripTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#2c3e50',
  },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  tripText: {
    fontSize: 14,
    color: '#34495e',
  },
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
  },
  headerCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    elevation: 4,
  },
  vehicleNo: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
    marginRight: 6,
  },
  statusText: {
    color: '#16a34a',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 15,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 10,
    color: '#374151',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  statBox: {
    backgroundColor: '#fff',
    width: '31%',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 3,
  },
  statValue: {
    fontWeight: 'bold',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  graphCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 15,
    elevation: 3,
  },
  fuelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fuelBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    marginHorizontal: 10,
  },
  fuelFill: {
    width: '65%',
    height: 8,
    backgroundColor: '#16a34a',
    borderRadius: 10,
  },
  percent: {
    fontWeight: 'bold',
  },
  alertCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginTop: 15,
    elevation: 2,
  },
  alertText: {
    marginLeft: 10,
    color: '#dc2626',
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    width: '48%',
    padding: 14,
    borderRadius: 14,
  },
  actionText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
});
export default fleet