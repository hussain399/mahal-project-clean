
// import React, { useState, useRef, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import signImg from "../images/sign_in_img_1.jpg";

// const USE_BACKEND = true;          // 🔁 false = static | true = backend
// const STATIC_OTP = "123456";
// const API_BASE_URL = "http://127.0.0.1:5000/api/auth";

// const SignIn = () => {
//   const navigate = useNavigate();

//   const [step, setStep] = useState("email");
//   const [email, setEmail] = useState("");

//   const [otp, setOtp] = useState("");
//   const inputsRef = useRef([]);

//   const [error, setError] = useState("");
//   const [shake, setShake] = useState(false);

//   const [msg, setMsg] = useState("");
//   const [loading, setLoading] = useState(false);

//   const [timer, setTimer] = useState(0);
//   const timerRef = useRef(null);

//   // ---------- AUTO LOGIN IF SESSION ----------
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const role  = localStorage.getItem("role");

//     if (token && role === "restaurant") navigate("/RestaurantDashboard");
//   }, [navigate]);

//   const isValidEmail = (v) => v.includes("@");

//   // ---------- RESEND TIMER ----------
//   const startTimer = () => {
//     setTimer(30);
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

//   // ---------- SEND OTP ----------
//   const handleSendOtp = async (e) => {
//     e.preventDefault();
//     setError("");
//     setMsg("");

//     if (!email.trim()) return setError("Email is required");
//     if (!isValidEmail(email)) return setError("Enter valid email");

//     setLoading(true);

//     if (USE_BACKEND) {
//       try {
//         const res = await fetch(`${API_BASE_URL}/send-otp`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ email }),
//         });

//         const data = await res.json();
//         if (!res.ok) return setError(data.error || "Failed to send OTP");
//       } catch {
//         return setError("Network error");
//       }
//     }

//     setLoading(false);
//     setStep("otp");
//     setMsg("OTP sent successfully");
//     startTimer();
//   };

//   // ---------- SINGLE INPUT → AUTO SPLIT ----------
//   const handleOtpChange = (e) => {
//     const value = e.target.value.replace(/\D/g, "").slice(0, 6);
//     setOtp(value);

//     value.split("").forEach((d, i) => {
//       if (inputsRef.current[i]) inputsRef.current[i].value = d;
//     });

//     if (value.length === 6) handleVerify(value);
//   };
//   /* ======================
//      OTP INPUT HANDLING
//   ====================== */
//   const getOtpValue = () =>
//     inputsRef.current.map(i => i?.value || "").join("");

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
//   // ---------- VERIFY OTP ----------
//   const handleVerify = async (otpCode = otp) => {
//     setError("");

//     if (otpCode.length !== 6) return shakeError("Enter 6-digit OTP");

//     setLoading(true);

//     // STATIC MODE
//     if (!USE_BACKEND) {
//       setLoading(false);

//       if (otpCode !== STATIC_OTP)
//         return shakeError("Invalid OTP");

//       saveSessionAndRedirect("restaurant");
//       return;
//     }

//     // BACKEND MODE
//     try {
//       const res = await fetch(`${API_BASE_URL}/verify-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, otp: otpCode }),
//       });

//       const data = await res.json();
//       if (!res.ok) return shakeError("Invalid OTP");

//       saveSessionAndRedirect(data.role, data.token,data.linked_id);

//     } catch {
//       shakeError("Network error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------- SAVE SESSION ----------
//   const saveSessionAndRedirect = (
//     role,
//     token = "static-token",
//     linkedId
//   ) => {
//     localStorage.setItem("token", token);
//     localStorage.setItem("role", role);
//     localStorage.setItem("username", email);

//     if (linkedId) {
//       localStorage.setItem("linked_id", linkedId); // ✅ CRITICAL
//     } else {
//       localStorage.removeItem("linked_id");
//     }

//     // if (role === "restaurant") {
//     //   navigate("/RestaurantDashboard");
//     // } else {
//     //   navigate("/Dashboard");
//     // }

//     if (role === "restaurant") {
//       const TOUR_KEY = "tourSeen_restaurant_dashboard";

