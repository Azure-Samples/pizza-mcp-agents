# Pizza data generator

This package contains [GenAIScript](https://aka.ms/genaiscript)-powered tools for generating pizza restaurant data, including the menu and images. The generated data is then used by the pizza API service.

## Overview

The data generated includes:
- Pizza menu data (names, descriptions, prices, toppings)
- High-quality food images for pizzas and toppings

## Installation

1. Run `npm install` to install the necessary dependencies.
2. Make sure you have access to a large language model (LLM) like `gpt-4o` or `gpt-4.1` on either OpenAI or Azure OpenAI for the text data generation, to a model like `gpt-image-1` or `dall-e-3` for image generation.
  * See this [guide](https://learn.microsoft.com/azure/ai-foundry/openai/how-to/create-resource?pivots=web-portal) for deploying a text generation model on Azure OpenAI.
  * See this [guide](https://learn.microsoft.com/azure/ai-foundry/openai/how-to/dall-e?tabs=gpt-image-1) for deploying an image generation model on Azure OpenAI.
3. Set these environment variables or add them to a `.env` file:

```bash
GENAISCRIPT_DEFAULT_MODEL="azure:gpt-4.1"   # or "openai:gpt-4.1"
GENAISCRIPT_IMAGE_MODEL="azure:gpt-image-1" # or "openai:gpt-image-1"

# For Azure OpenAI, set the following variables:
AZURE_OPENAI_API_KEY="your-azure-openai-api-key"
AZURE_OPENAI_API_ENDPOINT="https://your-azure-openai-endpoint.openai.azure.com"

# For OpenAI, set the following variable:
OPENAI_API_KEY="your-openai-api-key"
```

## Scripts

### Generate Pizza Menu Data

```bash
npm run generate:pizzas
```
Generates a complete pizza menu with Italian-inspired pizzas and toppings.

### Generate Food Images

```bash
npm run generate:images
```
Generates realistic food images for the menu items using AI image generation.
