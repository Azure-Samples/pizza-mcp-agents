import { CosmosClient, Database, Container } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../../.env'), quiet: true });

interface User {
  hash: string;
  accessToken: string;
  createdAt: string;
}

export class UserDbService {
  private static instance: UserDbService;
  private client: CosmosClient | undefined = undefined;
  private database: Database | undefined = undefined;
  private usersContainer: Container | undefined = undefined;
  private isCosmosDbInitialized = false;
  private inMemoryUsers: Map<string, User> = new Map();
  private useInMemoryDb = false;

  static async getInstance(): Promise<UserDbService> {
    if (!UserDbService.instance) {
      UserDbService.instance = new UserDbService();
      await UserDbService.instance.initialize();
    }
    return UserDbService.instance;
  }

  protected async initialize(): Promise<void> {
    const endpoint = process.env.AZURE_COSMOSDB_NOSQL_ENDPOINT;
    if (!endpoint) {
      console.log('AZURE_COSMOSDB_NOSQL_ENDPOINT not defined, using in-memory database for users');
      this.useInMemoryDb = true;
      return;
    }

    await this.initializeCosmosDb();
  }

  protected async initializeCosmosDb(): Promise<void> {
    try {
      const endpoint = process.env.AZURE_COSMOSDB_NOSQL_ENDPOINT;
      const credential = new DefaultAzureCredential();
      this.client = new CosmosClient({ endpoint, aadCredentials: credential });
      const databaseId = 'userDB';
      const { database } = await this.client.databases.createIfNotExists({ id: databaseId });
      this.database = database;
      const { container } = await this.database.containers.createIfNotExists({
        id: 'users',
        partitionKey: { paths: ['/id'] },
      });
      this.usersContainer = container;
      this.isCosmosDbInitialized = true;
      console.log('Connected to Cosmos DB for users');
    } catch (error) {
      console.error('Failed to initialize Cosmos DB for users:', error);
      throw error; // Re-throw the error as we should not fall back if connection fails when endpoint is defined
    }
  }

  async getUserByHash(hash: string): Promise<User | undefined> {
    if (this.useInMemoryDb) {
      return this.inMemoryUsers.get(hash);
    }

    if (!this.isCosmosDbInitialized) return undefined;
    try {
      const querySpec = {
        query: 'SELECT TOP 1 * FROM c WHERE c.hash = @hash',
        parameters: [{ name: '@hash', value: hash }],
      };
      const { resources } = await this.usersContainer!.items.query(querySpec).fetchAll();
      const resource = resources[0];
      return resource;
    } catch (error: any) {
      if (error.code === 404) return undefined;
      throw error;
    }
  }

  async createUser(hash: string, accessToken: string): Promise<User> {
    const user: User = {
      hash,
      accessToken,
      createdAt: new Date().toISOString(),
    };

    if (this.useInMemoryDb) {
      this.inMemoryUsers.set(hash, user);
      return user;
    }

    if (!this.isCosmosDbInitialized) throw new Error('Cosmos DB not initialized');
    const { resource } = await this.usersContainer!.items.create(user);
    return resource as User;
  }
}
