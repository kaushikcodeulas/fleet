import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import {
  MaterialIcons,
  Ionicons,
  FontAwesome5,
  FontAwesome6,
  MaterialCommunityIcons,
  Feather
} from '@expo/vector-icons';
import { homeValue } from '../../../redux/homeSlice';
import { useSelector, useDispatch } from 'react-redux';
import { getDashboardSummary, getTripDetails } from '../../../redux/homeThunks';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import LottieFileView from '../../../component/common/LottieFileView';

const Home = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const homeData = useSelector(homeValue);
  const userData = homeData?.userData;
  const driverDetails = homeData?.details;
  const dashboardState = homeData?.dashboardSummary;
  const dashboardData = dashboardState?.data;
  const isLoading = dashboardState?.loading;

  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(() => {
    if (userData?.token) {
      dispatch(getDashboardSummary(userData?.token));
      dispatch(getTripDetails(userData?.token));
    }
  }, [userData?.token, dispatch]);

  useEffect(() => {
    if (isFocused) {
      fetchDashboardData();
    }
  }, [isFocused, fetchDashboardData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const currentTrip = dashboardData?.current_trip || homeData?.tripDetails?.data;
  const stats = dashboardData?.stats || {};
  const recentTrips = dashboardData?.recent_trips || [];
  const alerts = dashboardData?.alerts || [];

  // Calculate percentages
  const totalVehicles = stats?.company_total_vehicles || 1;
  const runningVehicles = stats?.company_running_vehicles || 0;
  const idleVehicles = stats?.company_idle_vehicles || 0;
  
  const activePct = Math.round((runningVehicles / totalVehicles) * 100) || 0;
  const idlePct = Math.round((idleVehicles / totalVehicles) * 100) || 0;
  const offlinePct = Math.max(0, 100 - activePct - idlePct);

  const driverName = driverDetails?.employee_name || userData?.employee_name || userData?.name || 'Driver';

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#9f2779', '#4f46e5']} />
      }
    >
      {/* Header Banner */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greetingText}>Welcome Back 👋</Text>
            <Text style={styles.driverName}>{driverName}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileBadge}
            onPress={() => router.push('/(home)/(tabs)/profile')}
          >
            <FontAwesome5 name="user-alt" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.statusPillRow}>
          <View style={[styles.statusPill, currentTrip ? styles.statusActivePill : styles.statusStandbyPill]}>
            <View style={[styles.statusDot, currentTrip ? styles.dotActive : styles.dotStandby]} />
            <Text style={styles.statusPillText}>
              {currentTrip ? 'On Active Route' : 'Standby / Available'}
            </Text>
          </View>

          <TouchableOpacity style={styles.refreshBtn} onPress={fetchDashboardData}>
            <Ionicons name="refresh" size={16} color="#6b7280" />
            <Text style={styles.refreshBtnText}>Live</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Loading or Display */}
      {isLoading && !dashboardData ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#9f2779" />
          <Text style={styles.loadingText}>Loading Fleet Intelligence...</Text>
        </View>
      ) : (
        <>
          {/* Active Trip Banner */}
          <Text style={styles.sectionHeaderTitle}>Current Assigned Route</Text>

          {currentTrip && (currentTrip?.trip_id || currentTrip?.id || currentTrip?.make) ? (
            <View style={styles.activeTripCard}>
              <View style={styles.tripCardHeader}>
                <View style={styles.tripBadge}>
                  <MaterialCommunityIcons name="truck-fast" size={20} color="#fff" />
                  <Text style={styles.tripBadgeText}>
                    {currentTrip?.trip_category === 'shipment_order' ? 'Shipment Order' : 'Route Trip'}
                  </Text>
                </View>
                <Text style={styles.tripCodeText}>
                  #{currentTrip?.trip_code || currentTrip?.trip_id || 'TRIP'}
                </Text>
              </View>

              {/* Locations */}
              <View style={styles.routeRouteBox}>
                <View style={styles.routePointRow}>
                  <Ionicons name="location-sharp" size={20} color="#10b981" />
                  <View style={styles.pointTextCol}>
                    <Text style={styles.pointLabel}>
                      {currentTrip?.trip_category === 'shipment_order' ? 'ORIGIN WAREHOUSE' : 'PICKUP'}
                    </Text>
                    <Text style={styles.pointValue} numberOfLines={1}>
                      {currentTrip?.trip_category === 'shipment_order'
                        ? (currentTrip?.warehouse_name || 'Warehouse Depot')
                        : (currentTrip?.pick_up || 'Start Point')}
                    </Text>
                    {currentTrip?.trip_category === 'shipment_order' && currentTrip?.warehouse_address ? (
                      <Text style={styles.pointAddressText} numberOfLines={2}>
                        {currentTrip.warehouse_address}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.routeConnectorLine} />

                <View style={styles.routePointRow}>
                  <Ionicons name="location-sharp" size={20} color="#ef4444" />
                  <View style={styles.pointTextCol}>
                    <Text style={styles.pointLabel}>
                      {currentTrip?.trip_category === 'shipment_order' ? 'DESTINATION FACTORY' : 'DESTINATION'}
                    </Text>
                    <Text style={styles.pointValue} numberOfLines={1}>
                      {currentTrip?.trip_category === 'shipment_order'
                        ? (currentTrip?.factory_name || 'Factory Delivery')
                        : (currentTrip?.drop_in || 'Destination Point')}
                    </Text>
                    {currentTrip?.trip_category === 'shipment_order' && currentTrip?.factory_address ? (
                      <Text style={styles.pointAddressText} numberOfLines={2}>
                        {currentTrip.factory_address}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>

              {/* Trip Quick Metrics */}
              <View style={styles.tripMetricsRow}>
                <View style={styles.metricItem}>
                  <FontAwesome5 name="road" size={14} color="#6366f1" />
                  <Text style={styles.metricItemVal}>
                    {currentTrip?.approx_km || '0'} km
                  </Text>
                  <Text style={styles.metricItemLbl}>Est. Distance</Text>
                </View>

                <View style={styles.metricItemDivider} />

                <View style={styles.metricItem}>
                  <FontAwesome5 name="gas-pump" size={14} color="#f59e0b" />
                  <Text style={styles.metricItemVal}>
                    {currentTrip?.fuel_consump ? `${currentTrip.fuel_consump} L` : 'N/A'}
                  </Text>
                  <Text style={styles.metricItemLbl}>Est. Fuel</Text>
                </View>

                <View style={styles.metricItemDivider} />

                <View style={styles.metricItem}>
                  <FontAwesome5 name="truck-monster" size={14} color="#10b981" />
                  <Text style={styles.metricItemVal} numberOfLines={1}>
                    {currentTrip?.license_plate || currentTrip?.make || 'Assigned Vehicle'}
                  </Text>
                  <Text style={styles.metricItemLbl}>Vehicle</Text>
                </View>
              </View>

              {/* Manage Trip Action Button */}
              <TouchableOpacity
                style={styles.viewTripBtn}
                onPress={() => router.push('/(home)/(tabs)/manage')}
              >
                <FontAwesome6 name="map-location-dot" size={16} color="#fff" />
                <Text style={styles.viewTripBtnText}>Open Trip Management</Text>
                <Feather name="chevron-right" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            /* Lottie Animation when NO Active Trip is Assigned */
            <View style={styles.emptyTripCard}>
              <LottieFileView
                file={require('../../../assets/lottiefiles/nodata.json')}
                title="No Active Trip Assigned"
                message="When Naracoo Fleet assigns a route or shipment order to your account, it will dynamically appear here."
                width={200}
                height={150}
              />
              <TouchableOpacity
                style={styles.historyShortcutBtn}
                onPress={() => router.push('/screens/AllTrips')}
              >
                <Text style={styles.historyShortcutText}>View Trip History</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Dynamic KPI Cards Grid */}
          <Text style={styles.sectionHeaderTitle}>Fleet Metrics & Overview</Text>

          <View style={styles.kpiGridRow}>
            <View style={[styles.kpiCard, { backgroundColor: '#4f46e5' }]}>
              <MaterialIcons name="directions-bus" size={28} color="#fff" />
              <Text style={styles.kpiValue}>{stats?.company_total_vehicles ?? 1}</Text>
              <Text style={styles.kpiLabel}>Fleet Vehicles</Text>
            </View>

            <View style={[styles.kpiCard, { backgroundColor: '#10b981' }]}>
              <Ionicons name="play-circle" size={28} color="#fff" />
              <Text style={styles.kpiValue}>{stats?.active_trips ?? (currentTrip ? 1 : 0)}</Text>
              <Text style={styles.kpiLabel}>Active Routes</Text>
            </View>
          </View>

          <View style={styles.kpiGridRow}>
            <View style={[styles.kpiCard, { backgroundColor: '#0284c7' }]}>
              <FontAwesome5 name="route" size={24} color="#fff" />
              <Text style={styles.kpiValue}>{stats?.total_km ?? 0} <Text style={{fontSize: 14}}>km</Text></Text>
              <Text style={styles.kpiLabel}>Total Distance</Text>
            </View>

            <View style={[styles.kpiCard, { backgroundColor: '#8b5cf6' }]}>
              <MaterialIcons name="check-circle" size={28} color="#fff" />
              <Text style={styles.kpiValue}>{stats?.completed_trips ?? 0}</Text>
              <Text style={styles.kpiLabel}>Completed Trips</Text>
            </View>
          </View>

          {/* Fleet Utilization Graphic */}
          <View style={styles.utilCard}>
            <View style={styles.cardHeaderFlex}>
              <Text style={styles.graphTitle}>Fleet Utilization</Text>
              <Text style={styles.graphSubtitle}>Dynamic Fleet Status</Text>
            </View>

            <View style={styles.progressRow}>
              <FontAwesome5 name="truck-moving" size={16} color="#10b981" />
              <Text style={styles.progressLabel}>Active</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${activePct}%`, backgroundColor: '#10b981' }]} />
              </View>
              <Text style={styles.percent}>{activePct}%</Text>
            </View>

            <View style={styles.progressRow}>
              <FontAwesome5 name="truck" size={16} color="#f59e0b" />
              <Text style={styles.progressLabel}>Idle</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${idlePct}%`, backgroundColor: '#f59e0b' }]} />
              </View>
              <Text style={styles.percent}>{idlePct}%</Text>
            </View>

            <View style={styles.progressRow}>
              <FontAwesome6 name="truck-fast" size={16} color="#6b7280" />
              <Text style={styles.progressLabel}>Standby</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${offlinePct}%`, backgroundColor: '#6b7280' }]} />
              </View>
              <Text style={styles.percent}>{offlinePct}%</Text>
            </View>
          </View>

          {/* Quick Actions Shortcuts */}
          <Text style={styles.sectionHeaderTitle}>Quick Actions</Text>

          <View style={styles.quickActionRow}>
            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => router.push('/(home)/(tabs)/manage')}
            >
              <View style={[styles.quickIconBg, { backgroundColor: '#e0e7ff' }]}>
                <FontAwesome6 name="map-location-dot" size={20} color="#4f46e5" />
              </View>
              <Text style={styles.quickActionLabel}>My Trip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => router.push('/(home)/(tabs)/fleet')}
            >
              <View style={[styles.quickIconBg, { backgroundColor: '#dcfce7' }]}>
                <FontAwesome5 name="truck" size={18} color="#10b981" />
              </View>
              <Text style={styles.quickActionLabel}>My Fleet</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => router.push('/screens/Activity')}
            >
              <View style={[styles.quickIconBg, { backgroundColor: '#fef3c7' }]}>
                <MaterialIcons name="receipt-long" size={22} color="#d97706" />
              </View>
              <Text style={styles.quickActionLabel}>Activity</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => router.push('/screens/Report')}
            >
              <View style={[styles.quickIconBg, { backgroundColor: '#fee2e2' }]}>
                <MaterialIcons name="report-problem" size={22} color="#ef4444" />
              </View>
              <Text style={styles.quickActionLabel}>Report Issue</Text>
            </TouchableOpacity>
          </View>

          {/* Dynamic Real-Time Alerts */}
          <Text style={styles.sectionHeaderTitle}>Real-Time Alerts & System Status</Text>

          {alerts && alerts.length > 0 ? (
            alerts.map((item, index) => (
              <View key={index} style={styles.alertCard}>
                <Ionicons
                  name={
                    item.severity === 'danger'
                      ? 'warning'
                      : item.severity === 'warning'
                      ? 'alert-circle'
                      : 'information-circle'
                  }
                  size={24}
                  color={
                    item.severity === 'danger'
                      ? '#ef4444'
                      : item.severity === 'warning'
                      ? '#f59e0b'
                      : '#3b82f6'
                  }
                />
                <View style={styles.alertTextContent}>
                  <Text style={styles.alertTitle}>{item.title}</Text>
                  <Text style={styles.alertMessage}>{item.message}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.normalAlertCard}>
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              <View style={styles.alertTextContent}>
                <Text style={styles.alertTitle}>System Normal</Text>
                <Text style={styles.alertMessage}>
                  All fleet operations and vehicle diagnostics are running smoothly.
                </Text>
              </View>
            </View>
          )}

          {/* Recent Assigned Trips List */}
          {recentTrips && recentTrips.length > 0 ? (
            <View style={styles.recentSection}>
              <View style={styles.recentHeaderRow}>
                <Text style={styles.sectionHeaderTitle}>Recent Assigned Trips</Text>
                <TouchableOpacity onPress={() => router.push('/screens/AllTrips')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>

              {recentTrips.slice(0, 3).map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentTripItem}
                  onPress={() =>
                    router.push({
                      pathname: '/screens/TripDetails',
                      params: { data: JSON.stringify(item) }
                    })
                  }
                >
                  <View style={styles.recentTripIconBg}>
                    <FontAwesome5 name="route" size={18} color="#4f46e5" />
                  </View>

                  <View style={styles.recentTripInfo}>
                    <Text style={styles.recentTripCode}>
                      Trip #{item.trip_code || item.trip_id || item.id}
                    </Text>
                    <Text style={styles.recentTripRoute} numberOfLines={1}>
                      {item.pick_up || 'Depot'} ➔ {item.drop_in || 'Destination'}
                    </Text>
                    <Text style={styles.recentTripMeta}>
                      {item.license_plate ? `${item.license_plate} • ` : ''}
                      {item.start_date || 'Assigned Route'}
                    </Text>
                  </View>

                  <View style={styles.recentTripBadgeCol}>
                    <View
                      style={[
                        styles.tripStatusTag,
                        item.status == 1
                          ? styles.statusTagActive
                          : item.status == 3
                          ? styles.statusTagCompleted
                          : styles.statusTagPending
                      ]}
                    >
                      <Text
                        style={[
                          styles.tripStatusTagText,
                          item.status == 1
                            ? styles.statusTextActive
                            : item.status == 3
                            ? styles.statusTextCompleted
                            : styles.statusTextPending
                        ]}
                      >
                        {item.status == 1 ? 'Running' : item.status == 3 ? 'Completed' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          <View style={{ height: 40 }} />
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingTop: 12
  },
  headerContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  greetingText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500'
  },
  driverName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2
  },
  profileBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#9f2779',
    justifyContent: 'center',
    alignItems: 'center'
  },
  statusPillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  statusActivePill: {
    backgroundColor: '#dcfce7'
  },
  statusStandbyPill: {
    backgroundColor: '#f1f5f9'
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6
  },
  dotActive: {
    backgroundColor: '#10b981'
  },
  dotStandby: {
    backgroundColor: '#64748b'
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155'
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  refreshBtnText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600'
  },
  loaderBox: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500'
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 10,
    marginBottom: 10
  },
  activeTripCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    elevation: 4
  },
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  tripBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  tripBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700'
  },
  tripCodeText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600'
  },
  routeRouteBox: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14
  },
  routePointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  pointTextCol: {
    flex: 1
  },
  pointLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '700',
    letterSpacing: 0.5
  },
  pointValue: {
    fontSize: 14,
    color: '#f8fafc',
    fontWeight: '700',
    marginTop: 1
  },
  pointAddressText: {
    fontSize: 11,
    color: '#cbd5e1',
    fontWeight: '400',
    marginTop: 2,
    lineHeight: 15
  },
  routeConnectorLine: {
    height: 16,
    width: 2,
    backgroundColor: '#334155',
    marginLeft: 9,
    marginVertical: 4
  },
  tripMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14
  },
  metricItem: {
    flex: 1,
    alignItems: 'center'
  },
  metricItemVal: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4
  },
  metricItemLbl: {
    color: '#94a3b8',
    fontSize: 10,
    marginTop: 2
  },
  metricItemDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  viewTripBtn: {
    backgroundColor: '#9f2779',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  viewTripBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center'
  },
  emptyTripCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2
  },
  historyShortcutBtn: {
    marginTop: 8,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  historyShortcutText: {
    fontSize: 12,
    color: '#4f46e5',
    fontWeight: '600'
  },
  kpiGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  kpiCard: {
    width: '48%',
    borderRadius: 18,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginTop: 8
  },
  kpiLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500'
  },
  utilCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    elevation: 2
  },
  cardHeaderFlex: {
    marginBottom: 14
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a'
  },
  graphSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  progressLabel: {
    width: 65,
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
    marginLeft: 8
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    marginHorizontal: 8,
    overflow: 'hidden'
  },
  progressFill: {
    height: 8,
    borderRadius: 10
  },
  percent: {
    width: 35,
    fontSize: 12,
    color: '#0f172a',
    fontWeight: '700',
    textAlign: 'right'
  },
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  quickActionItem: {
    width: '23%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 2
  },
  quickIconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center'
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    elevation: 2,
    gap: 12
  },
  normalAlertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    gap: 12
  },
  alertTextContent: {
    flex: 1
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a'
  },
  alertMessage: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2
  },
  recentSection: {
    marginTop: 6
  },
  recentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9f2779'
  },
  recentTripItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    gap: 12
  },
  recentTripIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  recentTripInfo: {
    flex: 1
  },
  recentTripCode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a'
  },
  recentTripRoute: {
    fontSize: 12,
    color: '#334155',
    marginTop: 2,
    fontWeight: '500'
  },
  recentTripMeta: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  recentTripBadgeCol: {
    alignItems: 'flex-end'
  },
  tripStatusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  statusTagActive: {
    backgroundColor: '#dcfce7'
  },
  statusTagCompleted: {
    backgroundColor: '#f3e8ff'
  },
  statusTagPending: {
    backgroundColor: '#fef3c7'
  },
  tripStatusTagText: {
    fontSize: 10,
    fontWeight: '700'
  },
  statusTextActive: {
    color: '#15803d'
  },
  statusTextCompleted: {
    color: '#7e22ce'
  },
  statusTextPending: {
    color: '#b45309'
  }
});

export default Home;