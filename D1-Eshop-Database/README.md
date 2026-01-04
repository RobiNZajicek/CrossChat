# 🛒 E-Shop - Databazovy Projekt

## ⚠️ OZNACENI: D1 - Repository Pattern

Tento projekt splnuje zadani **D1 - Repository Pattern** pro predmet Databaze.

---

## 📋 RYCHLY PREHLED PRO TESTERA

| Polozka | Umisteni |
|---------|----------|
| **SQL skripty** | `/src/sql/` |
| **Backend (Python/Flask)** | `/src/backend/` |
| **Frontend (Next.js)** | `/src/app/`, `/src/components/` |
| **Dokumentace** | `/doc/` |
| **Testovaci scenare** | `/doc/test_scenario_*.md` |
| **Konfigurace** | `.env.example` → `.env` |

---

## 🚀 INSTALACE KROK ZA KROKEM

### Pozadavky na skolni PC

Pred instalaci overit, ze je na PC nainstalováno:

- [ ] **Python 3.10+** (ověřit: `python --version`)
- [ ] **Node.js 18+** (ověřit: `node --version`)
- [ ] **ODBC Driver 17 for SQL Server** (ověřit v ODBC Data Sources)
- [ ] **SQL Server Management Studio** (pro import databáze)
- [ ] **Git** (ověřit: `git --version`)

---

### KROK 1: Stáhnout projekt

```bash
git clone https://github.com/RobiNZajicek/basic_eshop_for_school.git
cd basic_eshop_for_school
```

Nebo stáhnout jako ZIP a rozbalit.

---

### KROK 2: Připravit databázi

#### 2.1 Otevřít SQL Server Management Studio (SSMS)

1. Spustit SSMS
2. Připojit se k databázovému serveru:
   - **Server:** `<adresa školního serveru>` nebo `localhost`
   - **Authentication:** SQL Server Authentication
   - **Login:** `<váš login>`
   - **Password:** `<vaše heslo>`

#### 2.2 Vytvořit tabulky

1. Pravý klik na vaši databázi → **New Query**
2. Otevřít soubor: `src/sql/01_create_tables.sql`
3. Zkopírovat celý obsah do Query okna
4. Kliknout **Execute** (F5)
5. ✅ Měli byste vidět: "Commands completed successfully"

#### 2.3 Vytvořit views

1. Otevřít: `src/sql/02_create_views.sql`
2. Zkopírovat do SSMS
3. Spustit (F5)

#### 2.4 Naplnit testovací data

1. Otevřít: `src/sql/03_seed_data.sql`
2. Zkopírovat do SSMS
3. Spustit (F5)

#### ✅ Kontrola databáze

V SSMS byste měli vidět:
- **5 tabulek:** users, categories, products, orders, order_items
- **2 views:** v_order_details, v_product_stats

---

### KROK 3: Nastavit backend

#### 3.1 Vytvořit konfigurační soubor

1. Ve složce `e-shop` najít soubor `.env.example`
2. Zkopírovat ho jako `.env`:
   ```bash
   copy .env.example .env
   ```
   nebo ručně zkopírovat a přejmenovat

3. Otevřít `.env` v textovém editoru a vyplnit:

```
DB_SERVER=<adresa-serveru>
DB_NAME=<nazev-vasi-databaze>
DB_USER=<vas-login>
DB_PASSWORD=<vase-heslo>
DB_DRIVER=ODBC Driver 17 for SQL Server
FLASK_DEBUG=True
```

**Příklad:**
```
DB_SERVER=193.85.203.188
DB_NAME=zajicek3
DB_USER=zajicek3
DB_PASSWORD=mojeHeslo123
DB_DRIVER=ODBC Driver 17 for SQL Server
FLASK_DEBUG=True
```

#### 3.2 Nainstalovat Python závislosti

Otevřít terminál (PowerShell) ve složce projektu:

```bash
pip install flask pyodbc python-dotenv flask-cors
```

#### 3.3 Spustit backend

```bash
cd src/backend
python app.py
```

**✅ Úspěšné spuštění vypadá takto:**
```
==================================================
E-SHOP API SERVER
==================================================
Server: http://127.0.0.1:5000
Database: <server>/<databaze>
==================================================
 * Running on http://127.0.0.1:5000
```

#### 3.4 Ověřit backend

Otevřít prohlížeč: `http://localhost:5000/api/health`

**✅ Očekávaná odpověď:**
```json
{"database": "connected", "status": "ok"}
```

---

### KROK 4: Spustit frontend

#### 4.1 Otevřít NOVÝ terminál

Nechat backend běžet a otevřít druhý terminál!

#### 4.2 Nainstalovat Node.js závislosti

```bash
cd e-shop
npm install
```

#### 4.3 Spustit frontend

```bash
npm run dev
```

**✅ Úspěšné spuštění:**
```
▲ Next.js 16.x.x
- Local: http://localhost:3000
```

#### 4.4 Otevřít aplikaci

