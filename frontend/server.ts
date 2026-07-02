import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Endpoint to generate a professional email draft or response using Gemini
app.post("/api/draft", async (req, res) => {
  try {
    const { prompt, contextText } = req.body;
    if (!prompt) {
       res.status(400).json({ error: "Prompt is required" });
       return;
    }

    const ai = getAIClient();
    const systemInstruction = 
      "You are a premium AI sales assistant for Aether Mail, an intelligent CRM and email system. " +
      "Your task is to write a highly professional, polished, persuasive, and contextual email or reply. " +
      "Use clean, professional typography spacing. Keep the tone confident, humble, and concise. " +
      "Avoid sales-pitch clichés or aggressive marketing jargon.";

    const contents = contextText 
      ? `Draft an email response based on this context:\n---\n${contextText}\n---\nUser instruction: ${prompt}`
      : `Draft an email from scratch based on this instruction: ${prompt}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ draft: response.text });
  } catch (error: any) {
    console.error("Error generating draft:", error);
    res.status(500).json({ 
      error: error.message || "Failed to generate email draft.",
      details: "Please ensure GEMINI_API_KEY is configured correctly in Secrets."
    });
  }
});

// 2. Endpoint to analyze an email body and generate intelligent metadata (Summary, scores, suggestions)
app.post("/api/analyze-email", async (req, res) => {
  try {
    const { emailBody, subject, sender } = req.body;
    if (!emailBody) {
       res.status(400).json({ error: "Email body is required" });
       return;
    }

    const ai = getAIClient();
    const systemInstruction = 
      "Analyze the email body, subject, and sender to extract insights. You must respond in a strict JSON structure matching the specified schema.";

    const prompt = `Sender: ${sender || "Unknown"}\nSubject: ${subject || "No Subject"}\nBody:\n${emailBody}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A one-sentence executive summary of the email, written in professional italicized style, maximum 25 words.",
            },
            engagement: {
              type: Type.INTEGER,
              description: "An engagement score from 0 to 100 based on the interaction level or urgency.",
            },
            intent: {
              type: Type.INTEGER,
              description: "An intent-to-buy or interest score from 0 to 100 based on the text.",
            },
            sentiment: {
              type: Type.INTEGER,
              description: "A sentiment score from 0 to 100, where higher is more positive.",
            },
            recommendedNudge: {
              type: Type.STRING,
              description: "A short recommended sales nudge, e.g. 'Suggest sending the Security Whitepaper' or 'Offer a 15-min call'.",
            },
            suggestedResponses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: {
                    type: Type.STRING,
                    description: "Short uppercase label for the action, e.g., 'CONFIRM MEETING', 'EXPLAIN PRICING TIER'.",
                  },
                  previewText: {
                    type: Type.STRING,
                    description: "First sentence or summary of the proposed response.",
                  },
                  fullText: {
                    type: Type.STRING,
                    description: "The full, professionally drafted response email text.",
                  },
                },
                required: ["label", "previewText", "fullText"],
              },
              description: "Two options for intelligent quick reply templates.",
            },
          },
          required: [
            "summary",
            "engagement",
            "intent",
            "sentiment",
            "recommendedNudge",
            "suggestedResponses",
          ],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error analyzing email:", error);
    res.status(500).json({ 
      error: error.message || "Failed to analyze email.",
      details: "Please ensure GEMINI_API_KEY is configured correctly in Secrets."
    });
  }
});

// Gmail Integration Helper Functions
function getBodyText(payload: any): string {
  if (!payload) return "";
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    const base64 = payload.body.data.replace(/-/g, "+").replace(/_/g, "/");
    return Buffer.from(base64, "base64").toString("utf-8");
  }
  if (payload.mimeType === "text/html" && payload.body?.data) {
    const base64 = payload.body.data.replace(/-/g, "+").replace(/_/g, "/");
    const html = Buffer.from(base64, "base64").toString("utf-8");
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
               .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
               .replace(/<[^>]*>/g, " ")
               .replace(/\s+/g, " ")
               .trim();
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      const text = getBodyText(part);
      if (text) return text;
    }
  }
  return "";
}

