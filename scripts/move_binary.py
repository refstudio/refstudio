import subprocess


def get_target():
    output = subprocess.run(["rustc", "-Vv"], capture_output=True)
    for line in output.stdout.decode("utf-8").split("\n"):
        if "host" in line:
            host = line.split(" ")[1]
            break
    return host


def rename_binary(target):
    subprocess.run([
        "mv",
        "src-tauri/bin/python/main",
        f"src-tauri/bin/python/main-{target}"
    ])


def main():
    target = get_target()
    rename_binary(target)


if __name__ == '__main__':
    main()