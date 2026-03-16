# EduAI Course Platform

## Current State
The app has an Admin Dashboard (`/admin`) for the admin account. There is no Creator Dashboard for regular course creators. The navbar shows Home, Browse Courses, Community, and Admin (for admins) links, plus a Create Course button.

## Requested Changes (Diff)

### Add
- New `CreatorDashboardPage` at `/my-dashboard` showing only the current logged-in user's courses
- "My Dashboard" navbar link visible only to logged-in users
- Page includes: list of creator's own courses (filtered from getAllCourses by creator principal), course stats (lesson count, has quiz), delete course option, and a link to create a new course

### Modify
- `App.tsx`: add `my-dashboard` page route and import
- `Navbar.tsx`: add "My Dashboard" link for logged-in users

### Remove
- Nothing removed

## Implementation Plan
1. Create `CreatorDashboardPage.tsx` that fetches all courses, filters by the caller's principal, and displays them in a card grid with delete and view actions
2. Add route in `App.tsx`
3. Add navbar link in `Navbar.tsx` for logged-in users
