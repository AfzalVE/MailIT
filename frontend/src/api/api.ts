const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

const TOKEN_KEY = "replyiq_token";

class ApiClient {
  private get token() {
    return localStorage.getItem(TOKEN_KEY);
  }

  private get headers(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ) {
    const url = `${API_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        ...this.headers,
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      let message = "Something went wrong";

      try {
        const error = await response.json();
        message = error.detail || message;
      } catch {}

      throw new Error(message);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  // ===========================
  // Authentication
  // ===========================

  login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    });
  }

  register(name: string, email: string, password: string) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
  }

  // ===========================
  // Google OAuth
  // ===========================

  loginWithGoogle() {
    window.location.href = `${API_URL}/gmail/login`;
  }
authStatus() {
  return this.request("/gmail/auth-status");
}
  // ===========================
  // Gmail
  // ===========================

  getRecentEmails() {
    return this.request("/gmail/recent");
  }

  getProfile() {
    return this.request("/gmail/profile");
  }

  disconnectGoogle() {
    return this.request("/gmail/logout", {
      method: "POST",
    });
  }

  sendEmail(to: string, subject: string, body: string) {
    return this.request("/gmail/send", {
      method: "POST",
      body: JSON.stringify({
        to,
        subject,
        body,
      }),
    });
  }

  // ===========================
  // Email Intelligence
  // ===========================

  analyzeEmail(sender: string, subject: string, email: string) {
    return this.request("/email/analyze", {
      method: "POST",
      body: JSON.stringify({
        sender,
        subject,
        email,
      }),
    });
  }

  history() {
    return this.request("/email/history");
  }

  leads() {
    return this.request("/email/leads");
  }

  hotLeads() {
    return this.request("/email/leads/hot");
  }

  warmLeads() {
    return this.request("/email/leads/warm");
  }

  coldLeads() {
    return this.request("/email/leads/cold");
  }
}

export const api = new ApiClient();