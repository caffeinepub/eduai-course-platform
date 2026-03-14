import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Home,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { LessonType } from "../backend";
import type { LessonUpdate, QuizQuestion } from "../backend";
import {
  useAllCategories,
  useCallerProfile,
  useCreateCourse,
} from "../hooks/useQueries";
import type { ThemeConfig } from "../utils/seasonalTheme";

const DEFAULT_CATEGORIES = [
  { id: BigInt(1), name: "Mathematics" },
  { id: BigInt(2), name: "Science" },
  { id: BigInt(3), name: "Programming" },
  { id: BigInt(4), name: "History" },
  { id: BigInt(5), name: "Languages" },
  { id: BigInt(6), name: "Arts" },
  { id: BigInt(7), name: "Business" },
  { id: BigInt(8), name: "Gaming" },
  { id: BigInt(9), name: "Sports" },
  { id: BigInt(10), name: "AI" },
  { id: BigInt(11), name: "Video Editing" },
  { id: BigInt(12), name: "Music" },
  { id: BigInt(13), name: "Technology" },
  { id: BigInt(14), name: "Health & Wellness" },
];

interface CreateCoursePageProps {
  theme: ThemeConfig;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  isLoggedIn: boolean;
}

interface LessonDraft {
  id: number;
  title: string;
  type: LessonType;
  videoUrl: string;
  textContent: string;
}

interface QuizDraft {
  id: number;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
}

function emptyQuestion(id: number): QuizDraft {
  return {
    id,
    question: "",
    options: ["", "", "", ""],
    correctIndex: 0,
  };
}

function isOver18(dob: bigint): boolean {
  const dobDate = new Date(Number(dob) / 1_000_000);
  const today = new Date();
  const age = today.getFullYear() - dobDate.getFullYear();
  const m = today.getMonth() - dobDate.getMonth();
  return (
    age > 18 ||
    (age === 18 && (m > 0 || (m === 0 && today.getDate() >= dobDate.getDate())))
  );
}

