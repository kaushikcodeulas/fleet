import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Button, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingComp from '../../../component/common/LoadingComp';
import { useIsFocused } from '@react-navigation/native';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [driverData, setDriverData] = useState(null);
  const [driverDetails, setDriverDetails] = useState(null);
  const focus = useIsFocused();

  async function getItem(key) {
    try {
      const response = await AsyncStorage.getItem(key);
      return JSON.parse(response);
    } catch (error) {
      return undefined;
    }
  }

  useEffect(() => {
    getItem('userData').then((data) => {
      setLoading(false);
      if (data) {
        setDriverData(data);
        if (driverData?.token) {
          getDriverDetails().then((data) => {
            console.log(data)
            setDataLoading(false)
            if (data?.status) {
              setDriverDetails(data?.details);
            }
          })
        }
      } else {
        router.replace('signin')
      }
    }).catch((err)=>{
      console.log(err)
    })
  }, [focus])

  async function getDriverDetails() {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}api/driver_details/profile`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${driverData?.token}`,
      }
    })
    return response.json()
  }

  function logoutProfile() {
    AsyncStorage.removeItem('userData')
    router.replace('signin')
  }

  const ProfileItem = ({ icon = '', label, value, loading = false }) => {
    return (<View style={styles.profileItem}>
      <FontAwesome5 name={icon} size={18} color="#7f8c8d" />
      <View style={{ marginLeft: 12 }}>
        {loading ?
          <ActivityIndicator size={"small"} />
          :
          <>
            <Text style={styles.profileLabel}>{label}</Text>
            <Text style={styles.profileValue}>{value}</Text>
          </>}
      </View>
    </View>
    )
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {loading ?
        <LoadingComp />
        :
        <>
          <TouchableOpacity onPress={() => { router.push('/screens/ProfileEdit') }} style={{ position: "absolute", right: 20, top: 30, zIndex: 55, borderColor: "#efefef", borderWidth: 0, borderRadius: 50, paddingHorizontal: 10, paddingVertical: 13 }}>
            <FontAwesome5 name="user-edit" size={24} color="#fff" />
          </TouchableOpacity>
          {/* Header / Profile Banner */}
          <View style={styles.header}>
            <Image
              source={driverData?.picture ? { uri: process.env.EXPO_PUBLIC_API_URL + driverData?.picture } : require("../../../assets/user.png")}
              style={styles.avatar}
            />
            <Text style={styles.name}>{driverData.first_name} {driverData.last_name}</Text>
            <Text style={styles.role}>Fleet Driver</Text>

            {/* <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#f1c40f" />
            <Ionicons name="star" size={16} color="#f1c40f" />
            <Ionicons name="star" size={16} color="#f1c40f" />
            <Ionicons name="star" size={16} color="#f1c40f" />
            <Ionicons name="star-outline" size={16} color="#f1c40f" />
            <Text style={styles.ratingText}>4.0</Text>
          </View> */}
          </View>

          {/* Stats Cards */}
          <View style={styles.statsRow}>
            <StatCard icon="road" label="Total KM" value="12,450" />
            <StatCard icon="truck" label="Trips" value="1,240" />
            <StatCard icon="clock" label="Hours" value="3,560" />
          </View>

          {/* Profile Details */}
          <View style={styles.section}>
            <ProfileItem icon="id-card" label="Driver ID" value={driverData?.driver_id} />
            <ProfileItem icon="mail-bulk" label="Email" value={driverData?.email} />
            {dataLoading? <ProfileItem icon="phone" label="Phone" value={driverDetails?.phone || 'N/A'} loading={true} /> : <ProfileItem icon="phone" label="Phone" value={driverDetails?.phone || 'N/A'} loading={dataLoading} />}
            <ProfileItem icon="map-marker-alt" label="Location" value={driverDetails?.address || 'N/A'} loading={dataLoading} />
            <ProfileItem icon="truck-moving" label="Assigned Vehicle" value={driverDetails?.make ? driverDetails?.make + '-' + driverDetails?.license_plate : 'N/A'} loading={dataLoading} />
            <ProfileItem icon="calendar-alt" label="Joined On" value={driverDetails?.date || 'N/A'} loading={dataLoading} />
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <ActionButton icon="cog" label="Settings" />
            <ActionButton icon="shield-alt" label="Safety" />
            <TouchableOpacity onPress={logoutProfile}>
              <ActionButton icon="sign-out-alt" label="Logout" danger />
            </TouchableOpacity>
          </View>
        </>}

    </ScrollView>
  );
}

/* Components */

const StatCard = ({ icon, label, value }) => (
  <View style={styles.statCard}>
    <MaterialCommunityIcons name={icon} size={26} color="#3498db" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);


const ActionButton = ({ icon, label, danger }) => (
  <View style={[styles.actionButton, danger && styles.dangerButton]}>
    <FontAwesome5
      name={icon}
      size={18}
      color={danger ? '#e74c3c' : '#2c3e50'}
    />
    <Text
      style={[
        styles.actionText,
        danger && { color: '#e74c3c' },
      ]}
    >
      {label}
    </Text>
  </View>
);



/* Styles */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    marginBottom: 15
  },

  header: {
    backgroundColor: '#2c3e50',
    alignItems: 'center',
    paddingVertical: 40,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#fff',
    objectFit: "cover"
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginTop: 12,
  },
  role: {
    fontSize: 14,
    color: '#bdc3c7',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 14,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: -30,
    paddingHorizontal: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    width: '30%',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 3,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },

  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  profileItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
  },
  profileLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  profileValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },

  actions: {
    marginTop: 20,
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
    gap: 14,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
});