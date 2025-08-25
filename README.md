# Postula

### Telegram post suggestions managing bot
###### _Use for collecting post suggestions and forwarding approved posts to a target chat or thread_

---
## Quick start

```bash
git clone https://github.com/Jagmesh/postula.git
cd postula
npm install
# or
# yarn
```

1. Create a `.env` file in the project root (example below).
2. Run in development:

```bash
npm run dev
```

3. Build and run for production:

```bash
npm run build
npm run start:prod
```

---
## Example `.env`

```
TG_BOT_TOKEN=7626...
TG_SUGGESTION_CHAT_ID=-1
TG_TARGET_CHANNEL_ID=@name
TG_ARCHIVE_THREAD_ID=1
TG_ADMIN_ID_LIST=1,2,3
TG_POSTPONED_POSTS_POSTING_SLOTS=10:10,17:17

REDIS_HOST_URL=redis://localhost:6379
REDIS_PASSWORD=1234
```

---
## Docker

```bash
docker build -t postula:latest .

docker run postula:latest
```

---
## License

MIT
