const API_CONFIG = {
    //BASE_URL: "http://localhost/lab11/mycampus-cafe-slim-api/public/api"
    BASE_URL: "https://mycampuscafe-jingwen.infinityfreeapp.com/api"
};

function getToken() {
    return localStorage.getItem("mycampus_token");
}

function setToken(token) {
    localStorage.setItem("mycampus_token", token);
}

function clearToken() {
    localStorage.removeItem("mycampus_token");
}

function publicHeaders() {
    return {
        "Content-Type": "application/json"
    };
}

function authHeaders() {
    const headers = publicHeaders();
    const token = getToken();

    if (token) {
        headers.Authorization = "Bearer " + token;
    }

    return headers;
}

async function readJson(response) {
    const text = await response.text();

    if (!text) {
        return {};
    }

    try {
        return JSON.parse(text);
    } catch (error) {
        return {
            message: text
        };
    }
}

function handleApiError(response, result = {}) {
    if (response.status === 401) {
        return "Unauthorized access. Please log in again.";
    }

    if (response.status === 403) {
        return "You are not allowed to perform this operation.";
    }

    if (response.status === 404) {
        return "The requested record was not found.";
    }

    if (response.status >= 500) {
        return "Server error. Check Apache, MySQL and the backend configuration.";
    }

    return result.message || "An unexpected error occurred.";
}
