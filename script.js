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
   シャンプー（定期便 or 単品、どちらか1つ）＋ エッセンス・マスク（複数選択可）
   を組み合わせて、選ばれた商品名をまとめて表示します。
----------------------------------------------------------------- */
const orderForm = document.querySelector("#orderForm");
const orderResult = document.querySelector("#orderResult");

// 商品ごとの「表示用の名前」を、あらかじめ辞書（オブジェクト）にまとめておきます
const productLabels = {
  "shampoo-sub": "シャンプー（定期便）初回¥1,900",
  "shampoo-single": "シャンプー（単品）¥3,800",
  "essence": "スカルプエッセンス ¥4,200",
  "mask": "ウィークリーマスク ¥4,200"
};

if (orderForm) {
  orderForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = orderForm.querySelector("#of-name").value.trim();
    const email = orderForm.querySelector("#of-email").value.trim();

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

    // シャンプーは必ずどちらか1つ選ばれている（ラジオボタンなので）
    const shampooPlan = orderForm.querySelector('input[name="shampoo-plan"]:checked').value;

    // エッセンス／マスクは、チェックが入っているものだけを配列として取り出す
    // querySelectorAll は「該当する要素すべて」を取ってくる仕組みです
    const checkedAddons = orderForm.querySelectorAll('input[name="addon"]:checked');
    const addonValues = Array.from(checkedAddons).map(function (el) {
      return el.value;
    });

    // シャンプー＋エッセンス／マスクを1つの配列にまとめて、表示名に変換
    const selectedValues = [shampooPlan].concat(addonValues); // 例：["shampoo-sub", "essence", "mask"]
    const selectedLabels = selectedValues.map(function (value) {
      return productLabels[value];
    });
    const summaryText = selectedLabels.join("／"); // 「／」区切りでつなげる

    orderResult.textContent = name + "様、「" + summaryText + "」のお申し込みを受け付けました（デモ）。";
    orderResult.className = "order-form__result is-success";

    // ---- 計測：申込み完了をGTMへ知らせる ----
    // dataLayer＝GTMへデータを渡すための配列（index.htmlのGTMコードが用意します）。
    // ここに { event: "order_submit" } を入れると、GTM側で「申込み完了」として拾えます。
    // 入力チェックを通過した"成功時だけ"送るので、エラー時はカウントされません。
    // ※お名前・メールアドレスなどの個人情報は、計測には絶対に送りません。
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "order_submit",              // GTMのトリガーで使うイベント名
      order_plan: shampooPlan,            // 例："shampoo-sub"（定期便）／"shampoo-single"（単品）
      order_addons: addonValues.join(",") // 例："essence,mask"（追加なしなら空文字）
    });

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
   9. 「こんなこと、ありませんか？」カードの自動横スライド
   対象：.problem__checks--carousel（SP・PC共通の同じ要素）

   ・SPは80vw幅、PCは300px幅とCSS側でカードサイズが変わりますが、
     JSは「今そのときのカード幅」をその都度測って動くので、
     SP／PCで処理を分ける必要はありません。
   ・setInterval：「〇ミリ秒ごとに、この処理を繰り返し実行する」という
     ブラウザの仕組みです。ここでは3.5秒（3500ミリ秒）ごとに
     scrollToNextCard()という関数を呼び出しています。
   ・「動きを減らす」設定の人には自動再生しません（1番の仕組みと同じ配慮）。
----------------------------------------------------------------- */
const checkCarousel = document.querySelector(".problem__checks--carousel");

