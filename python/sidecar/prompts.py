from sidecar.typing import Chunk


def create_prompt_for_summarize(text: str) -> str:
    prompt = f"Please rewrite the following text in a more concise manner:\nTEXT: {text}"
    return prompt


def prepare_chunks_for_prompt(chunks: list[Chunk]) -> str:
    text = ""
    for chunk in chunks:
        source_str = f"\nSource: {chunk.metadata['source_filename']}, p{chunk.metadata['page_num']}"
        text += f"{source_str} - {chunk.text}\n"
    return text


def create_prompt_for_chat(query: str, context: str) -> str:
    prompt = (
        "Please answer the question below based solely on the provided sources. "
        "When referencing information from one of the provided sources, "
        "cite the appropriate source(s) using its filename and page number. "
        "Every answer should include at least one citation. "
        "If none of the sources are relevant to the question, "
        "you should indicate that you are unable to answer "
        "the question with the sources that have been provided.\n"
        "When answering, please use complete sentences and proper grammar.\n"
        "For example:\n"
        "Source: world-capitals.pdf, p1 - The capital of the United States is Washington, D.C.\n"
        "Source: world-capitals.pdf, p2 - Rome is the capital of Italy.\n"
        "Question: What is the capital of the United States?\n"
        "Answer: The capital of the United States is Washington, D.C. (world-capitals.pdf, p1)"
        "\n---------\n"
        f"{context}"
        "\n---------\n"
        f"\nQuestion: {query}\n"
        "Answer: "
    )
    return prompt
