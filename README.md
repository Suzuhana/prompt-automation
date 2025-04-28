# <img src="docs/imgs/cat_roll.gif" alt="cat-roll" width="50" /> Prompt Automation <img src="docs/imgs/cat_roll.gif" alt="cat-roll" width="50" />

An Electron application to facilitate prompt creation work when working with Code Repos

## Motivation

I’ve been using [Repo Prompt](https://repoprompt.com/) extensively and really appreciate its features, but it doesn’t support Windows. I also find that I only need a small subset of its functionality—loading a repository directory, selecting context files, and generating prompts—while the LLM API integrations for chat and automated file modifications aren’t part of my workflow. To address this, I decided to build a streamlined application that works seamlessly on both macOS and Windows and focuses on these core tasks. Of course, this is just the starting point, and I may add additional features beyond the initial scope down the road.

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```
