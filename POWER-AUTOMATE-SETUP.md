# Power Automate PDF Generation Flow Setup

## Overview

This document explains how to set up a Power Automate flow to generate PDFs using the equipment template and PDFShift API.

## Current Workflow

✅ **Already Working:**

1. User clicks PDF button → API fetches data from Dataverse
2. API reads `templates/equipment-report.html`
3. API injects data into template using Handlebars
4. API sends HTML to PDFShift → Returns PDF to user

## Power Automate Integration (Additional Option)

### Endpoint for Power Automate

**POST** `https://indus-control-g17mugb16-hypers-projects-e55131ba.vercel.app/api/power-automate/equipment-data`

### Request Body Format

```json
{
  "equipmentId": "YOUR_EQUIPMENT_GUID_HERE"
}
```

### Response Format

```json
{
  "success": true,
  "data": {
    "currentDate": "December 7, 2025",
    "equipmentNumber": "EQ-001",
    "description": "Industrial Flow Meter",
    "location": "Building A - Room 101",
    "manufacturer": "Siemens",
    "model": "FM-3000",
    "serialNumber": "SN123456789",
    "flowRange": "0-100 L/min",
    "status": "Active"
  },
  "template": "<!DOCTYPE html>\n<html>...[FULL HTML TEMPLATE]...</html>",
  "pdfConfig": {
    "api_key": "sk_0525c6291b7524e6df45ec707f5e2c40882395f8",
    "format": "Letter",
    "margin": "0.3in",
    "use_print": true
  }
}
```

## Power Automate Flow Steps

### 1. Trigger: HTTP Request

- **Method:** POST
- **Request Body JSON Schema:**

```json
{
  "type": "object",
  "properties": {
    "equipmentId": {
      "type": "string"
    }
  }
}
```

### 2. Action: HTTP - Get Equipment Data

- **Method:** POST
- **URI:** `https://indus-control-g17mugb16-hypers-projects-e55131ba.vercel.app/api/power-automate/equipment-data`
- **Headers:**
  - `Content-Type`: `application/json`
- **Body:**

```json
{
  "equipmentId": "@{triggerBody()?['equipmentId']}"
}
```

### 3. Action: Parse JSON (Equipment Response)

- **Content:** `@{body('HTTP_-_Get_Equipment_Data')}`
- **Schema:** (Use the response format above)

### 4. Action: Compose - Replace Template Variables

Use **Replace** function to inject data into template:

```
replace(
  replace(
    replace(
      replace(
        replace(
          replace(
            replace(
              replace(
                replace(
                  body('Parse_JSON')?['template'],
                  '{{currentDate}}', body('Parse_JSON')?['data']?['currentDate']
                ),
                '{{equipmentNumber}}', body('Parse_JSON')?['data']?['equipmentNumber']
              ),
              '{{description}}', body('Parse_JSON')?['data']?['description']
            ),
            '{{location}}', body('Parse_JSON')?['data']?['location']
          ),
          '{{manufacturer}}', body('Parse_JSON')?['data']?['manufacturer']
        ),
        '{{model}}', body('Parse_JSON')?['data']?['model']
      ),
      '{{serialNumber}}', body('Parse_JSON')?['data']?['serialNumber']
    ),
    '{{flowRange}}', body('Parse_JSON')?['data']?['flowRange']
  ),
  '{{status}}', body('Parse_JSON')?['data']?['status']
)
```

### 5. Action: HTTP - PDFShift Convert to PDF

- **Method:** POST
- **URI:** `https://api.pdfshift.io/v3/convert/pdf`
- **Authentication:** Basic Auth
  - **Username:** `api`
  - **Password:** `@{body('Parse_JSON')?['pdfConfig']?['api_key']}`
- **Headers:**
  - `Content-Type`: `application/json`
- **Body:**

```json
{
  "source": "@{outputs('Compose_-_Replace_Template_Variables')}",
  "format": "@{body('Parse_JSON')?['pdfConfig']?['format']}",
  "margin": "@{body('Parse_JSON')?['pdfConfig']?['margin']}",
  "use_print": @{body('Parse_JSON')?['pdfConfig']?['use_print']}
}
```

### 6. Action: Response (Return PDF)

- **Status Code:** 200
- **Headers:**
  - `Content-Type`: `application/pdf`
  - `Content-Disposition`: `attachment; filename="Equipment_Report_@{body('Parse_JSON')?['data']?['equipmentNumber']}.pdf"`
- **Body:** `@{body('HTTP_-_PDFShift_Convert_to_PDF')}`

## Power Automate Flow URL

After creating the flow, you'll get an HTTP POST URL like:

```
https://prod-XX.westus.logic.azure.com:443/workflows/XXXXX/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=XXXXX
```

## Testing Power Automate Flow

### Using Postman/Thunder Client

```bash
POST https://YOUR_POWER_AUTOMATE_FLOW_URL
Content-Type: application/json

{
  "equipmentId": "12345678-1234-1234-1234-123456789abc"
}
```

### From Your Application

```javascript
const response = await axios.post(
  "https://YOUR_POWER_AUTOMATE_FLOW_URL",
  { equipmentId: item.cr164_equipmentid },
  { responseType: "blob" }
);

// Create download link
const url = window.URL.createObjectURL(new Blob([response.data]));
const link = document.createElement("a");
link.href = url;
link.setAttribute("download", `Equipment_Report_${equipmentNumber}.pdf`);
document.body.appendChild(link);
link.click();
link.remove();
```

## Data Format Summary

### Input to Power Automate Flow

```json
{
  "equipmentId": "GUID-FROM-DATAVERSE"
}
```

### Data Fields Available in Template

All these fields are replaced in the HTML template using `{{fieldName}}`:

| Variable              | Example Value         | Description                 |
| --------------------- | --------------------- | --------------------------- |
| `{{currentDate}}`     | December 7, 2025      | Current date in long format |
| `{{equipmentNumber}}` | EQ-001                | Equipment number            |
| `{{description}}`     | Industrial Flow Meter | Equipment description       |
| `{{location}}`        | Building A - Room 101 | Equipment location          |
| `{{manufacturer}}`    | Siemens               | Manufacturer name           |
| `{{model}}`           | FM-3000               | Model number                |
| `{{serialNumber}}`    | SN123456789           | Serial number               |
| `{{flowRange}}`       | 0-100 L/min           | Flow range specification    |
| `{{status}}`          | Active                | Equipment status            |

## Benefits of Power Automate Integration

1. **Centralized Control:** Manage PDF generation logic in Power Automate
2. **Easy Monitoring:** Track all PDF generation requests in Power Automate history
3. **Error Handling:** Built-in retry and error handling
4. **Integration:** Easy to integrate with SharePoint, OneDrive, Email, etc.
5. **No Code Changes:** Update flow without redeploying application

## Notes

- Current PDFShift account: 250 conversions/month free
- Template file: `api/templates/equipment-report.html`
- Template uses Handlebars syntax: `{{variableName}}`
- Both current API method and Power Automate method work independently
