import { Redis } from '../redis/redis.service.js';
import Logger from 'jblog';
import { PostData } from '../telegram/type';
import { Post } from '../telegram/post/post.js';
import { TgStorage } from '../telegram/storage/storage.service.js';

export class Scheduler {
  private readonly QUEUE_KEY = 'delayed_posts_queue';
  private readonly log: Logger = new Logger({
    scopes: [Scheduler.name.toUpperCase()],
  });
  private readonly redis: Redis = Redis.getInstance();

  constructor(private readonly postService: Post) {}

  async queue(post: PostData): Promise<void> {
    this.log.info(`Adding ${post.review.messageId} post to queue`);
    await this.redis.pushToList(this.QUEUE_KEY, post.id);
    return this.postService.postpone(post);
  }

  async process(): Promise<void> {
    const scheduledPostId = await this.redis.popFromList<string>(this.QUEUE_KEY);
    if (!scheduledPostId) return this.log.info('No post to process...');
    const post = await TgStorage.findById(scheduledPostId);
    if (!post) return this.log.error(`Failed to get postData for "${scheduledPostId}" post`);

    this.log.info(`Processing ${post.review.messageId} post`);
    return this.postService.accept(post);
  }
}
