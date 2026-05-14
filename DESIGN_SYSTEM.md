# Finance Calc - Minimalist Design System

## Design Philosophy
- **Aesthetic**: Minimalist, inspired by shadcn/ui
- **Theme**: Dark mode default with clean, high-contrast UI
- **Typography**: Precise, elegant typefaces with generous whitespace
- **Iconography**: Icon-only (no emojis), clean SVG/Unicode icons
- **Spacing**: Consistent 4px/8px/16px/24px/32px baseline
- **Simplicity**: Reduce visual noise, focus on content and data

---

## Color Palette

### Primary Colors
- **Background**: `#0A0A0A` (near black)
- **Surface**: `#141414` (elevated surface)
- **Surface Alt**: `#1F1F1F` (secondary surface)
- **Border**: `#2A2A2A` (subtle borders)

### Text Colors
- **Primary Text**: `#FAFAFA` (off-white, high contrast)
- **Secondary Text**: `#A1A1A1` (muted text)
- **Tertiary Text**: `#737373` (very muted)

### Semantic Colors
- **Success**: `#10B981` (green)
- **Danger**: `#EF4444` (red)
- **Warning**: `#F59E0B` (amber)
- **Info**: `#3B82F6` (blue)
- **Accent**: `#06B6D4` (cyan) - primary CTA

### Chart Colors
- **Chart 1**: `#06B6D4` (cyan)
- **Chart 2**: `#10B981` (green)
- **Chart 3**: `#F59E0B` (amber)
- **Chart 4**: `#EF4444` (red)
- **Chart 5**: `#8B5CF6` (purple)
- **Chart 6**: `#EC4899` (pink)

---

## Typography

### Fonts
- **Display/Headers**: `"Geist", -apple-system, BlinkMacSystemFont, sans-serif` (modern, geometric)
- **Body**: `"Geist", -apple-system, BlinkMacSystemFont, sans-serif` (same family, clean)
- **Mono**: `"Fira Code", "Consolas", monospace` (data/numbers)

### Scale
- **H1 (Display)**: 32px / 1.2 line-height / 600 weight
- **H2 (Section)**: 24px / 1.3 line-height / 600 weight
- **H3 (Subsection)**: 18px / 1.4 line-height / 600 weight
- **Body (Regular)**: 14px / 1.6 line-height / 400 weight
- **Small (Muted)**: 12px / 1.5 line-height / 400 weight
- **Mono (Data)**: 13px / 1.4 line-height / 500 weight

---

## Component Patterns

### Buttons
- **Primary Button**: Cyan background (`#06B6D4`), dark text, no border, 8px padding, 4px radius
- **Secondary Button**: Transparent, border `#2A2A2A`, text `#FAFAFA`, 8px padding, 4px radius
- **Danger Button**: Red background (`#EF4444`), dark text, no border, 8px padding, 4px radius
- **Hover State**: 10% opacity increase + slight scale (1.02x)
- **Focus State**: Outline ring `2px solid #06B6D4`

### Inputs
- **Background**: `#141414`
- **Border**: `1px solid #2A2A2A`
- **Border (Focus)**: `1px solid #06B6D4`
- **Text**: `#FAFAFA`
- **Placeholder**: `#737373`
- **Padding**: 8px 12px
- **Radius**: 4px

### Cards/Containers
- **Background**: `#141414`
- **Border**: `1px solid #2A2A2A` (optional, subtle)
- **Padding**: 24px (generous)
- **Radius**: 6px
- **Spacing between cards**: 24px vertical

### Tabs
- **Inactive**: Text `#737373`, border-bottom transparent
- **Active**: Text `#06B6D4`, border-bottom `2px solid #06B6D4`
- **Transition**: 200ms ease
- **Padding**: 12px 16px

### Modals
- **Background**: `#0A0A0A` with backdrop blur
- **Surface**: `#141414`
- **Width**: Max 480px (forms), Max 520px (calendars)
- **Border**: `1px solid #2A2A2A`
- **Padding**: 28px

### Data Tables
- **Header Background**: `#1F1F1F`
- **Row Background**: `#141414`
- **Row Hover**: `#1F1F1F`
- **Border**: `1px solid #2A2A2A`
- **Cell Padding**: 12px 16px
- **Text (Header)**: `#A1A1A1` (muted)
- **Text (Data)**: `#FAFAFA` (primary)

---

## Iconography

