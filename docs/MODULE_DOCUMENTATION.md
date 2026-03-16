# ArtCollab Application Technical Documentation

## Module 1: Profile Module

### Overview

The Profile module provides users with a personalized dashboard to manage their account information, view their artworks, track purchases, and monitor their learning progress. It supports multiple user roles: admin, artist, buyer, and learner.

---

### 1.1 Functional Behavior and User Interactions

#### Core Features

1. **Profile Viewing**
   - Users can view their profile with avatar, cover image, bio, location, and role
   - Profile displays member since date
   - Stats display: followers, following, artworks count, sales count, views, earnings

2. **Tab Navigation**
   - **Overview Tab**: Shows monthly earnings, views, and recent orders
   - **My Artworks Tab**: Displays user's uploaded artworks (placeholder - requires navigation to upload)
   - **Purchases Tab**: Shows purchase history with order details
   - **My Courses Tab**: Shows enrolled courses

3. **URL-Based Tab State**
   - Tab state can be controlled via URL query parameter: `?tab=overview|artworks|purchases|courses`

4. **Authentication Flow**
   - Unauthenticated users see a login prompt
   - Loading state while fetching user data
   - Redirect to login page if not authenticated

#### User Interactions

```javascript
// Tab switching
setActiveTab(tabId);

// Load user data on mount
useEffect(() => {
    if (user) loadUserData();
}, [user]);

// Order retrieval from API
const ordersResponse = await cartService.getOrders();
```

---

### 1.2 Data Structure and Architecture

#### Frontend Data Model (Profile.jsx)

```javascript
const userData = {
    name: user?.name || user?.displayName || 'Artist',
    email: user?.email || '',
    avatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'user'}`,
    bio: user?.bio || 'Digital artist and creative enthusiast.',
    location: user?.location || 'Johannesburg, South Africa',
    role: user?.role || 'Member',
    joinedAt: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' }) : 'Unknown'
};

const userStats = {
    followers: 0,
    following: 0,
    artworks: 0,
    sales: 0,
    views: 0,
    earnings: 0
};
```

#### Backend User Model (backend/src/models/User.js)

```javascript
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'artist', 'buyer', 'learner'], default: 'buyer' }
}, { timestamps: true });
```

#### Database Relationships

| Field | Type | Description |
|-------|------|-------------|
| name | String | User's display name |
| email | String (unique) | User's email address |
| passwordHash | String | Bcrypt hashed password |
| role | Enum | admin, artist, buyer, learner |
| createdAt | Date | Account creation timestamp |
| updatedAt | Date | Last update timestamp |

---

### 1.3 UI Components and Relationships

#### Component Hierarchy

```
Profile.jsx (Page)
├── Profile Header
│   ├── Cover Image (gradient background)
│   ├── Avatar (DiceBear generated)
│   ├── User Info (name, location, role badge)
│   ├── Bio
│   └── Stats Row (followers, following, artworks, sales)
├── Tab Navigation
│   ├── Overview Tab
│   │   ├── Quick Stats Card (earnings, views)
│   │   └── Recent Orders Card
│   ├── My Artworks Tab (placeholder)
│   ├── Purchases Tab (order list)
│   └── My Courses Tab (placeholder)
```

#### Key Components

| Component | File | Purpose |
|-----------|------|---------|
| Profile | `frontend/src/pages/Profile.jsx` | Main profile page with tabs |
| ProtectedRoute | `frontend/src/components/ProtectedRoute.jsx` | Auth protection wrapper |

---

### 1.4 API Endpoints

#### Related Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/me` | GET | Get current user profile |
| `/api/orders/mine` | GET | Get user's order history |
| `/api/courses/my-enrollments` | GET | Get user's enrolled courses |

#### Frontend Service Calls

```javascript
// Profile loads orders via cartService
await cartService.getOrders();

// Auth context provides user
const { user } = useAuth();
```

---

### 1.5 Strengths

1. **Clean Tab-Based Navigation**: Intuitive tab system with URL state support
2. **Responsive Design**: Mobile-friendly layout with proper breakpoints
3. **Role-Based Display**: Shows user role badge
4. **Loading States**: Proper loading indicators during data fetch
5. **Fallback Data**: Graceful defaults when user data is missing
6. **Currency Formatting**: Proper ZAR currency formatting via `formatZAR()`

