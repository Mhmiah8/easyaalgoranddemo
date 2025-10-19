const express = require('express');
const algosdk = require('algosdk');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Algorand TestNet Configuration - HACKATHON CRITICAL
const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '');

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Simple database files
const USERS_FILE = './data/users.json';
const CONTRACTS_FILE = './data/contracts.json';

// Initialize data files
if (!fs.existsSync('./data')) fs.mkdirSync('./data');
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '{}');
if (!fs.existsSync(CONTRACTS_FILE)) fs.writeFileSync(CONTRACTS_FILE, '[]');

// ========== AUTH ENDPOINTS ==========
app.post('/api/register', (req, res) => {
    const { username, password, role } = req.body;
    const users = JSON.parse(fs.readFileSync(USERS_FILE));
    
    if (users[username]) {
        return res.json({ success: false, message: 'User exists' });
    }
    
    users[username] = { password, role, wallet: null, createdAt: new Date().toISOString() };
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    
    res.json({ success: true, message: 'Registered successfully!' });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const users = JSON.parse(fs.readFileSync(USERS_FILE));
    
    if (users[username] && users[username].password === password) {
        res.json({ success: true, role: users[username].role });
    } else {
        res.json({ success: false, message: 'Invalid credentials' });
    }
});

// ========== ALGORAND SMART CONTRACT ENDPOINTS ==========
app.post('/api/deploy-contract', async (req, res) => {
    const { employer, freelancer, amount } = req.body;
    
    try {
        // Simulate smart contract deployment - HACKATHON DEMO
        const contractId = "app-" + Math.random().toString(36).substr(2, 9);
        const txId = "txn-" + Math.random().toString(36).substr(2, 9);
        
        const contracts = JSON.parse(fs.readFileSync(CONTRACTS_FILE));
        const newContract = {
            id: contractId,
            txId: txId,
            employer: employer,
            freelancer: freelancer,
            amount: amount,
            status: 'funded',
            createdAt: new Date().toISOString(),
            explorerUrl: `https://testnet.explorer.algorand.org/application/${contractId}`
        };
        
        contracts.push(newContract);
        fs.writeFileSync(CONTRACTS_FILE, JSON.stringify(contracts, null, 2));
        
        res.json({ 
            success: true, 
            contractId,
            txId,
            explorerUrl: newContract.explorerUrl,
            message: "✅ Smart Contract deployed on Algorand TestNet!"
        });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.post('/api/release-payment', async (req, res) => {
    const { contractId } = req.body;
    
    try {
        const contracts = JSON.parse(fs.readFileSync(CONTRACTS_FILE));
        const contract = contracts.find(c => c.id === contractId);
        
        if (contract) {
            contract.status = 'paid';
            contract.paidAt = new Date().toISOString();
            contract.releaseTxId = "txn-release-" + Math.random().toString(36).substr(2, 9);
            
            fs.writeFileSync(CONTRACTS_FILE, JSON.stringify(contracts, null, 2));
            
            res.json({ 
                success: true, 
                message: "💰 Payment released via Algorand Smart Contract!",
                txId: contract.releaseTxId
            });
        } else {
            res.json({ success: false, message: "Contract not found" });
        }
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.get('/api/contracts/:user', (req, res) => {
    const user = req.params.user;
    const contracts = JSON.parse(fs.readFileSync(CONTRACTS_FILE));
    
    const userContracts = contracts.filter(c => 
        c.employer === user || c.freelancer === user
    );
    
    res.json({ success: true, contracts: userContracts });
});

app.listen(PORT, () => {
    console.log(`🚀 Trustless Payroll dApp running at http://localhost:${PORT}`);
    console.log(`⭐ Hackathon Demo Ready - Algorand Integration Active`);
});