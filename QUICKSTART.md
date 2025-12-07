# Quick Start Guide - Indus Control

## 🚀 Get Started in 5 Minutes

### 1. Azure AD Setup (One-time)

1. Go to https://portal.azure.com
2. **Azure Active Directory** → **App registrations** → **New registration**
3. Name: `Indus-Control-App`
4. Register and copy:
   - Application (client) ID
   - Directory (tenant) ID
5. **Certificates & secrets** → **New client secret** → Copy the value
6. **API permissions** → **Add permission** → **Dynamics CRM** → **user_impersonation** → **Grant admin consent**

### 2. Get Your Dataverse URL

1. Go to https://make.powerapps.com
2. Settings (gear icon) → **Session details**
3. Copy the **Instance url** (e.g., https://orgname.crm.dynamics.com)

### 3. Backend Setup

Open Command Prompt:

```cmd
cd f:\Projects\Indus-control\backend
npm install
copy .env.example .env
notepad .env
```

Edit `.env` with your values:

```env
TENANT_ID=paste-your-tenant-id
CLIENT_ID=paste-your-client-id
CLIENT_SECRET=paste-your-client-secret
DATAVERSE_URL=https://your-org.crm.dynamics.com
DATAVERSE_API_VERSION=9.2
PORT=5000
```

Save and start the server:

```cmd
npm start
```

### 4. Frontend Setup

Open a **NEW** Command Prompt:

```cmd
cd f:\Projects\Indus-control\frontend
npm install
npm start
```

Browser will open at http://localhost:3000

## ✅ Verification

- Backend running: http://localhost:5000/api/health
- Frontend running: http://localhost:3000
- Test search with filters!

## 🔧 Important: Update Table Name

Your Power Apps table might have a different name. To find it:

1. Go to https://make.powerapps.com → **Tables**
2. Click your **Equipment** table
3. Look for the schema name (e.g., `cr6a1_equipment`)

Update in `backend/services/dataverseService.js`:

- Find: `cr6a1_equipments` (appears 5 times)
- Replace with: `YOUR_TABLE_NAME` (use plural form)

## 🎯 Common Issues

| Issue                    | Solution                               |
| ------------------------ | -------------------------------------- |
| "Failed to authenticate" | Check .env credentials                 |
| "Resource not found"     | Update table name in code              |
| "Invalid column name"    | Update field names to match your table |
| Backend won't start      | Check if port 5000 is free             |
| Frontend shows errors    | Ensure backend is running first        |

## 📋 Next Steps

1. Test filtering by Equipment ID, Area, or Manufacturer
2. Try adding a new equipment
3. Edit and delete existing records
4. Review README.md for detailed documentation

---

**Need Help?** Check the full README.md for detailed troubleshooting.
