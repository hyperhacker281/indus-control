const express = require("express");
const router = express.Router();
const DataverseService = require("../services/dataverseService");
const PDFService = require("../services/pdfService");
const TemplatePDFService = require("../services/templatePDFService");
const WordPDFService = require("../services/wordPDFService");

const dataverseService = new DataverseService();
const pdfService = new PDFService();
const templatePDFService = new TemplatePDFService();
const wordPDFService = new WordPDFService();

// GET all equipment with optional filters
router.get("/", async (req, res) => {
  try {
    const filters = {
      equipmentNumber: req.query.equipmentNumber,
      location: req.query.location,
      manufacturer: req.query.manufacturer,
      serialNumber: req.query.serialNumber,
    };

    // Remove undefined filters
    Object.keys(filters).forEach(
      (key) => filters[key] === undefined && delete filters[key]
    );

    const equipment = await dataverseService.getEquipment(filters);
    res.json({
      success: true,
      count: equipment.length,
      data: equipment,
    });
  } catch (error) {
    console.error("Error in GET /equipment:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET single equipment by ID
router.get("/:id", async (req, res) => {
  try {
    const equipment = await dataverseService.getEquipmentById(req.params.id);
    res.json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    console.error("Error in GET /equipment/:id:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST create new equipment
router.post("/", async (req, res) => {
  try {
    const equipment = await dataverseService.createEquipment(req.body);
    res.status(201).json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    console.error("Error in POST /equipment:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PATCH update equipment
router.patch("/:id", async (req, res) => {
  try {
    const equipment = await dataverseService.updateEquipment(
      req.params.id,
      req.body
    );
    res.json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    console.error("Error in PATCH /equipment/:id:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE equipment
router.delete("/:id", async (req, res) => {
  try {
    await dataverseService.deleteEquipment(req.params.id);
    res.json({
      success: true,
      message: "Equipment deleted successfully",
    });
  } catch (error) {
    console.error("Error in DELETE /equipment/:id:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET equipment PDF report (using HTML template)
router.get("/:id/pdf", async (req, res) => {
  try {
    const equipment = await dataverseService.getEquipmentById(req.params.id);

    // Generate PDF from HTML template
    const pdfBuffer = await templatePDFService.generateEquipmentReport(
      equipment
    );

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Equipment_${
        equipment.cr164_equipmentnumber || req.params.id
      }_Report.pdf`
    );

    // Send PDF buffer
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error in GET /equipment/:id/pdf:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET equipment Word DOCX report (using Word template)
router.get("/:id/docx", async (req, res) => {
  try {
    const equipment = await dataverseService.getEquipmentById(req.params.id);

    // Generate DOCX from Word template
    const docxBuffer = await wordPDFService.generateEquipmentReport(
      equipment,
      "docx"
    );

    // Set response headers for DOCX download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Equipment_${
        equipment.cr164_equipmentnumber || req.params.id
      }_Report.docx`
    );

    // Send DOCX buffer
    res.send(docxBuffer);
  } catch (error) {
    console.error("Error in GET /equipment/:id/docx:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET equipment PDF report (using Word template, converted to PDF)
router.get("/:id/word-pdf", async (req, res) => {
  try {
    const equipment = await dataverseService.getEquipmentById(req.params.id);

    // Generate PDF from Word template
    const pdfBuffer = await wordPDFService.generateEquipmentReport(
      equipment,
      "pdf"
    );

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Equipment_${
        equipment.cr164_equipmentnumber || req.params.id
      }_Report.pdf`
    );

    // Send PDF buffer
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error in GET /equipment/:id/word-pdf:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
