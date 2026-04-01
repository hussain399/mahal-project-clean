import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import signImg from "../images/sign_in_img_1.jpg";

const OtpVerification = () => {
  const inputsRef = useRef([]);
  const navigate = useNavigate();

  const handleInput = (e, index) => {
    const value = e.target.value;

    // Allow only numbers
    if (!/^[0-9]$/.test(value)) {
      e.target.value = "";
      return;
    }

    // Move to next field
    if (index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1].focus();
    } else {
       
      handleVerify();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleVerify = () => {

    navigate("/Dashboard");
  };

  return (
    <section className="sign_in pt_100 xs_pt_80">
      <div className="container">
        <div className="row justify-content-center align-items-center">

          {/* LEFT IMAGE */}
          <div className="col-xxl-3 col-lg-4 d-none d-lg-block">
            <div className="sign_in_img">
              <img src={signImg} alt="OTP" className="img-fluid w-100" />
            </div>
          </div>

          {/* OTP FORM */}
          <div className="col-xxl-5 col-md-10 col-lg-7 col-xl-6">
            <div className="sign_in_form text-center">

              <h3>OTP Verification</h3>
              <p className="mb-4">
                Enter the 6-digit OTP sent to your mobile number
              </p>

              <div className="otp_inputs d-flex justify-content-between mb-4">
                {[...Array(6)].map((_, index) => (
                  <input
                    key={index}
                    type="tel"
                    inputMode="numeric"
                    maxLength="1"
                    className="otp_box"
                    ref={(el) => (inputsRef.current[index] = el)}
                    onInput={(e) => handleInput(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                  />
                ))}
              </div>

              <button
                type="button"
                className="common_btn w-100"
                onClick={handleVerify}
              >
                Verify OTP <span></span>
              </button>

              <p className="mt-3 resend">
                Didn’t receive OTP?{" "}
                <span className="text-primary">Resend</span>
              </p>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default OtpVerification;