Otevřít prohlížeč: `http://localhost:3000`

---

## 📱 POUŽITÍ APLIKACE

### Webové stránky

| URL | Popis |
|-----|-------|
| `http://localhost:3000` | Homepage - doporučené produkty |
| `http://localhost:3000/products` | Seznam všech produktů |
| `http://localhost:3000/cart` | Nákupní košík |
| `http://localhost:3000/admin` | Admin panel (report + import) |

### Testování funkcí

1. **Prohlížení produktů:** Jít na `/products`
2. **Přidání do košíku:** Kliknout "Přidat do košíku"
3. **Vytvoření objednávky:** Jít na `/cart` → "Objednat"
4. **Report:** Jít na `/admin` - vidět statistiky
5. **Import:** Na `/admin` vložit JSON a importovat

---

## ✅ SPLNĚNÍ ZADÁNÍ

### D1 - Repository Pattern

Implementováno v `src/backend/repositories/`:

| Soubor | Popis |
|--------|-------|
| `base_repository.py` | Základní třída s CRUD metodami |
| `product_repository.py` | Práce s produkty |
| `category_repository.py` | Práce s kategoriemi |
| `user_repository.py` | Práce s uživateli + transakce |
| `order_repository.py` | Práce s objednávkami + CRUD více tabulek |

### Požadavky

| Požadavek | Splněno | Kde |
|-----------|---------|-----|
| 5 tabulek | ✅ | `src/sql/01_create_tables.sql` |
| 2 views | ✅ | `src/sql/02_create_views.sql` |
| M:N vazba | ✅ | order_items (orders ↔ products) |
| DECIMAL (float) | ✅ | price, credits |
| BIT (bool) | ✅ | is_active, is_featured |
| CHECK (enum) | ✅ | status |
| VARCHAR | ✅ | name, email |
| DATETIME | ✅ | created_at |
| CRUD více tabulek | ✅ | OrderRepository.create_order() |
| Transakce | ✅ | transfer_credits(), create_order() |
| Report 3+ tabulek | ✅ | /api/report |
| Import JSON | ✅ | /api/import/products |
| Config soubor | ✅ | .env |
| Error handling | ✅ | Validace vstupů, chybové hlášky |

---

## 📁 STRUKTURA PROJEKTU

```
e-shop/
├── README.md               ← Tento soubor
├── .env.example            ← Vzor konfigurace
├── .env                    ← Vaše konfigurace (vytvořit!)
├── package.json            ← Node.js závislosti
├── requirements.txt        ← Python závislosti
│
├── doc/                    ← DOKUMENTACE
│   ├── test_scenario_1_installation.md
│   ├── test_scenario_2_functions.md
│   └── test_scenario_3_errors.md
│
└── src/
    ├── sql/                ← DATABÁZOVÉ SKRIPTY
    │   ├── 01_create_tables.sql
    │   ├── 02_create_views.sql
    │   └── 03_seed_data.sql
    │
    ├── backend/            ← FLASK API
    │   ├── app.py
    │   ├── config.py
    │   ├── database.py
    │   └── repositories/
    │       ├── base_repository.py
    │       ├── product_repository.py
    │       ├── category_repository.py
    │       ├── user_repository.py
    │       └── order_repository.py
    │
    ├── app/                ← NEXT.JS FRONTEND
    │   ├── page.js
    │   ├── layout.js
    │   ├── products/
    │   ├── cart/
    │   └── admin/
    │
    ├── components/         ← REACT KOMPONENTY
    │   ├── Navbar.js
    │   └── ProductCard.js
    │
    └── lib/                ← HELPER FUNKCE
        └── api.js
```

---

## 🧪 TESTOVACÍ SCÉNÁŘE

Testovací scénáře jsou ve složce `/doc/`:

1. **test_scenario_1_installation.md** - Instalace a spuštění
2. **test_scenario_2_functions.md** - Testování funkcí
3. **test_scenario_3_errors.md** - Testování chybových stavů

---

## ❗ ČASTÉ PROBLÉMY

### Backend se nespustí

| Chyba | Řešení |
|-------|--------|
| `ModuleNotFoundError: flask` | Spustit `pip install flask` |
| `Login failed for user` | Zkontrolovat heslo v `.env` |
| `ODBC Driver not found` | Nainstalovat ODBC Driver 17 |

### Frontend se nespustí

| Chyba | Řešení |
|-------|--------|
| `npm: command not found` | Nainstalovat Node.js |
| `Module not found` | Spustit `npm install` |

### API vrací chybu

| Chyba | Řešení |
|-------|--------|
| `Failed to fetch` | Backend neběží - spustit `python app.py` |
| `database: error` | Špatné přihlašovací údaje v `.env` |

---

## 📞 KONTAKT

**Autor:** zajicek3
**Předmět:** Databáze
**Rok:** 2026
**Označení:** D1 - Repository Pattern

---

## 📝 LICENCE

Školní projekt - pouze pro vzdělávací účely.
