# Ecommerse server 2

## A good production ready ecommerse or general purpose web server made with BunJs & ElysiaJs

## Features:

- [x] Authorization
- [x] Swag documentation
- [x] Logging
- [x] Jwt
- [x] MongoDb database
- [x] Hashed password storing
- [ ] User Crud
- [ ] Dockerized
- [ ] Role Based Authorization
- [ ] Hashed password
- [ ] Filtering
- [ ] File upload

## Known issues:

- Random userid is slow, probably because of random-js module
- Testing issues
- Swag documentation not works good as well

## Getting Started

To get started with this template, simply paste this command into your terminal:

```bash
git clone https://github.com/xfxpositons/ecommerse-server-2.git
cd ecommerse-server-2
bun install
```

## Editing dotenv

Please check out `env.example`

```bash
vim .env
```

## Development

To start the development server run:

```bash
bun run dev
```

Open http://localhost:3000/ and you're set