export default function CreateCoursePage({
  theme,
  onNavigate,
  isLoggedIn,
}: CreateCoursePageProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [lessons, setLessons] = useState<LessonDraft[]>([
    { id: 1, title: "", type: LessonType.video, videoUrl: "", textContent: "" },
    { id: 2, title: "", type: LessonType.video, videoUrl: "", textContent: "" },
    { id: 3, title: "", type: LessonType.text, videoUrl: "", textContent: "" },
  ]);
  const [quizDrafts, setQuizDrafts] = useState<QuizDraft[]>([
    emptyQuestion(1),
    emptyQuestion(2),
    emptyQuestion(3),
  ]);

  const { data: backendCategories } = useAllCategories();
  const { data: profile } = useCallerProfile();
  const createCourse = useCreateCourse();

  const categories =
    backendCategories && backendCategories.length > 0
      ? backendCategories
      : DEFAULT_CATEGORIES;

  if (!isLoggedIn) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-20 text-center">
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
        <h2 className="font-display text-2xl font-bold text-foreground mb-3">
          Sign in Required
        </h2>
        <p className="text-muted-foreground mb-6">
          You need to sign in to create a course.
        </p>
        <Button
          onClick={() => onNavigate("auth")}
          style={{ background: theme.primaryColor }}
        >
          Sign In
        </Button>
      </main>
    );
  }

  if (profile && !isOver18(profile.dateOfBirth)) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="font-display text-2xl font-bold text-foreground mb-3">
          Age Restriction
        </h2>
        <p className="text-muted-foreground">
          You must be 18 or older to create courses on EduAI.
        </p>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => onNavigate("home")}
        >
          Back to Home
        </Button>
      </main>
    );
  }

  // Lesson helpers
  const addLesson = () =>
    setLessons((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: "",
        type: LessonType.video,
        videoUrl: "",
        textContent: "",
      },
    ]);
  const removeLesson = (i: number) =>
    setLessons((prev) => prev.filter((_, idx) => idx !== i));
  const updateLesson = (i: number, patch: Partial<LessonDraft>) =>
    setLessons((prev) =>
      prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)),
    );

  // Quiz helpers
  const addQuestion = () =>
    setQuizDrafts((prev) => [...prev, emptyQuestion(Date.now())]);
  const removeQuestion = (i: number) =>
    setQuizDrafts((prev) => prev.filter((_, idx) => idx !== i));
  const updateQuestion = (i: number, patch: Partial<QuizDraft>) =>
    setQuizDrafts((prev) =>
      prev.map((q, idx) => (idx === i ? { ...q, ...patch } : q)),
    );
  const updateOption = (qi: number, oi: number, value: string) =>
    setQuizDrafts((prev) =>
      prev.map((q, idx) => {
        if (idx !== qi) return q;
        const opts = [...q.options] as [string, string, string, string];
        opts[oi] = value;
        return { ...q, options: opts };
      }),
    );

  const handleSubmit = async () => {
    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }
    const lessonUpdates: LessonUpdate[] = lessons.map((l, i) => ({
      title: l.title,
      order: BigInt(i + 1),
      lessonType: l.type,
      videoUrl: l.videoUrl,
      courseId: BigInt(0),
    }));
    const quizQuestions: QuizQuestion[] = quizDrafts.map((q) => ({
      question: q.question,
      options: q.options,
      correctIndex: BigInt(q.correctIndex),
    }));
    try {
      const courseId = await createCourse.mutateAsync({
        title,
        description,
        categoryId: BigInt(categoryId),
        lessons: lessonUpdates,
        quizQuestions,
      });
      toast.success("Course created successfully!");
      onNavigate("course", { id: courseId.toString() });
    } catch {
      toast.error("Failed to create course. Please try again.");
    }
  };

  const steps = ["Course Info", "Add Lessons", "Add Quiz", "Review & Publish"];

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <button
        type="button"
        data-ocid="create.back_home_button"
        onClick={() => onNavigate("home")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <Home className="w-4 h-4" />
        Back to Home
      </button>

      <h1 className="font-display text-3xl font-bold text-foreground mb-2">
        Create a Course
      </h1>
      <p className="text-muted-foreground mb-8">
        Share your knowledge with learners worldwide — for free.
      </p>

      {/* Step indicator */}
      <div className="flex items-center mb-10 flex-wrap gap-y-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                i + 1 <= step
                  ? "border-transparent text-white"
                  : "border-border text-muted-foreground"
              }`}
              style={
                i + 1 <= step
                  ? {
                      background: theme.primaryColor,
                      borderColor: "transparent",
                    }
                  : {}
              }
            >
              {i + 1 < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            <span
              className={`ml-2 text-sm font-medium ${
                i + 1 === step ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {s}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`h-px flex-1 mx-4 min-w-[24px] ${
                  i + 1 < step ? "" : "bg-border"
                }`}
                style={i + 1 < step ? { background: theme.primaryColor } : {}}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 — Course Info */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-card border border-border/50 space-y-5">
            <div>
              <Label
                htmlFor="title"
                className="text-sm font-medium text-foreground"
              >
                Course Title *
              </Label>
              <Input
                id="title"
                data-ocid="create.title.input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Complete JavaScript Mastery Course"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label
                htmlFor="description"
                className="text-sm font-medium text-foreground"
              >
                Description *
              </Label>
              <Textarea
                id="description"
                data-ocid="create.description.textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will students learn? Who is this for?"
                className="mt-1.5 min-h-[100px]"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground">
                Category *
              </Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger
                  data-ocid="create.category.select"
                  className="mt-1.5"
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat.id.toString()}
                      value={cat.id.toString()}
                    >
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            data-ocid="create.step1_next_button"
            onClick={() => {
              if (!title.trim() || !description.trim() || !categoryId) {
                toast.error("Please fill in all required fields");
                return;
              }
              setStep(2);
            }}
            className="w-full h-12 font-semibold"
            style={{ background: theme.primaryColor }}
          >
            Continue to Lessons <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Step 2 — Lessons */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-2">
            Add at least 3 lessons to your course.
          </p>
          {lessons.map((lesson, i) => (
            <div
              key={lesson.id}
              className="p-5 rounded-2xl bg-card border border-border/50 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground text-sm">
                  Lesson {i + 1}
                </span>
                {lessons.length > 3 && (
                  <button
                    type="button"
                    data-ocid={`create.lesson.delete_button.${i + 1}`}
                    onClick={() => removeLesson(i)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Lesson Title *
                </Label>
                <Input
                  value={lesson.title}
                  onChange={(e) => updateLesson(i, { title: e.target.value })}
                  placeholder="e.g. Introduction to Variables"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Type</Label>
                <Select
                  value={lesson.type}
                  onValueChange={(v) =>
                    updateLesson(i, { type: v as LessonType })
                  }
                >
                  <SelectTrigger
                    data-ocid={`create.lesson_type_select.${i + 1}`}
                    className="mt-1"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={LessonType.video}>🎬 Video</SelectItem>
                    <SelectItem value={LessonType.text}>📝 Text</SelectItem>
                    <SelectItem value={LessonType.pdf}>📄 PDF</SelectItem>
                    <SelectItem value={LessonType.image}>🖼️ Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {lesson.type === LessonType.video && (
                <div>
                  <Label className="text-xs text-muted-foreground">
                    YouTube / Video URL
                  </Label>
                  <Input
                    value={lesson.videoUrl}
                    onChange={(e) =>
                      updateLesson(i, { videoUrl: e.target.value })
                    }
                    placeholder="https://youtube.com/watch?v=..."
                    className="mt-1"
                  />
                </div>
              )}
              {(lesson.type === LessonType.text ||
                lesson.type === LessonType.pdf) && (
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Content
                  </Label>
                  <Textarea
                    value={lesson.textContent}
                    onChange={(e) =>
                      updateLesson(i, { textContent: e.target.value })
                    }
                    placeholder="Enter lesson content..."
                    className="mt-1 min-h-[80px]"
                  />
                </div>
              )}
            </div>
          ))}
          <Button
            data-ocid="create.step2_add_lesson_button"
            variant="outline"
            onClick={addLesson}
            className="w-full border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Lesson
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={() => {
                if (lessons.length < 3) {
                  toast.error("Add at least 3 lessons");
                  return;
                }
                if (lessons.some((l) => !l.title.trim())) {
                  toast.error("Each lesson needs a title");
                  return;
                }
                setStep(3);
              }}
              className="flex-1 font-semibold"
              style={{ background: theme.primaryColor }}
            >
              Continue to Quiz <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 — Quiz Builder */}
      {step === 3 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-2">
            Add at least 3 quiz questions. Mark the correct answer for each.
          </p>
          {quizDrafts.map((q, qi) => (
            <div
              key={q.id}
              className="p-5 rounded-2xl bg-card border border-border/50 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground text-sm">
                  Question {qi + 1}
                </span>
                {quizDrafts.length > 3 && (
                  <button
                    type="button"
                    data-ocid={`create.quiz.delete_button.${qi + 1}`}
                    onClick={() => removeQuestion(qi)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Question *
                </Label>
                <Input
                  data-ocid={`create.quiz.question_input.${qi + 1}`}
                  value={q.question}
                  onChange={(e) =>
                    updateQuestion(qi, { question: e.target.value })
                  }
                  placeholder="e.g. What is a variable?"
                  className="mt-1"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Answer Options * — click the circle to mark the correct one
                </Label>
                {q.options.map((opt, oi) => (
                  <div
                    key={["A", "B", "C", "D"][oi]}
                    className="flex items-center gap-2"
                  >
                    <button
                      type="button"
                      data-ocid={`create.quiz.correct_radio.${qi + 1}`}
                      onClick={() => updateQuestion(qi, { correctIndex: oi })}
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${
                        q.correctIndex === oi
                          ? "border-transparent"
                          : "border-border"
                      }`}
                      style={
                        q.correctIndex === oi
                          ? {
                              background: theme.primaryColor,
                              borderColor: theme.primaryColor,
                            }
                          : {}
                      }
                      aria-label={`Mark option ${oi + 1} as correct`}
                    />
                    <Input
                      value={opt}
                      onChange={(e) => updateOption(qi, oi, e.target.value)}
                      placeholder={`Option ${oi + 1}`}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <Button
            data-ocid="create.quiz.add_question_button"
            variant="outline"
            onClick={addQuestion}
            className="w-full border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Question
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep(2)}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={() => {
                if (quizDrafts.length < 3) {
                  toast.error("Add at least 3 quiz questions");
                  return;
                }
                if (
                  quizDrafts.some(
                    (q) =>
                      !q.question.trim() || q.options.some((o) => !o.trim()),
                  )
                ) {
                  toast.error("Fill in all questions and options");
                  return;
                }
                setStep(4);
              }}
              className="flex-1 font-semibold"
              style={{ background: theme.primaryColor }}
            >
              Review Course <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4 — Review & Publish */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-card border border-border/50">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">
              Course Summary
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Title
                </span>
                <p className="font-semibold text-foreground mt-0.5">{title}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Description
                </span>
                <p className="text-sm text-foreground mt-0.5">{description}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Category
                </span>
                <p className="text-sm text-foreground mt-0.5">
                  {categories.find((c) => c.id.toString() === categoryId)
                    ?.name ?? categoryId}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Lessons
                </span>
                <p className="text-sm text-foreground mt-0.5">
                  {lessons.length} lessons
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Price
                </span>
                <p
                  className="text-sm font-bold mt-0.5"
                  style={{ color: theme.primaryColor }}
                >
                  FREE (all courses are free)
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Quiz
                </span>
                <p className="text-sm text-foreground mt-0.5">
                  {quizDrafts.length} questions (manually created)
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep(3)}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              data-ocid="create.submit_button"
              onClick={() => void handleSubmit()}
              disabled={createCourse.isPending}
              className="flex-1 font-semibold"
              style={{ background: theme.primaryColor }}
            >
              {createCourse.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                  Publishing...
                </>
              ) : (
                "Publish Course 🚀"
              )}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
