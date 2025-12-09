import React, { useState, useEffect } from "react";
import { equipmentService } from "./services/api";
import EquipmentFilters from "./components/EquipmentFilters";
import EquipmentTable from "./components/EquipmentTable";
import EquipmentModal from "./components/EquipmentModal";
import HistoryCard from "./components/HistoryCard";
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
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [view, setView] = useState("list"); // 'list', 'history', 'form-standalone'

  // Check if this is a standalone form page
  const isStandaloneForm =
    new URLSearchParams(window.location.search).get("mode") === "form";

  useEffect(() => {
    if (isStandaloneForm) {
      // Load equipment data from sessionStorage for standalone form
      const storedData = sessionStorage.getItem("newEntryEquipment");
      if (storedData) {
        setEditingEquipment(JSON.parse(storedData));
        setView("form-standalone");
      }
    } else {
      fetchEquipment();
    }
  }, [isStandaloneForm]);

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
    // Show history card first when editing/viewing equipment
    setSelectedEquipment(item);
    setView("history");
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

  const handleDownloadPowerAutomatePDF = async (equipmentData) => {
    try {
      await equipmentService.triggerPowerAutomateFlow(equipmentData);
      alert(
        "Power Automate flow triggered successfully! PDF will be generated in the background."
      );
    } catch (err) {
      alert("Failed to trigger Power Automate flow: " + (err.error || err));
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

      if (isStandaloneForm) {
        // Close tab or redirect after saving in standalone mode
        window.opener?.postMessage({ type: "EQUIPMENT_SAVED" }, "*");
        setTimeout(() => window.close(), 1000);
      } else {
        setShowModal(false);
        setView("list");
        fetchEquipment();
      }
    } catch (err) {
      alert("Failed to save equipment: " + (err.error || err));
    }
  };

  const handleAddNewFromHistory = () => {
    // Open form in new tab with autofilled equipment data
    if (selectedEquipment) {
      // Store equipment data in sessionStorage
      sessionStorage.setItem(
        "newEntryEquipment",
        JSON.stringify(selectedEquipment)
      );
      // Open new tab with form mode
      const newTab = window.open(
        `${window.location.origin}?mode=form`,
        "_blank"
      );
      if (!newTab) {
        alert(
          "Please allow popups for this site to open the form in a new tab."
        );
      }
    }
  };

  const handleBackToList = () => {
    setView("list");
    setSelectedEquipment(null);
  };

  // Standalone Form View
  if (isStandaloneForm) {
    return (
      <div className="App">
        <header className="header">
          <div className="container">
            <h1>Indus Control</h1>
            <p>Add New Service Entry</p>
          </div>
        </header>

        <div className="container">
          {editingEquipment ? (
            <EquipmentModal
              equipment={editingEquipment}
              onClose={() => window.close()}
              onSave={handleSave}
              isStandalone={true}
            />
          ) : (
            <div className="loading">⏳ Loading equipment data...</div>
          )}
        </div>
      </div>
    );
  }

  // History View
  if (view === "history" && selectedEquipment) {
    return (
      <div className="App">
        <header className="header">
          <div className="container">
            <h1>Indus Control</h1>
            <p>Service History</p>
          </div>
        </header>

        <div className="container">
          <button
            className="btn btn-secondary"
            onClick={handleBackToList}
            style={{ marginBottom: "20px" }}
          >
            ← Back to Equipment List
          </button>

          <HistoryCard
            equipmentId={selectedEquipment.cr164_equipmentid}
            equipmentName={selectedEquipment.cr164_equipmentdescription}
            equipmentNumber={selectedEquipment.cr164_equipmentnumber}
            onAddNew={handleAddNewFromHistory}
          />
        </div>
      </div>
    );
  }

  // Main List View (Default)
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
