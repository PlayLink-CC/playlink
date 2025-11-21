import Navbar from "../Navbar";
import Footer from "../Footer";
import { Outlet } from "react-router-dom";

const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main>{children ? children : <Outlet />}</main>
      <Footer />
    </>
  );
};

export default MainLayout;
