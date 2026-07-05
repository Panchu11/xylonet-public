# Security Policy

## Reporting a Vulnerability

The XyloNet team takes security seriously. If you discover a security vulnerability, we encourage responsible disclosure.

### How to Report

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please report vulnerabilities via:

1. **Email**: security@xylonet.xyz (replace with actual email)
2. **Direct Message**: Contact the team directly on Discord/Twitter

### What to Include

Please provide:
- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Suggested fix (if any)

### Response Timeline

| Stage | Timeline |
|-------|----------|
| Initial Response | Within 24 hours |
| Vulnerability Triage | Within 72 hours |
| Fix Development | Depends on severity |
| Public Disclosure | After fix is deployed |

---

## Security Considerations

### Smart Contract Security

#### Implemented Safeguards

1. **Reentrancy Protection**
   ```solidity
   uint256 private unlocked = 1;
   modifier lock() {
       require(unlocked == 1, "LOCKED");
       unlocked = 0;
       _;
       unlocked = 1;
   }
   ```

2. **Deadline Validation**
   ```solidity
   modifier ensure(uint256 deadline) {
       require(deadline >= block.timestamp, "EXPIRED");
       _;
   }
   ```

3. **Access Control**
   - Owner-only functions for sensitive operations
   - Two-step ownership transfer (propose → accept)
   - Factory-controlled pool parameters

4. **Input Validation**
   - Zero address checks
   - Zero amount checks
   - Token existence verification
   - Slippage protection via `minAmountOut`

5. **Safe Math**
   - Solidity 0.8+ with built-in overflow/underflow protection
   - Precision handling for different token decimals

#### CEI Pattern

All state-changing functions follow the Checks-Effects-Interactions pattern:

```solidity
function swap(...) external lock {
    // 1. CHECKS
    require(amountIn > 0, "ZERO_AMOUNT");
    require(to != address(0), "ZERO_ADDRESS");
    
    // 2. EFFECTS
    reserve0 += amountIn;
    reserve1 -= amountOut;
    
    // 3. INTERACTIONS
    IERC20(tokenOut).transfer(to, amountOut);
}
```

---

### Known Risks

#### StableSwap-Specific Risks

| Risk | Description | Mitigation |
|------|-------------|------------|
| **Depeg Risk** | If a stablecoin loses its peg, arbitrageurs will drain the pool | Monitor pool ratios; consider circuit breakers |
| **Imbalanced Pools** | Concentrated withdrawals can increase slippage | One-sided withdrawal fees; gradual rebalancing |
| **A Parameter Manipulation** | Rapid A changes can create arbitrage opportunities | `rampA` requires minimum time period |

#### Bridge-Specific Risks

| Risk | Description | Mitigation |
|------|-------------|------------|
| **CCTP Availability** | Bridge depends on Circle's attestation service | Built-in status monitoring; manual completion option |
| **Domain Confusion** | Wrong destination domain could lose funds | Validated domain list; confirmation UI |

#### Vault-Specific Risks

| Risk | Description | Mitigation |
|------|-------------|------------|
| **Share Dilution** | Front-running deposits could dilute shares | Minimum deposit amounts; share price oracles |
| **Strategy Risk** | External strategy contracts could fail | Strategy whitelisting; emergency withdrawals |

---

### Contract-Level Security

#### XyloFactory

| Function | Access | Risk Level | Notes |
|----------|--------|------------|-------|
| `createPool` | Public | Low | Permissionless pool creation |
| `setSwapFee` | Owner | Medium | Fee changes affect all future pools |
| `setFeeRecipient` | Owner | Low | Only affects fee distribution |
| `transferOwnership` | Owner | High | Two-step process required |

#### XyloRouter

| Function | Access | Risk Level | Notes |
|----------|--------|------------|-------|
| `swap` | Public | Medium | Protected by slippage, deadline |
| `addLiquidity` | Public | Medium | Protected by minLpTokens |
| `removeLiquidity` | Public | Medium | Protected by minAmounts |
| `rescueTokens` | FeeRecipient | Low | Emergency token recovery |

#### XyloStablePool

