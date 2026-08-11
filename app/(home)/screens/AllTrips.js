import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  Dimensions,
  RefreshControl,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { homeValue } from '../../../redux/homeSlice';
import { useIsFocused } from '@react-navigation/native';
import { getAllTrips } from '../../../redux/homeThunks';
import TripCard from '../../../component/trip/TripCard';
import LoadingComp from '../../../component/common/LoadingComp';
import LottieFileView from '../../../component/common/LottieFileView';
import { Ionicons, Feather } from '@expo/vector-icons';

const screenHeight = Dimensions.get("screen").height;

const AllTrips = () => {
  const userData = useSelector(homeValue)?.userData;
  const allTrips = useSelector(homeValue)?.allTrips?.data || [];
  const allTripsLoading = useSelector(homeValue)?.allTrips?.loading;
  const focus = useIsFocused();
  const dispatch = useDispatch();

  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | '1' (Running) | '3' (Completed) | '2' (Pending)
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTrips = useCallback(() => {
    if (userData?.token) {
      dispatch(getAllTrips(userData?.token));
    }
  }, [userData?.token, dispatch]);

  useEffect(() => {
    if (focus) {
      fetchTrips();
    }
  }, [focus, fetchTrips]);

  const onRefresh = useCallback(async () => {
    fetchTrips();
  }, [fetchTrips]);

  // Filter & Search Logic
  const filteredTrips = useMemo(() => {
    if (!allTrips) return [];
    return allTrips.filter((trip) => {
      // Filter by Status
      const statusStr = String(trip?.trip_status ?? trip?.status);
      let matchesFilter = true;
      if (activeFilter === '1') {
        matchesFilter = statusStr === '1';
      } else if (activeFilter === '3') {
        matchesFilter = statusStr === '3';
      } else if (activeFilter === '2') {
        matchesFilter = statusStr === '2' || statusStr === '0';
      }

      // Search by Query
      if (!matchesFilter) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const pickup = (trip?.pick_up || trip?.warehouse_name || '').toLowerCase();
      const drop = (trip?.drop_in || trip?.factory_name || '').toLowerCase();
      const code = (trip?.trip_code || trip?.trip_id || trip?.id || '').toString().toLowerCase();
      const plate = (trip?.license_plate || trip?.make || '').toLowerCase();

      return pickup.includes(q) || drop.includes(q) || code.includes(q) || plate.includes(q);
    });
  }, [allTrips, activeFilter, searchQuery]);

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.titleText}>Trip History</Text>
          <Text style={styles.subtitleText}>
            Showing {filteredTrips.length} of {allTrips.length} assigned routes
          </Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{allTrips.length}</Text>
        </View>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#64748b" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by route, vehicle plate, trip ID..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
            <Feather name="x" size={16} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabsRow}>
        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'ALL' && styles.filterChipActive]}
          onPress={() => setActiveFilter('ALL')}
        >
          <Text style={[styles.filterChipText, activeFilter === 'ALL' && styles.filterChipTextActive]}>
            All ({allTrips.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeFilter === '1' && styles.filterChipActive]}
          onPress={() => setActiveFilter('1')}
        >
          <Text style={[styles.filterChipText, activeFilter === '1' && styles.filterChipTextActive]}>
            Running
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeFilter === '3' && styles.filterChipActive]}
          onPress={() => setActiveFilter('3')}
        >
          <Text style={[styles.filterChipText, activeFilter === '3' && styles.filterChipTextActive]}>
            Completed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeFilter === '2' && styles.filterChipActive]}
          onPress={() => setActiveFilter('2')}
        >
          <Text style={[styles.filterChipText, activeFilter === '2' && styles.filterChipTextActive]}>
            Pending
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main List Body */}
      {allTripsLoading && allTrips.length === 0 ? (
        <View style={{ height: screenHeight / 1.5, justifyContent: "center", alignItems: "center" }}>
          <LoadingComp />
        </View>
      ) : filteredTrips.length === 0 ? (
        <View style={styles.emptyContainer}>
          <LottieFileView
            file={require('../../../assets/lottiefiles/nodata.json')}
            title="No Matching Trips Found"
            message={
              searchQuery
                ? `No trips found matching "${searchQuery}". Try a different keyword.`
                : "No trips found in this category history."
            }
            width={240}
            height={180}
          />
          {(searchQuery || activeFilter !== 'ALL') && (
            <TouchableOpacity
              style={styles.resetFilterBtn}
              onPress={() => {
                setSearchQuery('');
                setActiveFilter('ALL');
              }}
            >
              <Text style={styles.resetFilterBtnText}>Reset Search & Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredTrips}
          keyExtractor={(item, index) => (item.trip_id || item.id || index).toString()}
          renderItem={({ item }) => <TripCard item={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          refreshControl={
            <RefreshControl
              refreshing={allTripsLoading}
              onRefresh={onRefresh}
              colors={['#9f2779', '#4f46e5']}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingTop: 10
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  titleText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a"
  },
  subtitleText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2
  },
  countBadge: {
    backgroundColor: "#9f2779",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  countBadgeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800"
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 1
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#0f172a"
  },
  clearBtn: {
    padding: 4
  },
  filterTabsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  filterChipActive: {
    backgroundColor: "#9f2779",
    borderColor: "#9f2779"
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569"
  },
  filterChipTextActive: {
    color: "#fff",
    fontWeight: "700"
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40
  },
  resetFilterBtn: {
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 10
  },
  resetFilterBtnText: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700"
  }
});

export default AllTrips;