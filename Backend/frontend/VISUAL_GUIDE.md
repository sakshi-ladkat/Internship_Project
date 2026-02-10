# 🎨 SPA Visual Guide

## Design Showcase

### Color Palette

The SPA uses a sophisticated color system based on HSL values for easy theming:

#### Primary Colors (Purple Gradient)
```
Primary 50:  hsl(250, 100%, 97%)  - Very light purple
Primary 100: hsl(250, 95%, 92%)   - Light purple
Primary 500: hsl(250, 75%, 55%)   - Main purple
Primary 600: hsl(250, 70%, 45%)   - Dark purple
Primary 900: hsl(250, 55%, 15%)   - Very dark purple
```

#### Semantic Colors
```
Success: hsl(142, 76%, 45%)  - Green
Error:   hsl(0, 84%, 60%)    - Red
Warning: hsl(38, 92%, 50%)   - Orange
Info:    hsl(199, 89%, 48%)  - Blue
```

### Typography Scale

```
4xl: 2.25rem (36px) - Hero titles
3xl: 1.875rem (30px) - Page titles
2xl: 1.5rem (24px) - Section headers
xl:  1.25rem (20px) - Large text
lg:  1.125rem (18px) - Emphasized text
base: 1rem (16px) - Body text
sm:  0.875rem (14px) - Small text
xs:  0.75rem (12px) - Tiny text
```

### Component Examples

#### Button Variants

**Primary Button**
- Background: Purple gradient
- Text: White
- Shadow: Medium
- Hover: Darker gradient + lift effect

**Secondary Button**
- Background: Light gray
- Text: Dark gray
- Hover: Darker gray

**Outline Button**
- Background: Transparent
- Border: Purple
- Text: Purple
- Hover: Filled purple

#### Card Component

```
┌─────────────────────────────────────┐
│  Card Title (Gradient Text)         │
│  Card Subtitle (Gray Text)          │
│                                      │
│  Content area with white background │
│  Rounded corners (1rem)              │
│  Shadow on hover                     │
│  Smooth transition                   │
└─────────────────────────────────────┘
```

#### Form Input

```
┌─────────────────────────────────────┐
│ Label Text (Medium weight)          │
│ ┌─────────────────────────────────┐ │
│ │ Input field (Light gray bg)     │ │
│ │ Focus: White bg + purple border │ │
│ └─────────────────────────────────┘ │
│ Hint text (Small, gray)             │
└─────────────────────────────────────┘
```

### Page Layouts

#### Home Page Layout

```
┌────────────────────────────────────────────┐
│ Header (Sticky, blur backdrop)             │
│  Logo | Home | Login | Register            │
├────────────────────────────────────────────┤
│                                             │
│         Welcome to AuthApp                  │
│    Secure authentication made simple        │
│                                             │
│            [Icon/Graphic]                   │
│                                             │
│    [Get Started]  [Sign In]                │
│                                             │
│  ┌──────┐  ┌──────┐  ┌──────┐             │
│  │ 🔒   │  │ ⚡   │  │ ✨   │             │
│  │Secure│  │ Fast │  │Simple│             │
│  └──────┘  └──────┘  └──────┘             │
│                                             │
├────────────────────────────────────────────┤
│ Footer (Dark background)                   │
│  © 2026 | Privacy | Terms                  │
└────────────────────────────────────────────┘
```

#### Register Page Layout

```
┌────────────────────────────────────────────┐
│ Header                                      │
├────────────────────────────────────────────┤
│                                             │
│        ┌──────────────────────┐            │
│        │  Create Account      │            │
│        │                      │            │
│        │  Email Address       │            │
│        │  [input field]       │            │
│        │                      │            │
│        │  [Send Link Button]  │            │
│        │                      │            │
│        │  Already have an     │            │
│        │  account? Sign in    │            │
│        └──────────────────────┘            │
│                                             │
├────────────────────────────────────────────┤
│ Footer                                      │
└────────────────────────────────────────────┘
```

#### Create Account Page Layout

```
┌────────────────────────────────────────────┐
│ Header                                      │
├────────────────────────────────────────────┤
│                                             │
│        ┌──────────────────────┐            │
│        │ Complete Your Account│            │
│        │                      │            │
│        │  Email (readonly)    │            │
│        │  [email@example.com] │            │
│        │                      │            │
│        │  Username            │            │
│        │  [username] ✓        │            │
│        │                      │            │
│        │  Password            │            │
│        │  [••••••••]          │            │
│        │                      │            │
│        │  Confirm Password    │            │
│        │  [••••••••]          │            │
│        │                      │            │
│        │  [Create Account]    │            │
│        └──────────────────────┘            │
│                                             │
├────────────────────────────────────────────┤
│ Footer                                      │
└────────────────────────────────────────────┘
```

