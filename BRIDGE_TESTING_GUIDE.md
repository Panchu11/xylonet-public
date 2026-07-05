# 🌉 Bridge Testing Guide - ETH Sepolia → Arc Testnet

## ✅ Pre-Testing Checklist

### Code Review Status:
- ✅ Bridge implementation using Circle Bridge Kit V2
- ✅ ETH Sepolia is the ONLY active destination (others show "COMING SOON")
- ✅ Error handling for RPC timeouts and failures
- ✅ Automatic attestation and minting
- ✅ Transaction history tracking
- ✅ Success/Error UI feedback with Etherscan links

---

## 📋 Testing Steps

### **Step 1: Get Test Tokens**

#### **Option A: Circle USDC Faucet (Recommended)**
1. Visit: https://faucet.circle.com
2. Select **Arc Testnet**
3. Enter your wallet address
4. Request test USDC (should receive ~10-100 USDC)

#### **Option B: Manual Faucet Steps**
If Circle faucet doesn't work for Arc:
1. Get Sepolia ETH: https://sepoliafaucet.com
2. Get Sepolia USDC: https://faucet.circle.com (select Ethereum Sepolia)
3. Bridge TO Arc first using Circle Bridge

---

### **Step 2: Connect Wallet**
1. Open: http://localhost:3000/bridge
2. Click "Connect Wallet"
3. Connect to **Arc Testnet** (Chain ID: 5042002)
4. Verify USDC balance shows in widget

---

### **Step 3: Test Bridge Flow (Arc → ETH Sepolia)**

#### **Test Case 1: Small Amount (Success Path)**
1. Enter amount: **1 USDC**
2. Select destination: **Ethereum Sepolia** (should be default)
3. Click "Bridge to Ethereum Sepolia"
4. ✅ **Expected**: 4 steps shown:
   - Approve (wallet popup)
   - Burn (transaction on Arc)
   - Fetch Attestation (automatic)
   - Mint (automatic on Sepolia)
5. ✅ **Expected**: Success confetti animation
6. ✅ **Expected**: Transaction saved to history

**What to verify:**
- [ ] Balance decreased on Arc
- [ ] Balance increased on Sepolia (check after ~30-60 seconds)
- [ ] Transaction appears in History page
- [ ] Burn TX link works on Arcscan
- [ ] Mint TX link works on Sepolia Etherscan

---

#### **Test Case 2: Larger Amount**
1. Enter amount: **10 USDC**
2. Bridge to Ethereum Sepolia
3. ✅ **Expected**: Same flow as Test Case 1
4. ✅ **Expected**: Fee calculation correct (~0.1% = 0.01 USDC)

---

#### **Test Case 3: RPC Error Handling**
This might happen naturally due to Sepolia congestion:
1. Bridge 5 USDC
2. If you see: "Bridge transaction submitted! Burn tx: 0x..."
   - ✅ **Expected**: Yellow warning (not red error)
   - ✅ **Expected**: "Check Etherscan" button appears
   - ✅ **Expected**: Can verify burn TX on Arcscan
   - ✅ **Expected**: USDC arrives on Sepolia within 5 minutes

**This is NORMAL** - Sepolia RPC is unreliable, but Circle relayer handles mint automatically.

---

#### **Test Case 4: Insufficient Balance**
1. Enter amount: **999999 USDC** (more than balance)
2. ✅ **Expected**: Button shows error or transaction fails on approval
3. ✅ **Expected**: Error message explains issue

---

#### **Test Case 5: Chain Selection**
1. Click destination chain dropdown
2. ✅ **Expected**: Modal opens
3. ✅ **Expected**: Only Ethereum Sepolia is clickable
4. ✅ **Expected**: Other chains show "COMING SOON" badge
5. ✅ **Expected**: Other chains are grayed out and non-clickable

---

### **Step 4: Verify Transaction History**
1. Go to: http://localhost:3000/history
2. ✅ **Expected**: Bridge transactions listed
3. ✅ **Expected**: Shows: Amount, Timestamp, Status (Success/Pending)
4. ✅ **Expected**: Transaction links work