async function getValidAccessToken(): Promise<{ token: string; email: string } | null> {
  const tokenPath = path.join(process.cwd(), "gmail-token.json");
  try {
    if (!fs.existsSync(tokenPath)) {
      return null;
    }
    const raw = fs.readFileSync(tokenPath, "utf-8");
    const tokenData = JSON.parse(raw);
    
    // Check if expired
    if (Date.now() >= (tokenData.expiry_date || 0)) {
      if (!tokenData.refresh_token) {
        return null;
      }
      
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      if (!clientId || !clientSecret) {
        console.warn("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing on token refresh");
        return null;
      }
      
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: tokenData.refresh_token,
          grant_type: "refresh_token"
        }).toString()
      });
      
      if (!response.ok) {
        console.error("Failed to refresh Google token:", await response.text());
        return null;
      }
      
      const refreshed = (await response.json()) as any;
      const updatedData = {
        ...tokenData,
        access_token: refreshed.access_token,
        expiry_date: Date.now() + (refreshed.expires_in * 1000)
      };
      
      fs.writeFileSync(tokenPath, JSON.stringify(updatedData, null, 2), "utf-8");
      return { token: refreshed.access_token, email: tokenData.email };
    }
    
    return { token: tokenData.access_token, email: tokenData.email };
  } catch (error) {
    console.error("Error reading or refreshing Gmail token:", error);
    return null;
  }
}

// Gmail Integration Endpoints
app.get("/api/gmail/auth-status", async (req, res) => {
  const authInfo = await getValidAccessToken();
  if (authInfo) {
    res.json({ connected: true, email: authInfo.email });
  } else {
    res.json({ connected: false, email: null });
  }
});

app.get("/api/gmail/login", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    res.status(400).json({ error: "GOOGLE_CLIENT_ID is not configured in Secrets. Please define it in your AI Studio secrets settings." });
    return;
  }
  
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const redirectUri = `${appUrl.replace(/\/$/, "")}/api/gmail/callback`;
  
  const scopes = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/contacts.readonly"
  ];
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes.join(" "),
    access_type: "offline",
    prompt: "consent",
    state: "gmail_sync_state"
  });
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({ url: authUrl });
});

app.get("/api/gmail/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) {
    res.status(400).send("Authorization code is missing.");
    return;
  }
  
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    res.status(400).send("Google OAuth credentials are not configured in Secrets.");
    return;
  }
  
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const redirectUri = `${appUrl.replace(/\/$/, "")}/api/gmail/callback`;
  
  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        code: code.toString(),
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      }).toString()
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Google token exchange failed: ${errorText}`);
    }
    
    const tokenData = (await tokenResponse.json()) as any;
    
    // Fetch connected user's email profile
    let email = "unknown@gmail.com";
    try {
      const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`
        }
      });
      if (userinfoRes.ok) {
        const userinfo = (await userinfoRes.json()) as any;
        email = userinfo.email || email;
      }
    } catch (err) {
      console.error("Failed to fetch userinfo:", err);
    }
    
    const dataToStore = {
      ...tokenData,
      email,
      expiry_date: Date.now() + (tokenData.expires_in * 1000)
    };
    
    fs.writeFileSync(
      path.join(process.cwd(), "gmail-token.json"),
      JSON.stringify(dataToStore, null, 2),
      "utf-8"
    );
    
    res.send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #060c18; color: #f1f5f9; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 80vh; margin: 0;">
          <div style="background: #0b1424; border: 1px solid #2036bd; padding: 30px; border-radius: 16px; max-width: 400px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);">
            <div style="width: 48px; height: 48px; background: rgba(32, 54, 189, 0.2); border: 1px solid rgba(32, 54, 189, 0.4); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; color: #405bf5; font-size: 24px; margin-bottom: 16px;">✓</div>
            <h2 style="color: #ffffff; margin: 0 0 8px 0; font-size: 20px;">Gmail Connected!</h2>
            <p style="color: #7184a3; font-size: 13px; margin: 0 0 20px 0; line-height: 1.5;">Successfully handshaked and stored the secure access token for <strong>${email}</strong>.</p>
            <p style="font-size: 11px; color: #435470; font-family: monospace; margin: 0;">[ This window will close automatically ]</p>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'GMAIL_AUTH_SUCCESS', email: '${email}' }, '*');
              setTimeout(() => {
                window.close();
              }, 1000);
            } else {
              setTimeout(() => {
                window.location.href = '/';
              }, 1500);
            }
          </script>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error("Error during callback:", error);
    res.status(500).send(`Authentication failed: ${error.message}`);
  }
});

