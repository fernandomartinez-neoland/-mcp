# Guía paso a paso: servidor MCP "calculadora"

Esta guía está pensada para alguien que **empieza desde cero**. Explica qué hay que instalar, cómo se compila el proyecto, cómo se ejecuta y cómo se consulta, primero desde la terminal y después desde un cliente MCP (que haremos en otro proyecto).

---

## 0. ¿Qué es esto?

**MCP (Model Context Protocol)** es un "idioma" común para que una aplicación (por ejemplo, Claude u otro asistente de IA) pueda usar **herramientas** que viven en otro programa.

En MCP hay dos partes:

| Parte | Qué hace | En este curso |
|---|---|---|
| **Servidor MCP** | Ofrece herramientas (por ejemplo `suma`) | **Este proyecto** |
| **Cliente MCP** | Se conecta al servidor, pregunta qué herramientas hay y las usa | Lo haremos en otro proyecto |

Nuestro servidor se llama `calculadora` y tiene **una herramienta**:

- `suma`: recibe dos números (`a` y `b`) y devuelve el resultado.

El servidor y el cliente se comunican por **stdio** (entrada y salida estándar): el cliente escribe mensajes de texto en formato JSON y el servidor responde también con JSON. No hay puerto ni página web: es como hablar por la terminal.

---

## 1. Qué hay que instalar

### 1.1 Node.js (obligatorio)

Node.js permite ejecutar JavaScript fuera del navegador. Al instalarlo también se instala **npm**, el programa que descarga las librerías del proyecto.

1. Entra en https://nodejs.org
2. Descarga la versión **LTS** (la recomendada). Este proyecto se ha probado con Node **v24**.
3. Instálalo con las opciones por defecto (siguiente, siguiente, finalizar).
4. **Cierra y vuelve a abrir** la terminal (o VS Code) para que reconozca el comando nuevo.
5. Comprueba que está instalado:

```bash
node -v
npm -v
```

Si ves algo como `v24.22.0` y `11.19.1`, está todo bien. Si ves "no se reconoce como comando", reinicia el ordenador y vuelve a probar.

### 1.2 Visual Studio Code (recomendado)

Es el editor de código que usamos. Descárgalo de https://code.visualstudio.com

