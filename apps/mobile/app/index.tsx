import { View, Text, StyleSheet } from "react-native";

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ugnay</Text>
      <Text style={styles.subtitle}>Cooperative System</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 32, fontWeight: "bold", color: "#2563eb" },
  subtitle: { fontSize: 16, color: "#666", marginTop: 8 },
});