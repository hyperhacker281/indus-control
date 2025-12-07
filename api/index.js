// Vercel serverless function entry point
const express = require("express");
const cors = require("cors");
const {
  DefaultAzureCredential,
  ClientSecretCredential,
} = require("@azure/identity");
const axios = require("axios");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dataverse API helper
async function getDataverseToken() {
  const credential = new ClientSecretCredential(
    process.env.TENANT_ID,
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET
  );

  const token = await credential.getToken(
    "https://org2043d6df.crm3.dynamics.com/.default"
  );
  return token.token;
}

async function queryDataverse(endpoint, method = "GET", data = null) {
  const token = await getDataverseToken();
  const config = {
    method,
    url: `https://org2043d6df.crm3.dynamics.com/api/data/v9.2/${endpoint}`,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "OData-MaxVersion": "4.0",
      "OData-Version": "4.0",
    },
  };

  if (data) {
    config.data = data;
  }

  const response = await axios(config);
  return response.data;
}

// Equipment routes
app.get("/api/equipment", async (req, res) => {
  try {
    const { equipmentNumber, serialNumber, manufacturer, location } = req.query;
    let filter = [];

    if (equipmentNumber) {
      filter.push(`contains(cr164_equipmentnumber, '${equipmentNumber}')`);
    }
    if (serialNumber) {
      filter.push(`contains(cr164_serialnumber, '${serialNumber}')`);
    }
    if (manufacturer) {
      filter.push(`contains(cr164_manufacturer, '${manufacturer}')`);
    }
    if (location) {
      filter.push(`contains(cr164_location, '${location}')`);
    }

    const filterQuery =
      filter.length > 0 ? `&$filter=${filter.join(" and ")}` : "";
    const result = await queryDataverse(
      `cr164_equipments?$select=cr164_equipmentid,cr164_equipmentnumber,cr164_equipmentdescription,cr164_location,cr164_manufacturer,cr164_model,cr164_serialnumber,cr164_flowrange,statecode,createdon${filterQuery}`
    );

    res.json({ success: true, data: result.value });
  } catch (error) {
    console.error("Error fetching equipment:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/equipment/:id", async (req, res) => {
  try {
    const result = await queryDataverse(
      `cr164_equipments(${req.params.id})?$select=cr164_equipmentid,cr164_equipmentnumber,cr164_equipmentdescription,cr164_location,cr164_manufacturer,cr164_model,cr164_serialnumber,cr164_flowrange,statecode,createdon`
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching equipment:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/equipment", async (req, res) => {
  try {
    const equipment = {
      cr164_equipmentnumber:
        req.body.cr164_equipmentnumber || req.body.equipmentNumber,
      cr164_equipmentdescription:
        req.body.cr164_equipmentdescription || req.body.description,
      cr164_location: req.body.cr164_location || req.body.location,
      cr164_manufacturer: req.body.cr164_manufacturer || req.body.manufacturer,
      cr164_model: req.body.cr164_model || req.body.model,
      cr164_serialnumber: req.body.cr164_serialnumber || req.body.serialNumber,
      cr164_flowrange: req.body.cr164_flowrange || req.body.flowRange,
    };

    const result = await queryDataverse("cr164_equipments", "POST", equipment);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error creating equipment:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch("/api/equipment/:id", async (req, res) => {
  try {
    const equipment = {
      cr164_equipmentnumber:
        req.body.cr164_equipmentnumber || req.body.equipmentNumber,
      cr164_equipmentdescription:
        req.body.cr164_equipmentdescription || req.body.description,
      cr164_location: req.body.cr164_location || req.body.location,
      cr164_manufacturer: req.body.cr164_manufacturer || req.body.manufacturer,
      cr164_model: req.body.cr164_model || req.body.model,
      cr164_serialnumber: req.body.cr164_serialnumber || req.body.serialNumber,
      cr164_flowrange: req.body.cr164_flowrange || req.body.flowRange,
    };

    await queryDataverse(
      `cr164_equipments(${req.params.id})`,
      "PATCH",
      equipment
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating equipment:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete("/api/equipment/:id", async (req, res) => {
  try {
    await queryDataverse(`cr164_equipments(${req.params.id})`, "DELETE");
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting equipment:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PDF Generation endpoint using Doppio API
app.get("/api/equipment/:id/pdf", async (req, res) => {
  try {
    // Fetch equipment data
    const result = await queryDataverse(
      `cr164_equipments(${req.params.id})?$select=cr164_equipmentid,cr164_equipmentnumber,cr164_equipmentdescription,cr164_location,cr164_manufacturer,cr164_model,cr164_serialnumber,cr164_flowrange,statecode,createdon`
    );
    const equipment = result;

    // Read the HTML template
    const templatePath = path.join(
      __dirname,
      "templates/equipment-report.html"
    );
    const templateContent = fs.readFileSync(templatePath, "utf8");

    // Compile the template
    const template = handlebars.compile(templateContent);

    // Prepare data for template
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const data = {
      currentDate: currentDate,
      equipmentNumber: equipment.cr164_equipmentnumber || "N/A",
      description: equipment.cr164_equipmentdescription || "N/A",
      location: equipment.cr164_location || "N/A",
      manufacturer: equipment.cr164_manufacturer || "N/A",
      model: equipment.cr164_model || "N/A",
      serialNumber: equipment.cr164_serialnumber || "N/A",
      flowRange: equipment.cr164_flowrange || "N/A",
      status:
        equipment["statecode@OData.Community.Display.V1.FormattedValue"] ||
        "N/A",
    };

    // Generate HTML with data
    const html = template(data);

    console.log("Calling Doppio API for PDF generation...");

    // Use Doppio API for PDF conversion
    const pdfResponse = await axios.post(
      "https://api.doppio.sh/v1/render/pdf/sync",
      {
        html: html,
        options: {
          format: "Letter",
          printBackground: true,
          margin: {
            top: "0.3in",
            right: "0.3in",
            bottom: "0.3in",
            left: "0.3in",
          },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DOPPIO_API_KEY}`,
        },
        responseType: "arraybuffer",
        timeout: 30000,
      }
    );

    console.log("PDF generated successfully, size:", pdfResponse.data.length);

    // Send PDF
    const filename = `Equipment_Report_${
      equipment.cr164_equipmentnumber || req.params.id
    }.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", pdfResponse.data.length);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.end(Buffer.from(pdfResponse.data));
  } catch (error) {
    console.error("Error generating PDF:", error.message);
    if (error.response) {
      console.error(
        "Doppio API error:",
        error.response.status,
        error.response.data
      );
    }
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data
        ? JSON.stringify(error.response.data)
        : "PDF generation failed",
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Indus Control API is running on Vercel",
    timestamp: new Date().toISOString(),
  });
});

// Export for Vercel
module.exports = app;