//       const hasSeenDashboardTour =
//         localStorage.getItem(TOUR_KEY) === "true";

//       if (!hasSeenDashboardTour) {
//         localStorage.setItem("startRestaurantDashboardTour", "true");
//       }

//       navigate("/RestaurantDashboard");
//     }

//   };


//   // ---------- ERROR SHAKE ----------
//   const shakeError = (msg) => {
//     setError(msg);
//     setShake(true);
//     setTimeout(() => setShake(false), 400);
//   };

//   // ---------- RESEND OTP ----------
//   const handleResend = async () => {
//     if (timer > 0) return;

//     if (USE_BACKEND) await handleSendOtp(new Event("submit"));
//     else startTimer();
//   };

//   return (
//     // <section className="sign_in pt_100 xs_pt_80">
//     //   <div className="container">
//     //     <div className="row justify-content-center align-items-center">

//     //       <div className="col-xxl-3 col-lg-4 d-none d-lg-block">
//     //         <div className="sign_in_img">
//     //           <img src={signImg} alt="Sign In" className="img-fluid w-100" />
//     //         </div>
//     //       </div>

//     //       <div className="col-xxl-5 col-md-10 col-lg-7 col-xl-6">
//     //         <div className="sign_in_form">
//     //           <h3>Restaurant Login</h3>

//     //           {/* STEP 1 — EMAIL */}
//     //           {step === "email" && (
//     //             <form onSubmit={handleSendOtp}>
//     //               <input
//     //                 type="email"
//     //                 placeholder="Enter email address"
//     //                 value={email}
//     //                 onChange={(e) => setEmail(e.target.value)}
//     //               />

//     //               {error && <p className="text-danger">{error}</p>}
//     //               {msg && <p className="text-success">{msg}</p>}

//     //               <button className="common_btn" disabled={loading}>
//     //                 {loading ? "Please wait..." : "Send OTP"}
//     //               </button>
//     //             </form>
//     //           )}

//     //           {/* STEP 2 — OTP */}
//     //           {step === "otp" && (
//     //             <div className={`sign_in_form text-center ${shake ? "shake" : ""}`}>

//     //               <h3>OTP Verification</h3>
//     //               <b>{email}</b>
//     //               <p className="mb-3">Enter 6-digit OTP</p>

//     //               {/* Hidden single box (auto-split) */}
//     //               <input
//     //                 style={{ opacity: 0, position: "absolute", pointerEvents: "none" }}
//     //                 autoFocus
//     //                 value={otp}
//     //                 onChange={handleOtpChange}
//     //               />

//     //               <div className="otp_inputs d-flex justify-content-between mb-3">
//     //                 {[...Array(6)].map((_, i) => (
//     //                   <input
//     //                     key={i}
//     //                     className="otp_box"
//     //                     disabled
//     //                     ref={(el) => (inputsRef.current[i] = el)}
//     //                   />
//     //                 ))}
//     //               </div>

//     //               {error && <p className="text-danger">{error}</p>}

//     //               <button
//     //                 type="button"
//     //                 className="common_btn w-100"
//     //                 disabled={loading}
//     //                 onClick={() => handleVerify()}
//     //               >
//     //                 {loading ? "Verifying..." : "Verify OTP"}
//     //               </button>

//     //               <p className="mt-3 resend">
//     //                 Didn’t receive OTP?{" "}
//     //                 <span
//     //                   style={{ cursor: timer ? "not-allowed" : "pointer" }}
//     //                   className="text-primary"
//     //                   onClick={handleResend}
//     //                 >
//     //                   {timer ? `Resend in ${timer}s` : "Resend"}
//     //                 </span>
//     //               </p>

//     //               <button
//     //                 type="button"
//     //                 className="register_btn mt-2"
//     //                 onClick={() => setStep("email")}
//     //               >
//     //                 Back
//     //               </button>
//     //             </div>
//     //           )}

//     //           <p className="dont_account">
//     //             Don’t have an account? <Link to="/Registration">Sign Up</Link>
//     //           </p>

//     //         </div>
//     //       </div>

//     //     </div>
//     //   </div>
//     // </section>




