import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useData } from "@/context/DataContext";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, cgpa, totalCredits, exportData, importData, resetData } = useData();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  function handleExport() {
    const json = exportData();
    const summary = {
      courses: data.completedCourses.length,
      semesters: data.semesters.length,
      cgpa: cgpa.toFixed(2),
      credits: totalCredits,
    };

    Alert.alert(
      "Export Data",
      `Your data includes:\n• ${summary.courses} completed courses\n• ${summary.semesters} semesters\n• CGPA: ${summary.cgpa}\n• ${summary.credits} credits\n\nShare as JSON?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Share",
          onPress: async () => {
            try {
              await Share.share({
                title: "NSU Metrics Data",
                message: json,
              });
            } catch (e) {
              Alert.alert("Error", "Could not share data.");
            }
          },
        },
      ]
    );
  }

  function handleReset() {
    Alert.alert(
      "Reset All Data",
      "This will permanently delete all your courses, semesters, and CGPA data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetData();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  }

  function SettingRow({
    icon,
    label,
    value,
    onPress,
    danger,
    trailing,
  }: {
    icon: keyof typeof Feather.glyphMap;
    label: string;
    value?: string;
    onPress?: () => void;
    danger?: boolean;
    trailing?: React.ReactNode;
  }) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.settingRow,
          { opacity: pressed && onPress ? 0.7 : 1 },
        ]}
      >
        <View style={[styles.settingIcon, { backgroundColor: (danger ? colors.destructive : colors.primary) + "18" }]}>
          <Feather name={icon} size={18} color={danger ? colors.destructive : colors.primary} />
        </View>
        <Text
          style={[
            styles.settingLabel,
            { color: danger ? colors.destructive : colors.foreground, fontFamily: "Inter_500Medium" },
          ]}
        >
          {label}
        </Text>
        <View style={styles.settingTrailing}>
          {trailing ?? (
            <>
              {value && (
                <Text style={[styles.settingValue, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {value}
                </Text>
              )}
              {onPress && !trailing && (
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              )}
            </>
          )}
        </View>
      </Pressable>
    );
  }

  function SectionHeader({ title }: { title: string }) {
    return (
      <Text style={[styles.sectionHeader, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
        {title}
      </Text>
    );
  }

  function Card({ children }: { children: React.ReactNode }) {
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        {children}
      </View>
    );
  }

  function Divider() {
    return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topInset + 16, paddingBottom: bottomInset + 100 },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold", marginBottom: 24 }]}>
          Settings
        </Text>

        {/* Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.primary, borderRadius: colors.radius }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { fontFamily: "Inter_700Bold" }]}>{cgpa > 0 ? cgpa.toFixed(2) : "—"}</Text>
            <Text style={[styles.summaryLabel, { fontFamily: "Inter_400Regular" }]}>CGPA</Text>
          </View>
          <View style={[styles.summaryDivider]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { fontFamily: "Inter_700Bold" }]}>{totalCredits}</Text>
            <Text style={[styles.summaryLabel, { fontFamily: "Inter_400Regular" }]}>Credits</Text>
          </View>
          <View style={[styles.summaryDivider]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { fontFamily: "Inter_700Bold" }]}>{data.completedCourses.length}</Text>
            <Text style={[styles.summaryLabel, { fontFamily: "Inter_400Regular" }]}>Courses</Text>
          </View>
          <View style={[styles.summaryDivider]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { fontFamily: "Inter_700Bold" }]}>{data.semesters.length}</Text>
            <Text style={[styles.summaryLabel, { fontFamily: "Inter_400Regular" }]}>Semesters</Text>
          </View>
        </View>

        {/* Appearance */}
        <SectionHeader title="APPEARANCE" />
        <Card>
          <SettingRow
            icon="moon"
            label="Dark Mode"
            trailing={
              <View style={[styles.modeTag, { backgroundColor: colors.muted, borderRadius: 6 }]}>
                <Text style={[{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12 }]}>
                  {isDark ? "Dark" : "Light"} (System)
                </Text>
              </View>
            }
          />
        </Card>

        {/* Goals */}
        <SectionHeader title="GOAL SETTINGS" />
        <Card>
          <SettingRow
            icon="target"
            label="Target CGPA"
            value={(data.targetCGPA ?? 3.5).toFixed(2)}
          />
          <Divider />
          <SettingRow
            icon="bookmark"
            label="Total Degree Credits"
            value={(data.targetCredits ?? 130).toString() + " cr"}
          />
        </Card>

        {/* Data */}
        <SectionHeader title="DATA MANAGEMENT" />
        <Card>
          <SettingRow
            icon="upload"
            label="Export Data"
            value="JSON"
            onPress={handleExport}
          />
          <Divider />
          <SettingRow
            icon="trash-2"
            label="Reset All Data"
            onPress={handleReset}
            danger
          />
        </Card>

        {/* About */}
        <SectionHeader title="ABOUT" />
        <Card>
          <SettingRow
            icon="info"
            label="App Version"
            value="1.0.0"
          />
          <Divider />
          <SettingRow
            icon="graduation-cap" 
            label="University"
            value="North South University"
          />
          <Divider />
          <SettingRow
            icon="bar-chart-2"
            label="Grading System"
            value="NSU 4.00 Scale"
          />
        </Card>

        {/* Grade Scale Reference */}
        <SectionHeader title="GRADE SCALE REFERENCE" />
        <View style={[styles.gradeRef, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          {[
            { grade: "A", points: "4.00", color: "#10B981" },
            { grade: "A-", points: "3.70", color: "#10B981" },
            { grade: "B+", points: "3.30", color: "#34D399" },
            { grade: "B", points: "3.00", color: "#60A5FA" },
            { grade: "B-", points: "2.70", color: "#818CF8" },
            { grade: "C+", points: "2.30", color: "#F59E0B" },
            { grade: "C", points: "2.00", color: "#FB923C" },
            { grade: "C-", points: "1.70", color: "#FB923C" },
            { grade: "D+", points: "1.30", color: "#F87171" },
            { grade: "D", points: "1.00", color: "#F87171" },
            { grade: "F", points: "0.00", color: "#EF4444" },
          ].map((item, i, arr) => (
            <React.Fragment key={item.grade}>
              <View style={styles.gradeRefRow}>
                <View style={[styles.gradeRefBadge, { backgroundColor: item.color + "20", borderRadius: 6 }]}>
                  <Text style={[styles.gradeRefGrade, { color: item.color, fontFamily: "Inter_700Bold" }]}>
                    {item.grade}
                  </Text>
                </View>
                <Text style={[styles.gradeRefPoints, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  {item.points} points
                </Text>
              </View>
              {i < arr.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16 },
  title: { fontSize: 26 },
  summaryCard: { padding: 20, flexDirection: "row", marginBottom: 24, alignItems: "center" },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryNum: { fontSize: 22, color: "#fff" },
  summaryLabel: { fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  summaryDivider: { width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.2)" },
  sectionHeader: { fontSize: 11, letterSpacing: 0.8, marginBottom: 8, marginTop: 20, paddingHorizontal: 4 },
  card: { borderWidth: 1, overflow: "hidden", marginBottom: 0 },
  settingRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  settingLabel: { flex: 1, fontSize: 15 },
  settingTrailing: { flexDirection: "row", alignItems: "center", gap: 6 },
  settingValue: { fontSize: 14 },
  divider: { height: 1, marginLeft: 64 },
  modeTag: { paddingHorizontal: 8, paddingVertical: 4 },
  gradeRef: { borderWidth: 1, overflow: "hidden" },
  gradeRefRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  gradeRefBadge: { width: 44, height: 32, alignItems: "center", justifyContent: "center" },
  gradeRefGrade: { fontSize: 13 },
  gradeRefPoints: { fontSize: 14 },
});
