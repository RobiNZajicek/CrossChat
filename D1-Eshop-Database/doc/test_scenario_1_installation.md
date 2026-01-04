# Testovaci scenar 1: Instalace a spusteni aplikace

**Projekt:** E-Shop (D1 Repository Pattern)
**Autor:** zajicek3
**Datum:** 2026

---

## 1. Predpoklady

Pred spustenim testu overit:
- [ ] Nainstalovany Python 3.10+
- [ ] Nainstalovany Node.js 18+
- [ ] Nainstalovany ODBC Driver 17 for SQL Server
- [ ] Pristup k SQL Server databazi
- [ ] Nainstalovany SQL Server Management Studio (SSMS)

---

## 2. Klonovani repozitare

### Kroky:
1. Otevrit terminal
2. Spustit prikaz:
   ```bash
   git clone <url-repozitare>
   cd e-shop
   ```

### Ocekavany vysledek:
- Slozka `e-shop` vytvorena
- Obsahuje soubory: `README.md`, `package.json`, `requirements.txt`

### Mozne chyby:
| Chyba | Reseni |
|-------|--------|
| `git: command not found` | Nainstalovat Git |
| `Repository not found` | Zkontrolovat URL |

---

## 3. Nastaveni databaze

### 3.1 Pripojeni k SQL Serveru

#### Kroky:
1. Otevrit SQL Server Management Studio
2. Pripojit se k serveru:
   - Server: `<adresa-serveru>`
   - Authentication: SQL Server Authentication
   - Login: `<uzivatel>`
   - Password: `<heslo>`
3. Kliknout Connect

#### Ocekavany vysledek:
- Pripojeni uspesne
- V Object Explorer vidite server

#### Mozne chyby:
| Chyba | Reseni |
|-------|--------|
| Login failed (18456) | Zkontrolovat heslo |
| Cannot connect to server | Zkontrolovat adresu serveru |
| Network error | Zkontrolovat internetove pripojeni |

### 3.2 Vytvoreni tabulek

#### Kroky:
1. V SSMS kliknout pravym na databazi -> New Query
2. Otevrit soubor `src/sql/01_create_tables.sql`
3. Zkopirovat obsah do Query okna
4. Kliknout Execute (F5)

#### Ocekavany vysledek:
- Zprava: "Commands completed successfully"
- V databazi 5 novych tabulek: users, categories, products, orders, order_items

#### Mozne chyby:
| Chyba | Reseni |
|-------|--------|
| Table already exists | Nejdrive smazat existujici tabulky |
| Foreign key error | Spustit skripty ve spravnem poradi |

### 3.3 Vytvoreni views

#### Kroky:
1. Otevrit soubor `src/sql/02_create_views.sql`
2. Spustit v SSMS

#### Ocekavany vysledek:
- 2 nove views: v_order_details, v_product_stats

### 3.4 Naplneni testovacimi daty

#### Kroky:
1. Otevrit soubor `src/sql/03_seed_data.sql`
2. Spustit v SSMS

#### Ocekavany vysledek:
- 3 kategorie, 3 uzivatele, 6 produktu, 3 objednavky

---

## 4. Nastaveni backendu

### 4.1 Vytvoreni .env souboru

#### Kroky:
1. Zkopirovat `.env.example` na `.env`
2. Otevrit `.env` v textovem editoru
3. Vyplnit hodnoty:
   ```
   DB_SERVER=<adresa-serveru>
   DB_NAME=<nazev-databaze>
   DB_USER=<uzivatel>
   DB_PASSWORD=<heslo>
   DB_DRIVER=ODBC Driver 17 for SQL Server
   ```
4. Ulozit

#### Ocekavany vysledek:
- Soubor `.env` vytvoren s vasimi udaji

#### Mozne chyby:
| Chyba | Reseni |
|-------|--------|
| Soubor se neuklada | Zkontrolovat prava k zapisu |

### 4.2 Instalace Python zavislosti

#### Kroky:
1. Otevrit terminal v slozce `e-shop`
2. Spustit:
   ```bash
   pip install flask pyodbc python-dotenv flask-cors
   ```

#### Ocekavany vysledek:
- Vsechny balicky nainstalovany
- Zadne chyby

#### Mozne chyby:
| Chyba | Reseni |
|-------|--------|
| pip not found | Pridat Python do PATH |
| Permission denied | Spustit jako administrator |

### 4.3 Spusteni backendu

#### Kroky:
1. V terminalu prejit do `src/backend`:
   ```bash
   cd src/backend
   ```
2. Spustit:
   ```bash
   python app.py
   ```

#### Ocekavany vysledek:
```
==================================================
E-SHOP API SERVER
==================================================
Server: http://127.0.0.1:5000
Database: <server>/<databaze>
==================================================
 * Running on http://127.0.0.1:5000
```

#### Mozne chyby:
| Chyba | Reseni |
|-------|--------|
| ModuleNotFoundError | Nainstalovat chybejici modul |
| Login failed | Zkontrolovat .env soubor |
| Port already in use | Zmenit FLASK_PORT v .env |

### 4.4 Overeni backendu

#### Kroky:
1. Otevrit prohlizec
2. Prejit na: `http://localhost:5000/api/health`

#### Ocekavany vysledek:
```json
{"database": "connected", "status": "ok"}
```

---

## 5. Nastaveni frontendu

### 5.1 Instalace Node.js zavislosti

#### Kroky:
1. Otevrit NOVY terminal v slozce `e-shop`
2. Spustit:
   ```bash
   npm install
   ```

#### Ocekavany vysledek:
- Slozka `node_modules` vytvorena
- Zadne kriticke chyby

### 5.2 Spusteni frontendu

#### Kroky:
1. Spustit:
   ```bash
   npm run dev
   ```

#### Ocekavany vysledek:
```
▲ Next.js 16.x.x
- Local: http://localhost:3000
```

### 5.3 Overeni frontendu

#### Kroky:
1. Otevrit prohlizec
2. Prejit na: `http://localhost:3000`

#### Ocekavany vysledek:
- Zobrazi se homepage E-Shopu
- Vidite doporucene produkty
- Navigace funguje

---

## 6. Kontrolni seznam

Po uspesne instalaci overit:

- [ ] Backend bezi na portu 5000
- [ ] Frontend bezi na portu 3000
- [ ] `/api/health` vraci "connected"
- [ ] `/api/products` vraci seznam produktu
- [ ] Homepage zobrazuje produkty
- [ ] Navigace funguje (Produkty, Kosik, Admin)

---

## 7. Ukonceni

### Zastaveni serveru:
1. V terminalu backendu: `Ctrl+C`
2. V terminalu frontendu: `Ctrl+C`

---

**Test PASSED** pokud vsechny kroky probehly uspesne.

