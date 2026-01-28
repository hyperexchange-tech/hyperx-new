# HyperX Color Palette

## Brand Colors

### Teal/Cyan Shades (Primary)
- **teal-25**: `#E3fafa` - Very light teal (backgrounds, subtle highlights)
- **teal-50**: `#96a6b5` - Medium teal (secondary elements)
- **teal-75**: `#479dba` - Darker teal (primary actions, main brand color)
- **teal-100**: `#3c7f72` - Darkest teal (emphasis, hover states)

### Gray Shades (Neutral)
- **gray-10**: `#ebebeb` - Very light gray (backgrounds)
- **gray-25**: `#d8d8d4` - Light gray (dividers, borders)
- **gray-50**: `#989494` - Medium gray (secondary text)
- **gray-100**: `#686464` - Dark gray (primary text)
- **gray-300**: `#877eaf` - Gray (supporting elements)
- **gray-400**: `#686bb0` - Gray (supporting elements)
- **gray-500**: `#479aba` - Dark gray (text, icons)
- **gray-600**: `#3c7f72` - Very dark (headings, emphasis)

## Usage Guidelines

### Primary Actions
Use `teal-75` (#479dba) or `teal-100` (#3c7f72) for:
- Primary buttons
- Call-to-action elements
- Active states
- Links

### Backgrounds
Use `teal-25` (#E3fafa) or `gray-10` (#ebebeb) for:
- Page backgrounds
- Card backgrounds
- Section separators

### Text
- Headings: `gray-100` or `gray-600`
- Body text: `gray-50` or `gray-100`
- Secondary text: `gray-50` or `gray-25`

### Borders & Dividers
Use `gray-25` (#d8d8d4) or `gray-10` (#ebebeb)

## Tailwind Usage

```jsx
// Using brand colors
<button className="bg-teal-75 hover:bg-teal-100 text-white">
  Primary Button
</button>

<div className="bg-gray-10 border border-gray-25">
  Card Content
</div>

<p className="text-gray-100">
  Primary text content
</p>
```

## CSS Custom Properties

The app also uses CSS custom properties for semantic colors:
- `--primary`: Teal-75 (#479dba)
- `--accent`: Teal-100 (#3c7f72)
- `--background`: Light teal tint for light mode, dark gray for dark mode
- `--foreground`: Text color
- `--border`: Border color
- `--muted`: Muted backgrounds

Use these via Tailwind utility classes like `bg-primary`, `text-accent`, etc.
