import json
import sys

from main import get_arg_parser
from sidecar.typing import CliCommands

if __name__ == '__main__':
    parser = get_arg_parser()
    json.dump(CliCommands.json_schema(), sys.stdout, indent=2)
