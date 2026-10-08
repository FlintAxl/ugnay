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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { api } from "../../src/config/api";
import { useAuthStore } from "../../src/store/authStore";
import { FaceCameraModal } from "../../src/components/FaceCameraModal";

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Face Login modal state
  const [isFaceLoginModalOpen, setIsFaceLoginModalOpen] = useState(false);
  const [isFaceAuthenticating, setIsFaceAuthenticating] = useState(false);

  const handleStandardLogin = async () => {
    setErrorMessage(null);
    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (response.status === 200 && response.data.access_token) {
        await setAuth(response.data.user, response.data.access_token);
        router.replace("/(roles)/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const res = error.response;
      if (res?.status === 403) {
        // Status checks: pending, rejected, suspended
        const detail = res.data?.detail;
        if (typeof detail === "object" && detail.status === "pending") {
          Alert.alert(
            "Account Pending Approval",
            "Your registration has been submitted and is currently awaiting review by the Cooperative Administrator. You will be able to log in once your account is approved and an operational role is assigned.",
            [
              {
                text: "View Status Details",
                onPress: () =>
                  router.push({
                    pathname: "/(auth)/pending",
                    params: { email: email.trim() },
                  }),
              },
              { text: "OK" },
            ]
          );
          setErrorMessage("Account is pending administrator approval.");
        } else if (typeof detail === "object" && detail.status === "rejected") {
          Alert.alert(
            "Registration Rejected",
            detail.message || "Your application was rejected by the administrator.",
            [{ text: "OK" }]
          );
          setErrorMessage(detail.message || "Registration was rejected.");
        } else {
          setErrorMessage(
            typeof detail === "string" ? detail : "Account access restricted."
          );
        }
      } else if (res?.status === 401) {
        setErrorMessage("Invalid email or password. Please try again.");
      } else {
        setErrorMessage("Could not connect to the server. Please verify network.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaceLoginCapture = async (faceUri: string) => {
    try {
      setIsFaceAuthenticating(true);
      setErrorMessage(null);

      const formData = new FormData();
      if (email.trim()) {
        formData.append("email", email.trim().toLowerCase());
      }

      const filename = faceUri.split("/").pop() || "face_login.jpg";
      // @ts-ignore
      formData.append("face_image", {
        uri: faceUri,
        name: filename,
        type: "image/jpeg",
      });

      const response = await api.post("/auth/face-login", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200 && response.data.access_token) {
        await setAuth(response.data.user, response.data.access_token);
        router.replace("/(roles)/dashboard");
      }
    } catch (error: any) {
      console.error("Face login error:", error);
      const detail = error.response?.data?.detail;
      const message =
        typeof detail === "string"
          ? detail
          : "Facial authentication failed. Please try again or log in with password.";
      Alert.alert("Facial Authentication", message);
      setErrorMessage(message);
    } finally {
      setIsFaceAuthenticating(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>UGNAY</Text>
          </View>
          <Text style={styles.title}>Cooperative System</Text>
          <Text style={styles.subtitle}>
            Sign in to your cooperative department workspace
          </Text>
        </View>

        {/* Error Notification */}
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Credentials Form */}
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="member@ugnay.coop"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, isLoading && styles.btnDisabled]}
            onPress={handleStandardLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.line} />
          </View>

          {/* Biometric Face Login Button */}
          <TouchableOpacity
            style={styles.faceLoginBtn}
            onPress={() => setIsFaceLoginModalOpen(true)}
            disabled={isFaceAuthenticating}
          >
            {isFaceAuthenticating ? (
              <ActivityIndicator color="#0284c7" />
            ) : (
              <>
                <Text style={styles.faceBtnIcon}>👤</Text>
                <Text style={styles.faceBtnText}>Sign In with Face Authentication</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Registration Link */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>New to Ugnay Cooperative? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text style={styles.registerLink}>Register Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Face Authentication Modal */}
      <FaceCameraModal
        visible={isFaceLoginModalOpen}
        onClose={() => setIsFaceLoginModalOpen(false)}
        onCapture={handleFaceLoginCapture}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    padding: 24,
    paddingTop: 70,
    paddingBottom: 40,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoBadge: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
  },
  logoBadgeText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 6,
    textAlign: "center",
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
    fontSize: 16,
    marginRight: 8,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 16,
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
  loginBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  btnDisabled: {
    backgroundColor: "#93c5fd",
  },
  loginBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
  },
  faceLoginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f9ff",
    borderColor: "#bae6fd",
    borderWidth: 1.5,
    paddingVertical: 14,
    borderRadius: 12,
  },
  faceBtnIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  faceBtnText: {
    color: "#0284c7",
    fontSize: 14,
    fontWeight: "700",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: "#64748b",
    fontSize: 14,
  },
  registerLink: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 14,
  },
});

