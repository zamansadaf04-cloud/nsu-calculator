import React, { useState } from "react";
import {
  Alert,
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
import { EmptyState } from "@/components/EmptyState";
import { Course } from "@/types";
import { DEPARTMENTS, NSU_COURSES } from "@/constants/nsuData";

function genId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export default function CoursesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, addCustomCourse, removeCustomCourse } = useData();

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [addModal, setAddModal] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newCredits, setNewCredits] = useState("3");
  const [newDept, setNewDept] = useState("CSE");

  const allCourses = [...NSU_COURSES, ...data.customCourses];
  const filtered = allCourses.filter((c) => {
    const matchSearch =
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "All" || c.department === deptFilter;
    return matchSearch && matchDept;
  });

  const depts = ["All", ...DEPARTMENTS];

  function handleAdd() {
    if (!newCode.trim() || !newTitle.trim()) {
      Alert.alert("Missing Info", "Please enter course code and title.");
      return;
    }
    const credits = parseFloat(newCredits) || 3;
    const course: Course = {
      id: genId(),
      code: newCode.trim().toUpperCase(),
      title: newTitle.trim(),
      credits,
      department: newDept,
      isCustom: true,
    };
    addCustomCourse(course);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setAddModal(false);
    setNewCode("");
    setNewTitle("");
    setNewCredits("3");
    setNewDept("CSE");
  }

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
            Course Database
          </Text>
          <Pressable
            onPress={() => setAddModal(true)}
            style={({ pressed }) => [
              styles.addBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1, borderRadius: 14 },
            ]}
          >
            <Feather name="plus" size={22} color="#fff" />
          </Pressable>
        </View>

        {/* Search */}
        <View
          style={[
            styles.searchBox,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
          ]}
        >
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by code or title..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        {/* Dept Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.deptScroll}
          contentContainerStyle={styles.deptContent}
        >
          {depts.map((d) => (
            <Pressable
              key={d}
              onPress={() => setDeptFilter(d)}
              style={[
                styles.deptChip,
                {
                  backgroundColor: deptFilter === d ? colors.primary : colors.muted,
                  borderRadius: 20,
                },
              ]}
            >
              <Text
                style={{
                  color: deptFilter === d ? "#fff" : colors.mutedForeground,
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 12,
                }}
              >
                {d}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Count */}
        <Text style={[styles.countText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {filtered.length} course{filtered.length !== 1 ? "s" : ""} · {data.customCourses.length} custom
        </Text>

        {filtered.length === 0 ? (
          <EmptyState
            icon="database"
            title="No courses found"
            description="Try a different search or add a custom course."
          />
        ) : (
          filtered.map((course) => {
            const isCustom = !!course.isCustom;
            return (
              <Pressable
                key={course.id}
                onLongPress={() => {
                  if (!isCustom) return;
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  Alert.alert("Delete Course", `Delete ${course.code}?`, [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => removeCustomCourse(course.id),
                    },
                  ]);
                }}
                style={[
                  styles.courseCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: isCustom ? colors.accent + "60" : colors.border,
                    borderRadius: colors.radius,
                    borderWidth: isCustom ? 1.5 : 1,
                  },
                ]}
              >
                <View style={styles.courseTop}>
                  <View style={[styles.codeBadge, { backgroundColor: colors.primary + "18", borderRadius: 8 }]}>
                    <Text style={[styles.codeText, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                      {course.code}
                    </Text>
                  </View>
                  <View style={styles.courseMeta}>
                    <View style={[styles.creditBadge, { backgroundColor: colors.muted, borderRadius: 6 }]}>
                      <Text style={[styles.creditBadgeText, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                        {course.credits} cr
                      </Text>
                    </View>
                    {isCustom && (
                      <View style={[styles.customBadge, { backgroundColor: colors.accent + "20", borderRadius: 6 }]}>
                        <Text style={[styles.customBadgeText, { color: colors.accent, fontFamily: "Inter_600SemiBold" }]}>
                          Custom
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text
                  style={[styles.courseTitle, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}
                  numberOfLines={2}
                >
                  {course.title}
                </Text>
                <Text style={[styles.courseDept, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {course.department}
                </Text>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      {/* Add Custom Course Modal */}
      <Modal visible={addModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: colors.card, paddingBottom: insets.bottom + 16, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Add Custom Course
            </Text>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
              Course Code
            </Text>
            <TextInput
              value={newCode}
              onChangeText={setNewCode}
              placeholder="e.g. CSE115"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.textInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular", borderRadius: 10 }]}
              autoCapitalize="characters"
            />

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
              Course Title
            </Text>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="e.g. Programming Language I"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.textInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular", borderRadius: 10 }]}
            />

            <View style={styles.halfRow}>
              <View style={styles.halfInput}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                  Credits
                </Text>
                <TextInput
                  value={newCredits}
                  onChangeText={setNewCredits}
                  placeholder="3"
                  keyboardType="numeric"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.textInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular", borderRadius: 10 }]}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                  Department
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 2 }}>
                  {DEPARTMENTS.map((d) => (
                    <Pressable
                      key={d}
                      onPress={() => setNewDept(d)}
                      style={[
                        styles.deptChip,
                        {
                          backgroundColor: newDept === d ? colors.primary : colors.muted,
                          borderRadius: 20,
                          marginRight: 6,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: newDept === d ? "#fff" : colors.mutedForeground,
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 11,
                        }}
                      >
                        {d}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={[styles.modalActions, { marginTop: 8 }]}>
              <Pressable
                onPress={() => setAddModal(false)}
                style={[styles.cancelBtn, { borderColor: colors.border, borderRadius: 12 }]}
              >
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleAdd}
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
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 26 },
  addBtn: { width: 46, height: 46, alignItems: "center", justifyContent: "center" },
  searchBox: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, gap: 8, borderWidth: 1, marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 14 },
  deptScroll: { marginBottom: 12 },
  deptContent: { gap: 8 },
  deptChip: { paddingHorizontal: 14, paddingVertical: 7 },
  countText: { fontSize: 12, marginBottom: 12 },
  courseCard: { padding: 14, marginBottom: 8 },
  courseTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  codeBadge: { paddingHorizontal: 10, paddingVertical: 5 },
  codeText: { fontSize: 13 },
  courseMeta: { flexDirection: "row", gap: 6 },
  creditBadge: { paddingHorizontal: 8, paddingVertical: 4 },
  creditBadgeText: { fontSize: 11 },
  customBadge: { paddingHorizontal: 8, paddingVertical: 4 },
  customBadgeText: { fontSize: 11 },
  courseTitle: { fontSize: 14, lineHeight: 20, marginBottom: 4 },
  courseDept: { fontSize: 11 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    maxHeight: "85%",
  },
  modalHandle: { width: 40, height: 4, backgroundColor: "#ccc", borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  modalTitle: { fontSize: 20, marginBottom: 16 },
  fieldLabel: { fontSize: 13, marginBottom: 6, marginTop: 4 },
  textInput: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 4 },
  halfRow: { flexDirection: "row", gap: 12 },
  halfInput: { flex: 1 },
  modalActions: { flexDirection: "row", gap: 10 },
  cancelBtn: { flex: 1, borderWidth: 1, paddingVertical: 13, alignItems: "center" },
  confirmBtn: { flex: 2, paddingVertical: 13, alignItems: "center" },
});
