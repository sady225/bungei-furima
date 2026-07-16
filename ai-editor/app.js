/* =========================================================
   沖縄文芸フリマ AI創作編集室 — app.js
   Vanilla JS のみ。外部ライブラリ・通信・保存機能なし。
   ========================================================= */
(function () {
  "use strict";

  // ---- 要素取得 -------------------------------------------------
  var els = {
    cho:    document.getElementById("char-cho"),
    kotoba: document.getElementById("char-kotoba"),
    e:      document.getElementById("char-e"),
    shima:  document.getElementById("char-shima"),
    kouhou: document.getElementById("char-kouhou"),
    now:    document.getElementById("now-playing"),
    progress: document.getElementById("progress"),
    btnPlay: document.getElementById("btn-play"),
    btnRestart: document.getElementById("btn-restart"),
    btnStop: document.getElementById("btn-stop")
  };

  if (!els.cho || !els.now) { return; } // 要素が無ければ何もしない

  // ---- 座標（stage.spot と対応） --------------------------------
  var POS = {
    entranceCho:    { x: 4,  y: 70 },
    entranceKotoba: { x: 4,  y: 78 },
    entranceE:      { x: 4,  y: 86 },
    entranceShima:  { x: 8,  y: 92 },
    entranceKouhou: { x: 12, y: 92 },
    deskCho:    { x: 16, y: 20 },
    deskKotoba: { x: 40, y: 14 },
    deskE:      { x: 64, y: 14 },
    deskShima:  { x: 84, y: 20 },
    deskKouhou: { x: 84, y: 60 },
    meeting:    { x: 48, y: 52 },
    meetingL:   { x: 42, y: 52 },
    meetingR:   { x: 54, y: 52 },
    meetingCenterL: { x: 46, y: 46 },
    meetingCenterR: { x: 50, y: 46 },
    coverTalk:  { x: 60, y: 40 }
  };

  var PROGRESS_STEPS = ["soudan", "kikaku", "henshu", "hyoshi", "kouhou", "junbi"];

  // ---- タイマー管理 -----------------------------------------------
  var timers = [];
  var isRunning = false;

  function schedule(delayMs, fn) {
    var id = window.setTimeout(fn, delayMs);
    timers.push(id);
    return id;
  }

  function clearAllTimers() {
    for (var i = 0; i < timers.length; i++) {
      window.clearTimeout(timers[i]);
    }
    timers = [];
  }

  // ---- 見た目の操作ヘルパー ----------------------------------------
  function moveTo(el, pos) {
    el.style.setProperty("--x", pos.x);
    el.style.setProperty("--y", pos.y);
  }

  function setState(el, state) {
    el.classList.remove("working", "walking", "waving");
    if (state) { el.classList.add(state); }
  }

  function setBubble(el, text) {
    var bubble = el.querySelector(".bubble");
    if (!text) {
      el.classList.remove("show-bubble");
      bubble.textContent = "";
      return;
    }
    bubble.textContent = text; // 固定文言のみ。利用者入力は使用しない
    el.classList.add("show-bubble");
  }

  function say(text) {
    els.now.textContent = text;
  }

  function setProgress(stepKey) {
    var items = els.progress.querySelectorAll("li");
    var reached = false;
    items.forEach(function (li) {
      var key = li.getAttribute("data-step");
      li.classList.remove("active", "done");
      if (key === stepKey) {
        li.classList.add("active");
        reached = true;
      } else if (!reached) {
        li.classList.add("done");
      }
    });
  }

  function resetVisuals() {
    var pairs = [
      [els.cho, POS.entranceCho],
      [els.kotoba, POS.entranceKotoba],
      [els.e, POS.entranceE],
      [els.shima, POS.entranceShima],
      [els.kouhou, POS.entranceKouhou]
    ];
    pairs.forEach(function (p) {
      moveTo(p[0], p[1]);
      setState(p[0], "");
      setBubble(p[0], null);
    });
    els.progress.querySelectorAll("li").forEach(function (li) {
      li.classList.remove("active", "done");
    });
    say("ボタンを押すと、編集室が動き出します。");
  }

  function clearCharacterMotion() {
    [els.cho, els.kotoba, els.e, els.shima, els.kouhou].forEach(function (el) {
      setState(el, "");
    });
  }

  // ---- タイムライン（時間はデモ開始からの相対ミリ秒） --------------
  var timeline = [
    { t: 0, run: function () {
        say("編集員たちが出勤してきました。");
        setState(els.cho, "walking");
        setState(els.kotoba, "walking");
        setState(els.e, "walking");
        setState(els.shima, "walking");
        setState(els.kouhou, "walking");
        moveTo(els.cho, POS.deskCho);
        moveTo(els.kotoba, POS.deskKotoba);
        moveTo(els.e, POS.deskE);
        moveTo(els.shima, POS.deskShima);
        moveTo(els.kouhou, POS.deskKouhou);
    }},
    { t: 1400, run: function () {
        setState(els.cho, ""); setState(els.kotoba, "");
        setState(els.e, ""); setState(els.shima, ""); setState(els.kouhou, "");
        say("編集長シーサーのもとに、作品相談が届きました。");
        setBubble(els.cho, "相談が届いた！");
    }},
    { t: 3200, run: function () {
        say("「沖縄の思い出を、小さな本にしたい」というご相談です。");
    }},
    { t: 5200, run: function () {
        setBubble(els.cho, null);
        setProgress("soudan");
        say("編集長シーサーが、島の記録係とことば編集員に声をかけます。");
        setState(els.cho, "walking");
        moveTo(els.cho, POS.meeting);
    }},
    { t: 6600, run: function () {
        setState(els.cho, "");
        setState(els.shima, "walking");
        setState(els.kotoba, "walking");
        moveTo(els.shima, POS.meetingR);
        moveTo(els.kotoba, POS.meetingL);
    }},
    { t: 8000, run: function () {
        setState(els.shima, ""); setState(els.kotoba, "");
        setProgress("kikaku");
        say("3人で、どんな本にするか話し合っています。");
    }},
    { t: 10500, run: function () {
        say("島の記録係が、席に戻って聞き書きを整理し始めました。");
        setState(els.shima, "walking");
        moveTo(els.shima, POS.deskShima);
        setState(els.cho, "walking");
        moveTo(els.cho, POS.deskCho);
    }},
    { t: 11900, run: function () {
        setState(els.shima, "working");
        setState(els.cho, "");
        setProgress("henshu");
    }},
    { t: 15000, run: function () {
        say("ことば編集員が、集まった言葉を確認しています。");
        setState(els.kotoba, "walking");
        moveTo(els.kotoba, POS.deskKotoba);
    }},
    { t: 16400, run: function () {
        setState(els.kotoba, "working");
    }},
    { t: 20000, run: function () {
        setState(els.shima, "");
        setState(els.kotoba, "");
        setBubble(els.kotoba, "タイトルが決まりません…？");
        say("ことば編集員が「タイトルが決まりません」と困っています。");
    }},
    { t: 23000, run: function () {
        setBubble(els.kotoba, null);
        say("お絵かき編集員も加わって、表紙とタイトルを相談します。");
        setState(els.kotoba, "walking");
        setState(els.e, "walking");
        setState(els.shima, "walking");
        moveTo(els.kotoba, POS.meetingL);
        moveTo(els.e, POS.meeting);
        moveTo(els.shima, POS.meetingR);
    }},
    { t: 24400, run: function () {
        setState(els.kotoba, ""); setState(els.e, ""); setState(els.shima, "");
        setProgress("hyoshi");
    }},
    { t: 27500, run: function () {
        say("表紙の絵と一緒に、言葉を選んでいきます。");
        setState(els.e, "working");
    }},
    { t: 31000, run: function () {
        setBubble(els.e, "できました！");
        say("仮タイトル「島の記憶をつなぐ」に決まりました。");
    }},
    { t: 34000, run: function () {
        setBubble(els.e, null);
        setState(els.e, "");
        setState(els.kotoba, "walking");
        setState(els.shima, "walking");
        setState(els.e, "walking");
        moveTo(els.kotoba, POS.deskKotoba);
        moveTo(els.shima, POS.deskShima);
        moveTo(els.e, POS.deskE);
    }},
    { t: 35400, run: function () {
        setState(els.kotoba, ""); setState(els.shima, ""); setState(els.e, "");
        setProgress("kouhou");
        say("作品企画がまとまりました。");
    }},
    { t: 37800, run: function () {
        say("次回の文芸フリマへの出展準備を始めます。");
        setState(els.cho, "walking");
        moveTo(els.cho, POS.meeting);
    }},
    { t: 39200, run: function () {
        setState(els.cho, "");
        setState(els.kouhou, "walking");
        moveTo(els.kouhou, POS.meeting);
    }},
    { t: 40600, run: function () {
        setState(els.kouhou, "working");
        say("広報係が、出展案内とボランティア案内を準備しています。");
    }},
    { t: 44500, run: function () {
        setBubble(els.kouhou, "案内できました！");
    }},
    { t: 47000, run: function () {
        setBubble(els.kouhou, null);
        setState(els.kouhou, "walking");
        moveTo(els.kouhou, POS.deskKouhou);
    }},
    { t: 48400, run: function () {
        setState(els.kouhou, "");
        setProgress("junbi");
        say("つくる人も、読む人も、支える人も。一緒に文芸フリマをつくりませんか？");
    }},
    { t: 50000, run: function () {
        [els.cho, els.kotoba, els.e, els.shima, els.kouhou].forEach(function (el) {
          setState(el, "waving");
        });
        moveTo(els.cho, POS.meetingCenterL);
        moveTo(els.kotoba, POS.meeting);
        moveTo(els.e, POS.meetingCenterR);
        moveTo(els.shima, POS.meetingL);
        moveTo(els.kouhou, POS.meetingR);
    }},
    { t: 54500, run: function () {
        finishDemo();
    }}
  ];

  function finishDemo() {
    clearAllTimers();
    clearCharacterMotion();
    isRunning = false;
    setButtons();
  }

  function setButtons() {
    els.btnPlay.disabled = isRunning;
    els.btnStop.disabled = !isRunning;
  }

  // ---- 実行制御 ----------------------------------------------------
  function playDemo() {
    if (isRunning) { return; } // 連打対策：多重起動を防ぐ
    clearAllTimers();
    resetVisuals();
    isRunning = true;
    setButtons();
    timeline.forEach(function (step) {
      schedule(step.t, step.run);
    });
  }

  function stopDemo() {
    clearAllTimers();
    clearCharacterMotion();
    isRunning = false;
    setButtons();
    say("動きを止めました。「作品づくりの流れを見てみる」または「最初から見る」で再開できます。");
  }

  function restartDemo() {
    clearAllTimers();
    isRunning = false;
    setButtons();
    resetVisuals();
    playDemo();
  }

  // ---- イベント登録 --------------------------------------------------
  els.btnPlay.addEventListener("click", playDemo);
  els.btnRestart.addEventListener("click", restartDemo);
  els.btnStop.addEventListener("click", stopDemo);

  // 初期表示
  resetVisuals();
  setButtons();
})();
