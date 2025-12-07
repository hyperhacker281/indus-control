require("dotenv").config();
const { ClientSecretCredential } = require("@azure/identity");
const axios = require("axios");

async function findEquipmentTable() {
  console.log("🔍 Searching for Equipment table in your Dataverse...\n");

  try {
    // Authenticate
    const credential = new ClientSecretCredential(
      process.env.TENANT_ID,
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET
    );

    const scope = `${process.env.DATAVERSE_URL}/.default`;
    const tokenResponse = await credential.getToken(scope);
    const token = tokenResponse.token;

    console.log("✅ Authentication successful!\n");
    console.log("📋 Fetching all tables from Dataverse...\n");

    // Get all tables
    const response = await axios.get(
      `${process.env.DATAVERSE_URL}/api/data/v${process.env.DATAVERSE_API_VERSION}/EntityDefinitions?$select=LogicalName,DisplayName,SchemaName&$filter=IsCustomEntity eq true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "OData-MaxVersion": "4.0",
          "OData-Version": "4.0",
          Accept: "application/json",
        },
      }
    );

    const tables = response.data.value;

    console.log(`Found ${tables.length} custom tables:\n`);

    // Filter for equipment-related tables
    const equipmentTables = tables.filter(
      (t) =>
        t.LogicalName.toLowerCase().includes("equip") ||
        t.DisplayName?.LocalizedLabels?.[0]?.Label?.toLowerCase().includes(
          "equip"
        )
    );

    if (equipmentTables.length > 0) {
      console.log("🎯 Possible Equipment tables found:\n");
      equipmentTables.forEach((table) => {
        console.log(`   Table Name: ${table.LogicalName}`);
        console.log(`   Schema Name: ${table.SchemaName}`);
        console.log(
          `   Display Name: ${
            table.DisplayName?.LocalizedLabels?.[0]?.Label || "N/A"
          }`
        );
        console.log("");
      });

      console.log("📝 Update your code with the correct table name:");
      console.log(`   Use: ${equipmentTables[0].LogicalName}\n`);
    } else {
      console.log('⚠️  No tables with "equipment" in the name found.\n');
      console.log("📋 All custom tables in your environment:\n");
      tables.slice(0, 20).forEach((table) => {
        console.log(
          `   - ${table.LogicalName} (${
            table.DisplayName?.LocalizedLabels?.[0]?.Label || "N/A"
          })`
        );
      });

      if (tables.length > 20) {
        console.log(`   ... and ${tables.length - 20} more tables`);
      }
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);

    if (error.response) {
      console.error("\nResponse Status:", error.response.status);
      console.error(
        "Response Data:",
        JSON.stringify(error.response.data, null, 2)
      );

      if (error.response.status === 403) {
        console.error("\n🔧 FIX: Permission Denied (403)");
        console.error("\nYour Azure AD app needs additional permissions:");
        console.error("1. Go to Azure Portal → App Registrations → Your App");
        console.error('2. Go to "API permissions"');
        console.error(
          '3. Make sure you have "Dynamics CRM" → "user_impersonation"'
        );
        console.error('4. Click "Grant admin consent for [Your Org]"');
        console.error("\nAlternatively, you may need to:");
        console.error(
          "- Add your user to a security role in Power Platform Admin Center"
        );
        console.error("- Grant the app service principal access to Dataverse");
      }
    } else {
      console.error("\nFull error:", error);
    }
  }
}

findEquipmentTable();
