import React, { useState, useEffect, useCallback } from "react";
import { historyCardService } from "../services/api";
import "./HistoryCard.css";

function HistoryCard({
  equipmentId,
  equipmentName,
  equipmentNumber,
  onAddNew,
}) {
  const [historyRecords, setHistoryRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(null);

  const fetchHistoryRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const records = await historyCardService.getHistoryByEquipment(
        equipmentId
      );
      setHistoryRecords(records);
    } catch (err) {
      console.error("Error fetching history records:", err);
      setError("Failed to load history records");
    } finally {
      setLoading(false);
    }
  }, [equipmentId]);

  useEffect(() => {
    fetchHistoryRecords();
  }, [fetchHistoryRecords]);

  const handleDownloadPDF = async (record) => {
    try {
      setDownloading(record.id);
      await historyCardService.downloadPDF(
        record.reportFile,
        record.jobNo || record.reportNo || "report"
      );
      setDownloading(null);
    } catch (err) {
      console.error("Error downloading PDF:", err);
      alert("Failed to download PDF");
      setDownloading(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="history-card-container">
      {/* Header */}
      <div className="history-card-header">
        <div className="equipment-info">
          <h3>{equipmentName || "Equipment"}</h3>
          <p className="equipment-id">ID: {equipmentNumber || equipmentId}</p>
        </div>
        <button className="btn btn-primary btn-add-new" onClick={onAddNew}>
          + Add New Entry
        </button>
      </div>

      {/* History Records */}
      <div className="history-card-body">
        {loading && (
          <div className="loading-state">
            <p>Loading history records...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p>{error}</p>
            <button className="btn btn-secondary" onClick={fetchHistoryRecords}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && historyRecords.length === 0 && (
          <div className="empty-state">
            <p>📄 No service history found for this equipment</p>
            <p className="empty-subtitle">
              Click "Add New Entry" to create the first service record
            </p>
          </div>
        )}

        {!loading && !error && historyRecords.length > 0 && (
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Service Date</th>
                  <th>Job Number</th>
                  <th>Report Number</th>
                  <th>Technician</th>
                  <th>Status</th>
                  <th>Report</th>
                </tr>
              </thead>
              <tbody>
                {historyRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{formatDate(record.serviceDate)}</td>
                    <td>{record.jobNo || "-"}</td>
                    <td>{record.reportNo || "-"}</td>
                    <td>{record.technicianName || "-"}</td>
                    <td>
                      <span
                        className={`status-badge status-${
                          record.verificationResult?.toLowerCase() || "pending"
                        }`}
                      >
                        {record.verificationResult || "Pending"}
                      </span>
                    </td>
                    <td>
                      {record.reportFile ? (
                        <button
                          className="btn btn-download"
                          onClick={() => handleDownloadPDF(record)}
                          disabled={downloading === record.id}
                        >
                          {downloading === record.id ? "⏳" : "📥"} Download PDF
                        </button>
                      ) : (
                        <span className="text-muted">No PDF</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer - Record Count */}
      {!loading && !error && historyRecords.length > 0 && (
        <div className="history-card-footer">
          <p>
            {historyRecords.length} service record
            {historyRecords.length !== 1 ? "s" : ""} found
          </p>
        </div>
      )}
    </div>
  );
}

export default HistoryCard;
