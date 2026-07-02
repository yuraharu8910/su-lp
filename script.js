/* =================================================================
   素 -SU- ランディングページ ｜ script.js
   ================================================================= */

/* -----------------------------------------------------------------
   1. 「動きを減らす」設定の人への配慮
----------------------------------------------------------------- */
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const heroVideo = document.querySelector(".hero__video");

if (heroVideo && prefersReducedMotion) {
  heroVideo.removeAttribute("autoplay");
  heroVideo.pause();
}

/* -----------------------------------------------------------------
   2. ヘッダーの演出
----------------------------------------------------------------- */
const header = document.querySelector(".site-header");

function onScroll() {
  if (header) {
    if (window.scrollY > 40) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* -----------------------------------------------------------------
   3. スクロールで要素をふわっと表示（.reveal → .is-visible）
----------------------------------------------------------------- */
const revealEls = document.querySelectorAll(".reveal");

if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(function (el) { io.observe(el); });
} else {
  revealEls.forEach(function (el) { el.classList.add("is-visible"); });
}

/* -----------------------------------------------------------------
   4. 申込みフォーム
----------------------------------------------------------------- */
const orderForm = document.querySelector("#orderForm");
const orderResult = document.querySelector("#orderResult");

if (orderForm) {
  orderForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const name  = orderForm.querySelector("#of-name").value.trim();
    const email = orderForm.querySelector("#of-email").value.trim();
    const plan  = orderForm.querySelector('input[name="plan"]:checked').value;

    if (!name || !email) {
      orderResult.textContent = "お名前とメールアドレスをご入力ください。";
      orderResult.className = "order-form__result is-error";
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      orderResult.textContent = "メールアドレスの形式をご確認ください。";
      orderResult.className = "order-form__result is-error";
      return;
    }
    const planLabel = plan === "subscription" ? "定期便 初回¥1,900" : "単品 ¥3,800";
    orderResult.textContent = name + "様、「" + planLabel + "」のお申し込みを受け付けました（デモ）。";
    orderResult.className = "order-form__result is-success";
    orderForm.reset();
  });
}

/* -----------------------------------------------------------------
   5. SP専用：画面下固定CTAバーの表示制御
   基準：hero__inner--first（1枚目）の底辺が画面上に消えたら表示
   フォールバック：.hero全体を使う（hero__inner--firstが取得できない場合）
----------------------------------------------------------------- */
const spStickyCta = document.getElementById("stickyCta");

function updateSpStickyCta() {
  if (window.innerWidth >= 769) return;

  // 1枚目を優先、なければ.hero全体を使う
  const firstPanel = document.querySelector(".hero__inner--first") 
                   || document.querySelector(".hero");
  let triggerBottom = 0;
  if (firstPanel) {
    triggerBottom = firstPanel.getBoundingClientRect().bottom;
  }

  const purchaseSec = document.getElementById("purchase");
  let purchaseInView = false;
  if (purchaseSec) {
    purchaseInView = purchaseSec.getBoundingClientRect().top < window.innerHeight * 0.85;
  }

  // 1枚目を抜けた かつ 購入フォームがまだ見えていない → 表示
  if (triggerBottom < 0 && !purchaseInView) {
    spStickyCta.classList.add("is-visible");
  } else {
    spStickyCta.classList.remove("is-visible");
  }
}

if (spStickyCta) {
  window.addEventListener("scroll", updateSpStickyCta, { passive: true });
  window.addEventListener("resize", updateSpStickyCta, { passive: true });
  updateSpStickyCta();
}

/* -----------------------------------------------------------------
   6. PC専用：右下固定CTAバーの表示制御
----------------------------------------------------------------- */
const pcStickyCta = document.getElementById("pcStickyCta");
const purchaseSection = document.getElementById("purchase");

function updatePcStickyCta() {
  if (window.innerWidth < 769) return;

  const scrollY = window.scrollY;
  let purchaseInView = false;
  if (purchaseSection) {
    const rect = purchaseSection.getBoundingClientRect();
    purchaseInView = rect.top < window.innerHeight * 0.8;
  }

  if (scrollY > 300 && !purchaseInView) {
    pcStickyCta.classList.add("is-visible");
    pcStickyCta.removeAttribute("aria-hidden");
  } else {
    pcStickyCta.classList.remove("is-visible");
    pcStickyCta.setAttribute("aria-hidden", "true");
  }
}

if (pcStickyCta) {
  window.addEventListener("scroll", updatePcStickyCta, { passive: true });
  window.addEventListener("resize", updatePcStickyCta, { passive: true });
  updatePcStickyCta();
}

/* -----------------------------------------------------------------
   7. パララックス背景（PC用）
----------------------------------------------------------------- */
const parallaxTargets = document.querySelectorAll(".section--dark, .concept");

function updateParallax() {
  parallaxTargets.forEach(function (section) {
    const rect = section.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const progress = (centerY - window.innerHeight / 2) / window.innerHeight;
    const shift = progress * 60;
    section.style.setProperty("--parallax-y", shift + "px");
  });
}

if (!prefersReducedMotion && parallaxTargets.length > 0) {
  window.addEventListener("scroll", updateParallax, { passive: true });
  updateParallax();
}

/* -----------------------------------------------------------------
   8. スマホCTAボタン：タップで購入フォームへスムーズスクロール
   onclick="..." をHTMLから外し、ここで処理を受け持つ
----------------------------------------------------------------- */
const stickyCtaBtn = document.getElementById("stickyCtaBtn");

if (stickyCtaBtn) {
  // "click" はスマホのタップでも発火する（touchstart より互換性が高い）
  stickyCtaBtn.addEventListener("click", function () {
    const purchase = document.getElementById("purchase");
    if (purchase) {
      // smoothでふわっとスクロール（ブラウザ標準機能）
      purchase.scrollIntoView({ behavior: "smooth" });
    }
  });
}

/* -----------------------------------------------------------------
   10. 統計数値のカウントアップアニメーション
   .js-countup クラスがついた要素が画面に入ったら、
   0 → data-target属性の数値まで、じわっと増えていくようにします。
----------------------------------------------------------------- */
const countEls = document.querySelectorAll(".js-countup");

if (countEls.length > 0) {
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    // 「動きを減らす」設定の人・非対応ブラウザには、最初から完成した数字だけ表示
    countEls.forEach(function (el) {
      const decimals = el.dataset.decimals ? Number(el.dataset.decimals) : 0;
      el.textContent = parseFloat(el.dataset.target).toFixed(decimals);
    });
  } else {
    const countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.target);           // 目標の数値（例：74.8）
        const decimals = el.dataset.decimals ? Number(el.dataset.decimals) : 0;
        const duration = 1200; // アニメーションの長さ（ミリ秒）＝1.2秒
        const startTime = performance.now();

        function tick(now) {
          const progress = Math.min((now - startTime) / duration, 1); // 0〜1で進捗を表す
          const eased = 1 - Math.pow(1 - progress, 3); // 後半ゆっくり止まる「easeOut」という動き方
          el.textContent = (target * eased).toFixed(decimals);
          if (progress < 1) {
            requestAnimationFrame(tick); // 次の描画フレームでもう一度実行（＝アニメーションのループ）
          } else {
            el.textContent = target.toFixed(decimals); // 最後は目標値でぴったり止める（誤差防止）
          }
        }
        requestAnimationFrame(tick);
        countIO.unobserve(el); // 一度動いたら監視をやめる（何度も再生させない）
      });
    }, { threshold: 0.5 }); // 要素の50%が見えたら発火

    countEls.forEach(function (el) { countIO.observe(el); });
  }
}