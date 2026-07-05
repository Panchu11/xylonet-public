/**
 * XyloNet VC Report - Uses VERIFIED data from Jan 20, 2026 run
 */

require('dotenv').config({ path: 'frontend/.env.local' });
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// VERIFIED DATA from Goldsky + Supabase (Jan 20, 2026)
const STATS = {
  swap: { count: 707812, volume: 11551020.31, users: 115943 },
  vault: { count: 39823, volume: 2678259.55, users: 15860 },
  payx: { count: 1844, volume: 106288.42, fees: 1073.62, tippers: 249, recipients: 389, retention: 85.1, power: 159 },
  totalUsers: 115943, // Use swappers count as true unique wallets
  registeredUsers: 110978,
  totalPoints: 778086,
};

function getBase64(filePath) {
  try {
    const data = fs.readFileSync(path.resolve(__dirname, '..', filePath));
    const ext = path.extname(filePath).slice(1);
    return `data:image/${ext === 'svg' ? 'svg+xml' : ext};base64,${data.toString('base64')}`;
  } catch (e) { return ''; }
}

function html(s, logos) {
  const $ = (v) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const n = (v) => Math.round(v).toLocaleString();
  const p = (v) => v.toFixed(1) + '%';
  const launchDate = new Date('2026-01-02');
  const days = Math.floor((Date.now() - launchDate.getTime()) / 86400000);
  const totalVol = s.swap.volume + s.vault.volume + s.payx.volume;
  const totalTx = s.swap.count + s.vault.count + s.payx.count;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>XyloNet Investor Report</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#030712;color:#fff;font-size:11px;-webkit-print-color-adjust:exact;print-color-adjust:exact}

.page{width:210mm;height:297mm;position:relative;overflow:hidden;background:#030712;page-break-after:always}

.bg{position:absolute;inset:0}
.bg::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 100% 80% at 10% -20%,rgba(99,102,241,0.25) 0%,transparent 50%),radial-gradient(ellipse 80% 60% at 95% 110%,rgba(236,72,153,0.15) 0%,transparent 50%)}
.mesh{position:absolute;inset:0;background:linear-gradient(90deg,rgba(99,102,241,0.015) 1px,transparent 1px),linear-gradient(rgba(99,102,241,0.015) 1px,transparent 1px);background-size:24px 24px}
.orb{position:absolute;border-radius:50%;filter:blur(100px)}
.orb1{width:500px;height:500px;background:radial-gradient(circle,rgba(99,102,241,0.35) 0%,transparent 70%);top:-200px;left:-150px}
.orb2{width:400px;height:400px;background:radial-gradient(circle,rgba(236,72,153,0.2) 0%,transparent 70%);bottom:-150px;right:-100px}

.content{position:relative;z-index:10;padding:20px 26px;height:100%;display:flex;flex-direction:column}

