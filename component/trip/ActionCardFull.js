import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { FontAwesome5, Ionicons } from '@expo/vector-icons'

const ActionCardFull = ({ icon, label, value, address, color }) => {
    return (
        <TouchableOpacity style={[styles.actionCard, { width: "100%", alignItems: "flex-start", flexDirection: "row", justifyContent: "flex-start", gap: 12 }]}>
            <FontAwesome5 name={icon} size={24} color={color} style={{ marginTop: 4 }} />
            <View style={{ flex: 1 }}>
                <Text style={styles.actionValue}>{value}</Text>
                {address ? (
                    <View style={styles.addressRow}>
                        <Ionicons name="location-sharp" size={12} color="#64748b" />
                        <Text style={styles.actionAddressText}>{address}</Text>
                    </View>
                ) : null}
                <Text style={styles.actionLabel}>{label}</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
  actionCard: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  actionValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    marginBottom: 2
  },
  actionAddressText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    flex: 1,
    lineHeight: 16
  },
  actionLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
});

export default ActionCardFull;