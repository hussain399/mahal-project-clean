// import React, { useState, useRef } from "react";
// import { Helmet } from "react-helmet";
// import { Link, useNavigate } from "react-router-dom";

// import signImg from "../../images/sign_in_img_1.jpg";
// import Logo from "../../images/Logo.png";

// const API_BASE = "http://127.0.0.1:5000/api/admin/auth";

// export default function AdminLogin() {
//   const navigate = useNavigate();

//   const [step, setStep] = useState("email");
//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState("");
//   const inputsRef = useRef([]);

//   const [error, setError] = useState("");
//   const [msg, setMsg] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [shake, setShake] = useState(false);

//   // ✅ NEW: RESEND TIMER (prevents your 429 error)
//   const [timer, setTimer] = useState(0);
//   const timerRef = useRef(null);

//   const startTimer = () => {
//     setTimer(60);
//     timerRef.current = setInterval(() => {
//       setTimer((t) => {
//         if (t <= 1) {
//           clearInterval(timerRef.current);
//           return 0;
//         }
//         return t - 1;
//       });
//     }, 1000);
//   };

//   /* ======================
//      OTP INPUT HELPERS
//   ====================== */
//   const getOtpValue = () =>
//     inputsRef.current.map((i) => i?.value || "").join("");

//   const handleInput = (e, i) => {
//     const v = e.target.value.replace(/\D/g, "");
//     e.target.value = v;

//     const code = getOtpValue();
//     setOtp(code);

//     if (v && i < 5) inputsRef.current[i + 1].focus();
//     if (code.length === 6) verifyOtp(code);
//   };

//   const handleKeyDown = (e, i) => {
//     if (e.key === "Backspace" && !e.target.value && i > 0) {
//       inputsRef.current[i - 1].focus();
//     }
//   };

//   const handlePaste = (e) => {
//     const paste = e.clipboardData
//       .getData("text")
//       .replace(/\D/g, "")
//       .slice(0, 6);

//     paste.split("").forEach((d, i) => {
//       if (inputsRef.current[i]) inputsRef.current[i].value = d;
//     });

//     setOtp(paste);
//     if (paste.length === 6) verifyOtp(paste);
//   };

//   const shakeError = (msg) => {
//     setError(msg);
//     setShake(true);
//     setTimeout(() => setShake(false), 400);
//   };

//   /* ======================
//      SEND OTP (SAME LOGIC + TIMER)
//   ====================== */
//   const sendOtp = async (e) => {
//     if (e) e.preventDefault();
//     setError("");
//     setMsg("");

//     if (!email.trim()) return setError("Email is required");
//     if (!email.includes("@")) return setError("Enter valid admin email");

//     setLoading(true);

//     try {
//       const res = await fetch(`${API_BASE}/send-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error);

//       setStep("otp");
//       setMsg("OTP sent successfully");
//       startTimer(); // ✅ FIX: prevent 429 error

//     } catch (err) {
//       setError(err.message || "Server error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ======================
//      VERIFY OTP (UNCHANGED LOGIC)
//   ====================== */
//   const verifyOtp = async (otpVal = otp) => {
//     setError("");

//     if (otpVal.length !== 6)
//       return shakeError("Enter 6-digit OTP");

//     setLoading(true);

//     try {
//       const res = await fetch(`${API_BASE}/verify-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, otp: otpVal }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error);

//       // ✅ YOUR ORIGINAL SESSION LOGIC — untouched
// localStorage.setItem("admin_token", data.admin_token);
// localStorage.setItem("admin_id", data.admin_id);
// localStorage.setItem("admin_role", data.admin_role);
// localStorage.setItem(
//   "admin_permissions",
//   JSON.stringify(data.admin_permissions)
// );


//       navigate("/admin/dashboard");

//     } catch (err) {
//       shakeError(err.message || "Invalid OTP");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <section className="sign_in pt_100 xs_pt_80">
//       <Helmet>
//         <title>Admin Login</title>
//       </Helmet>

//       <div className="container">
//         <div className="row justify-content-center align-items-center">

//           {/* LEFT IMAGE — SAME AS SUPPLIER */}
//           <div className="col-xxl-3 col-lg-4 d-none d-lg-block">
//             <div className="sign_in_img">
//               <img
//                 src={signImg}
//                 alt="Admin Login"
//                 className="img-fluid w-100"
//               />
//             </div>
//           </div>

