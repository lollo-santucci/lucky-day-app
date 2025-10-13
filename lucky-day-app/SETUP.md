# Lucky Day App - Setup Guide

## Environment Variables Setup

### 1. OpenAI API Key Configuration

Per abilitare la generazione di soprannomi mistici con AI, devi configurare la tua chiave API OpenAI:

#### Passo 1: Ottieni la chiave API
1. Vai su [OpenAI Platform](https://platform.openai.com/account/api-keys)
2. Accedi al tuo account OpenAI
3. Crea una nuova API key
4. Copia la chiave (inizia con `sk-...`)

#### Passo 2: Configura l'ambiente locale
1. Apri il file `.env` e configura API key e modello:
   ```
   EXPO_PUBLIC_OPENAI_API_KEY=sk-your-actual-api-key-here
   EXPO_PUBLIC_OPENAI_MODEL=gpt-4o
   ```

#### Passo 3: Riavvia l'app
```bash
npm start
```

### 2. Funzionamento senza API Key

L'app funziona anche senza chiave API OpenAI:
- ✅ Tutti i calcoli astrologici funzionano normalmente
- ✅ I soprannomi mistici vengono generati con un sistema di fallback deterministico
- ⚠️ I soprannomi saranno meno creativi (ma comunque validi)

### 3. Deployment in Produzione

Per il deployment con Expo EAS Build:

#### Opzione A: EAS Secrets (Raccomandato)
```bash
# Installa EAS CLI
npm install -g @expo/eas-cli

# Configura il secret
eas secret:create --scope project --name EXPO_PUBLIC_OPENAI_API_KEY --value sk-your-key-here

# Build con secrets
eas build
```

#### Opzione B: File di configurazione
Crea `eas.json` con:
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_OPENAI_API_KEY": "sk-your-key-here"
      }
    }
  }
}
```

### 4. Sicurezza

⚠️ **Importante per la sicurezza:**

- **Mai committare** il file `.env` con chiavi reali
- Le variabili `EXPO_PUBLIC_*` sono **visibili nel client**
- Per produzione, considera un backend proxy per le chiamate API
- Monitora l'uso della tua API key su OpenAI Platform

### 5. Troubleshooting

#### L'app non genera soprannomi AI
1. Verifica che il file `.env` esista
2. Controlla che la variabile inizi con `EXPO_PUBLIC_`
3. Riavvia l'app Expo (`npm start`)
4. Verifica la chiave API su OpenAI Platform

#### Errori di autenticazione
- Controlla che la chiave API sia valida
- Verifica di avere crediti disponibili su OpenAI
- Assicurati che la chiave abbia i permessi per GPT-4o

#### Fallback attivo
Se vedi "using fallback" nei log:
- ✅ È normale se non hai configurato l'API key
- ✅ L'app continua a funzionare correttamente
- ℹ️ I soprannomi saranno deterministici ma validi

## Test della Configurazione

Esegui i test per verificare la configurazione:

```bash
# Test completi
npm test

# Test solo LLM service
npm test -- --testPathPatterns=llm.test.ts

# Test solo astrologia
npm test -- --testPathPatterns=astrology.test.ts
```

Se tutto è configurato correttamente, vedrai:
- ✅ Chiamate API OpenAI (se hai la chiave)
- ✅ Fallback funzionante (se non hai la chiave)
- ✅ Tutti i test passano in entrambi i casi