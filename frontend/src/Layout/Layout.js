import React from "react";
import { FiMenu } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { AiFillCloseCircle } from "react-icons/ai";
import Footer from "../Components/Footer";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../Redux/authSlice";

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // for checking user logged in or not
  const isLoggedIn = useSelector((state) => state?.auth?.isLoggedIn);

  // for dispaying the options, according to user role
  const role = useSelector((state) => state?.auth?.role);

  // function to hide the drawer on close button click
  const hideDrawer = () => {
    const element = document.getElementsByClassName("drawer-toggle");
    element[0].checked = false;

    // collapsing the drawer-side width to zero
    const drawerSide = document.getElementsByClassName("drawer-side");
    drawerSide[0].style.width = 0;
  };

  // function for changing the drawer width on menu button click
  const changeWidth = () => {
    const drawerSide = document.getElementsByClassName("drawer-side");
    drawerSide[0].style.width = "auto";
  };

  // function to handle logout
  const handleLogout = async (event) => {
    event.preventDefault();

    // calling logout action
    const res = await dispatch(logout());

    // redirect to home page if true
    if (res?.payload?.success) navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Top navbar for medium+ screens */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-40 bg-black/90 text-white px-8 py-4 items-center justify-between backdrop-blur">
        <Link to="/" className="text-xl font-bold tracking-wide">
          Course<span className="text-yellow-400">Enrol</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-yellow-400 transition-colors">
            Home
          </Link>
          <Link to="/courses" className="hover:text-yellow-400 transition-colors">
            All Courses
          </Link>
          <Link to="/contact" className="hover:text-yellow-400 transition-colors">
            Contact Us
          </Link>
          <Link to="/about" className="hover:text-yellow-400 transition-colors">
            About Us
          </Link>

          {isLoggedIn && role === "ADMIN" && (
            <Link
              to="/admin/dashboard"
              className="hover:text-yellow-400 transition-colors"
            >
              Admin Dashboard
            </Link>
          )}

          {!isLoggedIn && (
            <>
              <Link
                to="/login"
                className="px-4 py-1 rounded-md border border-yellow-500 hover:bg-yellow-500 hover:text-black transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-1 rounded-md bg-yellow-500 text-black hover:bg-yellow-400 transition-colors"
              >
                Signup
              </Link>
            </>
          )}

          {isLoggedIn && (
            <>
              <Link
                to="/user/profile"
                className="hover:text-yellow-400 transition-colors"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-1 rounded-md border border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </header>

      {/* Drawer menu for mobile */}
      <div className="drawer md:hidden fixed z-50 left-0 top-0">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <label htmlFor="my-drawer" className="cursor-pointer relative">
            <FiMenu
              onClick={changeWidth}
              size={"32px"}
              className="font-bold text-white m-4"
            />
          </label>
        </div>

        <div className="drawer-side w-0">
          <label htmlFor="my-drawer" className="drawer-overlay" />
          <ul className="menu p-4 w-64 bg-base-100 text-base-content relative">
            {/* close button for drawer */}
            <li className="w-fit absolute right-2 z-50">
              <button onClick={hideDrawer}>
                <AiFillCloseCircle size={24} />
              </button>
            </li>

            <li>
              <Link to="/" onClick={hideDrawer}>
                Home
              </Link>
            </li>

            {isLoggedIn && role === "ADMIN" && (
              <li>
                <Link to="/admin/dashboard" onClick={hideDrawer}>
                  Admin Dashboard
                </Link>
              </li>
            )}

            <li>
              <Link to="/courses" onClick={hideDrawer}>
                All Courses
              </Link>
            </li>

            <li>
              <Link to="/contact" onClick={hideDrawer}>
                Contact Us
              </Link>
            </li>

            <li>
              <Link to="/about" onClick={hideDrawer}>
                About Us
              </Link>
            </li>

            {!isLoggedIn && (
              <li className="absolute bottom-4 w-[90%]">
                <div className="w-full flex items-center justify-center gap-2">
                  <Link
                    to="/login"
                    onClick={hideDrawer}
                    className="btn-primary px-4 py-1 font-semibold rounded-md w-full text-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={hideDrawer}
                    className="btn-secondary px-4 py-1 font-semibold rounded-md w-full text-center"
                  >
                    Signup
                  </Link>
                </div>
              </li>
            )}

            {isLoggedIn && (
              <li className="absolute bottom-4 w-[90%]">
                <div className="w-full flex items-center justify-center gap-2">
                  <Link
                    to="/user/profile"
                    onClick={hideDrawer}
                    className="btn-primary px-4 py-1 font-semibold rounded-md w-full text-center"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={(e) => {
                      hideDrawer();
                      handleLogout(e);
                    }}
                    className="btn-secondary px-4 py-1 font-semibold rounded-md w-full text-center"
                  >
                    Logout
                  </button>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Main content with top padding so it doesn't hide under navbar */}
      <main className="flex-1 pt-16 md:pt-20">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
