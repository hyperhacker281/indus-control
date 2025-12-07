import React from "react";

function EquipmentTable({
  equipment,
  loading,
  onEdit,
  onDelete,
  onDownloadPDF,
  onDownloadDOCX,
  onDownloadWordPDF,
}) {
  if (loading) {
    return (
      <div className="results-section">
        <div className="loading">⏳ Loading equipment data...</div>
      </div>
    );
  }

  return (
    <div className="results-section">
      <div className="results-header">
        <h2>📋 Equipment List</h2>
        <div className="results-count">
          {equipment.length} {equipment.length === 1 ? "item" : "items"} found
        </div>
      </div>

      {equipment.length === 0 ? (
        <div className="no-data">
          <div className="no-data-icon">📦</div>
          <h3>No equipment found</h3>
          <p>Try adjusting your filters or add new equipment</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Equipment Number</th>
                <th>Description</th>
                <th>Location</th>
                <th>Manufacturer</th>
                <th>Model</th>
                <th>Serial Number</th>
                <th>Flow Range</th>
                <th>Status</th>
                <th>Created On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((item) => (
                <tr key={item.cr164_equipmentid}>
                  <td>{item.cr164_equipmentnumber || "-"}</td>
                  <td>{item.cr164_equipmentdescription || "-"}</td>
                  <td>{item.cr164_location || "-"}</td>
                  <td>{item.cr164_manufacturer || "-"}</td>
                  <td>{item.cr164_model || "-"}</td>
                  <td>{item.cr164_serialnumber || "-"}</td>
                  <td>{item.cr164_flowrange || "-"}</td>
                  <td>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "12px",
                        backgroundColor:
                          item.statecode === 0 ? "#d1fae5" : "#fee2e2",
                        color: item.statecode === 0 ? "#065f46" : "#991b1b",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                      }}
                    >
                      {item[
                        "statecode@OData.Community.Display.V1.FormattedValue"
                      ] || (item.statecode === 0 ? "Active" : "Inactive")}
                    </span>
                  </td>
                  <td>
                    {item.createdon
                      ? new Date(item.createdon).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="btn btn-edit"
                        onClick={() => onEdit(item)}
                        title="Edit equipment"
                      >
                        ✏️ Edit
                      </button>
                      {/* PDF features disabled on Vercel free plan */}
                      {process.env.NODE_ENV !== "production" && (
                        <>
                          <button
                            className="btn btn-success"
                            onClick={() =>
                              onDownloadPDF(
                                item.cr164_equipmentid,
                                item.cr164_equipmentnumber
                              )
                            }
                            title="Download PDF Report (HTML Template)"
                          >
                            📄 PDF
                          </button>
                          <button
                            className="btn btn-primary"
                            onClick={() =>
                              onDownloadWordPDF(
                                item.cr164_equipmentid,
                                item.cr164_equipmentnumber
                              )
                            }
                            title="Download PDF from Word Template"
                            style={{
                              backgroundColor: "#dc2626",
                              fontSize: "0.875rem",
                            }}
                          >
                            📕 Word→PDF
                          </button>
                          <button
                            className="btn btn-primary"
                            onClick={() =>
                              onDownloadDOCX(
                                item.cr164_equipmentid,
                                item.cr164_equipmentnumber
                              )
                            }
                            title="Download Word Report (DOCX Template)"
                            style={{
                              backgroundColor: "#2563eb",
                              fontSize: "0.875rem",
                            }}
                          >
                            📝 Word
                          </button>
                        </>
                      )}
                      <button
                        className="btn btn-delete"
                        onClick={() => onDelete(item.cr164_equipmentid)}
                        title="Delete equipment"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default EquipmentTable;
