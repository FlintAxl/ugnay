import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/store/authStore";

const ROLE_METADATA: Record<
  string,
  { title: string; desc: string; icon: string; color: string }
> = {
  logistics: {
    title: "Logistics & Inventory",
    desc: "Warehouse monitoring, shipments, stock levels & AI inventory forecasts.",
    icon: "📦",
    color: "#0284c7",
  },
  production: {
    title: "Production Department",
    desc: "Manufacturing runs, raw material consumption, batch recipes & yields.",
    icon: "🏭",
    color: "#d97706",
  },
  marketing: {
    title: "Marketing & Distribution",
    desc: "Sales orders, partner channels, member products & marketing campaigns.",
    icon: "📢",
    color: "#e11d48",
  },
  microfinance: {
    title: "Microfinance Division",
    desc: "Member loan disbursements, credit evaluations & repayment amortization.",
    icon: "💳",
    color: "#16a34a",
  },
  savings: {
    title: "Savings & Deposits",
    desc: "Member passbooks, deposit collections, withdrawals & dividend dividends.",
    icon: "💰",
    color: "#7c3aed",
  },
};

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const role = user?.role || "logistics";
  const roleInfo = ROLE_METADATA[role] || {
    title: "Cooperative Workspace",
    desc: "Manage cooperative operations and records.",
    icon: "🏛️",
    color: "#2563eb",
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.userInfoRow}>
          {user?.face_data?.image_url ? (
            <Image
              source={{ uri: user.face_data.image_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {user?.full_name ? user.full_name[0].toUpperCase() : "U"}
              </Text>
            </View>
          )}
          <View style={styles.nameContainer}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.full_name || "Member"}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Role Badge Banner */}
      <View style={[styles.roleCard, { borderColor: roleInfo.color }]}>
        <View style={styles.roleHeaderRow}>
          <Text style={styles.roleIcon}>{roleInfo.icon}</Text>
          <View style={styles.roleTitleCol}>
            <Text style={styles.assignedBadge}>ASSIGNED ROLE</Text>
            <Text style={[styles.roleName, { color: roleInfo.color }]}>
              {roleInfo.title}
            </Text>
          </View>
        </View>
        <Text style={styles.roleDescription}>{roleInfo.desc}</Text>
        <View style={styles.verifiedRow}>
          <Text style={styles.checkIcon}>✓</Text>
          <Text style={styles.verifiedText}>
            Approved & Verified by Cooperative Administration
          </Text>
        </View>
      </View>

      {/* Member Details */}
      <View style={styles.detailsCard}>
        <Text style={styles.detailsHeading}>Account Information</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Email</Text>
          <Text style={styles.detailValue}>{user?.email}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Phone</Text>
          <Text style={styles.detailValue}>{user?.phone || "Not set"}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Biometric Status</Text>
          <Text style={[styles.detailValue, { color: "#16a34a" }]}>
            {user?.face_data?.is_registered ? "Face Registered ✓" : "None"}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Approved By</Text>
          <Text style={styles.detailValue}>
            {user?.approval?.approved_by || "Administrator"}
          </Text>
        </View>
      </View>

      {/* Department Workspace Preview */}
      <View style={styles.workspaceCard}>
        <Text style={styles.workspaceHeading}>Department Operations</Text>
        <Text style={styles.workspaceText}>
          You are authenticated as an authorized operative for the{" "}
          <Text style={{ fontWeight: "700" }}>{role.toUpperCase()}</Text> sector.
          Operational workflows will load here.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 54,
    paddingBottom: 40,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: "#2563eb",
  },
  avatarPlaceholder: {
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  nameContainer: {
    marginLeft: 12,
    flex: 1,
  },
  greeting: {
    fontSize: 13,
    color: "#64748b",
  },
  userName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  logoutBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#fee2e2",
  },
  logoutBtnText: {
    color: "#dc2626",
    fontWeight: "700",
    fontSize: 13,
  },
  roleCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    borderWidth: 2,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  roleHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  roleIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  roleTitleCol: {
    flex: 1,
  },
  assignedBadge: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 1,
  },
  roleName: {
    fontSize: 18,
    fontWeight: "800",
  },
  roleDescription: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 19,
    marginBottom: 14,
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    padding: 10,
    borderRadius: 10,
  },
  checkIcon: {
    color: "#16a34a",
    fontWeight: "bold",
    marginRight: 8,
  },
  verifiedText: {
    color: "#15803d",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  detailsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  detailsHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  detailLabel: {
    color: "#64748b",
    fontSize: 13,
  },
  detailValue: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 4,
  },
  workspaceCard: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
  },
  workspaceHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e40af",
    marginBottom: 6,
  },
  workspaceText: {
    fontSize: 13,
    color: "#3b82f6",
    lineHeight: 18,
  },
});