//           {/* FORM COLUMN — EXACT SAME UI */}
//           <div className="col-xxl-5 col-md-10 col-lg-7 col-xl-6">
//             <div className="sign_in_form">

//               <h3>Admin Login</h3>

//               {/* STEP 1 — EMAIL */}
//               {step === "email" && (
//                 <form onSubmit={sendOtp}>
//                   <input
//                     type="email"
//                     placeholder="Enter admin email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                   />

//                   {error && <p className="text-danger">{error}</p>}
//                   {msg && <p className="text-success">{msg}</p>}

//                   <button className="common_btn" disabled={loading}>
//                     {loading ? "Please wait..." : "Send OTP"}
//                   </button>
//                 </form>
//               )}

//               {/* STEP 2 — OTP (SAME UI) */}
//               {step === "otp" && (
//                 <div
//                   className={`sign_in_form text-center ${
//                     shake ? "shake" : ""
//                   }`}
//                 >
//                   <h3>OTP Verification</h3>
//                   <b>{email}</b>
//                   <p className="mb-3">Enter 6-digit OTP</p>

//                   <div
//                     className="otp_inputs d-flex justify-content-between mb-3"
//                     onPaste={handlePaste}
//                   >
//                     {[...Array(6)].map((_, i) => (
//                       <input
//                         key={i}
//                         type="tel"
//                         maxLength="1"
//                         className="otp_box"
//                         ref={(el) => (inputsRef.current[i] = el)}
//                         onInput={(e) => handleInput(e, i)}
//                         onKeyDown={(e) => handleKeyDown(e, i)}
//                       />
//                     ))}
//                   </div>

//                   {error && <p className="text-danger">{error}</p>}

//                   <button
//                     className="common_btn w-100"
//                     disabled={loading}
//                     onClick={() => verifyOtp()}
//                   >
//                     {loading ? "Verifying..." : "Verify OTP"}
//                   </button>

//                   <p className="mt-3 resend">
//                     Didn’t receive OTP?{" "}
//                     <span
//                       className="text-primary"
//                       style={{
//                         cursor: timer ? "not-allowed" : "pointer",
//                       }}
//                       onClick={() => timer === 0 && sendOtp()}
//                     >
//                       {timer ? `Resend in ${timer}s` : "Resend"}
//                     </span>
//                   </p>

//                   {/* ✅ REPLACED BACK → CHANGE EMAIL */}
//                   <button
//                     type="button"
//                     className="register_btn mt-2"
//                     onClick={() => {
//                       setStep("email");
//                       setOtp("");
//                       setError("");
//                       setMsg("");
//                       setTimer(0);
//                     }}
//                   >
//                     Change Email
//                   </button>
//                 </div>
//               )}

//               <p className="dont_account">
//                 Not an admin?{" "}
//                 <Link to="/login">Go to Supplier Login</Link>
//               </p>

//             </div>
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// }








// import React, { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import signImg from "../../images/sign_in_img_1.jpg";

// const API_BASE = "http://127.0.0.1:5000/api/admin/auth";
// const OTP_LENGTH = 6;

// const AdminLogin = () => {
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [error, setError] = useState("");
//   const [showOtp, setShowOtp] = useState(false);
//   const [otpSuccess, setOtpSuccess] = useState(false);
//   const [timer, setTimer] = useState(0);
//   const [canResend, setCanResend] = useState(false);

//   const inputsRef = useRef([]);
//   const timerRef = useRef(null);

//   const [otp, setOtp] = useState("");
//   const [loading, setLoading] = useState(false);

//   /* AUTO LOGIN */
//   useEffect(() => {
//     const token = localStorage.getItem("admin_token");
//     if (token) navigate("/admin/dashboard");
//   }, [navigate]);

//   const startTimer = () => {
//     setTimer(60);
//     setCanResend(false);

//     timerRef.current = setInterval(() => {
//       setTimer((t) => {
//         if (t <= 1) {
//           clearInterval(timerRef.current);
//           setCanResend(true);
//           return 0;
//         }
//         return t - 1;
//       });
//     }, 1000);
//   };
// useEffect(() => {
//   if (showOtp) {
//     setTimeout(() => {
//       inputsRef.current[0]?.focus();
//     }, 100);
//   }
// }, [showOtp]);

