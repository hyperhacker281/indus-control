# Indus Control - Equipment Management System

A full-stack web application to fetch and manage equipment data from Microsoft Power Apps (Dataverse) tables.

## 🏗️ Project Structure

```
Indus-control/
├── backend/                 # Node.js/Express API Server
│   ├── routes/
│   │   └── equipment.js    # Equipment API routes
│   ├── services/
│   │   └── dataverseService.js  # Dataverse integration
│   ├── .env.example        # Environment variables template
│   ├── .gitignore
│   ├── package.json
│   └── server.js           # Main server file
│
├── frontend/               # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── EquipmentFilters.js
│   │   │   ├── EquipmentTable.js
│   │   │   └── EquipmentModal.js
│   │   ├── services/
│   │   │   └── api.js      # API service layer
│   │   ├── App.js          # Main app component
│   │   ├── index.js
│   │   └── index.css       # Styles
│   ├── .gitignore
│   └── package.json
│
└── Reference/              # Reference documents
```

## ✨ Features

- 🔍 **Search & Filter**: Filter equipment by ID, Area Name, and Manufacturer
- 📋 **View Equipment**: Display all equipment data in a clean table format
- ➕ **Add Equipment**: Create new equipment records
- ✏️ **Edit Equipment**: Update existing equipment data
- 🗑️ **Delete Equipment**: Remove equipment records
- 🔐 **Secure Authentication**: Azure AD authentication for Dataverse access

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Microsoft Power Apps account with Dataverse access
- Azure AD App Registration

### Step 1: Azure AD App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Configure:
   - Name: `Indus-Control-App`
   - Supported account types: `Accounts in this organizational directory only`
   - Click **Register**
5. Note down:
   - **Application (client) ID**
   - **Directory (tenant) ID**
6. Go to **Certificates & secrets**
   - Create a **New client secret**
   - Note down the **secret value**
7. Go to **API permissions**
   - Click **Add a permission**
   - Choose **Dynamics CRM**
   - Select **Delegated permissions**
   - Check **user_impersonation**
   - Click **Grant admin consent**

### Step 2: Backend Setup

1. Navigate to the backend folder:

   ```cmd
   cd f:\Projects\Indus-control\backend
   ```

2. Install dependencies:

   ```cmd
   npm install
   ```

3. Create `.env` file (copy from `.env.example`):

   ```cmd
   copy .env.example .env
   ```

