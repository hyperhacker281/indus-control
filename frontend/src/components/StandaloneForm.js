import React, { useState, useEffect } from "react";
import EquipmentModal from "./EquipmentModal";
import { equipmentService } from "../services/api";
import "../index.css";

function StandaloneForm() {
  const [equipmentData, setEquipmentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get equipment data from URL parameters or sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    const equipmentId = urlParams.get("equipmentId");
    const fromStorage = sessionStorage.getItem("newEntryEquipment");

    if (fromStorage) {
      // Load from sessionStorage (better for large data)
      const data = JSON.parse(fromStorage);
      setEquipmentData(data);
      setLoading(false);
      // Clear after loading to prevent reuse
      sessionStorage.removeItem("newEntryEquipment");
    } else if (equipmentId) {
      // Fetch equipment by ID
      fetchEquipmentData(equipmentId);
    } else {
      // No data - fresh form
      setLoading(false);
    }
  }, []);

  const fetchEquipmentData = async (id) => {
    try {
      const response = await equipmentService.getEquipmentById(id);
      setEquipmentData(response);
    } catch (err) {
      console.error("Error fetching equipment:", err);
      alert("Failed to load equipment data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      await equipmentService.createEquipment(formData);
      alert("Equipment created successfully! You can close this tab.");
      // Optionally close the tab or redirect
      window.close();
    } catch (err) {
      alert("Failed to save equipment: " + (err.error || err));
    }
  };

  const handleClose = () => {
    if (window.confirm("Are you sure you want to close without saving?")) {
      window.close();
    }
  };

  if (loading) {
    return (
      <div className="App">
        <header className="header">
          <div className="container">
            <h1>Indus Control</h1>
            <p>Loading form...</p>
          </div>
        </header>
        <div className="container">
          <div className="loading">⏳ Loading equipment data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <h1>Indus Control</h1>
          <p>Add New Service Entry</p>
        </div>
      </header>

      <div className="container">
        <EquipmentModal
          equipment={equipmentData}
          onClose={handleClose}
          onSave={handleSave}
          isStandalone={true}
        />
      </div>
    </div>
  );
}

export default StandaloneForm;
