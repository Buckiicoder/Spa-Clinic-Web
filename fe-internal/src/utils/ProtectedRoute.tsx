import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuth, selectUser } from "../features/auth/authSlice";

type Props = {
  children: React.ReactNode;
  allowedPositions?: string[];
};

export default function ProtectedRoute({
  children,
  allowedPositions,
}: Props) {
  const isAuthenticated =
    useSelector(selectAuth);

  const user = useSelector(selectUser);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (
    allowedPositions &&
    !allowedPositions.includes(user?.position)
  ) {
    return <Navigate to="/chamcong" replace />;
  }

  return <>{children}</>;
}