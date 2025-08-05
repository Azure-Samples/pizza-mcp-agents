import 'dotenv/config';

function cyan(text) {
  return `\x1b[36m${text}\x1b[0m`;
}

const deployedEnvironment = `
\x1b[1mDeployed services URLs:\x1b[0m

- Pizza API    : ${cyan(process.env.PIZZA_API_URL || 'Not found')}
- Pizza MCP    : ${cyan(process.env.PIZZA_MCP_URL ? process.env.PIZZA_MCP_URL + '/mcp' : 'Not found')}
- Pizza orders : ${cyan(process.env.PIZZA_WEBAPP_URL || 'Not found')}
- Registration : ${cyan(process.env.REGISTRATION_WEBAPP_URL || 'Not found')}
`;

console.log(deployedEnvironment);
