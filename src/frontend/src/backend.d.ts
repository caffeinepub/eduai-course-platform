import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Category {
    id: bigint;
    name: string;
    createdAt: bigint;
    createdBy: Principal;
}
export type Time = bigint;
export interface User {
    username: string;
    dateOfBirth: bigint;
    createdAt: bigint;
    email: string;
}
export interface QuizQuestion {
    question: string;
    correctIndex: bigint;
    options: Array<string>;
}
export interface Quiz {
    questions: Array<QuizQuestion>;
    courseId: bigint;
}
export interface LessonUpdate {
    title: string;
    content?: ExternalBlob;
    order: bigint;
    lessonType: LessonType;
    videoUrl: string;
    courseId: bigint;
}
export interface Course {
    id: bigint;
    categoryId: bigint;
    title: string;
    creator: Principal;
    thumbnail?: ExternalBlob;
    createdAt: bigint;
    description: string;
}
export interface CommunityPostView {
    id: bigint;
    title: string;
    likeCount: bigint;
    body: string;
    createdAt: Time;
    likes: Array<Principal>;
    authorPrincipal: Principal;
}
export interface CommunityComment {
    id: bigint;
    body: string;
    createdAt: Time;
    authorPrincipal: Principal;
    postId: bigint;
}
export interface Lesson {
    id: bigint;
    title: string;
    content?: ExternalBlob;
    order: bigint;
    lessonType: LessonType;
    videoUrl: string;
    courseId: bigint;
}
export interface CourseUpdate {
    categoryId: bigint;
    title: string;
    thumbnail?: ExternalBlob;
    description: string;
}
export interface UserUpdate {
    username: string;
    dateOfBirth: bigint;
    email: string;
}
export interface UserProfile {
    username: string;
    dateOfBirth: bigint;
    createdAt: bigint;
    email: string;
}
export enum LessonType {
    pdf = "pdf",
    video = "video",
    text = "text",
    image = "image"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    askDoubt(courseId: bigint, question: string): Promise<string>;
    askGeneralDoubt(question: string): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCategory(name: string): Promise<void>;
    createComment(postId: bigint, body: string): Promise<bigint>;
    createCourse(title: string, description: string, categoryId: bigint, thumbnail: ExternalBlob | null): Promise<bigint>;
    createLesson(update: LessonUpdate): Promise<bigint>;
    createPost(title: string, body: string): Promise<bigint>;
    createQuiz(courseId: bigint, questions: Array<QuizQuestion>): Promise<void>;
    createUser(userRequest: UserUpdate): Promise<void>;
    deleteCategory(categoryId: bigint): Promise<void>;
    deleteComment(commentId: bigint): Promise<void>;
    deleteCourse(courseId: bigint): Promise<void>;
    deleteLesson(lessonId: bigint): Promise<void>;
    deletePost(id: bigint): Promise<void>;
    deleteUser(user: Principal): Promise<void>;
    getAllCategories(): Promise<Array<Category>>;
    getAllCourses(): Promise<Array<Course>>;
    getAllPosts(): Promise<Array<CommunityPostView>>;
    getAllUsers(): Promise<Array<User>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategory(categoryId: bigint): Promise<Category>;
    getCommentsForPost(postId: bigint): Promise<Array<CommunityComment>>;
    getCourse(courseId: bigint): Promise<Course>;
    getDoubtHistory(courseId: bigint): Promise<{
        question: string;
        answer: string;
        timestamp: bigint;
        courseId: bigint;
    } | null>;
    getLesson(lessonId: bigint): Promise<Lesson>;
    getLessonsForCourse(courseId: bigint): Promise<Array<Lesson>>;
    getPost(id: bigint): Promise<CommunityPostView | null>;
    getQuiz(courseId: bigint): Promise<Quiz | null>;
    getUser(user: Principal): Promise<User>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasUserLiked(postId: bigint, user: Principal): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    likePost(postId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchCoursesByTitle(searchTerm: string): Promise<Array<Course>>;
    unlikePost(postId: bigint): Promise<void>;
    updateCategory(categoryId: bigint, name: string): Promise<void>;
    updateCourse(courseId: bigint, update: CourseUpdate): Promise<void>;
    updateLesson(lessonId: bigint, update: LessonUpdate): Promise<void>;
    updateUser(user: UserUpdate): Promise<void>;
}