app.post("/api/gmail/disconnect", (req, res) => {
  const tokenPath = path.join(process.cwd(), "gmail-token.json");
  try {
    if (fs.existsSync(tokenPath)) {
      fs.unlinkSync(tokenPath);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/gmail/recent", async (req, res) => {
  const authInfo = await getValidAccessToken();
  if (!authInfo) {
    res.status(401).json({ error: "Gmail account is not connected." });
    return;
  }
  
  try {
    const listRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10", {
      headers: {
        Authorization: `Bearer ${authInfo.token}`
      }
    });
    
    if (!listRes.ok) {
      throw new Error(`Gmail API messages list failed: ${await listRes.text()}`);
    }
    
    const listData = (await listRes.json()) as any;
    const messages = listData.messages || [];
    
    const details = await Promise.all(
      messages.map(async (msg: any) => {
        try {
          const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
            headers: {
              Authorization: `Bearer ${authInfo.token}`
            }
          });
          if (!msgRes.ok) return null;
          return await msgRes.json();
        } catch (err) {
          console.error(`Failed to fetch message details for ${msg.id}:`, err);
          return null;
        }
      })
    );
    
    const validDetails = details.filter(d => d !== null);
    
    const mappedEmails = validDetails.map((msg: any) => {
      const headers = msg.payload?.headers || [];
      const fromVal = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || 'Unknown Sender';
      const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || 'No Subject';
      const dateVal = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || '';
      
      const match = fromVal.match(/^(.*?)\s*<(.*?)>$/);
      let sender = fromVal;
      let senderEmail = fromVal;
      if (match) {
        sender = match[1].replace(/^["']|["']$/g, '').trim() || match[2];
        senderEmail = match[2].trim();
      }
      
      const body = getBodyText(msg.payload) || "No message body text content found.";
      
      let dateText = dateVal;
      try {
        const d = new Date(dateVal);
        if (!isNaN(d.getTime())) {
          const now = new Date();
          if (d.toDateString() === now.toDateString()) {
            dateText = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } else {
            dateText = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
          }
        }
      } catch (_) {}
      
      return {
        id: msg.id,
        sender,
        senderEmail,
        senderAvatar: sender.charAt(0).toUpperCase(),
        subject,
        time: dateText,
        date: dateText,
        body,
        unread: msg.labelIds?.includes("UNREAD") || false,
        isRead: !msg.labelIds?.includes("UNREAD"),
        isClicked: false,
        clickCount: 0,
        score: "Pending AI",
        aiSummary: "(Trigger Gemini Analysis to summarize this email)",
        category: "inbox" as const,
        engagement: Math.floor(Math.random() * 20) + 40,
        intent: Math.floor(Math.random() * 20) + 30,
        sentiment: 50,
        summary: "",
        recommendedNudge: "",
        suggestedResponses: [],
        threadHistory: []
      };
    });
    
    res.json({
      status: "success",
      email: authInfo.email,
      emails: mappedEmails
    });
  } catch (error: any) {
    console.error("Error fetching recent Gmail emails:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/gmail/send", async (req, res) => {
  const authInfo = await getValidAccessToken();
  if (!authInfo) {
    res.status(401).json({ error: "Gmail account is not connected." });
    return;
  }
  
  const { to, subject, body } = req.body;
  if (!to || !subject || !body) {
    res.status(400).json({ error: "to, subject, and body are required." });
    return;
  }
  
  try {
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
    const messageParts = [
      `To: ${to}`,
      "Content-Type: text/plain; charset=utf-8",
      "MIME-Version: 1.0",
      `Subject: ${utf8Subject}`,
      "",
      body
    ];
    const mimeMessage = messageParts.join("\n");
    const raw = Buffer.from(mimeMessage)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
      
    const sendRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authInfo.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ raw })
    });
    
    if (!sendRes.ok) {
      throw new Error(`Gmail API send failed: ${await sendRes.text()}`);
    }
    
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error sending Gmail:", error);
    res.status(500).json({ error: error.message });
  }
});