//   /* SEND OTP */
//   const handleSendOtp = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (!email.trim()) return setError("Email is required");

//     setLoading(true);

//     try {
//       const res = await fetch(`${API_BASE}/send-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setError(data.error || "Failed to send OTP");
//         setLoading(false);
//         return;
//       }

//       setShowOtp(true);
//       startTimer();

//     } catch {
//       setError("Network error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* OTP INPUT */
//   const getOtpValue = () =>
//     inputsRef.current.map((i) => i?.value || "").join("");

//   const handleInput = (e, i) => {
//     const v = e.target.value.replace(/\D/g, "");
//     e.target.value = v;

//     const code = getOtpValue();
//     setOtp(code);

//     if (v && i < 5) inputsRef.current[i + 1].focus();
//     if (code.length === 6) handleVerify(code);
//   };

//   const handleKeyDown = (e, i) => {
//     if (e.key === "Backspace" && !e.target.value && i > 0) {
//       inputsRef.current[i - 1].focus();
//     }
//   };

//   /* VERIFY OTP */
//   const handleVerify = async (otpCode = otp) => {
//     if (otpCode.length !== 6) return;

//     setLoading(true);

//     try {
//       const res = await fetch(`${API_BASE}/verify-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, otp: otpCode }),
//       });

//       const data = await res.json();
//       if (!res.ok) return setError(data.error || "Invalid OTP");

//       localStorage.setItem("admin_token", data.admin_token);
//       localStorage.setItem("admin_id", data.admin_id);
//       localStorage.setItem("admin_role", data.admin_role);
//       localStorage.setItem(
//         "admin_permissions",
//         JSON.stringify(data.admin_permissions)
//       );

//       setOtpSuccess(true);
//       setTimeout(() => navigate("/admin/dashboard"), 1200);

//     } catch {
//       setError("Network error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResend = async () => {
//     if (timer > 0) return;
//     await handleSendOtp(new Event("submit"));
//   };

//   return (
//     <section className="sign_in register_section pt_100 xs_pt_80">
//       <div className="container">
//         <div className="row justify-content-center align-items-center">

//           <div className="col-xxl-3 col-lg-4 d-none d-lg-block">
//             <div className="sign_in_img">
//               <img
//                 src={signImg}
//                 alt="Admin Login"
//                 className="img-fluid w-100 rounded-4"
//               />
//             </div>
//           </div>

//           <div className="col-xxl-5 col-md-10 col-lg-7 col-xl-6">
//             <div className="sign_in_form register_card">

//               <h3 className="register_title text-center">Admin Login</h3>
//               <p className="register_subtitle text-center">
//                 Secure login with email OTP verification
//               </p>

//               <form onSubmit={handleSendOtp}>
//                 <div className="floating_group icon_input">
//                   <i className="fa-solid fa-envelope input_icon"></i>
//                   <input
//                     type="email"
//                     required
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     disabled={showOtp}
//                   />
//                   <label>Email Address</label>
//                 </div>

//                 {error && (
//                   <p className="text-danger text-center mt-2">{error}</p>
//                 )}

//                 {!showOtp && (
//                   <button
//                     type="submit"
//                     className="enterprise_btn mt-2"
//                     disabled={loading}
//                   >
//                     {loading ? "Sending..." : "Send OTP →"}
//                   </button>
//                 )}
//               </form>

//               {showOtp && (
//                 <div className="mt-4 text-center border-top pt-4">

//                   <h5 className="mb-2">OTP Verification</h5>

//                   <div className="otp_inputs enterprise_otp">
//                     {[...Array(6)].map((_, index) => (
//                       <input
//                         key={index}
//                         type="tel"
//                         maxLength="1"
//                         ref={(el) => (inputsRef.current[index] = el)}
//                         onInput={(e) => handleInput(e, index)}
//                         onKeyDown={(e) => handleKeyDown(e, index)}
//                       />
//                     ))}
//                   </div>

//                   {otpSuccess && (
//                     <div className="otp_success">
//                       <div className="checkmark"></div>
//                       <h6>OTP Verified Successfully</h6>
//                     </div>
//                   )}

//                   {!otpSuccess && (
//                     <p className="mt-3 resend">
//                       {canResend ? (
//                         <span onClick={handleResend}>Resend OTP</span>
//                       ) : (
//                         <>Resend OTP in <b>00:{timer}</b></>
//                       )}
//                     </p>
//                   )}

