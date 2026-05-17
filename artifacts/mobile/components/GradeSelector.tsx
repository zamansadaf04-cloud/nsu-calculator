import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { GRADE_SCALE } from "@/constants/nsuData";

interface GradeSelectorProps {
  value: string;
  onChange: (grade: string, points: number) => void;
}

export function GradeSelector({ value, onChange }: GradeSelectorProps) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);

  const selected = GRADE_SCALE.find((g) => g.grade === value);
  const gradeColor =
    (selected?.points ?? 0) >= 3.0
      ? colors.success
      : (selected?.points ?? 0) >= 2.0
      ? colors.warning
      : colors.destructive;

  return (
    <View>
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={({ pressed }) => [
          styles.selector,
          {
            backgroundColor: colors.background,
            borderColor: expanded ? colors.primary : colors.border,
            opacity: pressed ? 0.7 : 1,
            borderRadius: 10,
          },
        ]}
      >
        <Text
          style={[
            styles.gradeText,
            {
              color: value ? gradeColor : colors.mutedForeground,
              fontFamily: "Inter_600SemiBold",
            },
          ]}
        >
          {value ? `${value}  (${selected?.points.toFixed(2)})` : "Select Grade"}
        </Text>
        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.mutedForeground}
        />
      </Pressable>

      {expanded && (
        <View
          style={[
            styles.dropdown,
            {
              backgroundColor: colors.card,
              borderColor: colors.primary,
              borderRadius: 10,
            },
          ]}
        >
          <View style={styles.grid}>
            {GRADE_SCALE.map((item) => {
              const isSelected = item.grade === value;
              const itemColor =
                item.points >= 3.0
                  ? colors.success
                  : item.points >= 2.0
                  ? colors.warning
                  : colors.destructive;
              return (
                <Pressable
                  key={item.grade}
                  onPress={() => {
                    onChange(item.grade, item.points);
                    setExpanded(false);
                  }}
                  style={({ pressed }) => [
                    styles.gradeChip,
                    {
                      backgroundColor: isSelected
                        ? itemColor
                        : pressed
                        ? colors.muted
                        : colors.background,
                      borderColor: isSelected ? itemColor : colors.border,
                      borderRadius: 8,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipGrade,
                      {
                        color: isSelected ? "#fff" : itemColor,
                        fontFamily: "Inter_700Bold",
                      },
                    ]}
                  >
                    {item.grade}
                  </Text>
                  <Text
                    style={[
                      styles.chipPoints,
                      {
                        color: isSelected ? "rgba(255,255,255,0.85)" : colors.mutedForeground,
                        fontFamily: "Inter_400Regular",
                      },
                    ]}
                  >
                    {item.points.toFixed(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  gradeText: {
    fontSize: 15,
    marginRight: 8,
  },
  dropdown: {
    marginTop: 4,
    borderWidth: 1.5,
    padding: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  gradeChip: {
    width: "17%",
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 1,
    gap: 2,
  },
  chipGrade: {
    fontSize: 13,
  },
  chipPoints: {
    fontSize: 10,
  },
});
