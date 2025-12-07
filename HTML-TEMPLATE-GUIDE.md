# HTML Template-Based PDF Generation Guide

## 🎯 Overview

Now you can design PDF layouts using **HTML/CSS** instead of coding! Just like RDL (Report Definition Language), you edit a visual template file.

## 📁 Files

### Template File (Design Your Layout Here)

```
backend/templates/equipment-report.html
```

This is your **visual template** - edit it like a regular HTML file to design your PDF layout.

### Service File (Handles PDF Generation)

```
backend/services/templatePDFService.js
```

This file reads the template and fills in the data automatically.

## 🎨 How to Edit the Template

### 1. Open the Template File

Open `backend/templates/equipment-report.html` in any text editor or VS Code.

### 2. Edit Like HTML

You can:

- ✅ Change colors, fonts, sizes in the `<style>` section
- ✅ Add/remove fields in the HTML
- ✅ Rearrange sections by moving HTML blocks
- ✅ Add tables, borders, images
- ✅ No coding required - just HTML/CSS!

## 📝 Common Customizations

### Change Colors

```css
/* In the <style> section */
.section-title {
  background-color: #0066cc; /* Change this color */
  color: white;
}

.header h1 {
  color: #0066cc; /* Change title color */
}
```

### Add Your Logo

```html
<!-- In the header section, uncomment and update path -->
<div class="logo">
  <img src="path/to/your/logo.png" alt="Company Logo" style="height: 60px;" />
</div>
```

### Add/Remove Fields from Table

```html
<!-- In the details-table section -->
<tr>
  <td class="label">Your New Field</td>
  <td class="value">{{yourFieldName}}</td>
</tr>
```

Then update `templatePDFService.js` to add the field data:

```javascript
const data = {
  // ... existing fields
  yourFieldName: equipment.cr164_yourfield || "N/A",
};
```

### Change Table Style

```css
.details-table td {
  padding: 8px; /* Cell padding */
  border: 1px solid #ddd; /* Border color and width */
}

.details-table .label {
  background-color: #f5f5f5; /* Label background */
  width: 30%; /* Label column width */
}
```

### Modify Checklist Items

```html
<!-- In the checklist section -->
<div class="checklist-item">
  <input type="checkbox" /> Your custom checklist item
</div>
```

### Change Fonts and Sizes

```css
body {
  font-family: Arial, sans-serif; /* Change font */
  font-size: 11pt; /* Change base size */
}

.header h1 {
  font-size: 24pt; /* Title size */
}
```

## 🔧 Available Data Fields

You can use these placeholders in your HTML template:

```
{{currentDate}}       - Current date
{{equipmentNumber}}   - Equipment number
{{description}}       - Equipment description
{{location}}          - Location
{{manufacturer}}      - Manufacturer name
{{model}}            - Model number
{{serialNumber}}     - Serial number
{{flowRange}}        - Flow range
{{status}}           - Status text
{{statusClass}}      - CSS class for status (status-active or status-inactive)
```

### How to Use Data Fields

In your HTML, wrap field names in `{{}}`:

```html
<td>{{equipmentNumber}}</td>
<div>Manufacturer: {{manufacturer}}</div>
<span>{{status}}</span>
```

## 📐 Layout Examples

### Create a Grid Layout

```html
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
  <div>Field 1: {{field1}}</div>
  <div>Field 2: {{field2}}</div>
  <div>Field 3: {{field3}}</div>
  <div>Field 4: {{field4}}</div>
</div>
```

### Create a Custom Table

```html
<table style="width: 100%; border-collapse: collapse;">
  <thead>
    <tr style="background-color: #0066cc; color: white;">
      <th style="padding: 10px; border: 1px solid #ddd;">Column 1</th>
      <th style="padding: 10px; border: 1px solid #ddd;">Column 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">{{field1}}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">{{field2}}</td>
    </tr>
  </tbody>
</table>
```

### Add Borders/Boxes

```html
<div style="border: 2px solid #0066cc; padding: 15px; margin: 10px 0;">
  <h3>Section Title</h3>
  <p>{{someField}}</p>
</div>
```

### Side-by-Side Layout

```html
<div style="display: flex; gap: 20px;">
  <div style="flex: 1; border: 1px solid #ddd; padding: 10px;">
    <strong>Left:</strong> {{leftField}}
  </div>
  <div style="flex: 1; border: 1px solid #ddd; padding: 10px;">
    <strong>Right:</strong> {{rightField}}
  </div>
</div>
```

## 🎯 Step-by-Step: Add a New Field

1. **Edit Template** (`equipment-report.html`):

```html
<tr>
  <td class="label">Installation Date</td>
  <td class="value">{{installationDate}}</td>
</tr>
```

2. **Edit Service** (`templatePDFService.js`):

```javascript
const data = {
  // ... existing fields
  installationDate: equipment.cr164_installationdate
    ? new Date(equipment.cr164_installationdate).toLocaleDateString()
    : "N/A",
};
```

3. **Restart Backend** and test!

## 🖼️ Adding Images

```html
<!-- In the template -->
<img src="path/to/image.png" alt="Description" style="width: 100px;" />

<!-- For dynamic images from data -->
<img src="{{imageUrl}}" alt="Equipment Photo" style="max-width: 300px;" />
```

## 🎨 CSS Styling Tips

### Colors

```css
/* Primary color */
#0066cc

/* Success green */
#10b981

/* Warning yellow */
#f59e0b

/* Danger red */
#ef4444

/* Gray */
#6b7280
```

### Common Styles

```css
/* Border */
border: 1px solid #ddd;

/* Shadow */
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

/* Rounded corners */
border-radius: 8px;

/* Bold text */
font-weight: bold;

/* Center text */
text-align: center;

/* Spacing */
padding: 10px;
margin: 10px 0;
```

## 🔄 After Editing

1. **Save** the template file
2. **Restart** the backend server:
   ```cmd
   cd backend
   npm start
   ```
3. **Test** by clicking the PDF button

## 📦 Installation

First, install required packages:

```cmd
cd f:\Projects\Indus-control\backend
npm install puppeteer handlebars
```

**Note:** Puppeteer downloads Chromium (~300MB) automatically on first install.

## 🚀 Advantages

✅ **Visual Design** - Edit layout like a web page
✅ **No Coding** - Just HTML/CSS
✅ **Easy Preview** - Open HTML in browser to preview
✅ **Flexible** - Add tables, images, complex layouts
✅ **Familiar** - Use standard HTML/CSS knowledge
✅ **Professional** - Print-optimized output

## 🔍 Testing Your Template

Before generating PDF, you can preview your template:

1. Open `equipment-report.html` in a browser
2. Replace `{{fieldName}}` with sample data temporarily
3. See how it looks
4. Adjust styles
5. Put back the `{{}}` placeholders
6. Test PDF generation

## 📄 Multiple Templates

You can create multiple templates for different purposes:

1. Create `equipment-report-simple.html`
2. Create `equipment-report-detailed.html`
3. Modify the service to use different templates based on needs

---

**Everything is ready!** Just install the packages and edit the HTML template file to design your PDF layout!
