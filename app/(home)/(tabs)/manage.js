import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

export default function ManageFleetScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <Text style={styles.header}>Manage Fleet</Text>
      <Text style={styles.subHeader}>Control & manage your assigned vehicle</Text>

      {/* Fleet Overview Card */}
      <View style={styles.overviewCard}>
        <MaterialCommunityIcons name="truck-check" size={38} color="#fff" />
        <View>
          <Text style={styles.vehicleText}>Tata Ace</Text>
          <Text style={styles.vehicleSubText}>WB 24 A 5678 • Active</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.actionGrid}>
        <ActionCard
          icon="engine"
          label="Engine Status"
          value="Running"
          color="#2ecc71"
        />
        <ActionCard
          icon="map-marker-alt"
          label="Live Location"
          value="View"
          color="#3498db"
        />
        <ActionCard
          icon="gas-pump"
          label="Fuel Level"
          value="68%"
          color="#f39c12"
        />
        <ActionCard
          icon="tools"
          label="Maintenance"
          value="Good"
          color="#9b59b6"
        />
      </View>

      {/* Management Options */}
      <Text style={styles.sectionTitle}>Fleet Management</Text>

      <ManageItem
        icon="clipboard-check"
        title="Trip Management"
        subtitle="Start, stop & view trips"
      />
      <ManageItem
        icon="exclamation-triangle"
        title="Report Issue"
        subtitle="Engine, tyre, or other issues"
      />
      <ManageItem
        icon="calendar-alt"
        title="Maintenance Schedule"
        subtitle="Upcoming service dates"
      />
      <ManageItem
        icon="file-alt"
        title="Vehicle Documents"
        subtitle="Insurance, RC, permits"
      />
      <ManageItem
        icon="shield-alt"
        title="Safety & Compliance"
        subtitle="Rules and safety checks"
      />

      {/* Emergency Button */}
      <TouchableOpacity style={styles.emergencyButton}>
        <Ionicons name="alert-circle" size={22} color="#fff" />
        <Text style={styles.emergencyText}>Emergency / SOS</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

/* Components */

const ActionCard = ({ icon, label, value, color }) => (
  <View style={styles.actionCard}>
    <FontAwesome5 name={icon} size={22} color={color} />
    <Text style={styles.actionValue}>{value}</Text>
    <Text style={styles.actionLabel}>{label}</Text>
  </View>
);

const ManageItem = ({ icon, title, subtitle }) => (
  <TouchableOpacity style={styles.manageItem}>
    <FontAwesome5 name={icon} size={20} color="#34495e" />
    <View style={{ marginLeft: 14 }}>
      <Text style={styles.manageTitle}>{title}</Text>
      <Text style={styles.manageSubtitle}>{subtitle}</Text>
    </View>
    <Ionicons
      name="chevron-forward"
      size={20}
      color="#bdc3c7"
      style={{ marginLeft: 'auto' }}
    />
  </TouchableOpacity>
);

/* Styles */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    padding: 16,
    marginBottom: 50
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
  },
  emergencyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});