//     <section className="sign_in pt_100 xs_pt_80">
//       <div className="container">
//         <div className="row justify-content-center align-items-center">

//           <div className="col-xxl-3 col-lg-4 d-none d-lg-block">
//             <div className="sign_in_img">
//               <img src={signImg} alt="Sign In" className="img-fluid w-100" />
//             </div>
//           </div>

//           <div className="col-xxl-5 col-md-10 col-lg-7 col-xl-6">
//             <div className="sign_in_form">
//               <h3>Restaurant Login</h3>

//               {/* STEP 1 — EMAIL */}
//               {step === "email" && (
//                 <form onSubmit={handleSendOtp}>
//                   <input
//                     type="email"
//                     placeholder="Enter email address"
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

//               {/* STEP 2 — OTP */}
//               {step === "otp" && (
//                 <div className={`sign_in_form text-center ${shake ? "shake" : ""}`}>

//                   <h3>OTP Verification</h3>
//                   <b>{email}</b>
//                   <p className="mb-3">Enter 6-digit OTP</p>

//                   {/* Hidden single box (auto-split) */}
//                   <input
//                     style={{ opacity: 0, position: "absolute", pointerEvents: "none" }}
//                     autoFocus
//                     value={otp}
//                     onChange={handleOtpChange}
//                   />

//                   <div className="otp_inputs d-flex justify-content-between mb-3">
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
//                     type="button"
//                     className="common_btn w-100"
//                     disabled={loading}
//                     onClick={() => handleVerify()}
//                   >
//                     {loading ? "Verifying..." : "Verify OTP"}
//                   </button>

//                   <p className="mt-3 resend">
//                     Didn’t receive OTP?{" "}
//                     <span
//                       style={{ cursor: timer ? "not-allowed" : "pointer" }}
//                       className="text-primary"
//                       onClick={handleResend}
//                     >
//                       {timer ? `Resend in ${timer}s` : "Resend"}
//                     </span>
//                   </p>

//                   <button
//                     type="button"
//                     className="register_btn mt-2"
//                     onClick={() => setStep("email")}
//                   >
//                     Back
//                   </button>
//                 </div>
//               )}

//               <p className="dont_account">
//                 Don’t have an account? <Link to="/Registration">Sign Up</Link>
//               </p>

//             </div>
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// };

// export default SignIn;







// import React, { useEffect, useRef, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import signImg from "../images/sign_in_img_1.jpg";
// const USE_BACKEND = true;
// const STATIC_OTP = "123456";
// const API_BASE_URL = "http://127.0.0.1:5000/api/auth";
// const OTP_LENGTH = 6;

// const SignIn = () => {
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [error, setError] = useState("");
//   const [showOtp, setShowOtp] = useState(false);
//   const [otpError, setOtpError] = useState("");
//   const [otpSuccess, setOtpSuccess] = useState(false);
//   const [timer, setTimer] = useState(0);
//   const [canResend, setCanResend] = useState(false);

//   const inputsRef = useRef([]);
//   const timerRef = useRef(null);

//   const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
//   const [shake, setShake] = useState(false);
//   const [msg, setMsg] = useState("");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const role = localStorage.getItem("role");
//     if (token && role === "restaurant") navigate("/RestaurantDashboard");
//   }, [navigate]);
// useEffect(() => {
//   if (showOtp) {
//     setTimeout(() => {
//       inputsRef.current[0]?.focus();
//     }, 100);
//   }
// }, [showOtp]);
//   const isValidEmail = (v) => v.includes("@");

//   const startTimer = () => {
//     setTimer(30);
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

//   const handleSendOtp = async (e) => {
//     e.preventDefault();
//     setError("");
//     setMsg("");

//     if (!email.trim()) return setError("Email is required");
//     if (!isValidEmail(email)) return setError("Enter valid email");

//     setLoading(true);

//     try {
//       const res = await fetch(`${API_BASE_URL}/send-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//   email,
//   role: "restaurant"
// })
// ,
//       });

// const data = await res.json();

// if (!res.ok) {
//   setLoading(false);

