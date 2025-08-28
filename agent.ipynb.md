## Demo agent for Pizza MCP

This simple agent uses [GenAIScript](https://microsoft.github.io/genaiscript/) to demonstrate how to interact with the Pizza MCP server. You can try changing the prompts and see how the agent behaves.

### Starting the MCP server
Before running the agent, you first need to run the Pizza MCP server. You can do this by running the following command in the root of the repository:

```sh
npm start
```

This command will start all services required, including the Pizza API, dashboard, and other components.

### Running the agent
To run the agent, you need to have the [GenAIScript extension](https://marketplace.visualstudio.com/items?itemName=genaiscript.genaiscript-vscode) installed in your VS Code, and an LLM configured. By default, it uses GitHub models, but you can change it to use any other model by modifying the `model` property in the script. See the [GenAIScript documentation](https://microsoft.github.io/genaiscript/configuration/#model-selection) for more details on how to configure the model.

Once you're set, simply select the **Execute Cell** button in the top left of the code cell below.

```js
script({
  // Wraps MCP servers with their own agent and system prompt
  mcpAgentServers: {
    pizzaMcp: {
      description: 'Manages pizza orders and menu',
      instructions: 'You\'re an assistant that helps users with managing pizza orders and menu information. Use ONLY provided tools to get information and perform actions on behalf of the user. If you can\'t do the specified task, says that you can\'t do it.',
      url: 'http://localhost:3000/mcp',
    }
  },
  // Uncomment the following line to use a specific model, default is 'github:gpt-4.1' (uses GitHub models)
  // model: 'github:gpt-4.1',
});

// Example prompt, you can change it to test different scenarios
$`Can I have a vegan pizza with extra mushrooms and no cheese?`;
```

