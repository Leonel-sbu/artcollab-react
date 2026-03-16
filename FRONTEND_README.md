# Frontend Architecture Documentation

**Date:** March 10, 2026  
**Application:** ArtCollab Frontend  
**Framework:** React 18.3.1 + Vite 7.3.1 + Tailwind CSS 3.4.14

---

## 1. Frontend Overview

The ArtCollab frontend is a single-page application (SPA) built with React and Vite. It provides a complete user interface for an art marketplace, learning platform, and community hub with VR features.

### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Framework |
| Vite | 7.3.1 | Build Tool & Dev Server |
| Tailwind CSS | 3.4.14 | Styling |
| React Router DOM | 6.26.2 | Routing |
| Axios | 1.13.4 | HTTP Client |
| Framer Motion | 12.26.2 | Animations |
| Lucide React | 0.562.0 | Icons |
| React Hot Toast | 2.6.0 | Notifications |

### Key Architecture Decisions

- **Cookie-based Authentication**: JWT stored in httpOnly cookies (not localStorage)
- **CSRF Protection**: X-CSRF-Token header for state-changing requests
- **Context API for State**: AuthContext, ThemeContext
- **Service Layer Pattern**: Centralized API calls in `/services` directory
- **Component Organization**: Feature-based directories under `/components`

---

## 2. Route Map

### Public Routes

| Path | Component | Protection |
|------|-----------|------------|
| `/` | Home | None |
| `/login` | Login | None (AuthLayout) |
| `/register` | Register | None (AuthLayout) |
| `/forgot-password` | ForgotPassword | None (AuthLayout) |
| `/reset-password` | ResetPassword | None (AuthLayout) |
| `/marketplace` | Marketplace | None |
| `/vr-studio` | VRStudio | None |
| `/learn` | Learn | None |
| `/services` | Services | None |
| `/community` | Community | None |

### Protected Routes (Requires Login)

| Path | Component | Protection |
|------|-----------|------------|
| `/dashboard` | Dashboard | ProtectedRoute |
| `/profile` | Profile | ProtectedRoute |
| `/cart` | Cart | ProtectedRoute |
| `/messages` | MessagesPage | ProtectedRoute |
| `/messages/:conversationId` | MessagesPage | ProtectedRoute |
| `/upload` | UploadArtwork | ProtectedRoute |

### Admin Routes

| Path | Component | Protection |
|------|-----------|------------|
| `/admin/login` | AdminLogin | None |
| `/admin/dashboard` | AdminDashboard | AdminProtectedRoute |

---

## 3. Page Inventory

### Home Page
- **File:** `frontend/src/pages/Home.jsx` (193 lines)
- **Purpose:** Landing page with hero carousel, feature showcase, and CTAs
- **Dependencies:** React, framer-motion, lucide-react, react-router-dom
- **Current Problems:**
  - Hardcoded images in imports (not dynamic)
  - No server-side rendering consideration
  - Carousel images are static assets
- **Recommendation:** **KEEP** - Solid foundation, minor polish needed

---

### Marketplace Page
- **File:** `frontend/src/pages/Marketplace.jsx` (313 lines)
- **Purpose:** Browse and filter artworks, add to cart
- **Dependencies:** React, useState, useEffect, useMemo, useCallback, lucide-react, toast, artworkService, cartService
- **Current Problems:**
  - Duplicate `resolveImageUrl` function (also in ArtworkCard, CourseCard)
  - API_BASE hardcoded fallback to localhost
  - Hardcoded fallback image from picsum.photos
  - Filters UI shows toast "More filters later" - incomplete feature
  - Sort options incomplete (Popular sorting disabled)
- **Recommendation:** **REFACTOR** - Extract shared utilities, complete filter UI

---

### Learn Page
- **File:** `frontend/src/pages/Learn.jsx` (863 lines - very large)
- **Purpose:** Course browsing, enrollment, progress tracking, course creation, earnings dashboard
- **Dependencies:** React, framer-motion, lucide-react, toast, courseService
- **Current Problems:**
  - **CRITICAL: Extremely large file** (863 lines) - violates single responsibility
  - Contains 5 different tabs: browse, my-courses, enrollments, earnings, level
  - Default courses hardcoded as fallback
  - Massive inline modal forms for create/view/assignment
  - No pagination - loads all courses
  - Default courses shown when API fails (misleading UX)
  - Complex form handling all in one component
