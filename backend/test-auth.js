require("dotenv").config();
const { ClientSecretCredential } = require("@azure/identity");

async function testAuthentication() {
  console.log("🔍 Testing Azure AD Authentication...\n");

  console.log("📋 Configuration:");
  console.log("   TENANT_ID:", process.env.TENANT_ID);
  console.log("   CLIENT_ID:", process.env.CLIENT_ID);
  console.log(
    "   CLIENT_SECRET:",
    process.env.CLIENT_SECRET
      ? "***" + process.env.CLIENT_SECRET.slice(-4)
      : "NOT SET"
  );
  console.log("   DATAVERSE_URL:", process.env.DATAVERSE_URL);
  console.log("");

  if (
    !process.env.TENANT_ID ||
    !process.env.CLIENT_ID ||
    !process.env.CLIENT_SECRET
  ) {
    console.error("❌ Missing required environment variables!");
    console.error("   Please check your .env file");
    process.exit(1);
  }

  try {
    console.log("🔐 Attempting to authenticate with Azure AD...");

    const credential = new ClientSecretCredential(
      process.env.TENANT_ID,
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET
    );

    const scope = `${process.env.DATAVERSE_URL}/.default`;
    console.log("   Requesting scope:", scope);
    console.log("");

    const tokenResponse = await credential.getToken(scope);

    console.log("✅ SUCCESS! Authentication worked!");
    console.log(
      "   Token received (first 50 chars):",
      tokenResponse.token.substring(0, 50) + "..."
    );
    console.log(
      "   Token expires at:",
      new Date(tokenResponse.expiresOnTimestamp).toISOString()
    );
    console.log("");
    console.log("🎉 Your Azure AD configuration is correct!");
    console.log("");
    console.log("Next steps:");
    console.log("1. Restart your backend server (Ctrl+C and npm start)");
    console.log("2. The application should now work");
  } catch (error) {
    console.error("");
    console.error("❌ AUTHENTICATION FAILED!");
    console.error("");
    console.error("Error:", error.message);
    console.error("");

    if (error.message.includes("AADSTS7000215")) {
      console.error("🔧 FIX: Invalid client secret");
      console.error("   1. Go to Azure Portal → App Registrations");
      console.error("   2. Find your app: Indus-Control-App");
      console.error('   3. Go to "Certificates & secrets"');
      console.error("   4. Create a NEW client secret");
      console.error("   5. Copy the VALUE (not the Secret ID)");
      console.error("   6. Update CLIENT_SECRET in .env file");
    } else if (error.message.includes("AADSTS700016")) {
      console.error("🔧 FIX: Invalid client ID or application not found");
      console.error("   1. Go to Azure Portal → App Registrations");
      console.error("   2. Verify the Application (client) ID");
      console.error("   3. Update CLIENT_ID in .env file");
    } else if (error.message.includes("AADSTS90002")) {
      console.error("🔧 FIX: Invalid tenant ID");
      console.error("   1. Go to Azure Portal → Azure Active Directory");
      console.error("   2. Copy the Directory (tenant) ID");
      console.error("   3. Update TENANT_ID in .env file");
    } else if (error.message.includes("AADSTS65001")) {
      console.error("🔧 FIX: Missing API permissions");
      console.error("   1. Go to Azure Portal → App Registrations → Your App");
      console.error('   2. Go to "API permissions"');
      console.error('   3. Click "Add a permission"');
      console.error('   4. Choose "Dynamics CRM"');
      console.error('   5. Select "Delegated permissions"');
      console.error('   6. Check "user_impersonation"');
      console.error('   7. Click "Add permissions"');
      console.error('   8. Click "Grant admin consent" button');
    } else {
      console.error("🔧 Common fixes:");
      console.error("   1. Verify all credentials in .env are correct");
      console.error("   2. Ensure the app has Dynamics CRM API permissions");
      console.error("   3. Grant admin consent for the permissions");
      console.error("   4. Check that the client secret hasn't expired");
    }

    console.error("");
    console.error("Full error details:");
    console.error(error);
  }
}

testAuthentication();
