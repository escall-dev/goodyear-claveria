# 🖼️ Images Folder

This folder contains logos and images for the Goodyear Tires POS application.

## 📁 Recommended Structure

```
public/images/
├── logo.png              # Main Goodyear logo
├── logo-white.png        # White version for dark backgrounds
├── logo-small.png        # Small logo/favicon
├── favicon.ico           # Browser favicon
├── goodyear-brand.png    # Goodyear brand image
├── tire-icon.png         # Tire icon for product placeholders
└── placeholder.png       # Product image placeholder
```

## 📏 Recommended Sizes

- **Main Logo**: 400x400px or 500x200px (PNG with transparency)
- **Small Logo**: 100x100px (PNG with transparency)
- **Favicon**: 32x32px or 64x64px (ICO format)
- **Product Images**: 300x300px (PNG or JPG)

## 🎨 Usage in React Components

### Import and use images:

```jsx
// In your React components
import logo from '/images/logo.png'
import tireIcon from '/images/tire-icon.png'

function Header() {
  return (
    <div>
      <img src={logo} alt="Goodyear Logo" />
    </div>
  )
}
```

### Or use public path directly:

```jsx
function Product() {
  return (
    <img src="/images/logo.png" alt="Logo" />
  )
}
```

## 📝 Notes

- All images in `public/images/` are accessible via `/images/filename.ext`
- Use PNG format for logos (supports transparency)
- Optimize images before uploading (use tinypng.com or similar)
- Keep file sizes small for better performance

## 🛞 Suggested Images to Add

1. **Goodyear Logo** - Official Goodyear brand logo
2. **Tire Icon** - Generic tire icon for products
3. **Favicon** - Browser tab icon
4. **Login Background** - Optional background for login page
5. **Product Placeholders** - Default image when product has no photo

---

**Drop your logo files here and they'll be ready to use in your app!** 🎨