//   if (data.error && data.error.includes("email not found")) {
//     setError(
//       "Invalid Email"
//     );
//   } else {
//     setError(data.error || "Failed to send OTP");
//   }

//   return;
// }
//       setShowOtp(true);
//       setOtpError("");
//       setOtpSuccess(false);
//       setMsg("OTP sent successfully");
//       startTimer();

//     } catch {
//       setError("Network error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getOtpValue = () =>
//     inputsRef.current.map((i) => i?.value || "").join("");

// const handleInput = (e, index) => {
//   const value = e.target.value.replace(/\D/g, "");
//   if (!value) return;

//   const newOtp = [...otp];
//   newOtp[index] = value[0];
//   setOtp(newOtp);

//   if (index < OTP_LENGTH - 1) {
//     inputsRef.current[index + 1]?.focus();
//   }

//   const code = newOtp.join("");
//   if (!newOtp.includes("")) {
//     handleVerify(code);
//   }
// };


//   const handleKeyDown = (e, i) => {
//     if (e.key === "Backspace" && !e.target.value && i > 0) {
//       inputsRef.current[i - 1].focus();
//     }
//   };

// const handlePaste = (e) => {
//   e.preventDefault();

//   const paste = e.clipboardData
//     .getData("text")
//     .replace(/\D/g, "")
//     .slice(0, OTP_LENGTH);

//   if (!paste) return;

//   const newOtp = Array(OTP_LENGTH).fill("");

//   paste.split("").forEach((digit, i) => {
//     newOtp[i] = digit;
//   });

//   setOtp(newOtp);

//   if (!newOtp.includes("")) {
//     handleVerify(newOtp.join(""));
//   }
// };

//   const shakeError = (msg) => {
//     setError(msg);
//     setShake(true);
//     setTimeout(() => setShake(false), 400);
//   };

//   const handleVerify = async (otpCode = otp) => {
//     setError("");

//     if (otpCode.length !== 6) return shakeError("Enter 6-digit OTP");

//     setLoading(true);

//     try {
//       const res = await fetch(`${API_BASE_URL}/verify-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, otp: otpCode }),
//       });

//       const data = await res.json();
//       if (!res.ok) return shakeError("Invalid OTP");

//       localStorage.setItem("token", data.token);
//       localStorage.setItem("role", data.role);
//       localStorage.setItem("linked_id", data.linked_id);
//       localStorage.setItem("username", email);

//       setOtpSuccess(true);
//       setTimeout(() => navigate("/RestaurantDashboard"), 1200);

//     } catch {
//       shakeError("Network error");
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

//           {/* LEFT IMAGE */}
//           <div className="col-xxl-3 col-lg-4 d-none d-lg-block">
//             <div className="sign_in_img">
//               <img src={signImg} alt="restaurant Login" className="img-fluid w-100 rounded-4" />
//             </div>
//           </div>

//           {/* RIGHT CONTENT */}
//           <div className="col-xxl-5 col-md-10 col-lg-7 col-xl-6">
//             <div className="sign_in_form register_card">
               
               
//           {/* BACK BUTTON */}
//           <button
//             type="button"
//             className="modern_back_btn"
//             onClick={() => {
//               if (showOtp) {
//                 setShowOtp(false);
//                 setOtp(Array(OTP_LENGTH).fill(""));
//                 inputsRef.current.forEach((i) => i && (i.value = ""));
//                 setOtpError("");
//                 setOtpSuccess(false);
//               } else {
//                 navigate(-1);
//               }
//             }}
//           >
//             <i className="fa-solid fa-arrow-left"></i>
//             {showOtp ? " Change Email" : " Back"}
//           </button>

//               <h3 className="register_title text-center">Restaurant Login</h3>
//               <p className="register_subtitle text-center">
//                 Secure login with email OTP verification
//               </p>

//               <form onSubmit={ handleSendOtp}>
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
//                 {error && <p className="text-danger text-center mt-2">{error}</p>}

//                 {!showOtp && (
//                   <button type="submit" className="enterprise_btn mt-2" disabled={loading}>
//                     {loading ? "Sending..." : "Send OTP →"}
//                   </button>

