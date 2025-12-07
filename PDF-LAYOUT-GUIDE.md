# PDF Layout Configuration Guide

## File Location

`backend/services/pdfService.js`

## Key Layout Components

### 1. Page Setup (Lines 7-9)

```javascript
const doc = new PDFDocument({
  size: "LETTER", // Page size: LETTER, A4, LEGAL
  margins: { top: 50, bottom: 50, left: 50, right: 50 }, // Page margins
});
```

**Options:**

- **Size**: `LETTER` (8.5" x 11"), `A4`, `LEGAL`, or custom `[width, height]`
- **Margins**: Adjust `top`, `bottom`, `left`, `right` in points (1 inch = 72 points)

### 2. Header Section (Lines 14-23)

```javascript
doc
  .fontSize(20)
  .font("Helvetica-Bold")
  .text("EQUIPMENT INSPECTION REPORT", { align: "center" })
  .moveDown();

doc
  .fontSize(12)
  .font("Helvetica")
  .text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" })
  .moveDown(2);
```

**Customize:**

- Change title text
- Adjust font size (20 = large)
- Alignment: `left`, `center`, `right`
- `moveDown(n)` adds vertical spacing

### 3. Equipment Fields (Lines 28-45)

```javascript
const details = [
  { label: "Equipment Number", value: equipment.cr164_equipmentnumber },
  { label: "Description", value: equipment.cr164_equipmentdescription },
  // Add more fields here
];
```

**How to Add/Remove Fields:**

```javascript
// Add a new field
{ label: "Your Label", value: equipment.your_field_name },

// Remove a field - just delete the line
```

### 4. Field Layout (addField method, Lines 153-163)

```javascript
addField(doc, label, value) {
  const y = doc.y;  // Current Y position

  doc.fontSize(10)
     .font("Helvetica-Bold")
     .text(label + ":", 50, y, { width: 150 });  // Label at X=50, width 150

  doc.font("Helvetica")
     .text(value || "N/A", 210, y, { width: 352 });  // Value at X=210, width 352

  doc.moveDown(0.5);  // Space between fields
}
```

**Position Parameters:**

- **X=50**: Label starts at 50 points from left
- **width: 150**: Label column is 150 points wide
- **X=210**: Value starts at 210 points (50 + 150 + 10 gap)
- **width: 352**: Value column width

### 5. Two-Column Layout

```javascript
// Left column field
doc.fontSize(10).text("Label:", 50, yPosition, { width: 100 });
doc.text("Value", 160, yPosition, { width: 140 });

// Right column field
doc.fontSize(10).text("Label:", 320, yPosition, { width: 100 });
doc.text("Value", 430, yPosition, { width: 132 });
```

### 6. Checklist (Lines 52-59)

```javascript
const checklist = [
  "Visual inspection completed",
  "Calibration verified",
  // Add more items
];

checklist.forEach((item) => {
  doc
    .fontSize(10)
    .text("☐ " + item)
    .moveDown(0.5);
});
```

### 7. Notes Box (Lines 77-79)

```javascript
const notesY = doc.y;
doc.rect(50, notesY, 512, 100).stroke(); // X, Y, Width, Height
```

**Parameters:**

- **50**: X position (left)
- **notesY**: Y position (current)
- **512**: Width
- **100**: Height

### 8. Signatures (Lines 87-111)

```javascript
const signatureY = doc.y;
const columnWidth = 240;

// Left signature
doc.fontSize(10).text("Inspector:", 50, signatureY);
doc
  .moveTo(50, signatureY + 40)
  .lineTo(50 + columnWidth, signatureY + 40)
  .stroke();

// Right signature
doc.fontSize(10).text("Supervisor:", 320, signatureY);
doc
  .moveTo(320, signatureY + 40)
  .lineTo(320 + columnWidth, signatureY + 40)
  .stroke();
```

## Common Customizations

### Add Company Logo

