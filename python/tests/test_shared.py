from sidecar import shared


def test_get_word_count():
    assert shared.get_word_count("Hello World") == 2
