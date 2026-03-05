import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useProfileStore } from "../store/useProfileStore";
import { getProfile } from "../api/profile";
import { DEMO_USER_ID } from "../constants";

export default function ProfileScreen() {
  const { priceSensitivity, impulseIndex, categoryWeight, loading, error, setProfile, setLoading, setError } =
    useProfileStore();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProfile(DEMO_USER_ID)
      .then((res) => {
        if (!cancelled) setProfile(res);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || "獲取畫像失敗");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  const categories = Object.entries(categoryWeight).filter(([, w]) => w > 0);

  return (
    <View style={styles.container}>
      <View style={styles.block}>
        <Text style={styles.label}>價格敏感指數</Text>
        <Text style={styles.value}>{Number(priceSensitivity).toFixed(2)}</Text>
        <Text style={styles.hint}>0=不敏感，1=非常敏感</Text>
      </View>
      <View style={styles.block}>
        <Text style={styles.label}>衝動指數</Text>
        <Text style={styles.value}>{Number(impulseIndex).toFixed(2)}</Text>
        <Text style={styles.hint}>0=理性，1=較衝動</Text>
      </View>
      <View style={styles.block}>
        <Text style={styles.label}>品類偏好權重</Text>
        {categories.length > 0 ? (
          categories.map(([cat, w]) => (
            <View key={cat} style={styles.row}>
              <Text style={styles.catName}>{cat}</Text>
              <Text style={styles.catWeight}>{Number(w).toFixed(2)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>暫無偏好數據</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9", padding: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { color: "#dc2626", fontSize: 16 },
  block: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  label: { fontSize: 16, fontWeight: "600", color: "#1e293b", marginBottom: 6 },
  value: { fontSize: 22, color: "#2563eb", marginBottom: 4 },
  hint: { fontSize: 13, color: "#94a3b8" },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  catName: { fontSize: 15, color: "#334155" },
  catWeight: { fontSize: 15, color: "#64748b" },
  empty: { fontSize: 14, color: "#94a3b8", marginTop: 8 },
});
