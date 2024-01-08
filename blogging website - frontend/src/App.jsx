import { Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import { createContext, useEffect, useState } from "react";
import { lookInSession } from "./common/session";
import Editor from "./pages/editor.pages";
import HomePage from "./pages/home.page";
import Search from "./pages/search.page";
import PageNotFound from "./pages/404.page";
import ProfilePage from "./pages/profile.page";
import BlogPage from "./pages/blog.page";
import SideNav from "./components/sidenavbar.component";
import ChangePassword from "./pages/change-password.page";
import EditProfile from "./pages/edit-profile.page";
import ResetPassword from "./pages/reset-password";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

export const UserContext = createContext({});

const App = () => {
  const [userAuth, setUserAuth] = useState({});
  const [darkMode, setdarkMode] = useState(false);

  const darkTheme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: "#90caf9",
      },
      secondary: {
        main: "#131052",
      },
    },
  });

  useEffect(() => {
    let userInSession = lookInSession("user");
    userInSession
      ? setUserAuth(JSON.parse(userInSession))
      : setUserAuth({ access_token: null });
  }, []);

  return (
    <UserContext.Provider
      value={{ userAuth, setUserAuth, darkMode, setdarkMode }}
    >
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Routes>
          <Route path="/editor" element={<Editor />} />
          <Route path="/editor/:blog_id" element={<Editor />} />
          <Route path="/" element={<Navbar />}>
            <Route index element={<HomePage />} />
            <Route path="settings" element={<SideNav />}>
              <Route path="edit-profile" element={<EditProfile />} />
              <Route path="change-password" element={<ChangePassword />} />
            </Route>
            <Route path="signin" element={<UserAuthForm type="sign-in" />} />;
            <Route path="signup" element={<UserAuthForm type="sign-up" />} />;
            <Route
              path="forgot-password"
              element={<UserAuthForm type="forgot-password" />}
            />
            ;
            <Route
              path="reset-password/:id/:token"
              element={<ResetPassword />}
            />
            ;
            <Route path="search/:query" element={<Search />} />;
            <Route path="user/:id" element={<ProfilePage />} />;
            <Route path="blogs/:blog_id" element={<BlogPage />} />;
            <Route path="*" element={<PageNotFound />} />;
          </Route>
        </Routes>
      </ThemeProvider>
    </UserContext.Provider>
  );
};

export default App;