//                 )}
//               </form>

//                  {!showOtp && (
//             <p className="dont_account text-center mt-3">
//               Don’t have an account? <Link to="/Registration">Sign Up</Link>
//             </p>
//           )}

//               {showOtp && (
               

//                 <div className="mt-4 text-center border-top pt-4">
//                    {loading && (
//       <div className="otp_loading">
//         <div className="spinner"></div>
//       </div>
//     )}
//                   <h5 className="mb-2">OTP Verification</h5>

//                      <p className="mb-4 small_text">
//                 Enter the 6-digit OTP sent to <b>{email}</b>
//               </p>

//                   {!otpSuccess && (
//                     <div className="otp_inputs enterprise_otp" onPaste={handlePaste}>
//                       {[...Array(6)].map((_, index) => (
//                       <input
//                         key={index}
//                         type="tel"
//                         inputMode="numeric"
//                         autoComplete={index === 0 ? "one-time-code" : "off"}
//                         maxLength="1"
//                         value={otp[index]}
//                         ref={(el) => (inputsRef.current[index] = el)}
//                         onChange={(e) => handleInput(e, index)}
//                         onKeyDown={(e) => handleKeyDown(e, index)}
//                       />

//                       ))}
//                     </div>
//                   )}

//                   {otpError && <p className="otp_error mt-3"><i className="fa-solid fa-circle-exclamation"></i>{" "}{otpError}</p>}
//                    {/* SUCCESS */}
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
//                         <>Resend OTP in <b>00:{timer.toString().padStart(2, "0")}</b></>
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

// export default SignIn;






import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import signImg from "../images/sign_in_img_1.jpg";
const USE_BACKEND = true;
const STATIC_OTP = "123456";
const API_BASE_URL = "http://127.0.0.1:5000/api/auth";
const OTP_LENGTH = 6;

const SignIn = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const inputsRef = useRef([]);
  const timerRef = useRef(null);

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [shake, setShake] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role === "restaurant") navigate("/RestaurantDashboard");
  }, [navigate]);
useEffect(() => {
  if (showOtp) {
    setTimeout(() => {
      inputsRef.current[0]?.focus();
    }, 100);
  }
}, [showOtp]);
  const isValidEmail = (v) => v.includes("@");

  const startTimer = () => {
    setTimer(30);
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

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!email.trim()) return setError("Email is required");
    if (!isValidEmail(email)) return setError("Enter valid email");

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  email,
  role: "restaurant"
})
,
      });

const data = await res.json();

if (!res.ok) {
  setLoading(false);

  if (data.error && data.error.includes("email not found")) {
    setError(
      "Invalid Email"
    );
  } else {
    setError(data.error || "Failed to send OTP");
  }

  return;
}
      setShowOtp(true);
      setOtpError("");
      setOtpSuccess(false);
      setMsg("OTP sent successfully");
      startTimer();

    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const getOtpValue = () =>
    inputsRef.current.map((i) => i?.value || "").join("");

const handleInput = (e, index) => {
  const value = e.target.value.replace(/\D/g, "");
  if (!value) return;

  const newOtp = [...otp];
  newOtp[index] = value[0];
  setOtp(newOtp);

  if (index < OTP_LENGTH - 1) {
    inputsRef.current[index + 1]?.focus();
  }

  const code = newOtp.join("");
  if (!newOtp.includes("")) {
    handleVerify(code);
  }
};


  const handleKeyDown = (e, i) => {
    if (e.key === "Backspace" && !e.target.value && i > 0) {
      inputsRef.current[i - 1].focus();
    }
  };