---

### 1.6 Limitations and Issues

1. **Incomplete Stats**: All stats (followers, following, views, earnings) are hardcoded to 0 or derived from orders only
2. **No Artwork Display**: My Artworks tab shows placeholder instead of actual artworks
3. **No Edit Functionality**: No way to edit profile information (name, bio, location, avatar)
4. **Limited User Data**: Backend User model lacks many common profile fields (avatar, bio, location)
5. **No Follow System**: Followers/following counts are always 0 - no follow functionality implemented
6. **No Course Display**: My Courses tab shows placeholder instead of actual enrollments
7. **Hardcoded Defaults**: Bio and location have hardcoded fallback values
8. **No Profile Pictures**: No upload functionality for avatar/cover images

---

### 1.7 Recommendations for Improvement

1. **Add Profile Editing**: Create edit profile form with avatar upload
2. **Implement Follow System**: Add follower/following data model and API
3. **Fetch Real Stats**: Connect to dashboard API for actual statistics
4. **Display Artworks**: Query and display user's uploaded artworks
5. **Display Enrollments**: Connect to course enrollment API
6. **Extend User Model**: Add avatar, bio, location, social links fields
7. **Add Cover Image**: Allow users to upload custom cover photos

---

## Module 2: Messages Module

### Overview

The Messages module provides real-time messaging capabilities between users. It supports 1:1 conversations, message status tracking (sent, delivered, read), unread counts, and conversation archiving. Conversations can be linked to specific resources (artwork, commission, order, course).

---

### 2.1 Functional Behavior and User Interactions

#### Core Features

1. **Conversation Management**
   - View list of all conversations sorted by recent activity
   - Create new conversations with any user
   - Archive/delete conversations
   - Conversation types: general, artwork, commission, order, course

2. **Messaging**
   - Send text messages
   - Support for file attachments (images, files)
   - Message status: sent → delivered → read
   - Soft delete messages

3. **Real-Time Indicators**
   - Unread message count badges
   - Online status indicators (always shows online)
   - Typing indicators (UI present but not functional)

4. **Navigation**
   - URL-based conversation selection: `/messages/:conversationId`
   - Mobile-responsive layout with back button

#### User Interactions

```javascript
// Load conversations
const result = await getConversations();

// Load messages for conversation
const result = await getMessages(convId);

// Send message
const result = await sendMessage(conversationId, text);

// Mark as read
await markAsRead(messageId);
```

---

### 2.2 Data Structure and Architecture

#### Conversation Model (backend/src/models/Conversation.js)

```javascript
const conversationSchema = new mongoose.Schema({
    // Participants (2 users for 1:1)
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],

    // Conversation type
    type: {
        type: String,
        enum: ['general', 'artwork', 'commission', 'order', 'course'],
        default: 'general'
    },

    // Linked resource (optional)
    linkedResource: {
        resourceType: { type: String, enum: ['artwork', 'commission', 'order', 'course', null] },
        resourceId: { type: mongoose.Schema.Types.ObjectId }
    },

    // Last message preview
    lastMessage: {
        text: { type: String, default: '' },
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        sentAt: { type: Date, default: null }
    },

    // Unread counts per participant (Map)
    unreadCount: { type: Map, of: Number, default: {} },

    // Archive/soft delete per user
    archivedBy: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        archivedAt: { type: Date }
    }],

    // Mute notifications per user
    mutedBy: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        mutedAt: { type: Date }
    }]
}, { timestamps: true });
```

#### Message Model (backend/src/models/Message.js)

```javascript
const messageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
    
    // Read tracking
    readBy: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        readAt: { type: Date }
    }],
    
    deliveredAt: { type: Date, default: null },
    readAt: { type: Date, default: null },
    
    // Attachment
    attachment: {
        hasAttachment: { type: Boolean, default: false },
        type: { type: String, enum: ['image', 'file', null] },
        url: { type: String, default: '' },
        filename: { type: String, default: '' },
        size: { type: Number, default: 0 },
        mimeType: { type: String, default: '' }
    },
    
    // Soft delete per user
    deletedBy: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        deletedAt: { type: Date }
    }]
}, { timestamps: true });
```

