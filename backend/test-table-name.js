require("dotenv").config();
const { ClientSecretCredential } = require("@azure/identity");
const axios = require("axios");

async function testTableNames() {
  console.log("🔍 Testing different table name variations...\n");

  try {
    const credential = new ClientSecretCredential(
      process.env.TENANT_ID,
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET
    );

    const scope = `${process.env.DATAVERSE_URL}/.default`;
    const tokenResponse = await credential.getToken(scope);
    const token = tokenResponse.token;

    const variations = [
      "cr164_equipment",
      "cr164_equipments",
      "cr164_Equipment",
      "cr164_Equipments",
    ];

    for (const tableName of variations) {
      console.log(`Testing: ${tableName}`);
      try {
        const response = await axios.get(
          `${process.env.DATAVERSE_URL}/api/data/v${process.env.DATAVERSE_API_VERSION}/${tableName}?$top=1`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "OData-MaxVersion": "4.0",
              "OData-Version": "4.0",
              Accept: "application/json",
              Prefer: 'odata.include-annotations="*"',
            },
          }
        );

        console.log(`✅ SUCCESS with: ${tableName}\n`);
        console.log(
          `Total records: ${response.data["@odata.count"] || "unknown"}`
        );

        if (response.data.value && response.data.value.length > 0) {
          console.log("\n📊 Fields in first record:\n");
          const record = response.data.value[0];
          Object.keys(record).forEach((key) => {
            if (!key.startsWith("@") && !key.startsWith("_")) {
              console.log(`   ${key}: ${record[key]}`);
            }
          });
        } else {
          console.log("Table is empty - no records found\n");
        }

        console.log(`\n🎯 Use this table name in your code: ${tableName}\n`);
        return;
      } catch (error) {
        if (error.response?.status === 404) {
          console.log(`   ❌ Not found`);
        } else {
          console.log(
            `   ❌ Error: ${error.response?.status || error.message}`
          );
        }
      }
    }

    console.log("\n⚠️  None of the table name variations worked.");
    console.log(
      "The table might be named differently. Checking entity set name...\n"
    );

    // Try to get the entity set name from metadata
    try {
      const metadataResponse = await axios.get(
        `${process.env.DATAVERSE_URL}/api/data/v${process.env.DATAVERSE_API_VERSION}/EntityDefinitions(LogicalName='cr164_equipment')?$select=EntitySetName,LogicalName`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            Accept: "application/json",
          },
        }
      );

      const entitySetName = metadataResponse.data.EntitySetName;
      console.log(`✅ Found EntitySetName: ${entitySetName}`);
      console.log(`\n🎯 Use this in your code: ${entitySetName}\n`);

      // Test it
      console.log(`Testing with EntitySetName...`);
      const testResponse = await axios.get(
        `${process.env.DATAVERSE_URL}/api/data/v${process.env.DATAVERSE_API_VERSION}/${entitySetName}?$top=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            Accept: "application/json",
          },
        }
      );

      console.log(`✅ SUCCESS!\n`);

      if (testResponse.data.value && testResponse.data.value.length > 0) {
        console.log("📊 Sample record fields:\n");
        const record = testResponse.data.value[0];
        Object.keys(record).forEach((key) => {
          if (!key.startsWith("@") && !key.startsWith("_")) {
            console.log(`   ${key}: ${record[key]}`);
          }
        });
      }
    } catch (err) {
      console.error("Error getting metadata:", err.message);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testTableNames();
