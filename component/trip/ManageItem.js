import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const ManageItem = ({ icon, title, subtitle, target, last = false }) => {
    const router = useRouter();
    // console.log(target)
    return (
        <TouchableOpacity onPress={() => { router.push({ pathname: target }) }} style={[styles.manageItem, { marginBottom: last ? 60 : 10 }]}>
            <FontAwesome5 name={icon} size={20} color="#34495e" />
            <View style={{ marginLeft: 14 }}>
                <Text style={styles.manageTitle}>{title}</Text>
                <Text style={styles.manageSubtitle}>{subtitle}</Text>
            </View>
            <Ionicons
                name="chevron-forward"
                size={20}
                color="#bdc3c7"
                style={{ marginLeft: 'auto' }}
            />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f6f8',
        padding: 16
    },
    header: {
        fontSize: 26,
        fontWeight: '700',
        color: '#2c3e50',
    },
    subHeader: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 16,
    },

    overviewCard: {
        backgroundColor: '#2c3e50',
        borderRadius: 18,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 20,
    },
    vehicleText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    vehicleSubText: {
        color: '#bdc3c7',
        fontSize: 13,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 10,
    },

    actionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    actionCard: {
        backgroundColor: '#fff',
        width: '48%',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        marginBottom: 12,
        elevation: 2,
    },
    actionValue: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 8,
        color: '#2c3e50',
    },
    actionLabel: {
        fontSize: 12,
        color: '#7f8c8d',
        marginTop: 4,
    },

    manageItem: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 14,
        marginBottom: 12,
        elevation: 2,
    },
    manageTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2c3e50',
    },
    manageSubtitle: {
        fontSize: 12,
        color: '#7f8c8d',
        marginTop: 2,
    },

    emergencyButton: {
        backgroundColor: '#e74c3c',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginTop: 20,
        gap: 10,
        marginBottom: 50
    },
    emergencyText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default ManageItem

