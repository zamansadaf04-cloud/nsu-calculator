import React, { useState } from "react";
import {
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
import { GradeSelector } from "@/components/GradeSelector";
import { getGradeColor, GRADE_SCALE } from "@/constants/nsuData";

type TabType = "goal" | "retake";

export default function CalculatorsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, cgpa, totalCredits, totalGradePoints, setTargetCGPA, setTargetCredits } = useData();
  const [activeTab, setActiveTab] = useState<TabType>("goal");

  // Goal calculator
  const [goalCurrentCGPA, setGoalCurrentCGPA] = useState(cgpa.toFixed(2));
  const [goalCurrentCredits, setGoalCurrentCredits] = useState(totalCredits.toString());
  const [goalTargetCGPA, setGoalTargetCGPA] = useState((data.targetCGPA ?? 3.5).toString());
  const [goalTotalCredits, setGoalTotalCredits] = useState((data.targetCredits ?? 130).toString());
  const [goalResult, setGoalResult] = useState<null | { required: number; remaining: number; message: string }>(null);

  // Retake calculator
  const [retakeCredits, setRetakeCredits] = useState("3");
  const [oldGrade, setOldGrade] = useState("");
  const [oldGradePoints, setOldGradePoints] = useState(0);
  const [newGrade, setNewGrade] = useState("");
  const [newGradePoints, setNewGradePoints] = useState(0);
  const [retakeResult, setRetakeResult] = useState<null | { newCGPA: number; diff: number; message: string }>(null);

  function calculateGoal() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const currentCGPA = parseFloat(goalCurrentCGPA) || 0;
    const currentCredits = parseFloat(goalCurrentCredits) || 0;
    const targetCGPA = parseFloat(goalTargetCGPA) || 3.5;
    const totalCreditGoal = parseFloat(goalTotalCredits) || 130;
    const remaining = totalCreditGoal - currentCredits;

    if (remaining <= 0) {
      setGoalResult({ required: 0, remaining: 0, message: "You have already completed the required credits." });
      return;
    }

    const currentPoints = currentCGPA * currentCredits;
    const neededTotal = targetCGPA * totalCreditGoal;
    const needed = (neededTotal - currentPoints) / remaining;

    let message = "";
    if (needed > 4.0) {
      message = "This target is not achievable with the remaining credits.";
    } else if (needed <= 0) {
      message = "You have already met your CGPA target!";
    } else if (needed >= 3.7) {
      message = `You need an average of A (${needed.toFixed(2)}) in every remaining course.`;
    } else if (needed >= 3.3) {
      message = `You need an average of A- (${needed.toFixed(2)}) in remaining courses.`;
    } else if (needed >= 3.0) {
      message = `You need an average of B+ (${needed.toFixed(2)}) in remaining courses.`;
    } else if (needed >= 2.0) {
      message = `A B average (${needed.toFixed(2)}) in remaining courses will get you there.`;
    } else {
      message = `Just a C average (${needed.toFixed(2)}) will reach your goal!`;
    }

    setGoalResult({ required: needed, remaining, message });
    setTargetCGPA(targetCGPA);
    setTargetCredits(totalCreditGoal);
  }

  function calculateRetake() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!oldGrade || !newGrade) return;
    const credits = parseFloat(retakeCredits) || 3;

    const oldTotalPoints = totalGradePoints;
    const newTotalPoints = oldTotalPoints - oldGradePoints * credits + newGradePoints * credits;
    const newCGPA = totalCredits > 0 ? newTotalPoints / totalCredits : 0;
    const diff = newCGPA - cgpa;

    let message = "";
    if (diff > 0) {
      message = `Your CGPA will improve by ${diff.toFixed(2)} after the retake.`;
    } else if (diff < 0) {
      message = `Your CGPA will decrease by ${Math.abs(diff).toFixed(2)}.`;
    } else {
      message = "Your CGPA remains unchanged after the retake.";
    }

    setRetakeResult({ newCGPA, diff, message });
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
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold", marginBottom: 20 }]}>
          Calculators
        </Text>

        {/* Tabs */}
        <View style={[styles.tabRow, { backgroundColor: colors.muted, borderRadius: 12 }]}>
          {(["goal", "retake"] as TabType[]).map((t) => (
            <Pressable
              key={t}
              onPress={() => setActiveTab(t)}
              style={[
                styles.tabBtn,
                {
                  backgroundColor: activeTab === t ? colors.card : "transparent",
                  borderRadius: 10,
                },
              ]}
            >
              <Feather
                name={t === "goal" ? "target" : "refresh-cw"}
                size={15}
                color={activeTab === t ? colors.primary : colors.mutedForeground}
              />
              <Text
                style={{
                  color: activeTab === t ? colors.primary : colors.mutedForeground,
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 13,
                  marginLeft: 6,
                }}
              >
                {t === "goal" ? "CGPA Goal" : "Retake Planner"}
              </Text>
            </Pressable>
          ))}
        </View>

        {activeTab === "goal" ? (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              CGPA Goal Calculator
            </Text>
            <Text style={[styles.cardDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Find out what GPA you need in future courses to reach your target CGPA.
            </Text>

            <View style={styles.inputGrid}>
              <View style={styles.inputHalf}>
                <Text style={[styles.inputLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                  Current CGPA
                </Text>
                <TextInput
                  value={goalCurrentCGPA}
                  onChangeText={setGoalCurrentCGPA}
                  keyboardType="decimal-pad"
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular", borderRadius: 10 }]}
                  placeholder="e.g. 3.00"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
              <View style={styles.inputHalf}>
                <Text style={[styles.inputLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                  Credits Completed
                </Text>
                <TextInput
                  value={goalCurrentCredits}
                  onChangeText={setGoalCurrentCredits}
                  keyboardType="numeric"
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular", borderRadius: 10 }]}
                  placeholder="e.g. 60"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
              <View style={styles.inputHalf}>
                <Text style={[styles.inputLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                  Target CGPA
                </Text>
                <TextInput
                  value={goalTargetCGPA}
                  onChangeText={setGoalTargetCGPA}
                  keyboardType="decimal-pad"
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular", borderRadius: 10 }]}
                  placeholder="e.g. 3.50"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
              <View style={styles.inputHalf}>
                <Text style={[styles.inputLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                  Total Credits (Degree)
                </Text>
                <TextInput
                  value={goalTotalCredits}
                  onChangeText={setGoalTotalCredits}
                  keyboardType="numeric"
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular", borderRadius: 10 }]}
                  placeholder="e.g. 130"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
            </View>

            <Pressable
              onPress={calculateGoal}
              style={({ pressed }) => [
                styles.calcBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1, borderRadius: 12 },
              ]}
            >
              <Feather name="target" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16, marginLeft: 8 }}>
                Calculate
              </Text>
            </Pressable>

            {goalResult !== null && (
              <View
                style={[
                  styles.resultBox,
                  {
                    backgroundColor:
                      goalResult.required > 4.0
                        ? colors.destructive + "15"
                        : goalResult.required <= 0
                        ? colors.success + "15"
                        : colors.primary + "12",
                    borderRadius: 12,
                    borderColor:
                      goalResult.required > 4.0
                        ? colors.destructive
                        : goalResult.required <= 0
                        ? colors.success
                        : colors.primary,
                  },
                ]}
              >
                {goalResult.required > 0 && goalResult.required <= 4.0 && (
                  <Text style={[styles.resultNum, { color: getGradeColor(goalResult.required), fontFamily: "Inter_700Bold" }]}>
                    {goalResult.required.toFixed(2)}
                  </Text>
                )}
                {goalResult.required > 4.0 && (
                  <Feather name="alert-circle" size={32} color={colors.destructive} />
                )}
                {goalResult.required <= 0 && (
                  <Feather name="check-circle" size={32} color={colors.success} />
                )}
                <Text
                  style={[
                    styles.resultMsg,
                    {
                      color:
                        goalResult.required > 4.0
                          ? colors.destructive
                          : goalResult.required <= 0
                          ? colors.success
                          : colors.primary,
                      fontFamily: "Inter_500Medium",
                    },
                  ]}
                >
                  {goalResult.message}
                </Text>
                {goalResult.remaining > 0 && (
                  <Text style={[{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 4 }]}>
                    {goalResult.remaining} credits remaining
                  </Text>
                )}
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Retake Calculator
            </Text>
            <Text style={[styles.cardDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              See how retaking a course affects your CGPA. Retake replaces the old grade.
            </Text>

            <View style={[styles.currentCGPABox, { backgroundColor: colors.muted, borderRadius: 12 }]}>
              <Text style={[{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13 }]}>
                Current CGPA
              </Text>
              <Text style={[{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 28 }]}>
                {cgpa > 0 ? cgpa.toFixed(2) : "—"}
              </Text>
              <Text style={[{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12 }]}>
                {totalCredits} credits · {data.completedCourses.length} courses
              </Text>
            </View>

            <Text style={[styles.inputLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
              Course Credits
            </Text>
            <TextInput
              value={retakeCredits}
              onChangeText={setRetakeCredits}
              keyboardType="numeric"
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular", borderRadius: 10, marginBottom: 12 }]}
              placeholder="e.g. 3"
              placeholderTextColor={colors.mutedForeground}
            />

            <View style={styles.gradeRow}>
              <View style={styles.gradeHalf}>
                <Text style={[styles.inputLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                  Old Grade
                </Text>
                <GradeSelector
                  value={oldGrade}
                  onChange={(g, p) => { setOldGrade(g); setOldGradePoints(p); setRetakeResult(null); }}
                />
              </View>
              <Feather name="arrow-right" size={20} color={colors.mutedForeground} style={{ marginTop: 24 }} />
              <View style={styles.gradeHalf}>
                <Text style={[styles.inputLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                  New Grade
                </Text>
                <GradeSelector
                  value={newGrade}
                  onChange={(g, p) => { setNewGrade(g); setNewGradePoints(p); setRetakeResult(null); }}
                />
              </View>
            </View>

            <Pressable
              onPress={calculateRetake}
              disabled={!oldGrade || !newGrade || cgpa === 0}
              style={({ pressed }) => [
                styles.calcBtn,
                {
                  backgroundColor: !oldGrade || !newGrade || cgpa === 0 ? colors.muted : colors.primary,
                  opacity: pressed ? 0.8 : 1,
                  borderRadius: 12,
                },
              ]}
            >
              <Feather name="refresh-cw" size={18} color={!oldGrade || !newGrade || cgpa === 0 ? colors.mutedForeground : "#fff"} />
              <Text
                style={{
                  color: !oldGrade || !newGrade || cgpa === 0 ? colors.mutedForeground : "#fff",
                  fontFamily: "Inter_700Bold",
                  fontSize: 16,
                  marginLeft: 8,
                }}
              >
                Calculate Retake
              </Text>
            </Pressable>

            {cgpa === 0 && (
              <Text style={[{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12, textAlign: "center", marginTop: 8 }]}>
                Add completed courses on the Dashboard first.
              </Text>
            )}

            {retakeResult !== null && (
              <View
                style={[
                  styles.resultBox,
                  {
                    backgroundColor:
                      retakeResult.diff > 0
                        ? colors.success + "15"
                        : retakeResult.diff < 0
                        ? colors.destructive + "15"
                        : colors.muted,
                    borderRadius: 12,
                    borderColor:
                      retakeResult.diff > 0
                        ? colors.success
                        : retakeResult.diff < 0
                        ? colors.destructive
                        : colors.border,
                  },
                ]}
              >
                <CGPACircle cgpa={retakeResult.newCGPA} size={100} label="New CGPA" />
                <View style={styles.diffRow}>
                  <Feather
                    name={retakeResult.diff > 0 ? "trending-up" : retakeResult.diff < 0 ? "trending-down" : "minus"}
                    size={18}
                    color={retakeResult.diff > 0 ? colors.success : retakeResult.diff < 0 ? colors.destructive : colors.mutedForeground}
                  />
                  <Text
                    style={{
                      color: retakeResult.diff > 0 ? colors.success : retakeResult.diff < 0 ? colors.destructive : colors.mutedForeground,
                      fontFamily: "Inter_700Bold",
                      fontSize: 18,
                      marginLeft: 6,
                    }}
                  >
                    {retakeResult.diff > 0 ? "+" : ""}{retakeResult.diff.toFixed(2)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.resultMsg,
                    {
                      color:
                        retakeResult.diff > 0
                          ? colors.success
                          : retakeResult.diff < 0
                          ? colors.destructive
                          : colors.foreground,
                      fontFamily: "Inter_500Medium",
                    },
                  ]}
                >
                  {retakeResult.message}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16 },
  title: { fontSize: 26 },
  tabRow: { flexDirection: "row", padding: 4, marginBottom: 16, gap: 4 },
  tabBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10 },
  card: { padding: 20, borderWidth: 1, gap: 12 },
  cardTitle: { fontSize: 18 },
  cardDesc: { fontSize: 13, lineHeight: 19 },
  inputGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  inputHalf: { width: "47%" },
  inputLabel: { fontSize: 12, marginBottom: 6 },
  input: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  calcBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginTop: 4,
  },
  resultBox: {
    padding: 20,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    marginTop: 4,
  },
  resultNum: { fontSize: 48 },
  resultMsg: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  currentCGPABox: { padding: 16, alignItems: "center", gap: 4, marginBottom: 4 },
  gradeRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 },
  gradeHalf: { flex: 1 },
  diffRow: { flexDirection: "row", alignItems: "center" },
});