- **Recommendation:** **REBUILD** - Split into multiple components: LearnPage, CourseCard, CourseModal, CreateCourseForm, EarningsDashboard, LevelProgress

---

### Services Page
- **File:** `frontend/src/pages/Services.jsx` (726 lines - large)
- **Purpose:** Browse/create/manage custom art commissions and services
- **Dependencies:** React, framer-motion, lucide-react, toast, commissionService
- **Current Problems:**
  - **Very large file** (726 lines) - similar to Learn page issues
  - Contains 3 tabs: browse, my-services, bookings
  - Large modal forms inline
  - Hardcoded default services
  - Some CSS typos (e.g., `border-gray-xl` - invalid class)
- **Recommendation:** **REBUILD** - Split into smaller components

---

### Community Page
- **File:** `frontend/src/pages/Community.jsx` (233 lines)
- **Purpose:** Social feed with posts, likes, comments
- **Dependencies:** React, framer-motion, lucide-react, toast, communityService
- **Current Problems:**
  - Basic styling - needs improvement
  - No pagination
  - Image preview creates blob URLs (memory leak potential)
  - No error states for failed image upload
- **Recommendation:** **REFACTOR** - Add pagination, improve styling, fix memory leaks

---

### Dashboard Page
- **File:** `frontend/src/pages/Dashboard.jsx` (240 lines)
- **Purpose:** User dashboard with stats and quick links
- **Dependencies:** React, useState, useEffect, useMemo, react-router-dom, dashboardService
- **Current Problems:**
  - Stats API returns zeros (not populated)
  - Static "features" and "steps" content
  - Background image imported directly
  - Format function duplicated (also in cartService)
- **Recommendation:** **REFACTOR** - Connect real stats, extract shared utilities

---

### Profile Page
- **File:** `frontend/src/pages/Profile.jsx` (307 lines)
- **Purpose:** User profile with tabs: overview, artworks, purchases, courses
- **Dependencies:** React, useState, useEffect, react-router-dom, lucide-react, cartService
- **Current Problems:**
  - No actual artwork display in "My Artworks" tab
  - No password change functionality
  - No settings page
  - User stats hardcoded/fetched partially
  - Empty states exist but some tabs incomplete
- **Recommendation:** **REFACTOR** - Complete artwork tab, add settings

---

### Cart Page
- **File:** `frontend/src/pages/Cart.jsx` (389 lines)
- **Purpose:** Shopping cart, checkout flow, Stripe payment integration
- **Dependencies:** React, useState, useEffect, react-router-dom, lucide-react, cartService, StripePayment
- **Current Problems:**
  - Large component - could split
  - Hardcoded tax (15%) and shipping (R99) calculations inline
  - No order confirmation email (backend limitation)
  - Quantity update has inefficient re-fetch
- **Recommendation:** **REFACTOR** - Extract order summary component, optimize quantity updates

---

### UploadArtwork Page
- **File:** `frontend/src/pages/uploadArtwork.jsx` (266 lines)
- **Purpose:** Multi-step form to upload and submit artwork for marketplace
- **Dependencies:** React, useState, framer-motion, lucide-react, toast, artworkService
- **Current Problems:**
  - Form validation incomplete (only basic checks)
  - Status hardcoded to "pending" (correct behavior - good)
  - No progress indicator during upload
  - Two-step form could use better UX
  - White input styles inconsistent with dark theme elsewhere
- **Recommendation:** **REFACTOR** - Add better validation, progress indicator, consistent styling

---

### MessagesPage
- **File:** `frontend/src/pages/MessagesPage.jsx` (154 lines)
- **Purpose:** Messaging interface with conversation list and chat window
- **Dependencies:** React, useState, useEffect, useCallback, react-router-dom, lucide-react, messageService
- **Current Problems:**
  - No real-time updates (polling only)
  - Mobile responsive issues (hidden chat on mobile)
  - No typing indicators
  - Message loading could show skeleton
