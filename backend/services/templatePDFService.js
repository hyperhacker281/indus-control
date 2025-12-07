const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

class TemplatePDFService {
  async generateEquipmentReport(equipment) {
    try {
      // Read the HTML template
      const templatePath = path.join(
        __dirname,
        "../templates/equipment-report.html"
      );
      const templateContent = fs.readFileSync(templatePath, "utf8");

      // Compile the template
      const template = handlebars.compile(templateContent);

      // Prepare data for template
      const data = {
        currentDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
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
        statusClass:
          equipment.statecode === 0 ? "status-active" : "status-inactive",
      };

      // Generate HTML with data
      const html = template(data);

      // Launch Puppeteer
      const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();

      // Set content
      await page.setContent(html, {
        waitUntil: "networkidle0",
      });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: "Letter",
        printBackground: true,
        margin: {
          top: "0.5in",
          right: "0.5in",
          bottom: "0.5in",
          left: "0.5in",
        },
      });

      await browser.close();

      return pdfBuffer;
    } catch (error) {
      console.error("Error generating PDF from template:", error);
      throw error;
    }
  }
}

module.exports = TemplatePDFService;
