import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router";
import "../auth.form.scss";

const Protected = ({ children }) => {
    const { loading, user } = useAuth();

    if (loading) {
        return (
            <main className="auth-page">
                <div className="auth-loading-spinner">
                    <div className="spinner"></div>
                    <p>Authenticating...</p>
                </div>
            </main>
        );
    }

    if (!user) {
        return <Navigate to={"/login"} />;
    }

    return children;
};

export default Protected;
