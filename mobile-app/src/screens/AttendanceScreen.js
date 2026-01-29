import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, FlatList } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RefreshCw, Check } from 'lucide-react-native';
import { apiMethods } from '../utils/api';

const AttendanceScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(CameraType?.back || Camera.Constants.Type.back);
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recognitionResults, setRecognitionResults] = useState([]);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      setLoading(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: true,
        });
        setCapturedImage(photo.uri);
        await processImage(photo.base64);
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
        setLoading(false);
      }
    }
  };

  const processImage = async (base64) => {
    try {
      // Format base64 as data URI if needed, or just send raw base64 depending on backend
      // Frontend usually sends "data:image/jpeg;base64,..." or just base64 string
      // Let's assume sending the base64 string directly in an object { image: "..." }

      const imagePayload = `data:image/jpeg;base64,${base64}`;
      const response = await apiMethods.recognizeFaces(imagePayload);

      if (response.success || response.data) {
        const results = response.data?.results || response.results || [];
        setRecognitionResults(results);
        if (results.length === 0) {
           Alert.alert('Info', 'No faces recognized');
        }
      } else {
         Alert.alert('Error', 'Recognition failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process image');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setRecognitionResults([]);
  };

  const confirmAttendance = async () => {
    // Here we would call markAttendance for the recognized students
    // For now, just show alert
    Alert.alert('Success', `Attendance marked for ${recognitionResults.length} students`);
    navigation.goBack();
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting permission...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      {capturedImage ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />

          <View style={styles.resultsContainer}>
             <Text style={styles.resultsTitle}>Recognized Students: {recognitionResults.length}</Text>
             {loading ? (
                 <ActivityIndicator size="large" color="#2563EB" />
             ) : (
                 <FlatList
                    data={recognitionResults}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.resultItem}>
                            <View style={styles.resultBadge}>
                                <Check size={16} color="#fff" />
                            </View>
                            <Text style={styles.resultText}>{item.studentName || item.name || `Student #${item.studentId}`}</Text>
                            <Text style={styles.confidenceText}>{Math.round((item.confidence || 0) * 100)}%</Text>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.emptyText}>No students recognized.</Text>}
                 />
             )}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.button, styles.retakeButton]} onPress={retake}>
              <RefreshCw size={24} color="#374151" />
              <Text style={styles.retakeText}>Retake</Text>
            </TouchableOpacity>

            {recognitionResults.length > 0 && (
                <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={confirmAttendance}>
                <Check size={24} color="#fff" />
                <Text style={styles.confirmText}>Confirm</Text>
                </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <Camera style={styles.camera} type={type} ref={cameraRef}>
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#000" /> : <View style={styles.captureInner} />}
            </TouchableOpacity>
          </View>
        </Camera>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  cameraControls: {
    marginBottom: 40,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  previewImage: {
    height: 300,
    width: '100%',
    resizeMode: 'cover',
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1F2937',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  resultBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  confidenceText: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  retakeButton: {
    backgroundColor: '#F3F4F6',
  },
  confirmButton: {
    backgroundColor: '#2563EB',
  },
  retakeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default AttendanceScreen;
