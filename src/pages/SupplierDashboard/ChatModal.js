// import React, { useState } from "react";

// const ChatModal = ({ order, onClose }) => {
//   const [messages, setMessages] = useState([
//     { from: "restaurant", text: "Hello, when will my order be delivered?" },
//     { from: "me", text: "It will be dispatched today." },
//   ]);
//   const [newMsg, setNewMsg] = useState("");

//   const sendMessage = () => {
//     if (!newMsg) return;
//     setMessages([...messages, { from: "me", text: newMsg }]);
//     setNewMsg("");
//   };

//   return (
//     <div className="modal_overlay">
//       <div className="chat_modal">
//         <div className="chat_header">
//           <h4>Chat – {order.restaurant}</h4>
//           <button onClick={onClose}>✖</button>
//         </div>

//         <div className="chat_body">
//           {messages.map((msg, i) => (
//             <div
//               key={i}
//               className={`chat_msg ${msg.from === "me" ? "me" : "restaurant"}`}
//             >
//               {msg.text}
//             </div>
//           ))}
//         </div>

//         <div className="chat_input">
//           <input
//             value={newMsg}
//             onChange={(e) => setNewMsg(e.target.value)}
//             placeholder="Type message..."
//           />
//           <button onClick={sendMessage}>
//             <i className="fa fa-paper-plane"></i>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatModal;



import React, { useState } from "react";

const ChatModal = ({ order, onClose }) => {
  const [messages, setMessages] = useState([
    { from: "restaurant", text: "Hello, when will my order be delivered?" },
    { from: "me", text: "It will be dispatched today." },
  ]);

  const [newMsg, setNewMsg] = useState("");

  const sendMessage = () => {
    if (!newMsg.trim()) return;

    setMessages((prev) => [...prev, { from: "me", text: newMsg }]);
    setNewMsg("");
  };

  return (
    <div className="modal_overlay">
      <div className="chat_modal">
        <div className="chat_header">
          <h4>Chat – {order.restaurant}</h4>
          <button onClick={onClose}>✖</button>
        </div>

        <div className="chat_body">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`chat_msg ${msg.from === "me" ? "me" : "restaurant"}`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <div className="chat_input">
          <input
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Type message..."
          />
          <button onClick={sendMessage}>
            <i className="fa fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
