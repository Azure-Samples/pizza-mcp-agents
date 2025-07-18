<div align="center">

# Azure Functions Registration API

[![Open project in GitHub Codespaces](https://img.shields.io/badge/Codespaces-Open-blue?style=flat-square&logo=github)](https://codespaces.new/Microsoft/open-hack-build-25?hide_repo_select=true&ref=main&quickstart=true)
![Node version](https://img.shields.io/badge/Node.js->=20-3c873a?style=flat-square)

[Overview](#overview) • [API Endpoints](#api-endpoints) • [Development](#development)

</div>

## Overview

This API provides a simple way to register or identify users and issue a unique access token for each user. It is built with [Azure Functions](https://learn.microsoft.com/azure/azure-functions/functions-overview?pivots=programming-language-javascript) and uses Azure Cosmos DB for persistent storage of user tokens.

## API Endpoints

| Method | Path                 | Description                                                      |
|--------|----------------------|------------------------------------------------------------------|
| GET    | /api/me/access-token | Returns a unique access token for the authenticated user.        |

- **GET /api/register**
  - Returns a unique `accessToken` for the current user. If the user does not exist, a new token is generated and stored.
  - Requires the `x-ms-client-principal` header (base64-encoded JSON with at least a `userId` property). This header is provided by Azure Static Web Apps and contains information about the authenticated user.
  - Returns `401 Unauthorized` if the header is missing or invalid.

**Example request using REST Client:**

```http
GET http://localhost:7071/api/register
x-ms-client-principal: eyJ1c2VySWQiOiJfX3Rlc3RfdXNlcl9fIn0=
```

**Example response:**

```json
{
  "accessToken": "<unique-token>"
}
```

## Development

### Setup development environment

You can run this project directly in your browser by using GitHub Codespaces, which will open a web-based VS Code.

1. [**Fork**](https://github.com/Microsoft/open-hack-build-25/fork) the project to create your own copy of this repository.
2. On your forked repository, select the **Code** button, then the **Codespaces** tab, and click on the button **Create codespace on main**.
   ![Screenshot showing how to create a new codespace](../../docs/images/codespaces.png?raw=true)
3. Wait for the Codespace to be created, it should take a few minutes.

If you prefer to run the project locally, follow [these instructions](../../README.md#use-your-local-environment).

### Run the application

You can run the following command to run the application locally:

```bash
npm start
```

This command will start the Azure Functions application locally. You can test the application by opening the file `api.http` and clicking on **Send Request** to test the endpoints.

> [!NOTE]
> If you have not deployed the Azure resources, it will fall back to in-memory data. You can test the API without deploying it to Azure.
