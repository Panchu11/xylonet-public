// PayX Content Script - Injects tip buttons on X.com
console.log('[PayX v2.0.0] Premium Design by ForgeLabs');

// Configuration
const CONFIG = {
  tipAmounts: [1, 5, 10, 25],
  buttonColor: "#6366f1",
};

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

// Contract addresses - DEPLOYED ON ARC TESTNET (Real Circle USDC)
const CONTRACTS = {
  PAYX: "0xA312c384770B7b49E371DF4b7AF730EFEF465913",
  USDC: "0x3600000000000000000000000000000000000000", // Real Circle USDC
};

// Real USDC uses 6 decimals
const USDC_DECIMALS = 6;

// Contract ABIs (minimal for what we need)
const USDC_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)"
];

const PAYX_ABI = [
  "function tip(string calldata handle, uint256 amount, string calldata message) external"
];

// State
let walletConnected = false;
let walletAddress = null;

// Initialize
(async function init() {
  console.log("PayX: Content script loaded");

  // Check wallet status from storage
  const saved = await chrome.storage.local.get(["walletAddress"]);
  if (saved.walletAddress) {
    walletConnected = true;
    walletAddress = saved.walletAddress;
  }

  // Start observing DOM changes
  observeTweets();

  // Listen for messages from popup and background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "CONNECT_WALLET") {
      // Handle wallet connection request from popup
      connectWallet().then(result => {
        sendResponse(result);
      }).catch(error => {
        sendResponse({ success: false, error: error.message });
      });
      return true; // Keep channel open for async response
    } else if (message.type === "WALLET_CONNECTED") {
      walletConnected = true;
      walletAddress = message.address;
      addTipButtonsToAllTweets();
    } else if (message.type === "WALLET_DISCONNECTED") {
      walletConnected = false;
      walletAddress = null;
    }
  });
})();

// Connect wallet using MetaMask
async function connectWallet() {
  console.log('[PayX] connectWallet called');
  try {
    // Check if MetaMask is available
    if (typeof window.ethereum === "undefined") {
      console.log('[PayX] MetaMask not found');
      return { success: false, error: "MetaMask is not installed. Please install MetaMask first." };
    }

    console.log('[PayX] Requesting accounts...');
    // Request account access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      return { success: false, error: "No accounts found. Please unlock MetaMask." };
    }

    const address = accounts[0];

    // Try to switch to Arc Testnet
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ARC_TESTNET.chainId }],
      });
    } catch (switchError) {
      // Chain not added, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [ARC_TESTNET],
        });
      } else {
        console.warn("Could not switch to Arc Testnet:", switchError);
      }
    }

    // Update local state
    walletConnected = true;
    walletAddress = address;
    
    // Save to storage
    await chrome.storage.local.set({ walletAddress: address });
    
    // Update UI
    addTipButtonsToAllTweets();

    return { success: true, address };
  } catch (error) {
    console.error("Wallet connection error:", error);
    return { success: false, error: error.message || "Failed to connect wallet" };
  }
}

// Observe DOM for new tweets
function observeTweets() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Find tweet action bars in new nodes
          const actionBars = node.querySelectorAll('[data-testid="tweet"]');
          actionBars.forEach(addTipButtonToTweet);
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Add to existing tweets
  addTipButtonsToAllTweets();
}

// Add tip buttons to all visible tweets
function addTipButtonsToAllTweets() {
  const tweets = document.querySelectorAll('[data-testid="tweet"]');
  tweets.forEach(addTipButtonToTweet);
}

// Add tip button to a single tweet
function addTipButtonToTweet(tweetElement) {
  // Check if already has tip button
  if (tweetElement.querySelector(".payx-tip-btn")) return;

  // Find the action bar (like, retweet, reply buttons)
  const actionBar = tweetElement.querySelector('[role="group"]');
  if (!actionBar) return;

  // Get the tweet author's handle
  const handleElement = tweetElement.querySelector('a[href*="/"] span');
  let handle = "";
  
  // Try to extract handle from the tweet
  const userLink = tweetElement.querySelector('a[href^="/"][role="link"]');
  if (userLink) {
    const href = userLink.getAttribute("href");
    if (href && href.startsWith("/")) {
      handle = href.slice(1).split("/")[0];
    }
  }

  if (!handle) return;

  // Create tip button
  const tipButton = createTipButton(handle);
  
  // Insert into action bar
  actionBar.appendChild(tipButton);
}

// Create tip button element
function createTipButton(handle) {
  const container = document.createElement("div");
  container.className = "payx-tip-btn";
  container.style.cssText = `
    display: flex;
    align-items: center;
    margin-left: 4px;
  `;

  const button = document.createElement("button");
  button.className = "payx-tip-trigger";
  button.innerHTML = `
    <img src="${chrome.runtime.getURL('icons/icon32.png')}" width="16" height="16" style="border-radius: 4px;" />
    <span style="margin-left: 6px; font-size: 13px;">Tip</span>
  `;
  button.style.cssText = `
    display: flex;
    align-items: center;
    padding: 4px 12px;
    background: transparent;
    color: #6366f1;
    border: none;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  `;

  button.addEventListener("mouseenter", () => {
    button.style.background = "rgba(99, 102, 241, 0.1)";
  });

  button.addEventListener("mouseleave", () => {
    button.style.background = "transparent";
  });

  button.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    showTipModal(handle);
  });

  container.appendChild(button);
  return container;
}

