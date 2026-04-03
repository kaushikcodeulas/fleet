import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";
import { homeValue } from "../../../redux/homeSlice";
import axios from "axios";
import { useRouter } from "expo-router";

const AddReport = () => {
    const tripDetails = useSelector(homeValue)?.tripDetails?.data;
    const userData = useSelector(homeValue)?.userData;
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("High");
    const [loading, setLoading] = useState();
    const router = useRouter();

    async function addReport() {
        const formData = new FormData();

        formData.append('trip_id', tripDetails?.trip_id);
        formData.append('description', description);
        formData.append('subject', subject);
        formData.append('priority', priority);
        // console.log(formData)
        try {
            const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/trip/addReport`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${userData?.token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    const handleSubmit = () => {
        if (!subject) {
            alert("Please add your subject.");
        }
        else if (!description) {
            alert("Please add your description.");
            
        } 
        else if (!priority) {
            alert("Please add your priority.");
        }
        else {
            if (loading) {
                return;
            }
            setLoading(true);
            addReport().then((res) => {
                if (res.status) {
                    setSubject();
                    setPriority();
                    setDescription('');
                    alert("Activity Submitted!");
                    router.back();
                } else {
                    alert("Something went wrong please try again later!");
                }
                setLoading(false);
            }).catch((err) => {
                alert(`Error submitting activity: ${err.message}`);
                setLoading(false);
            })
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Create Report</Text>

            <Text style={styles.label}>Subject</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter subject"
                value={subject}
                onChangeText={setSubject}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
                style={[styles.input, { height: 100 }]}
                placeholder="Enter description"
                multiline
                value={description}
                onChangeText={setDescription}
            />

            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
                {["High", "Medium", "Low"].map((item) => (
                    <TouchableOpacity
                        key={item}
                        style={[
                            styles.priorityBtn,
                            priority === item && styles.activePriority,
                        ]}
                        onPress={() => setPriority(item)}
                    >
                        <Text style={[styles.priorityText, { color: priority == item ? "#fff" : "#000" }]}>{item}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                {loading ? <ActivityIndicator size={"small"} /> : <Text style={styles.submitText} >Submit Report</Text>}
            </TouchableOpacity>
        </View>
    )
}
const styles = StyleSheet.create({
    container: { flex: 1, padding: 15, backgroundColor: "#fff" },

    header: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },

    label: { marginBottom: 5, fontWeight: "600" },

    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
    },

    priorityContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },

    priorityBtn: {
        flex: 1,
        padding: 10,
        marginHorizontal: 5,
        borderRadius: 8,
        backgroundColor: "#eee",
        alignItems: "center",
    },

    activePriority: {
        backgroundColor: "#007bff",
    },

    priorityText: {
        color: "#000",
    },

    submitBtn: {
        backgroundColor: "#28a745",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
    },

    submitText: {
        color: "#fff",
        fontWeight: "bold",
    },
});
export default AddReport