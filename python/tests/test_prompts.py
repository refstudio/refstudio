from sidecar import prompts


def test_create_prompt_for_summarize():
    expected = "Please rewrite the following text in a more concise manner:\nTEXT: This is a test"
    prompt = prompts.create_prompt_for_summarize("This is a test")
    assert prompt == expected