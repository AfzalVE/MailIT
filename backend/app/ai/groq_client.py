import json

from groq import Groq

from app.core.config import settings


client = Groq(
    api_key=settings.GROQ_API_KEY,
)


class GroqClient:

    MODEL = "llama-3.1-8b-instant"

    @classmethod
    def generate_json(
        cls,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.2,
    ) -> dict:

        completion = client.chat.completions.create(
            model=cls.MODEL,
            temperature=temperature,
            response_format={
                "type": "json_object",
            },
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
        )

        return json.loads(
            completion.choices[0].message.content
        )

    @classmethod
    def generate_text(
        cls,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.4,
    ) -> str:

        completion = client.chat.completions.create(
            model=cls.MODEL,
            temperature=temperature,
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
        )

        return completion.choices[0].message.content


groq_client = GroqClient()