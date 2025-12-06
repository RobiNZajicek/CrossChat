# CrossChat - Complete Technical Documentation

> **Multi-threaded Real-time Chat Aggregator with Shared Memory Architecture**

---

## Co je CrossChat a Proč Existuje

CrossChat je pokročilá webová aplikace postavená na Next.js 14, která simuluje **real-time chat agregátor pro streamery**. Představ si, že jsi streamer na Twitchi, YouTube a Kicku současně. Normálně bys musel sledovat tři různé chaty najednou. CrossChat řeší tento problém tím, že všechny zprávy ze všech platforem sjednotí do jednoho dashboardu.

Ale to není hlavní pointa. **CrossChat je především technické demo** ukazující pokročilé Node.js koncepty:

- **Multi-threading** pomocí Worker Threads
- **Shared memory** synchronizace přes SharedArrayBuffer
- **Race condition prevention** pomocí vlastní mutex implementace
- **Real-time komunikace** přes Socket.IO
- **Concurrency patterns** které se běžně používají v produkčních systémech

---

## Jak to Celé Funguje - Základní Princip

### Jednoduchá Analogie

Představ si CrossChat jako **továrnu na zpracování zpráv**:

1. **Producenti (Worker Thread)** = Dělníci, kteří přijímají suroviny (chat zprávy z různých platforem)
2. **Sklad (Shared Queue)** = Centrální sklad s omezenou kapacitou, kam producenti ukládají zpracované zprávy
3. **Konzumenti (Socket.IO Pump)** = Expedice, která každých 50ms přijde do skladu, vybere až 50 zpráv a rozešle je zákazníkům
4. **Zámek (Mutex)** = Pouze jeden člověk může být ve skladu najednou, aby nedošlo k chaosu

### Proč Multi-threading?

Normální Node.js běží na **jednom vlákně**. To znamená, že pokud děláš nějakou těžkou práci (třeba normalizace zpráv, přidání UUID, formátování), blokuješ hlavní vlákno a server se zadrhává.

CrossChat řeší tento problém tím, že **těžkou práci předává do samostatného Worker threadu**. Hlavní thread (server) se jen stará o přijímání HTTP requestů a odesílání zpráv přes Socket.IO. Worker thread se stará o zpracování dat.

### Proč Shared Memory?

Klasicky když chceš poslat data mezi thready, musíš je **serializovat** (převést na JSON string), poslat, a na druhé straně **deserializovat** zpět. To je pomalé a náročné na paměť.

CrossChat používá **SharedArrayBuffer** - to je paměť, kterou vidí **oba thready současně**. Je to jako sdílený notes - Worker thread píše zprávy do notes, Main thread je z něj čte. **Žádná serializace, nulová kopie dat.**

### Proč Mutex?

Když máš sdílenou paměť, musíš řešit **race conditions**. Co se stane, když Worker thread zapisuje zprávu do slotu 42 a současně Main thread čte ze slotu 42? **Data corruption**.

Mutex je **zámek**. Pravidlo je jednoduché: Chceš přistoupit ke frontě? Musíš získat zámek. Máš zámek? Nikdo jiný nemůže ke frontě přistoupit, dokud ho neuvolníš.

---

## Jak Funguje Celý Systém - Krok za Krokem

### 1. Uživatel se Registruje

Otevřeš si CrossChat. Klikneš "Start Streaming" → přesměrování na registraci.

**Co se děje:**
- Vyplníš username a heslo (minimálně 6 znaků)
- Frontend pošle POST request na `/api/auth/register`
- Backend vezme tvoje heslo a **zahashuje ho pomocí bcrypt** (10 rounds = ~100ms výpočet)
- Vytvoří se ti nový uživatelský účet s UUID
- Uloží se do `users.json` souboru ve formátu:

```json
{
  "id": "990422aa-6e44-4b1c-949c-133fc1c8c440",
  "username": "streamer1",
  "passwordHash": "$2a$10$X1Y2Z3...",
  "createdAt": 1733097600000,
  "sessions": []
}
```

- Po registraci tě přesměruje na login

### 2. Přihlášení

Vyplníš stejné údaje a klikneš Login.

**Co se děje:**
- POST request na `/api/auth/login`
- Backend najde tvůj účet podle username
- **Porovná heslo s hashem** pomocí `bcrypt.compare()` (další ~100ms)
- Pokud souhlasí, nastaví ti **HTTP-only cookie** `streamer_session`
- Cookie obsahuje: `{"id": "tvoje-uuid", "username": "tvoje-jmeno"}`
- Přesměrování na `/dashboard`

**Důležité:** Cookie je **httpOnly**, což znamená, že JavaScript ji nemůže číst (ochrana před XSS útoky). Cookie se automaticky posílá s každým requestem.

### 3. Dashboard - Inicializace

Otevře se ti dashboard. Co se stane v pozadí:

**Frontend (React):**
1. Komponenta `StreamDashboard` se mountne (useEffect)
2. Zavolá `GET /api/socket` - to "probudí" Socket.IO server
3. Vytvoří Socket.IO client: `io(url, {path: '/api/socket'})`
4. Socket se připojí k serveru (WebSocket upgrade)
5. Po připojení pošle: `socket.emit('join', streamerId)`
6. Server tě přidá do **room** `streamer:{tvoje-id}`

**Backend (Socket.IO):**
1. Pokud Socket.IO server ještě neběží, vytvoří se:
   - Nový `IOServer` instance
   - Listener pro `connection` eventy
   - Handler pro `join` eventy
2. Spustí se **Pump Loop** (pokud ještě neběží):
   - `setInterval(pump, 50)` - funkce `pump()` se spustí každých 50ms
   - Pump loop je zodpovědný za čtení zpráv z queue a broadcastování

**Worker Thread:**
1. Pokud Worker ještě neexistuje, vytvoří se:
   - `getSharedState()` vytvoří nebo vrátí singleton sdílené paměti
   - `SharedMessageQueue` alokuje 1MB buffer (256 slotů po 4096 bytech)
   - `Mutex` alokuje 4 byty pro zámek
   - Vytvoří se Worker process: `new Worker('unified.worker.js', {workerData: buffers})`
   - Worker v sobě rekonstruuje Queue a Mutex ze **stejných bufferů**
   - Teď Main thread a Worker thread sdílí paměť!

### 4. Start Streamu

Klikneš "Start New Stream".

**Co se děje:**
1. POST request na `/api/stream/control` s `{action: 'start'}`
2. Backend přečte tvoje session cookie → získá `user.id`
3. Zavolá funkci `startNewSession(user.id)`:
   - Pokud máš aktivní session, nejdřív ji **ukončí** (archivuje chat)
   - Vytvoří nový session objekt:
     ```json
     {
       "id": "session-1733097600000",
       "startedAt": 1733097600000,
       "messageCount": 0,
       "messagesFile": "chat-history-990422aa-6e44-4b1c-949c-133fc1c8c440.json"
     }
     ```
   - Nastaví `user.activeSessionId = "session-1733097600000"`
   - Přidá session do `user.sessions` array
   - **Smaže** starý soubor `chat-history-{id}.json` (pokud existuje)
   - Uloží změny do `users.json`

4. Frontend dostane odpověď → **vyčistí chat feed** (setMessages([]))

Teď jsi připravený přijímat zprávy.

### 5. Simulace Zprávy (Tady Začíná Magie)

Otevřeš Simulator Panel, vyplníš:
- Username: "StreamerX"
- Message: "Hello World!"
- Toggleneš "SUB" badge
- Klikneš "Simulate Message"

**Teď následuje nejdůležitější část celého systému:**

#### Krok 5.1: Frontend Validace
```javascript
if (!form.user.trim() || !form.text.trim()) return;
```
Zkontroluje se, že jsi vyplnil username i text.

#### Krok 5.2: Vytvoření Payloadu
```javascript
const payload = {
  streamerId: user.id,  // Tvoje ID ze session cookie
  user: "StreamerX",
  text: "Hello World!",
  isSub: true,
  isVip: false,
  isMod: false,
  color: "#ffffff"
}
```

#### Krok 5.3: HTTP POST Request
```
POST /api/producers/twitch
Headers: Cookie: streamer_session=...
Body: {payload}
```

Frontend nastaví `isSending: true` (zobrazí "Processing...").

#### Krok 5.4: Producer API Handler

**Autorizace:**
```typescript
const session = cookies().get("streamer_session");
if (!session?.value) return 401 Unauthorized;
const user = JSON.parse(session.value);
```
Ověří, že jsi přihlášený. Získá tvoje `user.id` ze session.

**Validace:**
```typescript
if (!payload.user.trim() || !payload.text.trim()) {
  return 400 Bad Request;
}
```

**Dispatch do Workeru:**
```typescript
dispatchToWorker("Twitch", {
  streamerId: user.id,
  user: payload.user,
  text: payload.text,
  // ... badges
});
```

**Odpověď:**
```
200 OK {"ok": true}
```
Frontend dostane odpověď za ~20ms, zobrazí "Sent!" a resetuje textové pole.

#### Krok 5.5: Worker Manager

```typescript
function dispatchToWorker(platform, payload) {
  const worker = getUnifiedWorker(); // Singleton
  worker.postMessage({...payload, platform: "Twitch"});
}
```

Worker Manager buď vrátí existující Worker thread, nebo ho vytvoří (pokud ještě neexistuje).

Pak pošle zprávu přes `postMessage()`. To je **asynchronní** - neblokuje to main thread.

#### Krok 5.6: Worker Thread Přijme Zprávu

V Worker threadu běží listener:

```typescript
parentPort.on("message", async (payload) => {
  // Payload = {
  //   streamerId: "990422aa...",
  //   user: "StreamerX",
  //   text: "Hello World!",
  //   platform: "Twitch",
  //   isSub: true
  // }
```

**Normalizace:**
```typescript
const normalized = {
  id: randomUUID(),              // "a1b2c3d4-..."
  streamerId: payload.streamerId,
  user: payload.user.trim(),
  text: payload.text.trim(),
  platform: payload.platform,    // "Twitch"
  timestamp: Date.now(),         // 1733097612345
  isVip: false,
  isSub: true,
  isMod: false,
  color: "#ffffff"
};
```

