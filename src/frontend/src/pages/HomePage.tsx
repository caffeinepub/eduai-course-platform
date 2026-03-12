import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, BookOpen, Search, Users, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import type { Category, Course } from "../backend";
import {
  useAllCategories,
  useAllCourses,
  useSearchCourses,
} from "../hooks/useQueries";
import type { ThemeConfig } from "../utils/seasonalTheme";

interface HomePageProps {
  theme: ThemeConfig;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

function CourseCard({
  course,
  categories,
  index,
  theme,
  onNavigate,
}: {
  course: Course;
  categories: Category[];
  index: number;
  theme: ThemeConfig;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}) {
  const category = categories.find((c) => c.id === course.categoryId);
  const thumbUrl = course.thumbnail?.getDirectURL();

  const gradients = [
    "from-teal-900 to-emerald-900",
    "from-indigo-900 to-purple-900",
    "from-amber-900 to-orange-900",
    "from-cyan-900 to-blue-900",
    "from-pink-900 to-rose-900",
    "from-lime-900 to-green-900",
  ];
  const grad = gradients[index % gradients.length];

  return (
    <button
      type="button"
      data-ocid={`home.course_card.${index + 1}`}
      onClick={() => onNavigate("course", { id: course.id.toString() })}
      className="group text-left w-full rounded-2xl overflow-hidden bg-card border border-border/50 card-hover cursor-pointer"
    >
      {/* Thumbnail */}
      <div
        className={`relative h-44 bg-gradient-to-br ${grad} overflow-hidden`}
      >
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-white/30" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="free-badge text-xs px-2 py-1 rounded-full">
            FREE
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {category && (
          <span
            className="text-xs font-medium"
            style={{ color: theme.primaryColor }}
          >
            {category.name}
          </span>
        )}
        <h3 className="font-display font-semibold text-foreground mt-1 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {course.description}
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Zap className="w-3 h-3" style={{ color: theme.accentColor }} />
          <span>AI-Powered Quizzes</span>
        </div>
      </div>
    </button>
  );
}

export default function HomePage({ theme, onNavigate }: HomePageProps) {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<bigint | null>(null);

  const { data: allCourses, isLoading: coursesLoading } = useAllCourses();
  const { data: categories } = useAllCategories();
  const { data: searchResults, isLoading: searchLoading } =
    useSearchCourses(searchTerm);

  const isLoading = coursesLoading || searchLoading;

  const displayCourses = searchTerm
    ? (searchResults ?? [])
    : (allCourses ?? []).filter((c) =>
        selectedCategory ? c.categoryId === selectedCategory : true,
      );

  const handleSearch = () => {
    setSearchTerm(searchInput);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
  };

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--seasonal-hero-from",
      theme.heroBgFrom,
    );
    document.documentElement.style.setProperty(
      "--seasonal-hero-to",
      theme.heroBgTo,
    );
  }, [theme]);

  return (
    <main className="min-h-screen">
      {/* Seasonal Banner Strip */}
      <div
        className="text-center py-2 px-4 text-sm font-medium text-white/90"
        style={{ background: theme.bannerBg }}
      >
        {theme.emoji} {theme.bannerText}
      </div>

      {/* Hero Section */}
      <section
        className="relative py-20 px-4 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${theme.heroBgFrom} 0%, ${theme.heroBgTo} 100%)`,
        }}
      >
        {/* Background image */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-eduai.dim_1200x400.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${theme.heroBgFrom}cc 0%, ${theme.heroBgTo}88 100%)`,
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-white/20 text-white/80"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <Zap className="w-3.5 h-3.5" style={{ color: theme.accentColor }} />
            AI-Powered Free Learning Platform
          </div>

          <h1 className="font-display text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
            Learn <span style={{ color: theme.primaryColor }}>Everything</span>,
            <br />
            Pay <span style={{ color: theme.accentColor }}>Nothing</span>
          </h1>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            Thousands of expert-crafted courses with AI quizzes, instant doubt
            solving, and structured learning paths — completely free.
          </p>

          {/* Search */}
          <div className="flex gap-2 max-w-2xl mx-auto">
            <Input
              data-ocid="home.search_input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search courses — Web Dev, Data Science, Finance..."
              className="flex-1 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 text-base"
            />
            <Button
              data-ocid="home.search_button"
              onClick={handleSearch}
              className="h-12 px-6 font-semibold"
              style={{ background: theme.primaryColor }}
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="border-y border-border/50 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-3 gap-4">
          {[
            {
              icon: BookOpen,
              label: "Free Courses",
              value: `${allCourses?.length ?? 0}+`,
            },
            { icon: Users, label: "Active Learners", value: "10K+" },
            { icon: Zap, label: "AI Features", value: "100%" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div
                className="text-2xl font-display font-bold"
                style={{ color: theme.primaryColor }}
              >
                {value}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Browser */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {/* Category Filter */}
        {!searchTerm && categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              type="button"
              data-ocid="home.category_tab"
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                selectedCategory === null
                  ? "text-white border-transparent"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              }`}
              style={
                selectedCategory === null
                  ? { background: theme.primaryColor }
                  : {}
              }
            >
              All Courses
            </button>
            {categories.map((cat) => (
              <button
                type="button"
                key={cat.id.toString()}
                data-ocid="home.category_tab"
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === cat.id ? null : cat.id,
                  )
                }
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  selectedCategory === cat.id
                    ? "text-white border-transparent"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                }`}
                style={
                  selectedCategory === cat.id
                    ? { background: theme.primaryColor }
                    : {}
                }
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Search results header */}
        {searchTerm && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold text-foreground">
              Results for &ldquo;{searchTerm}&rdquo;
            </h2>
            <Button variant="ghost" size="sm" onClick={clearSearch}>
              Clear search
            </Button>
          </div>
        )}

        {!searchTerm && (
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            {selectedCategory
              ? categories?.find((c) => c.id === selectedCategory)?.name
              : "All Courses"}
          </h2>
        )}

        {/* Loading */}
        {isLoading && (
          <div
            data-ocid="home.loading_state"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {["s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7"].map((sk) => (
              <div
                key={sk}
                className="rounded-2xl overflow-hidden bg-card border border-border/50"
              >
                <Skeleton className="h-44 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && displayCourses.length === 0 && (
          <div data-ocid="home.empty_state" className="text-center py-20">
            <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              {searchTerm ? "No courses found" : "No courses yet"}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? `We couldn't find courses matching "${searchTerm}"`
                : "Be the first to create a course!"}
            </p>
          </div>
        )}

        {/* Grid */}
        {!isLoading && displayCourses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayCourses.map((course, i) => (
              <CourseCard
                key={course.id.toString()}
                course={course}
                categories={categories ?? []}
                index={i}
                theme={theme}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground underline transition-colors"
              style={{ color: theme.primaryColor }}
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
