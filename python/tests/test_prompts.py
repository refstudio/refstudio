from sidecar import prompts
from sidecar.typing import Chunk


def test_create_prompt_for_summarize():
    expected = "Please rewrite the following text in a more concise manner:\nTEXT: This is a test"
    prompt = prompts.create_prompt_for_summarize("This is a test")
    assert prompt == expected


def test_prepare_chunks_for_prompt():
    chunks = [
        Chunk(
            text="This is a test",
            metadata={"source_filename": "test.pdf", "page_num": 1}
        ),
        Chunk(
            text="This is another test",
            metadata={"source_filename": "test.pdf", "page_num": 2}
        ),
    ]
    expected = (
        "\nSource: test.pdf, p1 - This is a test\n"
        "\nSource: test.pdf, p2 - This is another test\n"
    )
    context_str = prompts.prepare_chunks_for_prompt(chunks)
    assert context_str == expected


def test_create_prompt_for_chat():
    expected = (
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
        "\nSource: test.pdf, p1 - This is a test\n"
        "\nSource: test.pdf, p2 - This is another test\n"
        "\n---------\n"
        "\nQuestion: What is this?\n"
        "Answer: "
    )
    query = "What is this?"
    context_str = (
        "\nSource: test.pdf, p1 - This is a test\n"
        "\nSource: test.pdf, p2 - This is another test\n"
    )
    prompt = prompts.create_prompt_for_chat(query, context_str)
    assert prompt == expected