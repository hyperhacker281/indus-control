import React, { useState, useEffect } from "react";

function EquipmentModal({ equipment, onClose, onSave }) {
  const [formData, setFormData] = useState({
    cr164_equipmentnumber: "",
    cr164_equipmentdescription: "",
    cr164_location: "",
    cr164_manufacturer: "",
    cr164_model: "",
    cr164_serialnumber: "",
    cr164_flowrange: "",
  });

  useEffect(() => {
    if (equipment) {
      setFormData({
        cr164_equipmentnumber: equipment.cr164_equipmentnumber || "",
        cr164_equipmentdescription: equipment.cr164_equipmentdescription || "",
        cr164_location: equipment.cr164_location || "",
        cr164_manufacturer: equipment.cr164_manufacturer || "",
        cr164_model: equipment.cr164_model || "",
        cr164_serialnumber: equipment.cr164_serialnumber || "",
        cr164_flowrange: equipment.cr164_flowrange || "",
      });
    }
  }, [equipment]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prepare data for submission
    const submitData = { ...formData };

    // Remove empty fields
    Object.keys(submitData).forEach((key) => {
      if (submitData[key] === "") {
        delete submitData[key];
      }
    });

    onSave(submitData);
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === "modal-overlay") {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <h2>{equipment ? "✏️ Edit Equipment" : "➕ Add New Equipment"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="cr164_equipmentnumber">Equipment Number</label>
            <input
              type="text"
              id="cr164_equipmentnumber"
              name="cr164_equipmentnumber"
              value={formData.cr164_equipmentnumber}
              onChange={handleChange}
              placeholder="e.g., 000040694"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cr164_equipmentdescription">Description</label>
            <textarea
              id="cr164_equipmentdescription"
              name="cr164_equipmentdescription"
              value={formData.cr164_equipmentdescription}
              onChange={handleChange}
              rows="3"
              placeholder="e.g., Level Transmitter - Alum Day Tank 1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cr164_location">Location</label>
            <input
              type="text"
              id="cr164_location"
              name="cr164_location"
              value={formData.cr164_location}
              onChange={handleChange}
              placeholder="e.g., AREA 3 - DECEW FALLS WATER TREATMENT PLANT"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cr164_manufacturer">Manufacturer</label>
            <input
              type="text"
              id="cr164_manufacturer"
              name="cr164_manufacturer"
              value={formData.cr164_manufacturer}
              onChange={handleChange}
              placeholder="e.g., Rosemount"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cr164_model">Model</label>
            <input
              type="text"
              id="cr164_model"
              name="cr164_model"
              value={formData.cr164_model}
              onChange={handleChange}
              placeholder="e.g., 3105"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cr164_serialnumber">Serial Number</label>
            <input
              type="text"
              id="cr164_serialnumber"
              name="cr164_serialnumber"
              value={formData.cr164_serialnumber}
              onChange={handleChange}
              placeholder="e.g., 1048064"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cr164_flowrange">Flow Range</label>
            <input
              type="text"
              id="cr164_flowrange"
              name="cr164_flowrange"
              value={formData.cr164_flowrange}
              onChange={handleChange}
              placeholder="e.g., 0 - 6.4 ft"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {equipment ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EquipmentModal;
