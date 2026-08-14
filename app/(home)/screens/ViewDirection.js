import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  NativeModules,
  StatusBar as RNStatusBar
} from 'react-native';
import {
  NavigationView,
  useNavigation,
  TravelMode,
  NavigationNightMode,
  CameraPerspective
} from '@googlemaps/react-native-navigation-sdk';
import * as Location from 'expo-location';
import { useLocalSearchParams, useNavigation as useExpoNavigation, useRouter } from 'expo-router';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StatusBar } from 'expo-status-bar';
import { useCommonContext } from '../../../context/CommonContext';

const geocodeAddress = async (addressString) => {
  if (!addressString) return null;
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressString)}&key=AIzaSyBGIm2P5Vav9zkOABLCe5QIEjkhyoFpD7g`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const loc = data.results[0].geometry.location;
      return { latitude: loc.lat, longitude: loc.lng };
    }
  } catch (e) {
    console.log('Geocoding error:', e);
  }
  return null;
};

const ViewDirection = () => {
  const { navigationController, isInitialized } = useNavigation();
  const viewControllerRef = useRef(null);

  // Global Context for PiP & Navigation State
  const {
    startNavigationGlobal,
    stopNavigationGlobal,
    enterPipMode,
    isNavigating,
    exitPipMode
  } = useCommonContext();

  const [isReady, setIsReady] = useState(false);
  const [destinationsSet, setDestinationsSet] = useState(false);
  const [status, setStatus] = useState('Waiting for map initialization...');
  const { cordsData, tripData } = useLocalSearchParams();

  // Safely parse trip data
  const parsedTrip = tripData
    ? (typeof tripData === 'string' ? JSON.parse(tripData) : tripData)
    : null;

  // Check if trip is already in started status (status 2 = Started)
  const isTripAlreadyStarted =
    String(parsedTrip?.status) === '2' ||
    String(parsedTrip?.trip_status) === '2';

  const [startNavigation, setStartNavigation] = useState(Boolean(isNavigating) || isTripAlreadyStarted);

  // Computed state for active turn-by-turn navigation
  const isTurnByTurnActive = startNavigation || Boolean(isNavigating) || isTripAlreadyStarted;

  // Theme & Traffic state
  const [isNightMode, setIsNightMode] = useState(true); // Default dark theme
  const [showsTraffic, setShowsTraffic] = useState(true); // Default traffic enabled

  const route = useRouter();

  useEffect(() => {
    // If returning from PiP mode or opening an active trip, keep guidance active
    exitPipMode();
    if (isNavigating || isTripAlreadyStarted) {
      setStartNavigation(true);
      setStatus('Navigation Active 🟢');
    }
  }, [isNavigating, isTripAlreadyStarted]);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setStatus('Location permission denied ❌');
      return false;
    }
    return true;
  };

  // ── Step 1: Initialize navigator when map is ready ─────────────
  const onMapReady = async () => {
    try {
      setStatus('Checking location permission...');
      const granted = await requestLocationPermission();
      if (!granted) return;

      setStatus('Initializing navigator...');
      const termsAccepted = await navigationController.showTermsAndConditionsDialog({
        companyName: "Naracoo",
        title: "Navigation Terms"
      });
      if (!termsAccepted) {
        setStatus('User declined navigation terms ❌');
        return;
      }
      await navigationController.init();

      setTimeout(() => {
        setIsReady(true);
        setStatus('Navigator initialized ✅');
      }, 2000);

    } catch (error) {
      setStatus('Init failed: ' + error.message);
      console.error('Navigator init failed:', error);
    }
  };

  // ── Step 2: Set route destinations once navigator is ready ─────
  useEffect(() => {
    if (!isReady || !navigationController) {
      return;
    }

    const setupDestinations = async () => {
      try {
        let rawCords = [];
        if (cordsData) {
          rawCords = typeof cordsData === 'string' ? JSON.parse(cordsData) : cordsData;
        }

        if (!rawCords || !Array.isArray(rawCords) || rawCords.length < 2) {
          if (parsedTrip) {
            const isShipment = parsedTrip?.trip_category === 'shipment_order';

            const originAddr = isShipment
              ? (parsedTrip?.warehouse_address || parsedTrip?.warehouse_name || parsedTrip?.pick_up)
              : (parsedTrip?.pick_up || parsedTrip?.route_pick_up);

            const destAddr = isShipment
              ? (parsedTrip?.factory_address || parsedTrip?.factory_name || parsedTrip?.drop_in)
              : (parsedTrip?.drop_in || parsedTrip?.route_drop_in);

            if (originAddr && destAddr) {
              setStatus('Geocoding origin & destination addresses...');
              const originGeo = await geocodeAddress(originAddr);
              const destGeo = await geocodeAddress(destAddr);

              if (originGeo && destGeo) {
                rawCords = [originGeo, destGeo];
              }
            }
          }
        }

        if (!rawCords || !Array.isArray(rawCords) || rawCords.length < 2) {
          setStatus('Error: Could not resolve destination coordinates ❌');
          return;
        }

        setStatus('Setting trip destination & route...');

        const cords = rawCords.map((elem, index) => {
          if (index === 0) {
            return {
              title: 'Pickup Location',
              position: { lat: Number(elem.latitude), lng: Number(elem.longitude) }
            };
          } else if (index === rawCords.length - 1) {
            return {
              title: 'Drop Destination',
              position: { lat: Number(elem.latitude), lng: Number(elem.longitude) }
            };
          } else {
            return {
              title: `Waypoint ${index}`,
              position: { lat: Number(elem.latitude), lng: Number(elem.longitude) }
            };
          }
        });

        const displayOptions = {
          showDestinationMarkers: true,
          showTrafficLights: true,
          showStopSigns: true,
        };

        await navigationController.setDestinations(cords, {
          routingOptions: { travelMode: TravelMode.DRIVING },
          displayOptions: displayOptions
        });

        setDestinationsSet(true);

        if (isTurnByTurnActive) {
          setStatus('Navigation Active 🟢');
          try {
            await navigationController.startGuidance();
            startNavigationGlobal(navigationController, { cordsData, tripData });
          } catch (e) {
            console.log('Auto guidance start on setup:', e);
          }
        } else {
          setStatus('Route Ready • Tap Start Guidance ✅');
        }
      } catch (error) {
        console.error('Failed to set destinations:', error);
        setStatus('Set destination failed: ' + (error?.message || error));
      }
    };

    setupDestinations();
  }, [isReady, navigationController, cordsData, tripData]);

  // ── Step 3: Start Turn-by-Turn Guidance ────────────────────────
  const startTripWithStops = async () => {
    if (!isReady || !navigationController) {
      Alert.alert("Initializing", "Navigation controller is still initializing. Please wait...");
      return;
    }

    if (!destinationsSet) {
      Alert.alert("Destination Notice", "Destinations are currently being calculated & set. Please wait a moment.");
      return;
    }

    try {
      await navigationController.startGuidance();
      startNavigationGlobal(navigationController, { cordsData, tripData });
      setStartNavigation(true);
      setStatus('Navigation Active 🟢');
    } catch (error) {
      setStatus('Navigation failed: ' + (error?.message || error));
      Alert.alert("Navigation Error", error?.message || "Failed to start guidance.");
      console.error(error);
    }
  };

  const stopNavigation = async () => {
    try {
      await stopNavigationGlobal();
      setStartNavigation(false);
      setStatus('Navigation Standby');
    } catch (error) {
      console.error('Stop failed:', error);
    }
  };

  const handleMinimizeToPip = async () => {
    // Ensure active guidance state is synced
    if (!isNavigating && !startNavigation) {
      if (destinationsSet && navigationController) {
        try {
          await navigationController.startGuidance();
          startNavigationGlobal(navigationController, { cordsData, tripData });
          setStartNavigation(true);
        } catch (e) {
          console.log('Error starting guidance for PiP:', e);
        }
      }
    } else {
      setStartNavigation(true);
      if (navigationController) {
        startNavigationGlobal(navigationController, { cordsData, tripData });
      }
    }

    enterPipMode();

    if (Platform.OS === 'android') {
      try {
        const { enterPip, isPipSupported } = require('expo-pip');
        const supported = await isPipSupported?.();
        if (supported !== false && typeof enterPip === 'function') {
          await enterPip();
        } else if (NativeModules.PipModule && NativeModules.PipModule.enterPip) {
          await NativeModules.PipModule.enterPip();
        }
      } catch (e) {
        console.log('System PiP error:', e);
      }
    }
  };

  const handleRecenterLocation = async () => {
    try {
      if (viewControllerRef.current) {
        await viewControllerRef.current.setFollowingPerspective(CameraPerspective.TILTED);
      } else if (navigationController) {
        await navigationController.showRouteOverview();
      }
    } catch (err) {
      console.log('Recenter error:', err);
    }
  };

  useEffect(() => {
    if (isInitialized) {
      setTimeout(() => {
        setIsReady(true);
      }, 1500);
    }
  }, [isInitialized]);

  const expoNavigation = useExpoNavigation();

  useEffect(() => {
    let isBack = false;
    const unsubscribe = expoNavigation.addListener('beforeRemove', (e) => {
      if (isBack) return;
      if (isTurnByTurnActive) {
        e.preventDefault();
        isBack = true;
        handleMinimizeToPip();
        route.back();
      } else {
        stopNavigation();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [expoNavigation, isTurnByTurnActive]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Top Floating Action Overlay Bar */}
      <View style={styles.topHeaderOverlay} pointerEvents="box-none">
        <TouchableOpacity style={styles.exitBtn} onPress={() => route.back()} activeOpacity={0.85}>
          <Ionicons name="arrow-back" size={18} color="#ffffff" />
          <Text style={styles.exitBtnText}>Back</Text>
        </TouchableOpacity>

        {/* Controls Bar: Recenter, PiP, Theme & Traffic */}
        <View style={styles.topRightControls}>
          {/* Dedicated Recenter Button */}
          <TouchableOpacity
            style={[styles.toolIconBtn, styles.recenterBtn]}
            onPress={handleRecenterLocation}
            activeOpacity={0.8}
          >
            <MaterialIcons name="my-location" size={16} color="#ffffff" />
            <Text style={styles.toolIconText}>Recenter</Text>
          </TouchableOpacity>

          {/* PiP Minimize Button */}
          {isTurnByTurnActive && (
            <TouchableOpacity
              style={[styles.toolIconBtn, styles.pipBtnActive]}
              onPress={handleMinimizeToPip}
              activeOpacity={0.8}
            >
              <MaterialIcons name="picture-in-picture-alt" size={16} color="#ffffff" />
              <Text style={styles.toolIconText}>PiP</Text>
            </TouchableOpacity>
          )}

          {/* Traffic Toggle Button */}
          <TouchableOpacity
            style={[styles.toolIconBtn, showsTraffic && styles.toolIconActive]}
            onPress={() => setShowsTraffic(!showsTraffic)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="traffic-light"
              size={16}
              color={showsTraffic ? '#ffffff' : '#94a3b8'}
            />
            <Text style={[styles.toolIconText, showsTraffic && { color: '#ffffff' }]}>
              Traffic
            </Text>
          </TouchableOpacity>

          {/* Dark / Light Theme Toggle Button */}
          <TouchableOpacity
            style={[styles.toolIconBtn, isNightMode && styles.toolIconActiveDark]}
            onPress={() => setIsNightMode(!isNightMode)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isNightMode ? 'moon' : 'sunny'}
              size={15}
              color="#ffffff"
            />
            <Text style={styles.toolIconText}>
              {isNightMode ? 'Dark' : 'Day'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation View Component */}
      <NavigationView
        style={styles.map}
        onMapReady={onMapReady}
        onNavigationViewControllerCreated={(controller) => {
          viewControllerRef.current = controller;
        }}
        navigationNightMode={isNightMode ? NavigationNightMode.FORCE_NIGHT : NavigationNightMode.FORCE_DAY}
        trafficEnabled={showsTraffic}
        trafficPromptsEnabled={true}
        trafficIncidentCardsEnabled={true}
        speedometerEnabled={true}
        speedLimitIconEnabled={true}
        tripProgressBarEnabled={true}
        myLocationEnabled={true}
        myLocationButtonEnabled={true}
        recenterButtonEnabled={true}
        androidStylingOptions={{
          primaryDayModeThemeColor: '#4f46e5',
          primaryNightModeThemeColor: '#1e1b4b',
          headerDistanceValueTextColor: '#ffffff',
          headerInstructionTextColor: '#ffffff',
          headerNextStepIconColor: '#ffffff',
        }}
      />

      {/* Bottom Floating Control Panel */}
      <View style={styles.bottomSheetContainer} pointerEvents="box-none">
        <View style={styles.controlsCard}>
          {/* Status Indicator Bar */}
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, isTurnByTurnActive ? styles.statusDotActive : styles.statusDotStandby]} />
            <Text style={styles.statusText} numberOfLines={1}>
              {status}
            </Text>
          </View>

          {/* Action Buttons */}
          {isTurnByTurnActive ? (
            <View style={styles.actionBtnRow}>
              {/* PiP Floating Overlay Button */}
              <TouchableOpacity
                style={styles.pipActionBtn}
                onPress={handleMinimizeToPip}
                activeOpacity={0.85}
              >
                <MaterialIcons name="picture-in-picture-alt" size={18} color="#ffffff" />
                <Text style={styles.actionBtnLabel}>PiP Mode</Text>
              </TouchableOpacity>

              {/* Stop Turn-By-Turn Navigation Button */}
              <TouchableOpacity
                style={styles.stopBtn}
                onPress={stopNavigation}
                activeOpacity={0.85}
              >
                <Entypo name="cross" size={18} color="#ffffff" />
                <Text style={styles.btnText}>Stop Navigation</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.startBtn, !destinationsSet && styles.btnDisabled]}
              onPress={destinationsSet ? startTripWithStops : null}
              disabled={!destinationsSet}
              activeOpacity={0.85}
            >
              <FontAwesome6 name="location-arrow" size={18} color="#ffffff" />
              <Text style={styles.btnText}>
                {destinationsSet ? "Start Turn-By-Turn Guidance" : "Calculating Route..."}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const topPadding = Platform.OS === 'ios' ? 48 : (RNStatusBar.currentHeight ? RNStatusBar.currentHeight + 8 : 16);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  map: {
    flex: 1,
  },
  topHeaderOverlay: {
    position: 'absolute',
    top: topPadding,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 30,
  },
  exitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  exitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toolIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  recenterBtn: {
    backgroundColor: '#3b82f6',
    borderColor: '#60a5fa',
  },
  pipBtnActive: {
    backgroundColor: '#6366f1',
    borderColor: '#818cf8',
  },
  toolIconActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  toolIconActiveDark: {
    backgroundColor: '#4f46e5',
    borderColor: '#6366f1',
  },
  toolIconText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },

  bottomSheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    zIndex: 30,
  },
  controlsCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
    gap: 8,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  statusDotActive: {
    backgroundColor: '#10b981',
  },
  statusDotStandby: {
    backgroundColor: '#f59e0b',
  },
  statusText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pipActionBtn: {
    flex: 0.38,
    backgroundColor: '#3b82f6',
    paddingVertical: 13,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    elevation: 5,
  },
  actionBtnLabel: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  startBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 15,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    elevation: 5,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  stopBtn: {
    flex: 0.62,
    backgroundColor: '#ef4444',
    paddingVertical: 13,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    elevation: 5,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  btnDisabled: {
    backgroundColor: '#475569',
    opacity: 0.7,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export default ViewDirection;