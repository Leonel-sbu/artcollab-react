# UI Primitives Migration Guide

This guide explains how to use the new reusable UI components in `src/components/ui/`.

## Design Tokens

### Colors (in `tailwind.config.js`)
- **Brand**: `brand-500` (#8b5cf6) - Primary purple for actions
- **Surface**: `surface-950` (deepest) to `surface-50` (lightest)
- **Usage**: Always use `surface-*` instead of `gray-*` for backgrounds

### Shadows
- `shadow-soft` - Subtle, elegant shadows
- `shadow-card` - Card borders with subtle glow
- `shadow-card-hover` - Hover state with brand accent
- `shadow-dropdown` - Dropdown menus

## Available Components

### PageContainer
```jsx
import { PageContainer } from './components/ui';

<PageContainer>
  <h1>Page Title</h1>
</PageContainer>
```

### SectionHeader
```jsx
import { SectionHeader } from './components/ui';

<SectionHeader 
  title="Section Title"
  subtitle="Optional subtitle"
  action={<Button>Action</Button>}
/>
```

### SurfaceCard
```jsx
import { SurfaceCard } from './components/ui';

<SurfaceCard>
  Content here
</SurfaceCard>

// With hover effect
<SurfaceCard hover>
  Hoverable content
</SurfaceCard>

// With padding variants
<SurfaceCard padding="none">No padding</SurfaceCard>
<SurfaceCard padding="sm">Small</SurfaceCard>
<SurfaceCard padding="md">Medium (default)</SurfaceCard>
<SurfaceCard padding="lg">Large</SurfaceCard>
```

### AppButton
```jsx
import { AppButton } from './components/ui';

<AppButton>Default (primary)</AppButton>
<AppButton variant="secondary">Secondary</AppButton>
<AppButton variant="ghost">Ghost</AppButton>
<AppButton variant="danger">Danger</AppButton>

<AppButton size="sm">Small</AppButton>
<AppButton size="md">Medium</AppButton>
<AppButton size="lg">Large</AppButton>

<AppButton isLoading>Loading</AppButton>
<AppButton disabled>Disabled</AppButton>
```

### AppInput
```jsx
import { AppInput, AppTextarea, AppSelect } from './components/ui';

<AppInput 
  label="Email"
  type="email"
  placeholder="Enter email"
/>

<AppInput 
  label="Password"
  type="password"
  error="Invalid password"
/>

<Textarea 
  label="Bio"
  placeholder="Tell us about yourself"
  rows={4}
/>

<Select
  label="Category"
  options={[
    { value: 'art', label: 'Art' },
    { value: 'design', label: 'Design' }
  ]}
/>
```

### EmptyState
```jsx
import { EmptyState } from './components/ui';
import { Package } from 'lucide-react';

<EmptyState 
  icon={Package}
  title="No items"
  description="You don't have any items yet"
  action={() => navigate('/create')}
  actionLabel="Create Item"
/>
```

### LoadingSkeleton
```jsx
import { Skeleton, TextSkeleton, CardSkeleton, GridSkeleton, PageLoader } from './components/ui';

// Generic skeleton
<Skeleton className="h-4 w-32" />

// Text lines
<TextSkeleton lines={3} />

// Card for lists
<CardSkeleton />

// Grid of cards
<GridSkeleton count={8} />

// Full page loader
<PageLoader />
```

## Navbar Components

Located in `src/components/shared/nav/`:

```jsx
import { NavLogo, NavLinks, UserMenu, MobileMenu, NavActions } from './components/shared/nav';

// These are used internally by Navbar but can be composed:
<NavLogo />
<NavLinks />
<NavActions cartCount={3} unreadCount={5} showUserActions={true} />
<UserMenu user={user} onLogout={logout} />
<MobileMenu isOpen={true} onClose={() => {}} />
```

## Migration Checklist

When updating a page to use the new primitives:

1. [ ] Replace hardcoded backgrounds with `surface-*` colors
2. [ ] Replace `bg-gray-900` with `bg-surface-950` for page backgrounds
3. [ ] Replace `bg-gray-800` with `bg-surface-800` for card backgrounds
4. [ ] Replace `text-gray-300` with `text-surface-300` for secondary text
5. [ ] Use `SurfaceCard` instead of manual divs with border/background
6. [ ] Use `AppButton` instead of custom button styles
7. [ ] Use `AppInput` instead of form inputs
8. [ ] Use `LoadingSkeleton` instead of custom loading states
9. [ ] Use `PageContainer` for consistent page padding

## Common Patterns

### Before (Inconsistent):
```jsx
<div className="bg-gray-900 min-h-screen p-6">
  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
    <h2 className="text-white text-xl">Title</h2>
  </div>
</div>
```

### After (Consistent):
```jsx
<PageContainer>
  <SurfaceCard>
    <SectionHeader title="Title" />
  </SurfaceCard>
</PageContainer>
```

### Before (Form):
```jsx
<div>
  <label className="text-gray-300 text-sm">Email</label>
  <input className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white" />
</div>
```

### After (Form):
```jsx
<AppInput label="Email" placeholder="Enter email" />
```
