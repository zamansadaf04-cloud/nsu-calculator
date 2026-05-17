export interface Course {
  id: string;
  code: string;
  title: string;
  credits: number;
  department: string;
  isCustom?: boolean;
}

export interface SemesterCourse {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
  grade: string;
  gradePoints: number;
}

export interface Semester {
  id: string;
  name: string;
  year: number;
  season: "Spring" | "Summer" | "Fall";
  courses: SemesterCourse[];
  gpa: number;
  totalCredits: number;
}

export interface CompletedCourse {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
  grade: string;
  gradePoints: number;
  semesterId?: string;
}

export interface AppData {
  completedCourses: CompletedCourse[];
  semesters: Semester[];
  customCourses: Course[];
  targetCGPA: number;
  targetCredits: number;
}
