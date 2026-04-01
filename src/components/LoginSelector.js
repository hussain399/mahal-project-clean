import { Link } from "react-router-dom";

const LoginSelector = ({ onClose }) => {
  return (
    <div className="login-modal">
      <h3 className="text-center mb-4">Login As</h3>

      <div className="login-cards">
        <Link to="/login/restaurant" className="login-card">
          <i className="fa-solid fa-utensils"></i>
          <h5>Restaurant</h5>
          <p>Manage orders & menus</p>
        </Link>

        <Link to="/login/supplier" className="login-card">
          <i className="fa-solid fa-truck"></i>
          <h5>Supplier</h5>
          <p>Handle supplies & requests</p>
        </Link>

        <Link to="/login/admin" className="login-card">
          <i className="fa-solid fa-user-shield"></i>
          <h5>Admin</h5>
          <p>System control & reports</p>
        </Link>
      </div>

      <button onClick={onClose} className="close-btn">✕</button>
    </div>
  );
};

export default LoginSelector;
