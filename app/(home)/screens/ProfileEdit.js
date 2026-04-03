import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Animated,
    Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { homeValue } from '../../../redux/homeSlice';
import { useSelector } from 'react-redux';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function ProfileEdit() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const driverDetails = useSelector(homeValue)?.details;

    const [firstName, setFirstName] = useState(driverDetails?.first_name);
    const [lastName, setLastName] = useState(driverDetails?.last_name);
    const [phone, setPhone] = useState(driverDetails?.phone);
    const [address, setAddress] = useState(driverDetails?.address);
    const [profileImage, setProfileImage] = useState(driverDetails?.picture);
    const [loading, setLoading] = useState(true);
    const router = useRouter();


    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 450,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 450,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return;

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

    return (
        <Animated.View
            style={[
                styles.wrapper,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            <Stack.Screen
                options={{
                    title: 'Edit Profile', // Set the header title dynamically
                    headerStyle: { backgroundColor: '#a648f5' }, // Customize background color
                    headerTintColor: '#fff'
                }}
            />
            {/* Profile Picture */}
            <TouchableOpacity style={styles.imageWrapper} onPress={pickImage}>
                <View style={{position: "absolute", right: 20, bottom: 20}}>
                    <AntDesign name="camera" size={24} color="black" />
                </View>
                {profileImage ? (
                    <Image source={{ uri: process.env.EXPO_PUBLIC_BASE_URL+profileImage }} style={styles.avatar} />
                ) : (
                    <Ionicons name="camera" size={28} color="#7f8c8d" />
                )}
                {profileImage ? null : <Text style={styles.imageText}>Upload Photo</Text>}
            </TouchableOpacity>

            {/* First Name */}
            <InputBox
                icon="user"
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
            />

            {/* Last Name */}
            <InputBox
                icon="user"
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
            />

            {/* Phone */}
            <InputBox
                icon="phone"
                placeholder="Phone Number"
                value={phone}
                keyboardType="phone-pad"
                onChangeText={setPhone}
            />

            <InputBox
                icon="address-book"
                placeholder="Address"
                value={address}
                onChangeText={setAddress}
            />
            <TouchableOpacity style={styles.button}>
                <Text style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>Update Profile</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

/* Reusable Input */
const InputBox = ({ icon, ...props }) => (
    <View style={styles.inputWrapper}>
        <FontAwesome5 name={icon} size={18} color="#7f8c8d" />
        <TextInput
            style={styles.input}
            placeholderTextColor="#95a5a6"
            {...props}
        />
    </View>
);

/* Styles */
const styles = StyleSheet.create({
    wrapper: {
        padding: 16,
    },

    imageWrapper: {
        alignItems: 'center',
        marginBottom: 24,
        height: 200,
        justifyContent: "center",
        borderRadius: 10,
        elevation: 1,
        shadowColor: "#000"
    },
    avatar: {
        width: "100%",
        height: "100%",
        borderRadius: 20,
        objectFit: "contain"
    },
    imageText: {
        fontSize: 13,
        color: '#3498db',
        fontWeight: '600',
    },

    inputWrapper: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 14,
        marginBottom: 14,
        elevation: 2,
    },
    input: {
        marginLeft: 12,
        fontSize: 15,
        fontWeight: '600',
        color: '#2c3e50',
        flex: 1,
    },
    button: {
        backgroundColor: "#9f2779",
        paddingHorizontal: 10,
        paddingVertical: 15,
        borderRadius: 10,
        marginTop: 10,
        justifyContent: "center",
        alignItems: "center",
        width: "100%"
    }
});