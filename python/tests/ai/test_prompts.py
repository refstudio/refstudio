from sidecar.ai import prompts
from sidecar.ai.schemas import RewriteMannerType, TextCompletionRequest
from sidecar.references.schemas import Chunk


def test_create_prompt_for_rewrite():
    manner = RewriteMannerType.CONCISE
    expected = (
        "Please rewrite the following text in a more concise manner. Do not make up facts.\n"  # noqa: E501
        "TEXT: This is a test"
    )
    prompt = prompts.create_prompt_for_rewrite("This is a test", manner)
    assert prompt == expected

    manner = RewriteMannerType.ELABORATE
    expected = (
        "Please rewrite the following text in a more elaborate manner. Do not make up facts.\n"  # noqa: E501
        "TEXT: This is a test"
    )
    prompt = prompts.create_prompt_for_rewrite("This is a test", manner)
    assert prompt == expected


def test_create_prompt_for_text_completion():
    # test 1: no metadata
    test_request = TextCompletionRequest(text="This is a test")
    expected = (
        "I am a researcher at a university. "
        "You are my research assistant. "
        "I am writing a document. \n"
        "Please help me complete the portion of text input below. "
        "Use complete sentences and proper grammer. \n"
        "INPUT: This is a test [MASK]"
    )
    result = prompts.create_prompt_for_text_completion(test_request)
    assert result == expected

    # test 2: with title
    test_request = TextCompletionRequest(text="This is a test", title="test")
    expected = (
        "I am a researcher at a university. "
        "You are my research assistant. "
        "I am writing a document. \n"
        'TITLE: "test" \n'
        "Please help me complete the portion of text input below. "
        "Use complete sentences and proper grammer. \n"
        "INPUT: This is a test [MASK]"
    )
    result = prompts.create_prompt_for_text_completion(test_request)
    assert result == expected

    # test 3: with abstract
    test_request = TextCompletionRequest(
        text="This is a test", abstract="A paper about tests"
    )
    expected = (
        "I am a researcher at a university. "
        "You are my research assistant. "
        "I am writing a document. \n"
        'ABSTRACT: "A paper about tests" \n'
        "Please help me complete the portion of text input below. "
        "Use complete sentences and proper grammer. \n"
        "INPUT: This is a test [MASK]"
    )
    result = prompts.create_prompt_for_text_completion(test_request)
    assert result == expected


def test_prepare_chunks_for_prompt():
    chunks = [
        Chunk(
            text="This is a test",
            metadata={"source_filename": "test.pdf", "page_num": 1},
        ),
        Chunk(
            text="This is another test",
            metadata={"source_filename": "test.pdf", "page_num": 2},
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
        "Source: world-capitals.pdf, p1 - The capital of the United States is Washington, D.C.\n"  # noqa: E501
        "Source: world-capitals.pdf, p2 - Rome is the capital of Italy.\n"
        "Question: What is the capital of the United States?\n"
        "Answer: The capital of the United States is Washington, D.C. (world-capitals.pdf, p1)"  # noqa: E501
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
