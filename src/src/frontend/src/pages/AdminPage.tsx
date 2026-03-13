import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Shield, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAllCategories,
  useAllCourses,
  useAllUsers,
  useCreateCategory,
  useDeleteCategory,
  useDeleteCourse,
  useIsAdmin,
} from "../hooks/useQueries";
import type { ThemeConfig } from "../utils/seasonalTheme";

interface AdminPageProps {
  theme: ThemeConfig;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  isLoggedIn: boolean;
}

export default function AdminPage({
  theme,
  onNavigate,
  isLoggedIn,
}: AdminPageProps) {
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: categories, isLoading: catsLoading } = useAllCategories();
  const { data: courses, isLoading: coursesLoading } = useAllCourses();
  const { data: users, isLoading: usersLoading } = useAllUsers();

  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const deleteCourse = useDeleteCourse();

  const [newCategory, setNewCategory] = useState("");

  if (!isLoggedIn) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="font-display text-2xl font-bold text-foreground mb-4">
          Not Authorized
        </h2>
        <Button
          onClick={() => onNavigate("home")}
          style={{ background: theme.primaryColor }}
        >
          Go Home
        </Button>
      </main>
    );
  }

  if (adminLoading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-12">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          Access Denied
        </h2>
        <p className="text-muted-foreground mb-4">
          You do not have admin privileges.
        </p>
        <Button onClick={() => onNavigate("home")} variant="outline">
          Go Home
        </Button>
      </main>
    );
  }

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await createCategory.mutateAsync(newCategory.trim());
      setNewCategory("");
      toast.success("Category added!");
    } catch {
      toast.error("Failed to add category");
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: theme.primaryColor }}
        >
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage categories, courses, and users
          </p>
        </div>
      </div>

      <Tabs defaultValue="categories">
        <TabsList className="bg-muted/30 border border-border/50 mb-8">
          <TabsTrigger data-ocid="admin.categories_tab" value="categories">
            Categories ({categories?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger data-ocid="admin.courses_tab" value="courses">
            Courses ({courses?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger data-ocid="admin.users_tab" value="users">
            Users ({users?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        {/* Categories */}
        <TabsContent value="categories">
          <div className="p-6 rounded-2xl bg-card border border-border/50">
            <h2 className="font-display text-lg font-bold text-foreground mb-4">
              Manage Categories
            </h2>

            <div className="flex gap-2 mb-6">
              <Input
                data-ocid="admin.add_category_input"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void handleAddCategory()}
                placeholder="New category name..."
                className="flex-1"
              />
              <Button
                data-ocid="admin.add_category_button"
                onClick={() => void handleAddCategory()}
                disabled={createCategory.isPending || !newCategory.trim()}
                style={{ background: theme.primaryColor }}
              >
                {createCategory.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-1" />
                )}
                Add
              </Button>
            </div>

            {catsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(categories ?? []).map((cat, i) => (
                    <TableRow
                      key={cat.id.toString()}
                      data-ocid={`admin.categories.row.${i + 1}`}
                    >
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {cat.id.toString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          data-ocid={`admin.delete_category_button.${i + 1}`}
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            try {
                              await deleteCategory.mutateAsync(cat.id);
                              toast.success("Category deleted");
                            } catch {
                              toast.error("Failed to delete category");
                            }
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(categories ?? []).length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground py-8"
                      >
                        No categories yet. Add one above.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* Courses */}
        <TabsContent value="courses">
          <div className="p-6 rounded-2xl bg-card border border-border/50">
            <h2 className="font-display text-lg font-bold text-foreground mb-4">
              Manage Courses
            </h2>
            {coursesLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(courses ?? []).map((course, i) => (
                    <TableRow
                      key={course.id.toString()}
                      data-ocid={`admin.courses.row.${i + 1}`}
                    >
                      <TableCell className="font-medium">
                        {course.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {course.id.toString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          data-ocid={`admin.courses.delete_button.${i + 1}`}
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            try {
                              await deleteCourse.mutateAsync(course.id);
                              toast.success("Course deleted");
                            } catch {
                              toast.error("Failed to delete course");
                            }
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(courses ?? []).length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground py-8"
                      >
                        No courses yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users">
          <div className="p-6 rounded-2xl bg-card border border-border/50">
            <h2 className="font-display text-lg font-bold text-foreground mb-4">
              Manage Users
            </h2>
            {usersLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(users ?? []).map((user, i) => (
                    <TableRow
                      key={`${user.username}-${user.email}`}
                      data-ocid={`admin.users.row.${i + 1}`}
                    >
                      <TableCell className="font-medium">
                        {user.username}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {user.email}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          data-ocid={`admin.users.delete_button.${i + 1}`}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled
                          title="Delete user (principal required)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(users ?? []).length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground py-8"
                      >
                        No users registered yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
