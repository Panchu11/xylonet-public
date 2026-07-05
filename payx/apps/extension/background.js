// PayX Background Service Worker

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "GET_WALLET":
      chrome.storage.local.get(["walletAddress"], (result) => {
        sendResponse({ address: result.walletAddress || null });
      });
      return true; // Keep channel open for async response

    case "EXECUTE_TIP_TRANSACTION":
      handleTipTransaction(message.data, sender.tab?.id)
        .then((result) => sendResponse(result))
        .catch((error) => sendResponse({ success: false, error: error.message }));
      return true;

    case "SEND_TIP":
      handleSendTip(message.data)
        .then((result) => sendResponse(result))
        .catch((error) => sendResponse({ error: error.message }));
      return true;

    case "UPDATE_STATS":
      updateTipStats(message.amount);
      sendResponse({ success: true });
      break;

    default:
      console.log("Unknown message type:", message.type);
  }
});

// Handle tip transaction via chrome.scripting.executeScript
async function handleTipTransaction(data, tabId) {
  const { handle, amount, message, contracts } = data;
  
  if (!tabId) {
    // Get active tab if not provided
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    tabId = tab?.id;
  }
  
  if (!tabId) {
    return { success: false, error: "No active tab found" };
  }

  try {
    // Execute the transaction in the page context (MAIN world)
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      world: "MAIN", // Execute in page context where window.ethereum exists
      func: executeTipInPage,
      args: [handle, amount, message, contracts]
    });

    if (results && results[0] && results[0].result) {
      return results[0].result;
    }
    return { success: false, error: "No result from script execution" };
  } catch (error) {
    console.error("Script execution error:", error);
    return { success: false, error: error.message };
  }
}

