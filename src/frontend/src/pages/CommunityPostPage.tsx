import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Heart, Loader2, MessageSquare, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCommentsForPost,
  useCreateComment,
  useDeleteComment,
  useLikePost,
  usePost,
  useUnlikePost,
} from "../hooks/useQueries";
import type { ThemeConfig } from "../utils/seasonalTheme";

interface CommunityPostPageProps {
  postId: string;
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
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CommunityPostPage({
  postId,
  theme,
  onNavigate,
  isLoggedIn,
}: CommunityPostPageProps) {
  const postIdBigint = BigInt(postId);
  const { identity } = useInternetIdentity();
  const { data: post, isLoading: postLoading } = usePost(postIdBigint);
  const { data: comments, isLoading: commentsLoading } =
    useCommentsForPost(postIdBigint);
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();

  const [commentBody, setCommentBody] = useState("");

  const myPrincipal = identity?.getPrincipal();
  const liked =
    myPrincipal && post
      ? post.likes.some((p) => p.toString() === myPrincipal.toString())
      : false;

  const handleLike = async () => {
    if (!isLoggedIn || !post) return;
    if (liked) {
      await unlikePost.mutateAsync(postIdBigint);
    } else {
      await likePost.mutateAsync(postIdBigint);
    }
  };

  const handleComment = async () => {
    if (!commentBody.trim()) return;
    await createComment.mutateAsync({
      postId: postIdBigint,
      body: commentBody.trim(),
    });
    setCommentBody("");
  };

  const handleDeleteComment = async (commentId: bigint) => {
    await deleteComment.mutateAsync({ commentId, postId: postIdBigint });
  };

  return (
    <main className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Back */}
        <button
          type="button"
          data-ocid="post.back_button"
          onClick={() => onNavigate("community")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Community
        </button>

        {/* Post loading */}
        {postLoading && (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {/* Post not found */}
        {!postLoading && !post && (
          <div className="text-center py-20">
            <h3 className="font-display text-xl text-foreground mb-2">
              Post not found
            </h3>
            <Button onClick={() => onNavigate("community")} variant="outline">
              Back to Community
            </Button>
          </div>
        )}

        {/* Post content */}
        {!postLoading && post && (
          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border/50 bg-card p-8 mb-8"
          >
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">
              {post.title}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <span
                className="font-mono text-xs px-2 py-1 rounded-md"
                style={{
                  background: `${theme.primaryColor}22`,
                  color: theme.primaryColor,
                }}
              >
                {truncatePrincipal(post.authorPrincipal)}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(post.createdAt)}
              </span>
            </div>

            <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {post.body}
            </p>

            {/* Like */}
            <div className="mt-6 pt-6 border-t border-border/50">
              <button
                type="button"
                data-ocid="post.like_button"
                onClick={handleLike}
                disabled={
                  !isLoggedIn || likePost.isPending || unlikePost.isPending
                }
                className={`flex items-center gap-2 text-sm font-medium transition-colors px-4 py-2 rounded-lg ${
                  liked
                    ? "text-rose-400 bg-rose-400/10"
                    : "text-muted-foreground hover:text-rose-400 hover:bg-rose-400/10"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <Heart
                  className="w-4 h-4"
                  fill={liked ? "currentColor" : "none"}
                />
                {Number(post.likeCount)}{" "}
                {Number(post.likeCount) === 1 ? "like" : "likes"}
              </button>
            </div>
          </motion.article>
        )}

        {/* Comments section */}
        <section>
          <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <MessageSquare
              className="w-5 h-5"
              style={{ color: theme.primaryColor }}
            />
            Comments{" "}
            {comments && (
              <span className="text-muted-foreground font-normal text-base">
                ({comments.length})
              </span>
            )}
          </h2>

          {/* Add comment */}
          {isLoggedIn && (
            <div className="rounded-2xl border border-border/50 bg-card p-6 mb-6">
              <Textarea
                data-ocid="post.comment_input"
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="mb-4 resize-none"
              />
              <Button
                data-ocid="post.submit_comment_button"
                onClick={handleComment}
                disabled={createComment.isPending || !commentBody.trim()}
                style={{ background: theme.primaryColor }}
                className="gap-2"
              >
                {createComment.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Post Comment"
                )}
              </Button>
            </div>
          )}

          {!isLoggedIn && (
            <div className="rounded-2xl border border-dashed border-border/50 p-6 mb-6 text-center text-muted-foreground text-sm">
              <button
                type="button"
                onClick={() => onNavigate("auth")}
                className="text-primary underline hover:no-underline"
              >
                Sign in
              </button>{" "}
              to join the conversation
            </div>
          )}

          {/* Comments loading */}
          {commentsLoading && (
            <div className="space-y-4">
              {["c1", "c2"].map((k) => (
                <div
                  key={k}
                  className="rounded-xl border border-border/50 bg-card p-4 space-y-2"
                >
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          )}

          {/* Empty comments */}
          {!commentsLoading && (comments ?? []).length === 0 && (
            <div
              data-ocid="post.empty_state"
              className="text-center py-12 rounded-xl border border-dashed border-border/50"
            >
              <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No comments yet — be the first!
              </p>
            </div>
          )}

          {/* Comments list */}
          {!commentsLoading && (comments ?? []).length > 0 && (
            <div data-ocid="post.comment_list" className="space-y-3">
              {(comments ?? []).map((comment, i) => {
                const isMine =
                  myPrincipal &&
                  comment.authorPrincipal.toString() === myPrincipal.toString();
                return (
                  <motion.div
                    key={comment.id.toString()}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-xl border border-border/50 bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="font-mono text-xs px-2 py-0.5 rounded"
                            style={{
                              background: `${theme.primaryColor}22`,
                              color: theme.primaryColor,
                            }}
                          >
                            {truncatePrincipal(comment.authorPrincipal)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                          {comment.body}
                        </p>
                      </div>
                      {isMine && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-muted-foreground/40 hover:text-destructive transition-colors flex-shrink-0 mt-0.5"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </div>

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
