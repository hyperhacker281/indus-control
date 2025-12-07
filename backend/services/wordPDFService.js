const Docxtemplater = require("docxtemplater");
const PizZip = require("pizzip");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");

const execPromise = promisify(exec);

class WordPDFService {
  async generateEquipmentReport(equipment, outputFormat = "docx") {
    try {
      // Read the Word template
      const templatePath = path.join(
        __dirname,
        "../SOP Report_Rosemount_87XX.docx"
      );
      const content = fs.readFileSync(templatePath, "binary");

      // Load the template into PizZip
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // Prepare data for the template
      const data = {
        // Customer Information
        CustomerName: "Region of Niagara",
        PlantName: equipment.cr164_equipmentdescription || "N/A",
        SiteAddress: equipment.cr164_location || "N/A",

        // Device Information
        Make: equipment.cr164_manufacturer || "N/A",
        Model: equipment.cr164_model || "N/A",
        OrderCode: "N/A",
        SerialNo: equipment.cr164_serialnumber || "N/A",
        SoftwareVersion: "5.3.1",
        JobLocation: equipment.cr164_location || "N/A",
        AssetID: equipment.cr164_equipmentnumber || "N/A",

        // Service Information
        Date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        ReportNo: equipment.cr164_equipmentnumber || "N/A",
        JobNo: equipment.cr164_equipmentnumber || "N/A",

        // Flow Details
        Unit: "MLD",
        FlowRange: equipment.cr164_flowrange || "N/A",
        CurrentOutput: "4-20 mA",
        SetPoint4mA: "0",
        SetPoint20mA: "14.725",

        // Sensor Details
        LineSize: '6"',
        FlowCalTubeNo: "090490550",
        Mounting: "Remote",
        InstReadingASFOUND: "385.74",
        InstReadingFlow: "0.56",

        // Test Results (example data - you can make these dynamic)
        TestPoint1: "0.00",
        CalcFlow1: "0.00",
        CalcOP1: "4.00",
        UUTDisplay1: "0.00",
        UUTOutput1: "4.00",
        Deviation1: "0.00",
        CalcmA1: "4.00",
        SCADAValue1: "0.00",

        TestPoint2: "3.00",
        CalcFlow2: "3.00",
        CalcOP2: "5.60",
        UUTDisplay2: "2.98",
        UUTOutput2: "5.56",
        Deviation2: "0.02",
        CalcmA2: "5.60",
        SCADAValue2: "1.44",

        TestPoint3: "10.00",
        CalcFlow3: "10.00",
        CalcOP3: "9.33",
        UUTDisplay3: "10.03",
        UUTOutput3: "9.28",
        Deviation3: "-0.03",
        CalcmA3: "9.33",
        SCADAValue3: "4.91",

        TestPoint4: "30.00",
        CalcFlow4: "30.00",
        CalcOP4: "20.00",
        UUTDisplay4: "29.97",
        UUTOutput4: "19.98",
        Deviation4: "0.03",
        CalcmA4: "20.00",
        SCADAValue4: "14.69",

        // Tools Information
        Tool1Description: "Calibrator",
        Tool1Manufacturer: "Rosemount",
        Tool1Model: "8714D",

        Tool2Description: "Electrical Multimeter",
        Tool2Manufacturer: "Fluke",
        Tool2Model: "T79",

        Tool3Description: "N/A",
        Tool3Manufacturer: "N/A",
        Tool3Model: "N/A",

        // Signature
        ServiceTechnician: "Chetan Parekh",
        PrintedDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),

        // Status
        Status:
          equipment["statecode@OData.Community.Display.V1.FormattedValue"] ||
          "N/A",
      };

      // Render the document (fill in the placeholders)
      doc.render(data);

      // Get the generated document as a buffer
      const buf = doc.getZip().generate({
        type: "nodebuffer",
        compression: "DEFLATE",
      });

      // If PDF format requested, convert DOCX to PDF
      if (outputFormat === "pdf") {
        return await this.convertToPDF(buf);
      }

      // Return the Word document buffer
      return buf;
    } catch (error) {
      console.error("Error generating Word report:", error);
      if (error.properties && error.properties.errors) {
        console.error(
          "Template errors:",
          JSON.stringify(error.properties.errors)
        );
      }
      throw error;
    }
  }

  async convertToPDF(docxBuffer) {
    try {
      // Create temporary files
      const tempDir = path.join(__dirname, "../temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const timestamp = Date.now();
      const tempDocxPath = path.join(tempDir, `temp_${timestamp}.docx`);
      const tempPdfPath = path.join(tempDir, `temp_${timestamp}.pdf`);

      // Write DOCX buffer to temp file
      fs.writeFileSync(tempDocxPath, docxBuffer);

      // PowerShell script to use Microsoft Word COM object for conversion
      const psScript = `
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $doc = $word.Documents.Open('${tempDocxPath.replace(/\\/g, "\\\\")}')
    $doc.SaveAs([ref] '${tempPdfPath.replace(/\\/g, "\\\\")}', [ref] 17)
    $doc.Close($false)
    $word.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($doc) | Out-Null
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
    exit 0
} catch {
    Write-Error $_.Exception.Message
    exit 1
}
      `.trim();

      // Save PowerShell script to temp file
      const psScriptPath = path.join(tempDir, `convert_${timestamp}.ps1`);
      fs.writeFileSync(psScriptPath, psScript);

      // Execute PowerShell script
      const { stdout, stderr } = await execPromise(
        `powershell -ExecutionPolicy Bypass -File "${psScriptPath}"`,
        {
          timeout: 60000, // 60 seconds timeout
        }
      );

      if (stderr) {
        console.error("PowerShell stderr:", stderr);
      }

      // Check if PDF was created
      if (!fs.existsSync(tempPdfPath)) {
        throw new Error(
          "PDF file was not created. Make sure Microsoft Word is installed and not showing any dialogs."
        );
      }

      // Read the generated PDF
      const pdfBuffer = fs.readFileSync(tempPdfPath);

      // Clean up temp files
      try {
        fs.unlinkSync(tempDocxPath);
        fs.unlinkSync(tempPdfPath);
        fs.unlinkSync(psScriptPath);
      } catch (cleanupError) {
        console.warn("Warning: Could not clean up temp files:", cleanupError);
      }

      return pdfBuffer;
    } catch (error) {
      console.error("Error converting DOCX to PDF:", error);
      throw new Error(
        `PDF conversion failed: ${error.message}. Make sure Microsoft Word is installed and accessible.`
      );
    }
  }
}

module.exports = WordPDFService;
