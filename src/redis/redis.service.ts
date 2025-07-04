import {
    createClient,
    RedisClientOptions,
    RedisClientType,
    RedisDefaultModules,
    RedisFunctions,
    RedisModules, RedisScripts, TypeMapping
} from 'redis';
import Logger from "jblog";

export class Redis {
    private static _instance: Redis | null = null;

    private readonly initConfig: RedisClientOptions;
    private client!: RedisClientType<RedisDefaultModules & RedisModules, RedisFunctions, RedisScripts, 2 | 3, TypeMapping>;
    private readonly log: Logger = new Logger({scopes: ['REDIS']});

    constructor(config: RedisClientOptions) {
        this.initConfig = config;
    }

    public static async init(config: RedisClientOptions): Promise<Redis | null> {
        if (!Redis._instance) {
            const service = new Redis(config);
            await service.connect();
            Redis._instance = service;
        }
        return Redis._instance;
    }

    public static getInstance(): Redis {
        if (!Redis._instance) {
            throw new Error('Redis hasn\'t been initialized. Use `init()`');
        }
        return Redis._instance;
    }

    public static getClient() {
        const inst = Redis.getInstance()
        if (!inst) throw new Error('Redis hasn\'t been initialized. Use `init()`');

        return inst.client;
    }

    private async connect(): Promise<void> {
        this.client = createClient(this.initConfig)
        this.client.on('error', err => {
            this.log.error(err)
            process.exit(1)
        });
        this.client.on('connect', () => this.log.success(`Successfully connected via ${this.initConfig.url}`));

        await this.client.connect()
    }

    public async set(key: string, value: any): Promise<void> {
       await this.client.set(key, JSON.stringify(value));
    }

    public async get<T>(key: string): Promise<T | null> {
        const rawData = await this.client.get(key);
        if (!rawData) return null

        try {
            return JSON.parse(rawData)
        } catch (error) {
            this.log.error(error)
            return null
        }
    }

    public async delete(key: string): Promise<void> {
        await this.client.del(key)
    }
}