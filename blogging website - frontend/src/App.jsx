import { Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar.component";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navbar />}>
        <Route path="signin" element={<h1>sign in page</h1>} />;
        <Route path="signup" element={<h1>sign up page</h1>} />;
      </Route>
    </Routes>
  );
};

export default App;
