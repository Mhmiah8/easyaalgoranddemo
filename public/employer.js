let currentUser = localStorage.getItem('username');

// Check if user is logged in
if (!currentUser) {
    window.location.href = 'index.html';
}

// Load jobs when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadJobs();
});

async function createJob() {
    const freelancer = document.getElementById('freelancerUsername').value;
    const amount = document.getElementById('jobAmount').value;

    if (!freelancer || !amount) {
        alert('Please fill in all required fields');
        return;
    }

    // Check if Pera Wallet is connected
    const walletAddress = await connectWallet();
    const isRealBlockchain = !!walletAddress;

    try {
        const endpoint = isRealBlockchain ? '/api/deploy-contract-real' : '/api/deploy-contract';
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                employer: currentUser,
                freelancer: freelancer,
                amount: amount
            })
        });

        const result = await response.json();
        
        if (result.success) {
            if (isRealBlockchain) {
                alert(`✅ REAL Algorand Smart Contract Ready!\n\nContract would deploy on TestNet with:\n• Employer: ${walletAddress.slice(0, 8)}...\n• Amount: ${amount} ALGO\n• Freelancer: ${freelancer}\n\nView Explorer: ${result.explorerUrl}`);
            } else {
                alert(`✅ Demo Smart Contract Created!\n\nContract ID: ${result.contractId}\n\n(Connect Pera Wallet for real TestNet deployment)`);
            }
            
            document.getElementById('freelancerUsername').value = '';
            document.getElementById('jobDescription').value = '';
            loadJobs();
        } else {
            alert('Failed to create job: ' + result.message);
        }
    } catch (error) {
        alert('Error creating job: ' + error.message);
    }
}


async function loadJobs() {
    try {
        const response = await fetch(`/api/contracts/${currentUser}`);
        const result = await response.json();

        if (result.success && result.contracts.length > 0) {
            const jobsList = document.getElementById('jobs-list');
            jobsList.innerHTML = '';

            result.contracts.forEach(contract => {
                const statusBadge = contract.status === 'paid' ? 
                    '<span class="badge bg-success">Paid</span>' : 
                    '<span class="badge bg-warning">Funded</span>';

                const releaseButton = contract.status === 'funded' ? 
                    `<button onclick="releasePayment('${contract.id}')" class="btn btn-success btn-sm">Release Payment</button>` : 
                    '<span class="badge bg-secondary">Completed</span>';

                const jobCard = `
                    <div class="card contract-card ${contract.status} mb-3">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 class="card-title">Job with ${contract.freelancer}</h6>
                                    <p class="card-text mb-1"><strong>Amount:</strong> ${contract.amount} ALGO</p>
                                    <p class="card-text mb-1"><strong>Status:</strong> ${statusBadge}</p>
                                    <p class="card-text mb-2"><small class="text-muted">Created: ${new Date(contract.createdAt).toLocaleDateString()}</small></p>
                                </div>
                                <div class="text-end">
                                    ${releaseButton}
                                    <br>
                                    <small class="text-muted">Contract: ${contract.id.slice(0, 8)}...</small>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                jobsList.innerHTML += jobCard;
            });
        } else {
            document.getElementById('jobs-list').innerHTML = '<p class="text-muted text-center">No active jobs yet. Create your first job!</p>';
        }
    } catch (error) {
        console.error('Error loading jobs:', error);
    }
}

async function releasePayment(contractId) {
    if (!confirm('Are you sure you want to release payment? This action is irreversible.')) {
        return;
    }

    try {
        const response = await fetch('/api/release-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contractId: contractId })
        });

        const result = await response.json();
        
        if (result.success) {
            alert(`💰 Payment Released!\n\nTransaction ID: ${result.txId}\n\nFunds have been transferred via Algorand Smart Contract.`);
            loadJobs(); // Refresh the list
        } else {
            alert('Failed to release payment: ' + result.message);
        }
    } catch (error) {
        alert('Error releasing payment: ' + error.message);
    }
}

function logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    window.location.href = 'index.html';
}