# 🔧 Fixing 403 Forbidden Error - "User is not a member of the organization"

## Problem

Your Azure AD app can authenticate successfully, but it's not authorized to access your Dataverse environment.

## Solution: Add the Application User to Dataverse

### Option 1: Add Application User in Power Platform Admin Center (Recommended)

1. **Go to Power Platform Admin Center**

   - Visit: https://admin.powerplatform.microsoft.com/
   - Sign in with your admin account

2. **Select Your Environment**

   - Click on **Environments** in the left menu
   - Find and click on your environment (the one with URL: `org2043d6df.crm3.dynamics.com`)

3. **Add Application User**

   - Click **Settings** at the top
   - Expand **Users + permissions**
   - Click **Application users**
   - Click **+ New app user** button

4. **Configure the App User**

   - Click **+ Add an app**
   - Search for your app by Client ID: `de7f189f-71cb-4cb6-8565-5c21c4882b41`
   - Select it and click **Add**

5. **Assign Security Role**

   - Under **Business unit**, select your business unit
   - Click the **Edit** icon (pencil) next to Security roles
   - Select **System Administrator** (or a custom role with appropriate permissions)
   - Click **Save**

6. **Verify**
   - You should now see your app listed in Application users
   - The status should be "Enabled"

### Option 2: Use PowerShell (Alternative)

If you have PowerShell and the Power Platform tools installed:

```powershell
# Install module if needed
Install-Module -Name Microsoft.PowerApps.Administration.PowerShell

# Connect
Add-PowerAppsAccount

# Get your environment
Get-AdminPowerAppEnvironment

# Add application user (replace with your environment name)
New-PowerAppManagementApp -EnvironmentName "your-environment-name" -ApplicationId "de7f189f-71cb-4cb6-8565-5c21c4882b41"
```

### Option 3: Alternative - Use User Delegation Instead of Service Principal

If you can't add the app user, you can switch to user delegation flow:

**This requires:**

1. User authentication (OAuth with login prompt)
2. The logged-in user must have access to Dataverse
3. More complex implementation

Let me know if you need help with this approach.

## After Adding the Application User

1. **Wait 5-10 minutes** for permissions to propagate
2. **Restart your backend server**
3. **Test again** - the 403 error should be resolved

## Verification Steps

Run the test script again:

```cmd
cd f:\Projects\Indus-control\backend
node find-table.js
```

You should see your tables listed instead of a 403 error.

## Common Issues

### "I don't have admin access"

- You need to be a **Global Admin** or **Power Platform Admin**
- Contact your IT administrator to grant access or add the app user for you

### "I can't find Application users menu"

- Make sure you're in the Power Platform Admin Center (not Power Apps maker portal)
- Ensure you have the correct permissions
- The environment must be a Dataverse environment (not a default environment)

### "The app user was added but still getting 403"

- Wait a few minutes for permissions to sync
- Ensure the security role has sufficient permissions
- Try assigning "System Administrator" role temporarily to test

## Security Note

In production, don't use "System Administrator" role. Create a custom security role with only the permissions needed for your Equipment table operations.

---

**Next Steps:**

1. Add the application user following Option 1
2. Wait 5 minutes
3. Run: `node find-table.js` to verify
4. Restart backend server
5. Test the web application
