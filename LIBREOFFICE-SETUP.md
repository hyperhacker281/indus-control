# LibreOffice Installation Guide for Word to PDF Conversion

## ⚠️ Current Status

The **📕 Word→PDF** button requires **LibreOffice** to be installed on your system to work properly.

## 📥 Installation Steps

### Step 1: Download LibreOffice

1. Go to: https://www.libreoffice.org/download/
2. Click the green "Download" button
3. Select Windows version (64-bit recommended)
4. Download the installer

### Step 2: Install LibreOffice

1. Run the downloaded installer
2. Follow the installation wizard
3. **Use default installation settings** (important!)
4. Complete the installation

### Step 3: Restart Backend Server

1. Stop the backend server (press Ctrl+C in the terminal)
2. Start it again: `npm start`
3. The Word→PDF feature should now work!

## 🎯 Alternative Options (No Installation Needed)

If you don't want to install LibreOffice, you have 2 working options:

### Option 1: Download Word File (📝 Button)

- Click the **📝 Word** button (blue)
- Opens the filled Word document
- Manually click "File → Save As → PDF" in Microsoft Word
- ✅ Perfect formatting guaranteed

### Option 2: HTML-based PDF (📄 Button)

- Click the **📄 PDF** button (green)
- Downloads PDF from HTML template
- ✅ Works immediately, no installation needed

## 🔍 Troubleshooting

### Error: "Could not find soffice binary"

**Solution:** LibreOffice is not installed or not in the system PATH

- Install LibreOffice using steps above
- Make sure to use default installation path
- Restart the backend server

### Error: "PDF conversion failed"

**Solution:** Use one of the alternative options above:

- 📝 Word button → Download Word → Save as PDF in Word
- 📄 PDF button → Direct PDF download

## ✅ Summary

| Button            | Requires LibreOffice | Quality | Works Now        |
| ----------------- | -------------------- | ------- | ---------------- |
| 📄 PDF (green)    | ❌ No                | Good    | ✅ Yes           |
| 📝 Word (blue)    | ❌ No                | Perfect | ✅ Yes           |
| 📕 Word→PDF (red) | ✅ Yes               | Perfect | ⚠️ After install |

**Recommendation:**

- For best quality without installation: Use **📝 Word** button, then save as PDF in Microsoft Word
- For quick PDF: Use **📄 PDF** button (HTML template)
- After installing LibreOffice: Use **📕 Word→PDF** for automated perfect PDFs
