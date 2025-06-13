import {Redis} from "../redis/redis.service.js";

export class Scheduler {
    constructor(private readonly redis: Redis) {}

    public async queue() {

    }
}