from sidecar import chat, cli, ingest, rewrite, storage

if __name__ == '__main__':
    parser = cli.get_arg_parser()
    args = parser.parse_args()
    if args.debug:
        print(args)
    if args.command == "ingest":
        ingest.main(args.pdf_directory)
    if args.command == "rewrite":
        rewrite.summarize(args.text)
    if args.command == "chat":
        chat.ask_question(args.text)
    if args.command == "update":
        storage.update_reference(args.data)

