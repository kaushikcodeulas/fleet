import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, FontAwesome5, Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { homeValue, setDriverDetails } from '../../../redux/homeSlice';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';

export default function ProfileEdit() {
  const dispatch = useDispatch();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const homeData = useSelector(homeValue);
  const driverDetails = homeData?.details || {};
  const userData = homeData?.userData || {};

  const initialName =
    driverDetails?.employee_name ||
    (driverDetails?.first_name ? `${driverDetails.first_name} ${driverDetails.last_name || ''}`.trim() : '') ||
    userData?.employee_name ||
    userData?.name ||
    '';

  const [employeeName, setEmployeeName] = useState(initialName);
  const [phone, setPhone] = useState(driverDetails?.phone || '');
  const [address, setAddress] = useState(driverDetails?.address || '');
  const [profileImage, setProfileImage] = useState(driverDetails?.picture || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Denied', 'Media library access is required to choose a profile image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleUpdateProfile = async () => {
    if (!employeeName.trim()) {
      Alert.alert('Validation Error', 'Employee name cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/driver_details/update_profile`,
        {
          employee_name: employeeName.trim(),
          phone: phone.trim(),
          address: address.trim(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userData?.token}`,
          },
        }
      );

      if (response.data?.status) {
        if (response.data?.details) {
          dispatch(setDriverDetails({ details: response.data.details }));
        }
        Alert.alert('Success', 'Profile updated successfully!', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert('Update Failed', response.data?.msg || 'Unable to update profile. Please try again.');
      }
    } catch (error) {
      console.log('Update profile error:', error);
      Alert.alert('Error', 'An error occurred while updating profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Stack.Screen
        options={{
          title: 'Edit Profile',
          headerStyle: { backgroundColor: '#1e1b4b' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
      <Animated.View
        style={[
          styles.wrapper,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Profile Picture Card */}
        <View style={styles.avatarCard}>
          <TouchableOpacity style={styles.imageWrapper} onPress={pickImage} activeOpacity={0.8}>
            {profileImage ? (
              <Image
                source={{
                  uri: profileImage.startsWith('http') || profileImage.startsWith('file')
                    ? profileImage
                    : process.env.EXPO_PUBLIC_BASE_URL + profileImage,
                }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <FontAwesome5 name="user" size={40} color="#94a3b8" />
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={18} color="#ffffff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tap photo to change profile image</Text>
        </View>

        {/* Form Controls */}
        <View style={styles.formCard}>
          <Text style={styles.formSectionTitle}>Personal Details</Text>

          {/* Employee Name */}
          <InputBox
            label="Employee Name"
            icon="id-badge"
            placeholder="Enter employee name"
            value={employeeName}
            onChangeText={setEmployeeName}
          />

          {/* Phone */}
          <InputBox
            label="Phone Number"
            icon="phone-alt"
            placeholder="Enter contact number"
            value={phone}
            keyboardType="phone-pad"
            onChangeText={setPhone}
          />

          {/* Address */}
          <InputBox
            label="Operating Address / Base"
            icon="map-marker-alt"
            placeholder="Enter address"
            value={address}
            onChangeText={setAddress}
          />

          {/* Read Only Info */}
          <View style={styles.readOnlyBox}>
            <View style={styles.readOnlyRow}>
              <Feather name="mail" size={16} color="#64748b" />
              <Text style={styles.readOnlyText}>Email: {driverDetails?.email || 'N/A'}</Text>
            </View>
            {driverDetails?.driver_id && (
              <View style={[styles.readOnlyRow, { marginTop: 6 }]}>
                <Feather name="shield" size={16} color="#64748b" />
                <Text style={styles.readOnlyText}>Employee ID: {driverDetails.driver_id}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleUpdateProfile}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

/* Reusable Input Component */
const InputBox = ({ label, icon, ...props }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <FontAwesome5 name={icon} size={16} color="#6366f1" style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholderTextColor="#94a3b8"
        {...props}
      />
    </View>
  </View>
);

/* Styles */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  wrapper: {
    padding: 18,
    paddingBottom: 40,
  },
  avatarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  imageWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#cbd5e1',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#4f46e5',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#ffffff',
  },
  avatarHint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 10,
    fontWeight: '500',
  },

  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  formSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  inputWrapper: {
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputIcon: {
    marginRight: 10,
    width: 20,
    textAlign: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    padding: 0,
  },
  readOnlyBox: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
  },
  readOnlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  readOnlyText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },

  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});