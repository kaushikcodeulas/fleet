import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StatusBar
} from 'react-native';
import { FontAwesome5, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector, useDispatch } from 'react-redux';
import { homeValue, setDriverDetails } from '../../../redux/homeSlice';
import { useCommonContext } from '../../../context/CommonContext';
import axios from 'axios';

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const homeData = useSelector(homeValue);
  const driverDetails = homeData?.details || {};
  const userData = homeData?.userData || {};
  const tripDetails = homeData?.tripDetails?.data;
  const { dateFormat } = useCommonContext();

  const [driverProfile, setDriverProfile] = useState({ total_hour: 0, total_km: 0, total_trip: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const employeeName =
    driverDetails?.employee_name ||
    userData?.employee_name ||
    userData?.name ||
    (driverDetails?.first_name ? `${driverDetails.first_name} ${driverDetails.last_name || ''}`.trim() : 'Fleet Employee');

  const fetchProfileStats = useCallback(async () => {
    try {
      if (!userData?.token) return;
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/driver_details/getDriverProfile`,
        { id: tripDetails?.trip_id },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userData?.token}`
          }
        }
      );
      if (response.data?.status) {
        setDriverProfile(response.data?.details);
      }
    } catch (error) {
      console.log('Error fetching driver profile stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userData?.token, tripDetails?.trip_id]);

  const refreshProfileData = useCallback(async () => {
    try {
      if (!userData?.token) return;
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/driver_details/profile`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userData?.token}`
        }
      });
      const data = await response.json();
      if (data?.status && data?.details) {
        dispatch(setDriverDetails({ details: data.details }));
      }
    } catch (error) {
      console.log('Error refreshing profile data:', error);
    }
  }, [userData?.token, dispatch]);

  useEffect(() => {
    setLoading(true);
    fetchProfileStats();
  }, [fetchProfileStats]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProfileStats(), refreshProfileData()]);
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout Confirmation',
      'Are you sure you want to sign out of your fleet account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('userData');
            router.replace('signin');
          }
        }
      ]
    );
  };

  const getInitials = (name) => {
    if (!name) return 'FE';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#9f2779', '#4f46e5']} />
        }
      >
        {/* Header Banner */}
        <View style={styles.header}>
          <View style={styles.topBar}>
            <Text style={styles.headerTitle}>Fleet Profile</Text>
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/screens/ProfileEdit' })}
              style={styles.editBadgeBtn}
              activeOpacity={0.8}
            >
              <FontAwesome5 name="user-edit" size={14} color="#ffffff" />
              <Text style={styles.editBadgeText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            {driverDetails?.picture ? (
              <Image
                source={{ uri: process.env.EXPO_PUBLIC_BASE_URL + driverDetails.picture }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.fallbackAvatar}>
                <Text style={styles.avatarInitials}>{getInitials(employeeName)}</Text>
              </View>
            )}
            <View style={styles.onlineBadge}>
              <View style={styles.activeDot} />
            </View>
          </View>

          {/* Name & Role */}
          <Text style={styles.name}>{employeeName}</Text>
          <Text style={styles.roleTitle}>
            {driverDetails?.user_role ? driverDetails?.user_role : 'Professional Fleet Driver'}
          </Text>

          {/* Driver ID Tag */}
          {driverDetails?.driver_id ? (
            <View style={styles.idChip}>
              <Feather name="shield" size={13} color="#93c5fd" />
              <Text style={styles.idChipText}>ID: {driverDetails.driver_id}</Text>
            </View>
          ) : null}
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="speedometer"
            label="Total Distance"
            value={`${driverProfile?.total_km || 0} KM`}
            loading={loading}
            color="#3b82f6"
          />
          <StatCard
            icon="truck-delivery"
            label="Total Trips"
            value={`${driverProfile?.total_trip || 0}`}
            loading={loading}
            color="#10b981"
          />
          <StatCard
            icon="clock-outline"
            label="Hours Logged"
            value={`${driverProfile?.total_hour || 0} hrs`}
            loading={loading}
            color="#8b5cf6"
          />
        </View>

        {/* Section: Employee Information */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Employee Information</Text>
          <View style={styles.cardGroup}>
            <InfoRow
              icon="account"
              iconColor="#6366f1"
              label="Employee Name"
              value={employeeName}
            />
            <InfoRow
              icon="email"
              iconColor="#3b82f6"
              label="Email Address"
              value={driverDetails?.email || 'N/A'}
            />
            <InfoRow
              icon="phone"
              iconColor="#10b981"
              label="Phone Number"
              value={driverDetails?.phone || 'Not Provided'}
            />
            <InfoRow
              icon="map-marker"
              iconColor="#f59e0b"
              label="Base / Location"
              value={driverDetails?.address || 'Not Provided'}
              isLast
            />
          </View>
        </View>

        {/* Section: Fleet Details */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Fleet & Vehicle Specs</Text>
          <View style={styles.cardGroup}>
            <InfoRow
              icon="truck"
              iconColor="#0284c7"
              label="Assigned Vehicle"
              value={
                driverDetails?.make
                  ? `${driverDetails?.make} (${driverDetails?.license_plate || 'No Plate'})`
                  : 'No Vehicle Assigned'
              }
            />
            <InfoRow
              icon="car-info"
              iconColor="#8b5cf6"
              label="Vehicle Type"
              value={driverDetails?.vehicle_type || 'Standard Logistics'}
            />
            <InfoRow
              icon="calendar-check"
              iconColor="#ec4899"
              label="Joining Date"
              value={driverDetails?.date ? dateFormat(driverDetails?.date) : 'N/A'}
              isLast
            />
          </View>
        </View>

        {/* Section: Quick Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Account & Actions</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => router.push({ pathname: '/screens/ProfileEdit' })}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#e0e7ff' }]}>
                <Feather name="edit-3" size={18} color="#4f46e5" />
              </View>
              <Text style={styles.actionText}>Edit Profile Information</Text>
              <Feather name="chevron-right" size={20} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionRow, styles.lastRow]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#fee2e2' }]}>
                <Feather name="log-out" size={18} color="#ef4444" />
              </View>
              <Text style={[styles.actionText, { color: '#ef4444' }]}>Sign Out</Text>
              <Feather name="chevron-right" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footerSpacing} />
      </ScrollView>
    </View>
  );
}

/* Sub-components */

const StatCard = ({ icon, label, value, loading, color }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconBg, { backgroundColor: `${color}15` }]}>
      <MaterialCommunityIcons name={icon} size={22} color={color} />
    </View>
    {loading ? (
      <ActivityIndicator size="small" color={color} style={{ marginVertical: 4 }} />
    ) : (
      <Text style={styles.statValue}>{value}</Text>
    )}
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const InfoRow = ({ icon, iconColor, label, value, isLast }) => (
  <View style={[styles.infoRow, isLast && styles.lastRow]}>
    <View style={[styles.infoIconBox, { backgroundColor: `${iconColor}12` }]}>
      <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

/* Styling */

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#1e1b4b',
    paddingTop: 45,
    paddingBottom: 35,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  editBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  editBadgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3.5,
    borderColor: '#ffffff',
  },
  fallbackAvatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3.5,
    borderColor: '#ffffff',
  },
  avatarInitials: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '700',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  roleTitle: {
    fontSize: 14,
    color: '#cbd5e1',
    marginTop: 4,
    fontWeight: '500',
  },
  idChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(147, 197, 253, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
    gap: 6,
  },
  idChipText: {
    color: '#93c5fd',
    fontSize: 12,
    fontWeight: '600',
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -24,
    marginHorizontal: 18,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },

  sectionContainer: {
    marginTop: 22,
    paddingHorizontal: 18,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardGroup: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 2,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  actionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  footerSpacing: {
    height: 40,
  },
});