---

### **Step 5: Verify Stats Update**
1. Go to: http://localhost:3000/bridge
2. Scroll to "Your Bridge Activity" section
3. ✅ **Expected**: Shows your personal stats:
   - Your Bridges count
   - Your Volume
   - Avg. Time (~28s)
   - Success Rate

---

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to create wallet adapter"
**Cause**: Wallet connection issue  
**Solution**: Disconnect and reconnect wallet, refresh page

### Issue 2: "Network Timeout"
**Cause**: Sepolia RPC congestion  
**Solution**: Click "Bridge" button again to retry (up to 3 attempts)

### Issue 3: "Burn tx succeeded but mint RPC failed"
**Cause**: Sepolia RPC unreliable (this is NORMAL)  
**Status**: ✅ Bridge actually succeeded!  
**Action**: 
- Check your Sepolia address on Etherscan after 2-5 minutes
- USDC will be there automatically

### Issue 4: "Insufficient funds"
**Cause**: Not enough USDC on Arc  
**Solution**: Use Circle faucet to get more test USDC

### Issue 5: Bridge takes >2 minutes
**Cause**: Network congestion or Circle attestation delay  
**Normal**: Circle CCTP can take 1-5 minutes during peak times  
**Action**: Wait patiently, check destination chain after 5 minutes

---

## ✅ Testing Completion Checklist

Once you've tested ETH Sepolia successfully:

- [ ] Successfully bridged at least 3 transactions
- [ ] All 4 steps complete (approve → burn → attest → mint)
- [ ] Balance updates correctly on both chains
- [ ] Error handling works (tested timeout/retry)
- [ ] Transaction history shows correctly
- [ ] Personal bridge stats update
- [ ] Chain selector shows only Sepolia active
- [ ] UI responsive on mobile (test if possible)

---

## 🚀 Next Steps: Enabling Base Sepolia

Once ETH Sepolia is confirmed working:

### Code Changes Needed:
1. Update `BridgeWidget.tsx` line 632:
   ```typescript
   // OLD: Only Sepolia
   const isComingSoon = chain.id !== 'Ethereum_Sepolia'
   
   // NEW: Sepolia + Base
   const isComingSoon = !['Ethereum_Sepolia', 'Base_Sepolia'].includes(chain.id)
   ```

2. Test Base Sepolia:
   - Get Base Sepolia ETH: https://www.alchemy.com/faucets/base-sepolia
   - Get Base Sepolia USDC: https://faucet.circle.com (select Base Sepolia)
   - Repeat all test cases above

3. If successful, enable more chains gradually

---

## 📊 Expected Test Results

### ✅ Success Criteria:
- Bridge completes in **30-120 seconds**
- Fee is **~0.1%** of amount
- No user action needed after initial approval
- USDC arrives automatically on destination
- UI shows clear feedback at each step

### ❌ Failure Indicators:
- Bridge takes >5 minutes (check Circle status)
- USDC deducted from Arc but never arrives (check attestation)
- Errors on every attempt (check RPC/Circle Bridge Kit status)

---

## 🔗 Useful Links

- **Arc Testnet Explorer**: https://testnet.arcscan.app
- **Sepolia Explorer**: https://sepolia.etherscan.io
- **Base Sepolia Explorer**: https://sepolia.basescan.org
- **Circle CCTP Status**: https://www.circle.com/en/cctp
- **Circle Faucet**: https://faucet.circle.com

---

## 📝 Notes

- Circle Bridge Kit uses **automatic relayer** - users don't need destination chain gas
- **Fast transfer mode** is enabled - takes ~30 seconds (vs 13 minutes for manual)
- Bridge stats on landing page query from block **19,900,000** (deployment)
- Personal stats use localStorage for instant display

---

**Ready to test!** Follow the steps above and report any issues. Good luck! 🎉
