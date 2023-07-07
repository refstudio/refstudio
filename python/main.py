import json

from sidecar import chat, cli, ingest, rewrite, storage, search

if __name__ == '__main__':
    parser = cli.get_arg_parser()
    args = parser.parse_args()

    if args.debug:
        print(args)
    
    if args.command == "ingest":
        ingest.run_ingest(args.pdf_directory)
    
    if args.command == "ingest_status":
        ingest.get_statuses()

    if args.command == "ingest_references":
        ingest.get_references(args.pdf_directory)

    if args.command == "rewrite":
        rewrite.summarize(args.text)
    
    if args.command == "chat":
        chat.ask_question(args.text)
    
    if args.command == "search":
        search.search(query=args.query, limit=args.limit)
    
    if args.command == "update":
        data = json.loads(args.data)
        storage.update_reference(data)

    if args.command == "delete":
        if args.all:
            storage.delete_references(all_=args.all)
        else:
            storage.delete_references(source_filenames=args.source_filenames)
        