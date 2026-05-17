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
import { GradeSelector } from "@/components/GradeSelector";
import { CGPACircle } from "@/components/CGPACircle";
import { EmptyState } from "@/components/EmptyState";
import { Semester, SemesterCourse } from "@/types";
import { getGradeColor } from "@/constants/nsuData";

function genId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

const SEASONS = ["Spring", "Summer", "Fall"] as const;
const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

export default function SemestersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, addSemester, deleteSemester, addCourseToSemester, removeCourseFromSemester, allCourses } = useData();

  const [addSemModal, setAddSemModal] = useState(false);
  const [selectedSemId, setSelectedSemId] = useState<string | null>(null);
  const [addCourseModal, setAddCourseModal] = useState(false);

  const [semSeason, setSemSeason] = useState<"Spring" | "Summer" | "Fall">("Spring");
  const [semYear, setSemYear] = useState(new Date().getFullYear());

  const [courseSearch, setCourseSearch] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [customCode, setCustomCode] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customCredits, setCustomCredits] = useState("3");
  const [grade, setGrade] = useState("");
  const [gradePoints, setGradePoints] = useState(0);
  const [formError, setFormError] = useState("");
  const [semError, setSemError] = useState("");

  const selectedSem = data.semesters.find((s) => s.id === selectedSemId);
  const overallCGPA = (() => {
    const allCourses = data.semesters.flatMap((s) => s.courses);
    if (allCourses.length === 0) return 0;
    const totalCredits = allCourses.reduce((sum, c) => sum + c.credits, 0);
    const totalPoints = allCourses.reduce((sum, c) => sum + c.gradePoints * c.credits, 0);
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  })();

  function handleAddSemester() {
    setSemError("");
    const existing = data.semesters.find(
      (s) => s.season === semSeason && s.year === semYear
    );
    if (existing) {
      setSemError(`${semSeason} ${semYear} semester already exists.`);
      return;
    }
    const sem: Semester = {
      id: genId(),
      name: `${semSeason} ${semYear}`,
      year: semYear,
      season: semSeason,
      courses: [],
      gpa: 0,
      totalCredits: 0,
    };
    addSemester(sem);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSemError("");
    setAddSemModal(false);
  }

  function handleAddCourse() {
    setFormError("");
    if (!grade) {
      setFormError("Please select a grade.");
      return;
    }
    let course: SemesterCourse;
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
      course = {
        id: genId(),
        courseId: genId(),
        courseCode: customCode.trim().toUpperCase(),
        courseTitle: customTitle.trim(),
        credits,
        grade,
        gradePoints,
      };
    } else {
      if (!selectedCourseId) {
        setFormError("Please select a course from the list.");
        return;
      }
      const c = allCourses.find((c) => c.id === selectedCourseId);
      if (!c) return;
      course = {
        id: genId(),
        courseId: c.id,
        courseCode: c.code,
        courseTitle: c.title,
        credits: c.credits,
        grade,
        gradePoints,
      };
    }
    addCourseToSemester(selectedSemId!, course);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    resetAddCourse();
  }

  function resetAddCourse() {
    setAddCourseModal(false);
    setSelectedCourseId("");
    setCustomCode("");
    setCustomTitle("");
    setCustomCredits("3");
    setGrade("");
    setGradePoints(0);
    setUseCustom(false);
    setCourseSearch("");
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
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Semesters
          </Text>
          <Pressable
            onPress={() => setAddSemModal(true)}
            style={({ pressed }) => [
              styles.addBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1, borderRadius: 14 },
            ]}
          >
            <Feather name="plus" size={22} color="#fff" />
          </Pressable>
        </View>

        {data.semesters.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="No semesters yet"
            description="Add a semester to track your GPA by semester and see your academic progress."
          />
        ) : (
          <>
            {/* Overall summary */}
            <View style={[styles.overallCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
              <CGPACircle cgpa={overallCGPA} size={130} label="Overall CGPA" />
              <View style={styles.semStats}>
                <Text style={[styles.semStatVal, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  {data.semesters.length}
                </Text>
                <Text style={[styles.semStatLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  Semesters
                </Text>
                <Text style={[styles.semStatVal, { color: colors.foreground, fontFamily: "Inter_700Bold", marginTop: 8 }]}>
                  {data.semesters.reduce((s, sem) => s + sem.courses.length, 0)}
                </Text>
                <Text style={[styles.semStatLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  Total Courses
                </Text>
              </View>
            </View>

            {/* Semesters list */}
            {data.semesters
              .slice()
              .sort((a, b) => b.year - a.year || b.season.localeCompare(a.season))
              .map((sem) => (
                <Pressable
                  key={sem.id}
                  onPress={() => setSelectedSemId(sem.id === selectedSemId ? null : sem.id)}
                  onLongPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    Alert.alert("Delete Semester", `Delete ${sem.name}?`, [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => {
                          deleteSemester(sem.id);
                          if (selectedSemId === sem.id) setSelectedSemId(null);
                        },
                      },
                    ]);
                  }}
                  style={[
                    styles.semCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: selectedSemId === sem.id ? colors.primary : colors.border,
                      borderRadius: colors.radius,
                      borderWidth: selectedSemId === sem.id ? 2 : 1,
                    },
                  ]}
                >
                  <View style={styles.semCardHeader}>
                    <View>
                      <Text style={[styles.semName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                        {sem.name}
                      </Text>
                      <Text style={[styles.semMeta, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                        {sem.courses.length} courses · {sem.totalCredits} credits
                      </Text>
                    </View>
                    <View style={styles.semGpaWrap}>
                      <Text
                        style={[
                          styles.semGpa,
                          {
                            color: getGradeColor(sem.gpa),
                            fontFamily: "Inter_700Bold",
                          },
                        ]}
                      >
                        {sem.courses.length > 0 ? sem.gpa.toFixed(2) : "—"}
                      </Text>
                      <Text style={[styles.semGpaLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                        GPA
                      </Text>
                    </View>
                  </View>

                  {/* Expanded courses */}
                  {selectedSemId === sem.id && (
                    <View style={styles.expandedArea}>
                      <View style={[styles.divider, { backgroundColor: colors.border }]} />
                      {sem.courses.length === 0 ? (
                        <Text style={[styles.noCourses, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                          No courses. Tap + to add.
                        </Text>
                      ) : (
                        sem.courses.map((c) => {
                          const gc = getGradeColor(c.gradePoints);
                          return (
                            <View key={c.id} style={styles.courseItem}>
                              <View style={[styles.miniGrade, { backgroundColor: gc + "20" }]}>
                                <Text style={[{ color: gc, fontFamily: "Inter_700Bold", fontSize: 12 }]}>
                                  {c.grade}
                                </Text>
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={[{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 13 }]}>
                                  {c.courseCode}
                                </Text>
                                <Text
                                  style={[{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 11 }]}
                                  numberOfLines={1}
                                >
                                  {c.courseTitle} · {c.credits} cr
                                </Text>
                              </View>
                              <Pressable
                                onPress={() => {
                                  Alert.alert("Remove", `Remove ${c.courseCode}?`, [
                                    { text: "Cancel", style: "cancel" },
                                    { text: "Remove", style: "destructive", onPress: () => removeCourseFromSemester(sem.id, c.id) },
                                  ]);
                                }}
                                hitSlop={8}
                              >
                                <Feather name="x" size={16} color={colors.destructive} />
                              </Pressable>
                            </View>
                          );
                        })
                      )}
                      <Pressable
                        onPress={() => {
                          setSelectedSemId(sem.id);
                          setAddCourseModal(true);
                        }}
                        style={[styles.addCourseBtn, { borderColor: colors.primary, borderRadius: 10 }]}
                      >
                        <Feather name="plus" size={16} color={colors.primary} />
                        <Text style={[{ color: colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 13 }]}>
                          Add Course
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </Pressable>
              ))}
          </>
        )}
      </ScrollView>

      {/* Add Semester Modal */}
      <Modal visible={addSemModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: colors.card, paddingBottom: insets.bottom + 16, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Add Semester
            </Text>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
              Season
            </Text>
            <View style={styles.seasonRow}>
              {SEASONS.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setSemSeason(s)}
                  style={[
                    styles.seasonBtn,
                    {
                      backgroundColor: semSeason === s ? colors.primary : colors.muted,
                      borderRadius: 10,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: semSeason === s ? "#fff" : colors.foreground,
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 14,
                    }}
                  >
                    {s}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
              Year
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {YEARS.map((y) => (
                <Pressable
                  key={y}
                  onPress={() => setSemYear(y)}
                  style={[
                    styles.yearBtn,
                    {
                      backgroundColor: semYear === y ? colors.primary : colors.muted,
                      borderRadius: 10,
                      marginRight: 8,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: semYear === y ? "#fff" : colors.foreground,
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 14,
                    }}
                  >
                    {y}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            {semError !== "" && (
              <View style={[styles.errorBox, { backgroundColor: colors.destructive + "15", borderColor: colors.destructive, borderRadius: 8 }]}>
                <Feather name="alert-circle" size={14} color={colors.destructive} />
                <Text style={[styles.errorText, { color: colors.destructive, fontFamily: "Inter_500Medium" }]}>
                  {semError}
                </Text>
              </View>
            )}
            <Pressable
              onPress={handleAddSemester}
              style={[styles.confirmFullBtn, { backgroundColor: colors.primary, borderRadius: 12 }]}
            >
              <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16 }}>
                Create Semester
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Add Course to Semester Modal */}
      <Modal visible={addCourseModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: colors.card, paddingBottom: insets.bottom + 16, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Add Course to {selectedSem?.name}
            </Text>

            <View style={[styles.toggleRow, { backgroundColor: colors.muted, borderRadius: 10 }]}>
              {["Select Course", "Custom Course"].map((label, i) => (
                <Pressable
                  key={label}
                  onPress={() => setUseCustom(i === 1)}
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

            {useCustom ? (
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 280 }}>
                <TextInput
                  value={customCode}
                  onChangeText={setCustomCode}
                  placeholder="Course Code (e.g. CSE115)"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.textInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular", borderRadius: 10 }]}
                  autoCapitalize="characters"
                />
                <TextInput
                  value={customTitle}
                  onChangeText={setCustomTitle}
                  placeholder="Course Title"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.textInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular", borderRadius: 10 }]}
                />
                <TextInput
                  value={customCredits}
                  onChangeText={setCustomCredits}
                  placeholder="Credits"
                  keyboardType="numeric"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.textInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular", borderRadius: 10 }]}
                />
                <GradeSelector value={grade} onChange={(g, p) => { setGrade(g); setGradePoints(p); }} />
              </ScrollView>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 320 }}>
                <View style={[styles.searchBox, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: 10, marginBottom: 8 }]}>
                  <Feather name="search" size={16} color={colors.mutedForeground} />
                  <TextInput
                    value={courseSearch}
                    onChangeText={setCourseSearch}
                    placeholder="Search course..."
                    placeholderTextColor={colors.mutedForeground}
                    style={[styles.searchInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                  />
                </View>
                {filteredCourses.slice(0, 15).map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => setSelectedCourseId(c.id)}
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
                      <Text style={[{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 13 }]}>
                        {c.code}
                      </Text>
                      <Text style={[{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 11 }]}>
                        {c.title} · {c.credits} cr
                      </Text>
                    </View>
                    {selectedCourseId === c.id && (
                      <Feather name="check-circle" size={16} color={colors.primary} />
                    )}
                  </Pressable>
                ))}
                <View style={{ marginTop: 8 }}>
                  <GradeSelector value={grade} onChange={(g, p) => { setGrade(g); setGradePoints(p); }} />
                </View>
              </ScrollView>
            )}

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
                onPress={resetAddCourse}
                style={[styles.cancelBtn, { borderColor: colors.border, borderRadius: 12 }]}
              >
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleAddCourse}
                style={[styles.confirmBtn, { backgroundColor: colors.primary, borderRadius: 12 }]}
              >
                <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold" }}>Add</Text>
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
  title: { fontSize: 26 },
  addBtn: { width: 46, height: 46, alignItems: "center", justifyContent: "center" },
  overallCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    gap: 24,
  },
  semStats: { flex: 1 },
  semStatVal: { fontSize: 28 },
  semStatLabel: { fontSize: 12 },
  semCard: {
    padding: 16,
    marginBottom: 10,
  },
  semCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  semName: { fontSize: 16 },
  semMeta: { fontSize: 12, marginTop: 2 },
  semGpaWrap: { alignItems: "center" },
  semGpa: { fontSize: 28 },
  semGpaLabel: { fontSize: 11 },
  expandedArea: { marginTop: 12 },
  divider: { height: 1, marginBottom: 12 },
  noCourses: { fontSize: 13, textAlign: "center", paddingVertical: 8 },
  courseItem: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  miniGrade: { width: 38, height: 30, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  addCourseBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    paddingVertical: 10,
    marginTop: 8,
  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    maxHeight: "90%",
  },
  modalHandle: { width: 40, height: 4, backgroundColor: "#ccc", borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  modalTitle: { fontSize: 20, marginBottom: 16 },
  fieldLabel: { fontSize: 13, marginBottom: 6, marginTop: 4 },
  seasonRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  seasonBtn: { flex: 1, paddingVertical: 10, alignItems: "center" },
  yearBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  confirmFullBtn: { paddingVertical: 14, alignItems: "center" },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, marginTop: 8, borderWidth: 1 },
  errorText: { fontSize: 13, flex: 1 },
  toggleRow: { flexDirection: "row", padding: 3, marginBottom: 12 },
  toggleBtn: { flex: 1, paddingVertical: 8, alignItems: "center" },
  textInput: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 8 },
  searchBox: { flexDirection: "row", alignItems: "center", borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8, gap: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  coursePickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 16 },
  cancelBtn: { flex: 1, borderWidth: 1, paddingVertical: 13, alignItems: "center" },
  confirmBtn: { flex: 2, paddingVertical: 13, alignItems: "center" },
});
