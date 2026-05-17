import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useData } from "@/context/DataContext";
import { CGPACircle } from "@/components/CGPACircle";
import { StatCard } from "@/components/StatCard";
import { GoalProgressBar } from "@/components/GoalProgressBar";
import { GradeSelector } from "@/components/GradeSelector";
import { EmptyState } from "@/components/EmptyState";
import { CompletedCourse } from "@/types";
import { getGradeColor } from "@/constants/nsuData";

function genId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, cgpa, totalCredits, totalGradePoints, allCourses, addCompletedCourse, removeCompletedCourse } =
    useData();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customCredits, setCustomCredits] = useState("3");
  const [grade, setGrade] = useState("");
  const [gradePoints, setGradePoints] = useState(0);
  const [useCustom, setUseCustom] = useState(false);
  const [courseSearch, setCourseSearch] = useState("");
  const [formError, setFormError] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const completedCount = data.completedCourses.length;
  const topSemester = data.semesters.reduce((best, s) => (s.gpa > best ? s.gpa : best), 0);

  function computeRequired() {
    const target = data.targetCGPA ?? 3.5;
    const totalTarget = data.targetCredits ?? 130;
    const remaining = totalTarget - totalCredits;
    if (remaining <= 0) return null;
    const neededPoints = target * totalTarget - totalGradePoints;
    return neededPoints / remaining;
  }
  const reqAvg = computeRequired();

  function handleAddCourse() {
    setFormError("");

    if (!grade) {
      setFormError("Please select a grade before adding.");
      return;
    }

    if (useCustom) {
      if (!customCode.trim()) {
        setFormError("Please enter a course code.");
        return;
      }
      if (!customTitle.trim()) {
        setFormError("Please enter a course title.");
        return;
      }
      const credits = parseFloat(customCredits) || 3;
      const c: CompletedCourse = {
        id: genId(),
        courseId: genId(),
        courseCode: customCode.trim().toUpperCase(),
        courseTitle: customTitle.trim(),
        credits,
        grade,
        gradePoints,
      };
      addCompletedCourse(c);
    } else {
      if (!selectedCourseId) {
        setFormError("Please select a course from the list.");
        return;
      }
      const course = allCourses.find((c) => c.id === selectedCourseId);
      if (!course) return;
      const existing = data.completedCourses.find((c) => c.courseId === selectedCourseId);
      if (existing) {
        setFormError(`${course.code} is already in your completed courses.`);
        return;
      }
      const c: CompletedCourse = {
        id: genId(),
        courseId: course.id,
        courseCode: course.code,
        courseTitle: course.title,
        credits: course.credits,
        grade,
        gradePoints,
      };
      addCompletedCourse(c);
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    resetModal();
  }

  function resetModal() {
    setAddModalVisible(false);
    setSelectedCourseId("");
    setCustomCode("");
    setCustomTitle("");
    setCustomCredits("3");
    setGrade("");
    setGradePoints(0);
    setUseCustom(false);
    setCourseSearch("");
    setFormError("");
  }

  const filteredCourses = allCourses.filter(
    (c) =>
      c.code.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.title.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topInset + 16, paddingBottom: bottomInset + 100 },
        ]}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              NSU Metrics
            </Text>
            <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Your CGPA
            </Text>
          </View>
          <Pressable
            onPress={() => setAddModalVisible(true)}
            style={({ pressed }) => [
              styles.addBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1, borderRadius: 14 },
            ]}
          >
            <Feather name="plus" size={22} color="#fff" />
          </Pressable>
        </View>

        {/* CGPA Circle */}
        <View style={[styles.cgpaCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <CGPACircle cgpa={cgpa} size={180} label="CGPA" />
          {cgpa > 0 && (
            <Text style={[styles.motivational, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {cgpa >= 3.7
                ? "Outstanding! Keep it up!"
                : cgpa >= 3.3
                ? "Great work! Almost at the top!"
                : cgpa >= 3.0
                ? "Good job! Push for excellence!"
                : cgpa >= 2.5
                ? "Decent progress. You can do better!"
                : "Keep working hard — growth is coming!"}
            </Text>
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            label="Credits"
            value={totalCredits.toString()}
            icon={<Feather name="award" size={20} color={colors.primary} />}
            accent={colors.primary}
          />
          <StatCard
            label="Courses"
            value={completedCount.toString()}
            icon={<Feather name="book-open" size={20} color={colors.accent} />}
            accent={colors.accent}
          />
          <StatCard
            label="Best GPA"
            value={topSemester > 0 ? topSemester.toFixed(2) : "—"}
            icon={<Feather name="trending-up" size={20} color={colors.success} />}
            accent={colors.success}
          />
        </View>

        {/* Goal Progress */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            CGPA Goal Progress
          </Text>
          <GoalProgressBar
            current={cgpa}
            target={data.targetCGPA ?? 3.5}
            label="Towards target CGPA"
          />
          {reqAvg !== null && (
            <View style={[styles.reqBadge, { backgroundColor: colors.secondary, borderRadius: 10, marginTop: 10 }]}>
              <Text style={[styles.reqText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
                {reqAvg > 4
                  ? "Target CGPA is not achievable with remaining credits."
                  : reqAvg <= 0
                  ? "You have already reached your target!"
                  : `You need an avg of ${reqAvg.toFixed(2)} in remaining ${(data.targetCredits ?? 130) - totalCredits} credits`}
              </Text>
            </View>
          )}
        </View>

        {/* Completed Courses */}
        <View style={styles.coursesHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            Completed Courses
          </Text>
          <Text style={[styles.courseCount, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {completedCount} courses
          </Text>
        </View>

        {data.completedCourses.length === 0 ? (
          <EmptyState
            icon="book"
            title="No courses yet"
            description="Tap the + button to add your completed courses and calculate your CGPA."
          />
        ) : (
          data.completedCourses.map((c) => {
            const gColor = getGradeColor(c.gradePoints);
            const isConfirming = deleteConfirmId === c.id;
            return (
              <Pressable
                key={c.id}
                onLongPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setDeleteConfirmId(c.id);
                }}
                style={[
                  styles.courseRow,
                  {
                    backgroundColor: isConfirming ? colors.destructive + "10" : colors.card,
                    borderColor: isConfirming ? colors.destructive : colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
              >
                <View style={[styles.gradePill, { backgroundColor: gColor + "20" }]}>
                  <Text style={[styles.gradeText, { color: gColor, fontFamily: "Inter_700Bold" }]}>
                    {c.grade}
                  </Text>
                </View>
                <View style={styles.courseInfo}>
                  <Text style={[styles.courseCode, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                    {c.courseCode}
                  </Text>
                  <Text
                    style={[styles.courseTitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}
                    numberOfLines={1}
                  >
                    {c.courseTitle}
                  </Text>
                </View>
                {isConfirming ? (
                  <View style={styles.deleteRow}>
                    <Pressable
                      onPress={() => setDeleteConfirmId(null)}
                      style={[styles.deleteActionBtn, { backgroundColor: colors.muted, borderRadius: 8 }]}
                    >
                      <Feather name="x" size={14} color={colors.mutedForeground} />
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        removeCompletedCourse(c.id);
                        setDeleteConfirmId(null);
                      }}
                      style={[styles.deleteActionBtn, { backgroundColor: colors.destructive, borderRadius: 8 }]}
                    >
                      <Feather name="trash-2" size={14} color="#fff" />
                    </Pressable>
                  </View>
                ) : (
                  <Text style={[styles.creditText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {c.credits} cr
                  </Text>
                )}
              </Pressable>
            );
          })
        )}
      </ScrollView>

      {/* Add Course Modal */}
      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: colors.card,
                paddingBottom: insets.bottom + 16,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Add Completed Course
            </Text>

            {/* Toggle */}
            <View style={[styles.toggleRow, { backgroundColor: colors.muted, borderRadius: 10 }]}>
              {["Select Course", "Custom Course"].map((label, i) => (
                <Pressable
                  key={label}
                  onPress={() => { setUseCustom(i === 1); setFormError(""); }}
                  style={[
                    styles.toggleBtn,
                    {
                      backgroundColor: useCustom === (i === 1) ? colors.card : "transparent",
                      borderRadius: 8,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: useCustom === (i === 1) ? colors.primary : colors.mutedForeground,
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 13,
                    }}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 340 }} keyboardShouldPersistTaps="handled">
              {useCustom ? (
                <View>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                    Course Code
                  </Text>
                  <TextInput
                    value={customCode}
                    onChangeText={(t) => { setCustomCode(t); setFormError(""); }}
                    placeholder="e.g. CSE115"
                    placeholderTextColor={colors.mutedForeground}
                    style={[styles.textInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular", borderRadius: 10 }]}
                    autoCapitalize="characters"
                  />
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                    Course Title
                  </Text>
                  <TextInput
                    value={customTitle}
                    onChangeText={(t) => { setCustomTitle(t); setFormError(""); }}
                    placeholder="e.g. Programming Language I"
                    placeholderTextColor={colors.mutedForeground}
                    style={[styles.textInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular", borderRadius: 10 }]}
                  />
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                    Credits
                  </Text>
                  <TextInput
                    value={customCredits}
                    onChangeText={setCustomCredits}
                    placeholder="3"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="numeric"
                    style={[styles.textInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular", borderRadius: 10 }]}
                  />
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                    Grade
                  </Text>
                  <GradeSelector value={grade} onChange={(g, p) => { setGrade(g); setGradePoints(p); setFormError(""); }} />
                </View>
              ) : (
                <View>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                    Search Course
                  </Text>
                  <View style={[styles.searchBox, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: 10 }]}>
                    <Feather name="search" size={16} color={colors.mutedForeground} />
                    <TextInput
                      value={courseSearch}
                      onChangeText={setCourseSearch}
                      placeholder="Course code or title..."
                      placeholderTextColor={colors.mutedForeground}
                      style={[styles.searchInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                    />
                  </View>
                  {filteredCourses.slice(0, 20).map((c) => (
                    <Pressable
                      key={c.id}
                      onPress={() => { setSelectedCourseId(c.id); setFormError(""); }}
                      style={[
                        styles.coursePickerRow,
                        {
                          backgroundColor: selectedCourseId === c.id ? colors.secondary : "transparent",
                          borderRadius: 10,
                          borderColor: selectedCourseId === c.id ? colors.primary : "transparent",
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
                          {c.code}
                        </Text>
                        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12 }}>
                          {c.title} · {c.credits} cr
                        </Text>
                      </View>
                      {selectedCourseId === c.id && (
                        <Feather name="check-circle" size={18} color={colors.primary} />
                      )}
                    </Pressable>
                  ))}
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium", marginTop: 12 }]}>
                    Grade
                  </Text>
                  <GradeSelector value={grade} onChange={(g, p) => { setGrade(g); setGradePoints(p); setFormError(""); }} />
                </View>
              )}
            </ScrollView>

            {/* Inline error */}
            {formError !== "" && (
              <View style={[styles.errorBox, { backgroundColor: colors.destructive + "15", borderColor: colors.destructive, borderRadius: 8 }]}>
                <Feather name="alert-circle" size={14} color={colors.destructive} />
                <Text style={[styles.errorText, { color: colors.destructive, fontFamily: "Inter_500Medium" }]}>
                  {formError}
                </Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <Pressable
                onPress={resetModal}
                style={[styles.cancelBtn, { borderColor: colors.border, borderRadius: 12 }]}
              >
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleAddCourse}
                style={[styles.confirmBtn, { backgroundColor: colors.primary, borderRadius: 12 }]}
              >
                <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold" }}>Add Course</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  greeting: { fontSize: 13, marginBottom: 2 },
  title: { fontSize: 26 },
  addBtn: { width: 46, height: 46, alignItems: "center", justifyContent: "center" },
  cgpaCard: { alignItems: "center", padding: 28, marginBottom: 16, borderWidth: 1, gap: 12 },
  motivational: { fontSize: 13, textAlign: "center" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  section: { padding: 16, marginBottom: 16, borderWidth: 1 },
  sectionTitle: { fontSize: 16, marginBottom: 12 },
  reqBadge: { padding: 10 },
  reqText: { fontSize: 13, lineHeight: 18 },
  coursesHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  courseCount: { fontSize: 13 },
  courseRow: { flexDirection: "row", alignItems: "center", padding: 14, marginBottom: 8, borderWidth: 1, gap: 12 },
  gradePill: { width: 44, height: 36, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  gradeText: { fontSize: 14 },
  courseInfo: { flex: 1 },
  courseCode: { fontSize: 14 },
  courseTitle: { fontSize: 12, marginTop: 2 },
  creditText: { fontSize: 12 },
  deleteRow: { flexDirection: "row", gap: 6 },
  deleteActionBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    maxHeight: "92%",
  },
  modalHandle: { width: 40, height: 4, backgroundColor: "#ccc", borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  modalTitle: { fontSize: 20, marginBottom: 16 },
  toggleRow: { flexDirection: "row", padding: 3, marginBottom: 12 },
  toggleBtn: { flex: 1, paddingVertical: 8, alignItems: "center" },
  fieldLabel: { fontSize: 13, marginBottom: 6, marginTop: 8 },
  textInput: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, marginBottom: 4 },
  searchBox: { flexDirection: "row", alignItems: "center", borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8, gap: 8, marginBottom: 10 },
  searchInput: { flex: 1, fontSize: 14 },
  coursePickerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, paddingHorizontal: 12, marginBottom: 4 },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, marginTop: 8, borderWidth: 1 },
  errorText: { fontSize: 13, flex: 1 },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 12 },
  cancelBtn: { flex: 1, borderWidth: 1, paddingVertical: 13, alignItems: "center" },
  confirmBtn: { flex: 2, paddingVertical: 13, alignItems: "center" },
});
