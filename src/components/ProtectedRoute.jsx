import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import api from "../api/api";
import {
  setAuthenticated,
  setCheckAuthComplete,
  setCurrentUser,
} from "../store/authSlice";
import toast from "react-hot-toast";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await api.get("/auth/verify");
        console.log(data.user);
        if (data.success) {
          dispatch(setAuthenticated());
          dispatch(setCurrentUser(data.user));
        } else {
          toast.error("Login First");
          dispatch(setCheckAuthComplete());
        }
      } catch (error) {
        console.log("Auth verification failed:", error.message);
        dispatch(setCheckAuthComplete());
      }
    };

    checkAuth();
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
