import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { api } from "../../src/config/api";
import { FaceCameraModal } from "../../src/components/FaceCameraModal";

export default function RegisterScreen() {
  const router = useRouter();

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [faceImageUri, setFaceImageUri] = useState<string | null>(null);

  // UI state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCaptureFace = (uri: string) => {
    setFaceImageUri(uri);
    setErrorMessage(null);
  };

  const validateForm = (): boolean => {
    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return false;
    }
    if (!faceImageUri) {
      setErrorMessage("Please capture your facial photo for identity verification.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("full_name", fullName.trim());
      formData.append("email", email.trim().toLowerCase());
      formData.append("password", password);
      if (phone.trim()) {
        formData.append("phone", phone.trim());
      }

      if (faceImageUri) {
        const filename = faceImageUri.split("/").pop() || "selfie.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const mimeType = match ? `image/${match[1].toLowerCase()}` : "image/jpeg";

        // @ts-ignore React Native FormData file signature
        formData.append("face_image", {
          uri: faceImageUri,
          name: filename,
          type: mimeType,
        });
      }

      const response = await api.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201) {
        // Successfully registered -> Route directly to Pending Screen
        router.replace({
          pathname: "/(auth)/pending",
          params: {
            name: fullName.trim(),
            email: email.trim().toLowerCase(),
          },
        });
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      const detail = error.response?.data?.detail;
      if (typeof detail === "string") {
        setErrorMessage(detail);
      } else if (Array.isArray(detail)) {
        setErrorMessage(detail[0]?.msg || "Invalid registration form submission.");
      } else {
        setErrorMessage(
          "Could not connect to Ugnay server. Please verify your network connection and server status."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.badge}>MEMBER ENROLLMENT</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join the Ugnay Cooperative with verified facial registration
          </Text>
        </View>

        {/* Error Notice */}
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Form Fields */}
        <View style={styles.formCard}>
          <Text style={styles.sectionHeader}>Personal Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Juan Dela Cruz"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="juan@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="0917 123 4567"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Minimum 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Admin Role Assignment Notice */}
          <View style={styles.roleNoticeBox}>
            <Text style={styles.roleNoticeIcon}>ℹ️</Text>
            <View style={styles.roleNoticeContent}>
              <Text style={styles.roleNoticeTitle}>Role Assignment</Text>
              <Text style={styles.roleNoticeText}>
                Your operational role (Logistics, Production, Marketing,
                Microfinance, or Savings) will be assigned by the Cooperative
                Administrator upon account review.
              </Text>
            </View>
          </View>
        </View>

        {/* Facial Authentication Enrollment Card */}
        <View style={styles.faceCard}>
          <Text style={styles.sectionHeader}>Facial Identity Verification</Text>
          <Text style={styles.faceDescription}>
            A live selfie is required. This secures your account and enables
            biometric login.
          </Text>

          {faceImageUri ? (
            <View style={styles.capturedContainer}>
              <Image source={{ uri: faceImageUri }} style={styles.faceThumb} />
              <View style={styles.capturedDetails}>
                <View style={styles.badgeSuccess}>
                  <Text style={styles.badgeSuccessText}>✓ Face Photo Ready</Text>
                </View>
                <TouchableOpacity
                  style={styles.retakeButton}
                  onPress={() => setIsCameraOpen(true)}
                >
                  <Text style={styles.retakeButtonText}>Retake Photo</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.openCameraButton}
              onPress={() => setIsCameraOpen(true)}
            >
              <Text style={styles.cameraIcon}>📸</Text>
              <Text style={styles.openCameraText}>Open Camera to Capture Face</Text>
              <Text style={styles.openCameraSubtext}>Front-facing photo with good lighting</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Registration</Text>
          )}
        </TouchableOpacity>

        {/* Link to Login */}
        <View style={styles.footerLinkRow}>
          <Text style={styles.footerText}>Already registered? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Face Capture Camera Modal */}
      <FaceCameraModal
        visible={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCaptureFace}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    padding: 20,
    paddingTop: 54,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  badge: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0f172a",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  roleNoticeBox: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    marginTop: 8,
  },
  roleNoticeIcon: {
    fontSize: 18,
    marginRight: 10,
    marginTop: 2,
  },
  roleNoticeContent: {
    flex: 1,
  },
  roleNoticeTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e40af",
    marginBottom: 2,
  },
  roleNoticeText: {
    fontSize: 12,
    color: "#3b82f6",
    lineHeight: 17,
  },
  faceCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  faceDescription: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
    marginBottom: 14,
  },
  openCameraButton: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
  },
  cameraIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  openCameraText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#15803d",
  },
  openCameraSubtext: {
    fontSize: 12,
    color: "#16a34a",
    marginTop: 4,
  },
  capturedContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  faceThumb: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: "#10b981",
  },
  capturedDetails: {
    marginLeft: 16,
    flex: 1,
  },
  badgeSuccess: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  badgeSuccessText: {
    color: "#15803d",
    fontSize: 12,
    fontWeight: "600",
  },
  retakeButton: {
    backgroundColor: "#e2e8f0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  retakeButtonText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#93c5fd",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  footerLinkRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    color: "#64748b",
    fontSize: 14,
  },
  loginLink: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 14,
  },
});

