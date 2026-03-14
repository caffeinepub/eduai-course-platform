import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  ExternalLink,
  FileText,
  HelpCircle,
  Mail,
  RefreshCw,
  Video,
} from "lucide-react";
import { useState } from "react";
import type { Lesson, QuizQuestion } from "../backend";
import { LessonType } from "../backend";
import {
  useAllCategories,
  useCourse,
  useLessonsForCourse,
  useQuiz,
} from "../hooks/useQueries";
import type { ThemeConfig } from "../utils/seasonalTheme";

const ADMIN_EMAIL = "admin@eduai.com"; // Replace with real admin email

interface CourseDetailPageProps {
  courseId: string;
  theme: ThemeConfig;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

function getYouTubeEmbedUrl(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
}

function LessonCard({
  lesson,
  index,
  theme,
}: { lesson: Lesson; index: number; theme: ThemeConfig }) {
  const [expanded, setExpanded] = useState(false);
  const embedUrl = lesson.videoUrl ? getYouTubeEmbedUrl(lesson.videoUrl) : null;

  return (
    <div
      data-ocid={`course.lesson.item.${index}`}
      className="rounded-xl border border-border/50 overflow-hidden bg-card"
    >
      {/* Lesson header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white text-sm font-bold"
          style={{ background: theme.primaryColor }}
        >
          {index}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">
            {lesson.title}
          </p>
          <p className="text-xs text-muted-foreground capitalize mt-0.5">
            {lesson.lessonType}
          </p>
        </div>
        <div className="shrink-0">
          {lesson.lessonType === LessonType.video || lesson.videoUrl ? (
            <Video className="w-4 h-4 text-muted-foreground" />
          ) : lesson.lessonType === LessonType.pdf ? (
            <FileText className="w-4 h-4 text-muted-foreground" />
          ) : (
            <BookOpen className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border/50">
          {/* Video embed */}
          {lesson.videoUrl && embedUrl && (
            <div
              className="relative w-full"
              style={{ paddingBottom: "56.25%" }}
            >
              <iframe
                src={embedUrl}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          )}

          {/* Non-YouTube video URL */}
          {lesson.videoUrl && !embedUrl && (
            <div className="p-4">
              <a
                href={lesson.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                style={{ color: theme.primaryColor }}
              >
                <ExternalLink className="w-4 h-4" />
                Watch Video
              </a>
            </div>
          )}

          {/* PDF lesson */}
          {lesson.lessonType === LessonType.pdf && lesson.content && (
            <div className="p-4 flex items-center gap-3">
              <FileText
                className="w-8 h-8"
                style={{ color: theme.primaryColor }}
              />
              <div>
                <p className="font-medium text-sm text-foreground">
                  PDF Document
                </p>
                <a
                  href={lesson.content.getDirectURL()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs hover:underline"
                  style={{ color: theme.primaryColor }}
                >
                  Open PDF
                </a>
              </div>
            </div>
          )}

          {/* Text lesson */}
          {lesson.lessonType === LessonType.text && (
            <div className="p-4">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {lesson.content
                  ? "Text content available — download to view."
                  : "No text content attached to this lesson."}
              </p>
            </div>
          )}

          {/* Image lesson */}
          {lesson.lessonType === LessonType.image && lesson.content && (
            <div className="p-4">
              <img
                src={lesson.content.getDirectURL()}
                alt={lesson.title}
                className="rounded-lg max-w-full"
              />
            </div>
          )}

          {/* No content fallback */}
          {!lesson.videoUrl &&
            !lesson.content &&
            lesson.lessonType !== LessonType.text && (
              <div className="p-4 text-sm text-muted-foreground italic">
                No content available for this lesson yet.
              </div>
            )}
        </div>
      )}
    </div>
  );
}

function LessonsSection({
  courseId,
  theme,
}: { courseId: bigint; theme: ThemeConfig }) {
  const { data: lessons, isLoading } = useLessonsForCourse(courseId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const sorted = [...(lessons ?? [])].sort(
    (a, b) => Number(a.order) - Number(b.order),
  );

  if (sorted.length === 0) {
    return (
      <div
        data-ocid="course.lessons.empty_state"
        className="text-center py-16 text-muted-foreground"
      >
        <Video className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium text-foreground">No lessons yet</p>
        <p className="text-sm mt-1">
          The course creator hasn't added any lessons yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-4">
        {sorted.length} lesson{sorted.length !== 1 ? "s" : ""} — click a lesson
        to expand
      </p>
      {sorted.map((lesson, i) => (
        <LessonCard
          key={lesson.id.toString()}
          lesson={lesson}
          index={i + 1}
          theme={theme}
        />
      ))}
    </div>
  );
}

function QuizSection({
  courseId,
  theme,
}: { courseId: bigint; theme: ThemeConfig }) {
  const { data: quiz, isLoading } = useQuiz(courseId);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const questions: QuizQuestion[] = quiz?.questions ?? [];

  const score = submitted
    ? questions.reduce((acc, q, i) => {
        return answers[i] === Number(q.correctIndex) ? acc + 1 : acc;
      }, 0)
    : 0;

  if (isLoading) return <Skeleton className="h-40 w-full rounded-xl" />;

  if (questions.length === 0) {
    return (
      <div
        data-ocid="course.quiz.empty_state"
        className="text-center py-16 text-muted-foreground"
      >
        <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium text-foreground">No quiz available yet</p>
        <p className="text-sm mt-1">
          The creator hasn't added a quiz for this course yet.
        </p>
      </div>
    );
  }

  return (
    <div data-ocid="course.quiz_section" className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: theme.primaryColor }}
        >
          <HelpCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">
            Course Quiz
          </h3>
          <p className="text-sm text-muted-foreground">
            {questions.length} questions
          </p>
        </div>
      </div>

      {submitted ? (
        <div
          className="p-6 rounded-2xl text-center border"
          style={{
            borderColor:
              score >= Math.ceil(questions.length / 2)
                ? "oklch(0.65 0.18 145)"
                : "oklch(0.6 0.22 25)",
          }}
        >
          <div
            className="text-5xl font-display font-bold mb-2"
            style={{
              color:
                score >= Math.ceil(questions.length / 2)
                  ? theme.primaryColor
                  : "oklch(0.65 0.22 25)",
            }}
          >
            {score}/{questions.length}
          </div>
          <p className="text-lg font-medium text-foreground">
            {score === questions.length
              ? "Perfect! 🎉"
              : score >= Math.ceil(questions.length / 2)
                ? "Good job! 👍"
                : "Keep studying! 📚"}
          </p>
          <Button
            className="mt-4"
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
            }}
            variant="outline"
          >
            Retake Quiz
          </Button>
        </div>
      ) : (
        <>
          {questions.map((q, qi) => (
            <div
              key={q.question.slice(0, 20)}
              className="p-5 rounded-xl bg-muted/30 border border-border/50"
            >
              <p className="font-medium text-foreground mb-3">
                {qi + 1}. {q.question}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, oi) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [qi]: oi }))
                    }
                    className={`p-3 rounded-lg text-left text-sm font-medium border transition-all ${
                      answers[qi] === oi
                        ? "text-white border-transparent"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                    }`}
                    style={
                      answers[qi] === oi
                        ? {
                            background: theme.primaryColor,
                            borderColor: "transparent",
                          }
                        : {}
                    }
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <Button
            data-ocid="course.quiz.submit_button"
            onClick={() => setSubmitted(true)}
            disabled={Object.keys(answers).length < questions.length}
            className="w-full h-12 font-semibold"
            style={{ background: theme.primaryColor }}
          >
            Submit Quiz ({Object.keys(answers).length}/{questions.length}{" "}
            answered)
          </Button>
        </>
      )}
    </div>
  );
}