### Animations

#### Page Transitions

```
Exit Animation (150ms):
  opacity: 1 → 0
  transform: translateY(0) → translateY(-20px)

Enter Animation (350ms):
  opacity: 0 → 1
  transform: translateY(20px) → translateY(0)
```

#### Button Hover

```
Normal State:
  - Base gradient background
  - Medium shadow
  - No transform

Hover State:
  - Darker gradient
  - Larger shadow
  - translateY(-2px)
  - Ripple effect (white circle expanding)

Active State:
  - translateY(0)
```

#### Toast Notification

```
Slide In (300ms):
  transform: translateX(400px) → translateX(0)
  opacity: 0 → 1

Slide Out (300ms):
  transform: translateX(0) → translateX(400px)
  opacity: 1 → 0
```

### Responsive Breakpoints

#### Desktop (> 768px)
- Horizontal navigation
- Side-by-side footer
- Max content width: 1200px
- Larger spacing

#### Mobile (≤ 768px)
- Stacked navigation
- Vertical footer
- Full-width content
- Reduced spacing
- Touch-friendly buttons (min 44px)

### Accessibility Features

#### Color Contrast
- All text meets WCAG AA standards
- Minimum 4.5:1 ratio for body text
- Minimum 3:1 ratio for large text

#### Focus States
- Visible focus indicators
- Purple outline on focus
- Keyboard navigation support

#### Semantic HTML
- Proper heading hierarchy
- ARIA labels where needed
- Form labels associated with inputs

### Dark Mode Ready

The design system is ready for dark mode with CSS variables:

```css
/* Light Mode (Default) */
:root {
    --bg-primary: white;
    --text-primary: var(--gray-800);
}

/* Dark Mode (Future) */
@media (prefers-color-scheme: dark) {
    :root {
        --bg-primary: var(--gray-900);
        --text-primary: var(--gray-100);
    }
}
```

### Icon System

Using inline SVG for icons:
- Scalable
- Customizable colors
- No external dependencies
- Accessible with proper ARIA labels

Example icons used:
- ✓ Checkmark (success)
- ✗ X mark (error)
- ⚠ Warning triangle
- ℹ Info circle
- 🔒 Lock (security)
- ⚡ Lightning (speed)
- ✨ Sparkles (simplicity)

### Loading States

#### Spinner
```
┌─────────┐
│    ○    │  Rotating circle
│   ○ ○   │  Purple border-top
│  ○   ○  │  Gray border-bottom
│   ○ ○   │  Smooth rotation
│    ○    │  0.8s duration
└─────────┘
```

#### Button Loading
```
[  ○  ]  Button text hidden
         Spinner centered
         Disabled state
         Pointer events none
```

### Spacing System

```
Component Spacing:
- Card padding: 2rem (32px)
- Form group margin: 1.5rem (24px)
- Button padding: 1rem 2rem (16px 32px)
- Section gap: 3rem (48px)

Layout Spacing:
- Header padding: 1rem 2rem
- Content padding: 2rem 2rem
- Footer padding: 2rem
- Max width: 1200px
```

### Shadow Elevation

```
Level 1 (sm):  Subtle, for cards at rest
Level 2 (md):  Default, for buttons
Level 3 (lg):  Elevated, for dropdowns
Level 4 (xl):  High, for modals
Level 5 (2xl): Maximum, for important overlays
```

---

## Quick Reference

### Most Used Classes

```css
/* Layout */
.card              - White card with shadow
.card-header       - Card header section
.card-title        - Gradient title text
.card-subtitle     - Gray subtitle text

/* Forms */
.form-group        - Form field container
.form-label        - Input label
.form-input        - Text input field
.form-hint         - Helper text
.form-error        - Error message
.form-success      - Success message

/* Buttons */
.btn               - Base button
.btn-primary       - Primary purple button
.btn-secondary     - Gray button
.btn-outline       - Outlined button
.btn-block         - Full width button
.btn-loading       - Loading state

/* Utilities */
.text-center       - Center text
.mt-md             - Margin top medium
.mb-lg             - Margin bottom large
.hidden            - Hide element
```

### Color Usage Guide

**When to use each color:**

- **Primary (Purple)**: Main actions, links, brand elements
- **Success (Green)**: Confirmations, success messages, positive states
- **Error (Red)**: Errors, warnings, destructive actions
- **Warning (Orange)**: Cautions, important notices
- **Info (Blue)**: Informational messages, tips
- **Gray**: Text, borders, backgrounds, neutral elements

---

**This design system ensures a consistent, beautiful, and accessible user experience across the entire SPA!** 🎨