- **Recommendation:** **REFACTOR** - Add real-time (WebSocket), improve mobile UX

---

### VRStudio Page
- **File:** `frontend/src/pages/VRStudio.jsx` (49 lines)
- **Purpose:** Placeholder for VR gallery features
- **Dependencies:** lucide-react
- **Current Problems:**
  - **Almost entirely placeholder content**
  - No actual VR integration
  - VR components exist but aren't wired to this page
- **Recommendation:** **REBUILD** - Integrate VRGallery/VRRoom components when VR backend ready

---

### AdminLogin Page
- **File:** `frontend/src/pages/admin/AdminLogin.jsx`
- **Purpose:** Separate admin authentication
- **Dependencies:** React, useState, react-router-dom, adminService
- **Current Problems:**
  - Duplicates auth flow from regular Login
  - Could share more code with Login component
- **Recommendation:** **REFACTOR** - Extract shared auth form

---

### AdminDashboard Page
- **File:** `frontend/src/pages/admin/AdminDashboard.jsx` (415 lines)
- **Purpose:** Admin panel for user management, content moderation, reports
- **Dependencies:** React, useState, useEffect, react-router-dom, lucide-react, adminService
- **Current Problems:**
  - Large component (415 lines)
  - No pagination for users/artworks
  - Image resolution helper duplicated
  - No bulk actions
- **Recommendation:** **REFACTOR** - Add pagination, extract helpers, add bulk operations

---

## 4. Component Inventory

### Layout Components

| Component | File | Purpose | Recommendation |
|-----------|------|---------|----------------|
| MainLayout | `layouts/MainLayout.jsx` | Page wrapper with Navbar/Footer | KEEP |
| AuthLayout | `layouts/AuthLayout.jsx` | Auth pages wrapper | KEEP |

### Shared Components

| Component | File | Purpose | Recommendation |
|-----------|------|---------|----------------|
| Navbar | `shared/Navbar.jsx` (287 lines) | Main navigation with auth state | REFACTOR - Large, split dropdown |
| Footer | `shared/Footer.jsx` (66 lines) | Site footer with links | KEEP |
| Loader | `shared/Loader.jsx` | Loading spinner | KEEP |
| NotificationDropdown | `shared/NotificationDropdown.jsx` | Notification panel | REFACTOR - Extract from Navbar |

### Auth Components

| Component | File | Lines | Purpose | Recommendation |
|-----------|------|-------|---------|----------------|
| Login | `auth/Login.jsx` | 141 | User login form | KEEP |
| Register | `auth/Register.jsx` | 259 | User registration | KEEP |
| ForgotPassword | `auth/ForgotPassword.jsx` | 134 | Password reset request | KEEP |
| ResetPassword | `auth/ResetPassword.jsx` | 179 | Password reset form | KEEP |

### Marketplace Components

| Component | File | Purpose | Recommendation |
|-----------|------|---------|----------------|
| ArtworkCard | `marketplace/ArtworkCard.jsx` (152 lines) | Artwork display in grid | REFACTOR - Extract image resolver |
| ArtworkGrid | `marketplace/ArtworkGrid.jsx` | Grid layout | KEEP |
| ArtworkFilters | `marketplace/ArtworkFilters.jsx` | Filter sidebar | REFACTOR - Partially incomplete |

### Course Components

| Component | File | Purpose | Recommendation |
|-----------|------|---------|----------------|
| CourseCard | `courses/CourseCard.jsx` (140 lines) | Course display | REFACTOR - Extract image resolver |
| CoursePlayer | `courses/CoursePlayer.jsx` | Video player | KEEP |

### Messaging Components

| Component | File | Purpose | Recommendation |
|-----------|------|---------|----------------|
| ConversationList | `messaging/ConversationList.jsx` | Conversation sidebar | KEEP |
| ChatWindow | `messaging/ChatWindow.jsx` | Message display | KEEP |
| MessageBubble | `messaging/MessageBubble.jsx` | Individual message | KEEP |
| MessageArtistButton | `messaging/MessageArtistButton.jsx` | Quick message artist | KEEP |

