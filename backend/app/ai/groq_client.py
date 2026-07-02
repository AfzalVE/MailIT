import json

from groq import Groq

from app.ai.prompt_builder import EMAIL_ANALYZER_PROMPT
from app.core.config import settings

client = Groq(
    api_key=settings.GROQ_API_KEY
)


class GroqClient:

    MODEL = "llama-3.3-70b-versatile"

    @staticmethod
    def analyze_email(email: str) -> dict:

        completion = client.chat.completions.create(
            model=GroqClient.MODEL,
            messages=[
                {
                    "role": "system",
                    "content": EMAIL_ANALYZER_PROMPT,
                },
                {
                    "role": "user",
                    "content": email,
                },
            ],
            temperature=0.3,
            response_format={"type": "json_object"},
        )

        return json.loads(
            completion.choices[0].message.content
        )


groq_client = GroqClient()