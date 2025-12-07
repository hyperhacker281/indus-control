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

// PDF Generation endpoint
app.get("/api/equipment/:id/pdf", async (req, res) => {
  try {
    // PDF generation is not available on Vercel free plan
    // Use local backend with Puppeteer for PDF generation
    res.status(503).json({
      success: false,
      error: "PDF generation is not available on production deployment",
      message:
        "Please run the backend locally (npm start in backend folder) to use PDF generation features with full HTML template support.",
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({
      success: false,
      error: error.message,
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