Worker přidal:
- Unikátní `id` (UUID)
- `timestamp` (přesný čas zpracování)
- Formátování (trim() mezery)

#### Krok 5.7: Získání Mutexu (Kritická Část)

Teď Worker potřebuje zapsat zprávu do shared queue. Ale nemůže jen tak - musí nejdřív získat **zámek**.

```typescript
let attempts = 0;
const maxAttempts = 5;

while (attempts < maxAttempts) {
  try {
    await mutex.acquire(1500); // Timeout 1500ms
    
    // 🔒 ZÍSKAL ZÁMEK - critical section
    try {
      const ok = queue.enqueue(normalized);
      if (!ok) {
        console.warn("Queue full, dropping message");
      }
      return; // Úspěch!
    } finally {
      mutex.release(); // VŽDY uvolni zámek
    }
    
  } catch (err) {
    // Timeout - nepodařilo se získat zámek
    attempts++;
    await sleep(Math.random() * 50 + 20); // 20-70ms náhodné čekání
  }
}
```

**Co se děje v `mutex.acquire()`:**

```typescript
async acquire(timeoutMs = 1500) {
  // Fast path - zkus získat hned
  if (Atomics.compareExchange(this.stateView, 0, 0, 1) === 0) {
    return true; // Získal!
  }
  
  // Slow path - někdo jiný má zámek
  const start = Date.now();
  while (true) {
    if (Date.now() - start > timeoutMs) {
      throw new Error("Mutex timeout");
    }
    
    // Zkus znovu
    if (Atomics.compareExchange(this.stateView, 0, 0, 1) === 0) {
      return true;
    }
    
    // Počkej až se uvolní
    await Atomics.waitAsync(this.stateView, 0, 1, 100);
  }
}
```

**Atomics.compareExchange(array, index, expectedValue, newValue):**
- Podívej se na `array[index]`
- Pokud je tam `expectedValue` (0 = unlocked), nastav na `newValue` (1 = locked)
- Vrať původní hodnotu
- **Celá operace je atomická** (nelze přerušit jiným threadem)

Pokud vrátí 0 → úspěch, získal jsi zámek!
Pokud vrátí 1 → někdo jiný má zámek, musíš čekat.

**Atomics.waitAsync():**
- "Usni" dokud se hodnota nezmění
- Timeout 100ms (pak se probudíš a zkusíš znovu)

#### Krok 5.8: Zápis do Queue

Worker má zámek. Nikdo jiný teď nemůže přistoupit ke queue. Zavolá:

```typescript
const ok = queue.enqueue(normalized);
```

**Co se děje v `enqueue()`:**

```typescript
enqueue(message: ChatMessage): boolean {
  // 1. Zkontroluj kapacitu
  const length = this.controlView[2]; // Přečti LENGTH
  if (length >= this.capacity) {     // 256
    return false; // Queue je plná!
  }
  
  // 2. Serializuj zprávu
  const payload = this.encoder.encode(JSON.stringify(message));
  // "{"id":"a1b2c3d4","user":"StreamerX",...}" → UTF-8 bytes
  
  if (payload.length + 4 > this.slotSize) { // 4092 bytů max
    throw new Error("Message too large");
  }
  
  // 3. Najdi pozici pro zápis
  const tail = this.controlView[1]; // Přečti TAIL pointer (např. 42)
  const offset = tail * this.slotSize; // 42 × 4096 = 172032 bytů
  
  // 4. Zapiš do bufferu
  this.dataView.setUint32(offset, payload.length); // První 4 byty = délka
  this.dataSlice.set(payload, offset + 4);         // Zbytek = JSON data
  
  // 5. Aktualizuj pointers
  this.controlView[1] = (tail + 1) % this.capacity; // TAIL = 43
  this.controlView[2] = length + 1;                 // LENGTH = (původní + 1)
  
  return true;
}
```

**Vizualizace bufferu po zápisu:**

```
Offset 172032 (slot 42):
[0-3]   → 0x000000B4 (180 bytů délka payloadu)
[4-183] → {"id":"a1b2c3d4","streamerId":"990422aa","user":"StreamerX",...}
[184-4095] → prázdné (reserved)

Control Buffer:
[0] HEAD   = 0    (odtud se bude číst)
[1] TAIL   = 43   (sem se zapíše příští zpráva)
[2] LENGTH = 1    (v queue je 1 zpráva)
```

#### Krok 5.9: Uvolnění Mutexu

```typescript
finally {
  mutex.release();
}
```

```typescript
release() {
  Atomics.store(this.stateView, 0, 0); // Nastav mutex na 0 (unlocked)
  Atomics.notify(this.stateView, 0, 1); // Probuď 1 čekající thread
}
```

Mutex je volný. Pokud nějaký jiný thread čekal v `Atomics.waitAsync()`, teď se probudí a zkusí zámek získat.

Worker thread dokončil svoji práci. **Trvalo to ~5ms**.

### 6. Socket.IO Pump Vybírá Zprávy (Consumer)

Každých 50ms běží funkce `pump()` v main threadu:

```typescript
setInterval(async () => {
  await mutex.acquire(); // Získej zámek
  
  try {
    let message = queue.dequeue();
    let count = 0;
    
    while (message && count < 50) {
      // Zpracuj zprávu
      const roomName = `streamer:${message.streamerId}`;
      io.to(roomName).emit('chat:message', message);
      
      saveMessage(message); // Ulož do JSON souboru
      
      message = queue.dequeue();
      count++;
    }
  } finally {
    mutex.release();
  }
}, 50);
```

**Předpokládejme, že pump právě proběhl před 25ms. Za dalších 25ms proběhne znovu.**

#### Krok 6.1: Pump Získá Zámek

Uplynulo 50ms od posledního cyklu. Pump zkusí:

```typescript
await mutex.acquire();
```

Pokud Worker thread právě nezapisuje (což je pravděpodobné, protože zápis trval jen ~1ms), zámek je volný. Pump ho získá okamžitě.

#### Krok 6.2: Čtení z Queue

```typescript
let message = queue.dequeue();
```

**Co se děje v `dequeue()`:**

```typescript
dequeue(): ChatMessage | null {
  // 1. Zkontroluj jestli je co číst
  if (this.controlView[2] === 0) { // LENGTH = 0?
    return null; // Queue je prázdná
  }
  
  // 2. Najdi pozici pro čtení
  const head = this.controlView[0];    // HEAD = 0
  const offset = head * this.slotSize; // 0 × 4096 = 0
  
  // 3. Přečti délku payloadu
  const length = this.dataView.getUint32(offset); // Prvních 4 byty
  
  // 4. Přečti payload
  const payload = this.dataSlice.slice(
    offset + 4,
    offset + 4 + length
  ); // Byty 4-183
  
  // 5. Aktualizuj pointers
  this.controlView[0] = (head + 1) % this.capacity; // HEAD = 1
  this.controlView[2] -= 1;                         // LENGTH = 0
  
  // 6. Deserializuj
  const json = this.decoder.decode(payload);
  return JSON.parse(json) as ChatMessage;
}
```

**Control Buffer po dequeue:**
```
[0] HEAD   = 1  (příští čtení bude ze slotu 1)
[1] TAIL   = 43 (příští zápis bude do slotu 43)
[2] LENGTH = 0  (queue je zase prázdná)
```

Pump má zprávu v proměnné `message`:

```javascript
{
  id: "a1b2c3d4-...",
  streamerId: "990422aa-6e44-4b1c-949c-133fc1c8c440",
  user: "StreamerX",
  text: "Hello World!",
  platform: "Twitch",
  timestamp: 1733097612345,
  isSub: true,
  color: "#ffffff"
}
```

#### Krok 6.3: Socket.IO Broadcast

```typescript
const roomName = `streamer:${message.streamerId}`;
// roomName = "streamer:990422aa-6e44-4b1c-949c-133fc1c8c440"

io.to(roomName).emit('chat:message', message);
```

Socket.IO najde všechny sockety, které jsou v roomu `streamer:990422aa-...` a pošle jim event `chat:message` s payloadem.

**Kdo je v tom roomu?** Ty! Když se tvůj frontend připojil, zavolal `socket.emit('join', streamerId)` a server tě přidal: `socket.join(roomName)`.

Pokud by byl v roomu i někdo jiný (třeba moderátor sledující tvůj stream), dostal by zprávu taky.

#### Krok 6.4: Persistence

```typescript
saveMessage(message);
```

```typescript
function saveMessage(message: ChatMessage) {
  const streamerId = message.streamerId;
  const file = `chat-history-${streamerId}.json`;
  
  let history = [];
  if (fs.existsSync(file)) {
    history = JSON.parse(fs.readFileSync(file, 'utf-8'));
  }
  
  history.push(message);
  
  if (history.length > 2000) {
    history = history.slice(-2000); // Drž max 2000 zpráv
  }
  
  fs.writeFileSync(file, JSON.stringify(history, null, 2));
}
```

Zpráva se připojí na konec souboru `chat-history-990422aa-6e44-4b1c-949c-133fc1c8c440.json`.

Tento soubor je tvůj **aktivní chat log**. Dokud stream běží, pumpuje se sem každá zpráva.

#### Krok 6.5: Pokračování Loop

```typescript
message = queue.dequeue(); // Zkus přečíst další
count++; // count = 1
```

Queue je prázdná (LENGTH = 0), takže `dequeue()` vrátí `null`.

```typescript
while (message && count < 50) {
  // message = null → loop končí
}
```

#### Krok 6.6: Uvolnění Mutexu

```typescript
finally {
  mutex.release();
}
```

Pump uvolnil zámek. **Celá operace trvala ~3-5ms** (čtení + Socket.IO emit + file write).

Queue je znovu dostupná pro Worker thread.

### 7. Frontend Přijme Zprávu

Tvůj browser má otevřené WebSocket spojení s Socket.IO serverem. Server právě emitoval event:

