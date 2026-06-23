/* =================================================================
   素 -SU- ランディングページ ｜ script.js
   このファイルは「動き」を担当します。
   'defer' で読み込んでいるので、HTMLを読み終えてから実行されます。
   ================================================================= */

/* -----------------------------------------------------------------
   1. 「動きを減らす」設定の人への配慮
   OSで視差効果オフにしている人には、背景動画を止めてポスター画像を表示。
   （画面の動きが苦手な人への、やさしい配慮です）
----------------------------------------------------------------- */
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const heroVideo = document.querySelector(".hero__video");

if (heroVideo && prefersReducedMotion) {
  heroVideo.removeAttribute("autoplay");
  heroVideo.pause();
  // poster属性の画像が表示されたままになります
}


/* -----------------------------------------------------------------
   2. ヘッダーの演出
   少しスクロールしたら、ヘッダーにうっすら背景をつけて文字を読みやすく。
   （style.css の .site-header.is-scrolled が見た目を担当）
----------------------------------------------------------------- */
const header = document.querySelector(".site-header");

function onScroll() {
  // 40pxより下にスクロールしたら is-scrolled クラスを付ける／外す
  if (window.scrollY > 40) {
    header.classList.add("is-scrolled");
  } else {
    header.classList.remove("is-scrolled");
  }
}

// スクロールのたびに onScroll を実行（passive: true ＝スクロールを軽く保つ設定）
window.addEventListener("scroll", onScroll, { passive: true });
onScroll(); // 読み込み時にも一度実行（リロード時の位置に対応）


/* -----------------------------------------------------------------
   3. スクロールで要素をふわっと表示（.reveal → .is-visible）
   IntersectionObserver ＝「要素が画面に入ったか」を監視する仕組み。
   画面に入った瞬間に is-visible クラスを付けて、CSSで表示します。
   今後どのセクションでも、class="reveal" を付けるだけで使えます。
----------------------------------------------------------------- */
const revealEls = document.querySelectorAll(".reveal");

if (!prefersReducedMotion && "IntersectionObserver" in window) {
  // 監視役を1つ作る。要素が画面内に入るたびに、中の処理が呼ばれます
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {                  // 画面に入った？
        entry.target.classList.add("is-visible");  // → 表示クラスを付ける
        io.unobserve(entry.target);                // 一度出したら監視解除（軽量化）
      }
    });
  }, { threshold: 0.15 });                          // 要素が15%見えたら発火

  // すべての .reveal 要素を監視対象に登録
  revealEls.forEach(function (el) { io.observe(el); });
} else {
  // 「動きを減らす」設定の人や、未対応の古いブラウザでは最初から表示
  revealEls.forEach(function (el) { el.classList.add("is-visible"); });
}


/* -----------------------------------------------------------------
   4. 申込みフォーム（B-10）
   送信先（カート／申込みAPI）がまだ無いため、ここで送信を“受け止めて”
   確認メッセージを表示します。ページ遷移やリロードは起こしません。
   ▼ 本番にするには、下の「★本番ではここ」のコメント部分を、
     fetch() でのAPI送信や <form action="..."> に置き換えてください。
----------------------------------------------------------------- */
const orderForm = document.querySelector("#orderForm");
const orderResult = document.querySelector("#orderResult");

