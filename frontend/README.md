## Setup

### 1. Local blockchain

```bash
npx hardhat node
```

Starts a local Ethereum network (chain ID 31337) with 20 test accounts,
10,000 ETH each.

### 2. Deploy contracts (terminal 2)

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Deploys MockUSDC, MockYieldStrategy, and FHEYieldPayrollVault, and pays
demo payroll to all available test accounts. Re-run after every restart
of `npx hardhat node`.

### 3. Frontend (terminal 3)

```bash
cd frontend
npm run dev
```

Runs the app at `http://localhost:3000`, reading and writing real data
from the deployed contract. Requires terminal 1 to stay running.

[//]: # (## MetaMask integration)

[//]: # ()
[//]: # (Wallet connection lives in `frontend/src/lib/useWallet.ts` — handles)

[//]: # (connecting, network switching, and account-change detection. Contract)

[//]: # (addresses and ABI are in `frontend/src/lib/contracts.ts`.)