```typescript
io.to("streamer:990422aa-...").emit('chat:message', message);
```

#### Krok 7.1: Socket Event Handler

V React komponentě:

```typescript
socket.on('chat:message', (message) => {
  handleIncomingMessage(message);
});
```

#### Krok 7.2: Deduplication Check

```typescript
function handleIncomingMessage(message) {
  // Zkontroluj jestli už zprávu máš
  if (messageIds.current.has(message.id)) {
    return; // Duplicita, ignoruj
  }
  
  // Přidej do Setu
  messageIds.current.add(message.id);
  
  // Aktualizuj React state
  setMessages(prev => sortMessages([...prev, message]));
}
```

**Proč deduplication?**
- Socket.IO může doručit zprávu vícekrát (reconnect, network glitch)
- Polling fallback (každé 2s) může načíst stejnou zprávu
- Bez deduplication by se zprávy duplikovaly v UI

#### Krok 7.3: React Re-render

```typescript
setMessages(prev => [...prev, message]);
```

React detekuje změnu state → spustí re-render.

Komponenta `ChatMessageItem` se renderuje pro novou zprávu:

```tsx
<ChatMessageItem message={message} />
```

#### Krok 7.4: Auto-scroll

```typescript
useEffect(() => {
  if (feedRef.current) {
    feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }
}, [messages]);
```

Když se messages změní, scroll se posune dolů → nová zpráva je viditelná.

**Hotovo!** Zpráva se objevila v UI. **Celková latence:** ~50-80ms od kliknutí na tlačítko.

---

## Architektura - Vizuální Přehled

Teď když rozumíš jak to funguje textově, podívejme se na diagramy:

### High-Level Architecture (Všechny Komponenty Pohromadě)

Tohle je celý systém z ptačí perspektivy. Vidíš 5 hlavních vrstev:

1. **Client Layer** - Tvůj browser (React aplikace)
2. **Next.js Server** - Hlavní thread (API Routes + Socket.IO)
3. **Concurrency Layer** - Worker thread (zpracování zpráv)
4. **Shared Memory** - Sdílená paměť mezi threads (červené boxy = kritické!)
5. **Persistence** - JSON soubory na disku

**Důležité šipky:**
- **C → D**: HTTP requesty (registrace, login, posílání zpráv)
- **D → H**: Dispatch zpráv do Worker threadu
- **H ↔ I, J**: Worker zapisuje do shared queue přes mutex
- **G ↔ I, J**: Pump čte ze shared queue přes mutex
- **B ↔ E**: WebSocket spojení (real-time zprávy)
- **G → M**: Každá zpráva se persistuje do JSON

```mermaid
graph TB
    subgraph "Client Layer (Browser)"
        A[React Frontend]
        B[Socket.IO Client]
        C[HTTP Client]
    end
    
    subgraph "Next.js Server (Main Thread)"
        D[API Routes]
        E[Socket.IO Server]
        F[Auth Middleware]
        G[Socket Pump - 50ms Interval]
    end
    
    subgraph "Concurrency Layer (Worker Thread)"
        H[Unified Producer Worker]
    end
    
    subgraph "Shared Memory (SharedArrayBuffer)"
        I[Ring Buffer Queue]
        J[Mutex State]
        K[Control Metadata]
    end
    
    subgraph "Persistence Layer (Filesystem)"
        L[users.json]
        M[chat-history-{userId}.json]
        N[archive-{userId}-{sessionId}.json]
    end
    
    A --> C
    A --> B
    C --> D
    D --> H
    B <--> E
    
    H <--> I
    H <--> J
    G <--> I
    G <--> J
    
    E --> G
    G --> M
    D --> L
    
    style I fill:#ff6b6b
    style J fill:#ff6b6b
    style H fill:#4ecdc4
    style G fill:#ffe66d
```

### 1.2 Technology Stack

```mermaid
graph LR
    subgraph "Frontend"
        A1[Next.js 14]
        A2[React 18]
        A3[Tailwind CSS v4]
        A4[Socket.IO Client]
        A5[TypeScript]
    end
    
    subgraph "Backend"
        B1[Node.js 18+]
        B2[Next.js API Routes]
        B3[Socket.IO Server]
        B4[Worker Threads]
        B5[bcryptjs]
    end
    
    subgraph "Concurrency Primitives"
        C1[SharedArrayBuffer]
        C2[Atomics API]
        C3[Int32Array Views]
        C4[DataView]
    end
    
    subgraph "Persistence"
        D1[File System - fs module]
        D2[JSON Storage]
    end
    
    A1 --> B2
    A4 --> B3
    B4 --> C1
    B4 --> C2
    B2 --> D1
```

---

## 2. Shared Memory - Jak Funguje Sdílená Paměť

Představ si že Main Thread a Worker Thread jsou dvě samostatné programy. Normálně nemůžou vidět navzájem své proměnné. Pokud chceš poslat data, musíš použít `postMessage()` → serializace JSON → posílání → deserializace.

CrossChat tohle řeší **SharedArrayBuffer** - to je kus paměti, který vidí **oba thready současně**. Je to jako sdílený whiteboard v kanceláři - jeden člověk píše zleva, druhý čte zprava, ale píšou na **stejnou tabuli**.

### Jak Je Paměť Rozdělená

CrossChat alokuje **3 samostatné SharedArrayBuffer bloky**:

1. **Control Buffer** (12 bytů) - 3 čísla: HEAD, TAIL, LENGTH
2. **Data Buffer** (1 MB) - 256 slotů, každý 4096 bytů = místo pro 256 zpráv
3. **Mutex Buffer** (4 byty) - 1 číslo: 0 = odemčeno, 1 = zamčeno

Tohle je vizualizace jak vypadají tyto buffery v paměti:

```mermaid
graph TB
    subgraph "Shared Memory Structure"
        A[SharedArrayBuffer - Control<br/>12 bytes]
        B[SharedArrayBuffer - Data<br/>256 slots × 4096 bytes = 1MB]
        C[SharedArrayBuffer - Mutex<br/>4 bytes]
    end
    
    subgraph "Control Buffer Layout"
        D[Index 0: HEAD pointer<br/>4 bytes Int32]
        E[Index 1: TAIL pointer<br/>4 bytes Int32]
        F[Index 2: LENGTH counter<br/>4 bytes Int32]
    end
    
    subgraph "Data Buffer Layout"
        G[Slot 0: 4096 bytes]
        H[Slot 1: 4096 bytes]
        I[...]
        J[Slot 255: 4096 bytes]
    end
    
    subgraph "Mutex Buffer"
        K[Index 0: Lock State<br/>0=unlocked, 1=locked]
    end
    
    A --> D
    A --> E
    A --> F
    B --> G
    B --> H
    B --> I
    B --> J
    C --> K
    
    style A fill:#ff6b6b
    style B fill:#ff6b6b
    style C fill:#ff6b6b
```

### Ring Buffer (Kruhová Fronta) - Proč Kruh?

Normální fronta funguje tak, že přidáváš na konec a bereš ze začátku. Ale co se stane když dojdeš na konec pole? Musíš přesouvat všechny prvky zpátky na začátek = pomalé!

**Ring buffer** řeší tohle chytře: Představ si to jako hodiny. HEAD a TAIL jsou ručičky:
- **TAIL** (ručička pro zápis) - Sem se píše nová zpráva
- **HEAD** (ručička pro čtení) - Odtud se čte zpráva

Když TAIL dojde na pozici 255 (poslední slot), **příští zápis jde na pozici 0**. Proto "ring" = kruh.

**Výhody:**
- ✅ Žádné přesouvání dat
- ✅ O(1) složitost pro enqueue i dequeue
- ✅ Fixní paměť (1 MB, nezabírá víc)

**Jak vypadá jeden slot:**

**Slot Structure (Each 4096 bytes):**

```
┌─────────────────────────────────────────┐
│ Byte 0-3:   Payload Length (UInt32)    │
├─────────────────────────────────────────┤
│ Byte 4-4095: JSON Payload (UTF-8)      │
│              {                          │
│                "id": "uuid",            │
│                "streamerId": "...",     │
│                "user": "...",           │
│                "text": "...",           │
│                "platform": "...",       │
│                "timestamp": 123456,     │
│                ...                      │
│              }                          │
└─────────────────────────────────────────┘
```

**Enqueue Algorithm:**

```mermaid
flowchart TD
    A[Start: enqueue message] --> B{Check if queue full<br/>length >= capacity?}
    B -->|Yes| C[Return false - Queue Full]
    B -->|No| D[Serialize message to JSON<br/>UTF-8 encode]
    
    D --> E{Check payload size<br/>< 4092 bytes?}
    E -->|No| F[Throw Error: Message too large]
    E -->|Yes| G[Get current TAIL index]
    
    G --> H[Calculate byte offset<br/>offset = TAIL × 4096]
    H --> I[Write payload length at offset]
    I --> J[Write payload data at offset+4]
    
    J --> K[Update TAIL = TAIL + 1 % capacity]
    K --> L[Update LENGTH = LENGTH + 1]
    L --> M[Return true - Success]
    
    style B fill:#ffe66d
    style E fill:#ffe66d
```

**Dequeue Algorithm:**

```mermaid
flowchart TD
    A[Start: dequeue message] --> B{Check if queue empty<br/>length == 0?}
    B -->|Yes| C[Return null]
    B -->|No| D[Get current HEAD index]
    
    D --> E[Calculate byte offset<br/>offset = HEAD × 4096]
    E --> F[Read payload length from offset]
    F --> G[Read payload bytes<br/>from offset+4 to offset+4+length]
    
    G --> H[Update HEAD = HEAD + 1 % capacity]
    H --> I[Update LENGTH = LENGTH - 1]
    
    I --> J[Decode UTF-8 to string]
    J --> K[Parse JSON to ChatMessage object]
    K --> L[Return ChatMessage]
    
    style B fill:#ffe66d
```

### 2.3 Mutex Implementation (Lock-Free Synchronization)