### Cart Components

| Component | File | Purpose | Recommendation |
|-----------|------|---------|----------------|
| CartItem | `cart/CartItem.jsx` | Cart line item | KEEP |
| Checkout | `cart/Checkout.jsx` | Checkout flow | KEEP |

### Review Components

| Component | File | Purpose | Recommendation |
|-----------|------|---------|----------------|
| RatingStars | `reviews/RatingStars.jsx` | Star rating display | KEEP |
| ReviewCard | `reviews/ReviewCard.jsx` | Review display | KEEP |
| ReviewForm | `reviews/ReviewForm.jsx` | Submit review | KEEP |

### VR Components

| Component | File | Purpose | Recommendation |
|-----------|------|---------|----------------|
| VRGallery | `vr/VRGallery.jsx` | VR gallery viewer | KEEP (not wired) |
| GalleryRoom | `vr/GalleryRoom.jsx` | VR room | KEEP (not wired) |

### Other Components

| Component | File | Purpose | Recommendation |
|-----------|------|---------|----------------|
| ProtectedRoute | `ProtectedRoute.jsx` | Auth guard | KEEP |
| AdminProtectedRoute | `AdminProtectedRoute.jsx` | Admin guard | KEEP |
| ErrorBoundary | `ErrorBoundary.jsx` | Error catching | KEEP |
| PostSkeleton | `PostSkeleton.jsx` | Loading placeholder | KEEP |
| ReportModal | `moderation/ReportModal.jsx` | Content reporting | KEEP |
| StripePayment | `payment/StripePayment.jsx` | Payment form | KEEP |

---

## 5. Layout System

### Structure

```
App.jsx
├── BrowserRouter
│   ├── ThemeProvider
│   │   └── AuthProvider
│   │       ├── Toaster (global notifications)
│   │       └── Routes
│   │           ├── MainLayout (authenticated pages)
│   │           │   ├── Navbar
│   │           │   ├── Outlet (page content)
│   │           │   └── Footer
│   │           ├── AuthLayout (login/register)
│   │           │   └── Outlet
│   │           └── Admin Routes
```

### Layout Files

1. **MainLayout** (`layouts/MainLayout.jsx`):
   - Wraps protected pages
   - Includes Navbar and Footer
   - Dark background by default

2. **AuthLayout** (`layouts/AuthLayout.jsx`):
   - Minimal wrapper for auth pages
   - Currently just renders Outlet

### Theme System

- **ThemeContext** (`context/ThemeContext.jsx`):
  - Currently locked to dark mode only
  - Toggle removed - always dark
  - Adds `dark` class to document

### Navigation

- **Navbar** (`components/shared/Navbar.jsx`):
  - Desktop: horizontal nav with dropdown
  - Mobile: hamburger menu with slide-out
  - Shows cart count, unread messages
  - Protected elements (upload, profile dropdown)

---

## 6. Auth Flow in Frontend

