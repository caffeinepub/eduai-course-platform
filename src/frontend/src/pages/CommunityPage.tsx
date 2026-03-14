import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight,
  Heart,
  Loader2,
  MessageSquare,
  Plus,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllPosts,
  useCreatePost,
  useLikePost,
  useUnlikePost,
} from "../hooks/useQueries";
import type { ThemeConfig } from "../utils/seasonalTheme";

interface CommunityPageProps {
  theme: ThemeConfig;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  isLoggedIn: boolean;
}

function truncatePrincipal(principal: { toString(): string }): string {
  const str = principal.toString();
  if (str.length <= 12) return str;
  return `${str.slice(0, 6)}...${str.slice(-4)}`;
}

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CommunityPage({
  theme,
  onNavigate,
  isLoggedIn,
}: CommunityPageProps) {
  const { identity } = useInternetIdentity();
  const { data: posts, isLoading } = useAllPosts();
  const createPost = useCreatePost();
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const myPrincipal = identity?.getPrincipal();

  const handleCreatePost = async () => {
    if (!title.trim() || !body.trim()) return;
    await createPost.mutateAsync({ title: title.trim(), body: body.trim() });
    setTitle("");
    setBody("");
    setDialogOpen(false);
  };

  const handleLike = async (postId: bigint, liked: boolean) => {
    if (!isLoggedIn) return;
    if (liked) {
      await unlikePost.mutateAsync(postId);
    } else {
      await likePost.mutateAsync(postId);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section
        className="py-16 px-4 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${theme.heroBgFrom} 0%, ${theme.heroBgTo} 100%)`,
        }}
      >
        <div className="relative max-w-4xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-white/20 text-white/80"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <Users
              className="w-3.5 h-3.5"
              style={{ color: theme.accentColor }}
            />
            Community Hub
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Join the{" "}
            <span style={{ color: theme.primaryColor }}>Conversation</span>
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Ask questions, share insights, and learn together with fellow
            students and educators.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl font-bold text-foreground">
            All Discussions
          </h2>
          {isLoggedIn && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  data-ocid="community.new_post_button"
                  className="gap-2 font-semibold"
                  style={{ background: theme.primaryColor }}
                >
                  <Plus className="w-4 h-4" />
                  New Post
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl">
                    Start a Discussion
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="post-title">Title</Label>
                    <Input
                      id="post-title"
                      data-ocid="community.post_title_input"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="What's your question or topic?"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="post-body">Body</Label>
                    <Textarea
                      id="post-body"
                      data-ocid="community.post_body_textarea"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Share more details..."
                      rows={5}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    data-ocid="community.cancel_button"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    data-ocid="community.submit_post_button"
                    onClick={handleCreatePost}
                    disabled={
                      createPost.isPending || !title.trim() || !body.trim()
                    }
                    style={{ background: theme.primaryColor }}
                  >
                    {createPost.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Post"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div data-ocid="community.loading_state" className="space-y-4">
            {["sk1", "sk2", "sk3"].map((k) => (
              <div
                key={k}
                className="rounded-2xl border border-border/50 bg-card p-6 space-y-3"
              >
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <div className="flex gap-4 pt-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (posts ?? []).length === 0 && (
          <div
            data-ocid="community.empty_state"
            className="text-center py-24 rounded-2xl border border-dashed border-border/50"
          >
            <MessageSquare className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No discussions yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Be the first to start a conversation!
            </p>
            {isLoggedIn && (
              <Button
                onClick={() => setDialogOpen(true)}
                style={{ background: theme.primaryColor }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Start a Discussion
              </Button>
            )}
          </div>
        )}

        {/* Posts list */}
        {!isLoading && (posts ?? []).length > 0 && (
          <div data-ocid="community.post_list" className="space-y-4">
            {(posts ?? []).map((post, i) => {
              const liked = myPrincipal
                ? post.likes.some(
                    (p) => p.toString() === myPrincipal.toString(),
                  )
                : false;
              return (
                <motion.div
                  key={post.id.toString()}
                  data-ocid={`community.post_card.${i + 1}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group rounded-2xl border border-border/50 bg-card hover:border-border transition-all cursor-pointer"
                >
                  <button
                    type="button"
                    className="p-6 w-full text-left"
                    onClick={() =>
                      onNavigate("community-post", { id: post.id.toString() })
                    }
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mt-1.5 line-clamp-2">
                          {post.body}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors flex-shrink-0 mt-1" />
                    </div>

                    <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                      <span
                        className="font-mono px-2 py-0.5 rounded-md"
                        style={{
                          background: `${theme.primaryColor}22`,
                          color: theme.primaryColor,
                        }}
                      >
                        {truncatePrincipal(post.authorPrincipal)}
                      </span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </button>

                  {/* Actions */}
                  <div className="px-6 pb-4 flex items-center gap-4">
                    <button
                      type="button"
                      data-ocid={`community.like_button.${i + 1}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(post.id, liked);
                      }}
                      disabled={!isLoggedIn}
                      className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                        liked
                          ? "text-rose-400"
                          : "text-muted-foreground hover:text-rose-400"
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      <Heart
                        className="w-4 h-4"
                        fill={liked ? "currentColor" : "none"}
                      />
                      {Number(post.likeCount)}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onNavigate("community-post", { id: post.id.toString() })
                      }
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      View comments
                    </button>
                  </div>
                </motion.div>
              );
            })}
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