```mermaid
sequenceDiagram
    participant T1 as Thread 1 (Worker)
    participant M as Mutex (SharedArrayBuffer)
    participant T2 as Thread 2 (Consumer)
    
    Note over T1: Wants to enqueue message
    T1->>M: Atomics.compareExchange(mutex, 0, 0, 1)
    
    alt Lock acquired (was 0)
        M-->>T1: Returns 0 (success)
        Note over T1: 🔒 CRITICAL SECTION
        T1->>T1: queue.enqueue(message)
        T1->>M: Atomics.store(mutex, 0, 0)
        T1->>M: Atomics.notify(mutex, 0, 1)
        Note over T1: ✅ Lock released
    else Lock busy (was 1)
        M-->>T1: Returns 1 (failed)
        Note over T1: Wait strategy begins
        
        loop Retry with timeout
            T1->>M: Atomics.waitAsync(mutex, 0, 1, 100ms)
            Note over T1: Sleep with jitter<br/>20-70ms
            T1->>M: Atomics.compareExchange(mutex, 0, 0, 1)
            
            alt Eventually succeeds
                M-->>T1: Returns 0 (acquired)
                Note over T1: Proceed to critical section
            else Timeout after 1500ms
                T1->>T1: Throw Error: Mutex timeout
            end
        end
    end
    
    Note over T2: Meanwhile, wants to dequeue
    T2->>M: Atomics.compareExchange(mutex, 0, 0, 1)
    M-->>T2: Returns 1 (busy, T1 holds it)
    T2->>T2: Wait...
```

**Mutex State Transitions:**

```mermaid
stateDiagram-v2
    [*] --> Unlocked: Initial State (value=0)
    
    Unlocked --> Locked: Atomics.compareExchange(0→1)<br/>SUCCESS
    Unlocked --> Unlocked: Atomics.compareExchange(0→1)<br/>FAILED (already locked)
    
    Locked --> Unlocked: mutex.release()<br/>Atomics.store(0)
    
    Locked --> Locked: Another thread tries<br/>compareExchange fails
    
    note right of Locked
        Critical Section
        - queue.enqueue()
        - queue.dequeue()
    end note
    
    note right of Unlocked
        Atomics.notify() wakes
        waiting threads
    end note
```

---

## 3. Thread Communication & Worker Model

### 3.1 Worker Thread Lifecycle

```mermaid
sequenceDiagram
    participant MS as Main Thread (Server)
    participant WM as Worker Manager
    participant WT as Unified Worker Thread
    participant SAB as SharedArrayBuffer
    
    Note over MS: First API request arrives
    MS->>WM: dispatchToWorker(platform, payload)
    
    alt Worker doesn't exist
        WM->>WM: Check globalThis.__crosschat_unified_worker
        Note over WM: Not found - spawn new worker
        
        WM->>SAB: getSharedState().buffers
        Note over SAB: Get existing SharedArrayBuffers<br/>or create new ones
        
        WM->>WT: new Worker(unified.worker.js, {<br/>  workerData: buffers<br/>})
        
        WT->>WT: Initialize SharedMessageQueue<br/>with received buffers
        WT->>WT: Initialize Mutex<br/>with received buffer
        
        WT->>WM: Ready (implicit - starts listening)
        WM->>WM: Store in global cache
    end
    
    WM->>WT: postMessage({...payload, platform})
    
    Note over WT: Process message asynchronously
    
    alt Success
        WT->>WT: Normalize payload
        WT->>SAB: mutex.acquire()
        WT->>SAB: queue.enqueue(normalized)
        WT->>SAB: mutex.release()
    else Error
        WT->>WM: postMessage({type: 'error', message})
        WM->>MS: console.warn(error)
    end
```

### 3.2 Worker Message Processing

```mermaid
flowchart TD
    A[parentPort receives message] --> B[Validate payload<br/>user, text, streamerId present?]
    
    B -->|Invalid| C[console.warn + return]
    B -->|Valid| D[Normalize to ChatMessage format]
    
    D --> E[Generate UUID for message.id]
    D --> F[Add timestamp = Date.now]
    D --> G[Add platform from payload]
    D --> H[Copy badges: isVip, isSub, isMod]
    
    E --> I[Merge into normalized object]
    F --> I
    G --> I
    H --> I
    
    I --> J[Initialize retry loop<br/>attempts = 0, maxAttempts = 5]
    
    J --> K{attempts < maxAttempts?}
    K -->|No| L[Log error: Lock timeout<br/>Drop message]
    K -->|Yes| M[Try mutex.acquire 1500ms]
    
    M --> N{Acquired successfully?}
    N -->|Yes| O[🔒 CRITICAL SECTION]
    N -->|No| P[Caught timeout error]
    
    O --> Q[Call queue.enqueue normalized]
    Q --> R{Enqueue successful?}
    
    R -->|No - Queue Full| S[Warn: Queue full<br/>postMessage error]
    R -->|Yes| T[✅ Message enqueued]
    
    S --> U[mutex.release]
    T --> U
    U --> V[Return - Done]
    
    P --> W[attempts++]
    W --> X[Sleep random 20-70ms<br/>exponential backoff]
    X --> K
    
    style O fill:#ff6b6b
    style T fill:#51cf66
    style L fill:#ff6b6b
```

### 3.3 Worker Data Bootstrap

```mermaid
graph TB
    subgraph "Main Thread Preparation"
        A[getSharedState called]
        A --> B[Check globalThis.__crosschat_state]
        B -->|Not exists| C[Create new SharedMessageQueue<br/>capacity: 256, slotSize: 4096]
        C --> D[Create new Mutex]
        D --> E[Store in global singleton]
        
        E --> F[Extract buffers object]
        F --> G[control: SharedArrayBuffer]
        F --> H[data: SharedArrayBuffer]
        F --> I[mutex: SharedArrayBuffer]
        F --> J[capacity: 256]
        F --> K[slotSize: 4096]
    end
    
    subgraph "Worker Thread Initialization"
        L[Worker spawns]
        L --> M[Receive workerData]
        M --> N[Reconstruct SharedMessageQueue<br/>using received buffers]
        M --> O[Reconstruct Mutex<br/>using received buffer]
        
        N --> P[Same memory reference as Main!]
        O --> P
    end
    
    G --> N
    H --> N
    I --> O
    
    style P fill:#51cf66
    style C fill:#ffe66d
```

**Key Insight:** Both threads hold **references to the same SharedArrayBuffer instances**, enabling zero-copy communication.

---

## 4. Data Flow & Message Pipeline

### 4.1 Complete Message Journey

```mermaid
graph TB
    subgraph "Step 1: User Interaction"
        A[User types in simulator]
        B[Fills username, text, badges, color]
        C[Clicks 'Simulate Message']
    end
    
    subgraph "Step 2: Frontend Validation"
        D[Check user.trim and text.trim]
        E{Valid?}
    end
    
    subgraph "Step 3: HTTP POST Request"
        F[Construct ProducerPayload]
        G[POST /api/producers/platform]
        H[Include session cookie]
    end
    
    subgraph "Step 4: API Handler"
        I[Verify session cookie]
        J[Extract streamerId from session]
        K[Validate JSON payload]
        L[Call dispatchToWorker]
    end
    
    subgraph "Step 5: Worker Manager"
        M[Get/Create singleton worker]
        N[worker.postMessage payload]
    end
    
    subgraph "Step 6: Worker Thread Processing"
        O[Receive via parentPort]
        P[Normalize + Generate UUID]
        Q[Acquire mutex with retry]
        R[queue.enqueue]
        S[Release mutex]
    end
    
    subgraph "Step 7: Shared Queue"
        T[Message stored in ring buffer<br/>at TAIL position]
        U[TAIL pointer increments]
        V[LENGTH counter increments]
    end
    
    subgraph "Step 8: Socket.IO Pump - 50ms interval"
        W[Timer fires every 50ms]
        X[Acquire mutex]
        Y[Dequeue up to 50 messages]
        Z[Release mutex]
    end
    
    subgraph "Step 9: Broadcasting"
        AA[For each message:<br/>io.to room.emit]
        AB[saveMessage to JSON file]
    end
    
    subgraph "Step 10: Client Receives"
        AC[socket.on 'chat:message']
        AD[Check message.id not duplicate]
        AE[Add to React state]
        AF[Render in UI]
    end
    
    A --> B --> C --> D
    D --> E
    E -->|Yes| F
    E -->|No| STOP1[Show validation error]
    
    F --> G --> H --> I
    I --> J --> K --> L
    L --> M --> N --> O
    O --> P --> Q --> R --> S --> T
    T --> U --> V --> W
    W --> X --> Y --> Z --> AA
    AA --> AB --> AC
    AC --> AD --> AE --> AF
    
    style R fill:#ff6b6b
    style Y fill:#ff6b6b
    style AF fill:#51cf66
```

### 4.2 Timing Diagram (Real-World Latency)

```mermaid
gantt
    title Message Latency Breakdown (Typical Case)
    dateFormat SSS
    axisFormat %L ms
    
    section Frontend
    User clicks button           :a1, 000, 5ms
    React state update           :a2, after a1, 3ms
    
    section Network
    HTTP POST request            :b1, after a2, 15ms
    
    section Backend
    API handler processing       :c1, after b1, 2ms
    Session validation           :c2, after c1, 1ms
    Worker dispatch              :c3, after c2, 1ms
    
    section Worker Thread
    Message received             :d1, after c3, 1ms
    Mutex acquisition            :d2, after d1, 2ms
    Queue enqueue                :d3, after d2, 1ms
    Mutex release                :d4, after d3, 1ms
    
    section Waiting
    Wait for pump cycle          :e1, after d4, 25ms
    
    section Consumer
    Pump acquires mutex          :f1, after e1, 2ms
    Dequeue message              :f2, after f1, 1ms
    Socket.IO emit               :f3, after f2, 2ms
    File write                   :f4, after f2, 5ms
    
    section Client
    WebSocket receive            :g1, after f3, 5ms
    React state update           :g2, after g1, 3ms
    DOM render                   :g3, after g2, 2ms
```

**Total Average Latency:** ~75ms from click to visible message

---

## 5. Security & Authentication