4. Edit `.env` file with your credentials:

   ```env
   TENANT_ID=your-tenant-id-from-azure
   CLIENT_ID=your-client-id-from-azure
   CLIENT_SECRET=your-client-secret-from-azure
   DATAVERSE_URL=https://your-org.crm.dynamics.com
   DATAVERSE_API_VERSION=9.2
   PORT=5000
   ```

   **Finding your Dataverse URL:**

   - Go to [Power Apps](https://make.powerapps.com)
   - Click the gear icon (Settings) > **Session details**
   - Copy the **Instance url**

5. Start the backend server:

   ```cmd
   npm start
   ```

   The server will run on `http://localhost:5000`

### Step 3: Frontend Setup

1. Open a **new terminal** and navigate to the frontend folder:

   ```cmd
   cd f:\Projects\Indus-control\frontend
   ```

2. Install dependencies:

   ```cmd
   npm install
   ```

3. Start the frontend development server:

   ```cmd
   npm start
   ```

   The app will open at `http://localhost:3000`

## 📊 Power Apps Table Configuration

### Equipment Table Fields

Your Equipment table in Power Apps should have these fields (adjust the `dataverseService.js` if your field names differ):

| Field Name               | Type | Description                 |
| ------------------------ | ---- | --------------------------- |
| `cr6a1_equipmentid`      | Text | Unique equipment identifier |
| `cr6a1_areaname`         | Text | Area/location name          |
| `cr6a1_manufacturername` | Text | Manufacturer name           |
| `cr6a1_model`            | Text | Equipment model             |
| `cr6a1_status`           | Text | Equipment status            |
| `cr6a1_installationdate` | Date | Installation date           |
| `cr6a1_description`      | Text | Description                 |

**Important Notes:**

- Replace `cr6a1` prefix with your actual schema prefix
- You can find the schema name by viewing your table in Power Apps
- Update field names in `backend/services/dataverseService.js` if different

### Finding Your Table Schema Name

1. Go to [Power Apps](https://make.powerapps.com)
2. Click **Tables** (formerly Dataverse)
3. Find your **Equipment** table
4. Click on it
5. The schema name appears at the top (e.g., `cr6a1_equipment`)
6. Update the table name in the code if different

## 🔧 Configuration

### Update Table Name in Backend

If your table has a different schema name, update `backend/services/dataverseService.js`:

```javascript
// Change this line (appears multiple times)
`${this.dataverseUrl}/api/data/v${this.apiVersion}/cr6a1_equipments`// To your actual table name (plural form)
`${this.dataverseUrl}/api/data/v${this.apiVersion}/YOUR_TABLE_NAME`;
```

### Update Field Names

If your fields have different names, update the filter conditions and field mappings in `dataverseService.js`.

## 📝 API Endpoints

### Backend API

| Method | Endpoint             | Description                               |
| ------ | -------------------- | ----------------------------------------- |
| GET    | `/api/equipment`     | Get all equipment (with optional filters) |
| GET    | `/api/equipment/:id` | Get single equipment by ID                |
| POST   | `/api/equipment`     | Create new equipment                      |
| PATCH  | `/api/equipment/:id` | Update equipment                          |
| DELETE | `/api/equipment/:id` | Delete equipment                          |
| GET    | `/api/health`        | Health check                              |

### Query Parameters (GET /api/equipment)

- `equipmentId`: Filter by equipment ID
- `areaName`: Filter by area name (partial match)
- `manufacturerName`: Filter by manufacturer (partial match)

Example:

```
http://localhost:5000/api/equipment?areaName=Production&manufacturerName=Siemens
```

## 🎨 Usage

1. **Search Equipment**: Enter filters and click "Search"
2. **Clear Filters**: Click "Clear Filters" to reset
3. **Add New**: Click "Add New Equipment" to create a record
4. **Edit**: Click the "Edit" button on any row
5. **Delete**: Click "Delete" and confirm

## 🐛 Troubleshooting

### Authentication Errors

**Error**: `Failed to authenticate with Dataverse`

- Verify your Azure AD credentials in `.env`
- Ensure the app has proper API permissions
- Check that admin consent was granted

### Connection Errors

**Error**: `Network Error` or `CORS Error`

- Ensure backend is running on port 5000
- Check if frontend proxy is configured correctly
- Verify DATAVERSE_URL is correct

### Field Name Errors

**Error**: `Invalid column name`

- Your table fields have different names
- Update field names in `dataverseService.js`
- Check your table schema in Power Apps

### Table Not Found

**Error**: `Resource not found`

- Update the table name in `dataverseService.js`
- Ensure you're using the plural form (e.g., `cr6a1_equipments`)
- Verify table exists in your Dataverse environment

## 📦 Deployment

### Backend Deployment

1. Deploy to Azure App Service, Heroku, or similar
2. Set environment variables in the hosting platform
3. Update CORS settings if needed

### Frontend Deployment

1. Build the production app:

   ```cmd
   npm run build
   ```

2. Deploy the `build` folder to:

   - Azure Static Web Apps
   - Netlify
   - Vercel
   - GitHub Pages

3. Update `REACT_APP_API_URL` to point to your deployed backend

## 🔐 Security Notes

- Never commit `.env` files to version control
- Keep client secrets secure
- Use environment variables for all sensitive data
- Enable HTTPS in production
- Implement proper user authentication in production

## 📚 Technologies Used

### Backend

- Node.js
- Express.js
- @azure/identity (Azure AD authentication)
- Axios (HTTP client)

### Frontend

- React 18
- Axios
- CSS3

## 🤝 Support

For issues related to:

- **Power Apps/Dataverse**: Check Microsoft documentation
- **Azure AD**: Review Azure portal settings
- **Application errors**: Check browser console and server logs

## 📄 License

This project is for internal use.

---

**Created**: December 2025  
**Version**: 1.0.0
