import { Redis } from "../redis/redis.service.js";
import Logger from "jblog";
import { PendingMessage } from "../telegram/type";
import { Post } from "../telegram/post/post";

export class Scheduler {
  private readonly QUEUE_KEY = "delayed_posts_queue";
  private readonly log: Logger = new Logger({
    scopes: [Scheduler.name.toUpperCase()],
  });
  private readonly redis: Redis = Redis.getInstance();

  constructor(private readonly postService: Post) {}

  async queue(post: PendingMessage): Promise<void> {
    await this.redis.pushToList(this.QUEUE_KEY, post);
    return this.postService.postpone(post);
  }

  async process(): Promise<void> {
    const post = await this.redis.popFromList<PendingMessage>(this.QUEUE_KEY);
    if (!post) return this.log.info("No post to process...");

    return this.postService.accept(post.admin?.username || "none", post);
  }
}
