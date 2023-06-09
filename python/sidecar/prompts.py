def create_prompt_for_summarize(text: str) -> str:
    prompt = f"Please rewrite the following text in a more concise manner:\nTEXT: {text}"
    return prompt

def create_prompt_for_chat(query: str, context: list[str]) -> str:
    context = "\n".join([f"- {c}" for c in context])
    prompt = (
        f"Please answer the question based on the context below.\n"
        f"CONTEXT:\n{context}\n"
        f"\nQUESTION: {query}\n"
        "ANSWER:"
    )
    return prompt
