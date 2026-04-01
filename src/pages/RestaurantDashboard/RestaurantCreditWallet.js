import React, { useEffect, useState } from "react";
import "../css/restaurantcredit.css";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {  useNavigate, useLocation } from "react-router-dom";
const API = "http://192.168.1.193:5000/api/restaurant/credit";

export default function RestaurantCreditWallet(){
const location = useLocation();
const token = localStorage.getItem("token");
const navigate = useNavigate();
const [summary,setSummary] = useState({});
const [orders,setOrders] = useState([]);
const [settlements,setSettlements] = useState([]);
const [previewUrl,setPreviewUrl] = useState(null);
const [previewType,setPreviewType] = useState(null);
const [rotation,setRotation] = useState(0);
const [expandedRow, setExpandedRow] = useState(null);
const [activeTab, setActiveTab] = useState(
  location.state?.openTab || "orders"
);// NEW
const toggleExpand = (id) => {
  setExpandedRow(prev => (prev === id ? null : id));
};
useEffect(()=>{

fetch(`${API}/summary`,{
headers:{Authorization:`Bearer ${token}`}
})
.then(res=>res.json())
.then(data=>setSummary(data));

fetch(`${API}/orders`,{
headers:{Authorization:`Bearer ${token}`}
})
.then(res=>res.json())
.then(data=>setOrders(data));

fetch(`${API}/settlements`,{
headers:{Authorization:`Bearer ${token}`}
})
.then(res=>res.json())
.then(data=>setSettlements(data));

},[token]);

const usedPercent = summary.credit_limit
? (summary.credit_used / summary.credit_limit) * 100
: 0;


const viewReceipt = async (id) => {

try{

const res = await fetch(`${API}/receipt/${id}`,{
headers:{Authorization:`Bearer ${token}`}
});

if(!res.ok){
alert("Receipt not available");
return;
}

const blob = await res.blob();

const url = window.URL.createObjectURL(blob);

setPreviewUrl(url);
setPreviewType(blob.type);

}catch(err){
console.error(err);
}

};

const downloadSettlementPDF = async (id) => {

try{

const res = await fetch(`${API}/settlement-pdf/${id}`,{
headers:{
Authorization:`Bearer ${token}`
}
});

if(!res.ok){
alert("Unable to download PDF");
return;
}

const blob = await res.blob();

const url = window.URL.createObjectURL(blob);

const a = document.createElement("a");
a.href = url;
a.download = `Settlement_${id}.pdf`;
document.body.appendChild(a);
a.click();
a.remove();

}catch(err){
console.error(err);
}

};
useEffect(() => {
  if (location.state?.settlementId && settlements.length > 0) {
    setExpandedRow(parseInt(location.state.settlementId));
  }
}, [settlements, location.state]);
return(

<div className="credit_page">

<h2 className="page_title">Credit Wallet</h2>

{/* SUMMARY CARDS */}
<div className="credit_cards">

<div className="credit_card limit">
<div className="card_icon">💳</div>
<div>
<span>Credit Limit</span>
<h3>QAR {summary.credit_limit || 0}</h3>
</div>
</div>

<div className="credit_card used">
<div className="card_icon">📉</div>
<div>
<span>Used Credit</span>
<h3>QAR {summary.credit_used || 0}</h3>
</div>
</div>

<div className="credit_card available">
<div className="card_icon">✅</div>
<div>
<span>Available</span>
<h3>QAR {summary.credit_available || 0}</h3>
</div>
</div>

<div className="credit_card days">
<div className="card_icon">📅</div>
<div>
<span>Credit Days</span>
<h3>{summary.credit_days || 0}</h3>
</div>
</div>

</div>


{/* CREDIT USAGE BAR */}
<div className="credit_usage">

<div className="usage_header">
<span>Credit Usage</span>
<span>{usedPercent.toFixed(0)}%</span>
</div>

<div className="progress_bar">
<div
className="progress_fill"
style={{width:`${usedPercent}%`}}
></div>
</div>

</div>


{/* TAB BUTTONS */}

<div className="credit_tabs">

<button
className={activeTab==="orders"?"active":""}
onClick={()=>setActiveTab("orders")}
>
Outstanding Orders
</button>

<button
className={activeTab==="payments"?"active":""}
onClick={()=>setActiveTab("payments")}
>
Payment History
</button>

</div>



{/* ORDERS TAB */}

{activeTab==="orders" && (

<div className="section_card">

<table className="credit_table">

<thead>
<tr>
<th>Order</th>
<th>Total</th>
<th>Due</th>
<th>Due Date</th>
<th>Status</th>
</tr>
</thead>

<tbody>

{orders.map(o=>(

<tr key={o.order_id}>

<td>{o.order_id}</td>

<td>QAR {o.total_amount}</td>

<td className="due_amount">
QAR {o.restaurant_due_amount}
</td>

<td>{o.credit_due_date}</td>

<td>
<span className={`status ${o.restaurant_payment_status?.toLowerCase()}`}>
{o.restaurant_payment_status}
</span>
</td>

</tr>

))}

</tbody>

</table>

</div>

)}



{/* PAYMENTS TAB */}

{activeTab==="payments" && (

<div className="section_card">

<table className="credit_table">

<thead>
<tr>
<th>Settlement ID</th>
<th>Orders Paid</th>
<th>Amount</th>
<th>Mode</th>
<th>Date</th>
<th>Receipt</th>
</tr>
</thead>

<tbody>

{settlements.map(s=>(

<tr key={s.settlement_id}>

<td>{s.settlement_id}</td>

<td>
  <div className="order_ids_container">
    {s.order_ids?.slice(0, 3).map(id => (
      <span
        key={id}
        className="order_chip"
        onClick={() => navigate(`/restaurantdashboard/orders/${id}`)}
      >
        #{id}
      </span>
    ))}

    {s.order_ids?.length > 3 && (
      <span
        className="expand_chip"
        onClick={() => toggleExpand(s.settlement_id)}
      >
        +{s.order_ids.length - 3}
      </span>
    )}
  </div>

  {/* EXPANDED VIEW */}
  {expandedRow === s.settlement_id && (
    <div className="expanded_orders">
      {s.order_ids.map(id => (
        <div
          key={id}
          className="expanded_order_item"
          onClick={() => navigate(`/restaurantdashboard/orders/${id}`)}
        >
          Order #{id}
        </div>
      ))}
    </div>
  )}
</td>

<td className="paid_amount">
  <strong>QAR {s.amount}</strong>
</td>

<td>{s.payment_mode}</td>

<td>
  <div className="date_block">
    <span>{new Date(s.created_at).toLocaleDateString()}</span>
    <small>{new Date(s.created_at).toLocaleTimeString()}</small>
  </div>
</td>

<td className="receipt_actions">

<button
className="receipt_btn"
onClick={() => viewReceipt(s.settlement_id)}
>
View
</button>

<button
className="pdf_btn"
onClick={() => downloadSettlementPDF(s.settlement_id)}
>
PDF
</button>

</td>

</tr>

))}

</tbody>

</table>

</div>

)}

{previewUrl && (

<div className="receipt_modal">

<div className="receipt_box">

<div className="receipt_header">
<span>Receipt Preview</span>

<button
className="close_btn"
onClick={()=>setPreviewUrl(null)}
>
Close
</button>
</div>

{previewType === "application/pdf" ? (

<iframe
src={previewUrl}
className="receipt_preview"
title="receipt"
/>

) : (

<TransformWrapper>

{({ zoomIn, zoomOut, resetTransform }) => (

<>

<div className="receipt_toolbar">

<button onClick={() => zoomIn()}>+</button>
<button onClick={() => zoomOut()}>-</button>
<button onClick={() => resetTransform()}>Reset</button>
<button onClick={()=>setRotation(rotation+90)}>
Rotate
</button>

</div>

<TransformComponent>

<img
src={previewUrl}
alt="receipt"
className="receipt_image"
style={{transform:`rotate(${rotation}deg)`}}
/>

</TransformComponent>

</>

)}

</TransformWrapper>

)}

<div className="receipt_footer">

<a
href={previewUrl}
download="receipt"
className="download_btn"
>
Download
</a>

</div>

</div>

</div>

)}

</div>
);
}