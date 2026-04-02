# Learn Page Documentation

**Page:** `/learn`  
**Component:** `frontend/src/pages/Learn.jsx`  
**Backend API:** `backend/src/controllers/courseController.js`

---

## 1. Overview

The **Learn** page is a comprehensive learning management system (LMS) that allows users to:
- **Discover** and browse courses
- **Enroll** in courses to learn
- **Teach** by creating and selling courses
- **Track progress** with gamification (points & levels)

---

## 2. Page Navigation

The page has 4 main views accessible via tabs:

| Tab | View | Description |
|-----|------|-------------|
| 🔍 **Discover** | `discover` | Browse all available courses with filters |
| 🎓 **My Learning** | `my-learning` | View enrolled courses |
| 💰 **Teach** | `teach` | Create courses and view earnings |
| 🏆 **Progress** | `progress` | View user level and achievements |

---

## 3. Features

### 3.1 Quick Stats Dashboard
At the top of the page, users see platform statistics:
- **Courses:** Total number of courses (50+)
- **Students:** Total students enrolled (10K+)
- **Hours:** Total learning hours (200+)
- **Instructors:** Number of instructors (25+)

### 3.2 Discover View
Allows users to search and filter courses:

**Filters:**
- **Search:** Text search by course title/description
- **Category:** Filter by category
- **Difficulty:** beginner, intermediate, advanced, all

**Course Categories:**
| Category | Icon | Color |
|----------|------|-------|
| art | 🎨 | pink → rose |
| design | ✏️ | purple → indigo |
| 3d | 🎲 | blue → cyan |
| animation | 🎬 | orange → red |
| photography | 📷 | green → emerald |
| music | 🎵 | violet → purple |
| business | 💼 | yellow → amber |
| other | 🎭 | gray → slate |

**Difficulty Badges:**
| Level | Color |
|-------|-------|
| beginner | green |
| intermediate | yellow |
| advanced | red |
| all | blue |

**Course Card Displays:**
- Thumbnail with category gradient
- Play button overlay
- Title and instructor name
- Duration (in hours)
- Enrollment count
- Price (or "Free")

### 3.3 My Learning View
Shows courses the user has enrolled in:
- Displays enrolled courses
- Shows progress percentage for each course
- "Continue" button to resume learning

### 3.4 Teach View (Instructor Dashboard)
For course creators to manage their courses:

**Earnings Dashboard:**
- **Total Earnings:** Revenue from course sales (ZAR)
- **Students:** Total enrolled students
- **Published:** Number of published courses

**Create Course Button:**
Opens a modal to create new courses

### 3.5 Progress View (Gamification)
Tracks user learning achievements:

**Level System:**
- Levels 1-10
- Points required: 100 points per level
- Progress bar showing completion to next level

**Stats Displayed:**
- **Total Points:** Accumulated points
- **Day Streak:** Consecutive days learning
- **Completed Courses:** Number of finished courses
- **Avg Progress:** Average course completion

**Points System:**
- Complete lesson: +5 points
- Submit assignment: +10 points

---

## 4. API Endpoints

### Course Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | Get all courses (with filters) |
| GET | `/api/courses/categories` | Get course categories |
| GET | `/api/courses/stats` | Get platform stats |
| GET | `/api/courses/my-courses` | Get instructor's courses |
| GET | `/api/courses/my-enrollments` | Get user's enrollments |
| GET | `/api/courses/instructor/earnings` | Get instructor earnings |
| GET | `/api/courses/:id` | Get single course |
| POST | `/api/courses` | Create new course |
| PATCH | `/api/courses/:id` | Update course |
| DELETE | `/api/courses/:id` | Delete course |

### Enrollment & Progress

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/courses/:id/enroll` | Enroll in course |
| GET | `/api/courses/:id/progress` | Get user's progress |
| POST | `/api/courses/:id/progress/complete` | Mark lesson complete |
| POST | `/api/courses/:id/assignments` | Submit assignment |
| GET | `/api/courses/:id/submissions` | Get student submissions (instructor) |
| PATCH | `/api/courses/:id/enrollments/:id/grade` | Grade assignment |

### User Progress

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses/my-level` | Get user's level & points |

---

## 5. Data Models

### Course Model (`backend/src/models/Course.js`)

