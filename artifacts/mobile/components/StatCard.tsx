import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: string;
  onPress?: () => void;
}

export function StatCard({ label, value, icon, accent, onPress }: StatCardProps) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed && onPress ? 0.8 : 1,
          borderRadius: colors.radius,
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: (accent || colors.primary) + "18" }]}>
        {icon}
      </View>
      <Text style={[styles.value, { color: accent || colors.foreground, fontFamily: "Inter_700Bold" }]}>
        {value}
      </Text>
      <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 6,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  value: {
    fontSize: 22,
  },
  label: {
    fontSize: 12,
    textAlign: "center",
  },
});
