# Contributing

When contributing to this repository, please first discuss the change you wish to make via [issue](https://github.com/refstudio/refstudio/issues), or any other method with the owners of this repository before making a change.


## Our code style

There is an _eslint_, _prettier_ and _python_ config that ensures a consistent code style. We also have auto-save and format on save configured for VS Code. To check for errors, run `$ yarn *:check`. That’ll be checked when you push using a git hook, too. Make sure it’s passing, before sending a pull request.

## Branching guidelines

We don't have a strict rule for branch name guidelines. You should try to name your branch using _kebab-case_ with the name of the feature/issue your are working on (eg: `adopt-jotai`). You can also prefix your branch name with the issue number if you are [creating the branch from issues in GitHub](https://docs.github.com/en/issues/tracking-your-work-with-issues/creating-a-branch-for-an-issue).


## Pull Request Process

Please try to keep your pull request focused in scope and avoid including unrelated commits.

We adopted the [Squash and merge](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/about-pull-request-merges#squash-and-merge-your-commits) convention to give a nice, clean, linear history on main which makes it easier to bisect and track changes.

Thank you for contributing!
