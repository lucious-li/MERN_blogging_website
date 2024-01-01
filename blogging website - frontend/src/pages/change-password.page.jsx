import React, { useRef } from "react";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import toast, { Toaster } from "react-hot-toast";

const ChangePassword = () => {
  let changePassWordForm = useRef();

  let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(changePassWordForm.current);
    let form = new FormData(changePassWordForm.current);

    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let { CurrentPassword, NewPassword } = formData;

    if (!CurrentPassword.length || !NewPassword.length) {
      return toast.error("Fill all the inputs");
    }

    if (
      !passwordRegex.test(CurrentPassword) ||
      !passwordRegex.test(NewPassword)
    ) {
      return toast.error(
        "password should to be 6 to 20 characters long with numeric, 1 lowercase and 1 uppercase letters"
      );
    }
  };
  return (
    <AnimationWrapper>
      <Toaster />
      <form ref={changePassWordForm}>
        <h1 className="max-md:hidden ">Change Password</h1>
        <div className="py-10 w-full md:max-w-[400px]">
          <InputBox
            name="CurrentPassword"
            type="password"
            className="prfile-edit-input"
            placeholder="Current Password"
            icon="fi fi-rr-unlock"
          />

          <InputBox
            name="NewPassword"
            type="password"
            className="prfile-edit-input"
            placeholder="New Password"
            icon="fi fi-rr-unlock"
          />

          <button
            onClick={handleSubmit}
            className="btn-dark px-10 "
            type="submit"
          >
            Change Password
          </button>
        </div>
      </form>
    </AnimationWrapper>
  );
};

export default ChangePassword;
