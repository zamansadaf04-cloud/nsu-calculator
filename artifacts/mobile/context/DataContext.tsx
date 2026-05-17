import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AppData, CompletedCourse, Course, Semester, SemesterCourse } from "@/types";
import { getGradePoints, NSU_COURSES } from "@/constants/nsuData";

const STORAGE_KEY = "@nsu_metrics_data_v2";

const defaultData: AppData = {
  completedCourses: [],
  semesters: [],
  customCourses: [],
  targetCGPA: 3.5,
  targetCredits: 130,
};

interface DataContextType {
  data: AppData;
  cgpa: number;
  totalCredits: number;
  totalGradePoints: number;
  allCourses: Course[];
  addCompletedCourse: (course: CompletedCourse) => void;
  removeCompletedCourse: (id: string) => void;
  updateCompletedCourse: (id: string, updates: Partial<CompletedCourse>) => void;
  addSemester: (semester: Semester) => void;
  updateSemester: (id: string, updates: Partial<Semester>) => void;
  deleteSemester: (id: string) => void;
  addCourseToSemester: (semesterId: string, course: SemesterCourse) => void;
  removeCourseFromSemester: (semesterId: string, courseId: string) => void;
  updateCourseInSemester: (semesterId: string, courseId: string, updates: Partial<SemesterCourse>) => void;
  addCustomCourse: (course: Course) => void;
  removeCustomCourse: (id: string) => void;
  setTargetCGPA: (cgpa: number) => void;
  setTargetCredits: (credits: number) => void;
  exportData: () => string;
  importData: (json: string) => boolean;
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function calcSemesterGPA(courses: SemesterCourse[]): { gpa: number; totalCredits: number } {
  if (courses.length === 0) return { gpa: 0, totalCredits: 0 };
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const totalPoints = courses.reduce((sum, c) => sum + c.gradePoints * c.credits, 0);
  return { gpa: totalCredits > 0 ? totalPoints / totalCredits : 0, totalCredits };
}

function buildCGPA(courses: CompletedCourse[]): { cgpa: number; totalCredits: number; totalGradePoints: number } {
  if (courses.length === 0) return { cgpa: 0, totalCredits: 0, totalGradePoints: 0 };
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const totalGradePoints = courses.reduce((sum, c) => sum + c.gradePoints * c.credits, 0);
  return {
    cgpa: totalCredits > 0 ? totalGradePoints / totalCredits : 0,
    totalCredits,
    totalGradePoints,
  };
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as AppData;
          setData({ ...defaultData, ...parsed });
        } catch {
          setData(defaultData);
        }
      }
      setLoading(false);
    });
  }, []);

  const save = useCallback((newData: AppData) => {
    setData(newData);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  }, []);

  const { cgpa, totalCredits, totalGradePoints } = buildCGPA(data.completedCourses);
  const allCourses = [...NSU_COURSES, ...data.customCourses];

  const addCompletedCourse = useCallback((course: CompletedCourse) => {
    setData((prev) => {
      const next = { ...prev, completedCourses: [...prev.completedCourses, course] };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeCompletedCourse = useCallback((id: string) => {
    setData((prev) => {
      const next = { ...prev, completedCourses: prev.completedCourses.filter((c) => c.id !== id) };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateCompletedCourse = useCallback((id: string, updates: Partial<CompletedCourse>) => {
    setData((prev) => {
      const next = {
        ...prev,
        completedCourses: prev.completedCourses.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addSemester = useCallback((semester: Semester) => {
    setData((prev) => {
      const next = { ...prev, semesters: [...prev.semesters, semester] };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateSemester = useCallback((id: string, updates: Partial<Semester>) => {
    setData((prev) => {
      const next = {
        ...prev,
        semesters: prev.semesters.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteSemester = useCallback((id: string) => {
    setData((prev) => {
      const next = { ...prev, semesters: prev.semesters.filter((s) => s.id !== id) };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addCourseToSemester = useCallback((semesterId: string, course: SemesterCourse) => {
    setData((prev) => {
      const next = {
        ...prev,
        semesters: prev.semesters.map((s) => {
          if (s.id !== semesterId) return s;
          const courses = [...s.courses, course];
          const { gpa, totalCredits } = calcSemesterGPA(courses);
          return { ...s, courses, gpa, totalCredits };
        }),
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeCourseFromSemester = useCallback((semesterId: string, courseId: string) => {
    setData((prev) => {
      const next = {
        ...prev,
        semesters: prev.semesters.map((s) => {
          if (s.id !== semesterId) return s;
          const courses = s.courses.filter((c) => c.id !== courseId);
          const { gpa, totalCredits } = calcSemesterGPA(courses);
          return { ...s, courses, gpa, totalCredits };
        }),
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateCourseInSemester = useCallback(
    (semesterId: string, courseId: string, updates: Partial<SemesterCourse>) => {
      setData((prev) => {
        const next = {
          ...prev,
          semesters: prev.semesters.map((s) => {
            if (s.id !== semesterId) return s;
            const courses = s.courses.map((c) => (c.id === courseId ? { ...c, ...updates } : c));
            const { gpa, totalCredits } = calcSemesterGPA(courses);
            return { ...s, courses, gpa, totalCredits };
          }),
        };
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const addCustomCourse = useCallback((course: Course) => {
    setData((prev) => {
      const next = { ...prev, customCourses: [...prev.customCourses, course] };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeCustomCourse = useCallback((id: string) => {
    setData((prev) => {
      const next = { ...prev, customCourses: prev.customCourses.filter((c) => c.id !== id) };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setTargetCGPA = useCallback((targetCGPA: number) => {
    setData((prev) => {
      const next = { ...prev, targetCGPA };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setTargetCredits = useCallback((targetCredits: number) => {
    setData((prev) => {
      const next = { ...prev, targetCredits };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const exportData = useCallback((): string => {
    return JSON.stringify(data, null, 2);
  }, [data]);

  const importData = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json) as AppData;
      if (!parsed.completedCourses || !parsed.semesters) return false;
      save(parsed);
      return true;
    } catch {
      return false;
    }
  }, [save]);

  const resetData = useCallback(() => {
    save(defaultData);
  }, [save]);

  if (loading) return null;

  return (
    <DataContext.Provider
      value={{
        data,
        cgpa,
        totalCredits,
        totalGradePoints,
        allCourses,
        addCompletedCourse,
        removeCompletedCourse,
        updateCompletedCourse,
        addSemester,
        updateSemester,
        deleteSemester,
        addCourseToSemester,
        removeCourseFromSemester,
        updateCourseInSemester,
        addCustomCourse,
        removeCustomCourse,
        setTargetCGPA,
        setTargetCredits,
        exportData,
        importData,
        resetData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}
