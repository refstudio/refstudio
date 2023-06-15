from sidecar import prompts


def test_create_prompt_for_summarize():
    expected = "Please rewrite the following text in a more concise manner:\nTEXT: This is a test"
    prompt = prompts.create_prompt_for_summarize("This is a test")
    assert prompt == expected


def test_create_prompt_for_chat():
    expected = (
        "Please answer the question based on the context below.\n"
        "CONTEXT:\n"
        "- This is a test\n"
        "- This is another test\n"
        "\nQUESTION: What is this?\n"
        "ANSWER:"
    )
    query = "What is this?"
    context = ["This is a test", "This is another test"]
    prompt = prompts.create_prompt_for_chat(query, context)
    assert prompt == expected