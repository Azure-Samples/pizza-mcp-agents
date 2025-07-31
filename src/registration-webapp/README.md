<div align="center">

# Registration Website (Azure Static Web Apps)

[![Open project in GitHub Codespaces](https://img.shields.io/badge/Codespaces-Open-blue?style=flat-square&logo=github)](https://codespaces.new/Azure-Samples/pizza-mcp-agents?hide_repo_select=true&ref=main&quickstart=true)
![Node version](https://img.shields.io/badge/Node.js->=22-3c873a?style=flat-square)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Lit](https://img.shields.io/badge/Lit-3.3-blue?style=flat-square&logo=lit&logoColor=white)](https://lit.dev)

[Overview](#overview) • [Features](#features) • [Development](#development)

</div>

A modern web application that provides user registration and authentication for accessing the Pizza API. Built with [Lit components](https://lit.dev) and [Azure Static Web Apps](https://learn.microsoft.com/azure/static-web-apps/), this application enables users to authenticate through GitHub or Microsoft accounts and obtain unique access tokens.

## Overview

This registration website serves as the authentication gateway for the Pizza API ecosystem. Users can sign in using their preferred identity provider (GitHub or Microsoft) and receive a unique `userId` that grants them access to the Pizza API endpoints.

The application leverages Azure Static Web Apps' built-in authentication features, providing a secure and seamless user experience without requiring complex authentication setup.

<!-- TODO: architecture schema -->

### Components

- **Registration Interface**: Lit-based web components for user authentication and token display
- **Authentication Service**: Azure Static Web Apps built-in authentication with GitHub and Microsoft providers
- **Token Management**: Integration with the Registration API for secure token generation and storage
- **Static Hosting**: Global content delivery through Azure Static Web Apps

## Development

### Prerequisites

- [Node.js](https://nodejs.org) >= 22
- [Azure Static Web Apps CLI](https://learn.microsoft.com/azure/static-web-apps/static-web-apps-cli-overview)
- [Azure Functions Core Tools](https://learn.microsoft.com/azure/azure-functions/functions-run-local)

### Getting started

There are multiple ways to get started with this project.

<details open>
<summary><strong>Use GitHub Codespaces</strong></summary>

The quickest way is to use GitHub Codespaces, which provides a preconfigured development environment:

[![Open in GitHub Codespaces](https://img.shields.io/static/v1?style=for-the-badge&label=GitHub+Codespaces&message=Open&color=blue&logo=github)](https://codespaces.new/Azure-Samples/pizza-mcp-agents?hide_repo_select=true&ref=main&quickstart=true)

</details>

<details>
<summary><strong>Use your local environment</strong></summary>

1. **Fork** the project to create your own copy of this repository
2. Clone your forked repository:
   ```bash
   git clone <your-repo-url>
   cd pizza-mcp-agents/src/registration-webapp
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

</details>

### Run the application

Start the development environment:

```bash
npm start
```

This command will:
- Start the Vite development server for the web application
- Launch the Azure Functions emulator with the Registration API
- Enable the Azure Static Web Apps CLI authentication emulator
- Open the application at `http://localhost:4280`

> [!NOTE]
> The application includes authentication emulation for local development, allowing you to test the full authentication flow without deploying to Azure.

### Available scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the full development environment with SWA authentication emulator |
| `npm run dev` | Start only the Vite development server |
| `npm run build` | Build the application for production |
| `npm run preview` | Preview the production build locally |
| `npm run serve` | Start both the web app and API in development mode |

### Project structure

```
src/
├── components/           # Lit web components
│   ├── auth.ts          # Authentication component
│   └── register.ts      # Registration and token display component
├── auth.service.ts      # Authentication service layer
├── index.ts            # Component exports
└── vite-env.d.ts       # TypeScript environment definitions

public/
└── staticwebapp.config.json  # Azure Static Web Apps configuration

assets/
├── icons/              # UI icons (copy, logout, person, slice)
└── providers/          # Identity provider logos (GitHub, Microsoft)
```

### Component usage

The application provides reusable Lit components for authentication:

```typescript
// Authentication component with multiple providers
<reg-auth type="login"></reg-auth>

// User registration and token display
<register-user></register-user>
```

### Configuration

The application uses environment variables for configuration:

| Variable | Description | Default |
|----------|-------------|---------|
| `REGISTRATION_API_URL` | Registration API base URL | `""` (auto-detected) |

For local development, this doesn't need to be set thanks to Azure Static Web Apps CLI server proxying.
