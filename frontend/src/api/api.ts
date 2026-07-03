const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

const TOKEN_KEY = "replyiq_token";

class ApiClient {
  // ==================================================
  // Token Management
  // ==================================================

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  // ==================================================
  // Internal Helpers
  // ==================================================

  private get headers(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const token = this.getToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private async request(
    endpoint: string,
    options: RequestInit = {},
  ) {
    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,
        credentials: "include",
        headers: {
          ...this.headers,
          ...(options.headers ?? {}),
        },
      },
    );

    if (!response.ok) {
      let message = "Something went wrong";

      try {
        const error = await response.json();
        message = error.detail ?? message;
      } catch {}

      throw new Error(message);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  // ==================================================
  // Authentication
  // ==================================================
// ==================================================
// Authentication
// ==================================================

async login(
    email: string,
    password: string,
) {
    const response = await this.request(
        "/auth/login",
        {
            method: "POST",
            body: JSON.stringify({
                email,
                password,
            }),
        },
    );

    console.log("Login Response:", response);

    const token =
        response?.token?.access_token ??
        response?.access_token ??
        response?.token;

    if (!token) {
        throw new Error("JWT token was not returned by backend.");
    }

    this.setToken(token);

    return response;
}

async register(
  name: string,
  email: string,
  password: string,
) {
  const response = await this.request(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    },
  );

  const token =
        response?.token?.access_token ??
        response?.access_token ??
        response?.token;

    if (!token) {
        throw new Error("JWT token was not returned by backend.");
    }

    this.setToken(token);


  return response;
}

logout() {
  this.clearToken();
}


  // ==================================================
  // Google OAuth
  // ==================================================

async connectGoogle() {
    const token = this.getToken();

    if (!token) {
        throw new Error("Please login first.");
    }

    console.log("JWT:", token);

    const response = await fetch(
        `${API_URL}/oauth/google/connect`,
        {
            method: "POST",
            credentials: "include",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        },
    );

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Unable to connect Google.");
    }

    const data = await response.json();

    window.location.href = data.authorization_url;
}

  googleStatus() {
    return this.request(
      "/oauth/google/status",
    );
  }

  disconnectGoogle() {
    return this.request(
      "/oauth/google",
      {
        method: "DELETE",
      },
    );
  }

  // ==================================================
  // Gmail
  // ==================================================

  getGmailProfile() {
    return this.request(
      "/gmail/profile",
    );
  }

  getRecentEmails() {
    return this.request(
      "/gmail/recent",
    );
  }

  // ==================================================
  // Email Intelligence
  // ==================================================

  analyzeEmail(
    sender: string,
    subject: string,
    email: string,
  ) {
    return this.request(
      "/email/analyze",
      {
        method: "POST",
        body: JSON.stringify({
          sender,
          subject,
          email,
        }),
      },
    );
  }

  history() {
    return this.request(
      "/email/history",
    );
  }

  leads() {
    return this.request(
      "/email/leads",
    );
  }

  hotLeads() {
    return this.request(
      "/email/leads/hot",
    );
  }

  warmLeads() {
    return this.request(
      "/email/leads/warm",
    );
  }

  coldLeads() {
    return this.request(
      "/email/leads/cold",
    );
  }
}

export const api = new ApiClient();