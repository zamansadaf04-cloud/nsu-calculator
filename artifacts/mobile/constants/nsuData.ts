import { Course } from "@/types";

export const GRADE_SCALE: { grade: string; points: number; label: string }[] = [
  { grade: "A", points: 4.0, label: "A (4.00)" },
  { grade: "A-", points: 3.7, label: "A- (3.70)" },
  { grade: "B+", points: 3.3, label: "B+ (3.30)" },
  { grade: "B", points: 3.0, label: "B (3.00)" },
  { grade: "B-", points: 2.7, label: "B- (2.70)" },
  { grade: "C+", points: 2.3, label: "C+ (2.30)" },
  { grade: "C", points: 2.0, label: "C (2.00)" },
  { grade: "C-", points: 1.7, label: "C- (1.70)" },
  { grade: "D+", points: 1.3, label: "D+ (1.30)" },
  { grade: "D", points: 1.0, label: "D (1.00)" },
  { grade: "F", points: 0.0, label: "F (0.00)" },
];

export function getGradePoints(grade: string): number {
  const found = GRADE_SCALE.find((g) => g.grade === grade);
  return found ? found.points : 0;
}

export function getGradeLabel(cgpa: number): string {
  if (cgpa >= 3.7) return "A";
  if (cgpa >= 3.3) return "A-";
  if (cgpa >= 3.0) return "B+";
  if (cgpa >= 2.7) return "B";
  if (cgpa >= 2.3) return "B-";
  if (cgpa >= 2.0) return "C+";
  if (cgpa >= 1.7) return "C";
  if (cgpa >= 1.3) return "C-";
  if (cgpa >= 1.0) return "D+";
  if (cgpa >= 0.5) return "D";
  return "F";
}

export function getGradeColor(cgpa: number): string {
  if (cgpa >= 3.7) return "#10B981";
  if (cgpa >= 3.3) return "#34D399";
  if (cgpa >= 3.0) return "#60A5FA";
  if (cgpa >= 2.7) return "#818CF8";
  if (cgpa >= 2.3) return "#F59E0B";
  if (cgpa >= 2.0) return "#FB923C";
  if (cgpa >= 1.0) return "#F87171";
  return "#EF4444";
}

export const DEPARTMENTS = [
  "CSE",
  "MAT",
  "ENG",
  "EEE",
  "SOC",
  "HIS",
  "PHY",
  "CHE",
  "BBA",
  "ECO",
  "Other",
];

export const NSU_COURSES: Course[] = [
  { id: "cse115", code: "CSE115", title: "Programming Language I", credits: 3, department: "CSE" },
  { id: "cse115l", code: "CSE115L", title: "Programming Language I Lab", credits: 1, department: "CSE" },
  { id: "cse173", code: "CSE173", title: "Discrete Mathematics", credits: 3, department: "CSE" },
  { id: "cse215", code: "CSE215", title: "Programming Language II", credits: 3, department: "CSE" },
  { id: "cse215l", code: "CSE215L", title: "Programming Language II Lab", credits: 1, department: "CSE" },
  { id: "cse225", code: "CSE225", title: "Data Structures", credits: 3, department: "CSE" },
  { id: "cse225l", code: "CSE225L", title: "Data Structures Lab", credits: 1, department: "CSE" },
  { id: "cse311", code: "CSE311", title: "Computer Architecture", credits: 3, department: "CSE" },
  { id: "cse323", code: "CSE323", title: "Algorithms", credits: 3, department: "CSE" },
  { id: "cse327", code: "CSE327", title: "Software Engineering", credits: 3, department: "CSE" },
  { id: "cse332", code: "CSE332", title: "Computer Networks", credits: 3, department: "CSE" },
  { id: "cse373", code: "CSE373", title: "Database Systems", credits: 3, department: "CSE" },
  { id: "cse373l", code: "CSE373L", title: "Database Systems Lab", credits: 1, department: "CSE" },
  { id: "cse489", code: "CSE489", title: "Artificial Intelligence", credits: 3, department: "CSE" },
  { id: "cse499a", code: "CSE499A", title: "Senior Design Project I", credits: 1, department: "CSE" },
  { id: "cse499b", code: "CSE499B", title: "Senior Design Project II", credits: 3, department: "CSE" },
  { id: "mat116", code: "MAT116", title: "Pre-Calculus", credits: 3, department: "MAT" },
  { id: "mat120", code: "MAT120", title: "Calculus I", credits: 3, department: "MAT" },
  { id: "mat125", code: "MAT125", title: "Linear Algebra", credits: 3, department: "MAT" },
  { id: "mat140", code: "MAT140", title: "Calculus II", credits: 3, department: "MAT" },
  { id: "mat210", code: "MAT210", title: "Probability and Statistics", credits: 3, department: "MAT" },
  { id: "eng102", code: "ENG102", title: "Composition I", credits: 3, department: "ENG" },
  { id: "eng103", code: "ENG103", title: "Composition II", credits: 3, department: "ENG" },
  { id: "eng115", code: "ENG115", title: "Professional English", credits: 3, department: "ENG" },
  { id: "eee154", code: "EEE154", title: "Introduction to Electrical Engineering Lab", credits: 1, department: "EEE" },
  { id: "eee203", code: "EEE203", title: "Electrical Circuit Analysis", credits: 3, department: "EEE" },
  { id: "soc101", code: "SOC101", title: "Introduction to Sociology", credits: 3, department: "SOC" },
  { id: "his101", code: "HIS101", title: "History of Bengal", credits: 3, department: "HIS" },
  { id: "phi105", code: "PHI105", title: "Introduction to Philosophy", credits: 3, department: "Other" },
  { id: "env101", code: "ENV101", title: "Introduction to Environmental Science", credits: 3, department: "Other" },
];