### Authentication Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        AuthContext                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ State: user, loading, authChecked, isAuthed        │    │
│  │ Methods: login, register, logout, refreshAuth      │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    api.js (Axios Instance)                   │
│  - withCredentials: true                                    │
│  - Request interceptor: adds X-CSRF-Token header           │
│  - Response interceptor: handles 401                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend /api/auth/*                        │
│  - Login/Register: sets httpOnly auth_token cookie         │
│  - /me: validates cookie, returns user data                │
│  - logout: clears cookie                                    │
└─────────────────────────────────────────────────────────────┘
```

### Auth Flow Details

1. **Login** (`AuthContext.login`):
   - POST to `/api/auth/login` with email/password
   - Backend sets `auth_token` httpOnly cookie
   - Frontend calls `/api/auth/me` to validate
   - Fetches CSRF token
   - Updates user state

2. **Register** (`AuthContext.register`):
   - Same flow as login after registration

3. **Logout** (`AuthContext.logout`):
   - POST to `/api/auth/logout` (clears cookie)
   - Clears local user state
   - Note: JWT token NOT invalidated server-side

4. **Session Validation** (`AuthContext.refreshAuth`):
   - Called on app load
   - Calls `/api/auth/me`
   - Sets user from response

### CSRF Protection

- Token fetched from `/api/csrf-token` after login
- Stored in memory (not localStorage)
- Added to headers for POST/PUT/DELETE requests
- Expires but no auto-refresh mechanism

### Protected Routes

- **ProtectedRoute**: Redirects to `/login` if not authenticated
- **AdminProtectedRoute**: Checks `user.role === 'admin'`

---

## 7. API Integration Pattern

### Service Layer Architecture

```
services/
├── api.js              # Axios instance with interceptors
├── authService.js      # Login, register, logout
├── artworkService.js   # CRUD + upload
├── cartService.js      # Cart + checkout + Stripe
├── commissionService.js # Services/commissions
├── communityService.js # Posts, likes, comments
├── courseService.js    # Courses, enrollments
├── dashboardService.js # User stats
├── marketplaceService.js# Public artwork queries
├── messageService.js  # Conversations, messages
├── notificationService.js
├── reportService.js   # Content reports
├── reviewService.js   # Reviews, ratings
└── adminService.js   # Admin operations
```

### API Client Pattern (api.js)

```javascript
// Base configuration
const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,  // CRITICAL: cookies
});

// CSRF token management
let csrfToken = null;
export async function fetchCsrfToken() { ... }
export function getCsrfToken() { ... }

// Request interceptor - adds CSRF
api.interceptors.request.use((config) => {
  if (['POST','PUT','PATCH','DELETE'].includes(config.method)) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Auth error");
    }
    return Promise.reject(error);
  }
);
```

### Service Pattern

Each service follows this pattern:

```javascript
// Example: artworkService.js
import api from './api';

export const createArtwork = async (data) => {
  const res = await api.post('/api/artworks', data);
  return res.data;
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const res = await api.post('/api/uploads/image', formData);
  return res.data.path;
};
```

### Error Handling

- Services return response.data directly
- Components handle try/catch with toast errors
- No centralized error handling
- Inconsistent error response formats

---

## 8. Styling System

### Tailwind Configuration

- **Version:** 3.4.14
- **Config:** `tailwind.config.js` (minimal - mostly defaults)
- **CSS:** `src/index.css` with custom styles

### Custom CSS Variables

```css
/* index.css */
:root {
  --color-primary: #8b5cf6;    /* Purple */
  --color-secondary: #ec4899;   /* Pink */
  --color-accent: #10b981;     /* Green */
  --color-dark-900: #111827;
  --color-dark-800: #1f2937;
}
```

### Color Scheme

- **Primary:** Purple gradient (blue-500 to purple-600)
- **Background:** Dark (gray-900, black)
- **Cards:** gray-800/900 with subtle borders
- **Text:** white, gray-300, gray-400

### Common Classes Used

```jsx
// Cards
bg-gray-900/60 border border-gray-800 rounded-2xl

// Buttons
bg-gradient-to-r from-blue-500 to-purple-600
px-4 py-2 rounded-lg

// Inputs
bg-gray-800 border border-gray-700 rounded-xl
focus:ring-2 focus:ring-primary

// Gradients
bg-gradient-to-br from-gray-900 via-black to-gray-900
```

### Animation

- **Library:** Framer Motion
- **Usage:** Page transitions, modal animations, card hovers
- **Example:** `motion.div`, `<AnimatePresence>`

### Icons

- **Library:** Lucide React
- **Usage:** Throughout UI for navigation, actions, status

### Issues

1. **Inconsistent class names:** Sometimes `gray-800`, sometimes `gray-xl` (invalid)
2. **Hardcoded colors:** Inline gradients instead of design tokens
3. **No design system:** Repeated patterns not abstracted
4. **Inline styles:** Some components have inline styles mixed with Tailwind

---

## 9. Shared UI Patterns

### Cards

```jsx
// Standard card pattern
<div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500/40 transition">
  {/* content */}
</div>
```

### Buttons

```jsx
// Primary
<button className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 rounded-lg">
  Action
</button>

// Secondary
<button className="bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600">
  Action
</button>
```

### Forms

```jsx
// Input
<input className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white" />