// Show tip modal
function showTipModal(handle) {
  // Remove existing modal if any
  const existing = document.getElementById("payx-modal");
  if (existing) existing.remove();

  // Create modal
  const modal = document.createElement("div");
  modal.id = "payx-modal";
  modal.innerHTML = `
    <div class="payx-modal-overlay"></div>
    <div class="payx-modal-content">
      <div class="payx-modal-header">
        <div class="payx-modal-logo">
          <img src="${chrome.runtime.getURL('icons/icon48.png')}" width="52" height="52" style="border-radius: 16px;" />
        </div>
        <h2>Tip @${handle}</h2>
        <button class="payx-modal-close">&times;</button>
      </div>
      
      <div class="payx-modal-body">
        ${!walletConnected ? `
          <div class="payx-connect-prompt">
            <p>Connect your wallet to send tips with USDC</p>
            <button class="payx-connect-btn">Connect Wallet</button>
          </div>
        ` : `
          <div class="payx-amount-selector">
            <p class="payx-amount-label">Select amount</p>
            <div class="payx-amounts">
              ${CONFIG.tipAmounts.map(amt => `
                <button class="payx-amount-btn" data-amount="${amt}">$${amt}</button>
              `).join("")}
            </div>
            <div class="payx-custom-amount">
              <input type="number" placeholder="Custom amount" min="0.1" step="0.1" />
              <span>USDC</span>
            </div>
          </div>
          
          <div class="payx-message">
            <textarea placeholder="Add a message (optional)" maxlength="280"></textarea>
          </div>
          
          <button class="payx-send-btn" disabled>Select Amount</button>
        `}
      </div>
      
      <div class="payx-modal-footer">
        <span>Built by</span>
        <div class="payx-footer-logo"></div>
        <strong>ForgeLabs</strong>
        <span style="margin: 0 8px; opacity: 0.3;">•</span>
        <span>Powered by Arc</span>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Event listeners
  const overlay = modal.querySelector(".payx-modal-overlay");
  const closeBtn = modal.querySelector(".payx-modal-close");
  
  overlay.addEventListener("click", () => modal.remove());
  closeBtn.addEventListener("click", () => modal.remove());

  if (walletConnected) {
    setupTipModalLogic(modal, handle);
  } else {
    const connectBtn = modal.querySelector(".payx-connect-btn");
    connectBtn.addEventListener("click", async () => {
      // Show loading state
      connectBtn.textContent = "Connecting...";
      connectBtn.disabled = true;
      
      // Directly connect wallet
      const result = await connectWallet();
      
      if (result.success) {
        // Refresh modal with connected state
        modal.remove();
        showTipModal(handle);
      } else {
        connectBtn.textContent = "Connect Wallet";
        connectBtn.disabled = false;
        alert(result.error || "Failed to connect wallet");
      }
    });
  }
}

// Setup tip modal logic
function setupTipModalLogic(modal, handle) {
  let selectedAmount = 0;
  const amountBtns = modal.querySelectorAll(".payx-amount-btn");
  const customInput = modal.querySelector(".payx-custom-amount input");
  const sendBtn = modal.querySelector(".payx-send-btn");
  const messageInput = modal.querySelector(".payx-message textarea");

  // Amount button selection
  amountBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      amountBtns.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedAmount = parseFloat(btn.dataset.amount);
      customInput.value = "";
      updateSendButton();
    });
  });

  // Custom amount input
  customInput.addEventListener("input", () => {
    amountBtns.forEach((b) => b.classList.remove("selected"));
    selectedAmount = parseFloat(customInput.value) || 0;
    updateSendButton();
  });

  // Update send button state
  function updateSendButton() {
    if (selectedAmount > 0) {
      sendBtn.disabled = false;
      sendBtn.textContent = `Send $${selectedAmount.toFixed(2)} USDC`;
    } else {
      sendBtn.disabled = true;
      sendBtn.textContent = "Select Amount";
    }
  }

  // Send tip - REAL TRANSACTION
  sendBtn.addEventListener("click", async () => {
    if (selectedAmount <= 0) return;

    sendBtn.disabled = true;
    sendBtn.textContent = "Approving USDC...";

    try {
      // Execute real transaction via injected script
      const result = await executeTipTransaction(handle, selectedAmount, messageInput.value || "");

      if (result.success) {
        // Update stats
        chrome.runtime.sendMessage({
          type: "UPDATE_STATS",
          amount: selectedAmount,
        });

        // Show success
        modal.querySelector(".payx-modal-body").innerHTML = `
          <div class="payx-success">
            <div class="payx-success-icon">✓</div>
            <h3>Tip Sent!</h3>
            <p>You tipped @${handle} $${selectedAmount.toFixed(2)} USDC</p>
            <a href="https://testnet.arcscan.app/tx/${result.txHash}" target="_blank">
              View Transaction
            </a>
          </div>
        `;
      } else {
        throw new Error(result.error || "Failed to send tip");
      }
    } catch (error) {
      sendBtn.disabled = false;
      sendBtn.textContent = `Send $${selectedAmount.toFixed(2)} USDC`;
      alert("Failed to send tip: " + error.message);
    }
  });
}

// Execute tip transaction using MetaMask via background script
async function executeTipTransaction(handle, amount, message) {
  return new Promise((resolve) => {
    // Send request to background script which can bypass CSP
    chrome.runtime.sendMessage({
      type: "EXECUTE_TIP_TRANSACTION",
      data: {
        handle: handle,
        amount: amount,
        message: message || "",
        contracts: CONTRACTS
      }
    }, (response) => {
      if (chrome.runtime.lastError) {
        resolve({ success: false, error: chrome.runtime.lastError.message });
      } else {
        resolve(response || { success: false, error: "No response from background" });
      }
    });
  });
}
