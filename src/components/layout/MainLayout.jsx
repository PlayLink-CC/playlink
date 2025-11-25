/**
 * @file MainLayout.jsx
 * @description Main layout wrapper component for pages that need Navbar and Footer.
 * Uses React Router Outlet for nested route rendering.
 */

import Navbar from "../Navbar";
import Footer from "../Footer";
import { Outlet } from "react-router-dom";

/**
 * MainLayout Component - Layout wrapper with Navbar and Footer
 * Used as a layout wrapper for routes that need consistent header/footer.
 * Renders:
 * - Navbar at the top
 * - Main content (either children or Outlet for nested routes)
 * - Footer at the bottom
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Child components to render in main area
 * @returns {JSX.Element} Layout structure with navigation, content, and footer
 */
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