if (orderForm) {
  orderForm.addEventListener("submit", function (e) {
    e.preventDefault(); // ← 送信先が無いので、既定の送信（リロード）を止める

    // 入力値を取得（form.name はフォーム自身を指してしまうので id で取得）
    const name  = orderForm.querySelector("#of-name").value.trim();
    const email = orderForm.querySelector("#of-email").value.trim();
    const plan  = orderForm.querySelector('input[name="plan"]:checked').value;

    // かんたんな入力チェック（空欄・メール形式）
    if (!name || !email) {
      orderResult.textContent = "お名前とメールアドレスをご入力ください。";
      orderResult.className = "order-form__result is-error";
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // @と.を含む簡易チェック
    if (!emailOk) {
      orderResult.textContent = "メールアドレスの形式をご確認ください。";
      orderResult.className = "order-form__result is-error";
      return;
    }

    // ★本番ではここを「fetch()でAPIに送信」などに置き換えます。
    //   例）await fetch("/api/order", { method:"POST", body: JSON.stringify({name,email,plan}) });
    const planLabel = plan === "subscription" ? "定期便 初回¥1,900" : "単品 ¥3,800";
    orderResult.textContent =
      name + "様、「" + planLabel + "」のお申し込みを受け付けました（デモ）。";
    orderResult.className = "order-form__result is-success";
    orderForm.reset(); // 入力欄を初期化（プランは初期値=定期便に戻ります）
  });
}


/* -----------------------------------------------------------------
   5. SP専用：画面下固定CTAバーの表示制御
   ・FV（ヒーローセクション）を抜けたら .is-visible を付けて下からスライドイン
   ・購入フォームセクション（#purchase）が画面に入ったら引っ込める
     （フォームが見えているのにCTAを出し続けると邪魔になるため）
----------------------------------------------------------------- */
const spStickyCta = document.getElementById("stickyCta");
const heroBanner  = document.querySelector(".hero"); // ヒーローセクション

function updateSpStickyCta() {
  // SPサイズ（769px未満）以外では何もしない
  if (window.innerWidth >= 769) return;

  // ヒーローセクションの底辺がどこにあるか調べる
  let heroBottom = 0;
  if (heroBanner) {
    heroBottom = heroBanner.getBoundingClientRect().bottom;
    // getBoundingClientRect().bottom ＝ ヒーロー下端とビューポート上端の距離
    // マイナスになったら「ヒーローが画面の上に出た」＝スクロール済み
  }

  // 購入フォームが画面に入っているか確認
  const purchaseSec = document.getElementById("purchase");
  let purchaseInView = false;
  if (purchaseSec) {
    purchaseInView = purchaseSec.getBoundingClientRect().top < window.innerHeight * 0.85;
  }

  // ヒーローを抜けた かつ 購入フォームがまだ見えていない → 表示
  if (heroBottom < 0 && !purchaseInView) {
    spStickyCta.classList.add("is-visible");
  } else {
    spStickyCta.classList.remove("is-visible");
  }
}

// stickyCta が存在するページだけ動かす
if (spStickyCta) {
  window.addEventListener("scroll", updateSpStickyCta, { passive: true });
  window.addEventListener("resize", updateSpStickyCta, { passive: true });
  updateSpStickyCta(); // 初回実行
}


/* -----------------------------------------------------------------
   6. PC専用：右下固定CTAバーの表示制御
   ・スクロールが300pxを超えたら .is-visible を付けて出す
   ・購入フォームセクション（#purchase）の手前で引っ込める
     （「申し込む」ボタンが画面内に見えているのに固定CTAを出し続けると邪魔なため）
----------------------------------------------------------------- */
const pcStickyCta = document.getElementById("pcStickyCta");
const purchaseSection = document.getElementById("purchase"); // 購入フォームセクション

function updatePcStickyCta() {
  // PCサイズ（769px以上）以外では何もしない
  if (window.innerWidth < 769) return;

  const scrollY = window.scrollY;

  // 購入フォームが画面に入っているかチェック
  let purchaseInView = false;
  if (purchaseSection) {
    const rect = purchaseSection.getBoundingClientRect();
    // フォームセクションが画面の下半分に入ってきたら「見えている」と判定
    purchaseInView = rect.top < window.innerHeight * 0.8;
  }

  // 300px以上スクロール済み かつ 購入フォームが画面外 → 表示
  if (scrollY > 300 && !purchaseInView) {
    pcStickyCta.classList.add("is-visible");
    pcStickyCta.removeAttribute("aria-hidden"); // スクリーンリーダーにも読ませる
  } else {
    pcStickyCta.classList.remove("is-visible");
    pcStickyCta.setAttribute("aria-hidden", "true"); // 非表示時は読み上げ対象外
  }
}

// pcStickyCta が存在するページだけ動かす（null チェック）
if (pcStickyCta) {
  window.addEventListener("scroll", updatePcStickyCta, { passive: true });
  window.addEventListener("resize", updatePcStickyCta, { passive: true });
  updatePcStickyCta(); // 初回実行
}