| Function | Access | Risk Level | Notes |
|----------|--------|------------|-------|
| `swap` | Public | Medium | Reentrancy protected |
| `addLiquidity` | Public | Medium | Reentrancy protected |
| `removeLiquidity` | Public | Medium | Reentrancy protected |
| `rampA` | Factory | High | Time-locked A parameter changes |

#### XyloBridge

| Function | Access | Risk Level | Notes |
|----------|--------|------------|-------|
| `bridgeOut` | Public | Medium | Relies on CCTP security |
| `bridgeIn` | Public | Low | Only calls CCTP receiver |
| `addDomain` | Owner | Low | Adds supported chains |

#### XyloVault

| Function | Access | Risk Level | Notes |
|----------|--------|------------|-------|
| `deposit` | Public | Medium | Protected by share calculation |
| `withdraw` | Public | Medium | Protected by share ownership |
| `harvest` | Public | Low | Permissionless yield distribution |
| `setStrategy` | Owner | High | External strategy integration |
| `emergencyWithdraw` | Owner | High | Emergency fund recovery |

---

### Operational Security

#### Deployment Best Practices

1. **Private Key Management**
   - Never commit private keys to version control
   - Use hardware wallets for production deployments
   - Consider multi-sig for owner addresses

2. **Verification**
   - Always verify contracts on block explorer
   - Compare deployed bytecode with expected

3. **Testing**
   - Run full test suite before deployment
   - Test on testnet before mainnet
   - Verify all functions work as expected

#### Monitoring Recommendations

| Metric | Threshold | Action |
|--------|-----------|--------|
| Pool Reserve Ratio | < 0.8 or > 1.2 | Alert team, investigate depeg |
| Large Single Swap | > 10% of pool | Monitor for manipulation |
| Rapid A Changes | Any change | Verify authorized |
| Bridge Volume | > $1M/hour | Monitor for unusual activity |
| Vault TVL Change | > 20%/day | Investigate withdrawals |

---

### Dependency Security

#### Smart Contract Dependencies

| Dependency | Version | Risk |
|------------|---------|------|
| OpenZeppelin Contracts | 5.4.0 | Audited, widely used |
| Solidity | 0.8.30 | Stable release |

#### Frontend Dependencies

| Dependency | Purpose | Security Notes |
|------------|---------|----------------|
| wagmi v2 | Web3 hooks | Active maintenance |
| viem | Ethereum client | Type-safe, audited |
| RainbowKit | Wallet connection | Secure wallet integration |
| Circle Bridge Kit | CCTP UI | Official Circle SDK |

---

### Audit Status

| Component | Audit Status | Notes |
|-----------|--------------|-------|
| XyloFactory | Not audited | Uses standard patterns |
| XyloRouter | Not audited | Uses standard patterns |
| XyloStablePool | Not audited | Based on Curve model |
| XyloBridge | Not audited | Wraps Circle CCTP |
| XyloVault | Not audited | ERC-4626 standard |

> **Note**: These contracts have not been professionally audited. Use at your own risk on testnet. A full security audit is planned before mainnet launch.

---

### Bug Bounty Program

*Coming Soon*

We plan to launch a bug bounty program with the following structure:

| Severity | Reward |
|----------|--------|
| Critical | Up to $50,000 |
| High | Up to $10,000 |
| Medium | Up to $2,000 |
| Low | Up to $500 |

Severity is determined by:
- Impact on user funds
- Likelihood of exploitation
- Complexity of attack

---

### Emergency Procedures

#### If a Vulnerability is Found

1. **Immediate**: Pause affected contracts (if pausable)
2. **Within 1 hour**: Assess severity and impact
3. **Within 4 hours**: Deploy fix or mitigation
4. **Within 24 hours**: Full incident report
5. **After fix**: Post-mortem and preventive measures

#### Emergency Contacts

- **Technical Lead**: [Contact info]
- **Security Team**: security@xylonet.xyz
- **Discord**: [Discord invite]

---

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Dec 2024 | Initial deployment on Arc Testnet |

---

## Disclaimer

XyloNet smart contracts are provided "as is" without warranty of any kind. Use at your own risk. The team is not responsible for any loss of funds due to bugs, exploits, or user error.

**This is testnet software. Do not use with real funds.**
