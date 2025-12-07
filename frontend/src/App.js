import React, { useState, useEffect } from "react";
import { equipmentService } from "./services/api";
import EquipmentFilters from "./components/EquipmentFilters";
import EquipmentTable from "./components/EquipmentTable";
import EquipmentModal from "./components/EquipmentModal";
import "./index.css";

function App() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    equipmentNumber: "",
    location: "",
    manufacturer: "",
    serialNumber: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async (appliedFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await equipmentService.getEquipment(appliedFilters);
      setEquipment(response.data || []);
    } catch (err) {
      setError(err.error || "Failed to fetch equipment data");
      console.error("Error fetching equipment:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    const activeFilters = {};
    Object.keys(filters).forEach((key) => {
      if (filters[key]?.trim()) {
        activeFilters[key] = filters[key].trim();
      }
    });
    fetchEquipment(activeFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      equipmentNumber: "",
      location: "",
      manufacturer: "",
      serialNumber: "",
    });
    fetchEquipment();
  };

  const handleAddNew = () => {
    setEditingEquipment(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingEquipment(item);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this equipment?")) {
      return;
    }

    try {
      await equipmentService.deleteEquipment(id);
      fetchEquipment();
      alert("Equipment deleted successfully!");
    } catch (err) {
      alert("Failed to delete equipment: " + (err.error || err));
    }
  };

  const handleDownloadPDF = async (id, equipmentNumber) => {
    try {
      setLoading(true);
      await equipmentService.downloadEquipmentPDF(id, equipmentNumber);
    } catch (err) {
      alert("Failed to download PDF: " + (err.error || err));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDOCX = async (id, equipmentNumber) => {
    try {
      setLoading(true);
      await equipmentService.downloadEquipmentDOCX(id, equipmentNumber);
    } catch (err) {
      alert("Failed to download Word document: " + (err.error || err));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadWordPDF = async (id, equipmentNumber) => {
    try {
      setLoading(true);
      await equipmentService.downloadEquipmentWordPDF(id, equipmentNumber);
    } catch (err) {
      alert("Failed to download PDF from Word: " + (err.error || err));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPowerAutomatePDF = async (id, equipmentNumber) => {
    try {
      setLoading(true);
      await equipmentService.downloadPowerAutomatePDF(id, equipmentNumber);
    } catch (err) {
      alert("Failed to download PDF via Power Automate: " + (err.error || err));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (equipmentData) => {
    try {
      if (editingEquipment) {
        await equipmentService.updateEquipment(
          editingEquipment.cr164_equipmentid,
          equipmentData
        );
        alert("Equipment updated successfully!");
      } else {
        await equipmentService.createEquipment(equipmentData);
        alert("Equipment created successfully!");
      }
      setShowModal(false);
      fetchEquipment();
    } catch (err) {
      alert("Failed to save equipment: " + (err.error || err));
    }
  };

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <h1>Indus Control</h1>
          <p>Equipment Management System</p>
        </div>
      </header>

      <div className="container">
        <EquipmentFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          onAddNew={handleAddNew}
          loading={loading}
        />

        {error && (
          <div className="error">
            <strong>Error:</strong> {error}
          </div>
        )}

        <EquipmentTable
          equipment={equipment}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDownloadPDF={handleDownloadPDF}
          onDownloadDOCX={handleDownloadDOCX}
          onDownloadWordPDF={handleDownloadWordPDF}
          onDownloadPowerAutomatePDF={handleDownloadPowerAutomatePDF}
        />

        {showModal && (
          <EquipmentModal
            equipment={editingEquipment}
            onClose={() => setShowModal(false)}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
}

export default App;