#### Database Indexes

```javascript
// Conversation indexes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ 'linkedResource.resourceType': 1, 'linkedResource.resourceId': 1 });
conversationSchema.index({ updatedAt: -1 });
conversationSchema.index({ 'lastMessage.sentAt': -1 });

// Message indexes
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ 'readBy.userId': 1 });
```

---

### 2.3 UI Components and Relationships

#### Component Hierarchy

```
MessagesPage.jsx (Page)
├── ConversationList Component
│   ├── Search Bar
│   ├── Conversation Items
│   │   ├── Avatar (gradient with initials)
│   │   ├── User Name
│   │   ├── Last Message Preview
│   │   ├── Unread Badge
│   │   └── Conversation Type Badge
│   └── Empty State
└── ChatWindow Component
    ├── Header (user info, action buttons)
    ├── Messages Container
    │   ├── Date Separators
    │   └── MessageBubble Components
    │       ├── Avatar
    │       ├── Message Content
    │       └── Timestamp
    ├── Typing Indicator
    └── Message Input
        ├── Attachment Button
        ├── Textarea
        └── Send Button
```

#### Key Components

| Component | File | Purpose |
|-----------|------|---------|
| MessagesPage | `frontend/src/pages/MessagesPage.jsx` | Main messaging page |
| ConversationList | `frontend/src/components/messaging/ConversationList.jsx` | List of conversations |
| ChatWindow | `frontend/src/components/messaging/ChatWindow.jsx` | Message display and input |
| MessageBubble | `frontend/src/components/messaging/MessageBubble.jsx` | Individual message display |

#### Frontend Service (frontend/src/services/messageService.js)

```javascript
// Conversation endpoints
getConversations();
createConversation(participantId, type, linkedResource);
getConversation(conversationId);
deleteConversation(conversationId);

// Message endpoints
getMessages(conversationId, { limit, before });
sendMessage(conversationId, text, attachment);
markAsRead(messageId);
deleteMessage(messageId);

// Unread count
getUnreadCount();

// Legacy endpoints
getChats();
getThread(userId);
send(toUserId, text);
```

---

### 2.4 API Endpoints

#### Backend Routes (backend/src/routes/messageRoutes.js)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/messages/conversations` | GET | Get all conversations for user |
| `/api/messages/conversations` | POST | Create new conversation |
| `/api/messages/conversations/:id` | GET | Get single conversation |
| `/api/messages/conversations/:id` | DELETE | Archive conversation |
| `/api/messages/conversations/:id/messages` | GET | Get messages in conversation |
| `/api/messages/conversations/:id/messages` | POST | Send message |
| `/api/messages/:messageId/read` | PUT | Mark message as read |
| `/api/messages/:messageId` | DELETE | Delete message |
| `/api/messages/unread-count` | GET | Get total unread count |
| `/api/messages/chats` | GET | Legacy: list chats |
| `/api/messages/thread/:userId` | GET | Legacy: get thread |
| `/api/messages/send` | POST | Legacy: send message |

---

### 2.5 Strengths

1. **Well-Structured Data Model**: Proper normalization with Conversation and Message models
2. **Soft Delete**: Messages and conversations can be archived/deleted per user
3. **Unread Tracking**: Per-user unread count with Map data structure
4. **Linked Resources**: Support for linking conversations to artworks, orders, etc.
5. **Message Status**: Full sent → delivered → read tracking
6. **Rich UI**: Good visual design with avatars, badges, timestamps
7. **Mobile Responsive**: Proper responsive layout with back navigation
8. **Rate Limiting**: Message sending is rate-limited
9. **Pagination**: Support for loading older messages

---

### 2.6 Limitations and Issues

1. **No Real-Time Updates**: Messages don't update in real-time (no WebSocket)
2. **Fake Online Status**: Always shows "Online" indicator regardless of actual status
3. **Typing Indicator Non-Functional**: UI exists but no typing detection/socket
4. **Limited Attachment Support**: UI button exists but file upload not implemented
5. **No Group Messaging**: Only 1:1 conversations supported
6. **No Message Reactions**: Cannot react to messages
7. **No Message Search**: Cannot search within conversations
8. **No Notification System**: No push notifications for new messages
9. **Legacy Routes**: Some routes seem redundant (chats, thread, send vs conversations/messages)

