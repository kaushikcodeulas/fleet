import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Animated
} from 'react-native';
import { Ionicons, Entypo, FontAwesome6 } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useCommonContext } from '../../context/CommonContext';

const PIP_WIDTH = 250;
const PIP_HEIGHT = 220;

export default function PipMiniMapOverlay() {
  const router = useRouter();
  const pathname = usePathname();

  const {
    isNavigating,
    isPipMode,
    navParams,
    stopNavigationGlobal,
    exitPipMode
  } = useCommonContext();

  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      }
    })
  ).current;

  // Do not render floating PiP overlay on ViewDirection screen itself or when PiP mode/navigation is inactive
  if (!isPipMode || !isNavigating || pathname?.includes('ViewDirection')) {
    return null;
  }

  const handleMaximize = () => {
    exitPipMode();
    router.push({
      pathname: '/screens/ViewDirection',
      params: navParams || {}
    });
  };

  const handleClosePipOnly = () => {
    exitPipMode();
  };

  const handleStopNavigation = async () => {
    await stopNavigationGlobal();
  };

  // Parse coords for mini polyline map if available
  let coords = [];
  if (navParams?.cordsData) {
    try {
      coords = typeof navParams.cordsData === 'string'
        ? JSON.parse(navParams.cordsData)
        : navParams.cordsData;
    } catch (e) {
      coords = [];
    }
  }

  return (
    <Animated.View
      style={[
        styles.pipContainer,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }]
        }
      ]}
      {...panResponder.panHandlers}
    >
      {/* Top Header Bar */}
      <View style={styles.pipHeader}>
        <View style={styles.pipHeaderLeft}>
          <View style={styles.livePulseDot} />
          <Text style={styles.pipTitle}>Navigating Active</Text>
        </View>

        <View style={styles.pipHeaderRight}>
          {/* Maximize Button */}
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={handleMaximize}
            activeOpacity={0.7}
          >
            <Ionicons name="expand-outline" size={15} color="#ffffff" />
          </TouchableOpacity>

          {/* Close PiP Window Only */}
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={handleClosePipOnly}
            activeOpacity={0.7}
          >
            <Ionicons name="remove" size={15} color="#ffffff" />
          </TouchableOpacity>

          {/* Stop Navigation Button */}
          <TouchableOpacity
            style={[styles.headerIconBtn, { backgroundColor: '#ef4444' }]}
            onPress={handleStopNavigation}
            activeOpacity={0.7}
          >
            <Entypo name="cross" size={15} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Mini Route Map / Display Layer */}
      <View style={styles.mapWrapper}>
        {coords && coords.length >= 2 ? (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            initialRegion={{
              latitude: Number(coords[0].latitude),
              longitude: Number(coords[0].longitude),
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation={true}
            showsCompass={false}
            zoomEnabled={false}
            scrollEnabled={false}
          >
            <Polyline
              coordinates={coords.map(c => ({ latitude: Number(c.latitude), longitude: Number(c.longitude) }))}
              strokeColor="#38bdf8"
              strokeWidth={4}
            />
            <Marker coordinate={{ latitude: Number(coords[0].latitude), longitude: Number(coords[0].longitude) }}>
              <View style={styles.miniMarkerPin}>
                <FontAwesome6 name="truck-fast" size={10} color="#ffffff" />
              </View>
            </Marker>
            <Marker coordinate={{ latitude: Number(coords[coords.length - 1].latitude), longitude: Number(coords[coords.length - 1].longitude) }}>
              <View style={[styles.miniMarkerPin, { backgroundColor: '#ef4444' }]}>
                <FontAwesome6 name="warehouse" size={10} color="#ffffff" />
              </View>
            </Marker>
          </MapView>
        ) : (
          <View style={styles.placeholderBox}>
            <FontAwesome6 name="location-arrow" size={24} color="#38bdf8" />
            <Text style={styles.placeholderText}>Turn-by-Turn Guidance</Text>
          </View>
        )}
      </View>

      {/* Footer Info Strip */}
      <TouchableOpacity
        style={styles.pipFooter}
        onPress={handleMaximize}
        activeOpacity={0.85}
      >
        <Text style={styles.pipFooterText} numberOfLines={1}>
          Tap to expand full navigation
        </Text>
        <Ionicons name="chevron-forward" size={14} color="#10b981" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pipContainer: {
    position: 'absolute',
    bottom: 90,
    right: 16,
    width: PIP_WIDTH,
    height: PIP_HEIGHT,
    backgroundColor: '#0f172a',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    zIndex: 999999,
  },
  pipHeader: {
    height: 36,
    backgroundColor: '#1e1b4b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  pipHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  pipTitle: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  pipHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  headerIconBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapWrapper: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  placeholderBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  placeholderText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  miniMarkerPin: {
    backgroundColor: '#10b981',
    padding: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  pipFooter: {
    height: 32,
    backgroundColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  pipFooterText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '600',
  },
});