// Select
<select className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg">
```

### Loading States

- Spinner: `animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500`
- Skeleton: Basic div with shimmer effect
- Inconsistent - some pages show spinner, some show text

### Empty States

- Used in: Marketplace, Profile, Cart
- Pattern: Icon + message + CTA button
- Inconsistent styling across pages

### Modals

- Inline in large page components (Learn, Services)
- Framer Motion for animation
- No shared Modal component

---

## 10. Forms and Validation

### Current State

| Form | Validation | Issues |
|------|------------|--------|
| Login | Basic required | No password strength |
| Register | Required + confirm password match | No password strength indicator |
| UploadArtwork | Required fields only | No real-time validation |
| CreateCourse | Basic | No validation feedback |
| CreateService | Basic | No validation feedback |
| Profile | None | Can't update |

### Validation Approach

- **Inline validation:** `if (!formData.title.trim()) return toast.error(...)`
- **No library:** Not using Yup, Zod, or React Hook Form
- **Inconsistent:** Some forms validate, others don't

### Form Issues

1. **No centralized validation library**
2. **Inconsistent error messages**
3. **No form state management** (each component has own useState)
4. **No password strength indicator** on register
5. **Confirm password shows visual feedback but not enforced**

### Recommendations

- Add Zod or Yup for schema validation
- Use React Hook Form for form state
- Add real-time password strength indicator
- Create reusable FormInput, FormSelect components

---

## 11. Frontend Technical Debt

### Critical Debt

| Issue | Location | Impact |
|-------|----------|--------|
| No TypeScript | All files | Runtime errors, no intellisense |
| No unit tests | All files | Can't refactor safely |
| Learn.jsx 863 lines | pages/Learn.jsx | Maintenance nightmare |
| Services.jsx 726 lines | pages/Services.jsx | Maintenance nightmare |
| No error boundaries | App.jsx | Single error crashes app |

### High Priority Debt

| Issue | Location | Impact |
|-------|----------|--------|
| Duplicate image URL resolver | Multiple files | Inconsistent behavior |
| Duplicate formatZAR | Dashboard, Cart, Profile | Code duplication |
| Hardcoded localhost fallback | api.js | Production risk |
| No lazy loading | App.jsx | Slow initial load |
| No pagination | Most list pages | Memory issues with large data |

### Medium Priority Debt

| Issue | Location | Impact |
|-------|----------|--------|
| Console.log statements | Multiple files | Debug code left in |
| Hardcoded default data | Learn, Services, Marketplace | Misleading UX |
| No loading skeletons | Most pages | Poor perceived performance |
| Inconsistent error handling | Services | Unpredictable |
| No form library | All forms | Inconsistent UX |

### Low Priority Debt

| Issue | Location | Impact |
|-------|----------|--------|
| Theme locked to dark | ThemeContext.jsx | No light mode option |
| Unused imports | Multiple files | Bundle bloat |
| No code comments | Most files | Hard to maintain |
| Mixed CSS approaches | Various | Inconsistency |

---

## 12. UI Inconsistencies

### Color Scheme

| Issue | Examples |
|-------|----------|
| Inconsistent primary colors | Some use purple, some use blue, some use indigo |
| Hardcoded gradients | Inline `from-blue-500 to-purple-600` repeated everywhere |
| Border colors | `gray-800`, `gray-700`, `gray-xl` (invalid) used interchangeably |

### Spacing

| Issue | Examples |
|-------|----------|
| Padding inconsistency | Some use `p-4`, some `p-5`, some `p-6` |
| Margins | Different values across similar components |
| Gaps | `gap-4`, `gap-6`, `gap-8` without pattern |

### Component Styles

| Issue | Examples |
|-------|----------|
| Cards | Different border radii (`rounded-xl`, `rounded-2xl`) |
| Buttons | Different sizes, padding across pages |
| Inputs | Some white background (upload form), most dark |

### UX Inconsistencies

| Issue | Description |
|-------|-------------|
| Loading states | Some show spinner, some show text, some nothing |
| Error states | Different error display patterns |
| Empty states | Icon + message + button on some pages, none on others |
| Delete confirmations | Some have confirm, some don't |

### Code Inconsistencies

| Issue | Examples |
|-------|----------|
| Import order | No standard pattern |
| Component structure | Some use hooks at top, some inline |
| Error handling | Try/catch in some, .catch in others |
| Naming | camelCase vs PascalCase for same things |

---

## 13. What Should Be Kept

### Well-Implemented Features

| Feature | Why Keep |
|---------|----------|
| Cookie-based auth | Secure, production-ready pattern |
| CSRF protection | Important security |
| Axios service layer | Good architectural pattern |
| React Router setup | Clean routing structure |
| ProtectedRoute components | Proper auth guards |
| Stripe integration | Works correctly |
| Cart functionality | Core feature working |
| Admin dashboard | Functional for moderation |

### Components Ready for Production

| Component | Notes |
|-----------|-------|
| Login/Register forms | Good UX, proper validation |
| Navbar | Feature-complete |
| ArtworkCard | Good UI, proper image handling |
| MessageBubble | Clean implementation |
| ProtectedRoute/AdminProtectedRoute | Proper auth logic |

### Patterns Worth Keeping

| Pattern | Implementation |
|---------|----------------|
| Service layer | Centralized API calls |
| Context for auth | Proper state management |
| Component organization | Feature-based structure |
| Tailwind + custom CSS | Flexible styling |

---

## 14. What Should Be Refactored

### High Priority Refactors

| Item | Current | Target |
|------|---------|--------|
| Learn.jsx | 863 lines monolith | Split into 5+ components |
| Services.jsx | 726 lines monolith | Split into 4+ components |
| Image URL resolver | Duplicated 5+ times | Single utility |
| formatZAR | Duplicated 3+ times | Single utility |
| API_BASE | Hardcoded fallback | Fail-fast in production |
| No lazy loading | All routes load immediately | React.lazy() |

### Medium Priority Refactors

| Item | Current | Target |
|------|---------|--------|
| Forms | Inline validation | Zod + React Hook Form |
| Error handling | Per-component | Centralized with toast |
| Loading states | Inconsistent | Skeleton components |
| AdminDashboard | 415 lines | Split tabs into components |
| Navbar | 287 lines | Extract dropdown, notifications |

### Low Priority Refactors

| Item | Current | Target |
|------|---------|--------|
| Colors | Hardcoded | CSS variables + design tokens |
| ThemeContext | Locked dark | Support light mode |
| Console.log | Scattered | Proper logging |
| Unused code | Various | Cleanup |

---

## 15. What Should Be Fully Rebuilt

### VR Studio Section

**Current State:**
- Placeholder page with static content
- VR components exist but not wired
- No actual VR functionality

**Recommendation:** Rebuild when VR backend ready. Current page is just a placeholder.

### Learn Page

**Current State:**
- 863 lines single file
- 5 different views in one component
- Large inline forms
- Default courses hardcoded

**Recommendation:** Full rebuild with proper component architecture:
- LearnPage (container)
- CourseGrid
- CourseCard (refactored)
- CourseDetailModal
- CreateCourseForm
- CoursePlayer
- EarningsDashboard
- LevelProgress

### Services Page

**Current State:**
- 726 lines
- Similar issues to Learn
- CSS typos present

**Recommendation:** Full rebuild:
- ServicesPage (container)
- ServiceGrid
- ServiceCard
- CreateServiceForm
- BookingList

### Forms System

**Current State:**
- No validation library
- Inconsistent across pages
- No password strength indicator
- Manual validation code

**Recommendation:** Rebuild with:
- Zod schemas for all forms
- React Hook Form integration
- Reusable FormInput, FormSelect, FormTextarea components
- Password strength indicator component

---

## 16. Recommended Modern Frontend Structure

### Target Architecture

```
src/
├── main.tsx                 # Entry point
├── App.tsx                  # Router + providers
├── index.css                # Tailwind + global styles
│
├── components/              # Reusable UI components
│   ├── ui/                  # Base components (Button, Input, Card)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Skeleton.tsx
│   │   └── ...
│   ├── forms/               # Form-specific components
│   │   ├── FormField.tsx
│   │   ├── PasswordInput.tsx
│   │   └── FormError.tsx
│   └── layout/              # Layout components
│       ├── PageContainer.tsx
│       ├── CardGrid.tsx
│       └── ...
│
├── features/                # Feature-based modules
│   ├── auth/
│   │   ├── components/     # LoginForm, RegisterForm
│   │   ├── hooks/          # useAuth
│   │   └── ...
│   ├── marketplace/
│   │   ├── components/     # ArtworkCard, ArtworkGrid
│   │   ├── hooks/          # useArtworks
│   │   └── ...
│   ├── courses/
│   ├── cart/
│   ├── messages/
│   └── admin/
│
├── pages/                   # Page components (thin wrappers)
│   ├── Home.tsx
│   ├── Marketplace.tsx
│   └── ...
│
├── services/                # API layer (keep as-is for now)
│   ├── api.ts
│   ├── authService.ts
│   └── ...
│
├── hooks/                   # Custom hooks
│   ├── useLocalStorage.ts
│   ├── useDebounce.ts
│   └── ...
│
├── lib/                     # Utilities
│   ├── utils.ts            # formatZAR, resolveImageUrl
│   ├── constants.ts
│   └── ...
│
├── types/                   # TypeScript types (when migrating)
│   ├── user.ts
│   ├── artwork.ts
│   └── ...
│
└── config/                 # Configuration
    ├── theme.ts
    └── ...
