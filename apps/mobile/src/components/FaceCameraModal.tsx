import React, { useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const OVAL_WIDTH = SCREEN_WIDTH * 0.72;
const OVAL_HEIGHT = OVAL_WIDTH * 1.35;

interface FaceCameraModalProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (uri: string) => void;
}

export const FaceCameraModal: React.FC<FaceCameraModalProps> = ({
  visible,
  onClose,
  onCapture,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("front");
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<any>(null);

  const takePhoto = async () => {
    if (!cameraRef.current || isCapturing) return;
    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });
      if (photo && photo.uri) {
        setCapturedUri(photo.uri);
      }
    } catch (e) {
      console.error("Failed to capture photo:", e);
    } finally {
      setIsCapturing(false);
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setCapturedUri(result.assets[0].uri);
      }
    } catch (e) {
      console.error("Gallery picker error:", e);
    }
  };

  const handleConfirm = () => {
    if (capturedUri) {
      onCapture(capturedUri);
      setCapturedUri(null);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedUri(null);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Permission Check */}
        {!permission?.granted ? (
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionTitle}>Camera Access Required</Text>
            <Text style={styles.permissionSubtitle}>
              Ugnay uses facial verification to secure your cooperative member
              identity and prevent unauthorized account access.
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestPermission}
            >
              <Text style={styles.permissionButtonText}>Allow Camera Access</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.permissionButton, styles.galleryButton]}
              onPress={pickFromGallery}
            >
              <Text style={styles.galleryButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : capturedUri ? (
          /* Captured Photo Preview Screen */
          <View style={styles.previewContainer}>
            <Image source={{ uri: capturedUri }} style={styles.previewImage} />
            <View style={styles.previewOverlay}>
              <Text style={styles.previewHeading}>Face Photo Preview</Text>
              <Text style={styles.previewSubheading}>
                Make sure your face is clearly visible with good lighting.
              </Text>
              <View style={styles.previewActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.retakeBtn]}
                  onPress={handleRetake}
                >
                  <Text style={styles.retakeBtnText}>Retake Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.confirmBtn]}
                  onPress={handleConfirm}
                >
                  <Text style={styles.confirmBtnText}>Use This Photo</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          /* Live Camera View */
          <View style={styles.cameraWrapper}>
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing={facing}
            />

            {/* Oval Cutout Mask Overlay */}
            <View style={styles.maskContainer}>
              <View style={styles.maskTop}>
                <Text style={styles.instructionTitle}>Position Your Face</Text>
                <Text style={styles.instructionSubtitle}>
                  Fit your face inside the oval guide below
                </Text>
              </View>

              <View style={styles.maskCenterRow}>
                <View style={styles.maskSide} />
                <View style={styles.ovalGuide}>
                  <View style={styles.crosshairH} />
                  <View style={styles.crosshairV} />
                </View>
                <View style={styles.maskSide} />
              </View>

              <View style={styles.maskBottom}>
                {/* Camera Controls */}
                <View style={styles.controlsRow}>
                  {/* Pick from gallery */}
                  <TouchableOpacity
                    style={styles.smallControlBtn}
                    onPress={pickFromGallery}
                  >
                    <Text style={styles.controlIconText}>🖼️</Text>
                    <Text style={styles.smallControlLabel}>Gallery</Text>
                  </TouchableOpacity>

                  {/* Shutter Button */}
                  <TouchableOpacity
                    style={styles.shutterOuter}
                    onPress={takePhoto}
                    disabled={isCapturing}
                  >
                    <View style={styles.shutterInner}>
                      {isCapturing ? (
                        <ActivityIndicator color="#2563eb" />
                      ) : (
                        <View style={styles.shutterDot} />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Flip Camera */}
                  <TouchableOpacity
                    style={styles.smallControlBtn}
                    onPress={() =>
                      setFacing((prev) => (prev === "front" ? "back" : "front"))
                    }
                  >
                    <Text style={styles.controlIconText}>🔄</Text>
                    <Text style={styles.smallControlLabel}>Flip</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Top Close Button */}
            <TouchableOpacity style={styles.floatingCloseBtn} onPress={onClose}>
              <Text style={styles.floatingCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    padding: 28,
  },
  permissionTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  permissionSubtitle: {
    color: "#94a3b8",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  permissionButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  permissionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  galleryButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#3b82f6",
  },
  galleryButtonText: {
    color: "#60a5fa",
    fontWeight: "600",
    fontSize: 15,
  },
  closeButton: {
    marginTop: 16,
    padding: 10,
  },
  closeButtonText: {
    color: "#64748b",
    fontSize: 15,
  },
  cameraWrapper: {
    flex: 1,
    backgroundColor: "#000",
  },
  maskContainer: {
    flex: 1,
  },
  maskTop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 30,
  },
  instructionTitle: {
    color: "#ffffff",
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  instructionSubtitle: {
    color: "#cbd5e1",
    fontSize: 13,
    marginTop: 6,
  },
  maskCenterRow: {
    flexDirection: "row",
    height: OVAL_HEIGHT,
  },
  maskSide: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  ovalGuide: {
    width: OVAL_WIDTH,
    height: OVAL_HEIGHT,
    borderRadius: OVAL_WIDTH / 2,
    borderWidth: 3,
    borderColor: "#38bdf8",
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  crosshairH: {
    position: "absolute",
    width: 24,
    height: 2,
    backgroundColor: "rgba(56, 189, 248, 0.4)",
  },
  crosshairV: {
    position: "absolute",
    width: 2,
    height: 24,
    backgroundColor: "rgba(56, 189, 248, 0.4)",
  },
  maskBottom: {
    flex: 1.2,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 30,
  },
  shutterOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  shutterInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  shutterDot: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#2563eb",
  },
  smallControlBtn: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  controlIconText: {
    fontSize: 26,
  },
  smallControlLabel: {
    color: "#cbd5e1",
    fontSize: 12,
    marginTop: 4,
  },
  floatingCloseBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  floatingCloseText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  previewOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    padding: 24,
    paddingBottom: 40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  previewHeading: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  previewSubheading: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
  },
  previewActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  retakeBtn: {
    backgroundColor: "#334155",
  },
  retakeBtnText: {
    color: "#f1f5f9",
    fontWeight: "600",
    fontSize: 15,
  },
  confirmBtn: {
    backgroundColor: "#2563eb",
  },
  confirmBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
});