```javascript
{
  title: String,           // Course title
  description: String,    // Full description
  thumbnailUrl: String,   // Course image
  
  instructor: ObjectId,  // Reference to User
  
  pricing: {
    oneTime: { enabled, price, currency },
    monthly: { enabled, price, currency },
    yearly: { enabled, price, currency },
    subscription: { enabled, monthlyPrice, yearlyPrice }
  },
  
  category: String,        // art, design, 3d, animation, photography, music, business, other
  difficulty: String,     // beginner, intermediate, advanced, all
  tags: [String],         // Search tags
  
  lessons: [{
    title: String,
    description: String,
    videoUrl: String,
    durationSec: Number,
    order: Number,
    isFree: Boolean      // Free preview
  }],
  
  totalDurationSec: Number,
  enrollmentCount: Number,
  rating: Number,
  
  revenue: {
    oneTimeEarnings: Number,
    subscriptionEarnings: Number,
    totalEarnings: Number,
    totalStudents: Number
  },
  
  status: String,         // draft, published, archived
  isFeatured: Boolean,
  
  learningOutcomes: [String],
  requirements: [String]
}
``` 

### Enrollment Model (`backend/src/models/Enrollment.js`)

```javascript
{
  user: ObjectId,         // Reference to User
  course: ObjectId,       // Reference to Course
  
  completedLessons: [Number],  // Lesson indexes
  progressPercent: Number,
  
  currentLevel: Number,   // 1-10
  totalPoints: Number,
  streakDays: Number,
  lastActivityDate: Date,
  
  assignments: [{
    lessonIndex: Number,
    title: String,
    submissionUrl: String,
    submissionText: String,
    grade: Number,
    feedback: String,
    status: String
  }],
  
  isCompleted: Boolean,
  completedAt: Date,
  certificateUrl: String,
  
  enrollmentType: String,  // one-time, monthly, yearly
  expiresAt: Date
}
```

---

## 6. Frontend Components

### State Management

```javascript
// View State
const [currentView, setCurrentView] = useState("discover");

// Data State
const [courses, setCourses] = useState([]);
const [myEnrollments, setMyEnrollments] = useState([]);
const [myCourses, setMyCourses] = useState([]);
const [earnings, setEarnings] = useState(null);
const [myLevel, setMyLevel] = useState(null);

// Filter State
const [filters, setFilters] = useState({
  search: "",
  category: "",
  difficulty: ""
});

// Modal State
const [showCreateModal, setShowCreateModal] = useState(false);
const [showCourseModal, setShowCourseModal] = useState(false);
const [showPlayerModal, setShowPlayerModal] = useState(false);
const [showAssignmentModal, setShowAssignmentModal] = useState(false);
```

### Key Functions

| Function | Description |
|----------|-------------|
| `loadInitialData()` | Loads categories and stats |
| `loadData()` | Loads data based on current view |
| `handleCreateCourse()` | Creates a new course |
| `handleEnroll()` | Enrolls user in course |
| `handleViewCourse()` | Opens course details modal |
| `handleStartLesson()` | Opens video player |
| `handleCompleteLesson()` | Marks lesson complete (+5 pts) |
| `handleSubmitAssignment()` | Submits assignment (+10 pts) |
| `refreshAllLearningData()` | Refreshes all learning data |

---

## 7. UI Components

### Modals

1. **Create Course Modal**
   - Title input
   - Category selector
   - Difficulty selector
   - Description textarea
   - Pricing (one-time, monthly, yearly)

2. **Course Details Modal**
   - Course thumbnail & icon
   - Title & description
   - Instructor info
   - Pricing options
   - Progress bar (if enrolled)
   - Lessons list (if enrolled)
   - Enroll/Continue buttons

3. **Video Player Modal**
   - Video display area
   - Lesson title
   - Mark Complete button
   - Submit Assignment button

4. **Assignment Modal**
   - Text submission input
   - URL submission input
   - Submit button

---

## 8. Animations

The page uses **Framer Motion** for animations:

| Animation | Location |
|-----------|----------|
| Fade in + slide up | Header |
| Fade in | Filters, Teach/Progress views |
| Stagger fade | Course cards (0.03s delay each) |
| Scale + fade | Modals |

---

## 9. Dependencies

### Frontend
- `react` - UI framework
- `framer-motion` - Animations
- `lucide-react` - Icons
- `react-hot-toast` - Notifications

### Backend
- `mongoose` - MongoDB ODM
- `express` - Web framework
- `jsonwebtoken` - JWT auth

---

## 10. Error Handling

- Network errors display toast notification
- API errors show user-friendly messages
- Loading states show spinner
- Empty states show helpful messages with action buttons

---

## 11. Route Configuration

The page is accessible at `/learn` route (defined in `App.jsx`).

---

## 12. Usage Flow

### Student Flow
1. Browse courses on Discover
2. Filter by category/difficulty
3. Click course to view details
4. Click "Enroll Now"
5. Start learning in My Learning
6. Complete lessons to earn points
7. Level up in Progress view

### Instructor Flow
1. Switch to Teach tab
2. Click "Create Course"
3. Fill in course details
4. Publish course
5. View earnings in dashboard
6. Grade student submissions