### 5.1 Authentication Flow

```mermaid
sequenceDiagram
    participant U as User Browser
    participant F as Frontend (React)
    participant A as /api/auth/register
    participant DB as users.json
    participant L as /api/auth/login
    participant C as Cookie Storage
    
    Note over U,C: Registration Flow
    
    U->>F: Fill registration form<br/>username + password
    F->>F: Client validation<br/>password.length >= 6
    
    F->>A: POST /api/auth/register<br/>{username, password}
    
    A->>A: Validate input<br/>Check password length
    A->>DB: findUserByUsername(username)
    
    alt Username exists
        DB-->>A: User found
        A-->>F: 409 Conflict<br/>"Username taken"
        F-->>U: Show error
    else Username available
        DB-->>A: null
        A->>A: bcrypt.hash(password, 10)
        Note over A: Generate salt + hash<br/>~100ms computation
        
        A->>A: Create User object<br/>{id: UUID(), username, passwordHash, createdAt}
        A->>DB: saveUser(newUser)
        DB->>DB: Write to users.json<br/>Append to array
        
        A-->>F: 200 OK {ok: true}
        F-->>U: Redirect to /login
    end
    
    Note over U,C: Login Flow
    
    U->>F: Fill login form
    F->>L: POST /api/auth/login<br/>{username, password}
    
    L->>DB: findUserByUsername(username)
    
    alt User not found
        DB-->>L: null
        L-->>F: 401 Unauthorized
        F-->>U: "Invalid credentials"
    else User found
        DB-->>L: User object with passwordHash
        L->>L: bcrypt.compare(password, user.passwordHash)
        Note over L: Constant-time comparison<br/>~100ms
        
        alt Password matches
            L->>C: Set-Cookie: streamer_session<br/>value={id, username}<br/>httpOnly, secure, maxAge=7days
            C-->>L: Cookie stored
            L-->>F: 200 OK {ok: true, user}
            F->>F: Store user in React state
            F-->>U: Redirect to /dashboard
        else Password wrong
            L-->>F: 401 Unauthorized
            F-->>U: "Invalid credentials"
        end
    end
```

### 5.2 Session Management

```mermaid
flowchart TD
    A[Client makes authenticated request] --> B[Extract cookie header]
    B --> C{Cookie 'streamer_session' exists?}
    
    C -->|No| D[Return 401 Unauthorized]
    C -->|Yes| E[Parse cookie value as JSON]
    
    E --> F{Valid JSON?}
    F -->|No| G[Return 401 Invalid Session]
    F -->|Yes| H[Extract user.id and user.username]
    
    H --> I[Proceed with request<br/>Use user.id for streamerId]
    
    style D fill:#ff6b6b
    style G fill:#ff6b6b
    style I fill:#51cf66
```

**Cookie Structure:**
```json
{
  "name": "streamer_session",
  "value": "{\"id\":\"abc-123\",\"username\":\"streamer1\"}",
  "httpOnly": true,
  "secure": true,  // Only in production
  "path": "/",
  "maxAge": 604800  // 7 days in seconds
}
```

### 5.3 Security Measures

```mermaid
graph TB
    subgraph "Password Security"
        A1[bcrypt hashing]
        A2[Salt rounds: 10]
        A3[Constant-time comparison]
        A4[Min length: 6 chars]
    end
    
    subgraph "Session Security"
        B1[httpOnly flag prevents XSS]
        B2[secure flag for HTTPS only]
        B3[No token in localStorage]
        B4[Server-side validation on every request]
    end
    
    subgraph "Input Validation"
        C1[Username/password presence check]
        C2[Trim whitespace]
        C3[JSON parsing with try-catch]
        C4[Type validation for payload fields]
    end
    
    subgraph "Authorization"
        D1[streamerId from session user.id]
        D2[Users can only send to their own stream]
        D3[Room-based isolation in Socket.IO]
        D4[File paths scoped to userId]
    end
    
    style A1 fill:#51cf66
    style B1 fill:#51cf66
    style D3 fill:#51cf66
```

**Threat Mitigation:**

| Threat | Mitigation |
|--------|-----------|
| **SQL Injection** | N/A - Using JSON file storage |
| **XSS** | httpOnly cookies, React auto-escaping |
| **CSRF** | Same-origin policy, httpOnly cookies |
| **Password Cracking** | bcrypt with 10 rounds (~100ms per attempt) |
| **Session Hijacking** | Secure cookies in production |
| **Race Conditions** | Mutex-protected critical sections |
| **Memory Corruption** | TypeScript + validated indexes |

---

## 6. Persistence & Session Management

### 6.1 File Storage Architecture

```mermaid
graph TB
    subgraph "Root Directory"
        A[users.json]
        B[chat-history-{userId}.json]
        C[archive-{userId}-{sessionId}.json]
    end
    
    subgraph "users.json Structure"
        D["Array of User objects<br/>[{<br/>  id: UUID,<br/>  username: string,<br/>  passwordHash: string,<br/>  createdAt: timestamp,<br/>  activeSessionId?: string,<br/>  sessions: StreamSession[]<br/>}]"]
    end
    
    subgraph "Active Chat File"
        E["chat-history-{userId}.json<br/>Array of ChatMessage<br/>Max 2000 messages<br/>Continuously updated"]
    end
    
    subgraph "Archive Files"
        F["archive-{userId}-{sessionId}.json<br/>Immutable snapshot<br/>Created on session end"]
    end
    
    A --> D
    B --> E
    C --> F
    
    style E fill:#ffe66d
    style F fill:#51cf66
```

### 6.2 Session Lifecycle

```mermaid
stateDiagram-v2
    [*] --> NoActiveSession: User registered
    
    NoActiveSession --> ActiveSession: POST /api/stream/control<br/>{action: 'start'}
    
    state ActiveSession {
        [*] --> StreamRunning
        StreamRunning --> ReceivingMessages: Messages arriving
        ReceivingMessages --> StreamRunning: Continue streaming
        
        note right of ReceivingMessages
            chat-history-{userId}.json
            being written to continuously
        end note
    }
    
    ActiveSession --> Archiving: POST /api/stream/control<br/>{action: 'end'}
    
    state Archiving {
        [*] --> ReadActiveFile
        ReadActiveFile --> CountMessages
        CountMessages --> RenameFile
        RenameFile --> UpdateSession
        UpdateSession --> [*]
        
        note right of RenameFile
            chat-history-{userId}.json
            ↓
            archive-{userId}-{sessionId}.json
        end note
    }
    
    Archiving --> NoActiveSession: session.endedAt set
    
    NoActiveSession --> [*]: User logs out
```

### 6.3 Session Start Process

```mermaid
sequenceDiagram
    participant C as Client
    participant API as /api/stream/control
    participant DB as db.ts
    participant FS as File System
    
    C->>API: POST {action: 'start'}
    API->>API: Verify session cookie<br/>Extract user.id
    
    API->>DB: startNewSession(user.id)
    
    DB->>DB: findUserById(user.id)
    
    alt User has active session
        DB->>DB: Call endSession(user.id) first
        Note over DB: Cleanup previous session
    end
    
    DB->>DB: Create new StreamSession object<br/>{<br/>  id: "session-" + Date.now(),<br/>  startedAt: Date.now(),<br/>  messageCount: 0,<br/>  messagesFile: "chat-history-{userId}.json"<br/>}
    
    DB->>DB: user.activeSessionId = newSession.id
    DB->>DB: user.sessions.push(newSession)
    
    DB->>FS: Check if chat-history-{userId}.json exists
    
    alt File exists
        FS-->>DB: File found
        DB->>FS: fs.unlinkSync(file)
        Note over FS: Delete old active chat file
    end
    
    DB->>FS: Write updated user to users.json
    FS-->>DB: Write complete
    
    DB-->>API: Return newSession
    API-->>C: 200 OK {ok: true, status: 'started'}
    
    C->>C: Clear messages array in React state
    C->>C: Reset messageIds Set
```

### 6.4 Session End & Archive Process

```mermaid
flowchart TD
    A[Client: POST /api/stream/control<br/>{action: 'end'}] --> B[Verify session]
    B --> C[Call endSession user.id]
    
    C --> D[Find user by ID]
    D --> E{Has activeSessionId?}
    
    E -->|No| F[Return - Nothing to end]
    E -->|Yes| G[Find session in user.sessions array<br/>by activeSessionId]
    
    G --> H[Set session.endedAt = Date.now]
    
    H --> I[Build file paths:<br/>activeFile = chat-history-{userId}.json<br/>archiveFile = archive-{userId}-{sessionId}.json]
    
    I --> J{Active file exists?}
    
    J -->|No| K[Skip archiving]
    J -->|Yes| L[Read active file]
    
    L --> M[Parse JSON to array]
    M --> N[Count messages<br/>session.messageCount = msgs.length]
    
    N --> O[Rename file:<br/>fs.renameSync activeFile → archiveFile]
    
    O --> P[Update session.messagesFile<br/>= archiveFile name]
    
    K --> Q[Set user.activeSessionId = undefined]
    P --> Q
    
    Q --> R[Save updated user to users.json]
    R --> S[Return to API]
    S --> T[Response: 200 OK {status: 'ended'}]
    
    style O fill:#51cf66
    style R fill:#ffe66d
```

### 6.5 Message Persistence

```mermaid
sequenceDiagram
    participant P as Socket Pump
    participant SM as saveMessage function
    participant FS as File System
    
    loop Every 50ms
        P->>P: Dequeue messages from queue
        
        loop For each message
            P->>SM: saveMessage(message)
            
            SM->>SM: Extract streamerId from message
            SM->>SM: Build file path<br/>chat-history-{streamerId}.json
            
            SM->>FS: Check if file exists
            
            alt File exists
                FS-->>SM: File found
                SM->>FS: Read file content
                FS-->>SM: JSON string
                SM->>SM: Parse to ChatMessage[]
            else File doesn't exist
                FS-->>SM: Not found
                SM->>SM: Initialize empty array []
            end
            
            SM->>SM: Push new message to array
            
            SM->>SM: Check array length
            
            alt Length > 2000
                SM->>SM: Trim: array.slice(-2000)
                Note over SM: Keep only last 2000 messages
            end
            
            SM->>FS: Write JSON.stringify(array, null, 2)
            
            alt Write success
                FS-->>SM: Write complete
            else Write error
                FS-->>SM: Error
                SM->>SM: console.error(error)
                Note over SM: Message lost but logged
            end
        end
    end
```