---

### 2.7 Recommendations for Improvement

1. **Implement WebSocket**: Add Socket.io for real-time messaging
2. **Real Online Status**: Track user presence via WebSocket
3. **File Attachments**: Implement complete file upload flow
4. **Message Reactions**: Add emoji reactions
5. **Group Chats**: Support multiple participants
6. **Search**: Full-text search in conversations
7. **Push Notifications**: Add FCM/web push notifications
8. **Typing Indicators**: Real-time typing detection via WebSocket
9. **Clean Up Routes**: Remove legacy endpoints or properly integrate

---

## Module 3: Community Module

### Overview

The Community module provides a social feed where users can share posts with text and images, like posts, and comment on posts. It creates an engaged community environment similar to social media platforms.

---

### 3.1 Functional Behavior and User Interactions

#### Core Features

1. **Post Creation**
   - Text posts with up to 2000 characters
   - Image uploads (single image per post)
   - Image preview before posting

2. **Social Interactions**
   - Like/unlike posts with animated feedback
   - Comment on posts
   - Optimistic UI updates for likes and comments

3. **Feed Display**
   - Chronological post feed (newest first)
   - Lazy loading via React Query
   - Pull-to-refresh ready structure

#### User Interactions

```javascript
// Load posts
const res = await listPosts();

// Create post
const fd = new FormData();
fd.append("content", newPost);
if (image) fd.append("image", image);
const res = await createPost(fd);

// Toggle like
const res = await toggleLike(postId);

// Add comment
const res = await addComment(postId, text);
```

---

### 3.2 Data Structure and Architecture

#### Post Model (backend/src/models/Post.js)

```javascript
const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    // Text content (optional for image-only posts)
    content: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: ""
    },

    // Media (images, videos)
    media: {
        type: [String],
        default: []
    },

    // Likes (array of user IDs)
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    likesCount: {
        type: Number,
        default: 0
    },

    // Comments
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],

    commentsCount: {
        type: Number,
        default: 0
    },

    // Tags
    tags: {
        type: [String],
        default: [],
        index: true
    }
}, { timestamps: true });
```

#### Database Relationships

```
Post (1) ──→ User (author)
Post (1) ──→ User (likes[] - many to many)
Post (1) ──→ Comment (embedded)
    └── Comment (1) ──→ User (commenter)
```

---

### 3.3 UI Components and Relationships

#### Component Hierarchy

```
Community.jsx (Page)
├── Create Post Section
│   ├── Textarea (content input)
│   ├── Image Preview
│   ├── Image Upload Button
│   └── Post Button
└── Posts Feed
    └── Post Item (motion)
        ├── Post Content
        ├── Media (Image)
        ├── Like Button (Heart icon)
        │   └── Like Count
        └── Comments Section
            ├── Comments List
            │   └── Comment Item
            │       ├── Author Name
            │       └── Comment Text
            └── Comment Input
                └── Submit Button
```

---

### 3.4 API Endpoints

#### Backend Routes (backend/src/routes/communityRoutes.js)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/community` | GET | List all posts |
| `/api/community/posts` | GET | Alternative: list posts |
| `/api/community` | POST | Create new post |
| `/api/community/:id/like` | POST | Toggle like |
| `/api/community/:id/comments` | POST | Add comment |

#### Frontend Service (frontend/src/services/communityService.js)

```javascript
export async function listPosts() {
    const res = await api.get("/api/community");
    return res.data;
}

export async function createPost(formData) {
    const res = await api.post("/api/community", formData);
    return res.data;
}

export async function toggleLike(postId) {
    const res = await api.post(`/api/community/${postId}/like`);
    return res.data;
}

export async function addComment(postId, text) {
    const res = await api.post(`/api/community/${postId}/comments`, { text });
    return res.data;
}
```

---

### 3.5 Strengths

