# Testovaci scenar 3: Testovani chyb a chybovych stavu

**Projekt:** E-Shop (D1 Repository Pattern)
**Autor:** zajicek3
**Datum:** 2026

---

## Predpoklady

- [ ] Aplikace nainstalovana podle scenare 1
- [ ] Backend bezi
- [ ] Frontend bezi

---

## Test 1: Chybna konfigurace databaze

### Kroky:
1. Zastavit backend (Ctrl+C)
2. Upravit `.env` - zmenit heslo na spatne:
   ```
   DB_PASSWORD=spatne_heslo
   ```
3. Spustit backend znovu

### Ocekavany vysledek:
- Backend se spusti
- Pri pristupu na `/api/health`:
  ```json
  {"status": "error", "message": "Login failed..."}
  ```

### Obnoveni:
- Opravit heslo v `.env`
- Restartovat backend

---

## Test 2: Chybejici .env soubor

### Kroky:
1. Prejmenovat `.env` na `.env.backup`
2. Spustit backend

### Ocekavany vysledek:
- Backend pouzije vychozi hodnoty
- Pokusi se pripojit na `localhost`
- Chyba pripojeni (pokud neni lokalni DB)

### Obnoveni:
- Prejmenovat `.env.backup` zpet na `.env`

---

## Test 3: Neplatny JSON pri importu

### Kroky:
1. Prejit na `/admin`
2. Do import pole vlozit neplatny JSON:
   ```
   {toto neni json}
   ```
3. Kliknout "Importovat"

### Ocekavany vysledek:
- Chybova hlaska "Chyba pri importu - zkontroluj JSON format"
- Zadna data se neimportuji

---

## Test 4: Import s chybejicimi povinnymi poli

### Kroky:
1. Na `/admin` vlozit:
   ```json
   {
     "products": [
       {"name": "Test"}
     ]
   }
   ```
2. Kliknout "Importovat"

### Ocekavany vysledek:
- Chyba - chybi `price` a `category_id`
- Produkt se nevytvori

---

## Test 5: Neexistujici produkt

### Kroky (API):
```
GET http://localhost:5000/api/products/99999
```

### Ocekavany vysledek:
- Status: 404
- Odpoved: `{"error": "Produkt nenalezen"}`

---

## Test 6: Smazani neexistujiciho produktu

### Kroky (API):
```
DELETE http://localhost:5000/api/products/99999
```

### Ocekavany vysledek:
- Status: 404
- Odpoved: `{"error": "Produkt nenalezen"}`

---

## Test 7: Prazdna objednavka

### Kroky:
1. Prejit na `/cart` s prazdnym kosikem
2. Kliknout "Objednat"

### Ocekavany vysledek:
- Hlaska "Kosik je prazdny!"
- Objednavka se nevytvori

---

## Test 8: Objednavka s nedostatkem skladu

### Priprava:
```sql
UPDATE products SET stock = 1 WHERE id = 1;
```

### Kroky:
1. Pridat iPhone do kosiku
2. Zmenit mnozstvi na 10
3. Kliknout "Objednat"

### Ocekavany vysledek:
- Chyba "Nedostatek skladu pro produkt 1!"
- Objednavka se NEVYTVORI
- Stock zustane NEZMENENY (rollback)

### Obnoveni:
```sql
UPDATE products SET stock = 10 WHERE id = 1;
```

---

## Test 9: Prevod kreditu - nedostatek

### Kroky (API):
```
POST http://localhost:5000/api/users/transfer-credits
Content-Type: application/json

{
  "from_user_id": 1,
  "to_user_id": 2,
  "amount": 999999
}
```

### Ocekavany vysledek:
- Status: 500
- Chyba "Nedostatek kreditu!"
- Kredity NICI se NEZMENI (rollback)

---

## Test 10: Prevod kreditu - zaporna castka

### Kroky (API):
```
POST http://localhost:5000/api/users/transfer-credits
Content-Type: application/json

{
  "from_user_id": 1,
  "to_user_id": 2,
  "amount": -100
}
```

### Ocekavany vysledek:
- Status: 400
- Odpoved: `{"error": "Castka musi byt kladna"}`

---

## Test 11: Neplatny status objednavky

### Kroky (API):
```
PUT http://localhost:5000/api/orders/1/status
Content-Type: application/json

{
  "status": "neplatny_status"
}
```

### Ocekavany vysledek:
- Status: 400
- Odpoved: `{"error": "Neplatny status! Povolene: ['pending', 'paid', 'shipped', 'delivered']"}`

---

## Test 12: Chybejici povinne pole pri vytvareni produktu

### Kroky (API):
```
POST http://localhost:5000/api/products
Content-Type: application/json

{
  "name": "Test"
}
```

### Ocekavany vysledek:
- Status: 400
- Odpoved: `{"error": "Chybi pole: price"}`

---

## Test 13: Duplicitni email pri registraci

### Priprava:
- Uzivatel `jan@email.cz` uz existuje

### Kroky (API):
```
POST http://localhost:5000/api/users
Content-Type: application/json

{
  "email": "jan@email.cz",
  "password": "heslo",
  "name": "Jiny Jan"
}
```

### Ocekavany vysledek:
- Status: 400
- Odpoved: `{"error": "Email jiz existuje"}`

---

## Test 14: Backend nepripojeny

### Kroky:
1. Zastavit backend (Ctrl+C)
2. Prejit na `http://localhost:3000`

### Ocekavany vysledek:
- Frontend zobrazi "Chyba pri nacitani produktu"
- Graceful error handling

---

## Test 15: Neplatna URL

### Kroky:
```
GET http://localhost:5000/api/neexistuje
```

### Ocekavany vysledek:
- Status: 404
- Not Found

---

## Kontrolni seznam chybovych stavu

| Chyba | Ocekavane chovani | Status |
|-------|-------------------|--------|
| Spatne heslo DB | Chybova hlaska | 500 |
| Neplatny JSON | Chybova hlaska | 400 |
| Neexistujici produkt | "Nenalezen" | 404 |
| Prazdny kosik | Alert "prazdny" | - |
| Nedostatek skladu | Rollback transakce | 500 |
| Nedostatek kreditu | Rollback transakce | 500 |
| Neplatny status | Validacni chyba | 400 |
| Chybejici pole | Validacni chyba | 400 |
| Duplicitni email | Validacni chyba | 400 |

---

## Overeni transakci

**Dulezite:** Pri chybe se musi provest ROLLBACK!

### Test rollbacku:
1. Zjistit aktualni stav:
   ```sql
   SELECT id, name, stock FROM products;
   SELECT id, credits FROM users;
   ```
2. Provest operaci ktera selze
3. Overit ze stav je STEJNY jako pred operaci

---

**Test PASSED** pokud aplikace spravne reaguje na vsechny chybove stavy.

