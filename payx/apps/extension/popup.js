// PayX Extension Popup Script
console.log('[PayX v2.0.0] Premium Design by ForgeLabs');

// Arc Testnet Configuration
const ARC_TESTNET = {
  chainId: "0x4CF7F2", // 5042002 in hex
  chainName: "Arc Testnet",
  rpcUrls: ["https://rpc.testnet.arc.network"],
  blockExplorerUrls: ["https://testnet.arcscan.app"],
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18,
  },
};

// Contract addresses (Real Circle USDC)
const CONTRACTS = {
  PAYX: "0xA312c384770B7b49E371DF4b7AF730EFEF465913",
  USDC: "0x3600000000000000000000000000000000000000", // Real Circle USDC
};

// Real USDC uses 6 decimals
const USDC_DECIMALS = 6;

// State
let walletAddress = null;
let provider = null;

// DOM Elements
const connectView = document.getElementById("connect-view");
const walletView = document.getElementById("wallet-view");
const connectBtn = document.getElementById("connect-btn");
const disconnectBtn = document.getElementById("disconnect-btn");
const faucetBtn = document.getElementById("faucet-btn");
const balanceValue = document.getElementById("balance-value");
const walletAddressEl = document.getElementById("wallet-address");
const tipsSent = document.getElementById("tips-sent");
const totalTipped = document.getElementById("total-tipped");

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  // Check for saved wallet
  const saved = await chrome.storage.local.get(["walletAddress"]);
  if (saved.walletAddress) {
    walletAddress = saved.walletAddress;
    showWalletView();
    await updateBalance();
    await updateStats();
  }

  // Event listeners
  connectBtn.addEventListener("click", connectWallet);
  disconnectBtn.addEventListener("click", disconnectWallet);
  faucetBtn.addEventListener("click", requestFaucet);
});

// Connect wallet via content script (MetaMask is only available in web pages)
async function connectWallet() {
  try {
    connectBtn.disabled = true;
    connectBtn.textContent = "Connecting...";

    // Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Check if we're on a supported page
    const isSupported = tab && tab.url && (tab.url.includes("x.com") || tab.url.includes("twitter.com"));
    
    if (!isSupported) {
      // Open X.com in current tab and wait
      connectBtn.textContent = "Opening X.com...";
      await chrome.tabs.update(tab.id, { url: "https://x.com" });
      
      // Wait for page to load and content script to initialize
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Now try to connect
      connectBtn.textContent = "Connecting...";
    }

    // Try to inject and execute connection script directly
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: connectMetaMask,
        world: "MAIN" // Execute in page context to access window.ethereum
      });
      
      if (results && results[0] && results[0].result) {
        const result = results[0].result;
        if (result.success) {
          walletAddress = result.address;
          await chrome.storage.local.set({ walletAddress });
          showWalletView();
          await updateBalance();
          await updateStats();
        } else {
          alert(result.error || "Failed to connect wallet");
        }
      }
    } catch (scriptError) {
      console.error("Script execution error:", scriptError);
      // Fallback: try messaging content script
      chrome.tabs.sendMessage(tab.id, { type: "CONNECT_WALLET" }, async (response) => {
        if (chrome.runtime.lastError) {
          alert("Please refresh the X.com page and try again.");
          return;
        }
        if (response && response.success) {
          walletAddress = response.address;
          await chrome.storage.local.set({ walletAddress });
          showWalletView();
          await updateBalance();
          await updateStats();
        } else {
          alert(response?.error || "Failed to connect. Make sure MetaMask is installed.");
        }
      });
    }
  } catch (error) {
    console.error("Connect error:", error);
    alert("Failed to connect wallet: " + error.message);
  } finally {
    connectBtn.disabled = false;
    connectBtn.textContent = "Connect Wallet";
  }
}

