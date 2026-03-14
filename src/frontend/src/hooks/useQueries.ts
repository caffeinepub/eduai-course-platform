import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Category,
  CommunityComment,
  CommunityPostView,
  Course,
  Lesson,
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

export function useLessonsForCourse(courseId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Lesson[]>({
    queryKey: ["lessons", courseId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLessonsForCourse(courseId);
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

export function useAllPosts() {
  const { actor, isFetching } = useActor();
  return useQuery<CommunityPostView[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePost(id: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<CommunityPostView | null>({
    queryKey: ["post", id.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPost(id);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCommentsForPost(postId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<CommunityComment[]>({
    queryKey: ["comments", postId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCommentsForPost(postId);
    },
    enabled: !!actor && !isFetching,
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

export function useCreatePost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { title: string; body: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createPost(params.title, params.body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useDeletePost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deletePost(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useCreateComment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { postId: bigint; body: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createComment(params.postId, params.body);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["comments", vars.postId.toString()] });
    },
  });
}

export function useDeleteComment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { commentId: bigint; postId: bigint }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteComment(params.commentId);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["comments", vars.postId.toString()] });
    },
  });
}

export function useLikePost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.likePost(postId);
    },
    onSuccess: (_data, postId) => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["post", postId.toString()] });
    },
  });
}

export function useUnlikePost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.unlikePost(postId);
    },
    onSuccess: (_data, postId) => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["post", postId.toString()] });
    },
  });
}
