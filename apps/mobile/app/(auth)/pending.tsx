import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function PendingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string; email?: string }>();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Icon Badge */}
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>⏳</Text>
      </View>

      <Text style={styles.title}>Registration Submitted!</Text>
      <Text style={styles.subtitle}>
        Your account and biometric facial identity profile have been securely
        received.
      </Text>

      {/* Applicant Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Applicant:</Text>
          <Text style={styles.infoValue}>{params.name || "Cooperative Member"}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Account Email:</Text>
          <Text style={styles.infoValue}>{params.email || "Registered email"}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Current Status:</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>PENDING APPROVAL</Text>
          </View>
        </View>
      </View>

      {/* Verification Timeline */}
      <View style={styles.timelineCard}>
        <Text style={styles.timelineHeading}>Approval & Verification Process</Text>

        <View style={styles.timelineStep}>
          <View style={[styles.stepDot, styles.stepDone]}>
            <Text style={styles.stepDotText}>✓</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Facial Registration Enrolled</Text>
            <Text style={styles.stepDesc}>
              Biometric features extracted and securely stored.
            </Text>
          </View>
        </View>

        <View style={styles.timelineLine} />

        <View style={styles.timelineStep}>
          <View style={[styles.stepDot, styles.stepActive]}>
            <Text style={styles.stepDotText}>2</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Administrator Review & Role Assignment</Text>
            <Text style={styles.stepDesc}>
              The Web Administrator verifies your identity and assigns your
              department role (Logistics, Production, Marketing, Microfinance, or
              Savings).
            </Text>
          </View>
        </View>

        <View style={styles.timelineLine} />

        <View style={styles.timelineStep}>
          <View style={[styles.stepDot, styles.stepPending]}>
            <Text style={styles.stepDotText}>3</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Account Activated for Login</Text>
            <Text style={styles.stepDesc}>
              Once approved, you will be able to log in using your credentials or
              face recognition.
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.replace("/(auth)/login")}
      >
        <Text style={styles.primaryButtonText}>Go to Login Screen</Text>
      </TouchableOpacity>

      <Text style={styles.supportNote}>
        Questions? Contact your cooperative administration officer.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: "#f8fafc",
    alignItems: "center",
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 4,
    borderColor: "#fde68a",
  },
  iconText: {
    fontSize: 42,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    width: "100%",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 4,
  },
  statusBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: "#d97706",
    fontSize: 12,
    fontWeight: "700",
  },
  timelineCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  timelineHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
  },
  timelineStep: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  stepDone: {
    backgroundColor: "#10b981",
  },
  stepActive: {
    backgroundColor: "#f59e0b",
  },
  stepPending: {
    backgroundColor: "#cbd5e1",
  },
  stepDotText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 13,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  stepDesc: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
    lineHeight: 17,
  },
  timelineLine: {
    width: 2,
    height: 20,
    backgroundColor: "#e2e8f0",
    marginLeft: 13,
    marginVertical: 4,
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  supportNote: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
  },
});

