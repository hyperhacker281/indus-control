const { ClientSecretCredential } = require("@azure/identity");
const axios = require("axios");

class DataverseService {
  constructor() {
    this.tenantId = process.env.TENANT_ID;
    this.clientId = process.env.CLIENT_ID;
    this.clientSecret = process.env.CLIENT_SECRET;
    this.dataverseUrl = process.env.DATAVERSE_URL;
    this.apiVersion = process.env.DATAVERSE_API_VERSION || "9.2";
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    // Check if token is still valid
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      console.log("✅ Using cached access token");
      return this.accessToken;
    }

    try {
      console.log("🔐 Authenticating with Azure AD...");
      console.log("   Tenant ID:", this.tenantId);
      console.log("   Client ID:", this.clientId);
      console.log("   Dataverse URL:", this.dataverseUrl);

      const credential = new ClientSecretCredential(
        this.tenantId,
        this.clientId,
        this.clientSecret
      );

      const scope = `${this.dataverseUrl}/.default`;
      console.log("   Requesting scope:", scope);

      const tokenResponse = await credential.getToken(scope);

      this.accessToken = tokenResponse.token;
      this.tokenExpiry = new Date(tokenResponse.expiresOnTimestamp);

      console.log("✅ Authentication successful!");
      console.log("   Token expires at:", this.tokenExpiry.toISOString());

      return this.accessToken;
    } catch (error) {
      console.error("❌ Error getting access token:", error.message);
      console.error("   Full error:", error);
      throw new Error(
        "Failed to authenticate with Dataverse: " + error.message
      );
    }
  }

  async getEquipment(filters = {}) {
    try {
      const token = await this.getAccessToken();

      // Build OData query
      let query = `${this.dataverseUrl}/api/data/v${this.apiVersion}/cr164_equipments?`;

      // Apply filters
      const filterConditions = [];

      if (filters.equipmentNumber) {
        filterConditions.push(
          `contains(cr164_equipmentnumber, '${filters.equipmentNumber}')`
        );
      }

      if (filters.location) {
        filterConditions.push(
          `contains(cr164_location, '${filters.location}')`
        );
      }

      if (filters.manufacturer) {
        filterConditions.push(
          `contains(cr164_manufacturer, '${filters.manufacturer}')`
        );
      }

      if (filters.serialNumber) {
        filterConditions.push(
          `contains(cr164_serialnumber, '${filters.serialNumber}')`
        );
      }

      if (filterConditions.length > 0) {
        query += `$filter=${filterConditions.join(" and ")}&`;
      }

      // Add ordering
      query += `$orderby=createdon desc`;

      const response = await axios.get(query, {
        headers: {
          Authorization: `Bearer ${token}`,
          "OData-MaxVersion": "4.0",
          "OData-Version": "4.0",
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      return response.data.value;
    } catch (error) {
      console.error(
        "Error fetching equipment:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async getEquipmentById(id) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${this.dataverseUrl}/api/data/v${this.apiVersion}/cr164_equipments(${id})`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            Accept: "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Error fetching equipment by ID:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async createEquipment(equipmentData) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.post(
        `${this.dataverseUrl}/api/data/v${this.apiVersion}/cr164_equipments`,
        equipmentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Error creating equipment:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async updateEquipment(id, equipmentData) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.patch(
        `${this.dataverseUrl}/api/data/v${this.apiVersion}/cr164_equipments(${id})`,
        equipmentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Error updating equipment:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async deleteEquipment(id) {
    try {
      const token = await this.getAccessToken();

      await axios.delete(
        `${this.dataverseUrl}/api/data/v${this.apiVersion}/cr164_equipments(${id})`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
          },
        }
      );

      return { success: true };
    } catch (error) {
      console.error(
        "Error deleting equipment:",
        error.response?.data || error.message
      );
      throw error;
    }
  }
}

module.exports = DataverseService;