Para abrir una terminal dentro de VS Code: menú **Terminal → New Terminal** (o `Ctrl + ñ` / `` Ctrl + ` ``).

### 1.3 Git (opcional)

Solo hace falta si vas a descargar el proyecto desde GitHub o guardar cambios con control de versiones: https://git-scm.com

```bash
git --version
```

---

## 2. Conseguir el proyecto

Si ya tienes la carpeta, salta al paso 3.

```bash
git clone https://github.com/fernandomartinez-neoland/-mcp.git mcp
cd mcp
```

Después ábrela en VS Code: **File → Open Folder** y elige la carpeta `mcp`.

### ¿Qué hay dentro?

```
mcp/
├── src/
│   └── index.ts        ← el código del servidor (TypeScript). AQUÍ se programa.
├── build/
│   └── index.js        ← el código ya compilado (JavaScript). Se genera solo, no se edita.
├── package.json        ← nombre del proyecto, librerías y comandos (scripts)
├── tsconfig.json       ← configuración del compilador de TypeScript
└── node_modules/       ← librerías descargadas (aparece tras `npm install`)
```

---

## 3. Instalar las librerías del proyecto

Desde la carpeta del proyecto, ejecuta:

```bash
npm install
```

Esto lee `package.json` y descarga en `node_modules/`:

| Librería | Para qué sirve |
|---|---|
| `@modelcontextprotocol/server` | El SDK oficial para crear servidores MCP |
| `zod` | Describe y valida los datos que recibe cada herramienta (por ejemplo, que `a` y `b` sean números) |
| `typescript` | El compilador que convierte TypeScript en JavaScript |
| `@types/node` | "Ayudas" para que TypeScript entienda las funciones de Node |

Solo hay que hacerlo **una vez** (o cuando cambien las librerías de `package.json`).

> Nota: si empiezas un proyecto nuevo desde cero, los comandos para instalar estas mismas librerías serían:
> ```bash
> npm init -y
> npm install @modelcontextprotocol/server zod
> npm install -D typescript @types/node
> ```

---

## 4. Compilar

Node no entiende TypeScript directamente, así que hay que **compilar** (traducir) `src/index.ts` a `build/index.js`:

```bash
npm run build
```

Este comando ejecuta el script `build` de `package.json`, que:

1. Lanza `tsc` (el compilador de TypeScript) usando la configuración de `tsconfig.json`.
2. Da permisos de ejecución a `build/index.js` (en Windows no hace nada visible, pero tampoco molesta).

Si no aparece ningún error, se habrá creado o actualizado `build/index.js`.

> ⚠️ **Importante:** cada vez que cambies algo en `src/index.ts` tienes que volver a ejecutar `npm run build`. Si no, seguirás ejecutando la versión anterior.

---

## 5. Ejecutar el servidor

```bash
node build/index.js
```

Verás solo esto:

```
Weather MCP Server running on stdio
```

y parecerá que la terminal **se ha quedado colgada**. **Es normal**: el servidor está esperando a que alguien le escriba un mensaje. (El texto dice "Weather" porque el código parte de un ejemplo del tiempo; se puede cambiar en `src/index.ts`).

Para pararlo: `Ctrl + C`.

> En la práctica casi nunca arrancarás el servidor a mano: **el cliente MCP lo arranca él solo** cuando lo necesita. Ejecutarlo a mano sirve para probarlo.

---

## 6. Consultar el servidor desde la terminal

Hay dos formas. La **opción A** es la más cómoda; la **opción B** sirve para entender qué pasa "por debajo".

### Opción A: MCP Inspector (interfaz visual, recomendada)

El Inspector es una herramienta oficial que abre una página en el navegador para probar servidores MCP. No hace falta instalarla: `npx` la descarga y la ejecuta.

```bash
npx @modelcontextprotocol/inspector node build/index.js
```

1. La primera vez te preguntará si quieres instalar el paquete: responde `y`.
2. Se abrirá el navegador (si no se abre, copia la URL que aparece en la terminal, incluido el token).
3. Pulsa **Connect**.
4. Ve a la pestaña **Tools** → **List Tools**. Aparecerá `suma`.
5. Haz clic en `suma`, rellena `a = 2` y `b = 3` y pulsa **Run Tool**.
6. Verás el resultado: `5`.

### Opción B: hablar con el servidor "a mano" (JSON-RPC)

Los mensajes MCP son líneas de texto en formato **JSON-RPC**. Una conversación siempre sigue este orden:

1. **`initialize`**: el cliente se presenta ("hola, soy un cliente, hablo esta versión del protocolo").
2. **`notifications/initialized`**: el cliente confirma que está listo.
3. **`tools/list`**: "¿qué herramientas tienes?"
4. **`tools/call`**: "ejecuta `suma` con a=2 y b=3".

#### B.1 Escribiendo los mensajes uno a uno

Arranca el servidor:

```bash
node build/index.js
```

Y pega estas líneas **una a una**, pulsando Enter después de cada una (cada mensaje tiene que ir en una sola línea):

```json
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"terminal","version":"1.0.0"}}}
```

```json
{"jsonrpc":"2.0","method":"notifications/initialized"}
```

```json
{"jsonrpc":"2.0","id":2,"method":"tools/list"}
```

```json
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"suma","arguments":{"a":2,"b":3}}}
```

#### B.2 Enviando todos los mensajes de golpe desde un archivo

Crea en la carpeta del proyecto un archivo llamado `peticiones.jsonl` con las cuatro líneas de arriba (una por línea) y ejecuta:

**PowerShell (Windows):**

```powershell
Get-Content peticiones.jsonl | node build/index.js
```

**Git Bash / macOS / Linux:**

```bash
node build/index.js < peticiones.jsonl
```

En este caso el servidor se cierra solo cuando termina de leer el archivo.

#### Qué deberías ver

```
Weather MCP Server running on stdio
{"result":{"protocolVersion":"2025-11-25","capabilities":{"tools":{"listChanged":true}},"serverInfo":{"name":"calculadora","version":"1.0.0"}},"jsonrpc":"2.0","id":1}
{"result":{"tools":[{"name":"suma","description":"suma 2 numeros","inputSchema":{...}}]},"jsonrpc":"2.0","id":2}
{"result":{"content":[{"type":"text","text":"5"}]},"jsonrpc":"2.0","id":3}
```

Cómo leerlo:

- Cada respuesta lleva el mismo `id` que la petición a la que responde (1, 2, 3).
- La notificación `notifications/initialized` no tiene `id`, por eso no recibe respuesta.
- En la respuesta `id: 3` está el resultado de la suma: `"text":"5"`.

---

## 7. Consultar el servidor desde un cliente MCP

Un cliente MCP hace automáticamente lo mismo que hemos hecho a mano en el paso 6: **arranca el servidor**, envía `initialize`, pide la lista de herramientas y las llama.

Lo único que necesita saber el cliente es **cómo arrancar el servidor**:

- **Comando:** `node`
- **Argumentos:** la **ruta completa** a `build/index.js`

Para saber la ruta completa, en la terminal dentro del proyecto ejecuta `pwd` (Git Bash o PowerShell) y añade `/build/index.js` al final. Por ejemplo:

```
C:/Users/TU_USUARIO/Documents/Neoland/octubre2026/mcp/build/index.js
```

> 💡 En Windows usa barras normales `/` en las rutas. Si usas barras invertidas `\` dentro de un JSON, hay que ponerlas dobles: `C:\\Users\\...`.

### 7.1 Con nuestro propio cliente (el proyecto que haremos)

Este es el esqueleto del cliente que montaremos en el otro proyecto. Se ha probado con este servidor y funciona.

**1. Crear el proyecto del cliente** (en otra carpeta, fuera de `mcp`):

```bash
mkdir mcp-cliente
cd mcp-cliente
npm init -y
npm pkg set type=module
npm install @modelcontextprotocol/client
```

**2. Crear el archivo `cliente.mjs`:**

```js
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