1. **Optimistic UI Updates**: Likes and comments update immediately before server response
2. **Image Upload**: FormData-based image upload with preview
3. **Character Limit**: Proper maxlength enforcement (2000 chars)
4. **Embedded Comments**: Comments stored within post for efficient reads
5. **Animation**: Framer Motion animations for smooth transitions
6. **Empty States**: Proper handling when no posts exist
7. **Dark Theme**: Consistent dark styling
8. **Error Handling**: Toast notifications for failures

---

### 3.6 Limitations and Issues

1. **No Pagination**: All posts loaded at once - won't scale
2. **Single Image Only**: Only one image per post
3. **No Video Support**: Videos array in model but not used in UI
4. **No User Profiles**: Cannot tap on author to view profile
5. **No Delete Posts**: Cannot delete own posts
6. **No Edit Posts**: Cannot edit post content
7. **No Report**: Cannot report inappropriate content
8. **No Hashtags**: Tags in model but no UI to use them
9. **No Share**: Cannot share posts
10. **Hardcoded Timestamps**: Uses "Today" separator hardcoded
11. **No Infinite Scroll**: Uses map() instead of virtualized list

---

### 3.7 Recommendations for Improvement

1. **Add Pagination**: Implement cursor-based pagination
2. **Multiple Images**: Allow carousel of multiple images
3. **Video Support**: Add video upload and playback
4. **User Profiles**: Link to author profiles
5. **Post Management**: Add edit and delete functionality
6. **Content Moderation**: Add report functionality
7. **Hashtag Support**: Parse and link hashtags
8. **Share Functionality**: Native share API
9. **Infinite Scroll**: Virtualized list for performance
10. **Real Timestamps**: Use actual date separators

---

## Module 4: Learn Module (Course Platform)

### Overview

The Learn module is a comprehensive learning management system (LMS) with course creation, enrollment, progress tracking, gamification (points/levels), assignment submission, and instructor earnings tracking. It supports multiple pricing models (one-time, monthly, yearly).

---

### 4.1 Functional Behavior and User Interactions

#### Core Features

1. **Course Browsing**
   - Search courses by keyword
   - Filter by category and difficulty
   - Featured courses display
   - Course cards with metadata

2. **Course Creation (Instructors)**
   - Title, description, category, difficulty
   - Multiple pricing options (one-time, monthly, yearly)
   - Tags, requirements, learning outcomes
   - Publish immediately or save as draft

3. **Enrollment**
   - One-time purchase enrollment
   - Progress tracking per lesson
   - Completion certificates (data structure only)

4. **Learning Experience**
   - Lesson completion tracking
   - Video player modal
   - Assignment submission
   - Instructor grading

5. **Gamification**
   - Points system (+5 per lesson, +10 per assignment)
   - Level progression (1-10)
   - Day streak tracking
   - Progress percentage

6. **Instructor Dashboard**
   - Earnings tracking
   - Student submissions
   - Assignment grading

#### User Interactions

```javascript
// Browse courses
const res = await getCourses({ search, category, difficulty });

// Create course
const data = {
    title, description, category, difficulty,
    pricing: { oneTime, monthly, yearly },
    tags, requirements, learningOutcomes
};
await createCourse(data);

// Enroll
await enrollCourse(courseId);

// Complete lesson
await completeLesson(courseId, lessonIndex);

// Submit assignment
await submitAssignment(courseId, { lessonIndex, title, submissionText, submissionUrl });

// Grade assignment (instructor)
await gradeAssignment(courseId, enrollmentId, { lessonIndex, grade, feedback });
```

---

### 4.2 Data Structure and Architecture

#### Course Model (backend/src/models/Course.js)

