from sidecar import cli, ingest, rewrite

if __name__ == '__main__':
    parser = cli.get_arg_parser()
    args = parser.parse_args()
    if args.debug:
        print(args)
    if args.command == "ingest":
        ingest.main(args.pdf_directory)
    if args.command == "rewrite":
        rewrite.summarize(args.text)

