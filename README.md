# LexShark — Backend Multi-Tenant (SaaS)

Este pacote adiciona um backend profissional ao LexShark **sem reescrever o
`index.html`**. O frontend continua funcionando 100% offline; quando há
login, ele passa a sincronizar com a API.

## Estrutura entregue

```
lexshark-backend/        -> API NestJS + PostgreSQL (Prisma) + WebSocket
  prisma/schema.prisma    -> modelo multi-tenant (office_id em tudo)
  src/auth/               -> cadastro automático de escritório + login (JWT)
  src/offices/            -> dados do escritório logado
  src/users/              -> CRUD de usuários (admin)
  src/permissions/        -> permissões flexíveis por usuário
  src/tasks/              -> tarefas com push em tempo real (WebSocket)
  src/sync/               -> sincronização de clientes/processos/agenda/backup
  src/websocket/          -> gateway Socket.IO (namespace /realtime)
  src/common/             -> guards (JWT, permissões), decorators, filtro de erros

lexshark-frontend/        -> camada de comunicação para colar no index.html atual
  api.js                  -> ÚNICO ponto de chamadas HTTP (ApiClient)
  services/
    authService.js
    userService.js
    officeService.js
    taskService.js
    messageService.js
    syncService.js
```

## Como rodar o backend

```bash
cd lexshark-backend
cp .env.example .env        # ajuste DATABASE_URL e JWT_SECRET
docker compose up -d        # sobe o PostgreSQL
npm install
npm run prisma:migrate      # cria as tabelas
npm run start:dev           # http://localhost:3000/api/v1
```

## Como plugar no `index.html` existente (sem reescrever nada)

Antes do `</body>`, adicione apenas:

```html
<script>window.LEXSHARK_API_BASE_URL = "https://sua-api.com/api/v1";</script>
<script src="https://cdn.socket.io/4.7.4/socket.io.min.js"></script>
<script src="api.js"></script>
<script src="services/authService.js"></script>
<script src="services/officeService.js"></script>
<script src="services/userService.js"></script>
<script src="services/taskService.js"></script>
<script src="services/messageService.js"></script>
<script src="services/syncService.js"></script>
```

Nenhum HTML, CSS ou função já existente precisa mudar. Os pontos de
integração ficam totalmente a cargo de quem mantém o `index.html`, chamando
os serviços globais (`authService`, `taskService`, `syncService`, etc.) nos
mesmos lugares onde hoje ele já lê/escreve no IndexedDB. Exemplos:

```js
// Login (tela de login já existente)
const r = await authService.login(email, senha);
if (r.ok) { /* segue fluxo normal da tela */ } else { /* mostra erro */ }

// Ao salvar um cliente localmente, também tenta sincronizar
salvarClienteNoIndexedDB(cliente);
if (syncService.isAvailable()) await syncService.pushClients([cliente]);

// Tarefas chegando em tempo real
taskService.connectRealtime();
taskService.onTaskCreated(task => adicionarTarefaNaTela(task));
```

Se o backend estiver fora do ar ou o usuário não estiver logado, todo método
de `api.js`/`services/*` devolve `{ ok: false, offline: true }` — o sistema
deve simplesmente continuar usando IndexedDB/backup local, como já faz hoje.

## Multi-tenant

- Uma única instância de PostgreSQL.
- Toda tabela de domínio tem `office_id`.
- Todo acesso passa pelo JWT (`officeId` embutido no token) — nunca pelo
  parâmetro vindo do cliente — então um escritório nunca enxerga dados de
  outro.

## Cadastro automático de escritório

`POST /auth/register-office` cria, em uma única transação lógica: o
`Office`, o `office_id` e o usuário `ADMIN`. Esse admin depois cria os
demais usuários por `POST /users`.

## Permissões

`GET /permissions/keys` lista as chaves suportadas (`manage_team`,
`edit_agenda`, `export_backup`, etc.). O admin sempre tem acesso total;
membros só passam pelo `PermissionsGuard` se tiverem a chave marcada como
`allowed: true`.

## Tarefas em tempo real

Ao criar uma tarefa (`POST /tasks`), o backend grava no PostgreSQL e emite
`task:created` via WebSocket (Socket.IO, namespace `/realtime`) para o
escritório e para o usuário responsável — sem precisar dar refresh na
página, exatamente como pedido.