const handlePaste = (e) => {
  e.preventDefault();

  const paste = e.clipboardData
    .getData("text")
    .replace(/\D/g, "")
    .slice(0, OTP_LENGTH);

  if (!paste) return;

  const newOtp = Array(OTP_LENGTH).fill("");

  paste.split("").forEach((digit, i) => {
    newOtp[i] = digit;
  });

  setOtp(newOtp);

  if (!newOtp.includes("")) {
    handleVerify(newOtp.join(""));
  }
};

  const shakeError = (msg) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleVerify = async (otpCode = otp) => {
    setError("");

    if (otpCode.length !== 6) return shakeError("Enter 6-digit OTP");

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await res.json();
      if (!res.ok) return shakeError("Invalid OTP");

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("linked_id", data.linked_id);
      localStorage.setItem("username", email);

      setOtpSuccess(true);
      setTimeout(() => navigate("/RestaurantDashboard"), 1200);

    } catch {
      shakeError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    await handleSendOtp(new Event("submit"));
  };

  return (
  <section className="restaurant_login_wrapper restaurant_bg">

    <div className="floating_blob blob1"></div>
    <div className="floating_blob blob2"></div>

    <div className="login_container">

      {/* LEFT SIDE */}
      <div className="login_left">
        <div className="left_content">

          <img
            src={signImg}
            alt="restaurant Login"
            className="login_logo"
          />

          <h1>Restaurant Partner Login</h1>

          <p>
            Access your restaurant dashboard to manage orders, monitor supplies,
            and ensure seamless kitchen operations with real-time updates.
          </p>

        </div>
      </div>


      {/* RIGHT SIDE */}
      <div className="login_right">

        <div className="glass_card">

          {/* BACK BUTTON */}
          <button
            type="button"
            className="modern_back_btn"
            onClick={() => {
              if (showOtp) {
                setShowOtp(false);
                setOtp(Array(OTP_LENGTH).fill(""));
                inputsRef.current.forEach((i) => i && (i.value = ""));
                setOtpError("");
                setOtpSuccess(false);
              } else {
                navigate(-1);
              }
            }}
          >
            <i className="fa-solid fa-arrow-left"></i>
            {showOtp ? " Change Email" : " Back"}
          </button>


          <h3 className="text-center mb-3">Login</h3>


          {/* EMAIL SECTION */}
          <form onSubmit={handleSendOtp}>

            <div className="mb-3">
              <input
                type="email"
                placeholder="Email Address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={showOtp}
                className="glass_input"
              />
            </div>

            {error && (
              <p className="text-danger text-center mt-2">{error}</p>
            )}

            {!showOtp && (
              <button
                type="submit"
                className="glass_btn"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send OTP →"}
              </button>
            )}

          </form>


          {!showOtp && (
            <p className="mt-3 small_text text-center">
              Don’t have an account ?{" "}
              <Link to="/Registration">Sign Up</Link>
            </p>
          )}


          {/* OTP SECTION */}
          {showOtp && (

            <div className="mt-4 text-center">

              {loading && (
                <div className="otp_loading">
                  <div className="spinner"></div>
                </div>
              )}

              <h6>OTP Verification</h6>

              <p className="small_text">
                Enter the 6-digit OTP sent to <b>{email}</b>
              </p>


              {!otpSuccess && (
                <div
                  className="otp_inputs"
                  onPaste={handlePaste}
                >

                  {[...Array(6)].map((_, index) => (
                    <input
                      key={index}
                      type="tel"
                      inputMode="numeric"
                      autoComplete={
                        index === 0 ? "one-time-code" : "off"
                      }
                      maxLength="1"
                      value={otp[index]}
                      ref={(el) => (inputsRef.current[index] = el)}
                      onChange={(e) => handleInput(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="otp_box"
                    />
                  ))}

                </div>
              )}


              {otpError && (
                <p className="otp_error mt-2">
                  <i className="fa-solid fa-circle-exclamation"></i>{" "}
                  {otpError}
                </p>
              )}


              {/* SUCCESS */}
              {otpSuccess && (
                <div className="otp_success">
                  <div className="checkmark"></div>
                  <h6>OTP Verified Successfully</h6>
                </div>
              )}


              {!otpSuccess && (
                <p className="mt-3">
                  {canResend ? (
                    <span
                      onClick={handleResend}
                      className="resend_link"
                    >
                      Resend OTP
                    </span>
                  ) : (
                    <>
                      Resend in 00:
                      {timer.toString().padStart(2, "0")}
                    </>
                  )}
                </p>
              )}

            </div>
          )}

        </div>

      </div>

    </div>

  </section>
);
};

export default SignIn;