---

## 7. Real-time Communication (Socket.IO)

### 7.1 Socket.IO Server Initialization

```mermaid
sequenceDiagram
    participant C as Client Browser
    participant NP as Next.js Page API
    participant SH as /pages/api/socket.ts
    participant IO as Socket.IO Server
    participant P as Pump Loop
    
    Note over C: User loads /dashboard page
    
    C->>NP: GET /api/socket
    Note over C: Wake up Socket.IO server
    
    NP->>SH: Handle request
    SH->>SH: Check res.socket.server.io
    
    alt Socket.IO not initialized
        SH->>IO: new IOServer(res.socket.server, {<br/>  path: '/api/socket',<br/>  transports: ['websocket', 'polling']<br/>})
        
        IO->>IO: Set up connection handler
        
        IO->>SH: Server instance
        SH->>SH: res.socket.server.io = io
        SH->>SH: Attach to server object
    end
    
    SH->>P: startPump(io)
    
    P->>P: Check if pump already running
    
    alt Pump not running
        P->>P: setInterval(pump, 50ms)
        P->>P: Store interval ID in global
        Note over P: Pump loop now active
    end
    
    SH-->>NP: res.end()
    NP-->>C: 200 OK (Empty response)
    
    Note over C: Now connect Socket.IO client
    
    C->>IO: io(socketUrl, {path: '/api/socket'})
    
    alt WebSocket available
        IO-->>C: Upgrade to WebSocket
        Note over C,IO: Persistent connection established
    else WebSocket unavailable
        IO-->>C: Long-polling mode
    end
    
    IO->>SH: 'connection' event fired
    SH->>SH: socket.on('join', streamerId => {...})
    
    C->>IO: socket.emit('join', streamerId)
    IO->>IO: socket.join("streamer:{streamerId}")
    
    Note over IO: Client added to room
```

### 7.2 Socket.IO Room Architecture

```mermaid
graph TB
    subgraph "Socket.IO Server"
        A[IO Server Instance]
    end
    
    subgraph "Rooms (Multi-tenancy)"
        B["Room: streamer:user-abc-123"]
        C["Room: streamer:user-def-456"]
        D["Room: streamer:user-ghi-789"]
    end
    
    subgraph "Connected Clients"
        E[Socket 1<br/>socketId: xyz1]
        F[Socket 2<br/>socketId: xyz2]
        G[Socket 3<br/>socketId: xyz3]
        H[Socket 4<br/>socketId: xyz4]
    end
    
    A --> B
    A --> C
    A --> D
    
    B --> E
    B --> F
    C --> G
    D --> H
    
    style B fill:#ffe66d
    style C fill:#ffe66d
    style D fill:#ffe66d
```

**Room Isolation Logic:**

```mermaid
flowchart TD
    A[Pump dequeues message] --> B[Extract message.streamerId]
    B --> C[Build roomName = 'streamer:' + streamerId]
    
    C --> D[io.to roomName.emit 'chat:message']
    
    D --> E{Which sockets in room?}
    
    E --> F[Find all sockets that called<br/>socket.join roomName]
    
    F --> G[Broadcast ONLY to those sockets]
    
    G --> H[Other rooms' clients<br/>DO NOT receive this message]
    
    style G fill:#51cf66
    style H fill:#ffe66d
```

### 7.3 Pump Loop Mechanics

```mermaid
flowchart TD
    A[Timer: Every 50ms] --> B[pump function executes]
    
    B --> C[Try acquire mutex]
    C --> D{Acquired?}
    
    D -->|Timeout| E[Log error<br/>Skip this cycle]
    D -->|Success| F[🔒 CRITICAL SECTION BEGINS]
    
    F --> G[message = queue.dequeue]
    G --> H[count = 0]
    
    H --> I{message != null AND count < 50?}
    
    I -->|No| J[Break loop]
    I -->|Yes| K[Extract message.streamerId]
    
    K --> L[roomName = 'streamer:' + streamerId]
    L --> M[io.to roomName.emit 'chat:message']
    
    M --> N[ALSO: io.emit 'chat:message:global'<br/>with streamerId included]
    
    N --> O[saveMessage message]
    
    O --> P[count++]
    P --> Q[message = queue.dequeue]
    Q --> I
    
    J --> R[mutex.release]
    R --> S[✅ CRITICAL SECTION ENDS]
    
    E --> T[Wait 50ms]
    S --> T
    T --> A
    
    style F fill:#ff6b6b
    style S fill:#51cf66
```

**Why Dual Broadcast?**

```mermaid
graph LR
    A[Primary: io.to room.emit] --> B[Targets specific room]
    C[Fallback: io.emit global] --> D[All clients receive<br/>but filter by streamerId]
    
    B --> E[Efficient routing]
    D --> F[Debugging safety net]
    
    style A fill:#51cf66
    style C fill:#ffe66d
```

### 7.4 Client-Side Socket Handling

```mermaid
sequenceDiagram
    participant UI as React Component
    participant SC as Socket.IO Client
    participant SS as Socket.IO Server
    participant DB as Database API
    
    Note over UI: Component mounts (useEffect)
    
    UI->>DB: GET /api/socket (wake server)
    DB-->>UI: 200 OK
    
    UI->>SC: io(url, {path, transports})
    SC->>SS: Connection handshake
    
    SS-->>SC: 'connect' event
    SC->>UI: setIsConnected(true)
    UI->>SC: socket.emit('join', streamerId)
    
    SC->>SS: Join request
    SS->>SS: socket.join("streamer:{id}")
    
    Note over UI,SS: Socket ready, waiting for messages
    
    SS->>SC: emit('chat:message', message)
    SC->>UI: Fire event handler
    
    UI->>UI: Check if message.id in messageIds Set
    
    alt Duplicate
        UI->>UI: Ignore message
    else New message
        UI->>UI: messageIds.add(message.id)
        UI->>UI: setMessages(prev => [...prev, message])
        UI->>UI: Re-render chat feed
    end
    
    Note over UI: Also polling fallback
    
    loop Every 2 seconds
        UI->>DB: GET /api/messages
        DB-->>UI: {messages: ChatMessage[]}
        UI->>UI: Merge with existing messages<br/>using deduplication
    end
```

---

## 8. Frontend Architecture

### 8.1 Component Hierarchy

```mermaid
graph TB
    subgraph "App Router Structure"
        A[layout.tsx<br/>Root Layout]
        B[page.tsx<br/>Landing Page]
        C[login/page.tsx]
        D[register/page.tsx]
        E[dashboard/page.tsx]
    end
    
    subgraph "Shared Components"
        F[components/navbar.tsx]
        G[components/footer.tsx]
        H[components/stream-dashboard.tsx]
    end
    
    subgraph "Stream Dashboard Internals"
        I[Live Feed Panel]
        J[History Panel]
        K[Stream Controls]
        L[Simulator Panel]
        M[ChatMessageItem]
    end
    
    A --> B
    A --> C
    A --> D
    A --> E
    
    A --> F
    A --> G
    E --> H
    
    H --> I
    H --> J
    H --> K
    H --> L
    I --> M
    J --> M
    
    style H fill:#4ecdc4
    style E fill:#ffe66d
```

### 8.2 State Management (React)

```mermaid
graph TB
    subgraph "StreamDashboard Component State"
        A[messages: ChatMessage[]]
        B[isConnected: boolean]
        C[socketId: string | null]
        D[activePlatform: ProducerPlatform]
        E[view: 'live' | 'history']
        F[sessions: Session[]]
        G[forms: Record<Platform, FormState>]
    end
    
    subgraph "Refs (Non-reactive)"
        H[feedRef: HTMLDivElement]
        I[messageIds: Set<string>]
        J[socketRef: Socket | null]
    end
    
    subgraph "Derived State"
        K[sortedMessages = useMemo]
        L[activeForm = forms[activePlatform]]
    end
    
    A --> K
    G --> L
    
    style A fill:#ffe66d
    style I fill:#51cf66
```

**State Update Flow:**

```mermaid
sequenceDiagram
    participant WS as WebSocket Event
    participant H as handleIncomingMessage
    participant S as React State
    participant R as Re-render
    
    WS->>H: socket.on('chat:message', msg)
    
    H->>H: Check message.streamerId matches
    
    alt Wrong streamer
        H->>H: return early
    else Correct streamer
        H->>S: setMessages(prev => {...})
        
        S->>S: Check if messageIds.has(msg.id)
        
        alt Duplicate
            S->>S: return prev (no update)
        else New
            S->>S: messageIds.add(msg.id)
            S->>S: sortMessages([...prev, msg])
            S->>R: Trigger re-render
            
            R->>R: Map messages to ChatMessageItem
            R->>R: Auto-scroll feedRef to bottom
        end
    end
```

### 8.3 Simulator Panel Logic

```mermaid
flowchart TD
    A[User interacts with simulator] --> B{Action type?}
    
    B -->|Select platform| C[setActivePlatform platform]
    B -->|Type username| D[handleInputChange platform, 'user', value]
    B -->|Type message| E[handleInputChange platform, 'text', value]
    B -->|Toggle badge| F[handleInputChange platform, key, !value]
    B -->|Pick color| G[handleInputChange platform, 'color', value]
    B -->|Click send| H[handleSubmit platform]
    
    C --> I[Update forms state]
    D --> I
    E --> I
    F --> I
    G --> I
    
    I --> J[Re-render simulator UI]
    
    H --> K{Validate form}
    K -->|Empty user/text| L[Return early - No action]
    K -->|Valid| M[Build ProducerPayload object]
    
    M --> N[setForms: isSending = true]
    N --> O[POST /api/producers/platform]
    
    O --> P{Response status?}
    
    P -->|Error| Q[setForms: status error message]
    P -->|Success| R[setForms: Reset text only<br/>Keep user, color, badges]
    
    R --> S[Show success toast 2s]
    S --> T[setTimeout fetchMessages, 100ms]
    
    style H fill:#ffe66d
    style O fill:#4ecdc4
```

