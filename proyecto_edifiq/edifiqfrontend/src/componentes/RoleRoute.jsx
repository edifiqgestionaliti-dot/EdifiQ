import { Navigate } from "react-router-dom";

export default function RoleRoute({ role, children }) {
	const raw = localStorage.getItem("authUser");

	if (!raw) {
		return <Navigate to="/login" replace />;
	}

	let user;

	try {
		user = JSON.parse(raw);
	} catch {
		return <Navigate to="/login" replace />;
	}

	return user.rol?.nombre?.toLowerCase() === role.toLowerCase() ? (
		children
	) : (
		<Navigate to="/" replace />
	);
}
