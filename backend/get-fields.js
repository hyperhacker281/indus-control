require("dotenv").config();
const { ClientSecretCredential } = require("@azure/identity");
const axios = require("axios");

async function getTableFields() {
  console.log("🔍 Fetching Equipment table fields...\n");

  try {
    const credential = new ClientSecretCredential(
      process.env.TENANT_ID,
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET
    );

    const scope = `${process.env.DATAVERSE_URL}/.default`;
    const tokenResponse = await credential.getToken(scope);
    const token = tokenResponse.token;

    console.log("✅ Authenticated!\n");

    // First, try to get data from the table
    console.log("📋 Attempting to fetch data from cr164_equipment...\n");

    try {
      const response = await axios.get(
        `${process.env.DATAVERSE_URL}/api/data/v${process.env.DATAVERSE_API_VERSION}/cr164_equipment?$top=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            Accept: "application/json",
          },
        }
      );

      if (response.data.value && response.data.value.length > 0) {
        const firstRecord = response.data.value[0];
        console.log("✅ Successfully fetched data!\n");
        console.log("📊 Available fields in the Equipment table:\n");

        Object.keys(firstRecord).forEach((field) => {
          const value = firstRecord[field];
          const type = typeof value;
          if (
            !field.startsWith("@") &&
            !field.startsWith("_") &&
            field !== "odata.etag"
          ) {
            console.log(
              `   ${field} (${type}): ${
                value !== null ? String(value).substring(0, 50) : "null"
              }`
            );
          }
        });

        console.log("\n📝 Update your code to use these field names.");
      } else {
        console.log(
          "⚠️  Table exists but is empty. Let me get field definitions...\n"
        );
        await getFieldDefinitions(token);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('❌ Table "cr164_equipment" not found!\n');
        console.log("Available equipment tables:");
        console.log("   - cr164_equipmentmaintenancerecord");
        console.log("   - cr164_equipment");
        console.log("   - cr164_equipmentdetails");
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    }
  }
}

async function getFieldDefinitions(token) {
  try {
    const response = await axios.get(
      `${process.env.DATAVERSE_URL}/api/data/v${process.env.DATAVERSE_API_VERSION}/EntityDefinitions(LogicalName='cr164_equipment')/Attributes?$select=LogicalName,AttributeType,DisplayName`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "OData-MaxVersion": "4.0",
          "OData-Version": "4.0",
          Accept: "application/json",
        },
      }
    );

    console.log("📊 Field definitions:\n");
    response.data.value
      .filter((f) => f.LogicalName.startsWith("cr164_"))
      .forEach((field) => {
        const displayName =
          field.DisplayName?.LocalizedLabels?.[0]?.Label || "N/A";
        console.log(
          `   ${field.LogicalName} - ${displayName} (${field.AttributeType})`
        );
      });
  } catch (err) {
    console.error("Could not fetch field definitions:", err.message);
  }
}

getTableFields();