```javascript
// After doc.pipe(stream), add:
if (require("fs").existsSync("assets/logo.png")) {
  doc.image("assets/logo.png", 50, 30, { width: 100 });
}
doc.moveDown(3);
```

### Create a Table

```javascript
// Table header
const tableTop = doc.y;
const itemX = 50;
const descX = 200;
const qtyX = 400;

doc.fontSize(10).font("Helvetica-Bold");
doc.text("Item", itemX, tableTop);
doc.text("Description", descX, tableTop);
doc.text("Quantity", qtyX, tableTop);

// Horizontal line
doc
  .moveTo(50, tableTop + 15)
  .lineTo(562, tableTop + 15)
  .stroke();

// Table rows
let yPosition = tableTop + 25;
doc.font("Helvetica");
doc.text("Item 1", itemX, yPosition);
doc.text("Description 1", descX, yPosition);
doc.text("5", qtyX, yPosition);
```

### Add Borders/Boxes

```javascript
// Box around content
doc.rect(x, y, width, height).stroke();

// Filled box
doc.rect(x, y, width, height).fill("#f0f0f0");

// Rounded corners
doc.roundedRect(x, y, width, height, cornerRadius).stroke();
```

### Colors

```javascript
// Text color
doc.fillColor("#ff0000"); // Red
doc.fillColor("#000000"); // Black (reset)

// Line/border color
doc.strokeColor("#0000ff"); // Blue
```

### Fonts

Available fonts:

- `Helvetica`
- `Helvetica-Bold`
- `Helvetica-Oblique`
- `Helvetica-BoldOblique`
- `Times-Roman`
- `Times-Bold`
- `Courier`

```javascript
doc.font("Helvetica-Bold");
doc.fontSize(12);
```

## Complete Layout Example

Here's a custom layout with grid positioning:

```javascript
// Equipment info in 2 columns
const leftCol = 50;
const rightCol = 306;
const colWidth = 240;
let y = 100;

// Left column
doc.font("Helvetica-Bold").fontSize(10);
doc.text("Equipment Number:", leftCol, y);
doc.font("Helvetica");
doc.text(equipment.cr164_equipmentnumber || "N/A", leftCol, y + 15);

// Right column
doc.font("Helvetica-Bold");
doc.text("Manufacturer:", rightCol, y);
doc.font("Helvetica");
doc.text(equipment.cr164_manufacturer || "N/A", rightCol, y + 15);

y += 40; // Move down for next row
```

## Position Reference

**Page Dimensions (LETTER):**

- Width: 612 points
- Height: 792 points
- Usable width (with 50pt margins): 512 points
- Usable height (with 50pt margins): 692 points

**Common X Positions:**

- Left margin: 50
- Center: 306 (612/2)
- Right margin: 562 (612-50)

**Y Position:**

- Use `doc.y` to get current position
- Use `doc.moveDown(n)` to add space
- Use absolute Y values for precise placement

## Tips

1. **Test incremental changes** - Restart backend after each change
2. **Use `moveDown()`** for vertical spacing
3. **Save Y positions** - `const myY = doc.y;` before absolute positioning
4. **Check page breaks** - Add `doc.addPage()` if content is too long
5. **Use helper methods** - Create reusable functions like `addField()`

## Example: Custom Field Positioning

```javascript
// Fixed position field
doc.fontSize(10).font("Helvetica-Bold");
doc.text("Label:", 100, 200); // At X=100, Y=200
doc.font("Helvetica");
doc.text(value, 200, 200); // At X=200, Y=200

// Relative position field
const y = doc.y; // Get current Y
doc.fontSize(10).font("Helvetica-Bold");
doc.text("Label:", 100, y);
doc.font("Helvetica");
doc.text(value, 200, y);
doc.moveDown(); // Move cursor down
```

---

**To apply changes**: Edit `backend/services/pdfService.js` and restart the backend server.
