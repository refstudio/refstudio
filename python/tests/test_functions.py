from python.sidecar import functions


def test_get_word_count():
    assert functions.get_word_count("Hello World") == 2