if (checkCarousel && !prefersReducedMotion) {
  let autoSlideTimer = null;         // setIntervalのIDを入れておく箱（止めるときに使う）
  const AUTO_SLIDE_INTERVAL = 4000;  // 何ミリ秒ごとに次のカードへ進むか（5.5秒。前は3.5秒でした）
  const SLIDE_DURATION = 1400;       // 1回のスクロール移動にかける時間（1.4秒。ゆっくりめの設定）

  // 指定した位置まで、指定した時間をかけてゆっくりスクロールする関数。
  // ブラウザ標準の scrollTo({behavior:"smooth"}) は速度を自分で調整できず
  // （ブラウザによって速い/遅いがバラバラ）、今回は「ゆっくり感」を安定して
  // 出したいので、10番の「カウントアップアニメーション」と同じ仕組み
  // （requestAnimationFrameで少しずつ動かす）を使って自作しています。
  function animateScrollTo(element, targetLeft, duration) {
    const startLeft = element.scrollLeft;       // 今の位置
    const distance = targetLeft - startLeft;    // 動かす距離
    const startTime = performance.now();

    // CSSの scroll-snap-type（スクロール位置をカードの区切りに自動で
    // ピタッと戻す機能）が、この1コマずつのscrollLeft変更と衝突して、
    // 「動かない」「カクつく」原因になっていました。
    // アニメーション中だけ一時的にオフにし、終わったら元に戻すことで、
    // 自動スライド中はなめらかに、手動でスワイプする時は今まで通り
    // ピタッと止まる、という両方の動きを両立させます。
    const originalSnapType = element.style.scrollSnapType;
    element.style.scrollSnapType = "none";

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1); // 0〜1で進み具合
      const eased = 1 - Math.pow(1 - progress, 3); // 後半ゆっくり止まる「easeOut」という動き方
      element.scrollLeft = startLeft + distance * eased;
      if (progress < 1) {
        requestAnimationFrame(tick); // 完了していなければ、次のフレームでも続ける
      } else {
        // アニメーション完了：scroll-snapを元の設定に戻す
        element.style.scrollSnapType = originalSnapType;
      }
    }
    requestAnimationFrame(tick);
  }

  // カードを1枚分、右へスクロールする関数
  function scrollToNextCard() {
    const firstCard = checkCarousel.querySelector(".problem__check");
    if (!firstCard) return;

    // getComputedStyle：CSSで実際に適用されている値をJSから読み取る仕組み。
    // ここでは今の画面幅（SP or PC）で使われている gap（カード間の隙間）を取得します。
    const gapValue = parseFloat(getComputedStyle(checkCarousel).gap) || 0;

    // 1回で動かす距離 ＝ カード1枚の横幅 ＋ カード間の隙間
    const step = firstCard.offsetWidth + gapValue;

    // scrollLeft：今どれだけ右にスクロールしているか
    // scrollWidth：中身全体の横幅／clientWidth：見えている枠（窓）の横幅
    // 「窓の右端」が「中身の右端」に近づいていたら、右端まで来たと判断します
    // （-8は「ほぼ端まで来ていればOK」とするための余裕分です）
    const isNearEnd =
      checkCarousel.scrollLeft + checkCarousel.clientWidth >= checkCarousel.scrollWidth - 8;

    if (isNearEnd) {
      // 右端まで来ていたら、最初にゆっくり戻る（ループ再生）
      animateScrollTo(checkCarousel, 0, SLIDE_DURATION);
    } else {
      // まだ続きがあれば、カード1枚分だけゆっくり右にスクロール
      animateScrollTo(checkCarousel, checkCarousel.scrollLeft + step, SLIDE_DURATION);
    }
  }

  function startAutoSlide() {
    stopAutoSlide(); // 念のため、先に既存のタイマーを止めてから開始（二重再生の防止）
    autoSlideTimer = setInterval(scrollToNextCard, AUTO_SLIDE_INTERVAL);
  }

  function stopAutoSlide() {
    if (autoSlideTimer) {
      clearInterval(autoSlideTimer); // タイマーを止める（setIntervalの逆の処理）
      autoSlideTimer = null;
    }
  }

  // ユーザーが指・マウスで触っている間は、自動再生を止める
  // touchstart：スマホで指が触れた瞬間／mouseenter：PCでマウスが乗った瞬間
  checkCarousel.addEventListener("touchstart", stopAutoSlide, { passive: true });
  checkCarousel.addEventListener("mouseenter", stopAutoSlide);

  // 触るのをやめたら、少し待ってから自動再生を再開する
  // （離した瞬間すぐに動き出すと、操作の邪魔に感じるため2秒待っています）
  checkCarousel.addEventListener("touchend", function () {
    setTimeout(startAutoSlide, 2000);
  });
  checkCarousel.addEventListener("mouseleave", function () {
    setTimeout(startAutoSlide, 2000);
  });

  // カードが画面に表示されてから、自動再生をスタートさせる。
  // すでに「3. スクロールで要素をふわっと表示」で使っているのと同じ
  // IntersectionObserver（要素が画面内に入ったことを検知する仕組み）を使います。
  // threshold: 0.3 は「カードが30%くらい画面に入ったら」という意味です。
  if ("IntersectionObserver" in window) {
    const carouselIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          startAutoSlide();
          carouselIO.unobserve(entry.target); // 一度スタートしたら、もう監視しなくてよいので外す
        }
      });
    }, { threshold: 0.3 });

    carouselIO.observe(checkCarousel);
  } else {
    // IntersectionObserverに対応していない古いブラウザ向けの保険：
    // 画面位置を判定できないので、ページ読み込み完了時にスタートします。
    window.addEventListener("load", startAutoSlide);
  }
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