---

## 9. Complete User Flow

### 9.1 Registration & First Login

```mermaid
flowchart TD
    START[User visits CrossChat] --> A[Lands on page.tsx - Landing]
    
    A --> B[Clicks 'Start Streaming']
    B --> C[Redirected to /register]
    
    C --> D[Fills form:<br/>username + password]
    D --> E{Valid input?}
    
    E -->|No| F[Show client-side error]
    F --> D
    
    E -->|Yes| G[POST /api/auth/register]
    
    G --> H[Server validates]
    H --> I{Username available?}
    
    I -->|No| J[Return 409 Conflict]
    J --> K[Show 'Username taken']
    K --> D
    
    I -->|Yes| L[bcrypt.hash password 10 rounds]
    L --> M[Generate UUID for user.id]
    M --> N[Save to users.json:<br/>{id, username, passwordHash, createdAt, sessions: []}]
    
    N --> O[Return 200 OK]
    O --> P[Redirect to /login]
    
    P --> Q[User fills login form]
    Q --> R[POST /api/auth/login]
    
    R --> S[Find user by username]
    S --> T{User exists?}
    
    T -->|No| U[Return 401]
    U --> V[Show error]
    V --> Q
    
    T -->|Yes| W[bcrypt.compare password, hash]
    W --> X{Match?}
    
    X -->|No| U
    X -->|Yes| Y[Set httpOnly cookie:<br/>streamer_session = {id, username}]
    
    Y --> Z[Return 200 OK + user data]
    Z --> AA[Store user in React state]
    AA --> AB[Redirect to /dashboard]
    
    AB --> DASHBOARD
    
    style L fill:#ffe66d
    style W fill:#ffe66d
    style Y fill:#51cf66
```

### 9.2 Dashboard - Starting a Stream Session

```mermaid
sequenceDiagram
    participant U as User
    participant D as Dashboard UI
    participant API as /api/stream/control
    participant DB as Database
    participant FS as File System
    
    U->>D: Lands on /dashboard
    D->>D: useEffect: Initialize Socket.IO
    D->>D: Fetch /api/socket (wake server)
    D->>D: io.connect()
    D->>D: socket.emit('join', user.id)
    
    Note over D: Connected to real-time feed
    
    U->>D: Clicks "Start New Stream"
    D->>API: POST /api/stream/control<br/>{action: 'start'}
    
    API->>DB: startNewSession(user.id)
    
    alt Has previous active session
        DB->>DB: endSession(user.id) first
        DB->>FS: Rename chat-history to archive
    end
    
    DB->>DB: Create new StreamSession object
    DB->>DB: user.activeSessionId = newSession.id
    DB->>DB: user.sessions.push(newSession)
    
    DB->>FS: Delete chat-history-{userId}.json if exists
    DB->>FS: Write updated user to users.json
    
    DB-->>API: newSession
    API-->>D: 200 OK {status: 'started'}
    
    D->>D: setMessages([]) - Clear UI
    D->>D: messageIds.current = new Set()
    
    Note over D: Ready to receive messages
```

### 9.3 Sending & Receiving a Message (Full Cycle)

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant SIM as Simulator Panel
    participant API as /api/producers/twitch
    participant WM as Worker Manager
    participant W as Worker Thread
    participant Q as Shared Queue
    participant P as Socket Pump
    participant IO as Socket.IO Server
    participant C as Client Socket
    participant UI as Chat Feed UI
    
    U->>SIM: Types username "StreamerX"
    U->>SIM: Types message "Hello World!"
    U->>SIM: Toggles isSub = true
    U->>SIM: Clicks "Simulate Message"
    
    SIM->>SIM: Validate user.trim() && text.trim()
    SIM->>SIM: Build payload {<br/>  streamerId: user.id,<br/>  user: "StreamerX",<br/>  text: "Hello World!",<br/>  isSub: true<br/>}
    
    SIM->>API: POST /api/producers/twitch<br/>payload + session cookie
    
    API->>API: Verify session cookie
    API->>API: Extract streamerId from session
    API->>WM: dispatchToWorker("Twitch", payload)
    
    WM->>WM: Get/create singleton worker
    WM->>W: worker.postMessage({...payload, platform: "Twitch"})
    
    API-->>SIM: 200 OK {ok: true}
    SIM->>SIM: Show success toast
    
    Note over W: WORKER THREAD PROCESSING
    
    W->>W: Receive message via parentPort
    W->>W: Normalize:<br/>+ id: randomUUID()<br/>+ timestamp: Date.now()<br/>+ platform: "Twitch"
    
    W->>Q: mutex.acquire(1500ms timeout)
    
    alt Mutex acquired
        Q-->>W: Lock granted
        W->>Q: queue.enqueue(normalized)
        Q->>Q: Write to SharedArrayBuffer:<br/>- Store at TAIL index<br/>- Increment TAIL<br/>- Increment LENGTH
        W->>Q: mutex.release()
        Q->>Q: Atomics.notify(mutex)
    else Timeout
        W->>W: Retry with backoff (max 5 attempts)
    end
    
    Note over P: PUMP CYCLE (every 50ms)
    
    P->>Q: Timer fires (50ms elapsed)
    P->>Q: mutex.acquire()
    Q-->>P: Lock granted
    
    P->>Q: queue.dequeue()
    Q->>Q: Read from SharedArrayBuffer:<br/>- Read at HEAD index<br/>- Increment HEAD<br/>- Decrement LENGTH
    Q-->>P: Return normalized message
    
    P->>P: Extract message.streamerId
    P->>IO: io.to("streamer:{streamerId}").emit('chat:message', msg)
    P->>FS: saveMessage(msg)
    
    Note over FS: Append to chat-history-{userId}.json
    
    P->>Q: mutex.release()
    
    Note over IO: SOCKET BROADCAST
    
    IO->>C: Emit to room members only
    
    C->>UI: socket.on('chat:message', msg)
    
    UI->>UI: handleIncomingMessage(msg)
    UI->>UI: Check messageIds.has(msg.id)
    
    alt Duplicate
        UI->>UI: Ignore
    else New
        UI->>UI: messageIds.add(msg.id)
        UI->>UI: setMessages(prev => [...prev, msg])
        UI->>UI: sortMessages by timestamp
        UI->>UI: Auto-scroll feed to bottom
        
        Note over UI: Message visible in chat feed!
    end
    
    U->>UI: Sees "StreamerX: Hello World!" with SUB badge
```

**Timing Breakdown for Above Sequence:**

| Step | Component | Avg Time | Cumulative |
|------|-----------|----------|------------|
| 1-6 | Frontend validation | ~5ms | 5ms |
| 7-10 | HTTP POST request | ~15ms | 20ms |
| 11-13 | API handler + dispatch | ~3ms | 23ms |
| 14-19 | Worker normalization + enqueue | ~5ms | 28ms |
| 20 | Waiting for pump cycle | ~0-50ms | ~50ms |
| 21-27 | Pump dequeue + broadcast | ~5ms | 55ms |
| 28-33 | WebSocket delivery + render | ~10ms | **~65ms** |

### 9.4 Viewing History

```mermaid
flowchart TD
    A[User on Dashboard] --> B[Clicks History tab icon]
    B --> C[setView 'history']
    
    C --> D[useEffect triggers]
    D --> E[Disconnect Socket.IO]
    D --> F[GET /api/stream/sessions]
    
    F --> G[Backend: cookies get session]
    G --> H[Extract user.id]
    H --> I[findUserById user.id]
    
    I --> J[Return user.sessions array]
    J --> K[Frontend: setSessions array]
    
    K --> L[Render sessions list on left panel]
    
    L --> M{User clicks a session?}
    
    M -->|Yes| N[fetchMessages archiveFile]
    N --> O[GET /api/messages?archive=filename]
    
    O --> P[Backend: loadHistory undefined, archiveFile]
    P --> Q[Read archive file from disk]
    Q --> R[Parse JSON to ChatMessage array]
    R --> S[Return {messages: array}]
    
    S --> T[Frontend: setMessages array]
    T --> U[Render messages in right panel]
    
    M -->|No| V[Wait for user action]
    
    style U fill:#51cf66
```

### 9.5 Ending Stream & Logout

```mermaid
sequenceDiagram
    participant U as User
    participant D as Dashboard
    participant API as /api/stream/control
    participant DB as db.ts
    participant FS as File System
    participant L as /api/auth/logout
    
    Note over U,FS: Ending Active Stream
    
    U->>D: Clicks "End & Archive"
    D->>API: POST {action: 'end'}
    
    API->>DB: endSession(user.id)
    DB->>DB: Find active session
    DB->>DB: Set session.endedAt = now
    
    DB->>FS: Read chat-history-{userId}.json
    FS-->>DB: ChatMessage[] (e.g. 145 messages)
    
    DB->>DB: session.messageCount = 145
    DB->>FS: Rename to archive-{userId}-{sessionId}.json
    DB->>DB: session.messagesFile = archive filename
    
    DB->>DB: user.activeSessionId = undefined
    DB->>FS: Write updated user to users.json
    
    DB-->>API: Success
    API-->>D: 200 OK {status: 'ended'}
    
    D->>D: setMessages([]) - Clear feed
    
    Note over U,L: Logging Out
    
    U->>D: Clicks Logout
    D->>L: GET /api/auth/logout
    
    L->>L: cookies().delete('streamer_session')
    L-->>D: 200 OK
    
    D->>D: Clear user state
    D->>D: Disconnect Socket.IO
    D->>D: Redirect to /
    
    D-->>U: Lands on landing page