.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.brand{display:flex;align-items:center;gap:10px}
.logo-img{width:32px;height:32px;border-radius:8px;box-shadow:0 4px 16px rgba(99,102,241,0.4)}
.logo-text{font-size:20px;font-weight:800;background:linear-gradient(135deg,#fff,#a5b4fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.badge{padding:5px 12px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:50px;font-size:8px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#fca5a5}
.partners{display:flex;gap:6px}
.partner{display:flex;align-items:center;gap:4px;padding:5px 8px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);border-radius:6px}
.partner img{width:14px;height:14px}
.partner span{font-size:8px;font-weight:600}

.title-box{text-align:center;margin-bottom:14px}
.main-title{font-size:32px;font-weight:800;letter-spacing:-1px;background:linear-gradient(135deg,#fff 30%,#a5b4fc 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:3px}
.subtitle{font-size:10px;color:#64748b}

.hero{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px}
.hero-card{background:linear-gradient(145deg,rgba(15,15,25,0.9),rgba(8,8,16,0.95));border:1px solid rgba(255,255,255,0.04);border-radius:10px;padding:12px;text-align:center;position:relative;overflow:hidden}
.hero-card::before{content:'';position:absolute;top:0;left:20%;right:20%;height:1px;background:linear-gradient(90deg,transparent,rgba(99,102,241,0.5),transparent)}
.hero-icon{font-size:14px;margin-bottom:4px}
.hero-val{font-family:'Consolas',monospace;font-size:18px;font-weight:700;color:#fff}
.hero-lbl{font-size:7px;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin-top:2px}

.products{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px}
.product{background:linear-gradient(145deg,rgba(15,15,25,0.9),rgba(8,8,16,0.95));border:1px solid rgba(255,255,255,0.04);border-radius:12px;padding:14px;position:relative;overflow:hidden}
.product::before{content:'';position:absolute;top:0;left:0;right:0;height:2px}
.product.swap::before{background:linear-gradient(90deg,#6366f1,#8b5cf6)}
.product.vault::before{background:linear-gradient(90deg,#10b981,#059669)}
.product.payx::before{background:linear-gradient(90deg,#f97316,#ea580c)}
.product-head{display:flex;align-items:center;gap:6px;margin-bottom:10px}
.product-icon{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:12px}
.product.swap .product-icon{background:linear-gradient(135deg,#6366f1,#8b5cf6)}
.product.vault .product-icon{background:linear-gradient(135deg,#10b981,#059669)}
.product.payx .product-icon{background:linear-gradient(135deg,#f97316,#ea580c)}
.product-name{font-size:13px;font-weight:700}
.product-stat{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.03)}
.product-stat:last-child{border:none}
.product-stat-lbl{color:#64748b;font-size:9px}
.product-stat-val{font-family:'Consolas',monospace;font-weight:600;font-size:9px}
.product-stat-val.green{color:#34d399}
.product-stat-val.blue{color:#60a5fa}
.product-stat-val.orange{color:#fb923c}

.section{margin-bottom:10px}
.section-title{font-size:11px;font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:6px}
.section-icon{width:22px;height:22px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:10px}

.tech-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.tech-item{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);border-radius:6px;padding:8px;text-align:center}
.tech-name{font-size:8px;font-weight:600;color:#64748b}
.tech-val{font-size:10px;font-weight:700;margin-top:2px}

.contracts{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);border-radius:8px;padding:10px}
.contract-row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.02);font-size:8px}
.contract-row:last-child{border:none}
.contract-name{color:#94a3b8}
.contract-addr{font-family:'Consolas',monospace;color:#a5b4fc}

.footer{margin-top:auto;padding-top:8px;border-top:1px solid rgba(255,255,255,0.04);display:flex;justify-content:space-between;font-size:8px;color:#475569}
.footer strong{color:#fff}

/* PAGE 2 */
.insights{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:12px}
.insight{background:linear-gradient(145deg,rgba(15,15,25,0.9),rgba(8,8,16,0.95));border:1px solid rgba(255,255,255,0.04);border-radius:10px;padding:12px}
.insight-head{display:flex;align-items:center;gap:6px;margin-bottom:6px}
.insight-icon{width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:12px}
.insight-icon.purple{background:linear-gradient(135deg,#6366f1,#8b5cf6)}
.insight-icon.green{background:linear-gradient(135deg,#10b981,#059669)}
.insight-icon.orange{background:linear-gradient(135deg,#f97316,#ea580c)}
.insight-icon.cyan{background:linear-gradient(135deg,#06b6d4,#0891b2)}
.insight-title{font-size:11px;font-weight:700}
.insight-desc{font-size:8px;color:#94a3b8;line-height:1.4;margin-bottom:8px}
.insight-metric{display:flex;align-items:baseline;gap:4px}
.insight-big{font-family:'Consolas',monospace;font-size:22px;font-weight:700}
.insight-big.purple{color:#a5b4fc}
.insight-big.green{color:#34d399}
.insight-big.orange{color:#fb923c}
.insight-big.cyan{color:#22d3ee}
.insight-unit{font-size:9px;color:#64748b}

.exec{background:linear-gradient(145deg,rgba(99,102,241,0.08),rgba(168,85,247,0.04));border:1px solid rgba(99,102,241,0.15);border-radius:10px;padding:14px;margin-bottom:10px}
.exec-title{font-size:13px;font-weight:800;margin-bottom:8px}
.exec-desc{font-size:9px;color:#cbd5e1;line-height:1.5;margin-bottom:10px}
.exec-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.exec-item{display:flex;align-items:center;gap:5px;padding:7px;background:rgba(255,255,255,0.02);border-radius:6px;font-size:8px}
.exec-check{width:14px;height:14px;background:linear-gradient(135deg,#10b981,#059669);border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:8px;flex-shrink:0}

.cta{background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(168,85,247,0.08));border:1px solid rgba(99,102,241,0.2);border-radius:10px;padding:14px;text-align:center}
.cta-title{font-size:16px;font-weight:800;margin-bottom:4px}
.cta-sub{font-size:9px;color:#94a3b8;margin-bottom:10px}
.cta-btn{display:inline-flex;align-items:center;gap:5px;padding:8px 18px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:8px;font-weight:700;font-size:10px}

@media print{.page{margin:0}}
</style>
</head>
<body>

<!-- PAGE 1 -->
<div class="page">
  <div class="bg"><div class="orb orb1"></div><div class="orb orb2"></div><div class="mesh"></div></div>
  <div class="content">
    <div class="header">
      <div class="brand">
        ${logos.xylonet ? `<img src="${logos.xylonet}" class="logo-img">` : ''}
        <span class="logo-text">XyloNet</span>
        <div class="partners">
          <div class="partner">${logos.usdc ? `<img src="${logos.usdc}">` : ''}<span>USDC</span></div>
          <div class="partner">${logos.arc ? `<img src="${logos.arc}">` : ''}<span>Arc</span></div>
        </div>
      </div>
      <div class="badge">Confidential • Investor Report</div>
    </div>
    
    <div class="title-box">
      <h1 class="main-title">Traction Report</h1>
      <p class="subtitle">${days} Days Since Launch (Jan 2, 2026) • Arc Testnet • Built by ForgeLabs</p>
    </div>
    
    <div class="hero">
      <div class="hero-card"><div class="hero-icon">💰</div><div class="hero-val">$${n(totalVol/1000000)}M</div><div class="hero-lbl">Total Volume</div></div>
      <div class="hero-card"><div class="hero-icon">📊</div><div class="hero-val">${n(totalTx)}</div><div class="hero-lbl">Transactions</div></div>
      <div class="hero-card"><div class="hero-icon">👥</div><div class="hero-val">${n(s.totalUsers)}</div><div class="hero-lbl">Unique Wallets</div></div>
      <div class="hero-card"><div class="hero-icon">🏆</div><div class="hero-val">${n(s.totalPoints)}</div><div class="hero-lbl">Points Earned</div></div>
    </div>
    
    <div class="products">
      <div class="product swap">
        <div class="product-head"><div class="product-icon">🔄</div><span class="product-name">XyloSwap</span></div>
        <div class="product-stat"><span class="product-stat-lbl">Total Volume</span><span class="product-stat-val blue">$${$(s.swap.volume)}</span></div>
        <div class="product-stat"><span class="product-stat-lbl">Total Swaps</span><span class="product-stat-val">${n(s.swap.count)}</span></div>
        <div class="product-stat"><span class="product-stat-lbl">Unique Swappers</span><span class="product-stat-val">${n(s.swap.users)}</span></div>
        <div class="product-stat"><span class="product-stat-lbl">Avg/User</span><span class="product-stat-val">${(s.swap.count/s.swap.users).toFixed(1)} swaps</span></div>
        <div class="product-stat"><span class="product-stat-lbl">Pairs</span><span class="product-stat-val">USDC/EURC, USDC/USYC</span></div>
      </div>
      
      <div class="product vault">
        <div class="product-head"><div class="product-icon">🏦</div><span class="product-name">XyloVault</span></div>
        <div class="product-stat"><span class="product-stat-lbl">Total Deposited</span><span class="product-stat-val green">$${$(s.vault.volume)}</span></div>
        <div class="product-stat"><span class="product-stat-lbl">Total Deposits</span><span class="product-stat-val">${n(s.vault.count)}</span></div>
        <div class="product-stat"><span class="product-stat-lbl">Unique Depositors</span><span class="product-stat-val">${n(s.vault.users)}</span></div>
        <div class="product-stat"><span class="product-stat-lbl">Vault Type</span><span class="product-stat-val">ERC-4626</span></div>
        <div class="product-stat"><span class="product-stat-lbl">Yield Source</span><span class="product-stat-val">USYC (T-Bills)</span></div>
      </div>
      
      <div class="product payx">
        <div class="product-head"><div class="product-icon">💸</div><span class="product-name">PayX</span></div>
        <div class="product-stat"><span class="product-stat-lbl">Tip Volume</span><span class="product-stat-val orange">$${$(s.payx.volume)}</span></div>
        <div class="product-stat"><span class="product-stat-lbl">Total Tips</span><span class="product-stat-val">${n(s.payx.count)}</span></div>
        <div class="product-stat"><span class="product-stat-lbl">Unique Tippers</span><span class="product-stat-val">${n(s.payx.tippers)}</span></div>
        <div class="product-stat"><span class="product-stat-lbl">Recipients</span><span class="product-stat-val">${n(s.payx.recipients)}</span></div>
        <div class="product-stat"><span class="product-stat-lbl">Protocol Fees</span><span class="product-stat-val green">$${$(s.payx.fees)}</span></div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title"><div class="section-icon">⚡</div>Technology & Infrastructure</div>
      <div class="tech-grid">
        <div class="tech-item"><div class="tech-name">Network</div><div class="tech-val">Arc Testnet</div></div>
        <div class="tech-item"><div class="tech-name">Finality</div><div class="tech-val">&lt;350ms</div></div>
        <div class="tech-item"><div class="tech-name">TX Cost</div><div class="tech-val">~$0.01</div></div>
        <div class="tech-item"><div class="tech-name">Bridge</div><div class="tech-val">CCTP V2</div></div>
        <div class="tech-item"><div class="tech-name">AMM</div><div class="tech-val">StableSwap</div></div>
        <div class="tech-item"><div class="tech-name">Vault</div><div class="tech-val">ERC-4626</div></div>
        <div class="tech-item"><div class="tech-name">Chains</div><div class="tech-val">7 Networks</div></div>
        <div class="tech-item"><div class="tech-name">Tokens</div><div class="tech-val">USDC, EURC, USYC</div></div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title"><div class="section-icon">📜</div>Deployed Contracts (Arc Testnet)</div>
      <div class="contracts">
        <div class="contract-row"><span class="contract-name">XyloFactory</span><span class="contract-addr">0x60EDeFB094B84BBC6430cc130B358A43Ba1979e2</span></div>
        <div class="contract-row"><span class="contract-name">XyloRouter</span><span class="contract-addr">0x73742278c31a76dBb0D2587d03ef92E6E2141023</span></div>
        <div class="contract-row"><span class="contract-name">XyloBridge</span><span class="contract-addr">0xf7Df65Ce418E938ee8d9a0A0d227A43441fe4641</span></div>
        <div class="contract-row"><span class="contract-name">XyloVault</span><span class="contract-addr">0x240Eb85458CD41361bd8C3773253a1D78054f747</span></div>
        <div class="contract-row"><span class="contract-name">USDC/EURC Pool</span><span class="contract-addr">0x3DF3966F5138143dce7a9cFDdC2c0310ce083BB1</span></div>
        <div class="contract-row"><span class="contract-name">USDC/USYC Pool</span><span class="contract-addr">0x8296cC7477A9CD12cF632042fDDc2aB89151bb61</span></div>
      </div>
    </div>
    
    <div class="footer">
      <div>Built by <strong>ForgeLabs</strong></div>
      <div>${new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})} • Page 1/2</div>
    </div>
  </div>
</div>

<!-- PAGE 2 -->
<div class="page">
  <div class="bg"><div class="orb orb1" style="top:50%;left:-15%"></div><div class="orb orb2" style="top:-10%;right:-15%"></div><div class="mesh"></div></div>
  <div class="content">
    <div class="header">
      <div class="brand">
        ${logos.xylonet ? `<img src="${logos.xylonet}" class="logo-img">` : ''}
        <span class="logo-text">XyloNet</span>
      </div>
    </div>
    
    <div class="title-box">
      <h1 class="main-title" style="font-size:26px">Key Insights & Opportunity</h1>
      <p class="subtitle">${days} Days of Traction on Arc Testnet</p>
    </div>
    
    <div class="insights">
      <div class="insight">
        <div class="insight-head"><div class="insight-icon purple">📈</div><span class="insight-title">Massive Scale</span></div>
        <p class="insight-desc">700K+ swaps in ${days} days with $11.5M+ volume demonstrates product-market fit. Users actively trading stablecoins on Arc.</p>
        <div class="insight-metric"><span class="insight-big purple">${n(s.swap.count)}</span><span class="insight-unit">Total Swaps</span></div>
      </div>
      
      <div class="insight">
        <div class="insight-head"><div class="insight-icon green">🏦</div><span class="insight-title">Capital Attraction</span></div>
        <p class="insight-desc">$2.7M deposited in ERC-4626 vaults earning real yield from USYC (US Treasury-backed). Strong user trust.</p>
        <div class="insight-metric"><span class="insight-big green">$${$(s.vault.volume/1000000)}M</span><span class="insight-unit">Total Deposited</span></div>
      </div>
      
      <div class="insight">
        <div class="insight-head"><div class="insight-icon orange">💸</div><span class="insight-title">Social Payments</span></div>
        <p class="insight-desc">PayX enables Twitter tipping with ${p(s.payx.retention)} retention. ${n(s.payx.power)} power users driving engagement.</p>
        <div class="insight-metric"><span class="insight-big orange">${p(s.payx.retention)}</span><span class="insight-unit">Retention Rate</span></div>
      </div>
      
      <div class="insight">
        <div class="insight-head"><div class="insight-icon cyan">🌊</div><span class="insight-title">Market Opportunity</span></div>
        <p class="insight-desc">Stablecoin market is $150B+. XyloNet targets DeFi trading, yield, and social payments on next-gen L2.</p>
        <div class="insight-metric"><span class="insight-big cyan">$150B+</span><span class="insight-unit">Stablecoin TAM</span></div>
      </div>
    </div>
    
    <div class="insights">
      <div class="insight">
        <div class="insight-head"><div class="insight-icon purple">👥</div><span class="insight-title">User Acquisition</span></div>
        <p class="insight-desc">${n(s.totalUsers)} unique wallets interacted with XyloNet. Points program driving engagement with ${n(s.registeredUsers)} registered.</p>
        <div class="insight-metric"><span class="insight-big purple">${n(s.totalUsers)}</span><span class="insight-unit">Unique Wallets</span></div>
      </div>
      
      <div class="insight">
        <div class="insight-head"><div class="insight-icon green">💹</div><span class="insight-title">Revenue Model</span></div>
        <p class="insight-desc">PayX generates $${$(s.payx.fees)} in protocol fees (1%). Swap fees additional. Sustainable unit economics.</p>
        <div class="insight-metric"><span class="insight-big green">$${$(s.payx.fees)}</span><span class="insight-unit">PayX Fees</span></div>
      </div>
    </div>
    
    <div class="exec">
      <div class="exec-title">🚀 Executive Summary</div>
      <p class="exec-desc">XyloNet is the premier stablecoin SuperExchange on Arc Network, combining trading (XyloSwap), yield (XyloVault), bridging (XyloBridge), and social payments (PayX). In <strong>${days} days</strong>, we've achieved $${n(totalVol/1000000)}M volume, ${n(s.totalUsers)} unique wallets, and ${n(totalTx)} transactions.</p>
      <div class="exec-grid">
        <div class="exec-item"><div class="exec-check">✓</div><span><strong>$${$(s.swap.volume/1000000)}M</strong> Swap Vol</span></div>
        <div class="exec-item"><div class="exec-check">✓</div><span><strong>$${$(s.vault.volume/1000000)}M</strong> Deposited</span></div>
        <div class="exec-item"><div class="exec-check">✓</div><span><strong>${n(s.swap.count)}</strong> Swaps</span></div>
        <div class="exec-item"><div class="exec-check">✓</div><span><strong>${n(s.totalUsers)}</strong> Wallets</span></div>
        <div class="exec-item"><div class="exec-check">✓</div><span><strong>6</strong> Contracts</span></div>
        <div class="exec-item"><div class="exec-check">✓</div><span><strong>7</strong> Chains</span></div>
        <div class="exec-item"><div class="exec-check">✓</div><span><strong>&lt;350ms</strong> Finality</span></div>
        <div class="exec-item"><div class="exec-check">✓</div><span><strong>$${$(s.payx.fees)}</strong> Fees</span></div>
      </div>
    </div>
    
    <div class="cta">
      <div class="cta-title">Let's Build Together</div>
      <p class="cta-sub">Seeking strategic partners to scale XyloNet globally</p>
      <div class="cta-btn">📧 forgelabs@xylonet.xyz</div>
    </div>
    
    <div class="footer">
      <div>Built by <strong>ForgeLabs</strong></div>
      <div>${new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})} • Page 2/2</div>
    </div>
  </div>
</div>

</body>
</html>`;
}

async function generate() {
  console.log('\n🚀 XyloNet VC Report (Using Verified Data)\n');
  
  const logos = {
    xylonet: getBase64('frontend/public/logo.png'),
    payx: getBase64('frontend/public/payx-logo.png'),
    arc: getBase64('frontend/public/chains/arc.png'),
    usdc: getBase64('frontend/public/tokens/usdc.png'),
  };
  
  const htmlContent = html(STATS, logos);
  fs.writeFileSync(path.join(__dirname, '..', 'XyloNet_VC_Report.html'), htmlContent);
  
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(r => setTimeout(r, 500));
  await page.pdf({ path: path.join(__dirname, '..', 'XyloNet_VC_Report.pdf'), format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await browser.close();
  
  console.log('✅ PDF Generated: XyloNet_VC_Report.pdf\n');
}

generate().catch(console.error);
