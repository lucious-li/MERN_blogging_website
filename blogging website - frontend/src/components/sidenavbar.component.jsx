import React, { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../App";
import { NavLink, Navigate, Outlet } from "react-router-dom";

const SideNav = () => {
  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  let page = location.pathname.split("/")[2];

  let [pagestate, setPagestate] = useState(page);
  let [showSideNav, setShowSideNav] = useState(false);

  let activeTabLine = useRef();
  let sideBarIconTab = useRef();
  let pageStateTab = useRef();

  const changePageState = (e) => {
    let { offsetWidth, offsetLeft } = e.target;
    activeTabLine.current.style.width = offsetWidth + "px";
    activeTabLine.current.style.left = offsetLeft + "px";

    if (e.target == sideBarIconTab.current) {
      setShowSideNav(true);
    } else {
      setShowSideNav(false);
    }
  };

  useEffect(() => {
    setShowSideNav(false);
    if (pageStateTab.current) {
      pageStateTab.current.click();
    }
  }, [pagestate]);

  return access_token == null ? (
    <Navigate to="/signin" />
  ) : (
    <>
      <section className="relative flex gap-10 py-0 m-0 max-md:flex-col">
        <div className="sticky top-[80px] z-30">
          <div className="md:hidden bg-white py-1 border-b border-grey flex flex-nowrap overflow-x-auto">
            <button
              ref={sideBarIconTab}
              className="p-5 capitalize"
              onClick={changePageState}
            >
              <i className="fi fi-sr-bars-staggered pointer-events-none"></i>
            </button>

            <button
              ref={pageStateTab}
              className="p-5 capitalize"
              onClick={changePageState}
            >
              {pagestate}
            </button>

            <hr
              ref={activeTabLine}
              className="absolute bottom-0 duration-500"
            />
          </div>

          <div
            className={
              "min-w-[200px] h-[calc(100vh-80px-60px)] md:h-cover md:sticky top-24 overflow-y-auto p-6 md:pr-0 md:border-grey md:border-r absolute max-md:top-[64px] bg-white max-mdLw-[calc(100%+80px)] max-md:px-16 max-md:-ml-7 duration-500 " +
              (!showSideNav
                ? "max-md:opacity-0 max-md:pointer-events-none"
                : "opacity-100 pointer-events-auto")
            }
          >
            <h1 className="text-xl text-dark-grey mb-3">Dashboard</h1>
            <hr className="border-grey -ml-6 mb-8 mr-6"></hr>

            <NavLink
              to="/dashboard/blogs"
              className="sidebar-link"
              onClick={(e) => setPagestate(e.target.innerText)}
            >
              <i className="fi fi-rr-document"></i>
              Blogs
            </NavLink>

            <NavLink
              to="/dashboard/notification"
              className="sidebar-link"
              onClick={(e) => setPagestate(e.target.innerText)}
            >
              <i className="fi fi-rs-bell"></i>
              Notification
            </NavLink>

            <NavLink
              to="/editor"
              className="sidebar-link"
              onClick={(e) => setPagestate(e.target.innerText)}
            >
              <i className="fi fi-rr-edit"></i>
              Write
            </NavLink>

            <h1 className="text-xl text-dark-grey mb-3 mt-20">Settings</h1>
            <hr className="border-grey -ml-6 mb-8 mr-6"></hr>

            <NavLink
              to="/settings/edit-profile"
              className="sidebar-link"
              onClick={(e) => setPagestate(e.target.innerText)}
            >
              <i className="fi fi-rr-user"></i>
              Edit Profile
            </NavLink>

            <NavLink
              to="/settings/change-password"
              className="sidebar-link"
              onClick={(e) => setPagestate(e.target.innerText)}
            >
              <i className="fi fi-rr-fingerprint"></i>
              Change Password
            </NavLink>
          </div>
        </div>
        <div className="max-md:-mt-8 mt-5 w-full">
          <Outlet />
        </div>
      </section>
    </>
  );
};

export default SideNav;