```

---

## 10. Race Condition Prevention

### 10.1 Critical Sections Protected by Mutex

```mermaid
graph TB
    subgraph "Unprotected (Race Condition Risk)"
        A1[Worker Thread reads HEAD]
        A2[Consumer Thread reads HEAD]
        A3[Both write to same slot]
        A4[💥 DATA CORRUPTION]
    end
    
    subgraph "Mutex Protected (Safe)"
        B1[Worker: mutex.acquire]
        B2[Worker: Read/Write Queue]
        B3[Worker: mutex.release]
        B4[Consumer: mutex.acquire - WAITS]
        B5[Consumer: Read/Write Queue]
        B6[Consumer: mutex.release]
    end
    
    A1 --> A3
    A2 --> A3
    A3 --> A4
    
    B1 --> B2
    B2 --> B3
    B3 --> B4
    B4 --> B5
    B5 --> B6
    
    style A4 fill:#ff6b6b
    style B2 fill:#51cf66
    style B5 fill:#51cf66
```

### 10.2 Atomics Operations Guarantee

```mermaid
sequenceDiagram
    participant T1 as Thread 1
    participant CPU as CPU (Hardware)
    participant M as Mutex Memory
    participant T2 as Thread 2
    
    Note over T1,T2: Both try to acquire at same time
    
    par Parallel Attempts
        T1->>CPU: Atomics.compareExchange(mutex, 0, 0, 1)
        T2->>CPU: Atomics.compareExchange(mutex, 0, 0, 1)
    end
    
    Note over CPU: Hardware-level atomic operation<br/>Only ONE can succeed
    
    alt Thread 1 wins
        CPU->>M: Set mutex[0] = 1
        CPU-->>T1: Return 0 (was 0, now 1) ✅
        CPU-->>T2: Return 1 (was already 1) ❌
        
        Note over T1: Proceeds to critical section
        Note over T2: Waits (Atomics.waitAsync)
        
        T1->>M: Do work...
        T1->>CPU: Atomics.store(mutex, 0, 0)
        T1->>CPU: Atomics.notify(mutex, 0)
        
        CPU->>T2: Wake up
        T2->>CPU: Retry compareExchange
        CPU-->>T2: Success this time
    else Thread 2 wins
        CPU->>M: Set mutex[0] = 1
        CPU-->>T2: Return 0 ✅
        CPU-->>T1: Return 1 ❌
        Note over T2: Similar flow, roles reversed
    end
```

### 10.3 Deadlock Prevention Strategy

```mermaid
flowchart TD
    A[Thread attempts mutex.acquire] --> B[Set timeout: 1500ms]
    B --> C[Start retry loop]
    
    C --> D{Attempt < maxAttempts?}
    D -->|No| E[Throw error<br/>Message dropped but logged]
    D -->|Yes| F[Try Atomics.compareExchange]
    
    F --> G{Acquired lock?}
    G -->|Yes| H[✅ Enter critical section]
    G -->|No| I[Lock currently held]
    
    I --> J[Atomics.waitAsync 100ms]
    J --> K[Sleep random 20-70ms<br/>Exponential backoff + jitter]
    
    K --> L[Increment attempt counter]
    L --> D
    
    H --> M[Perform queue operation]
    M --> N[mutex.release ALWAYS<br/>in finally block]
    
    N --> O[Atomics.store mutex = 0]
    O --> P[Atomics.notify wake waiters]
    
    style E fill:#ff6b6b
    style H fill:#51cf66
    style N fill:#ffe66d
```

**Why No Deadlock:**

1. **Timeout on acquisition** - Thread gives up after 1500ms
2. **Single lock design** - No lock ordering issues (only 1 mutex)
3. **Finally block guarantee** - Lock always released even on exception
4. **Exponential backoff** - Reduces contention over time
5. **Jitter** - Random delays prevent thundering herd

### 10.4 Queue Full Scenario

```mermaid
sequenceDiagram
    participant P as Producer (Worker)
    participant Q as Queue (capacity=256)
    participant C as Consumer (Pump)
    
    Note over Q: Queue currently at 250/256
    
    loop High message rate
        P->>Q: enqueue(message)
        Q->>Q: length++
    end
    
    Note over Q: Queue now 256/256 FULL
    
    P->>Q: enqueue(message)
    Q->>Q: Check: length >= capacity?
    Q-->>P: Return false (queue full)
    
    P->>P: Log warning: Queue full
    P->>P: parentPort.postMessage({type: 'error'})
    Note over P: ⚠️ Message DROPPED
    
    Note over C: Pump cycle continues
    
    C->>Q: mutex.acquire()
    C->>Q: dequeue() × 50
    Q->>Q: length -= 50
    
    Note over Q: Queue now 206/256
    
    C->>Q: mutex.release()
    
    Note over P: Next message will succeed
```

**Mitigation:**
- **Large capacity** (256 slots)
- **High pump frequency** (50ms = 20 cycles/sec)
- **Batch dequeue** (up to 50 messages per cycle = 1000 msg/sec throughput)
- **Monitoring** (errors logged to console)

---

## 11. Performance Characteristics

### 11.1 Throughput Analysis

```mermaid
graph TB
    subgraph "Theoretical Maximum"
        A[Queue capacity: 256 messages]
        B[Pump cycle: 50ms]
        C[Batch size: 50 messages/cycle]
        D[Cycles per second: 20]
        E[Max throughput: 1000 msg/sec]
    end
    
    subgraph "Real-World Factors"
        F[Mutex contention]
        G[Worker processing time]
        H[Socket.IO broadcast latency]
        I[File I/O for persistence]
        J[Actual throughput: ~200-400 msg/sec]
    end
    
    C --> E
    D --> E
    
    F --> J
    G --> J
    H --> J
    I --> J
    
    style E fill:#ffe66d
    style J fill:#51cf66
```

### 11.2 Memory Footprint

| Component | Size | Details |
|-----------|------|---------|
| **Control Buffer** | 12 bytes | 3 × Int32 (HEAD, TAIL, LENGTH) |
| **Data Buffer** | 1,048,576 bytes | 256 slots × 4096 bytes |
| **Mutex Buffer** | 4 bytes | 1 × Int32 (lock state) |
| **Total SharedArrayBuffer** | **~1 MB** | Fixed allocation |
| **Worker Thread Stack** | ~1-2 MB | Node.js worker overhead |
| **Socket.IO Connections** | ~10 KB/client | Per connected user |
| **React State (messages)** | ~100 KB | 300 messages × ~350 bytes avg |

### 11.3 CPU Usage Profile

```mermaid
gantt
    title CPU Time Distribution (1 Second Window)
    dateFormat SSS
    axisFormat %L ms
    
    section Worker Thread
    Idle waiting for messages  :a1, 000, 950ms
    Process 5 messages         :a2, after a1, 50ms
    
    section Main Thread (Pump)
    Pump cycle 1              :b1, 000, 5ms
    Idle                      :b2, after b1, 45ms
    Pump cycle 2              :b3, after b2, 5ms
    Idle                      :b4, after b3, 45ms
    Pump cycle 3              :b5, after b4, 5ms
    ... (20 cycles/sec)       :b6, after b5, 895ms
    
    section Socket.IO
    Broadcast messages        :c1, 005, 3ms
    Broadcast messages        :c2, 055, 3ms
    Broadcast messages        :c3, 105, 3ms
    
    section File I/O
    Write chat-history.json   :d1, 008, 10ms
    Write chat-history.json   :d2, 058, 10ms
```

**Average CPU Load:** ~2-5% on modern processors (idle state)  
**Under Load (100 msg/sec):** ~10-15%

### 11.4 Latency Budget Breakdown

```mermaid
graph LR
    A[User Click] -->|5ms| B[React Handler]
    B -->|15ms| C[HTTP POST]
    C -->|2ms| D[API Validation]
    D -->|1ms| E[Worker Dispatch]
    E -->|5ms| F[Worker Processing]
    F -->|0-50ms| G[Wait for Pump]
    G -->|5ms| H[Socket Broadcast]
    H -->|5ms| I[Client Render]
    
    I -->|Total: 38-88ms| J[Message Visible]
    
    style G fill:#ffe66d
    style J fill:#51cf66
```

**P50 Latency:** ~65ms  
**P95 Latency:** ~120ms  
**P99 Latency:** ~200ms (during high contention)

---

## Appendix: Configuration Reference

### Environment Variables

```bash
# Optional - Socket.IO URL override
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# Node environment
NODE_ENV=development  # or production
```

### Queue Configuration

```typescript
// src/lib/shared-state.ts
const queue = new SharedMessageQueue({
  capacity: 256,      // Max messages in queue
  slotSize: 4096,     // Bytes per message slot
});
```

### Pump Configuration

```typescript
// src/pages/api/socket.ts
setInterval(pump, 50);  // 50ms = 20 Hz

while (message && count < 50) {
  // Process up to 50 messages per cycle
}
```

### Worker Retry Configuration

```typescript
// src/workers/unified.worker.ts
const maxAttempts = 5;          // Max lock acquisition retries
await mutex.acquire(1500);      // 1500ms timeout per attempt
await sleep(Math.random() * 50 + 20);  // 20-70ms backoff
```

---

## Summary

**CrossChat** demonstrates production-ready patterns for:

✅ **Multi-threaded concurrency** using Worker Threads  
✅ **Lock-free synchronization** with Atomics and SharedArrayBuffer  
✅ **Real-time communication** via Socket.IO with room-based routing  
✅ **Race condition prevention** through mutex-protected critical sections  
✅ **Session management** with file-based persistence and archiving  
✅ **Type-safe architecture** with TypeScript throughout  
✅ **Modern frontend** with Next.js 14 App Router and React 18  

**Key Architectural Decisions:**

1. **Single Unified Worker** - Eliminates lock contention between platforms
2. **Ring Buffer Queue** - Fixed memory allocation, O(1) enqueue/dequeue
3. **Hybrid Delivery** - Socket.IO primary, polling fallback for reliability
4. **Multi-tenancy via Rooms** - Isolated streams without database overhead
5. **Exponential Backoff** - Graceful degradation under high load

---

*Generated for CrossChat v0.1.0*  
*Documentation last updated: 2025-12-01*