```javascript
const lessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    durationSec: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
    isFree: { type: Boolean, default: false }
});

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    thumbnailUrl: { type: String, default: '' },
    
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    // Pricing
    pricing: {
        oneTime: { enabled: Boolean, price: Number },
        monthly: { enabled: Boolean, price: Number },
        yearly: { enabled: Boolean, price: Number },
        subscription: { enabled: Boolean, monthlyPrice: Number, yearlyPrice: Number }
    },
    
    category: { type: String, enum: ['art','design','3d','animation','photography','music','business','other'] },
    difficulty: { type: String, enum: ['beginner','intermediate','advanced','all'] },
    tags: { type: [String] },
    
    lessons: { type: [lessonSchema] },
    totalDurationSec: { type: Number },
    
    enrollmentCount: { type: Number },
    rating: { type: Number },
    ratingCount: { type: Number },
    
    // Earnings
    revenue: {
        oneTimeEarnings: Number,
        subscriptionEarnings: Number,
        totalEarnings: Number,
        totalStudents: Number
    },
    
    status: { type: String, enum: ['draft','published','archived'] },
    isFeatured: { type: Boolean },
    
    learningOutcomes: { type: [String] },
    requirements: { type: [String] }
}, { timestamps: true });
```

#### Enrollment Model (backend/src/models/Enrollment.js)

```javascript
const assignmentSchema = new mongoose.Schema({
    lessonIndex: Number,
    title: String,
    submissionUrl: String,
    submissionText: String,
    submittedAt: Date,
    
    // Instructor feedback
    grade: Number, // 0-100
    feedback: String,
    gradedAt: Date,
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    status: { type: String, enum: ['pending','submitted','graded','revision'] }
});

const enrollmentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    
    completedLessons: { type: [Number] },
    progressPercent: { type: Number },
    
    currentLevel: { type: Number }, // 1-10
    totalPoints: { type: Number },
    streakDays: { type: Number },
    lastActivityDate: { type: Date },
    
    assignments: { type: [assignmentSchema] },
    
    isCompleted: { type: Boolean },
    completedAt: Date,
    certificateUrl: { type: String },
    
    enrollmentType: { type: String, enum: ['one-time','monthly','yearly'] },
    expiresAt: { type: Date }
}, { timestamps: true });
```

#### Database Relationships

```
Course (1) ──→ User (instructor)
Course (1) ──→ Enrollment (many)
Enrollment (1) ──→ User (student)
Enrollment (1) ──→ Course
Enrollment (1) ──→ Assignment (embedded)
    └── Assignment (1) ──→ User (gradedBy)
```

---

### 4.3 UI Components and Relationships

#### Component Hierarchy

```
Learn.jsx (Page - Main Container)
├── Header (title, subtitle)
├── Stats Cards (courses, students, hours, instructors)
├── Tab Navigation
│   ├── Browse Courses Tab
│   │   ├── Search & Filters
│   │   └── Course Grid
│   ├── My Courses Tab (instructor)
│   ├── My Learning Tab
│   ├── Earnings Tab (instructor)
│   └── Level Tab (gamification)
├── Course Cards
│   ├── Thumbnail
│   ├── Category Badge
│   ├── Title
│   ├── Instructor
│   ├── Pricing
│   └── Actions (View, Enroll)
├── Create Course Modal
├── Course Detail Modal
├── Video Player Modal
└── Assignment Modal
```

#### Key Components

| Component | File | Purpose |
|-----------|------|---------|
| Learn | `frontend/src/pages/Learn.jsx` | Main learning platform |
| CourseCard | `frontend/src/components/courses/CourseCard.jsx` | Course display card |
| CoursePlayer | `frontend/src/components/courses/CoursePlayer.jsx` | Video lesson player |

---

### 4.4 API Endpoints

#### Backend Routes (backend/src/routes/courseRoutes.js)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/courses` | GET | List published courses |
| `/api/courses/categories` | GET | Get course categories |
| `/api/courses/stats` | GET | Get platform stats |
| `/api/courses/my-courses` | GET | Instructor's courses |
| `/api/courses/my-enrollments` | GET | Student's enrollments |
| `/api/courses/instructor/earnings` | GET | Instructor earnings |
| `/api/courses/my-level` | GET | User's level/points |
| `/api/courses` | POST | Create course |
| `/api/courses/:id` | GET | Get course details |
| `/api/courses/:id` | PATCH | Update course |
| `/api/courses/:id` | DELETE | Delete course |
| `/api/courses/:id/enroll` | POST | Enroll in course |
| `/api/courses/:id/progress` | GET | Get enrollment progress |
| `/api/courses/:id/progress/complete` | POST | Mark lesson complete |
| `/api/courses/:id/assignments` | POST | Submit assignment |
| `/api/courses/:id/submissions` | GET | Get student submissions |
| `/api/courses/:id/enrollments/:eid/grade` | PATCH | Grade assignment |

