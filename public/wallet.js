// Simple Wallet Integration with QR Code Page
async function connectWallet() {
    // Open QR code page in a new window
    const qrWindow = window.open('qr-code.html', 'peraQR', 
        'width=500,height=700,scrollbars=no,resizable=no');
    
    if (!qrWindow) {
        // Popup blocked - fallback to demo
        alert("Popup blocked! Please allow popups for QR code or continue in demo mode.");
        return connectWalletDemo();
    }
    
    // Listen for connection success from QR code page
    return new Promise((resolve) => {
        const messageHandler = function(event) {
            if (event.data.type === 'WALLET_CONNECTED' && event.data.success) {
                // Update UI
                document.getElementById('wallet-status').innerHTML = 
                    `<span class="badge bg-success">🟢 Pera Connected: ${event.data.address.slice(0, 8)}...</span>`;
                
                // Update disconnect button
                const disconnectBtn = document.getElementById('disconnect-btn');
                if (disconnectBtn) disconnectBtn.style.display = 'inline-block';
                
                // Clean up event listener
                window.removeEventListener('message', messageHandler);
                
                // Resolve with demo address
                resolve(event.data.address);
            }
        };
        
        window.addEventListener('message', messageHandler);
        
        // Fallback if QR window closes without connecting
        const checkClosed = setInterval(() => {
            if (qrWindow.closed) {
                clearInterval(checkClosed);
                window.removeEventListener('message', messageHandler);
                if (!document.getElementById('wallet-status').textContent.includes('Connected')) {
                    resolve(connectWalletDemo());
                }
            }
        }, 500);
    });
}

async function connectWalletDemo() {
    // Demo mode fallback
    document.getElementById('wallet-status').innerHTML = 
        `<span class="badge bg-warning">🔶 Demo Mode - Connect for Real Transactions</span>`;
    
    return "ALGO-DEMO-WALLET-ADDRESS";
}

async function disconnectWallet() {
    document.getElementById('wallet-status').innerHTML = 
        `<span class="badge bg-secondary">Wallet Not Connected</span>`;
    
    // Hide disconnect button
    const disconnectBtn = document.getElementById('disconnect-btn');
    if (disconnectBtn) disconnectBtn.style.display = 'none';
}

// Simple connection check
function isWalletConnected() {
    return document.getElementById('wallet-status').textContent.includes('Connected');
}

// Initialize wallet status on page load
document.addEventListener('DOMContentLoaded', function() {
    // Start with wallet disconnected
    disconnectWallet();
});