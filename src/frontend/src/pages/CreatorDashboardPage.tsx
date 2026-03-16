import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, GraduationCap, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Course, Lesson, Quiz } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import type { ThemeConfig } from "../utils/seasonalTheme";

interface CreatorDashboardPageProps {
  theme: ThemeConfig;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  isLoggedIn: boolean;
}

interface CourseWithMeta {
  course: Course;
  lessons: Lesson[];
  quiz: Quiz | null;
}

function CourseCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      <Skeleton className="h-44 w-full" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-16" />
        </div>
      </div>
    </div>
  );
}

export default function CreatorDashboardPage({
  theme,
  onNavigate,
  isLoggedIn,
}: CreatorDashboardPageProps) {
  const { identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const myPrincipal = identity?.getPrincipal().toString();

  const { data: myCourses, isLoading } = useQuery<CourseWithMeta[]>({
    queryKey: ["my-courses", myPrincipal],
    queryFn: async () => {
      if (!actor || !myPrincipal) return [];
      const all = await actor.getAllCourses();
      const mine = all.filter((c) => c.creator.toString() === myPrincipal);
      const withMeta = await Promise.all(
        mine.map(async (course) => {
          const [lessons, quiz] = await Promise.all([
            actor.getLessonsForCourse(course.id),
            actor.getQuiz(course.id),
          ]);
          return { course, lessons, quiz };
        }),
      );
      return withMeta;
    },
    enabled: !!actor && !isFetching && !!myPrincipal,
  });

  const handleDelete = async (courseId: bigint) => {
    if (!actor) return;
    const idStr = courseId.toString();
    setDeletingId(idStr);
    try {
      await actor.deleteCourse(courseId);
      qc.invalidateQueries({ queryKey: ["my-courses"] });
      qc.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course deleted successfully");
    } catch {
      toast.error("Failed to delete course");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  if (!isLoggedIn) {
    return (
      <main
        data-ocid="creator_dashboard.page"
        className="max-w-2xl mx-auto px-4 py-24 text-center"
      >
        <GraduationCap className="w-16 h-16 mx-auto mb-6 opacity-20" />
        <h2 className="font-display text-2xl font-bold text-foreground mb-3">
          Sign in to view your dashboard
        </h2>
        <p className="text-muted-foreground mb-6">
          You need to be logged in to access your creator dashboard.
        </p>
        <Button
          onClick={() => onNavigate("auth")}
          style={{ background: theme.primaryColor }}
          className="text-white border-0 hover:opacity-90"
        >
          Sign In
        </Button>
      </main>
    );
  }

  const courseCount = myCourses?.length ?? 0;

  return (
    <main
      data-ocid="creator_dashboard.page"
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: theme.primaryColor }}
          >
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              My Courses
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? "Loading your courses..."
                : `${courseCount} course${courseCount === 1 ? "" : "s"} published`}
            </p>
          </div>
        </div>
        <Button
          data-ocid="creator_dashboard.create_button"
          onClick={() => onNavigate("create-course")}
          className="flex items-center gap-2 text-white border-0 hover:opacity-90 shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.primaryColor}cc)`,
            boxShadow: `0 0 20px -4px ${theme.primaryColor}66`,
          }}
        >
          <Plus className="w-4 h-4" />
          Create Course
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div
          data-ocid="creator_dashboard.loading_state"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {[1, 2, 3].map((i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && courseCount === 0 && (
        <div
          data-ocid="creator_dashboard.empty_state"
          className="flex flex-col items-center justify-center py-24 px-8 rounded-3xl border-2 border-dashed border-border/40 bg-muted/10 text-center"
        >
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
            style={{
              background: `${theme.primaryColor}18`,
              border: `2px solid ${theme.primaryColor}30`,
            }}
          >
            <BookOpen
              className="w-9 h-9"
              style={{ color: theme.primaryColor }}
            />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">
            No courses yet
          </h3>
          <p className="text-muted-foreground mb-8 max-w-sm">
            Share your knowledge with the world. Create your first course and
            start teaching today.
          </p>
          <Button
            data-ocid="creator_dashboard.create_button"
            onClick={() => onNavigate("create-course")}
            className="flex items-center gap-2 text-white border-0 hover:opacity-90"
            style={{ background: theme.primaryColor }}
          >
            <Plus className="w-4 h-4" />
            Create Your First Course
          </Button>
        </div>
      )}

      {/* Course grid */}
      {!isLoading && courseCount > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(myCourses ?? []).map((item, i) => {
            const { course, lessons, quiz } = item;
            const idxStr = `${i + 1}`;
            const thumbUrl = course.thumbnail?.getDirectURL();
            const isDeleting = deletingId === course.id.toString();
            const isConfirming = confirmDeleteId === course.id.toString();

            return (
              <div
                key={course.id.toString()}
                data-ocid={`creator_dashboard.item.${idxStr}`}
                className="group rounded-2xl border border-border/50 bg-card overflow-hidden hover:border-border transition-all duration-200 hover:shadow-lg flex flex-col"
              >
                {/* Thumbnail */}
                <div className="relative h-44 overflow-hidden bg-muted/30">
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${theme.heroBgFrom}60, ${theme.heroBgTo}60)`,
                      }}
                    >
                      <BookOpen
                        className="w-12 h-12 opacity-30"
                        style={{ color: theme.primaryColor }}
                      />
                    </div>
                  )}
                  {/* Lesson count overlay */}
                  <div className="absolute top-3 right-3">
                    <Badge
                      className="text-white text-xs font-semibold"
                      style={{ background: `${theme.primaryColor}cc` }}
                    >
                      {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-display font-bold text-foreground text-lg leading-snug mb-1 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                    {course.description}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="text-xs font-medium">
                      <BookOpen className="w-3 h-3 mr-1" />
                      {lessons.length} Lesson{lessons.length !== 1 ? "s" : ""}
                    </Badge>
                    {quiz ? (
                      <Badge
                        className="text-xs font-medium text-white border-0"
                        style={{ background: `${theme.primaryColor}cc` }}
                      >
                        Has Quiz
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        No Quiz
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  {isConfirming ? (
                    <div className="flex gap-2">
                      <Button
                        data-ocid={`creator_dashboard.delete_button.${idxStr}`}
                        variant="destructive"
                        size="sm"
                        className="flex-1 text-xs"
                        disabled={isDeleting}
                        onClick={() => void handleDelete(course.id)}
                      >
                        {isDeleting ? (
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        ) : (
                          <Trash2 className="w-3 h-3 mr-1" />
                        )}
                        Confirm Delete
                      </Button>
                      <Button
                        data-ocid={`creator_dashboard.cancel_button.${idxStr}`}
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        data-ocid={`creator_dashboard.view_button.${idxStr}`}
                        size="sm"
                        className="flex-1 text-white border-0 hover:opacity-90 text-xs"
                        style={{ background: theme.primaryColor }}
                        onClick={() =>
                          onNavigate("course", { id: course.id.toString() })
                        }
                      >
                        View Course
                      </Button>
                      <Button
                        data-ocid={`creator_dashboard.delete_button.${idxStr}`}
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive px-3"
                        onClick={() => setConfirmDeleteId(course.id.toString())}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
