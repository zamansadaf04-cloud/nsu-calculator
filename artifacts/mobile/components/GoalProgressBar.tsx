import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";

interface GoalProgressBarProps {
  current: number;
  target: number;
  label?: string;
}

export function GoalProgressBar({ current, target, label }: GoalProgressBarProps) {
  const colors = useColors();
  const progress = target > 0 ? Math.min(current / target, 1) : 0;
  const progressValue = useSharedValue(0);

  React.useEffect(() => {
    progressValue.value = withTiming(progress, { duration: 800 });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }));

  const barColor =
    progress >= 1
      ? colors.success
      : progress >= 0.75
      ? colors.primary
      : progress >= 0.5
      ? colors.warning
      : colors.accent;

  const percentage = Math.round(progress * 100);

  return (
    <View style={styles.container}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {label}
          </Text>
          <Text style={[styles.percentage, { color: barColor, fontFamily: "Inter_700Bold" }]}>
            {percentage}%
          </Text>
        </View>
      ) : null}
      <View style={[styles.track, { backgroundColor: colors.muted, borderRadius: 6 }]}>
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: barColor, borderRadius: 6 },
            animatedStyle,
          ]}
        />
      </View>
      <View style={styles.valuesRow}>
        <Text style={[styles.valueText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
          {current.toFixed(2)}
        </Text>
        <Text style={[styles.targetText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          / {target.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 6,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 13,
  },
  percentage: {
    fontSize: 13,
  },
  track: {
    height: 10,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
  valuesRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  valueText: {
    fontSize: 16,
  },
  targetText: {
    fontSize: 14,
    marginLeft: 2,
  },
});
