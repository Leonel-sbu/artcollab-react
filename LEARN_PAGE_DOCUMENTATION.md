# Learn Page - Technical Documentation

## Overview

The Learn page (`frontend/src/pages/Learn.jsx`) is a comprehensive Learning Management System (LMS) interface that allows users to:
- **Discover** courses from expert artists
- **My Learning** - View enrolled courses and continue learning
- **Teach** - Create and manage courses as an instructor
- **Progress** - Track learning progress, points, and level

---

## Page Structure

### 1. Main Components

#### Header Section (Lines 277-283)
- Page title: "Learn & Grow"
- Subtitle describing the platform
- Animated with framer-motion

#### Quick Stats Row (Lines 286-331)
Four stat cards showing:
- **Courses**: Total available courses
- **Students**: Total enrolled students
- **Hours**: Total learning hours
- **Instructors**: Number of instructors

#### Navigation Tabs (Lines 334-375)
Four main navigation buttons:
| Tab | Icon | Purpose |
|-----|------|---------|
| Discover | Search | Browse all courses |
| My Learning | GraduationCap | View enrolled courses |
| Teach | DollarSign | Instructor dashboard |
| Progress | Trophy | User level & stats |

---

## Data Flow Architecture

### State Management

```jsx
// View state (Lines 42)
const [currentView, setCurrentView] = useState("discover");
// Values: "discover" | "my-learning" | "teach" | "progress"

// Data state (Lines 45-53)
const [courses, setCourses] = useState([]);        // All available courses
const [myEnrollments, setMyEnrollments] = useState([]); // User's enrolled courses
const [myCourses, setMyCourses] = useState([]);    // Courses user created
const [earnings, setEarnings] = useState(null);    // Instructor's earnings
const [myLevel, setMyLevel] = useState(null);      // User's level/progress

// Filter state (Line 56)
const [filters, setFilters] = useState({ 
  search: "", 
  category: "", 
  difficulty: "" 
});
```

### API Calls

All data is loaded through `courseService.js`:

| Function | Endpoint | Purpose |
|----------|----------|---------|
| `getCourses(params)` | `GET /api/courses` | Fetch courses with filters |
| `getCategories()` | `GET /api/courses/categories` | Get course categories |
| `getStats()` | `GET /api/courses/stats` | Get platform stats |
| `getMyEnrollments()` | `GET /api/courses/my-enrollments` | Get user's enrolled courses |
| `getMyCourses()` | `GET /api/courses/my-courses` | Get courses user created |
| `getEarnings()` | `GET /api/courses/instructor/earnings` | Get instructor earnings |
| `getMyLevel()` | `GET /api/courses/my-level` | Get user level/progress |
| `getCourse(id)` | `GET /api/courses/:id` | Get single course details |
| `createCourse(data)` | `POST /api/courses` | Create new course |
| `enrollCourse(id)` | `POST /api/courses/:id/enroll` | Enroll in course |
| `completeLesson(id, index)` | `POST /api/courses/:id/progress/complete` | Mark lesson complete |

---

## View Modes

### 1. Discover View (currentView === "discover")

**Features:**
- Search bar with text input
- Category dropdown filter
- Difficulty dropdown (Beginner/Intermediate/Advanced)
- Course grid (1-4 columns responsive)
- "Create Course" button (visible when authenticated)

**Course Card Display:**
```
┌─────────────────────────────┐
│  [Thumbnail Gradient]       │
│        🎬 Featured          │
├─────────────────────────────┤
│ 🎨 Beginner                 │
│ Course Title                │
│ by Instructor Name          │
│ ⏱️ 8h  •  👥 1,245         │
│                             │
│ R 499    [View]             │
└─────────────────────────────┘
```

### 2. My Learning View (currentView === "my-learning")

**Data Source:**
```jsx
// Line 258
return myEnrollments.filter(e => e).map(e => e.course || e);
```

**Features:**
- Shows only enrolled courses
- Button text changes to "Continue"
- Course cards show progress indicator

### 3. Teach View (currentView === "teach")

**Features:**
- Earnings dashboard with 3 cards:
  - Total Earnings (ZAR)
  - Total Students
  - Published Courses
- Course management grid
- Empty state with "Create First Course" CTA

**Earnings Data Structure:**
```javascript
// From backend (Line 96-110)
{
  totalEarnings: number,
  totalStudents: number,
  totalCourses: number,
  courses: [
    { _id, title, earnings, students, enrollmentCount }
  ]
}
```

### 4. Progress View (currentView === "progress")

**Features:**
- Level card with:
  - Level number (1-100)
  - Progress bar to next level
  - Points to next level
- Stats grid:
  - Total Points
  - Day Streak
  - Completed Courses
  - Average Progress %

**Level Data Structure:**
```javascript
{
  level: number,
  totalPoints: number,
  pointsToNextLevel: number,
  levelProgress: number,  // percentage
  totalStreak: number,
  completedCourses: number,
  avgProgress: number
}
```

---

## Modals

### 1. Create Course Modal (Lines 622-689)

**Form Fields:**
- Title (required)
- Category dropdown
- Difficulty dropdown
- Description textarea
- Pricing (three options):
  - One-time (ZAR)
  - Monthly (ZAR)
  - Yearly (ZAR)

**Submission:**
```javascript
// Lines 162-169
const courseData = {
  ...formData,
  pricing: {
    oneTime: { enabled: formData.pricingOneTime > 0, price: parseInt(formData.pricingOneTime) },
    monthly: { enabled: formData.pricingMonthly > 0, price: parseInt(formData.pricingMonthly) },
    yearly: { enabled: formData.pricingYearly > 0, price: parseInt(formData.pricingYearly) }
  }
};
```

