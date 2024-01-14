import { useContext, useState } from "react";
import { UserContext } from "../App";

const InputBox = ({
  name,
  type,
  id,
  value,
  placeholder,
  icon,
  disable = false,
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  let { darkMode } = useContext(UserContext);

  return (
    <div className="relative w-[100%] mb-4">
      <input
        name={name}
        type={
          type == "password" ? (passwordVisible ? "text" : "password") : type
        }
        placeholder={placeholder}
        defaultValue={value}
        id={id}
        disabled={disable}
        className={`input-box ${
          darkMode ? "bg-black  placeholder:text-white" : "bg-grey"
        } `}
      />
      <i
        className={`fi ${
          darkMode
            ? "filter-invert " + icon + " input-icon"
            : "" + icon + " input-icon"
        }`}
      ></i>

      {type == "password" ? (
        <i
          className={
            "fi fi-rr-eye" +
            (!passwordVisible ? "-crossed" : "") +
            " input-icon left-[auto] right-4 cursor-pointer"
          }
          onClick={() => setPasswordVisible((currentVal) => !currentVal)}
        ></i>
      ) : (
        ""
      )}
    </div>
  );
};

export default InputBox;
