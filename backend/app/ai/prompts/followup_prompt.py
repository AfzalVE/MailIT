FOLLOWUP_PROMPT = """
Determine if a follow up reminder should be created.

Return JSON.

{
    "needs_followup":true,
    "followup_date":"",
    "reason":""
}
"""