### 2. Course View Modal (Lines 693-750+)

**Features when NOT enrolled:**
- Full course details
- Enroll button with pricing options
- Lesson preview list

**Features when enrolled:**
- Course details
- Progress indicator
- "Start Learning" button
- Lesson list with completion status
- Unlocked lessons based on completion

### 3. Course Player Modal

**Features:**
- Video player with controls
- Progress tracking
- Lesson sidebar
- Completion tracking
- Assignment submission

---

## Category Configuration

```javascript
// Lines 20-29
const categoryConfig = {
  art: { name: "Digital Art", icon: "🎨", color: "from-pink-500 to-rose-500" },
  design: { name: "Design", icon: "✏️", color: "from-purple-500 to-indigo-500" },
  "3d": { name: "3D Modeling", icon: "🎲", color: "from-blue-500 to-cyan-500" },
  animation: { name: "Animation", icon: "🎬", color: "from-orange-500 to-red-500" },
  photography: { name: "Photography", icon: "📷", color: "from-green-500 to-emerald-500" },
  music: { name: "Music", icon: "🎵", color: "from-violet-500 to-purple-500" },
  business: { name: "Business", icon: "💼", color: "from-yellow-500 to-amber-500" },
  other: { name: "Other", icon: "🎭", color: "from-gray-500 to-slate-500" }
};
```

---

## Difficulty Colors

```javascript
// Lines 31-36
const difficultyColors = {
  beginner: "bg-green-500/20 text-green-400 border border-green-500/30",
  intermediate: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  advanced: "bg-red-500/20 text-red-400 border border-red-500/30",
  all: "bg-blue-500/20 text-blue-400 border border-blue-500/30"
};
```

---

## Event Handlers

### handleCreateCourse (Lines 159-181)
1. Prevent default form submission
2. Transform form data to course format
3. Call `createCourse(courseData)`
4. Show success toast
5. Close modal
6. Refresh all learning data

### handleEnroll (Lines 183-194)
1. Call `enrollCourse(courseId)`
2. Show success toast
3. Refresh learning data
4. Navigate to "my-learning" view

### handleViewCourse (Lines 196-213)
1. Fetch course details via `getCourse(course._id)`
2. If enrolled, fetch progress via `getMyProgress(course._id)`
3. Open course modal with data

### handleCompleteLesson (Lines 220-231)
1. Call `completeLesson(courseId, lessonIndex)`
2. Show success toast with "+5 points"
3. Refresh progress
4. Close player modal

### handleSubmitAssignment (Lines 233-243)
1. Call `submitAssignment(courseId, lessonIndex, assignmentForm)`
2. Show success toast with "+10 points"
3. Close assignment modal
4. Clear form

---

## Course Card Component

Each course card displays:
- **Thumbnail**: Gradient based on category
- **Category Icon**: From categoryConfig
- **Difficulty Badge**: Colored by difficultyColors
- **Title**: Course name (max 2 lines)
- **Instructor**: Instructor name
- **Meta**: Duration + enrollment count
- **Price**: One-time price or "Free"
- **Action Button**: "View" or "Continue"

---

## Default Courses (Fallback)

```javascript
// Lines 246-250
const defaultCourses = [
  { _id: "1", title: "Digital Painting Fundamentals", ... },
  { _id: "2", title: "3D Modeling for Beginners", ... },
  { _id: "3", title: "AI Art Masterclass", ... }
];
```

Used when API returns empty results.

---

## Backend Integration

### CourseController Methods (backend/src/controllers/courseController.js)

| Method | Route | Description |
|--------|-------|-------------|
| `list` | GET /api/courses | List all published courses |
| `getCategories` | GET /api/courses/categories | Get categories |
| `myCourses` | GET /api/courses/my-courses | Get instructor's courses |
| `myEnrollments` | GET /api/courses/my-enrollments | Get user's enrollments |
| `getEarnings` | GET /api/courses/instructor/earnings | Get earnings |
| `getById` | GET /api/courses/:id | Get course by ID |
| `create` | POST /api/courses | Create course |
| `enroll` | POST /api/courses/:id/enroll | Enroll in course |
| `completeLesson` | POST /api/courses/:id/progress/complete | Complete lesson |

---

## Authentication Integration

```javascript
// Line 39
const { user, isAuthed } = useAuth() || {};
```

- `user`: Current logged-in user object
- `isAuthed`: Boolean authentication status

Used to:
- Show/hide "Create Course" button
- Determine enrollment eligibility

---

## Styling

- **Background**: `bg-gradient-to-b from-gray-900 to-black`
- **Cards**: `bg-gray-800/40` with `border-gray-700/30`
- **Buttons**: Gradient backgrounds with hover effects
- **Modals**: Fixed overlay with `bg-black/80`
- **Animations**: framer-motion for smooth transitions

---

## Error Handling

```javascript
// Lines 99-104, 129-134
catch (err) {
  console.error("Failed to load:", err);
  if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
    toast.error("Unable to connect to server.");
  }
}
```

- Network errors show toast notification
- All errors logged to console
- Loading states managed for all async operations

---

## Dependencies

- `react` - UI framework
- `framer-motion` - Animations
- `lucide-react` - Icons
- `react-hot-toast` - Notifications
- `axios` - HTTP client (via api service)

---

## File Location

- **Main Page**: `frontend/src/pages/Learn.jsx`
- **Course Service**: `frontend/src/services/courseService.js`
- **Course Player**: `frontend/src/components/courses/CoursePlayer.jsx`
- **Backend Controller**: `backend/src/controllers/courseController.js`
- **Course Model**: `backend/src/models/Course.js`
