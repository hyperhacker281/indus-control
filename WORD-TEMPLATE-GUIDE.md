# Word Template Guide - How to Add Data Fields

## 📄 Your Word Template

File: `backend/SOP Report_Rosemount_87XX.docx`

## 🔧 How to Add Data Fields to Word Template

### Step 1: Open the Word Template

1. Open `SOP Report_Rosemount_87XX.docx` in Microsoft Word
2. You'll see your existing layout with tables and formatting

### Step 2: Add Placeholders

In Word, replace static text with placeholders using this syntax: `{FieldName}`

**Example:**

- Instead of: `Rosemount`
- Write: `{Make}`

- Instead of: `8712`
- Write: `{Model}`

### Available Data Fields (from your equipment)

```
{CustomerName}           - "Region of Niagara" (default)
{PlantName}             - Equipment description
{SiteAddress}           - Equipment location

{Make}                  - Manufacturer (e.g., Rosemount)
{Model}                 - Model number (e.g., 8712)
{OrderCode}             - "N/A" (static)
{SerialNo}              - Serial number
{SoftwareVersion}       - "5.3.1" (static)
{JobLocation}           - Location
{AssetID}               - Equipment number

{Date}                  - Current date (formatted)
{ReportNo}              - Equipment number
{JobNo}                 - Equipment number

{Unit}                  - "MLD" (static)
{FlowRange}             - Flow range
{CurrentOutput}         - "4-20 mA" (static)
{SetPoint4mA}           - "0" (static)
{SetPoint20mA}          - "14.725" (static)

{LineSize}              - '6"' (static)
{FlowCalTubeNo}         - "090490550" (static)
{Mounting}              - "Remote" (static)
{InstReadingASFOUND}    - "385.74" (static)
{InstReadingFlow}       - "0.56" (static)

{ServiceTechnician}     - "Chetan Parekh" (static)
{PrintedDate}           - Current date
{Status}                - Active/Inactive status
```

### Test Results Fields (for tables)

```
{TestPoint1}    {CalcFlow1}    {CalcOP1}    {UUTDisplay1}    {UUTOutput1}    {Deviation1}    {CalcmA1}    {SCADAValue1}
{TestPoint2}    {CalcFlow2}    {CalcOP2}    {UUTDisplay2}    {UUTOutput2}    {Deviation2}    {CalcmA2}    {SCADAValue2}
{TestPoint3}    {CalcFlow3}    {CalcOP3}    {UUTDisplay3}    {UUTOutput3}    {Deviation3}    {CalcmA3}    {SCADAValue3}
{TestPoint4}    {CalcFlow4}    {CalcOP4}    {UUTDisplay4}    {UUTOutput4}    {Deviation4}    {CalcmA4}    {SCADAValue4}
```

### Tools Information Fields

```
{Tool1Description}    {Tool1Manufacturer}    {Tool1Model}
{Tool2Description}    {Tool2Manufacturer}    {Tool2Model}
{Tool3Description}    {Tool3Manufacturer}    {Tool3Model}
```

## 📝 Example: Editing the Word Template

### Before (Static Text):

```
Device Information:
Make: Rosemount
Model: 8712
Serial No: 503383
```

### After (With Placeholders):

```
Device Information:
Make: {Make}
Model: {Model}
Serial No: {SerialNo}
```

## 🔄 How to Add More Fields

### 1. Add to Word Template

In Word document, add placeholder: `{NewFieldName}`

### 2. Add to wordPDFService.js

Edit `backend/services/wordPDFService.js`, find the `data` object and add:

```javascript
const data = {
  // ... existing fields ...

  NewFieldName: equipment.cr164_yourfield || "Default Value",
};
```

## 📋 Table Example

If you have a table in Word:

| Field     | Value      |
| --------- | ---------- |
| Make      | {Make}     |
| Model     | {Model}    |
| Serial No | {SerialNo} |

The placeholders will be replaced with actual data!

## ⚙️ Important Notes

1. **Exact Syntax**: Use `{FieldName}` - curly braces with NO spaces
2. **Case Sensitive**: `{Make}` is different from `{make}`
3. **Save**: After editing, save the Word template
4. **Restart**: Restart the backend server to pick up changes

## 🚀 How to Use

### Download DOCX Report (Word format):

Click a new button we'll add to download `.docx` file

### API Endpoint:

```
GET http://localhost:5000/api/equipment/{equipment-id}/docx
```

## 🎯 Example Workflow

1. **Edit Template**: Open Word file, replace text with `{Make}`
2. **Save**: Save the `.docx` file
3. **Restart Backend**: Stop and restart Node server
4. **Test**: Click download button to get filled Word document

## 🔍 Finding Placeholders

To see all placeholders in your Word document:

1. Press `Ctrl+F` in Word
2. Search for `{`
3. It will highlight all placeholders

## ✅ Benefits of Word Templates

✅ **Visual Editing** - Edit in familiar Word interface
✅ **Tables & Formatting** - Use Word's full formatting power
✅ **Images & Logos** - Easily insert company logos
✅ **No Coding** - Just replace text with `{FieldName}`
✅ **Professional** - Maintain exact layout and styling

## 📦 What's Next?

I've created:

1. ✅ `wordPDFService.js` - Processes Word template
2. ✅ New endpoint `/api/equipment/:id/docx` - Downloads Word file
3. ✅ All data fields mapped from database

Now you can:

- Open the Word template and add `{FieldName}` placeholders
- Download filled Word documents
- Optionally convert to PDF later

---

**Template Location:** `f:\Projects\Indus-control\backend\SOP Report_Rosemount_87XX.docx`
**Service File:** `f:\Projects\Indus-control\backend\services\wordPDFService.js`
