import api from "../../../services/api.client";

export async function register({ username, email, password }) {
    try {
        const response = await api.post("/api/auth/register", {
            username,
            email,
            password,
        });
        return response.data;
    } catch (err) {
        const message =
            err.response?.data?.message || err.message || "Registration failed";
        throw new Error(message);
    }
}

export async function login({ email, password }) {
    try {
        const response = await api.post("/api/auth/login", {
            email,
            password,
        });
        return response.data;
    } catch (err) {
        const message =
            err.response?.data?.message || err.message || "Login failed";
        throw new Error(message);
    }
}

export async function logout() {
    try {
        const response = await api.post("/api/auth/logout");
        return response.data;
    } catch (err) {
        console.error("Logout error:", err);
    }
}

export async function getMe() {
    try {
        const response = await api.get("/api/auth/get-me");
        return response.data;
    } catch {
        // Return null if not logged in
        return null;
    }
}
