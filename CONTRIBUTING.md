# Contributing to Work Timer

Thank you for considering contributing to Work Timer! This document outlines the process for contributing to this project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please create an issue with the following information:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Your operating system and application version

### Suggesting Enhancements

We welcome enhancement suggestions! Please create an issue with:
- A clear, descriptive title
- A detailed description of the proposed enhancement
- Any relevant mockups or examples

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Commit with clear, descriptive messages
5. Push to your branch (`git push origin feature/your-feature-name`)
6. Create a Pull Request

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

## Building and Testing

- Build for all platforms: `npm run make`
- Build for specific platforms:
  - Windows: `npm run make-win`
  - macOS: `npm run make-mac`
  - Linux: `npm run make-linux`

## Style Guidelines

Please follow the existing code style in the project.

## Release Process

Releases are managed via GitHub Actions and automatically triggered when pushing a tag:

```bash
git tag v1.0.1
git push origin v1.0.1
```

This will trigger the release workflow for all platforms.

## Questions?

If you have any questions, feel free to open an issue for discussion.

Thank you for contributing to Work Timer!
