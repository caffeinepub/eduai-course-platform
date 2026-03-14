import Map "mo:core/Map";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import Order "mo:core/Order";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type LessonType = {
    #video;
    #pdf;
    #image;
    #text;
  };

  type User = {
    username : Text;
    email : Text;
    dateOfBirth : Int;
    createdAt : Int;
  };

  type UserUpdate = {
    username : Text;
    email : Text;
    dateOfBirth : Int;
  };

  type UserProfile = {
    username : Text;
    email : Text;
    dateOfBirth : Int;
    createdAt : Int;
  };

  type Category = {
    id : Nat;
    name : Text;
    createdBy : Principal;
    createdAt : Int;
  };

  type Course = {
    id : Nat;
    title : Text;
    description : Text;
    categoryId : Nat;
    creator : Principal;
    createdAt : Int;
    thumbnail : ?Storage.ExternalBlob;
  };

  type CourseUpdate = {
    title : Text;
    description : Text;
    categoryId : Nat;
    thumbnail : ?Storage.ExternalBlob;
  };

  type Lesson = {
    id : Nat;
    courseId : Nat;
    title : Text;
    videoUrl : Text;
    lessonType : LessonType;
    content : ?Storage.ExternalBlob;
    order : Nat;
  };

  type LessonUpdate = {
    courseId : Nat;
    title : Text;
    videoUrl : Text;
    lessonType : LessonType;
    content : ?Storage.ExternalBlob;
    order : Nat;
  };

  type QuizQuestion = {
    question : Text;
    options : [Text];
    correctIndex : Nat;
  };

  type Quiz = {
    courseId : Nat;
    questions : [QuizQuestion];
  };

  type Doubt = {
    user : Principal;
    courseId : Nat;
    question : Text;
    answer : Text;
    timestamp : Int;
  };

  module Course {
    public func compare(c1 : Course, c2 : Course) : Order.Order {
      switch (Text.compare(c1.title, c2.title)) {
        case (#equal) { Nat.compare(c1.id, c2.id) };
        case (order) { order };
      };
    };
  };

  type CommunityPost = {
    id : Nat;
    authorPrincipal : Principal;
    title : Text;
    body : Text;
    createdAt : Time.Time;
    likeCount : Nat;
    likes : Set.Set<Principal>;
  };

  type CommunityPostView = {
    id : Nat;
    authorPrincipal : Principal;
    title : Text;
    body : Text;
    createdAt : Time.Time;
    likeCount : Nat;
    likes : [Principal];
  };

  type CommunityComment = {
    id : Nat;
    postId : Nat;
    authorPrincipal : Principal;
    body : Text;
    createdAt : Time.Time;
  };

  let courses = Map.empty<Nat, Course>();
  let categories = Map.empty<Nat, Category>();
  let users = Map.empty<Principal, User>();
  let lessons = Map.empty<Nat, Lesson>();
  let doubts = Map.empty<Principal, { courseId : Nat; question : Text; answer : Text; timestamp : Int }>();
  let quizzes = Map.empty<Nat, Quiz>();
  let communityPosts = Map.empty<Nat, CommunityPost>();
  let communityComments = Map.empty<Nat, CommunityComment>();
  var courseIdCounter = 0;
  var lessonIdCounter = 0;
  var categoryIdCounter = 0;
  var postIdCounter = 0;
  var commentIdCounter = 0;
  let usedEmails = Set.empty<Text>();

  // Seed default categories
  let systemPrincipal = Principal.fromText("aaaaa-aa");
  let seedTime = 0;
  let defaultCategories = [
    "Mathematics",
    "Science",
    "Programming",
    "History",
    "Languages",
    "Arts",
    "Business",
    "Gaming",
    "Sports",
    "AI",
    "Video Editing",
    "Music",
    "Technology",
    "Health & Wellness",
  ];
  for (name in defaultCategories.values()) {
    categoryIdCounter += 1;
    categories.add(
      categoryIdCounter,
      { id = categoryIdCounter; name; createdBy = systemPrincipal; createdAt = seedTime },
    );
  };

  // Prefabricated Storage Mixins
  include MixinStorage();

  // Prefabricated Authorization Mixins
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Helper function to check if user is 18+
  func isUserOver18(user : Principal) : Bool {
    switch (users.get(user)) {
      case (null) { false };
      case (?userData) {
        let currentTime = Time.now();
        let age = (currentTime - userData.dateOfBirth) / (1_000_000_000 * 60 * 60 * 24 * 365);
        age >= 18;
      };
    };
  };

  // Helper function to check if email is admin
  func isAdminEmail(email : Text) : Bool {
    email == "admin@eduai.app";
  };

  // Required Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    switch (users.get(caller)) {
      case (null) { null };
      case (?user) {
        ?{
          username = user.username;
          email = user.email;
          dateOfBirth = user.dateOfBirth;
          createdAt = user.createdAt;
        };
      };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (users.get(user)) {
      case (null) { null };
      case (?userData) {
        ?{
          username = userData.username;
          email = userData.email;
          dateOfBirth = userData.dateOfBirth;
          createdAt = userData.createdAt;
        };
      };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    users.add(
      caller,
      {
        username = profile.username;
        email = profile.email;
        dateOfBirth = profile.dateOfBirth;
        createdAt = profile.createdAt;
      },
    );
  };

  // User CRUD
  public shared ({ caller }) func createUser(userRequest : UserUpdate) : async () {
    if (usedEmails.contains(userRequest.email)) {
      Runtime.trap("Email already in use");
    };

    users.add(
      caller,
      {
        username = userRequest.username;
        email = userRequest.email;
        dateOfBirth = userRequest.dateOfBirth;
        createdAt = Time.now();
      },
    );
    usedEmails.add(userRequest.email);

    if (isAdminEmail(userRequest.email)) {
      AccessControl.assignRole(accessControlState, caller, caller, #admin);
    } else {
      AccessControl.assignRole(accessControlState, caller, caller, #user);
    };
  };

  public query ({ caller }) func getUser(user : Principal) : async User {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view user profiles");
    };
    switch (users.get(user)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?user) { user };
    };
  };

  public query ({ caller }) func getAllUsers() : async [User] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    users.values().toArray();
  };

  public shared ({ caller }) func updateUser(user : UserUpdate) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    if (not users.containsKey(caller)) {
      Runtime.trap("User does not exist");
    };

    switch (users.get(caller)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?existingUser) {
        users.add(
          caller,
          {
            username = user.username;
            email = user.email;
            dateOfBirth = user.dateOfBirth;
            createdAt = existingUser.createdAt;
          },
        );
      };
    };
  };

  public shared ({ caller }) func deleteUser(user : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete users");
    };
    users.remove(user);
  };

  // Category CRUD
  public shared ({ caller }) func createCategory(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can create categories");
    };

    if (not isUserOver18(caller)) {
      Runtime.trap("Unauthorized: Must be 18+ to create categories");
    };

    categoryIdCounter += 1;
    categories.add(
      categoryIdCounter,
      { id = categoryIdCounter; name; createdBy = caller; createdAt = Time.now() },
    );
  };

  public query ({ caller }) func getCategory(categoryId : Nat) : async Category {
    switch (categories.get(categoryId)) {
      case (null) { Runtime.trap("Category does not exist") };
      case (?category) { category };
    };
  };

  public query ({ caller }) func getAllCategories() : async [Category] {
    categories.values().toArray();
  };

  public shared ({ caller }) func updateCategory(categoryId : Nat, name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update categories");
    };

    switch (categories.get(categoryId)) {
      case (null) { Runtime.trap("Category does not exist") };
      case (?existingCategory) {
        if (existingCategory.createdBy != caller) {
          Runtime.trap("Unauthorized: Only the creator can update this category");
        };
        categories.add(
          categoryId,
          {
            id = existingCategory.id;
            name;
            createdBy = existingCategory.createdBy;
            createdAt = existingCategory.createdAt;
          },
        );
      };
    };
  };

  public shared ({ caller }) func deleteCategory(categoryId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete categories");
    };
    categories.remove(categoryId);
  };

  // Course CRUD
  public shared ({ caller }) func createCourse(title : Text, description : Text, categoryId : Nat, thumbnail : ?Storage.ExternalBlob) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can create courses");
    };

    if (not isUserOver18(caller)) {
      Runtime.trap("Unauthorized: Must be 18+ to create courses");
    };

    if (not categories.containsKey(categoryId)) {
      Runtime.trap("Category does not exist");
    };

    courseIdCounter += 1;
    courses.add(
      courseIdCounter,
      {
        id = courseIdCounter;
        title;
        description;
        categoryId;
        creator = caller;
        createdAt = Time.now();
        thumbnail;
      },
    );
    courseIdCounter;
  };

  public query ({ caller }) func getCourse(courseId : Nat) : async Course {
    switch (courses.get(courseId)) {
      case (null) { Runtime.trap("Course does not exist") };
      case (?course) { course };
    };
  };

  public query ({ caller }) func getAllCourses() : async [Course] {
    courses.values().toArray().sort();
  };

  public query ({ caller }) func searchCoursesByTitle(searchTerm : Text) : async [Course] {
    let filteredCourses = courses.values().toArray().filter(
      func(course : Course) : Bool {
        course.title.contains(#text searchTerm);
      }
    );
    filteredCourses.sort();
  };

  public shared ({ caller }) func updateCourse(courseId : Nat, update : CourseUpdate) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update courses");
    };

    switch (courses.get(courseId)) {
      case (null) { Runtime.trap("Course does not exist") };
      case (?existingCourse) {
        if (existingCourse.creator != caller) {
          Runtime.trap("Unauthorized: Only the creator can update the course");
        };
        courses.add(
          courseId,
          {
            id = courseId;
            title = update.title;
            description = update.description;
            categoryId = update.categoryId;
            creator = existingCourse.creator;
            createdAt = existingCourse.createdAt;
            thumbnail = update.thumbnail;
          },
        );
      };
    };
  };

  public shared ({ caller }) func deleteCourse(courseId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete courses");
    };

    switch (courses.get(courseId)) {
      case (null) { Runtime.trap("Course does not exist") };
      case (?course) {
        if (course.creator != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the creator or admin can delete the course");
        };
        courses.remove(courseId);
      };
    };
  };

  // Lesson CRUD
  public shared ({ caller }) func createLesson(update : LessonUpdate) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create lessons");
    };

    switch (courses.get(update.courseId)) {
      case (null) { Runtime.trap("Course does not exist") };
      case (?course) {
        if (course.creator != caller) {
          Runtime.trap("Unauthorized: Only the course creator can add lessons");
        };
      };
    };

    lessonIdCounter += 1;
    lessons.add(
      lessonIdCounter,
      {
        id = lessonIdCounter;
        courseId = update.courseId;
        title = update.title;
        videoUrl = update.videoUrl;
        lessonType = update.lessonType;
        content = update.content;
        order = update.order;
      },
    );
    lessonIdCounter;
  };

  public query ({ caller }) func getLesson(lessonId : Nat) : async Lesson {
    switch (lessons.get(lessonId)) {
      case (null) { Runtime.trap("Lesson does not exist") };
      case (?lesson) { lesson };
    };
  };

  public query ({ caller }) func getLessonsForCourse(courseId : Nat) : async [Lesson] {
    lessons.values().toArray().filter(
      func(l : Lesson) : Bool { l.courseId == courseId }
    );
  };


  public shared ({ caller }) func updateLesson(lessonId : Nat, update : LessonUpdate) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update lessons");
    };

    switch (lessons.get(lessonId)) {
      case (null) { Runtime.trap("Lesson does not exist") };
      case (?existingLesson) {
        switch (courses.get(existingLesson.courseId)) {
          case (null) { Runtime.trap("Course does not exist") };
          case (?course) {
            if (course.creator != caller) {
              Runtime.trap("Unauthorized: Only the course creator can update lessons");
            };
          };
        };

        lessons.add(
          lessonId,
          {
            id = lessonId;
            courseId = update.courseId;
            title = update.title;
            videoUrl = update.videoUrl;
            lessonType = update.lessonType;
            content = update.content;
            order = update.order;
          },
        );
      };
    };
  };

  public shared ({ caller }) func deleteLesson(lessonId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete lessons");
    };

    switch (lessons.get(lessonId)) {
      case (null) { Runtime.trap("Lesson does not exist") };
      case (?lesson) {
        switch (courses.get(lesson.courseId)) {
          case (null) { Runtime.trap("Course does not exist") };
          case (?course) {
            if (course.creator != caller) {
              Runtime.trap("Unauthorized: Only the course creator can delete lessons");
            };
          };
        };
        lessons.remove(lessonId);
      };
    };
  };

  // Quiz functions
  public query ({ caller }) func getQuiz(courseId : Nat) : async ?Quiz {
    quizzes.get(courseId);
  };

  public shared ({ caller }) func createQuiz(courseId : Nat, questions : [QuizQuestion]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create quizzes");
    };

    switch (courses.get(courseId)) {
      case (null) { Runtime.trap("Course does not exist") };
      case (?course) {
        if (course.creator != caller) {
          Runtime.trap("Unauthorized: Only the course creator can create quizzes");
        };
      };
    };

    quizzes.add(courseId, { courseId; questions });
  };

  // Doubt/Chat functions (course-specific, requires login)
  public shared ({ caller }) func askDoubt(courseId : Nat, question : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can ask doubts");
    };

    if (not courses.containsKey(courseId)) {
      Runtime.trap("Course does not exist");
    };

    let answer = "AI answer feature is powered by the Grok API. Please use the Ask a Doubt chat on the homepage for instant answers.";

    doubts.add(
      caller,
      {
        courseId;
        question;
        answer;
        timestamp = Time.now();
      },
    );

    answer;
  };

  // General doubt solving - no auth required, for homepage use
  public func askGeneralDoubt(question : Text) : async Text {
    "AI answer feature powered by Grok. Question received: " # question;
  };

  public query ({ caller }) func getDoubtHistory(courseId : Nat) : async ?{ courseId : Nat; question : Text; answer : Text; timestamp : Int } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view doubt history");
    };

    doubts.get(caller);
  };

  // Community Features
  public shared ({ caller }) func createPost(title : Text, body : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can create posts");
    };
    postIdCounter += 1;
    let newPost : CommunityPost = {
      id = postIdCounter;
      authorPrincipal = caller;
      title;
      body;
      createdAt = Time.now();
      likeCount = 0;
      likes = Set.empty<Principal>();
    };
    communityPosts.add(postIdCounter, newPost);
    postIdCounter;
  };

  public query ({ caller }) func getAllPosts() : async [CommunityPostView] {
    let all = communityPosts.values().toArray();
    all.map(
      func(post) {
        {
          id = post.id;
          authorPrincipal = post.authorPrincipal;
          title = post.title;
          body = post.body;
          createdAt = post.createdAt;
          likeCount = post.likeCount;
          likes = post.likes.toArray();
        };
      }
    );
  };

  public query ({ caller }) func getPost(id : Nat) : async ?CommunityPostView {
    switch (communityPosts.get(id)) {
      case (null) { null };
      case (?post) {
        ?{
          id = post.id;
          authorPrincipal = post.authorPrincipal;
          title = post.title;
          body = post.body;
          createdAt = post.createdAt;
          likeCount = post.likeCount;
          likes = post.likes.toArray();
        };
      };
    };
  };

  public shared ({ caller }) func deletePost(id : Nat) : async () {
    switch (communityPosts.get(id)) {
      case (null) { Runtime.trap("Post does not exist") };
      case (?post) {
        if (post.authorPrincipal != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the author or admin can delete posts");
        };
        communityPosts.remove(id);
      };
    };
  };

  public shared ({ caller }) func createComment(postId : Nat, body : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can comment");
    };

    switch (communityPosts.get(postId)) {
      case (null) { Runtime.trap("Post does not exist") };
      case (_) {
        commentIdCounter += 1;
        communityComments.add(
          commentIdCounter,
          {
            id = commentIdCounter;
            postId;
            authorPrincipal = caller;
            body;
            createdAt = Time.now();
          },
        );
        commentIdCounter;
      };
    };
  };

  public query ({ caller }) func getCommentsForPost(postId : Nat) : async [CommunityComment] {
    communityComments.values().toArray().filter(
      func(comment) { comment.postId == postId }
    );
  };

  public shared ({ caller }) func deleteComment(commentId : Nat) : async () {
    switch (communityComments.get(commentId)) {
      case (null) { Runtime.trap("Comment does not exist") };
      case (?comment) {
        if (comment.authorPrincipal != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the author or admin can delete comments");
        };
        communityComments.remove(commentId);
      };
    };
  };

  public query ({ caller }) func hasUserLiked(postId : Nat, user : Principal) : async Bool {
    switch (communityPosts.get(postId)) {
      case (null) { false };
      case (?post) { post.likes.contains(user) };
    };
  };

  public shared ({ caller }) func likePost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can like posts");
    };
    updateLikes(postId, caller, true);
  };

  public shared ({ caller }) func unlikePost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can unlike posts");
    };
    updateLikes(postId, caller, false);
  };

  func updateLikes(postId : Nat, user : Principal, addLike : Bool) {
    switch (communityPosts.get(postId)) {
      case (null) { Runtime.trap("Post does not exist") };
      case (?post) {
        if (addLike and not post.likes.contains(user)) {
          post.likes.add(user);
        } else if (not addLike and post.likes.contains(user)) {
          post.likes.remove(user);
        };
      };
    };
  };
};
