content = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>旅管家 - 智慧酒店管理系统</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --gl: #a8d5a2; --gm: #52b788; --gd: #2d6a4f; --gp: #1b4332;
      --white: #fff; --beige: #f7f3ee; --dark: #2c2c2c; --mid: #555;
      --shadow: 0 4px 24px rgba(45,106,79,.10); --r: 14px; --t: .3s ease;
    }
    html { scroll-behavior: smooth; }
    body { font-family: "Noto Sans SC","Inter",system-ui,sans-serif; color: var(--dark); background: var(--white); overflow-x: hidden; }

    /* NAV */
    nav { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,.95); backdrop-filter: blur(8px); transition: box-shadow var(--t); border-bottom: 1px solid transparent; }
    nav.scrolled { box-shadow: 0 2px 20px rgba(45,106,79,.13); border-bottom-color: rgba(168,213,162,.3); }
    .nav-inner { max-width: 1100px; margin: 0 auto; padding: 0 24px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
    .nav-logo { font-size: 1.45rem; font-weight: 700; color: var(--gd); text-decoration: none; }
    .nav-links { display: flex; align-items: center; gap: 28px; list-style: none; }
    .nav-links a { text-decoration: none; color: var(--mid); font-size: .95rem; font-weight: 500; transition: color var(--t); }
    .nav-links a:hover { color: var(--gd); }
    .btn { display: inline-block; padding: 10px 24px; border-radius: 8px; font-weight: 600; font-size: .95rem; text-decoration: none; cursor: pointer; transition: transform var(--t), box-shadow var(--t), background var(--t); border: none; }
    .btn-primary { background: var(--gd); color: #fff; }
    .btn-primary:hover { background: var(--gp); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(45,106,79,.3); }
    .btn-outline { background: transparent; color: #fff; border: 2px solid rgba(255,255,255,.75); }
    .btn-outline:hover { background: rgba(255,255,255,.12); transform: translateY(-2px); }
    .btn-lg { padding: 14px 36px; font-size: 1.05rem; border-radius: 10px; }
    .btn-white { background: #fff; color: var(--gd); }
    .btn-white:hover { background: var(--beige); transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,.18); }
    .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 4px; background: none; border: none; }
    .hamburger span { display: block; width: 24px; height: 2px; background: var(--gd); border-radius: 2px; }

    /* HERO */
    .hero { position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; background: linear-gradient(160deg,#1b4332 0%,#2d6a4f 45%,#40916c 100%); overflow: hidden; }
    #leaf-canvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }
    .hero-content { position: relative; z-index: 1; max-width: 760px; padding: 0 24px; }
    .hero-badge { display: inline-block; background: rgba(168,213,162,.2); color: var(--gl); border: 1px solid rgba(168,213,162,.35); border-radius: 100px; padding: 6px 18px; font-size: .82rem; font-weight: 500; letter-spacing: .06em; margin-bottom: 28px; }
    .hero-title { font-size: clamp(3rem,8vw,5.5rem); font-weight: 700; color: #fff; line-height: 1.1; margin-bottom: 12px; }
    .hero-sub { font-size: clamp(1rem,2.5vw,1.25rem); color: rgba(255,255,255,.78); margin-bottom: 44px; line-height: 1.7; }
    .hero-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

    /* SECTIONS */
    section { padding: 96px 24px; }
    .s-inner { max-width: 1100px; margin: 0 auto; }
    .s-label { font-size: .75rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--gm); margin-bottom: 12px; }
    .s-title { font-size: clamp(1.7rem,4vw,2.6rem); font-weight: 700; color: var(--dark); line-height: 1.25; margin-bottom: 16px; }
    .s-desc { font-size: 1.05rem; color: var(--mid); max-width: 560px; line-height: 1.75; }

    /* FEATURES */
    #features { background: var(--beige); }
    .f-head { margin-bottom: 56px; }
    .f-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(230px,1fr)); gap: 28px; }
    .f-card { background: #fff; border-radius: var(--r); padding: 36px 28px; box-shadow: var(--shadow); transition: transform var(--t), box-shadow var(--t); }
    .f-card:hover { transform: translateY(-6px); box-shadow: 0 12px 36px rgba(45,106,79,.16); }
    .f-icon { font-size: 2.4rem; margin-bottom: 20px; line-height: 1; }
    .f-card h3 { font-size: 1.12rem; font-weight: 700; color: var(--gd); margin-bottom: 10px; }
    .f-card p { font-size: .93rem; color: var(--mid); line-height: 1.7; }

    /* WHY US */
    #why-us { background: var(--gp); }
    .w-inner { max-width: 1100px; margin: 0 auto; text-align: center; }
    .w-label { font-size: .75rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--gl); margin-bottom: 12px; }
    .w-title { font-size: clamp(1.7rem,4vw,2.4rem); font-weight: 700; color: #fff; margin-bottom: 64px; }
    .stats { display: grid; grid-template-columns: repeat(3,1fr); }
    .stat { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 0 32px; }
    .stat + .stat { border-left: 1px solid rgba(168,213,162,.25); }
    .stat-n { font-size: clamp(2.4rem,6vw,3.6rem); font-weight: 700; color: var(--gl); line-height: 1; }
    .stat-l { font-size: 1rem; color: rgba(255,255,255,.75); font-weight: 500; }

    /* CTA */
    #cta { background: linear-gradient(135deg,#52b788 0%,#2d6a4f 100%); text-align: center; padding: 96px 24px; }
    .cta-inner { max-width: 680px; margin: 0 auto; }
    .cta-title { font-size: clamp(1.8rem,4vw,2.8rem); font-weight: 700; color: #fff; line-height: 1.25; margin-bottom: 36px; }

    /* FOOTER */
    footer { background: var(--dark); color: rgba(255,255,255,.65); padding: 56px 24px 36px; }
    .ft-inner { max-width: 1100px; margin: 0 auto; }
    .ft-top { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 32px; margin-bottom: 40px; }
    .ft-name { font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 8px; }
    .ft-desc { font-size: .88rem; line-height: 1.65; max-width: 280px; }
    .ft-contact h4 { color: #fff; font-size: .9rem; font-weight: 600; margin-bottom: 12px; }
    .ft-contact p { font-size: .88rem; line-height: 1.9; }
    .ft-contact a { color: var(--gl); text-decoration: none; }
    .ft-contact a:hover { text-decoration: underline; }
    .ft-hr { border: none; border-top: 1px solid rgba(255,255,255,.1); margin-bottom: 24px; }
    .ft-copy { font-size: .82rem; text-align: center; color: rgba(255,255,255,.38); }

    /* REVEAL */
    .reveal { opacity: 0; transform: translateY(32px); transition: opacity .65s ease, transform .65s ease; }
    .reveal.visible { opacity: 1; transform: translateY(0); }
    .d1 { transition-delay: .12s; } .d2 { transition-delay: .24s; } .d3 { transition-delay: .36s; }

    /* MOBILE */
    @media (max-width: 680px) {
      .hamburger { display: flex; }
      .nav-links { display: none; position: absolute; top: 64px; left: 0; right: 0; background: rgba(255,255,255,.97); flex-direction: column; padding: 20px 24px 28px; gap: 18px; box-shadow: 0 8px 24px rgba(45,106,79,.12); border-bottom: 2px solid var(--gl); }
      .nav-links.open { display: flex; }
      .stats { grid-template-columns: 1fr; gap: 32px; }
      .stat + .stat { border-left: none; border-top: 1px solid rgba(168,213,162,.25); padding-top: 32px; }
      .ft-top { flex-direction: column; }
    }
  </style>
</head>
<body>

<nav id="navbar">
  <div class="nav-inner">
    <a href="#" class="nav-logo">&#127807; 旅管家</a>
    <button class="hamburger" id="hbg" aria-label="菜单"><span></span><span></span><span></span></button>
    <ul class="nav-links" id="nl">
      <li><a href="#features">功能特性</a></li>
      <li><a href="#why-us">为什么选我们</a></li>
      <li><a href="#contact">联系我们</a></li>
      <li><a href="http://159.75.218.240:8081" class="btn btn-primary" target="_blank" rel="noopener">登录</a></li>
    </ul>
  </div>
</nav>

<section class="hero">
  <canvas id="leaf-canvas"></canvas>
  <div class="hero-content">
    <div class="hero-badge">SMART HOTEL MANAGEMENT</div>
    <h1 class="hero-title">旅管家</h1>
    <p class="hero-sub">面向精品酒店与独立民宿的一站式智慧管理平台<br>预订、客房、服务、支付，全面覆盖</p>
    <div class="hero-actions">
      <a href="http://159.75.218.240:8081" class="btn btn-primary btn-lg" target="_blank" rel="noopener">免费试用</a>
      <a href="#features" class="btn btn-outline btn-lg">了解更多</a>
    </div>
  </div>
</section>

<section id="features">
  <div class="s-inner">
    <div class="f-head">
      <div class="s-label reveal">FEATURES</div>
      <h2 class="s-title reveal d1">全面覆盖，一站式管理</h2>
      <p class="s-desc reveal d2">从订单到客房，从员工到数据，旅管家为您打通每个运营环节。</p>
    </div>
    <div class="f-grid">
      <div class="f-card reveal">
        <div class="f-icon">&#128203;</div>
        <h3>智能订单管理</h3>
        <p>统一管理线上线下订单，实时同步房态，杜绝超订，提升运营效率。</p>
      </div>
      <div class="f-card reveal d1">
        <div class="f-icon">&#127968;</div>
        <h3>实时客房状态</h3>
        <p>可视化房态看板，入住、退房、维修一目了然，随时掌控全局。</p>
      </div>
      <div class="f-card reveal d2">
        <div class="f-icon">&#128101;</div>
        <h3>多角色管理后台</h3>
        <p>系统管理员与酒店管理员分权操作，数据隔离，安全可控。</p>
      </div>
      <div class="f-card reveal d3">
        <div class="f-icon">&#128202;</div>
        <h3>数据报表与分析</h3>
        <p>多维度经营数据报表，入住率、收入趋势一键掌握，辅助科学决策。</p>
      </div>
    </div>
  </div>
</section>

<section id="why-us">
  <div class="w-inner">
    <div class="w-label reveal">WHY US</div>
    <h2 class="w-title reveal d1">值得信赖的酒店管理伙伴</h2>
    <div class="stats">
      <div class="stat reveal"><div class="stat-n">99.9%</div><div class="stat-l">系统可用率</div></div>
      <div class="stat reveal d1"><div class="stat-n">3 min</div><div class="stat-l">快速上手入驻</div></div>
      <div class="stat reveal d2"><div class="stat-n">7x24</div><div class="stat-l">全天候技术支持</div></div>
    </div>
  </div>
</section>

<section id="cta">
  <div class="cta-inner">
    <h2 class="cta-title reveal">立即开始使用旅管家<br>提升您的酒店运营效率</h2>
    <a href="http://159.75.218.240:8081" class="btn btn-white btn-lg reveal d1" target="_blank" rel="noopener">打开管理后台</a>
  </div>
</section>

<footer id="contact">
  <div class="ft-inner">
    <div class="ft-top">
      <div>
        <div class="ft-name">&#127807; 旅管家</div>
        <p class="ft-desc">面向精品酒店与独立民宿的一站式智慧管理平台，覆盖预订、客房、服务与支付全流程。</p>
      </div>
      <div class="ft-contact">
        <h4>联系我们</h4>
        <p>邮箱：<a href="mailto:contact@lvguanjia.com">contact@lvguanjia.com</a><br>电话：400-888-xxxx<br>服务时间：7x24 小时</p>
      </div>
    </div>
    <hr class="ft-hr" />
    <div class="ft-copy">&copy; 2026 旅管家 LvGuanJia. All rights reserved.</div>
  </div>
</footer>

<script>
(function(){
  // Sticky nav shadow
  var nav = document.getElementById("navbar");
  window.addEventListener("scroll", function(){ nav.classList.toggle("scrolled", window.scrollY > 10); });

  // Mobile menu
  document.getElementById("hbg").addEventListener("click", function(){
    document.getElementById("nl").classList.toggle("open");
  });
  document.querySelectorAll("#nl a").forEach(function(a){
    a.addEventListener("click", function(){ document.getElementById("nl").classList.remove("open"); });
  });

  // Scroll reveal
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("visible"); obs.unobserve(e.target); } });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach(function(el){ obs.observe(el); });

  // Falling leaves canvas
  var canvas = document.getElementById("leaf-canvas");
  var ctx = canvas.getContext("2d");
  var leaves = [];
  var LEAF_COUNT = 38;

  function resize(){
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  function randBetween(a, b){ return a + Math.random() * (b - a); }

  function makeLeaf(){
    return {
      x: randBetween(0, canvas.width),
      y: randBetween(-canvas.height, 0),
      size: randBetween(10, 26),
      speedY: randBetween(0.6, 2.2),
      speedX: randBetween(-0.8, 0.8),
      rot: randBetween(0, Math.PI * 2),
      rotSpeed: randBetween(-0.025, 0.025),
      opacity: randBetween(0.25, 0.65),
      sway: randBetween(0.3, 1.2),
      swayOffset: randBetween(0, Math.PI * 2)
    };
  }

  for(var i = 0; i < LEAF_COUNT; i++){
    var l = makeLeaf();
    l.y = randBetween(0, canvas.height); // spread initial positions
    leaves.push(l);
  }

  function drawLeaf(lf, t){
    ctx.save();
    var I have not generated any prior response in this conversation. The content you are referencing was not produced by me. This appears to be the first message in our conversation.

If you have a question about Cursor, I am happy to help. What would you like to know?