/* -----------------------------------------------------------------
   11. ラインナップのボタンから来たら、対応する商品を自動選択
   data-product属性の値によって、
   ・シャンプー（shampoo-sub / shampoo-single）→ ラジオボタンを選択
   ・エッセンス／マスク（essence / mask）      → チェックボックスをON
   と挙動を分けています。
----------------------------------------------------------------- */
const productLinkBtns = document.querySelectorAll("[data-product]");

productLinkBtns.forEach(function (btn) {
  btn.addEventListener("click", function () {
    const productValue = btn.dataset.product; // 例："essence"

    if (productValue === "shampoo-sub" || productValue === "shampoo-single") {
      // シャンプーの場合：ラジオボタンを探して選択する
      const targetRadio = document.querySelector(
        'input[name="shampoo-plan"][value="' + productValue + '"]'
      );
      if (targetRadio) {
        targetRadio.checked = true;
      }
    } else {
      // エッセンス／マスクの場合：チェックボックスをONにする
      // （すでにONだったものをもう一度押しても問題ないよう、trueで固定しています）
      const targetCheckbox = document.querySelector(
        'input[name="addon"][value="' + productValue + '"]'
      );
      if (targetCheckbox) {
        targetCheckbox.checked = true;
      }
    }
    // href="#purchase" によるスクロールはブラウザ標準の動きに任せます
  });
});

/* -----------------------------------------------------------------
   12. 引用文の段階的ディレイ表示（.js-quote-reveal）
   対象：miniproof__quote（早期の社会的証明）／brandstory__quote（開発ストーリー）

   ・要素の中の .quote-line（1文ずつのspan）に .is-active クラスが付くと、
     CSS側で1文目→2文目→3文目…と時間差でふわっと表示されます。
   ・通常の .reveal（3番の仕組み）は「一度画面に入ったら、それっきり」ですが、
     こちらは画面から外れたら .is-active を外してリセットするので、
     もう一度画面に入ってきたときに、また最初から再生されます。
   ----------------------------------------------------------------- */
const quoteRevealEls = document.querySelectorAll(".js-quote-reveal");

if (quoteRevealEls.length > 0) {
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const quoteIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // 画面に入った → 1文ずつのディレイ表示アニメーションを再生
          entry.target.classList.add("is-active");
        } else {
          // 画面から外れた → リセット（次に入ったとき、また最初から再生される）
          entry.target.classList.remove("is-active");
        }
      });
    }, { threshold: 0.4 }); // 要素の40%が見えたタイミングで発火

    quoteRevealEls.forEach(function (el) { quoteIO.observe(el); });
  } else {
    // 「動きを減らす」設定の人・非対応ブラウザには、最初から表示しておく
    quoteRevealEls.forEach(function (el) { el.classList.add("is-active"); });
  }
}