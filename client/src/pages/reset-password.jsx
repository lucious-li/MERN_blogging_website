import React, { useContext, useEffect, useRef } from "react";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import toast, { Toaster } from "react-hot-toast";
import {
  useNavigate,
  Navigate,
  useParams,
  useLocation,
} from "react-router-dom";
import axios from "axios";
import { UserContext } from "../App";
import { storeInSession } from "../common/session";

const ResetPassword = () => {
  let resetPasswordForm = useRef();
  const navigate = useNavigate();

  const location = useLocation();
  const { id, token } = useParams();

  let {
    userAuth,
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

  let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

  const handleSubmit = (e) => {
    e.preventDefault();
    let form = new FormData(resetPasswordForm.current);
    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let { NewPassword, NewPasswordRepet } = formData;

    if (!NewPassword.length || !NewPasswordRepet.length) {
      return toast.error("Fill all the inputs");
    }

    if (NewPassword != NewPasswordRepet) {
      return toast.error("two password does not match");
    }

    if (
      !passwordRegex.test(NewPassword) ||
      !passwordRegex.test(NewPasswordRepet)
    ) {
      return toast.error(
        "password should to be 6 to 20 characters long with numeric, 1 lowercase and 1 uppercase letters"
      );
    }
    let loadingToast = toast.loading("Reseting....");
    e.target.setAttribute("disabled", true);

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/reset-password",
        {
          id,
          NewPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(({ data }) => {
        let newUserAuth = { ...userAuth, password: data.password };
        storeInSession("user", JSON.stringify(newUserAuth));
        setUserAuth(newUserAuth);

        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        toast.success("New Password Updated");

        setTimeout(() => {
          navigate("/signin");
        }, 2000);
      })
      .catch(({ response }) => {
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        toast.error(response.data.error);
      });
  };

  // useEffect(() => {
  //   console.log("Token changed:", token);
  // }, [token]);

  return access_token ? (
    <Navigate to="/" />
  ) : (
    <>
      <AnimationWrapper>
        <Toaster />
        <section className="h-cover flex  items-center justify-center ">
          <form ref={resetPasswordForm} className="w-[80%] max-w-[400px]">
            <h1 className="text-4xl font-gelasio capitalize text-center mb-20">
              Reset Password
            </h1>

            <div className="py-10 w-full md:max-w-[400px]">
              <InputBox
                name="NewPassword"
                type="password"
                className="prfile-edit-input"
                placeholder="New Password"
                icon="fi fi-rr-lock"
              />

              <InputBox
                name="NewPasswordRepet"
                type="password"
                className="prfile-edit-input"
                placeholder="Repet Password"
                icon="fi fi-rr-lock"
              />

              <button
                onClick={handleSubmit}
                className="btn-dark px-10 center mt-14"
                type="submit"
              >
                Reset Password
              </button>
            </div>
          </form>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default ResetPassword;
