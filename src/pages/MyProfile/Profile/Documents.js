import React from "react";
import { useNavigate } from "react-router-dom";

const docFields = [
  { key: "crCopy", label: "CR Copy" },
  { key: "compCardCopy", label: "Computer Card Copy" },
  { key: "tradeLicenseCopy", label: "Trade License Copy" },
  { key: "vatCertificate", label: "VAT Certificate" },
  { key: "companyLogo", label: "Company Logo" },
  { key: "foodSafetyCertificate", label: "Food Safety Certificate" },
];

const Documents = ({
  form = {},
  setForm = () => {},
  serverFilePreview = {},
  localFilePreview = {},
  setLocalFilePreview = () => {},
  fileNames = {},
  setFileNames = () => {},
}) => {

  const navigate = useNavigate();

  const handleFileChange = (key) => (e) => {

    const file = e.target.files?.[0];
    if (!file) return;

    setForm((f) => ({
      ...f,
      files: {
        ...f.files,
        [key]: file
      }
    }));

    setFileNames((n) => ({
      ...n,
      [key]: file.name
    }));

    const preview = URL.createObjectURL(file);

    setLocalFilePreview((p) => ({
      ...p,
      [key]: preview
    }));
  };

  return (
    <div className="profile-card">

      <h3 className="profile-title">Attachments</h3>

      <form className="profile-form">

        <div className="doc-grid">

          {docFields.map((doc) => {

            const previewSrc =
              localFilePreview[doc.key] ||
              serverFilePreview[doc.key];

            return (

              <div className="doc-card" key={doc.key}>

                <label className="doc-label">{doc.label}</label>

                <div className="doc-upload-box">

                  {previewSrc ? (

                    previewSrc.includes(".pdf") ? (
                      <iframe
                        src={previewSrc}
                        title="pdf-preview"
                        className="pdf-preview"
                      />
                    ) : (
                      <img
                        src={previewSrc}
                        alt={doc.label}
                        className="doc-preview"
                      />
                    )

                  ) : (

                    <div className="doc-placeholder">
                      <i className="fa-solid fa-file-arrow-up" />
                      <span>Upload file</span>
                    </div>

                  )}

                </div>

                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange(doc.key)}
                  className="doc-input"
                />

                <p className="doc-filename">
                  {fileNames[doc.key] || "No file selected"}
                </p>

              </div>

            );

          })}

        </div>

        <div className="form-actions space-between">

          <button
            type="button"
            className="btn-secondary btn"
            onClick={() => navigate("/my-profile/restuarent/bank")}
          >
            ← Back
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={() =>
              navigate("/my-profile/restuarent/branches")
            }
          >
            Save & Next →
          </button>

        </div>

      </form>

    </div>
  );
};

export default Documents;