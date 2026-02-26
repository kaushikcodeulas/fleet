import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const index = () => {
    return (

         <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Fleet Dashboard</Text>
        <Ionicons name="notifications-outline" size={24} color="#111827" />
      </View>

      {/* KPI Cards */}
      <View style={styles.row}>
        <View style={[styles.card, { backgroundColor: '#4f46e5' }]}>
          <MaterialIcons name="local-shipping" size={32} color="#fff" />
          <Text style={styles.cardValue}>120</Text>
          <Text style={styles.cardLabel}>Total Vehicles</Text>
        </View>

        <View style={[styles.card, { backgroundColor: '#16a34a' }]}>
          <Ionicons name="play-circle" size={32} color="#fff" />
          <Text style={styles.cardValue}>86</Text>
          <Text style={styles.cardLabel}>Running</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.card, { backgroundColor: '#f59e0b' }]}>
          <MaterialIcons name="pause-circle-filled" size={32} color="#fff" />
          <Text style={styles.cardValue}>20</Text>
          <Text style={styles.cardLabel}>Idle</Text>
        </View>

        <View style={[styles.card, { backgroundColor: '#dc2626' }]}>
          <Ionicons name="alert-circle" size={32} color="#fff" />
          <Text style={styles.cardValue}>14</Text>
          <Text style={styles.cardLabel}>Offline</Text>
        </View>
      </View>

      {/* Utilization */}
      <View style={styles.graphCard}>
        <Text style={styles.graphTitle}>Fleet Utilization</Text>

        <View style={styles.progressRow}>
          <FontAwesome5 name="truck-moving" size={18} color="#16a34a" />
          <Text style={styles.progressLabel}>Active</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '72%', backgroundColor: '#16a34a' }]} />
          </View>
          <Text style={styles.percent}>72%</Text>
        </View>

        <View style={styles.progressRow}>
          <FontAwesome5 name="truck" size={18} color="#f59e0b" />
          <Text style={styles.progressLabel}>Idle</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '18%', backgroundColor: '#f59e0b' }]} />
          </View>
          <Text style={styles.percent}>18%</Text>
        </View>

        <View style={styles.progressRow}>
          <FontAwesome6 name="truck-fast" size={18} color="#dc2626"  />
          <Text style={styles.progressLabel}>Offline</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '10%', backgroundColor: '#dc2626' }]} />
          </View>
          <Text style={styles.percent}>10%</Text>
        </View>
      </View>

      {/* Alerts */}
      <Text style={styles.sectionTitle}>Alerts</Text>

      <View style={styles.alertCard}>
        <Ionicons name="warning" size={22} color="#dc2626" />
        <Text style={styles.alertText}>
          3 vehicles offline for more than 24 hours
        </Text>
      </View>

      <View style={styles.alertCard}>
        <MaterialIcons name="build" size={22} color="#f59e0b" />
        <Text style={styles.alertText}>
          5 vehicles due for maintenance
        </Text>
      </View>

    </ScrollView>
    )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    elevation: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  cardLabel: {
    color: '#e5e7eb',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 14,
  },
  utilRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  utilText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  utilPercent: {
    fontWeight: 'bold',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  alertText: {
    marginLeft: 10,
    color: '#374151',
    flex: 1,
  },
   graphCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    elevation: 3,
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    width: 60,
    fontSize: 13,
    marginLeft: 5
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    marginHorizontal: 8,
  },
  progressFill: {
    height: 8,
    borderRadius: 10,
  },
  percent: {
    width: 40,
    fontSize: 12,
    textAlign: 'right',
  },
});
export default index