```

### Key Changes

1. **Feature-based folders**: Group by feature, not by file type
2. **UI library**: Create reusable base components
3. **Thin pages**: Pages just compose components
4. **Shared hooks**: Extract common logic
5. **TypeScript**: Add types for all data models
6. **Tests**: Add tests alongside components

---

## 17. Frontend Rebuild Phases

### Phase 1: Foundation (Week 1-2)

| Task | Effort | Priority |
|------|--------|----------|
| Add TypeScript | High | Critical |
| Set up ESLint + Prettier | Low | High |
| Create UI component library | Medium | High |
| Add error boundaries | Low | High |
| Implement lazy loading | Medium | High |

### Phase 2: Core Features (Week 3-4)

| Task | Effort | Priority |
|------|--------|----------|
| Refactor Learn page | High | Critical |
| Refactor Services page | High | Critical |
| Add form library (Zod + RHF) | Medium | High |
| Add pagination to lists | Medium | High |
| Centralize error handling | Medium | High |

### Phase 3: Polish (Week 5-6)

| Task | Effort | Priority |
|------|--------|----------|
| Add loading skeletons | Low | Medium |
| Refactor Navbar | Medium | Medium |
| Add password strength indicator | Low | Medium |
| Fix UI inconsistencies | Medium | Medium |
| Add unit tests | High | Medium |

### Phase 4: Advanced (Week 7-8)

| Task | Effort | Priority |
|------|--------|----------|
| Add real-time messaging (WebSocket) | High | Medium |
| VR integration | High | Low |
| Light mode support | Medium | Low |
| Performance optimization | Medium | Medium |

### Phase 5: Production Ready (Ongoing)

| Task | Effort | Priority |
|------|--------|----------|
| E2E tests | High | High |
| Performance monitoring | Medium | Medium |
| Error tracking (Sentry) | Low | High |
| Analytics | Medium | Low |

---

## Summary

### Current State Assessment

| Category | Score | Notes |
|----------|-------|-------|
| Code Organization | 60% | Some good patterns, but monolith pages |
| Authentication | 85% | Cookie-based is solid |
| API Integration | 75% | Good service pattern, some duplication |
| UI Consistency | 50% | Many inconsistencies |
| Form Handling | 40% | No standard approach |
| Performance | 60% | No lazy loading, large bundles |
| Testing | 10% | No tests at all |
| Type Safety | 0% | No TypeScript |

### Recommended Priority

1. **Immediate:** Add error boundaries, lazy loading
2. **This Sprint:** Split Learn/Services pages
3. **Next Sprint:** Add form library, fix UI inconsistencies
4. **This Quarter:** Add TypeScript, tests
5. **Ongoing:** VR integration when backend ready

---

*End of Frontend Architecture Documentation*
