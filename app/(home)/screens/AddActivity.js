
import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { homeValue } from "../../../redux/homeSlice";
import axios from "axios";
import { useRouter } from "expo-router";
import * as ImageManipulator from 'expo-image-manipulator';

const AddActivity = () => {
    const tripDetails = useSelector(homeValue)?.tripDetails?.data;
    const userData = useSelector(homeValue)?.userData;
    const [type, setType] = useState("Fuel");
    const [amount, setAmount] = useState(0);
    const [description, setDescription] = useState("");
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    const router = useRouter()

    const types = ["Fuel", "Trip Expense", "Other"];

    // 📎 Pick Document
    const pickDocument = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            multiple: true,
        });

        if (result.assets) {
            setFiles([...files, ...result.assets]);
        }
    };

    // 📸 Pick Image
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
        });

        if (!result.canceled) {
            const allPromises = result.assets.map(async (element) => {
                const imageUri = element.uri;
                const manipulatedImage = await ImageManipulator.manipulateAsync(
                    imageUri,
                    [], // No resizing or cropping
                    {
                        compress: 1,
                        format: ImageManipulator.SaveFormat.JPEG,
                    }
                );
                const fileName = imageUri.split(".")[0] + "." + manipulatedImage.uri.split(".")[manipulatedImage.uri.split(".").length - 1]
                const type = "image/" + manipulatedImage.uri.split(".")[manipulatedImage.uri.split(".").length - 1]
                return { ...manipulatedImage, fileName: fileName, type: type };
            });

            const results = await Promise.allSettled(allPromises);

            const allImages = results.map(result => {
                if (result.status === 'fulfilled') {
                    return result.value
                } else {
                    console.error(result.reason);
                }
            });
            setFiles([...files, ...allImages]);
        }
    };

    async function addActivity() {
        const formData = new FormData();
        files.forEach((file, index) => {
            // Create an object in the format the server expects
            formData.append('files[]', {
                uri: file.uri,
                name: file.fileName || 'upload.jpg',
                type: file.type || 'image/jpeg',
            });
        });

        formData.append('trip_id', tripDetails?.trip_id);
        formData.append('description', description);
        formData.append('amount', amount);
        formData.append('type', type);
        console.log(formData)
        try {
            const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/trip/addActivity`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${userData?.token}`
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`Upload progress: ${percentCompleted}%`);
                },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    const handleSubmit = () => {
        const payload = {
            type,
            amount,
            description,
            files,
        };
        if (!amount) {
            alert("Please add your activity amount!");
        }
        else if (amount && files.length == 0) {
            alert("Please add your expense document!");
        } else {
            if (loading) {
                return;
            }
            setLoading(true);
            addActivity().then((res) => {
                if (res.status) {
                    setType('Fuel');
                    setDescription('');
                    setAmount(0);
                    setFiles([]);
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
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Create Activity</Text>
            {/* 🔽 Type Selector */}
            <Text style={styles.label}>Activity Type</Text>
            <View style={styles.typeContainer}>
                {types.map((item) => (
                    <TouchableOpacity
                        key={item}
                        style={[
                            styles.typeButton,
                            type === item && styles.typeActive,
                        ]}
                        onPress={() => setType(item)}
                    >
                        <Text
                            style={[
                                styles.typeText,
                                type === item && { color: "#fff" },
                            ]}
                        >
                            {item}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* 📝 Description */}
            <Text style={styles.label}>Expense</Text>
            <TextInput
                style={styles.amountInput}
                placeholder="Enter activity expense"
                multiline
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
            />

            {/* 📝 Description */}
            <Text style={styles.label}>Description</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter activity details..."
                multiline
                value={description}
                onChangeText={setDescription}
            />

            {/* 📎 Upload */}
            <Text style={styles.label}>Upload Documents</Text>

            <View style={styles.uploadRow}>
                <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
                    <Ionicons name="image" size={20} color="#fff" />
                    <Text style={styles.uploadText}>Images</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.uploadBtn} onPress={pickDocument}>
                    <Ionicons name="document" size={20} color="#fff" />
                    <Text style={styles.uploadText}>Files</Text>
                </TouchableOpacity>
            </View>

            {/* 📂 Preview Files */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {files.map((file, index) => (
                    <View key={index} style={styles.filePreview}>
                        {file.type?.includes("image") ? (
                            <Image source={{ uri: file.uri }} style={styles.image} />
                        ) : (
                            <Ionicons name="document-text" size={40} color="#555" />
                        )}
                    </View>
                ))}
            </ScrollView>

            {/* 🚀 Submit */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                {loading ? <ActivityIndicator size={"small"} color={"#fff"} /> : <Text style={styles.submitText}>Submit Activity</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f7fb",
        padding: 15,
    },

    header: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 15,
    },

    label: {
        marginTop: 10,
        marginBottom: 5,
        fontWeight: "600",
    },

    typeContainer: {
        flexDirection: "row",
        marginBottom: 10,
    },

    typeButton: {
        padding: 10,
        backgroundColor: "#ecf0f1",
        borderRadius: 8,
        marginRight: 10,
    },

    typeActive: {
        backgroundColor: "#3498db",
    },

    typeText: {
        fontSize: 13,
    },

    input: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 12,
        minHeight: 80,
        textAlignVertical: "top",
    },

    amountInput: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 12,
        minHeight: 40,
        textAlignVertical: "top",
    },

    uploadRow: {
        flexDirection: "row",
        marginTop: 10,
    },

    uploadBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2ecc71",
        padding: 10,
        borderRadius: 8,
        marginRight: 10,
    },

    uploadText: {
        color: "#fff",
        marginLeft: 5,
    },

    filePreview: {
        marginTop: 10,
        marginRight: 10,
        width: 70,
        height: 70,
        backgroundColor: "#fff",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },

    image: {
        width: "100%",
        height: "100%",
        borderRadius: 10,
    },

    submitBtn: {
        marginTop: 20,
        backgroundColor: "#3498db",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
    },

    submitText: {
        color: "#fff",
        fontWeight: "bold",
    },
});
export default AddActivity