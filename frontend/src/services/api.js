import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "/api"
    : "http://localhost:5000/api");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const equipmentService = {
  // Get all equipment with optional filters
  getEquipment: async (filters = {}) => {
    try {
      const params = new URLSearchParams();

      if (filters.equipmentNumber) {
        params.append("equipmentNumber", filters.equipmentNumber);
      }
      if (filters.location) {
        params.append("location", filters.location);
      }
      if (filters.manufacturer) {
        params.append("manufacturer", filters.manufacturer);
      }
      if (filters.serialNumber) {
        params.append("serialNumber", filters.serialNumber);
      }

      const response = await api.get(`/equipment?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single equipment by ID
  getEquipmentById: async (id) => {
    try {
      const response = await api.get(`/equipment/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new equipment
  createEquipment: async (equipmentData) => {
    try {
      const response = await api.post("/equipment", equipmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update equipment
  updateEquipment: async (id, equipmentData) => {
    try {
      const response = await api.patch(`/equipment/${id}`, equipmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete equipment
  deleteEquipment: async (id) => {
    try {
      const response = await api.delete(`/equipment/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Download equipment PDF report
  downloadEquipmentPDF: async (id, equipmentNumber) => {
    try {
      // Use direct link instead of AJAX to avoid CORS issues with blob responses
      const url = `${API_BASE_URL}/equipment/${id}/pdf`;
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Equipment_${equipmentNumber || id}_Report.pdf`
      );
      link.setAttribute("target", "_blank");
      document.body.appendChild(link);
      link.click();
      link.remove();

      return { success: true };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Download equipment Word DOCX report
  downloadEquipmentDOCX: async (id, equipmentNumber) => {
    try {
      // Use direct link for DOCX download
      const url = `${API_BASE_URL}/equipment/${id}/docx`;
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Equipment_${equipmentNumber || id}_Report.docx`
      );
      link.setAttribute("target", "_blank");
      document.body.appendChild(link);
      link.click();
      link.remove();

      return { success: true };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Download equipment PDF report (from Word template)
  downloadEquipmentWordPDF: async (id, equipmentNumber) => {
    try {
      // Use direct link for PDF download from Word template
      const url = `${API_BASE_URL}/equipment/${id}/word-pdf`;
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Equipment_${equipmentNumber || id}_Report_Word.pdf`
      );
      link.setAttribute("target", "_blank");
      document.body.appendChild(link);
      link.click();
      link.remove();

      return { success: true };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Trigger Power Automate Flow (fire-and-forget)
  triggerPowerAutomateFlow: async (equipmentData) => {
    try {
      const POWER_AUTOMATE_URL =
        "https://65f93fb1f52fef59be0d67f1460c0d.f2.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/65cd10f9c4a6437fb3b1ea8428ab3bb1/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=_NHIYysHqLGGBYjEO-e-3NX8hVTtKzs_h0lnRkRU_aE";

      // Prepare complete equipment data
      const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const payload = {
        equipmentId: equipmentData.cr164_equipmentid,
        currentDate: currentDate,
        equipmentNumber: equipmentData.cr164_equipmentnumber || "N/A",
        description: equipmentData.cr164_equipmentdescription || "N/A",
        location: equipmentData.cr164_location || "N/A",
        manufacturer: equipmentData.cr164_manufacturer || "N/A",
        model: equipmentData.cr164_model || "N/A",
        serialNumber: equipmentData.cr164_serialnumber || "N/A",
        flowRange: equipmentData.cr164_flowrange || "N/A",
        status:
          equipmentData[
            "statecode@OData.Community.Display.V1.FormattedValue"
          ] || (equipmentData.statecode === 0 ? "Active" : "Inactive"),
      };

      // Fire and forget - don't wait for response
      axios
        .post(POWER_AUTOMATE_URL, payload, {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 5000, // Short timeout since we're not waiting
        })
        .catch(() => {
          // Ignore errors - fire and forget
        });

      return { success: true };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default api;
