import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedProps, useSharedValue, withTiming } from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { useColors } from "@/hooks/useColors";
import { getGradeColor } from "@/constants/nsuData";

interface CGPACircleProps {
  cgpa: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function CGPACircle({ cgpa, size = 160, strokeWidth = 12, label }: CGPACircleProps) {
  const colors = useColors();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = cgpa / 4.0;
  const gradeColor = getGradeColor(cgpa);

  const animatedProgress = useSharedValue(0);
  React.useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 1000 });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  const gradeLabel = cgpa >= 3.7 ? "A" : cgpa >= 3.3 ? "A-" : cgpa >= 3.0 ? "B+" : cgpa >= 2.7 ? "B" : cgpa >= 2.3 ? "B-" : cgpa >= 2.0 ? "C+" : cgpa >= 1.7 ? "C" : cgpa >= 1.3 ? "C-" : cgpa >= 1.0 ? "D+" : cgpa >= 0.5 ? "D" : "F";

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.muted}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={gradeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.cgpaText, { color: gradeColor, fontFamily: "Inter_700Bold" }]}>
          {cgpa > 0 ? cgpa.toFixed(2) : "—"}
        </Text>
        <Text style={[styles.gradeLabel, { color: gradeColor, fontFamily: "Inter_600SemiBold" }]}>
          {cgpa > 0 ? gradeLabel : "N/A"}
        </Text>
        {label ? (
          <Text style={[styles.sublabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {label}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  cgpaText: {
    fontSize: 36,
    lineHeight: 42,
  },
  gradeLabel: {
    fontSize: 16,
    marginTop: 2,
  },
  sublabel: {
    fontSize: 12,
    marginTop: 2,
  },
});
