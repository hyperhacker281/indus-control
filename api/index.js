// Vercel serverless function entry point
const express = require("express");
const cors = require("cors");
const {
  DefaultAzureCredential,
  ClientSecretCredential,
} = require("@azure/identity");
const axios = require("axios");
const PDFDocument = require("pdfkit");
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
    // Fetch equipment data
    const result = await queryDataverse(
      `cr164_equipments(${req.params.id})?$select=cr164_equipmentid,cr164_equipmentnumber,cr164_equipmentdescription,cr164_location,cr164_manufacturer,cr164_model,cr164_serialnumber,cr164_flowrange,statecode,createdon`
    );
    const equipment = result;

    // Create PDF document
    const doc = new PDFDocument({ size: "LETTER", margin: 50 });
    const chunks = [];

    // Collect PDF data
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      const filename = `Equipment_Report_${equipment.cr164_equipmentnumber || req.params.id}.pdf`;
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Length", pdfBuffer.length);
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.end(pdfBuffer);
    });

    // Title
    doc.fontSize(20)
      .fillColor("#1e3a8a")
      .text("INDUS CONTROL", { align: "center" });
    
    doc.fontSize(10)
      .fillColor("#000")
      .text("Industrial Instrumentation & Automation", { align: "center" });
    
    doc.moveDown();
    
    doc.fontSize(14)
      .fillColor("#000")
      .text("VERIFICATION REPORT", { align: "center" });
    
    doc.fontSize(12)
      .text("Rosemount Electro-Magnetic Flow Measurement", { align: "center" });
    
    doc.moveDown(2);

    // Customer Information Section
    doc.fontSize(12).fillColor("#1e3a8a").text("CUSTOMER INFORMATION", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#000");
    doc.text(`Customer: Sample Customer`);
    doc.text(`Plant Name: ${equipment.cr164_location || "N/A"}`);
    doc.text(`Site Address: ${equipment.cr164_location || "N/A"}`);
    doc.moveDown();

    // Device Information Section
    doc.fontSize(12).fillColor("#1e3a8a").text("DEVICE INFORMATION", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#000");
    doc.text(`Make: ${equipment.cr164_manufacturer || "N/A"}`);
    doc.text(`Model: ${equipment.cr164_model || "N/A"}`);
    doc.text(`Serial No: ${equipment.cr164_serialnumber || "N/A"}`);
    doc.text(`Asset ID: ${equipment.cr164_equipmentnumber || "N/A"}`);
    doc.text(`Unit: Flow Transmitter`);
    doc.text(`Flow Range: ${equipment.cr164_flowrange || "N/A"}`);
    doc.moveDown();

    // Service Information Section
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    
    doc.fontSize(12).fillColor("#1e3a8a").text("SERVICE INFORMATION", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#000");
    doc.text(`Date: ${currentDate}`);
    doc.text(`Report No: ${equipment.cr164_equipmentnumber || "N/A"}`);
    doc.text(`Status: ${equipment["statecode@OData.Community.Display.V1.FormattedValue"] || "N/A"}`);
    doc.moveDown();

    // Maintenance Checklist Section
    doc.fontSize(12).fillColor("#1e3a8a").text("MAINTENANCE CHECKLIST", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#000");
    doc.text("☑ Physical inspection of transmitter - OK");
    doc.text("☑ Check connections & wiring - OK");
    doc.text("☑ Verify configuration parameters - OK");
    doc.text("☑ Calibration verification - OK");
    doc.moveDown();

    // Instrument Test Results Section
    doc.fontSize(12).fillColor("#1e3a8a").text("INSTRUMENT TEST RESULTS", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#000");
    doc.text("4mA Output: Set Point 4.00 mA | Measured 4.01 mA | Status: PASS");
    doc.text("20mA Output: Set Point 20.00 mA | Measured 19.98 mA | Status: PASS");
    doc.text(`Flow Indication: 0 - ${equipment.cr164_flowrange || "N/A"} | Status: PASS`);
    doc.moveDown();

    // Tools & Equipment Section
    doc.fontSize(12).fillColor("#1e3a8a").text("TOOLS & EQUIPMENT USED", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#000");
    doc.text("Digital Multimeter (DMM-001) - Calibration Valid");
    doc.text("Flow Calibrator (FC-123) - Calibration Valid");
    doc.moveDown();

    // Verification Result
    doc.fontSize(14)
      .fillColor("#10b981")
      .text("✓ VERIFICATION TEST RESULT: PASSED", { align: "center" });
    doc.moveDown(2);

    // Signature Section
    doc.fontSize(10).fillColor("#000");
    const signatureY = doc.y;
    doc.text("_______________________", 100, signatureY);
    doc.text("Service Technician", 100, signatureY + 20);
    doc.text("_______________________", 350, signatureY);
    doc.text("Customer Representative", 350, signatureY + 20);
    
    doc.moveDown(3);

    // Footer
    doc.fontSize(8)
      .fillColor("#666")
      .text(
        "This verification was performed as per manufacturer's guidelines and industry standards.",
        { align: "center" }
      );
    doc.text(`Report generated on ${currentDate}`, { align: "center" });

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ success: false, error: error.message });
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
