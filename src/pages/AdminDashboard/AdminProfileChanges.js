import React, { useEffect, useState } from "react";

export default function AdminProfileChanges() {

  const camelToSnake = (key) =>
    key.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase());
  const ADMIN_TOKEN = localStorage.getItem("admin_token");

  if (!ADMIN_TOKEN) {
    console.error("❌ Admin token missing in localStorage");
    alert("Session expired. Please login again.");
    window.location.href = "/admin/login";
  }

  const CANONICAL_KEY_MAP = React.useMemo(() => ({
    // ===== ORG =====
    cr_expiry: "cr_expiry_date",
    cr_expiry_date: "cr_expiry_date",

    comp_card_number: "computer_card_number",
    computer_card_number: "computer_card_number",

    comp_card_expiry: "computer_card_expiry_date",
    computer_card_expiry_date: "computer_card_expiry_date",

    vat_number: "vat_tax_number",
    vat_tax_number: "vat_tax_number",

    signing_authority: "signing_authority_name",
    signing_authority_name: "signing_authority_name",

    company_email: "company_email",
    restaurant_email_address: "company_email",

    // ===== ADDRESS =====
    street: "street",
    zone: "zone",
    area: "area",
    city: "city",
    country: "country",
    address: "address",

    // camelCase safety
    streetName: "street",
    zoneName: "zone",
    areaName: "area",
    cityName: "city",
    countryName: "country",

    // ===== BANK =====
    bank_name: "bank_name",
    bankName: "bank_name",

    bank_branch: "bank_branch",
    branch: "bank_branch",

    account_holder_name: "account_holder_name",
    accountHolder: "account_holder_name",

    swift_code: "swift_code",
    swiftCode: "swift_code",

    iban: "iban",

    // ===== BRANCH =====
    branch_name_english: "branch_name_english",
    branchNameEn: "branch_name_english",

    branch_name_arabic: "branch_name_arabic",
    branchNameAr: "branch_name_arabic",

    branch_manager_name: "branch_manager_name",
    branchManager: "branch_manager_name",

    contact_number: "contact_number",
    contactNumber: "contact_number",

    office_no: "office_no",
    officeNo: "office_no",
    office_number: "office_no",

    branch_license: "branch_license",
    branchLicense: "branch_license",

    // ===== STORE =====
    store_name_english: "store_name_english",
    storeNameEnglish: "store_name_english",

    store_name_arabic: "store_name_arabic",
    storeNameArabic: "store_name_arabic",

    contact_person_name: "contact_person_name",
    contactPersonName: "contact_person_name",

    contact_person_mobile: "contact_person_mobile",
    contactPersonMobile: "contact_person_mobile",

    email: "email",
    storeEmail: "email",

    shop_no: "shop_no",
    shopNo: "shop_no",

    store_type: "store_type",
    storeType: "store_type",

    operating_hours: "operating_hours",
    operatingHours: "operating_hours",

    delivery_pickup_availability: "delivery_pickup_availability",
    deliveryPickupAvailability: "delivery_pickup_availability",
  }), []);

  const FILE_KEY_MAP = {
    // CR
    upload_cr_copy: "cr_copy",
    crCopy: "cr_copy",
    cr_copy: "cr_copy",

    // Computer Card
    upload_computer_card_copy: "computer_card",
    compCardCopy: "computer_card",
    computer_card: "computer_card",
    comp_card_copy: "computer_card",

    // Trade License
    upload_trade_license_copy: "trade_license",
    tradeLicenseCopy: "trade_license",
    trade_license: "trade_license",
    trade_license_copy: "trade_license",

    // VAT
    upload_vat_certificate_copy: "vat_certificate",
    upload_vat_certificates_copy: "vat_certificate",
    vatCertificate: "vat_certificate",
    vat_certificate: "vat_certificate",

    // Logo
    upload_company_logo: "company_logo",
    companyLogo: "company_logo",
    company_logo: "company_logo",

    // Bank Letter
    upload_bank_letter: "bank_letter",
    bankLetter: "bank_letter",
    bank_letter: "bank_letter",

    // Certificates
    certificates: "certificates",

    // Food Safety
    upload_food_safety_certificate: "food_safety_certificate",
    foodSafetyCertificate: "food_safety_certificate",
    food_safety_certificate: "food_safety_certificate",
  };

  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null); // 👈 view state
  const selectedItem = items.find(i => i.id === selectedId) || null;
  const [loading, setLoading] = useState(false);

  const normalizeByCanonicalMap = React.useCallback(
    (data = {}) =>
      Object.fromEntries(
        Object.entries(data).map(([k, v]) => {
          const isSnake = k.includes("_");
          const snakeKey = isSnake ? k : camelToSnake(k);

          const finalKey =
            CANONICAL_KEY_MAP[snakeKey] ||
            CANONICAL_KEY_MAP[k] ||
            snakeKey;

          return [finalKey, v];
        })
      ),
    [CANONICAL_KEY_MAP]   // 👈 no dependencies (pure function)
  );

  const normalizedOld = normalizeByCanonicalMap(selectedItem?.old_data || {});
  const normalizedNew = normalizeByCanonicalMap(selectedItem?.new_data || {});

  // Merge keys correctly
  const allKeys = Array.from(
    new Set([
      ...Object.keys(normalizedOld),
      ...Object.keys(normalizedNew),
    ])
  );

  const normalizeFiles = (files = {}) =>
    Object.fromEntries(
      Object.entries(files).map(([k, v]) => {
        if (typeof v === "string" && v.startsWith("data:")) {
          const [meta, base64] = v.split(",");
          return [
            FILE_KEY_MAP[k] || k,
            {
              mimetype: meta.replace("data:", "").replace(";base64", ""),
              content: base64,
            }
          ];
        }
        return [FILE_KEY_MAP[k] || k, v];
      })
    );

  const oldFiles = React.useMemo(() => {
    return selectedItem?.existing_files || {};
  }, [selectedItem]);

  const newFiles = React.useMemo(() => {
    return selectedItem?.section === "files"
      ? selectedItem.new_data || {}
      : {};
  }, [selectedItem]);

  const normalizedOldFiles = normalizeFiles(oldFiles);
  const normalizedNewFiles = normalizeFiles(newFiles);

  const fileKeys = Array.from(
    new Set([
      ...Object.keys(normalizedOldFiles),
      ...Object.keys(normalizedNewFiles),
    ])
  );

  const FIELD_LABELS = {
    // ===== ORG =====
    cr_expiry_date: "CR Expiry Date",
    computer_card_number: "Computer Card Number",
    computer_card_expiry_date: "Computer Card Expiry Date",
    signing_authority_name: "Signing Authority Name",
    vat_tax_number: "VAT Number",
    sponsor_name: "Sponsor Name",
    trade_license_name: "Trade License Name",
    company_email: "Company Email",

    // ===== ADDRESS =====
    address: "Address",
    street: "Street",
    zone: "Zone",
    area: "Area",
    city: "City",
    country: "Country",
    building: "Building",

    // ===== BANK =====
    bank_name: "Bank Name",
    bank_branch: "Branch",
    account_holder_name: "Account Holder Name",
    swift_code: "Swift Code",
    iban: "IBAN",

    // ===== BRANCH =====
    branch_name_english: "Branch Name (English)",
    branch_name_arabic: "Branch Name (Arabic)",
    branch_manager_name: "Branch Manager",
    contact_number: "Contact Number",
    office_no: "Office No",
    branch_license: "Branch License",

    // ===== STORE =====
    store_name_english: "Store Name (English)",
    store_name_arabic: "Store Name (Arabic)",
    contact_person_name: "Contact Person Name",
    contact_person_mobile: "Contact Person Mobile",
    email: "Email",
    shop_no: "Shop No",
    store_type: "Store Type",
    operating_hours: "Operating Hours",
    delivery_pickup_availability: "Delivery / Pickup",
  };

  const SECTION_LABELS = {
    basic: "Basic Profile",
    org: "Organization",
    address: "Address",
    bank: "Bank",
    files: "Documents",
    branch: "Branch",
    store: "Store",
  };

  const FILE_LABELS = {
    cr_copy: "CR Copy",
    computer_card: "Computer Card",
    trade_license: "Trade License",
    vat_certificate: "VAT Certificate",
    company_logo: "Company Logo",
    bank_letter: "Bank Letter",
    certificates: "Certificates",
    food_safety_certificate: "Food Safety Certificate",
  };

  const normalizeFile = (file) => {
    if (!file) return null;

    if (file?.content && file?.mimetype) {
      return file;
    }

    // 🔥 SUPPORT preview-only format
    if (file?.preview) {
      const [meta, base64] = file.preview.split(",");
      return {
        mimetype: meta.replace("data:", "").replace(";base64", ""),
        content: base64,
      };
    }

    return null;
  };

  const renderFilePreview = (file, key) => {
    const f = normalizeFile(file);

    if (!f) {
      return <i>Not available</i>;
    }

    const src = `data:${f.mimetype};base64,${f.content}`;

    if (f.mimetype === "application/pdf") {
      return (
        <iframe
          src={src}
          width="300"
          height="400"
          title={FILE_LABELS[key] || key}
          style={{ border: "1px solid #ccc" }}
        />
      );
    }

    return (
      <img
        src={src}
        alt={FILE_LABELS[key] || key}
        width="200"
        style={{ border: "1px solid #ccc" }}
      />
    );
  };

  const loadData = async () => {
    try {
      const res = await fetch(
        "http://127.0.0.1:5000/api/v1/admin/change-requests/pending",
        {
          headers: {
            Authorization: `Bearer ${ADMIN_TOKEN}`,
          },
        }
      );

      if (res.status === 401) {
        alert("Admin session expired. Please login again.");
        localStorage.removeItem("admin_token");
        window.location.href = "/admin/login";
        return;
      }

      const data = await res.json();
      if (data.status) setItems(data.items);

    } catch (err) {
      console.error("❌ Network error loading pending requests:", err);
    }
  };


  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedItem) return;

    console.log("OLD:", selectedItem.old_data);
    console.log("NEW:", selectedItem.new_data);
    console.log("NORMALIZED NEW:", normalizeByCanonicalMap(selectedItem.new_data));
  }, [selectedItem, normalizeByCanonicalMap]);

  const approve = async (id) => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/v1/admin/change-requests/${id}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ADMIN_TOKEN}`,
          },
        }
      );

      if (res.status === 401) {
        alert("Admin session expired. Please login again.");
        localStorage.removeItem("admin_token");
        window.location.href = "/admin/login";
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        console.error("Approve failed:", text);
        alert("Approve failed");
        return;
      }

      await loadData();
      setSelectedId(null);

    } catch (err) {
      console.error("❌ Network error:", err);
      alert("Server not reachable");
    } finally {
      setLoading(false);
    }
  };


  const reject = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    const res = await fetch(
      `http://127.0.0.1:5000/api/v1/admin/change-requests/${id}/reject`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ADMIN_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      }
    );

    if (res.status === 401) {
      alert("Admin session expired. Please login again.");
      localStorage.removeItem("admin_token");
      window.location.href = "/admin/login";
      return;
    }

    setSelectedId(null);
    await loadData();

  };

  return (
    <div>
      <h2>Pending Profile Change Requests</h2>

      <table border="1" cellPadding="8" width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Role</th>
            <th>Entity ID</th>
            <th>Section</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan="5">No pending requests</td>
            </tr>
          )}

          {items.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.role === "supplier" ? "Supplier" : "Restaurant"}</td>
              <td>{r.entity_id}</td>
              <td>
                {SECTION_LABELS[r.section] || r.section}
                {r.section === "branch" && r.target_row_id && (
                  <span style={{ color: "#888" }}>
                    {" "} (ID: {r.target_row_id})
                  </span>
                )}
              </td>

              <td>
                {/* STEP 1: VIEW */}
                {selectedId !== r.id && (
                  <button onClick={() => setSelectedId(r.id)}>
                    View
                  </button>
                )}

                {/* STEP 2: APPROVE / REJECT */}
                {selectedId === r.id && (
                  <>
                    <button onClick={() => approve(r.id)}>Approve</button>
                    <button onClick={() => reject(r.id)}>Reject</button>
                    <button onClick={() => setSelectedId(null)}>Cancel</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* OPTIONAL: DETAIL VIEW */}
      {selectedItem &&
        // selectedItem.new_data &&
        selectedItem.section !== "files" && (
          <div style={{ marginTop: 20 }}>
            <h3>Changed Fields</h3>

            {allKeys.map((key) => (
              <div key={key} style={{ marginBottom: 6 }}>
                <b>{FIELD_LABELS[key] || key}</b>:{" "}
                <span style={{ color: "red" }}>
                  {key in normalizedOld ? normalizedOld[key] : "(new)"}
                  {/* {normalizedOld[key] ?? "-"} */}
                </span>
                {" → "}
                <span style={{ color: "green" }}>
                  {normalizedNew[key] ?? "-"}
                </span>
              </div>
            ))}

          </div>
        )}

      {selectedItem &&
        (selectedItem.section === "branch" || selectedItem.section === "store") &&
        (!selectedItem.old_data || Object.keys(selectedItem.old_data).length === 0) && (
          <div style={{ color: "green", marginBottom: 10 }}>
            🆕 New {selectedItem.section} creation request
          </div>
        )}

      {selectedItem &&
        (selectedItem.section === "branch" || selectedItem.section === "store") &&
        selectedItem.old_data &&
        Object.keys(selectedItem.old_data).length > 0 && (
          <div style={{ color: "blue", marginBottom: 10 }}>
            ✏️ {selectedItem.section} update request
          </div>
        )}

      {selectedItem &&
        selectedItem.section === "files" && (
          <div style={{ marginTop: 20 }}>
            <h3>Documents (Old vs New)</h3>

            {fileKeys.map(key => (

              // {Object.keys({ ...oldFiles, ...newFiles }).map(key => (
              <div key={key} style={{ marginBottom: 30 }}>
                <h4>{FILE_LABELS[key] || key}</h4>

                <div style={{ display: "flex", gap: 30 }}>

                  {/* OLD FILE */}
                  <div>
                    <p style={{ color: "red" }}>Old (Approved)</p>
                    {renderFilePreview(normalizedOldFiles[key], key)}
                  </div>

                  {/* NEW FILE */}
                  <div>
                    <p style={{ color: "green" }}>New (Pending)</p>
                    {renderFilePreview(normalizedNewFiles[key], key)}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}