// 1. Cómo arrancar el servidor (cambia la ruta por la tuya)
const transport = new StdioClientTransport({
  command: "node",
  args: ["C:/Users/TU_USUARIO/Documents/Neoland/octubre2026/mcp/build/index.js"],
});

// 2. Crear el cliente y conectarlo (esto envía "initialize" por nosotros)
const client = new Client({ name: "mi-cliente", version: "1.0.0" });
await client.connect(transport);

// 3. Preguntar qué herramientas hay (tools/list)
const { tools } = await client.listTools();
console.log("Herramientas:", tools.map((t) => t.name));

// 4. Llamar a la herramienta "suma" (tools/call)
const resultado = await client.callTool({
  name: "suma",
  arguments: { a: 2, b: 3 },
});
console.log("Resultado:", resultado.content[0].text);

// 5. Cerrar la conexión (esto también apaga el servidor)
await client.close();
```

**3. Ejecutarlo:**

```bash
node cliente.mjs
```

Salida esperada:

```
Weather MCP Server running on stdio
Herramientas: [ 'suma' ]
Resultado: 5
```

Fíjate en que **no hemos arrancado el servidor a mano**: el cliente lo ha lanzado él solo.

### 7.2 Con Claude Code (opcional)

Desde la terminal:

```bash
claude mcp add calculadora -- node C:/Users/TU_USUARIO/Documents/Neoland/octubre2026/mcp/build/index.js
```

Después abre Claude Code, escribe `/mcp` para comprobar que `calculadora` aparece conectado y pídele, por ejemplo: *"usa la herramienta suma para sumar 2 y 3"*.

### 7.3 Con Claude Desktop (opcional)

1. Abre Claude Desktop → **Settings → Developer → Edit Config**.
2. Se abrirá el archivo `claude_desktop_config.json`. Añade:

```json
{
  "mcpServers": {
    "calculadora": {
      "command": "node",
      "args": ["C:/Users/TU_USUARIO/Documents/Neoland/octubre2026/mcp/build/index.js"]
    }
  }
}
```

3. Guarda y **cierra Claude Desktop del todo** (también desde el icono de la bandeja del sistema) y vuelve a abrirlo.
4. En el chat aparecerá la herramienta `suma` disponible.

---

## 8. Resumen rápido (chuleta)

| Quiero... | Comando |
|---|---|
| Comprobar que Node está instalado | `node -v` y `npm -v` |
| Instalar librerías (una vez) | `npm install` |
| Compilar (cada vez que cambie `src/`) | `npm run build` |
| Ejecutar el servidor | `node build/index.js` (parar con `Ctrl + C`) |
| Probarlo con interfaz visual | `npx @modelcontextprotocol/inspector node build/index.js` |
| Probarlo enviando un archivo (PowerShell) | `Get-Content peticiones.jsonl \| node build/index.js` |
| Probarlo desde un cliente | `node cliente.mjs` (en el proyecto del cliente) |

Ciclo de trabajo normal: **editar `src/index.ts` → `npm run build` → probar**.

---

## 9. Añadir una herramienta nueva (ejemplo: `resta`)

Dentro de `createServer()` en `src/index.ts`, debajo de la herramienta `suma` y antes de `return server;`, añade:

```ts
server.registerTool(
  "resta",
  {
    description: "resta 2 numeros",
    inputSchema: z.object({
      a: z.number().describe("numero del que se resta"),
      b: z.number().describe("numero que se resta"),
    }),
  },
  async ({ a, b }) => {
    return {
      content: [{ type: "text", text: `${a - b}` }],
    };
  },
);
```

Después ejecuta `npm run build` y vuelve a probar: en `tools/list` aparecerán `suma` y `resta`.

Las partes de una herramienta:

- **Nombre** (`"resta"`): el que usará el cliente para llamarla.
- **`description`**: explica para qué sirve. La IA la lee para decidir cuándo usarla, así que conviene que sea clara.
- **`inputSchema`**: qué datos recibe y de qué tipo (con `zod`).
- **Función**: lo que hace. Siempre devuelve `{ content: [{ type: "text", text: "..." }] }`.

---

## 10. Problemas frecuentes

| Problema | Causa / solución |
|---|---|
| `node` o `npm` "no se reconoce como comando" | Node no está instalado o la terminal se abrió antes de instalarlo. Cierra y abre la terminal, o reinicia el ordenador. |
| `Cannot find module '@modelcontextprotocol/server'` | Falta `npm install`. |
| `Cannot find module '.../build/index.js'` | Falta `npm run build`, o estás en otra carpeta. Comprueba con `pwd` dónde estás. |
| He cambiado el código y no se nota | Falta volver a ejecutar `npm run build`. |
| El servidor "se queda colgado" | Es normal: está esperando mensajes. Para con `Ctrl + C`. |
| El servidor no responde a lo que escribo | Cada mensaje JSON tiene que ir **en una sola línea** y empezar por `initialize`. |
| El cliente da errores raros al conectar | Dentro del servidor **no uses `console.log`**: la salida estándar (stdout) se reserva para los mensajes MCP. Para mensajes de depuración usa `console.error`, como hace ya el proyecto. |
| Claude Desktop no muestra la herramienta | Revisa que la ruta sea completa y correcta, y cierra Claude Desktop del todo antes de abrirlo de nuevo. |
