import { Link, NavLink, useNavigate } from "react-router-dom";
import { logout } from "../store/authSlice";
import { useDispatch, useSelector } from "react-redux";
import api from "../api/api";
import toast from "react-hot-toast";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    const { data } = await api.post("/auth/logout");

    if (data.success) {
      dispatch(logout());
      navigate("/login");
      toast.success(data.message);
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative transition-all">
      <Link to="/">
        <h1 className="text-2xl font-bold text-indigo-600 cursor-pointer">
          Chat App
        </h1>
      </Link>

      {/* Desktop Menu */}
      <div className="hidden sm:flex items-center gap-8">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? "bg-indigo-500 px-3 py-1 rounded-md transition-all text-white"
              : "nav-link"
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/chat"
          className={({ isActive }) =>
            isActive
              ? "bg-indigo-500 px-3 py-1 rounded-md transition-all text-white"
              : "nav-link"
          }
        >
          Chat
        </NavLink>
      </div>

      <div className="flex items-end gap-5">
        <p>Welcome, {currentUser?.name}!</p>

        <button
          onClick={handleLogout}
          className="cursor-pointer px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
