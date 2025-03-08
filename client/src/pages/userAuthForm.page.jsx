import { Link, Navigate } from "react-router-dom";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";
import AnimationWrapper from "../common/page-animation";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/session";
import { useContext } from "react";
import { UserContext } from "../App";
import { authWithGoogle } from "../common/firebase";
import { useState, useEffect } from "react";

const UserAuthForm = ({ type }) => {
  let {
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

  const [resetButtonDisabled, setResetButtonDisabled] = useState(false);
  const [resetButtonText, setResetButtonText] = useState("Send");

  const userAuthThroughServer = (serverRoute, formData) => {
    let loadingToast;

    let sendCount = localStorage.getItem("sendCount") || 0;

    if (sendCount >= 3) {
      setResetButtonDisabled(true);
      return toast.error(
        "You have exceeded the maximum number of requests. Please try again tomorrow."
      );
    } else if (serverRoute === "/forgot-password") {
      loadingToast = toast.loading("Sending....");
    }

    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
      .then(({ data }) => {
        if (serverRoute == "/forgot-password") {
          toast.dismiss(loadingToast);
          toast.success("sent successfully! ✅");
          sendCount++;
          localStorage.setItem("sendCount", sendCount);
        } else {
          storeInSession("user", JSON.stringify(data));
          setUserAuth(data);
        }
      })
      .catch(({ response }) => {
        toast.error(response.data.error);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.target.setAttribute("disabled", true);

    // If it's forget-Password, start a 1-minute countdown (to prevent repeated clicks)
    if (type === "forgot-password") {
      setResetButtonDisabled(true);
      let timeLeft = 60;
      const countdown = setInterval(() => {
        setResetButtonText(`Please wait ${timeLeft}s`);
        timeLeft--;
        if (timeLeft < 0) {
          clearInterval(countdown);
          setResetButtonText("Send");
          setResetButtonDisabled(false);
        }
      }, 1000);
    } else {
      e.target.setAttribute("disabled", true);
      setTimeout(() => {
        e.target.removeAttribute("disabled");
      }, 10000);
    }

    let serverRoute =
      type == "sign-in"
        ? "/signin"
        : type == "sign-up"
        ? "/signup"
        : "/forgot-password";

    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

    //formdata
    let form = new FormData(formElment);
    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }
    // console.log(formData);
    let { fullname, email, password } = formData;

    //form validation
    if (fullname) {
      if (fullname.length < 3) {
        return toast.error("Fullname must be at least 3 letters long");
      }
    }

    if (!email.length) {
      return toast.error("enter email");
    }
    if (!emailRegex.test(email)) {
      return toast.error("email is invalid");
    }
    if (password) {
      if (!passwordRegex.test(password)) {
        return toast.error(
          "password should to be 6 to 20 characters long with numeric, 1 lowercase and 1 uppercase letters"
        );
      }
    }
    userAuthThroughServer(serverRoute, formData);
  };

  const handleGoogleAuth = (e) => {
    e.preventDefault();
    authWithGoogle()
      .then((user) => {
        console.log(user);
        let serverRoute = "/google-auth";
        let formData = {
          access_token: user.accessToken,
        };
        userAuthThroughServer(serverRoute, formData);
      })
      .catch((err) => {
        toast.error("trouble login through Google");
        return console.log(err);
      });
  };

  return access_token ? (
    <Navigate to="/" />
  ) : (
    <>
      <AnimationWrapper keyValue={type}>
        <section className="h-cover flex  items-center justify-center ">
          <Toaster />
          <form id="formElment" className="w-[80%] max-w-[400px]">
            <h1 className="text-4xl font-gelasio capitalize text-center mb-20">
              {type === "sign-in"
                ? "Welcome"
                : type === "sign-up"
                ? "Join us today"
                : "Reset password"}
            </h1>

            {type == "sign-up" ? (
              <InputBox
                name="fullname"
                type="text"
                placeholder="Full name"
                icon="fi-rs-circle-user"
              />
            ) : (
              ""
            )}

            <InputBox
              name="email"
              type="email"
              placeholder="Email"
              icon="fi-rr-envelope"
            />

            {type == "forgot-password" ? (
              ""
            ) : (
              <InputBox
                name="password"
                type="password"
                placeholder="Password"
                icon="fi-rs-key"
              />
            )}

            {type == "sign-in" ? (
              <Link
                to="/forgot-password"
                className="hover:underline font-gelasio text-dark-grey text-2xl mt-2 ml-1"
              >
                forgot password ?
              </Link>
            ) : (
              ""
            )}

            <button
              className="btn-dark center mt-14"
              type="submit"
              onClick={handleSubmit}
              disabled={
                type === "forgot-password" ? resetButtonDisabled : false
              }
            >
              {type == "forgot-password"
                ? resetButtonText
                : type.replace("-", " ")}
            </button>

            {type != "forgot-password" ? (
              <>
                <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
                  <hr className="w-1/2 border-black" />
                  <p>or</p>
                  <hr className="w-1/2 border-black" />
                </div>

                <button
                  className="btn-dark flex  items-center justify-center gap-4 w-[90%] center"
                  onClick={handleGoogleAuth}
                >
                  <img src={googleIcon} className="w-5" />
                  continue with Google
                </button>
              </>
            ) : (
              <p className="text-center mt-4">
                <Link
                  to="/signin"
                  className="hover:underline text-dark-grey text-xl center mb-20 "
                >
                  Back
                </Link>
              </p>
            )}

            {type == "sign-in" ? (
              <p className="mt-6 text-dark-grey text-xl text-center">
                Don't have an account ?
                <Link
                  to="/signup"
                  className="underline text-black text-xl ml-1"
                >
                  Join us today
                </Link>
              </p>
            ) : type == "sign-up" ? (
              <p className="mt-6 text-dark-grey text-xl text-center">
                Already a member ?
                <Link
                  to="/signin"
                  className="underline text-black text-xl ml-1"
                >
                  Sign in here
                </Link>
              </p>
            ) : (
              ""
            )}
          </form>
        </section>
      </AnimationWrapper>
    </>
  );
};
export default UserAuthForm;
