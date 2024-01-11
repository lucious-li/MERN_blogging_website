import { useContext, useEffect, useState } from "react";
import logo from "../imgs/logo.png";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import UserNavigationPanel from "./user-navigation.component";
import axios from "axios";
import defaultUserProfileImg from "../imgs/user profile.png";

const Navbar = () => {
  const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
  const [userNavPanel, setUserNavPanel] = useState(false);

  let navigate = useNavigate();

  const {
    userAuth,
    userAuth: { access_token, profile_img, new_notifications_available },
    darkMode,
    setdarkMode,
    setUserAuth,
  } = useContext(UserContext);

  const handleUserNavPanel = () => {
    setUserNavPanel((currentVal) => !currentVal);
  };

  const handleSearch = (e) => {
    let query = e.target.value;
    if (e.keyCode == 13 && query.length) {
      navigate(`/search/${query}`);
    }
  };
  const handleBlur = () => {
    setTimeout(() => {
      setUserNavPanel(false);
    }, 200);
  };

  const handleImageLoadError = (e) => {
    e.target.src = defaultUserProfileImg;
  };

  useEffect(() => {
    if (access_token) {
      axios
        .get(import.meta.env.VITE_SERVER_DOMAIN + "/new-notifications", {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        })
        .then(({ data }) => {
          setUserAuth({ ...userAuth, ...data });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [access_token]);
  return (
    <>
      <nav className={`navbar z-50 ${darkMode ? "bg-black" : "bg-white"}`}>
        <Link to="/" className="flex-none w-10">
          <img
            src={logo}
            className={`w-full ${darkMode ? "filter-invert" : ""}`}
          />
        </Link>

        <div
          className={`absolute ${
            darkMode ? "bg-black" : "bg-white"
          } w-full top-full mt-0.5 border-b border-grey py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto md:show +
            ${searchBoxVisibility ? " show " : " hidden "}`}
        >
          <input
            type="text"
            placeholder="Search"
            className={`w-full md:w-auto ${
              darkMode ? "bg-black " : "bg-grey"
            } p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-dark-grey md:pl-12`}
            onKeyDown={handleSearch}
          ></input>
          <i className="fi fi-bs-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-black"></i>
        </div>
        <div className="flex items-center gap-3 md:gap-6 ml-auto">
          <button
            className={`md:hidden  hover:bg-black/10  ${
              darkMode ? "bg-black" : "bg-grey"
            } w-12 h-12 rounded-full flex items-center justify-center`}
          >
            <i
              className="fi fi-bs-search text-xl "
              onClick={() =>
                setSearchBoxVisibility((currentVal) => !currentVal)
              }
            ></i>
          </button>
          <Link
            to="/editor"
            className="hidden md:flex gap-2  hover:bg-black/10 p-3 rounded-full
            opacity-75;"
          >
            <i className="fi fi-rr-file-edit"></i>
            <p className={`${darkMode ? "text-grey " : "text-dark-grey"}`}>
              Write
            </p>
          </Link>

          <button
            className={`w-12 h-12 rounded-full ${
              darkMode ? "bg-black " : "bg-grey"
            } relative hover:bg-black/10`}
          >
            <i
              className={
                "fi fi-br" +
                (darkMode ? "-sun" : "-moon") +
                "  text-2xl block mt-1   cursor-pointer "
              }
              onClick={() => setdarkMode((currentVal) => !currentVal)}
            ></i>
          </button>

          {access_token ? (
            <>
              <Link to="/dashboard/notifications">
                <button
                  className={`w-12 h-12 rounded-full ${
                    darkMode ? "bg-black " : "bg-grey"
                  } relative hover:bg-black/10`}
                >
                  <i className="fi fi-br-bell text-2xl block mt-1"></i>
                  {userAuth ? (
                    new_notifications_available ? (
                      <span className="bg-red w-3 h-3 rounded-full absolute z-10 top-2 right-2"></span>
                    ) : (
                      ""
                    )
                  ) : (
                    ""
                  )}
                </button>
              </Link>

              <div
                className="relative"
                onClick={handleUserNavPanel}
                onBlur={handleBlur}
              >
                <button className="w-12 h-12 mt-1">
                  <img
                    src={profile_img}
                    onError={handleImageLoadError}
                    className="w-full h-full object-cover rounded-full"
                  />
                </button>
                {userNavPanel ? <UserNavigationPanel /> : ""}
              </div>
            </>
          ) : (
            <>
              <Link className="btn-dark py-2" to="/signin">
                Sign in
              </Link>
              <Link className="btn-light py-2 hidden md:block" to="/signup">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
      <Outlet />
    </>
  );
};

export default Navbar;
