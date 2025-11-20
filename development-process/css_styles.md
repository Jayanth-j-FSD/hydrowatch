color gradients for the **HydroWatch - Water & Climate Monitoring Platform**:

---

## 🎨 Color Palette & Gradients

### **Primary Theme Colors**

#### **Light Mode**
```css
/* Water Primary Gradient */
--primary-gradient: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%);
/* Sky Blue to Cyan */

/* Background Gradients */
--bg-gradient-subtle: linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 100%);
--bg-gradient-header: linear-gradient(135deg, #0284C7 0%, #0891B2 100%);
```

#### **Dark Mode**
```css
/* Deep Water Gradient */
--primary-gradient-dark: linear-gradient(135deg, #0C4A6E 0%, #164E63 100%);

/* Background Gradients */
--bg-gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
--bg-gradient-header-dark: linear-gradient(135deg, #075985 0%, #0E7490 100%);
```

---

### **Feature-Specific Gradients**

#### **1. River Water Level Tracker**
```css
/* Safe to Danger Gradient */
--river-safe: linear-gradient(90deg, #10B981 0%, #34D399 100%);      /* Green - Safe */
--river-warning: linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%);   /* Amber - Warning */
--river-danger: linear-gradient(90deg, #EF4444 0%, #F87171 100%);    /* Red - Danger */
--river-critical: linear-gradient(90deg, #991B1B 0%, #DC2626 100%);  /* Dark Red - Critical */

/* Water Flow Animation Gradient */
--river-flow: linear-gradient(90deg, 
  #0EA5E9 0%, 
  #06B6D4 25%, 
  #22D3EE 50%, 
  #06B6D4 75%, 
  #0EA5E9 100%
);
```

#### **2. Dams Status Dashboard**
```css
/* Capacity Level Gradients */
--dam-empty: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);      /* Light Red */
--dam-low: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);        /* Light Yellow */
--dam-optimal: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);    /* Light Green */
--dam-full: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%);       /* Blue */
--dam-overflow: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);   /* Red Alert */

/* Power Generation Gradient */
--power-gradient: linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #D97706 100%);
```

#### **3. Groundwater Data Visualizer**
```css
/* Depth Gradient (Surface to Deep) */
--groundwater-gradient: linear-gradient(180deg, 
  #DBEAFE 0%,      /* Light Blue - Surface */
  #93C5FD 25%,     /* Sky Blue */
  #3B82F6 50%,     /* Medium Blue */
  #1E40AF 75%,     /* Deep Blue */
  #1E3A8A 100%     /* Very Deep Blue */
);

/* Water Quality Gradient */
--quality-excellent: linear-gradient(135deg, #10B981 0%, #059669 100%);  /* Green */
--quality-good: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);       /* Blue */
--quality-moderate: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);   /* Orange */
--quality-poor: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);       /* Red */

/* Heatmap Gradient */
--heatmap-gradient: linear-gradient(90deg,
  #22C55E 0%,      /* Green - High level */
  #84CC16 20%,     /* Lime */
  #EAB308 40%,     /* Yellow */
  #F97316 60%,     /* Orange */
  #EF4444 80%,     /* Red */
  #991B1B 100%     /* Dark Red - Critical */
);
```

#### **4. Rainfall Prediction Dashboard**
```css
/* Rainfall Intensity Gradient */
--rainfall-light: linear-gradient(135deg, #BAE6FD 0%, #7DD3FC 100%);     /* Light Blue */
--rainfall-moderate: linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%);  /* Medium Blue */
--rainfall-heavy: linear-gradient(135deg, #0284C7 0%, #0369A1 100%);     /* Dark Blue */
--rainfall-extreme: linear-gradient(135deg, #075985 0%, #0C4A6E 100%);   /* Very Dark Blue */

/* Seasonal Gradient */
--season-summer: linear-gradient(135deg, #FEF3C7 0%, #FDE047 100%);      /* Yellow */
--season-monsoon: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);     /* Indigo */
--season-winter: linear-gradient(135deg, #93C5FD 0%, #60A5FA 100%);      /* Light Blue */

/* Drought to Flood Gradient */
--risk-gradient: linear-gradient(90deg,
  #DC2626 0%,      /* Red - Drought */
  #F97316 25%,     /* Orange */
  #10B981 50%,     /* Green - Normal */
  #3B82F6 75%,     /* Blue */
  #6366F1 100%     /* Indigo - Flood */
);
```

---

### **UI Component Gradients**

#### **Cards & Containers**
```css
/* Glass Morphism Effect */
--card-gradient-light: linear-gradient(135deg, 
  rgba(255, 255, 255, 0.9) 0%, 
  rgba(255, 255, 255, 0.7) 100%
);

--card-gradient-dark: linear-gradient(135deg, 
  rgba(30, 41, 59, 0.9) 0%, 
  rgba(15, 23, 42, 0.7) 100%
);

/* Elevated Card */
--card-elevated: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);
--card-elevated-dark: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
```

#### **Buttons & CTAs**
```css
/* Primary Action */
--btn-primary: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%);
--btn-primary-hover: linear-gradient(135deg, #0284C7 0%, #0369A1 100%);

/* Alert/Warning Button */
--btn-alert: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);

/* Danger/Critical Button */
--btn-danger: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);

/* Success Button */
--btn-success: linear-gradient(135deg, #10B981 0%, #059669 100%);
```

#### **Charts & Graphs**
```css
/* Multi-line Chart Colors */
--chart-line-1: #0EA5E9;  /* Primary Blue */
--chart-line-2: #06B6D4;  /* Cyan */
--chart-line-3: #10B981;  /* Green */
--chart-line-4: #F59E0B;  /* Amber */
--chart-line-5: #8B5CF6;  /* Purple */

/* Bar Chart Gradient */
--chart-bar-gradient: linear-gradient(180deg, #0EA5E9 0%, #0284C7 100%);

/* Area Chart Gradient */
--chart-area-gradient: linear-gradient(180deg, 
  rgba(14, 165, 233, 0.5) 0%, 
  rgba(14, 165, 233, 0.1) 100%
);
```

---

### **Alert & Status Colors**

```css
/* Status Indicators */
--status-success: linear-gradient(135deg, #10B981 0%, #059669 100%);
--status-warning: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
--status-error: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
--status-info: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);

/* Notification Badge */
--badge-critical: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
--badge-new: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
```

---

### **Accessibility Contrast Ratios**

All color combinations maintain **WCAG 2.1 AA standards**:
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

---

### **Recommended Implementation (Tailwind Config)**

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        water: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          500: '#0EA5E9',
          600: '#0284C7',
          900: '#0C4A6E',
        },
      },
      backgroundImage: {
        'water-gradient': 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
        'river-flow': 'linear-gradient(90deg, #0EA5E9 0%, #06B6D4 25%, #22D3EE 50%, #06B6D4 75%, #0EA5E9 100%)',
        'groundwater': 'linear-gradient(180deg, #DBEAFE 0%, #93C5FD 25%, #3B82F6 50%, #1E40AF 75%, #1E3A8A 100%)',
      }
    }
  }
}
```

---

**These gradients provide**: Visual hierarchy, intuitive status communication, thematic consistency with water/climate context, and excellent readability across both light and dark modes.