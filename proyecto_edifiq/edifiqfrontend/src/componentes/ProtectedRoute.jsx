import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const authUser = localStorage.getItem("authUser");
  if (!authUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default ProtectedRoute;