# 🦭 Sealary FHE — Vodič za Prezentaciju & Hakaton Pripremu

> **Kompletan vodič za razumevanje tehnologija, strukture ugovora, toka demonstracije i očekivanih pitanja žirija.**

---

## 📋 Sadržaj
1. [Pregled Projekta & Vrednosna Ponuda](#1-pregled-projekta--vrednosna-ponuda)
2. [Tehnologije & Kako One Rade](#2-tehnologije--kako-one-rade)
   - [Zama fhEVM & FHE (Fully Homomorphic Encryption)](#zama-fhevm--fhe-fully-homomorphic-encryption)
   - [Hardhat & Hardhat Network (EVM Emulator)](#hardhat--hardhat-network-evm-emulator)
   - [ERC-4626 & Aave v3 DeFi Yield Engine](#erc-4626--aave-v3-defi-yield-engine)
   - [Next.js 16 & Ethers.js v6 Frontend Architecture](#nextjs-16--ethersjs-v6-frontend-architecture)
3. [Struktura Pametnih Ugovora](#3-struktura-pametnih-ugovora)
   - [FHEYieldPayrollVault.sol (Glavni Trezor)](#fheyieldpayrollvaultsol-glavni-trezor)
   - [AaveV3YieldStrategy.sol (DeFi Strategija)](#aavev3yieldstrategysol-defi-strategija)
   - [MockUSDC.sol (ERC-20 Stablokoin)](#mockusdcsol-erc-20-stablokoin)
4. [Korak-Po-Korak Scenario za Prezentaciju (Demo Script)](#4-korak-po-korak-scenario-za-prezentaciju-demo-script)
5. [Često Postavljana Pitanja Žirija & Pobednički Odgovori (Q&A)](#5-često-postavljana-pitanja-žirija--pobednički-odgovori-qa)

---

## 1. Pregled Projekta & Vrednosna Ponuda

**Sealary FHE** je Web3 platforma za isplatu plata i upravljanje kapitalom kompanija koja kombinuje dve ključne inovacije:

1. **Potpuna Poverljivost Plata (Zama FHE)**: Pojedinačni iznosi plata su šifrovani na klijentu i na blockchain-u zapisani u Zama `euint64` FHE stanju. Javnost vidi samo zbirni budžet kompanije, dok su plate pojedinačnih inženjera 100% tajne.
2. **Automatska Zarada Prinosa (DeFi Yield Engine)**: Neiskorišćena sredstva u trezoru ne stoje neaktivna. 85% novca se automatski plasira u Aave v3 lending bazene, dok se 15% čuva u tečnom baferu za instant isplate radnicima. Ostvarena kamata se deli 50/50 između kompanije i radnika.

---

## 2. Tehnologije & Kako One Rade

### Zama fhEVM & FHE (Fully Homomorphic Encryption)

- **Šta je FHE?**  
  Potpuno Homomorfna Enkripcija (FHE) je sveta grana kriptografije koja omogućava **izvršavanje matematičkih operacija (sabiranje, oduzimanje, množenje) direktno nad šifrovanim podacima bez njihovog prethodnog dešifrovanja**!
  
- **Razlika u odnosu na ZK-Proofs (Zero-Knowledge):**  
  - **ZK-Proof** služi da dokaže *da je nešto tačno* bez otkrivanja podatka (npr. "imam više od 18 godina"). ZK ne omogućava pametnom ugovoru da nastavi računanje nad tim podacima u budućnosti.
  - **FHE** omogućava ugovoru da *trajno čuva šifrovani podatak* u stanju (`euint64`) i da nad njim vrši homomorfne matematičke operacije u proizvoljnom broju budućih transakcija!

- **Zama Tipovi i Funkcije u Našem Kodu:**
  1. **`externalEuint64`**: Tip podatka koji klijent (pretraživač) šalje u transakciji. Predstavlja šifrovani ulaz generisan sa ZK dokazom ulaza.
  2. **`euint64`**: On-chain šifrovana promenljiva u Zama koprocesoru koja čuva 64-bitni ceo broj u šifrovanom stanju.
  3. **`FHE.asEuint64()` / `FHE.fromExternal()`**: Pretvara klijentski ulaz u provereni on-chain `euint64` objekt.
  4. **`FHE.add(a, b)` / `FHE.sub(a, b)`**: Izvršava homomorfno sabiranje i oduzimanje na lancu nad šifrovanim podacima.
  5. **`FHE.allowThis(newBal)`**: Od presudnog značaja! Dodeljuje pametnom ugovoru ACL dozvolu da u narednim transakcijama nastavi homomorfne kalkulacije nad novim saldom.
  6. **`FHE.allow(newBal, employee)`**: Dodeljuje radniku ACL dozvolu da jedino on sa svojim novčanikom može dešifrovati nov saldo.
  7. **EIP-712 Re-encryption**: Radnik svojim privatnim ključem (potpisom) dokazuje vlasništvo nad adresom pre nego što u pretraživaču dešifruje `euint64` heš.

---

### Hardhat & Hardhat Network (EVM Emulator)

- **Lokalni Čvor (Chain ID 31337)**:  
  Hardhat simulira kompletnu Ethereum virtuelnu mašinu u lokalnom okruženju (`http://127.0.0.1:8545`).
- **Time-Warp Kontrola (`evm_increaseTime`)**:  
  Pomoću RPC komande `evm_increaseTime` unapređujemo vreme lokalnog blockchain čvora za 30 dana u 1 sekundi, čime simuliramo realno sakupljanje Aave kamate bez čekanja.

---

### ERC-4626 & Aave v3 DeFi Yield Engine

- **Automatska Alokacija 85% / 15%**:
  - **15% Liquid Buffer**: Zadržava se na ugovoru trezora u USDC-u radi trenutnih isplata radnicima.
  - **85% Deployed Strategy**: Automatski se prebacuje u `AaveV3YieldStrategy.sol` ugovor i ulaže u Aave v3 USDC bazen sa 7.50% APY.
- **Automatski Liquidity Rebalance pri Povlačenju**:
  Ako radnik zatraži isplatu veću od trenutnog 15% tečnog bafera, trezor automatski i u istoj transakciji povlači potreban deficit direktno iz Aave strategije natrag u bafer i isplaćuje radnika bez ikakvog zastoja!

---

### Next.js 16 & Ethers.js v6 Frontend Architecture

- **Zero-MetaMask Popup Execution**:  
  Frontend u pozadini koristi lokalni potpisivač sa nula-MetaMask popups kako bi demonstracija pred žirijem tekla instantno i bez dosadnih skakanja ekstenzija.
- **Live On-Chain Audit Feed & Zama FHE Inspector**:  
  Sve transakcije koje se izvrše na sajtu uživo ispisuju heševe, brojeve blokova i omogucavaju uvid u **Zama FHE EVM Payload** (JSON prikaz šifrovanih `externalEuint64` heševa, ZK dokaza i `FHE.allowThis` dozvola).

---

## 3. Struktura Pametnih Ugovora

```
contracts/
├── FHEYieldPayrollVault.sol       # Glavni trezor (Zama FHE + Yield + 85/15 Rebalance)
├── MockUSDC.sol                   # ERC-20 stablokoin token ($1,000,000 mint)
├── interfaces/
│   └── IYieldStrategy.sol         # Standardni interfejs za DeFi strategije
└── strategies/
    └── AaveV3YieldStrategy.sol    # Strategijski ugovor za Aave v3 (7.50% APY)
```

### FHEYieldPayrollVault.sol (Glavni Trezor)

- **Ključna polja:**
  - `mapping(address => FHEEmployeeBalance) private _employeeBalances;` -> Čuva šifrovana Zama stanja (`encryptedPrincipal`, `encryptedYieldBonus`).
  - `liquidBufferTargetBps = 1500;` -> Ciljnih 15% tečnog bafera.
  - `companyYieldShareBps = 5000;` -> 50% podela prinosa firmi / 50% radnicima.

- **Ključne funkcije:**
  - `depositPayrollBatch(recipients, fheInputs, rawAmounts)`:  
    Prima niz zaposlenih, klijentski šifrovane Zama ulaze i iznose za poravnanje. Izvršava `FHE.asEuint64()` i `_fheAdd()` uz `FHE.allowThis()`.
  - `harvestYield()`:  
    Povlači ostvarenu kamatu od Aave-a i dodeljuje 50% direktno na šifrovana stanja radnika srazmerno njihovim učešćima.
  - `claimSalary(amount)`:  
    Isplaćuje radnika, izvršava `_fheSub()` nad šifrovanim saldom, i ako tečni bafer nije dovoljan, automatski povlači deficit iz Aave strategije.
  - `getEmployeeSettlementBalance(employee)`:  
    Poverljivi getter zaštićen sa `require(msg.sender == employee || msg.sender == employer)` radi ukidanja neovlašćenog javnog uvida u tuđe plate.

---

## 4. Korak-Po-Korak Scenario za Prezentaciju (Demo Script)

1. **Terminal 1**: Pokrenite `npx hardhat node`
2. **Terminal 2**: Pokrenite `npx hardhat run scripts/deploy.js --network localhost`
3. **Terminal 3**: U `frontend` direktorijumu pokrenite `npm run dev` i otvorite **[http://localhost:3000](http://localhost:3000)**.

### Tok prezentacije (3 Minuta Demo):
1. **Prikaz CFO Dashboard-a**:
   - Pokažite zbirne cifre kompanije ($465,000 USDC ukupna glavnica, 15% Liquid Buffer, 85% Aave Strategy).
   - Pokažite listu zaposlenih (Batch Directory) i dodajte novog radnika. Kliknite na **`🔒 Encrypt & Execute Batch Payroll`**.
2. **Demonstracija Zama FHE Payloada**:
   - Skrolujte do **Live On-Chain Audit Feed-a** i kliknite na **`🔍 Inspect Zama FHE Payload`**. Pokažite žiriju šifrovane `externalEuint64` heševe, ZK dokaze i `FHE.allowThis` pravila.
3. **Fast-Forward 30 Days**:
   - Kliknite na **`Fast-Forward 30 Days`**. Pokažite kako je nastalo **+$2,866.44 USDC** novog prinosa, kako je Liquid Buffer trenutno porastao za 15% toga, a Aave ulog za 85%.
4. **Prebacivanje na Employee Portal**:
   - Prebacite na **Employee Portal** karticu. Pokažite kako radnik podrazumevano vidi svoje dešifrovano stanje uz **EIP-712** potpis.
   - Kliknite na **`🔒 View Encrypted Zama FHE Handles`** da pokažete sirovi on-chain Zama `euint64` šifrovani heš (`0xa9f8...`).
5. **Instant Claim sa Automatskim Rebalansom**:
   - Ukucajte iznos za povlačenje veći od bafera i kliknite na **Claim Salary to Wallet**. Pokažite obaveštenje o automatskom povlačenju deficita iz Aave strategije!

---

## 5. Često Postavljana Pitanja Žirija & Pobednički Odgovori (Q&A)

### ❓ Pitanje 1: "Zašto ste koristili Zama FHE umesto Zero-Knowledge (ZK) dokaza?"
> **Odgovor**:  
> *"ZK dokazi su odlični za jednokratnu verifikaciju (npr. dokazati da radnik ima platu veću od $1,000). Međutim, ZK ne omogućava ugovoru da nastavi homomorfno sabiranje i množenje nad tim podacima u budućnosti. Sa **Zama FHE**, plate ostaju uvek šifrovane u stanju ugovora (`euint64`), a ugovor može tokom cele godine dodavati Aave kamatu i oduzimati isplate bez ikakvog dešifrovanja."*

---

### ❓ Pitanje 2: "Šta ako svi radnici u istom danu povuku sve svoje plate, a 85% novca je u Aave strategiji?"
> **Odgovor**:  
> *"Naš ugovor u funkciji `claimSalary` ima ugrađenu **Automatsku Logiku Rebalansa Likvidnosti**. Ako tečni bafer (15%) trenutno nema dovoljno novca, trezor u istoj transakciji automatski povlači tačan deficit iz Aave v3 ugovora i isplaćuje radnika bez ikakvog zastoja ili kašnjenja."*

---

### 3. ❓ Pitanje 3: "Ko sve može da vidi platu radnika na blockchain-u?"
> **Odgovor**:  
> *"Javnost na blockchain-u vidi samo zbirnu transakciju uplate kompanije. Pojedinačne plate su zapisane u šifrovanim Zama `euint64` heševima (`0xa9f8...`). Naš ugovor ima striktnu Access-Control zaštitu u funkciji `getEmployeeSettlementBalance` koja zahteva da pozivalac bude ili sam radnik ili poslodavac, pri čemu radnik identitet dokazuje EIP-712 potpisom svog novčanika."*

---

### 4. ❓ Pitanje 4: "Zašto u terminalu pri transakcijama piše `Value: 0 ETH` ako isplaćujete hiljade dolara?"
> **Odgovor**:  
> *"Polje `Value` u Ethereum transakcijama služi isključivo za slanje nativnog Etera (`ETH`). Naš sistem koristi **USDC ERC-20 stablokoin** radi stabilnosti vrednosti plata. Prenos hiljada USDC dolara i alokacija u Aave izvršava se unutar ugovornih metoda (`usdc.approve` i `depositPayrollBatch`), dok je nativna vrednost transakcije `0 ETH`."*

---

### 5. ❓ Pitanje 5: "Kako ste rešili Zama ACL dozvole u ugovoru?"
> **Odgovor**:  
> *"U svim unutrašnjim FHE operacijama dodali smo obavezne Zama ACL pozive `FHE.allowThis(newBal)` i `FHE.allow(newBal, employee)`. Time garantujemo da ugovor ne gubi pravo da u narednim transakcijama nastavi homomorfno računanje nad novim saldom, dok radnik dobija pravo na EIP-712 re-enkripciju."*

---

### 6. ❓ Pitanje 6: "Koji je poslovni model i kako kompanija profitira od ovoga?"
> **Odgovor**:  
> *"Sealary FHE pretvara trošak payroll-a u izvor prihoda. Naš ugovor deli ostvareni Aave prinos 50/50. 50% prinosa ide radnicima kao atraktivan bonus na platu, dok 50% prinosa ide kompaniji čime se u potpunosti pokrivaju mrežni troškovi i ostvaruje dodatni profit na neiskorišćeni budžet!"*

---

*Sretno na prezentaciji! Projekat je 100% spreman i tehnički utegnut za pobedu na hakatonu!* 🚀
