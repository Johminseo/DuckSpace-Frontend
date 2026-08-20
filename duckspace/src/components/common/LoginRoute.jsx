import { Navigate } from "react-router-dom";

function LoginRoute({ children }) {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default LoginRoute;