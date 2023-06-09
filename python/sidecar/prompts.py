def create_prompt_for_summarize(text: str) -> str:
    prompt = f"Please rewrite the following text in a more concise manner:\nTEXT: {text}"
    return prompt