### Icons Used
- **Spending**: `₿` (currency) or `💰` → Use custom SVG or Unicode
- **Earnings**: `👥` → Use custom SVG or Unicode  
- **Dashboard**: `📊` → Use custom SVG or Unicode
- **Add**: `+` text icon
- **Edit**: `✎` or custom SVG
- **Delete**: `✕` or custom SVG
- **Calendar**: `📅` → Custom SVG
- **Filter**: `⧉` or custom SVG
- **Sort**: `↓` or custom SVG
- **Chevron**: `‹` `›` text icons
- **Close**: `✕` text icon

### Icon Style
- **Size**: 16px, 20px, 24px consistent
- **Weight**: 2px stroke for outlines
- **Color**: Inherit from text color or semantic color
- **Spacing**: 6px margin-right from text

---

## Layout Structure

### Main Container
- **Max Width**: 1200px (content stays readable)
- **Padding**: 24px horizontal, 32px top

### Header/Navigation
- **Height**: 64px
- **Background**: `#0A0A0A`
- **Border-bottom**: `1px solid #2A2A2A`
- **Tab Spacing**: 8px gap between tabs
- **Controls**: Right-aligned filter/sort dropdowns

### Content Sections
- **Vertical Spacing**: 32px between major sections
- **Horizontal Spacing**: 16px between adjacent elements
- **Column Gap**: 24px

### Grid/Card Grid
- **Spending Table**: Full width, responsive
- **Charts**: 1 column on mobile, 2 columns on desktop
- **Summary Cards**: 4 columns on desktop, 2 on tablet, 1 on mobile

---

## Whitespace Strategy
- **Generous Margins**: No cramped layouts
- **Breathing Room**: 24px-32px between section boundaries
- **Internal Padding**: 16px-24px inside containers
- **Line Height**: 1.4-1.6 for readability
- **Letter Spacing**: 0 (default, crisp)

---

## Animation & Transitions
- **Duration**: 150ms (fast), 300ms (standard)
- **Easing**: `ease` or `cubic-bezier(0.4, 0, 0.2, 1)`
- **Hover States**: Subtle background shift + slight scale
- **Focus States**: Clear ring outline
- **Loading**: Pulse or skeleton state (minimal)
- **Modal Open**: Fade in + slight scale up (1.02x → 1)

---

## Data Visualization

### Chart Style
- **Background**: Transparent or `#0A0A0A`
- **Grid**: Subtle `#2A2A2A` grid lines
- **Labels**: `#A1A1A1` text, small 12px
- **Lines/Bars**: Use semantic color palette above
- **Animation**: On load: staggered line draw (300ms each)
- **Interaction**: Hover to show tooltip with `#141414` background, `#FAFAFA` text

### Chart.js Overrides
- Chart defaults: No legend by default (labels in title)
- Bar/Line charts: Rounded corners
- Colors: Use palette above
- Fonts: Inherit from body (Geist, 12px)

---

## Responsive Breakpoints
- **Mobile**: < 640px (1 column, no sidebars)
- **Tablet**: 640px - 1024px (2 columns)
- **Desktop**: > 1024px (3+ columns, full layout)

---

## Implementation Details

### CSS Variables
```css
--bg-base: #0A0A0A;
--bg-surface: #141414;
--bg-surface-alt: #1F1F1F;
--border: #2A2A2A;

--text-primary: #FAFAFA;
--text-secondary: #A1A1A1;
--text-muted: #737373;

--accent: #06B6D4;
--success: #10B981;
--danger: #EF4444;
--warning: #F59E0B;
--info: #3B82F6;

--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;

--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;

--duration-fast: 150ms;
--duration-base: 300ms;
--ease: cubic-bezier(0.4, 0, 0.2, 1);
```

### Font Imports
```html
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
```

---

## State/Feature Considerations

### Dark Mode
- Default: Dark (above palette)
- Optional toggle: Not required (always dark)

### Empty States
- **Icon**: Centered, large (48px), muted `#737373`
- **Text**: "No data yet" in secondary text
- **CTA**: Optional action button

### Loading States
- **Skeleton**: Subtle pulse animation
- **Spinner**: Minimal rotation animation

### Error States
- **Color**: Red `#EF4444`
- **Text**: Clear, actionable message
- **Border**: Red accent on input/element

### Focus/Accessibility
- **Tab Navigation**: Clear ring outline
- **Labels**: Proper `<label>` elements, associated via `for`
- **ARIA**: Minimal ARIA where needed

---

## File References
- **HTML**: `/index.html` (structure, all tabs/modals)
- **CSS**: `/style.css` (converted to CSS variables, minimalist)
- **JS**: `/app.js` (no changes to logic, only refactoring rendering if needed)
- **Data**: `/data.js` (no changes)
- **Charts**: `/charts.js` (update Chart.js config with minimalist theme)
