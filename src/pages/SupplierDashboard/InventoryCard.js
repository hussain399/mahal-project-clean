const InventoryCard = ({ product, onClick }) => {

  /* ================= HELPERS ================= */
  const getMinutesDiff = (target) => {
    const now = new Date();
    const diffMs = target - now;
    return Math.ceil(diffMs / (1000 * 60));
  };

  const formatTimeAMPM = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const safeDate = (dateStr, timeStr = null) => {
    if (!dateStr) return null;

    const iso = timeStr
      ? `${dateStr}T${timeStr}`
      : `${dateStr}T00:00:00`;

    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  };

  /* ================= INITIAL ================= */
  // let finalPrice = product.price;
  // let originalPrice = product.price;
  let finalPrice = Number(product.price) || 0;
  let originalPrice = Number(product.price) || 0;
  let badgeText = null;
  let badgeType = "active";
  let hasTimeBadge = false;

  const offer = product.offer;

  /* ================= OFFER LOGIC ================= */
  if (offer) {

    /* 🔴 ENDING SOON (highest priority) */
    if (
      offer.offer_status === "ACTIVE" &&
      offer.end_date &&
      offer.end_time
    ) {
      const endDateTime = safeDate(offer.end_date, offer.end_time);
      if (endDateTime) {
        const minsLeft = getMinutesDiff(endDateTime);
        if (minsLeft > 0 && minsLeft <= 30) {
          badgeText = `ENDS IN ${minsLeft} MIN`;
          badgeType = "ending";
          hasTimeBadge = true;
        }
      }
    }

    /* 🟢 ACTIVE OFFER */
    if (offer.offer_status === "ACTIVE" && !hasTimeBadge) {
      if (offer.offer_type === "Percentage") {
        finalPrice =
          product.price -
          (product.price * offer.discount_percentage) / 100;
        badgeText = `${offer.discount_percentage}% OFF`;
      }

      if (offer.offer_type === "Flat") {
        finalPrice = product.price - offer.flat_amount;
        badgeText = `QAR${offer.flat_amount} OFF`;
      }

      if (offer.offer_type === "BOGO") {
        badgeText = `BUY ${offer.buy_quantity} GET ${offer.get_quantity}`;
      }
    }

    /* 🟡 UPCOMING OFFER */
    if (offer.offer_status === "UPCOMING") {
      badgeType = "upcoming";

      const startDateTime = safeDate(
        offer.start_date,
        offer.start_time
      );

      // fallback if date is invalid
      if (!startDateTime) {
        badgeText = "UPCOMING";
      } else {
        const diffMinutes = getMinutesDiff(startDateTime);

        // starts within 1 hour
        if (diffMinutes > 0 && diffMinutes <= 60) {
          badgeText = `STARTS IN ${diffMinutes} MIN`;
        } else {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const diffDays = Math.ceil(
            (startDateTime - today) / (1000 * 60 * 60 * 24)
          );

          badgeText =
            diffDays === 1
              ? "STARTS TOMORROW"
              : `STARTS IN ${diffDays} DAYS`;
        }
      }
    }
  }

  /* ================= RENDER ================= */
  return (
    <div className={`inventory_card ${product.stockStatus}`} onClick={onClick}>

      {badgeText && (
        <div className={`offer_badge ${badgeType}`}>
          {badgeText}
        </div>
      )}

      <div className="card_image">
        <img src={product.image} alt={product.name} />
      </div>

      <div className="card_details">
        <h4>{product.name}</h4>

        <div className="row-list">
          <div className="list_tag">
            <span>Country:</span>
            {product.country || "-"}
          </div>
        </div>

        <div className="row-list">
          <div className="list_tag">
            <span>Currency:</span>
            {product.currency}
          </div>
        </div>

        <div className="row-list">
          <div className="list_tag">
            <span>Price:</span>
            {offer?.offer_status === "ACTIVE" && finalPrice !== originalPrice ? (
              <>
                <span style={{ textDecoration: "line-through", color: "#999" }}>
                  QAR {originalPrice}
                </span>
                <b style={{ color: "#2e7d32" }}>
                  QAR {finalPrice.toFixed(2)}
                </b>
              </>
            ) : (
              <b>QAR {originalPrice}</b>
            )}
          </div>
        </div>

        {/* <div className="row-list">
          <div className="list_tag">
            <span>Price:</span>
            {offer?.offer_status === "ACTIVE" && finalPrice !== originalPrice ? (
              <>
                <span style={{ textDecoration: "line-through", color: "#999" }}>
                  QAR{originalPrice}
                </span>
                <b style={{ color: "#2e7d32" }}>
                  QAR{finalPrice.toFixed(2)}
                </b>
              </>
            ) : (
              <b>QAR{originalPrice}</b>
            )}
          </div>
        </div> */}

        <div className="row-list">
          <div className="list_tag">
            <span>Expiry:</span>
            {new Date(product.expiry_date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
            {product.expiry_time && (
              <span style={{ marginLeft: 8, fontWeight: 600 }}>
                {formatTimeAMPM(product.expiry_time)}
              </span>
            )}
          </div>
        </div>

        <div className="row-list">
          <div className="list_tag">
            <span>MOQ:</span>
            <b>{product.moq}</b>
          </div>
        </div>

        <div className="row-list">
          <div className="list_tag">
            <span>UOM:</span>
            {product.uom}
          </div>
        </div>

        <div className="row-list">
          <div className="list_tag">
            <span>Units:</span>
            <b>{product.units}</b>
          </div>
        </div>
        {offer?.offer_status === "ACTIVE" && offer?.start_date && offer?.end_date && (
          <div className="row-list">
            <div className="list_tag">
              <span>Offer Valid:</span>
              {formatDate(offer.start_date)} → {formatDate(offer.end_date)}
            </div>
          </div>
        )}

        {offer?.offer_status === "ACTIVE" && offer?.start_time && (
          <div className="row-list">
            <div className="list_tag">
              <span>Offer Time:</span>
              {formatTimeAMPM(offer.start_time)} → {formatTimeAMPM(offer.end_time)}
            </div>
          </div>
        )}

        {offer?.offer_status === "UPCOMING" && offer?.start_date && (
          <div className="row-list">
            <div className="list_tag">
              <span>Offer Starts:</span>
              {formatDate(offer.start_date)}
            </div>
          </div>
        )}

        <div className="badges">
          <span className={`badge ${product.stockStatus}`}>
            {product.stockStatus.replace("_", " ")}
          </span>
          <span className={`badge ${product.expiryStatus}`}>
            {product.expiryStatus}
          </span>
        </div>

      </div>
    </div>
  );
};

export default InventoryCard;