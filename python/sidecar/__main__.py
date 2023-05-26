from argparse import ArgumentParser
import json
import sys

from .functions import get_word_count


def main(text: str):
    try:
        data = {"num_words": get_word_count(text)}
        print(json.dumps(data))
    except:
        print("Error processing text", file=sys.stderr)


if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument("--text", type=str)
    args = parser.parse_args()

    main(text=args.text)