// This function runs in the page context (has access to window.ethereum)
async function executeTipInPage(handle, amount, message, contracts) {
  const PAYX_ADDRESS = contracts.PAYX;
  const USDC_ADDRESS = contracts.USDC;
  
  try {
    if (!window.ethereum) {
      return { success: false, error: "MetaMask not found. Please install MetaMask." };
    }
    
    // Get accounts
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (!accounts || accounts.length === 0) {
      return { success: false, error: "Please connect wallet first" };
    }
    const userAddress = accounts[0];
    
    // Convert amount to wei (6 decimals for Real Circle USDC)
    const amountWei = BigInt(Math.floor(parseFloat(amount) * 1e6));
    const amountHex = amountWei.toString(16).padStart(64, '0');
    
    // USDC approve function signature: approve(address,uint256)
    const approveSelector = "0x095ea7b3";
    const paddedPayxAddress = PAYX_ADDRESS.slice(2).toLowerCase().padStart(64, '0');
    const approveData = approveSelector + paddedPayxAddress + amountHex;
    
    console.log("[PayX] Requesting USDC approval...");
    console.log("[PayX] From:", userAddress);
    console.log("[PayX] USDC Contract:", USDC_ADDRESS);
    console.log("[PayX] PayX Contract:", PAYX_ADDRESS);
    console.log("[PayX] Amount:", amount, "USDC (", amountWei.toString(), "wei )");
    
    // Send approve transaction
    let approveTxHash;
    try {
      approveTxHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: userAddress,
          to: USDC_ADDRESS,
          data: approveData
        }]
      });
      console.log("[PayX] Approve tx submitted:", approveTxHash);
    } catch (approveError) {
      console.error("[PayX] Approve failed:", approveError);
      return { success: false, error: "Approval rejected: " + (approveError.message || "User rejected") };
    }
    
    // Wait for approval to be mined
    console.log("[PayX] Waiting for approval confirmation...");
    await new Promise(r => setTimeout(r, 5000));
    
    // Build tip transaction data using proper ABI encoding
    // Function: tip(string handle, uint256 amount, string message)
    // Selector: 0x64e28922 (verified from ethers.js)
    const tipSelector = "0x64e28922";
    
    // ABI encode helper functions
    function toHex(str) {
      let hex = '';
      for (let i = 0; i < str.length; i++) {
        hex += str.charCodeAt(i).toString(16).padStart(2, '0');
      }
      return hex;
    }
    
    function padRight(hex, bytes) {
      const targetLen = bytes * 2;
      while (hex.length < targetLen) {
        hex += '00';
      }
      return hex;
    }
    
    function encodeUint256(value) {
      return BigInt(value).toString(16).padStart(64, '0');
    }
    
    // For tip(string, uint256, string):
    // Head: [offset_handle, amount, offset_message] = 3 * 32 = 96 bytes
    // Tail: [encoded_handle, encoded_message]
    
    // Sanitize handle - remove @ and any non-alphanumeric/underscore chars
    let handleStr = (handle || '').replace(/^@/, '').replace(/[^a-zA-Z0-9_]/g, '');
    const messageStr = message || '';
    
    // Validate handle
    if (!handleStr || handleStr.length === 0 || handleStr.length > 15) {
      return { success: false, error: "Invalid handle. Must be 1-15 characters." };
    }
    
    console.log("[PayX] Sanitized handle:", handleStr);
    
    // Encode strings
    const handleHex = toHex(handleStr);
    const handleLen = handleStr.length;
    const handlePadded = padRight(handleHex, Math.ceil(handleLen / 32) * 32 || 32);
    
    const messageHex = toHex(messageStr);
    const messageLen = messageStr.length;
    const messagePadded = padRight(messageHex, Math.ceil(messageLen / 32) * 32 || 32);
    
    // Calculate byte offsets
    // Head is 96 bytes (3 * 32)
    // Handle starts at offset 96 (0x60)
    // Message starts at offset 96 + 32 (handle length) + handlePadded.length/2
    const headSize = 96;
    const handleDataSize = 32 + (handlePadded.length / 2); // length field + data
    const messageOffset = headSize + handleDataSize;
    
    // Build the calldata
    const offsetHandle = encodeUint256(headSize); // 0x60 = 96
    const amountParam = encodeUint256(amountWei);
    const offsetMessage = encodeUint256(messageOffset);
    const handleLenEncoded = encodeUint256(handleLen);
    const messageLenEncoded = encodeUint256(messageLen);
    
    const tipData = tipSelector + 
                    offsetHandle + 
                    amountParam + 
                    offsetMessage + 
                    handleLenEncoded + 
                    handlePadded + 
                    messageLenEncoded + 
                    messagePadded;
    
    console.log("[PayX] ===== TIP TRANSACTION DEBUG =====");
    console.log("[PayX] Handle:", handleStr, "(", handleLen, "bytes)");
    console.log("[PayX] Amount (wei):", amountWei.toString());
    console.log("[PayX] Message:", messageStr);
    console.log("[PayX] Selector:", tipSelector);
    console.log("[PayX] Offset Handle:", offsetHandle);
    console.log("[PayX] Amount Param:", amountParam);
    console.log("[PayX] Offset Message:", offsetMessage);
    console.log("[PayX] Handle Len:", handleLenEncoded);
    console.log("[PayX] Handle Hex:", handlePadded);
    console.log("[PayX] Msg Len:", messageLenEncoded);
    console.log("[PayX] Msg Hex:", messagePadded);
    console.log("[PayX] Full calldata:", tipData);
    console.log("[PayX] Calldata length:", tipData.length, "chars (", (tipData.length - 2) / 2, "bytes)");
    console.log("[PayX] ====================================");
    
    console.log("[PayX] Sending tip transaction to contract...");
    
    // Send tip transaction
    let tipTxHash;
    try {
      tipTxHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: userAddress,
          to: PAYX_ADDRESS,
          data: tipData
        }]
      });
      console.log("[PayX] Tip tx submitted:", tipTxHash);
    } catch (tipError) {
      console.error("[PayX] Tip failed:", tipError);
      return { success: false, error: "Tip rejected: " + (tipError.message || "User rejected") };
    }
    
    return { success: true, txHash: tipTxHash };
    
  } catch (error) {
    console.error("[PayX] Transaction error:", error);
    return { success: false, error: error.message || "Transaction failed" };
  }
}

// Legacy handler (fallback)
async function handleSendTip(data) {
  // Redirect to new transaction handler
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    return handleTipTransaction({
      ...data,
      contracts: {
        PAYX: "0xA312c384770B7b49E371DF4b7AF730EFEF465913",
        USDC: "0x3600000000000000000000000000000000000000"
      }
    }, tab.id);
  }
  return { success: false, error: "No active tab" };
}

// Update tip statistics
async function updateTipStats(amount) {
  const stats = await chrome.storage.local.get(["tipsSent", "totalTipped"]);
  const newTipsSent = (stats.tipsSent || 0) + 1;
  const newTotalTipped = (stats.totalTipped || 0) + parseFloat(amount);

  await chrome.storage.local.set({
    tipsSent: newTipsSent,
    totalTipped: newTotalTipped,
  });
}

// Handle extension install
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("PayX Extension installed!");
    // Initialize storage
    chrome.storage.local.set({
      tipsSent: 0,
      totalTipped: 0,
    });
  }
});
