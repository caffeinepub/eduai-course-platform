import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Category,
  Course,
  LessonUpdate,
  Quiz,
  QuizQuestion,
  UserProfile,
} from "../backend";
import { useActor } from "./useActor";

export function useAllCourses() {
  const { actor, isFetching } = useActor();
  return useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCourses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCourse(courseId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Course>({
    queryKey: ["course", courseId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getCourse(courseId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useQuiz(courseId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Quiz | null>({
    queryKey: ["quiz", courseId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getQuiz(courseId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchCourses(term: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Course[]>({
    queryKey: ["search", term],
    queryFn: async () => {
      if (!actor || !term.trim()) return [];
      return actor.searchCoursesByTitle(term);
    },
    enabled: !!actor && !isFetching && term.trim().length > 0,
  });
}

export function useCreateCourse() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      title: string;
      description: string;
      categoryId: bigint;
      lessons: LessonUpdate[];
      quizQuestions: QuizQuestion[];
    }) => {
      if (!actor) throw new Error("Not authenticated");
      const courseId = await actor.createCourse(
        params.title,
        params.description,
        params.categoryId,
        null,
      );
      for (const lesson of params.lessons) {
        await actor.createLesson({ ...lesson, courseId });
      }
      if (params.quizQuestions.length > 0) {
        await actor.createQuiz(courseId, params.quizQuestions);
      }
      return courseId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useCreateCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createCategory(name);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteCategory(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCourse() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteCourse(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useDeleteUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (principal: string) => {
      if (!actor) throw new Error("Not authenticated");
      // Principal import needed
      const { Principal } = await import("@icp-sdk/core/principal");
      return actor.deleteUser(Principal.fromText(principal));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}
