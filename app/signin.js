import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AntDesign from '@expo/vector-icons/AntDesign';
import LoadingComp from '../component/common/LoadingComp';

export default function index() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const router = useRouter()
    const [userCredentials, setUserCredentials] = useState({
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false);
    const [pageLoading, setpageLoading] = useState(true);
    const [visible, setVisible] = useState(false)

    async function handleSignin() {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}api/driver_account`, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                email: userCredentials?.email,
                password: userCredentials?.password
            })
        })
        return response.json()
    }

    async function setItem(key, value) {
        try {
            await AsyncStorage.setItem(key, value)
            return true;
        } catch (error) {
            return false;
        }
    }

    async function getItem(key) {
        try {
            const response = await AsyncStorage.getItem(key)
            return JSON.parse(response);
        } catch (error) {
            return undefined;
        }
    }

    function signInFunction() {
        setLoading(true)
        if (!userCredentials.email || !userCredentials.email.match(emailRegex)) {
            Alert.alert('Login', 'Please enter a valid email.')
            setLoading(false)
            return false;
        } else if (!userCredentials.password) {
            Alert.alert('Login', 'Please enter valid password.')
            setLoading(false)
            return false;
        } else {
            try {
                handleSignin().then((res) => {
                    setLoading(false)
                    if (res.status) {
                        if(res.type == "old"){
                            setItem('userData', JSON.stringify(res?.userData)).then((res) => {
                                router.replace('(tabs)')
                            })
                        }else{
                            setItem('userData', JSON.stringify(res?.userData)).then((res) => {
                                router.replace('/screens/validatepassword');
                            })
                        }
                    } else {
                        Alert.alert('Login', 'Invalid Credentials.')
                        return false;
                    }
                }).catch((err) => {
                    setLoading(false)
                    Alert.alert('Login', 'Something went wrong!')
                })

            } catch (error) {
                setLoading(false)
                Alert.alert('Error', error)
            }
        }
    }

    useEffect(() => {
        getItem('userData').then((details) => {
            if (details) {
                router.replace('(tabs)')
            } else {
                setpageLoading(false)
            }
        })
    }, [])


    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar style={"dark"} />
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.select({ ios: "padding", android: 'height' })}
            >
                {pageLoading ?
                    <LoadingComp />
                    :
                    <>
                        <Image source={require("../assets/naracoo.png")} style={{width: "100%", height: 100, objectFit: "contain"}} />
                        <Text style={styles.heading}>Fleet Driver</Text>
                        <Text style={styles.title}>Welcome Back!</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Email or Username"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={userCredentials.email}
                            onChangeText={(text) => { setUserCredentials({ ...userCredentials, email: text }) }}
                            placeholderTextColor={"gray"}
                        />
                        <View>
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                secureTextEntry={visible ? false : true}
                                value={userCredentials.password}
                                onChangeText={(text) => { setUserCredentials({ ...userCredentials, password: text }) }}
                                placeholderTextColor={"gray"}
                            />
                            {!visible ? <AntDesign onPress={()=>{setVisible(!visible)}} name="eye-invisible" size={24} color="black" style={styles.visibleEye} /> :
                            <AntDesign onPress={()=>{setVisible(!visible)}} name="eye" size={24} color="black" style={styles.visibleEye} />}
                        </View>
                        <TouchableOpacity style={styles.button} onPress={signInFunction}>
                            {loading ? <ActivityIndicator size={"small"} color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
                        </TouchableOpacity>
                        {/* <TouchableOpacity style={styles.buttonSignup} onPress={() => {  }}>
                            {loading ? <ActivityIndicator size={"small"} color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
                        </TouchableOpacity> */}
                        <TouchableOpacity style={{margin: "auto", marginTop: 0}}>
                            <Text style={styles.forgotPassword}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </>}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "white"
    },
    heading: {
        fontSize: 45,
        marginBottom: 10,
    },
    title: {
        fontSize: 20,
        marginBottom: 40,
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 20,
        color: "gray",
    },
    button: {
        backgroundColor: '#9f2779',
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginTop: 10,
    },
    buttonSignup: {
        backgroundColor: '#9f2779',
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    forgotPassword: {
        marginTop: 20,
        color: '#007bff',
        fontSize: 16
    },
    visibleEye: {
        position: "absolute",
        right: 10,
        top: 0,
        zIndex: 55,
        padding: 10
    }
});