#### Frontend Service (frontend/src/services/courseService.js)

```javascript
// Course browsing
getCourses(params);
getCategories();
getStats();

// Instructor
getMyCourses();
getEarnings();

// Student
getMyEnrollments();
getMyLevel();

// Course CRUD
getCourse(id);
createCourse(data);
updateCourse(id, data);
deleteCourse(id);

// Learning
enrollCourse(courseId, paymentType);
getMyProgress(courseId);
completeLesson(courseId, lessonId);
submitAssignment(courseId, assignmentData);

// Grading
getStudentSubmissions(courseId);
gradeAssignment(courseId, enrollmentId, gradeData);
```

---

### 4.5 Strengths

1. **Comprehensive LMS Features**: Full course lifecycle management
2. **Multiple Pricing Models**: One-time, monthly, yearly options
3. **Gamification System**: Points, levels, streaks well implemented
4. **Progress Tracking**: Lesson completion and percentage
5. **Assignment System**: Submit, grade, feedback workflow
6. **Earnings Dashboard**: Instructor revenue tracking
7. **Default Data**: Fallback courses for demo mode
8. **Category System**: 8 categories with icons
9. **Difficulty Levels**: Beginner, intermediate, advanced, all
10. **Responsive Design**: Good mobile layout
11. **Modal System**: Course details, video player, assignments

---

### 4.6 Limitations and Issues

1. **No Actual Video Hosting**: Video URLs but no upload/hosting
2. **No Payment Processing**: Enrollment is free, no real payments
3. **No Certificates**: Data structure but no generation
4. **No Course Content Editor**: Cannot add lessons via UI
5. **No Lesson Reordering**: Order field but no UI
6. **Hardcoded Default Courses**: Demo data mixed with real
7. **No Quiz System**: Only assignments, no quizzes
8. **No Certificates PDF**: No actual certificate generation
9. **No Course Ratings**: Rating fields but no submission UI
10. **Enrollment Data Inconsistency**: Returns enrollment object vs boolean
11. **Lesson Index vs ID**: Uses index instead of lesson ID for progress
12. **No Expiry Logic**: Subscription expiresAt but not enforced

---

### 4.7 Recommendations for Improvement

1. **Video Hosting Integration**: Add AWS S3 or Vimeo integration
2. **Payment Processing**: Integrate Stripe for actual payments
3. **Certificate Generation**: PDF generation with qr verification
4. **Course Builder UI**: Drag-drop lesson ordering, content types
5. **Quiz System**: Add quiz/question types
6. **Rating System**: Add course rating submission
7. **Progress Sync**: Proper sync across devices
8. **Discussion Forums**: Per-lesson discussions
9. **Course Bundles**: Multiple courses package
10. **Instructor Payouts**: Withdrawal system
11. **Analytics**: Course completion, drop-off analysis

---

## Summary

### Cross-Module Findings

#### Shared Patterns
- Consistent API response format: `{ success: boolean, ...data }`
- Authentication via httpOnly cookies and CSRF tokens
- MongoDB/Mongoose for data persistence
- React Context for global state (AuthContext)
- Tailwind CSS for styling
- Lucide React for icons
- React Hot Toast for notifications

#### Common Issues
1. **Limited Real-Time Features**: No WebSocket implementation across modules
2. **Payment Incomplete**: Stripe configured but not fully integrated
3. **File/Image Handling**: Upload endpoints but inconsistent implementation
4. **Search**: Limited search functionality
5. **Pagination**: Missing in Community and potentially others
6. **Error Handling**: Inconsistent error responses

#### Security Considerations
- CSRF protection in place
- httpOnly cookies for auth (good)
- Rate limiting on messages
- Input validation on forms
- Soft deletes for data recovery

#### Scalability Concerns
- No caching layer (Redis)
- No CDN for static assets
- Database queries could benefit from optimization
- No message queue for async processing
- Limited pagination could cause performance issues

---

*Document Version: 1.0*
*Last Updated: 2026-03-16*
*Application: ArtCollab - MERN Stack Art Marketplace*!