// Google Calendar API integration
app.get("/api/gmail/calendar", async (req, res) => {
  const authInfo = await getValidAccessToken();
  if (!authInfo) {
    res.status(401).json({ error: "Google account is not connected." });
    return;
  }
  
  try {
    // Fetch events from today onwards
    const nowISO = new Date().toISOString();
    const calendarRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(nowISO)}&maxResults=40&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${authInfo.token}`
        }
      }
    );
    
    if (!calendarRes.ok) {
      throw new Error(`Google Calendar API call failed: ${await calendarRes.text()}`);
    }
    
    const data = (await calendarRes.json()) as any;
    const items = data.items || [];
    
    // Map items to standard applet format
    const events = items.map((item: any) => {
      const startDateTime = item.start?.dateTime || item.start?.date || "";
      const endDateTime = item.end?.dateTime || item.end?.date || "";
      
      let timeText = "All Day";
      if (item.start?.dateTime) {
        const d = new Date(item.start.dateTime);
        timeText = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      return {
        id: item.id,
        title: item.summary || "No Title",
        time: timeText,
        startISO: startDateTime,
        endISO: endDateTime,
        type: item.summary?.toLowerCase().includes("ai") || item.summary?.toLowerCase().includes("score") ? "tertiary" : "primary"
      };
    });
    
    res.json({
      status: "success",
      email: authInfo.email,
      events
    });
  } catch (error: any) {
    console.error("Failed to fetch Google Calendar:", error);
    res.status(500).json({ error: error.message });
  }
});

// Google Contacts API integration
app.get("/api/gmail/contacts", async (req, res) => {
  const authInfo = await getValidAccessToken();
  if (!authInfo) {
    res.status(401).json({ error: "Google account is not connected." });
    return;
  }
  
  try {
    const peopleRes = await fetch(
      "https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,organizations,photos&pageSize=50",
      {
        headers: {
          Authorization: `Bearer ${authInfo.token}`
        }
      }
    );
    
    if (!peopleRes.ok) {
      // If People API is not enabled or fails, fallback cleanly
      throw new Error(`Google People API call failed: ${await peopleRes.text()}`);
    }
    
    const data = (await peopleRes.json()) as any;
    const connections = data.connections || [];
    
    const contacts = connections.map((person: any, idx: number) => {
      const nameObj = person.names?.[0] || {};
      const displayName = nameObj.displayName || "Unknown Contact";
      const emailObj = person.emailAddresses?.[0] || {};
      const email = emailObj.value || "no-email@gmail.com";
      const orgObj = person.organizations?.[0] || {};
      const company = orgObj.name || "External Account";
      const role = orgObj.title || "Professional Contact";
      
      const initials = displayName
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "UN";
        
      return {
        id: person.resourceName || `google-contact-${idx}`,
        name: displayName,
        company,
        role,
        score: Math.floor(Math.random() * 15) + 85, // CRM Priority Score
        engagement: Math.floor(Math.random() * 3) + 2,
        avatar: initials,
        aiNudge: `Sync complete. ${displayName} is imported from your Google Contacts.`,
        lastInteraction: "Synced from Google Contacts",
        senderEmail: email
      };
    });
    
    res.json({
      status: "success",
      email: authInfo.email,
      contacts
    });
  } catch (error: any) {
    console.error("Failed to fetch Google Contacts:", error);
    res.status(500).json({ error: error.message });
  }
});

// Integrate Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
