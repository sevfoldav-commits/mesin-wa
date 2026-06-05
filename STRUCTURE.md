# Project Structure

```
hisoka-morou/
├── index.js                    # Entry point (auto-restart)
├── config.js                   # Bot configuration
├── package.json
├── src/
│   ├── hisoka.js               # Bot initialization & client setup
│   ├── event/
│   │   └── event.message.js    # Message handler pipeline
│   ├── core/
│   │   └── command-loader.js   # Command registration & hot-reload
│   ├── middleware/
│   │   └── command-validator.js # Permission & condition checks
│   ├── utils/
│   │   ├── logger.js           # Structured logging
│   │   ├── formatter.js        # Formatting helpers (formatSize, etc.)
│   │   └── command-builder.js  # Command definition template
│   ├── commands/
│   │   ├── convert/            # Sticker, to-audio, to-image, etc.
│   │   ├── download/           # TikTok, Instagram, YouTube, etc.
│   │   ├── function/           # No-prefix handlers
│   │   ├── group/              # Group management commands
│   │   ├── main/               # General commands (menu, speed, etc.)
│   │   ├── owner/              # Owner-only commands
│   │   └── tool/               # Utility commands
│   └── lib/
│       ├── lib.api.js          # External API wrappers
│       ├── lib.collection.js   # Extended Map collection
│       ├── lib.convert.js      # Media conversion utilities
│       ├── lib.database.js     # Database (MongoDB / JSON)
│       ├── lib.function.js     # General helper functions
│       ├── whatsapp.database.js
│       └── whatsapp.serialize.js
```

## Key Improvements

| Area | Before | After |
|------|--------|-------|
| **event.message.js** | 235 lines, mixed responsibilities | ~120 lines, clean pipeline |
| **Validation** | Duplicated, inline | Single middleware (`command-validator.js`) |
| **Command Loading** | Inline in event handler | Dedicated `command-loader.js` |
| **Logging** | Scattered `console.log` | Centralized `logger.js` |
| **Config** | Mixed with `formatSize()` helper | Clean config, helper in `utils/formatter.js` |
| **Commands** | Raw object exports | Standardized via `command-builder.js` |

## Creating a New Command

```js
import { command } from '../../utils/command-builder.js'

export default command({
  name: 'hello',
  aliases: ['hi'],
  type: 'main',
  desc: 'Say hello',
  execute: async ({ hisoka, m }) => {
    m.reply('Hello!')
  }
})
```