function DoubtContact({ theme }: { theme: ThemeConfig }) {
  return (
    <div className="flex flex-col items-center text-center gap-5 py-10">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: `${theme.primaryColor}18` }}
      >
        <Mail className="w-8 h-8" style={{ color: theme.primaryColor }} />
      </div>
      <div>
        <p className="font-display font-semibold text-foreground text-lg mb-2">
          Have a doubt about this course?
        </p>
        <p className="text-sm text-muted-foreground max-w-sm">
          Email the admin with your question and get a personal explanation.
        </p>
      </div>
      <a
        href={`mailto:${ADMIN_EMAIL}?subject=Doubt%20about%20course`}
        data-ocid="course.doubt_email_button"
      >
        <Button
          size="lg"
          className="gap-2 font-semibold rounded-xl"
          style={{ background: theme.primaryColor, color: "#fff" }}
        >
          <Mail className="w-4 h-4" />
          Email Admin
        </Button>
      </a>
      <p className="text-xs text-muted-foreground">{ADMIN_EMAIL}</p>
    </div>
  );
}

export default function CourseDetailPage({
  courseId,
  theme,
  onNavigate,
}: CourseDetailPageProps) {
  const id = BigInt(courseId);
  const { data: course, isLoading, isError, refetch } = useCourse(id);
  const { data: categories } = useAllCategories();

  const category = categories?.find((c) => c.id === course?.categoryId);

  if (isLoading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-12">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-64 w-full rounded-2xl mb-6" />
        <Skeleton className="h-8 w-64 mb-3" />
        <Skeleton className="h-24 w-full" />
      </main>
    );
  }

  if (isError) {
    return (
      <main
        data-ocid="course.error_state"
        className="max-w-5xl mx-auto px-4 py-20 text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 mb-6">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          Failed to load course
        </h2>
        <p className="text-muted-foreground mb-6">
          Something went wrong while fetching this course. Please try again.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            data-ocid="course.error_retry_button"
            onClick={() => refetch()}
            className="gap-2"
            style={{ background: theme.primaryColor, color: "#fff" }}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button variant="outline" onClick={() => onNavigate("home")}>
            Go Home
          </Button>
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-12 text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">
          Course not found
        </h2>
        <Button className="mt-4" onClick={() => onNavigate("home")}>
          Go Home
        </Button>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* Back */}
      <button
        type="button"
        data-ocid="course.back_button"
        onClick={() => onNavigate("home")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to courses
      </button>

      {/* Header */}
      <div
        className="rounded-2xl p-8 mb-8 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${theme.heroBgFrom} 0%, ${theme.heroBgTo} 100%)`,
        }}
      >
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="free-badge text-xs px-3 py-1 rounded-full">
              FREE
            </span>
            {category && (
              <Badge variant="secondary" className="text-xs">
                {category.name}
              </Badge>
            )}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
            {course.title}
          </h1>
          <p className="text-white/70 text-lg max-w-2xl">
            {course.description}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="lessons" className="space-y-6">
        <TabsList className="bg-muted/30 border border-border/50">
          <TabsTrigger value="lessons" data-ocid="course.lessons.tab">
            <Video className="w-4 h-4 mr-2" /> Lessons
          </TabsTrigger>
          <TabsTrigger value="overview" data-ocid="course.overview.tab">
            <BookOpen className="w-4 h-4 mr-2" /> Overview
          </TabsTrigger>
          <TabsTrigger value="quiz" data-ocid="course.quiz.tab">
            <HelpCircle className="w-4 h-4 mr-2" /> Quiz
          </TabsTrigger>
          <TabsTrigger value="doubt" data-ocid="course.doubt.tab">
            <Mail className="w-4 h-4 mr-2" /> Ask a Doubt
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lessons">
          <div className="p-6 rounded-2xl bg-card border border-border/50">
            <h2 className="font-display text-xl font-bold text-foreground mb-6">
              Course Lessons
            </h2>
            <LessonsSection courseId={id} theme={theme} />
          </div>
        </TabsContent>

        <TabsContent value="overview">
          <div className="p-6 rounded-2xl bg-card border border-border/50">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">
              About this Course
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {course.description}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  icon: Video,
                  label: "Video Lessons",
                  desc: "Expert-recorded content",
                },
                {
                  icon: HelpCircle,
                  label: "Quiz",
                  desc: "Test your knowledge",
                },
                { icon: Mail, label: "Doubt Support", desc: "Email the admin" },
              ].map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="p-4 rounded-xl bg-muted/30 border border-border/30"
                >
                  <Icon
                    className="w-6 h-6 mb-2"
                    style={{ color: theme.primaryColor }}
                  />
                  <div className="font-medium text-sm text-foreground">
                    {label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="quiz">
          <div className="p-6 rounded-2xl bg-card border border-border/50">
            <QuizSection courseId={id} theme={theme} />
          </div>
        </TabsContent>

        <TabsContent value="doubt">
          <div className="p-6 rounded-2xl bg-card border border-border/50">
            <DoubtContact theme={theme} />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
