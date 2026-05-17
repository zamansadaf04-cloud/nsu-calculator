import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { GRADE_SCALE } from "@/constants/nsuData";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface GradeSelectorProps {
  value: string;
  onChange: (grade: string, points: number) => void;
}

export function GradeSelector({ value, onChange }: GradeSelectorProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);

  const selected = GRADE_SCALE.find((g) => g.grade === value);
  const gradeColor =
    (selected?.points ?? 0) >= 3.0
      ? colors.success
      : (selected?.points ?? 0) >= 2.0
      ? colors.warning
      : colors.destructive;

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        style={({ pressed }) => [
          styles.selector,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: pressed ? 0.7 : 1,
            borderRadius: 10,
          },
        ]}
      >
        <Text
          style={[
            styles.gradeText,
            { color: value ? gradeColor : colors.mutedForeground, fontFamily: "Inter_600SemiBold" },
          ]}
        >
          {value || "Select Grade"}
        </Text>
        <Feather name="chevron-down" size={16} color={colors.mutedForeground} />
      </Pressable>

      <Modal visible={visible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.card,
                paddingBottom: insets.bottom + 16,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.sheetTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Select Grade
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
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
                      setVisible(false);
                    }}
                    style={({ pressed }) => [
                      styles.gradeItem,
                      {
                        backgroundColor: isSelected
                          ? colors.secondary
                          : pressed
                          ? colors.muted
                          : "transparent",
                        borderRadius: 10,
                      },
                    ]}
                  >
                    <View style={[styles.gradeBadge, { backgroundColor: itemColor + "20" }]}>
                      <Text
                        style={[styles.gradeItemGrade, { color: itemColor, fontFamily: "Inter_700Bold" }]}
                      >
                        {item.grade}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.gradeItemPoints,
                        {
                          color: isSelected ? colors.primary : colors.foreground,
                          fontFamily: "Inter_500Medium",
                        },
                      ]}
                    >
                      {item.points.toFixed(2)} Points
                    </Text>
                    {isSelected && (
                      <Feather name="check" size={18} color={colors.primary} style={styles.checkIcon} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
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
    minWidth: 120,
  },
  gradeText: {
    fontSize: 15,
    marginRight: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 16,
    maxHeight: 480,
    borderTopWidth: 1,
  },
  sheetTitle: {
    fontSize: 18,
    marginBottom: 12,
    textAlign: "center",
  },
  gradeItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  gradeBadge: {
    width: 44,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  gradeItemGrade: {
    fontSize: 14,
  },
  gradeItemPoints: {
    fontSize: 15,
    flex: 1,
  },
  checkIcon: {
    marginLeft: 8,
  },
});