// This function runs in page context (has access to window.ethereum)
function connectMetaMask() {
  return new Promise(async (resolve) => {
    try {
      if (typeof window.ethereum === "undefined") {
        resolve({ success: false, error: "MetaMask not found. Please install MetaMask extension." });
        return;
      }

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      
      if (!accounts || accounts.length === 0) {
        resolve({ success: false, error: "No accounts found. Please unlock MetaMask." });
        return;
      }

      // Try to switch to Arc Testnet (don't fail if network operations fail)
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x4CF7F2" }], // 5042002
        });
      } catch (switchError) {
        // If chain doesn't exist, try to add it
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: "0x4CF7F2",
                chainName: "Arc Testnet",
                rpcUrls: ["https://rpc.testnet.arc.network"],
                blockExplorerUrls: ["https://testnet.arcscan.app"],
                nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 }
              }],
            });
          } catch (addError) {
            // Network might already exist with same RPC but different chain ID
            // Just log and continue - user can manually switch network
            console.warn("Could not add network:", addError.message);
          }
        } else {
          console.warn("Could not switch network:", switchError.message);
        }
      }

      // Return success with the connected address
      resolve({ success: true, address: accounts[0] });
    } catch (error) {
      resolve({ success: false, error: error.message || "Connection failed" });
    }
  });
}

// Disconnect wallet
async function disconnectWallet() {
  walletAddress = null;
  await chrome.storage.local.remove(["walletAddress"]);
  showConnectView();

  // Notify content script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "WALLET_DISCONNECTED",
      });
    }
  });
}

// Request test USDC from faucet
async function requestFaucet() {
  try {
    faucetBtn.disabled = true;
    faucetBtn.textContent = "Requesting...";

    // Open faucet page
    chrome.tabs.create({
      url: "https://faucet.circle.com",
    });

    faucetBtn.textContent = "🚰 Get Test USDC";
    faucetBtn.disabled = false;
  } catch (error) {
    console.error("Faucet error:", error);
    faucetBtn.textContent = "🚰 Get Test USDC";
    faucetBtn.disabled = false;
  }
}

// Update balance display - Fetches real USDC balance from Arc Testnet
async function updateBalance() {
  console.log('[PayX] Fetching balance for:', walletAddress);
  console.log('[PayX] USDC Contract:', CONTRACTS.USDC);
  
  if (!walletAddress || !CONTRACTS.USDC) {
    balanceValue.textContent = "0.00";
    return;
  }

  try {
    // Call balanceOf(address) on USDC contract via RPC
    const balanceOfSelector = "0x70a08231"; // keccak256("balanceOf(address)").slice(0,10)
    const paddedAddress = walletAddress.slice(2).toLowerCase().padStart(64, '0');
    const callData = balanceOfSelector + paddedAddress;

    console.log('[PayX] Calling RPC:', ARC_TESTNET.rpcUrls[0]);
    
    const response = await fetch(ARC_TESTNET.rpcUrls[0], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [{
          to: CONTRACTS.USDC,
          data: callData
        }, 'latest']
      })
    });

    const result = await response.json();
    console.log('[PayX] Balance result:', result);
    
    if (result.result) {
      // Convert from hex (6 decimals for Real Circle USDC)
      const balanceWei = BigInt(result.result);
      const balance = Number(balanceWei) / 1e6;
      console.log('[PayX] Balance:', balance, 'USDC');
      balanceValue.textContent = balance.toFixed(2);
    } else {
      console.log('[PayX] No balance result, showing 0');
      balanceValue.textContent = "0.00";
    }
  } catch (error) {
    console.error("[PayX] Balance error:", error);
    balanceValue.textContent = "0.00";
  }
}

// Update stats display
async function updateStats() {
  try {
    const stats = await chrome.storage.local.get(["tipsSent", "totalTipped"]);
    tipsSent.textContent = stats.tipsSent || 0;
    totalTipped.textContent = `$${stats.totalTipped || 0}`;
  } catch (error) {
    console.error("Stats error:", error);
  }
}

// Show wallet view
function showWalletView() {
  connectView.classList.add("hidden");
  walletView.classList.remove("hidden");
  walletAddressEl.textContent = formatAddress(walletAddress);
}

// Show connect view
function showConnectView() {
  walletView.classList.add("hidden");
  connectView.classList.remove("hidden");
}

// Format address for display
function formatAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