//                 </div>
//               )}

//             </div>
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// };

// export default AdminLogin;




import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import signImg from "../../images/sign_in_img_1.jpg";

const API_BASE = "http://127.0.0.1:5000/api/admin/auth";
const OTP_LENGTH = 6;

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const inputsRef = useRef([]);
  const timerRef = useRef(null);

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  /* AUTO LOGIN */
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) navigate("/admin/dashboard");
  }, [navigate]);

  const startTimer = () => {
    setTimer(60);
    setCanResend(false);

    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };
useEffect(() => {
  if (showOtp) {
    setTimeout(() => {
      inputsRef.current[0]?.focus();
    }, 100);
  }
}, [showOtp]);

  /* SEND OTP */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) return setError("Email is required");

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
        setLoading(false);
        return;
      }

      setShowOtp(true);
      startTimer();

    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  /* OTP INPUT */
  const getOtpValue = () =>
    inputsRef.current.map((i) => i?.value || "").join("");

  const handleInput = (e, i) => {
    const v = e.target.value.replace(/\D/g, "");
    e.target.value = v;

    const code = getOtpValue();
    setOtp(code);

    if (v && i < 5) inputsRef.current[i + 1].focus();
    if (code.length === 6) handleVerify(code);
  };

  const handleKeyDown = (e, i) => {
    if (e.key === "Backspace" && !e.target.value && i > 0) {
      inputsRef.current[i - 1].focus();
    }
  };

  /* VERIFY OTP */
  const handleVerify = async (otpCode = otp) => {
    if (otpCode.length !== 6) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await res.json();
      if (!res.ok) return setError(data.error || "Invalid OTP");

      localStorage.setItem("admin_token", data.admin_token);
      localStorage.setItem("admin_id", data.admin_id);
      localStorage.setItem("admin_role", data.admin_role);
      localStorage.setItem(
        "admin_permissions",
        JSON.stringify(data.admin_permissions)
      );

      setOtpSuccess(true);
      setTimeout(() => navigate("/admin/dashboard"), 1200);

    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    await handleSendOtp(new Event("submit"));
  };

  return (
    <section className="sign_in register_section pt_100 xs_pt_80">
      <div className="container">
        <div className="row justify-content-center align-items-center">

          <div className="col-xxl-3 col-lg-4 d-none d-lg-block">
            <div className="sign_in_img">
              <img
                src={signImg}
                alt="Admin Login"
                className="img-fluid w-100 rounded-4"
              />
            </div>
          </div>

          <div className="col-xxl-5 col-md-10 col-lg-7 col-xl-6">
            <div className="sign_in_form register_card">

              <h3 className="register_title text-center">Admin Login</h3>
              <p className="register_subtitle text-center">
                Secure login with email OTP verification
              </p>

              <form onSubmit={handleSendOtp}>
                <div className="floating_group icon_input">
                  <i className="fa-solid fa-envelope input_icon"></i>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={showOtp}
                  />
                  <label>Email Address</label>
                </div>

                {error && (
                  <p className="text-danger text-center mt-2">{error}</p>
                )}

                {!showOtp && (
                  <button
                    type="submit"
                    className="enterprise_btn mt-2"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send OTP →"}
                  </button>
                )}
              </form>

              {showOtp && (
                <div className="mt-4 text-center border-top pt-4">

                  <h5 className="mb-2">OTP Verification</h5>

                  <div className="otp_inputs enterprise_otp">
                    {[...Array(6)].map((_, index) => (
                      <input
                        key={index}
                        type="tel"
                        maxLength="1"
                        ref={(el) => (inputsRef.current[index] = el)}
                        onInput={(e) => handleInput(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                      />
                    ))}
                  </div>

                  {otpSuccess && (
                    <div className="otp_success">
                      <div className="checkmark"></div>
                      <h6>OTP Verified Successfully</h6>
                    </div>
                  )}

                  {!otpSuccess && (
                    <p className="mt-3 resend">
                      {canResend ? (
                        <span onClick={handleResend}>Resend OTP</span>
                      ) : (
                        <>Resend OTP in <b>00:{timer}</b></>
                      )}
                    </p>
                  )}

                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AdminLogin;