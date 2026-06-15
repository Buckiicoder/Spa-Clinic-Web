import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../features/auth/authSlice";

interface Props {
  children: React.ReactNode;
  allowedPositions: string[];
}

export default function RoleRoute({
  children,
  allowedPositions,
}: Props) {
  const user = useSelector(selectUser);

  const position = user?.position;

  if (
    position &&
    !allowedPositions.includes(position)
  ) {
    return <Navigate to="/chamcong" replace />;
  }

  return <>{children}</>;
}