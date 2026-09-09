/* =========================================================
   沖縄文芸フリマ オンライン事務局
   Vanilla JS only. No storage, no network, no generated text.
   ========================================================= */
(function () {
  "use strict";

  var els = {
    guide: document.getElementById("staff-guide"),
    entry: document.getElementById("staff-entry"),
    works: document.getElementById("staff-works"),
    public: document.getElementById("staff-public"),
    volunteer: document.getElementById("staff-volunteer"),
    now: document.getElementById("now-playing"),
    progress: document.getElementById("progress"),
    btnPlay: document.getElementById("btn-play"),
    btnRestart: document.getElementById("btn-restart"),
    btnStop: document.getElementById("btn-stop")
  };

  if (!els.guide || !els.now || !els.progress) { return; }

  var POS = {
    entranceGuide: { x: 9, y: 88 },
    entranceEntry: { x: 13, y: 88 },
    entranceWorks: { x: 17, y: 88 },
    entrancePublic: { x: 21, y: 88 },
    entranceVolunteer: { x: 25, y: 88 },
    guide: { x: 50, y: 58 },
    guideLeft: { x: 43, y: 58 },
    guideRight: { x: 57, y: 58 },
    entry: { x: 18, y: 76 },
    works: { x: 31, y: 48 },
    public: { x: 68, y: 47 },
    volunteer: { x: 84, y: 30 },
    display: { x: 74, y: 77 },
    safeCenter: { x: 50, y: 70 },
    safeRight: { x: 65, y: 62 },
    safeLeft: { x: 35, y: 66 },
    finaleGuide: { x: 44, y: 63 },
    finaleEntry: { x: 36, y: 68 },
    finaleWorks: { x: 52, y: 66 },
    finalePublic: { x: 60, y: 63 },
    finaleVolunteer: { x: 68, y: 68 }
  };

  var timers = [];
  var isRunning = false;

  function schedule(delayMs, fn) {
    var id = window.setTimeout(fn, delayMs);
    timers.push(id);
    return id;
  }

  function clearAllTimers() {
    timers.forEach(function (id) {
      window.clearTimeout(id);
    });
    timers = [];
  }

  function staffList() {
    return [els.guide, els.entry, els.works, els.public, els.volunteer];
  }

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
    if (!bubble) { return; }
    if (!text) {
      el.classList.remove("show-bubble");
      bubble.textContent = "";
      return;
    }
    bubble.textContent = text;
    el.classList.add("show-bubble");
  }

  function clearBubbles() {
    staffList().forEach(function (el) {
      setBubble(el, "");
    });
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

  function focusStaff(activeEl) {
    staffList().forEach(function (el) {
      setState(el, el === activeEl ? "working" : "");
      if (el !== activeEl) { setBubble(el, ""); }
    });
  }

  function resetProgress() {
    els.progress.querySelectorAll("li").forEach(function (li) {
      li.classList.remove("active", "done");
    });
  }

  function clearMotion() {
    staffList().forEach(function (el) {
      setState(el, "");
    });
  }

  function resetVisuals() {
    moveTo(els.guide, POS.entranceGuide);
    moveTo(els.entry, POS.entranceEntry);
    moveTo(els.works, POS.entranceWorks);
    moveTo(els.public, POS.entrancePublic);
    moveTo(els.volunteer, POS.entranceVolunteer);
    clearMotion();
    clearBubbles();
    resetProgress();
    say("ボタンを押すと、参加ルートの案内デモが始まります。");
  }

  function setButtons() {
    els.btnPlay.disabled = isRunning;
    els.btnStop.disabled = !isRunning;
  }

  var timeline = [
    { t: 0, run: function () {
        say("古民家の案内所に、スタッフが順番に配置につきます。");
        staffList().forEach(function (el) { setState(el, "walking"); });
        moveTo(els.guide, POS.guide);
        moveTo(els.entry, POS.entry);
        moveTo(els.works, POS.works);
        moveTo(els.public, POS.public);
        moveTo(els.volunteer, POS.volunteer);
      }
    },
    { t: 1800, run: function () {
        clearMotion();
        setProgress("contact");
        focusStaff(els.guide);
        say("お問い合わせを受け付けました。総合案内担当が最初に対応します。");
        setBubble(els.guide, "問い合わせ：作品、子ども実行委員、場を支える参加、来場についてご案内します。");
      }
    },
    { t: 5200, run: function () {
        clearBubbles();
        setProgress("choice");
        focusStaff(els.guide);
        say("参加方法のルートを確認します。総合案内担当が入口を整理します。");
        setBubble(els.guide, "参加方法：作品、子ども実行委員、場を支える、遊びに行く。4つのルートがあります。");
      }
    },
    { t: 9200, run: function () {
        clearBubbles();
        setState(els.guide, "walking");
        setState(els.entry, "walking");
        moveTo(els.guide, POS.safeLeft);
        moveTo(els.entry, POS.safeCenter);
        say("出展ルートに進みます。まず募集内容の確認をご案内します。");
      }
    },
    { t: 12800, run: function () {
        setState(els.guide, "");
        focusStaff(els.entry);
        setProgress("exhibit");
        setBubble(els.entry, "作品の参加：本・ZINE・漫画・写真など、好きな表現から始められます。");
        say("ルート1です。出展受付担当が、作品を出す参加方法をご案内します。");
      }
    },
    { t: 18200, run: function () {
        clearBubbles();
        setState(els.entry, "walking");
        setState(els.works, "walking");
        moveTo(els.entry, POS.entry);
        moveTo(els.works, POS.safeCenter);
        say("ルート2に進みます。子ども実行委員の案内担当が前へ出ます。");
      }
    },
    { t: 23200, run: function () {
        focusStaff(els.works);
        setProgress("children");
        setBubble(els.works, "子ども実行委員：子どもが考え、選び、やってみる。大人が安全と大切な判断を支えます。");
        say("全部やらなくて大丈夫。できることを、できる範囲で参加できます。");
      }
    },
    { t: 28600, run: function () {
        clearBubbles();
        setState(els.works, "walking");
        setState(els.volunteer, "walking");
        moveTo(els.works, POS.works);
        moveTo(els.volunteer, POS.safeRight);
        setProgress("volunteer");
        say("ルート3に進みます。人が気持ちよく過ごせる場を一緒につくる参加です。");
      }
    },
    { t: 33200, run: function () {
        focusStaff(els.volunteer);
        setBubble(els.volunteer, "場を支える参加：受付、案内、清掃、片付け、場を整えることも大切な役割です。");
        say("人前に立つことだけが役割ではありません。気づくこと、整えること、誰かにつなぐことも参加です。");
      }
    },
    { t: 39600, run: function () {
        clearBubbles();
        setState(els.volunteer, "walking");
        setState(els.public, "walking");
        moveTo(els.volunteer, POS.volunteer);
        moveTo(els.public, POS.safeCenter);
        setProgress("news");
        say("ルート4に進みます。広報担当が、遊びに行く・読みに行く楽しみ方をご案内します。");
      }
    },
    { t: 45600, run: function () {
        focusStaff(els.public);
        setBubble(els.public, "来場：作品、作者との会話、ワークショップ、猫をテーマにした展示などを検討しています。");
        say("正式な日時と来場条件は、決まり次第お知らせします。");
      }
    },
    { t: 52000, run: function () {
        clearBubbles();
        setState(els.public, "walking");
        setState(els.guide, "walking");
        moveTo(els.public, POS.public);
        moveTo(els.guide, POS.safeCenter);
        setProgress("next");
        say("次のお知らせルートに進みます。情報を受け取りたい方はお問い合わせからご連絡ください。");
      }
    },
    { t: 55200, run: function () {
        focusStaff(els.guide);
        setBubble(els.guide, "次のお知らせ：候補日は2027年2月6日または13日、会場は田場公民館の予定です。正式決定後にお知らせします。");
        say("次のお知らせについて、総合案内担当が確認方法を案内します。");
      }
    },
    { t: 59200, run: function () {
        clearBubbles();
        clearMotion();
        moveTo(els.guide, POS.finaleGuide);
        moveTo(els.entry, POS.finaleEntry);
        moveTo(els.works, POS.finaleWorks);
        moveTo(els.public, POS.finalePublic);
        moveTo(els.volunteer, POS.finaleVolunteer);
        say("好きなことから、自分に合う参加方法を選べます。一緒に沖縄文芸フリマ vol.3をつくりませんか。");
      }
    },
    { t: 63800, run: function () {
        staffList().forEach(function (el) {
          setState(el, "waving");
        });
      }
    },
    { t: 70000, run: function () {
        finishDemo();
      }
    }
  ];

  function finishDemo() {
    clearAllTimers();
    clearMotion();
    isRunning = false;
    setButtons();
  }

  function playDemo() {
    if (isRunning) { return; }
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
    clearMotion();
    isRunning = false;
    setButtons();
    say("デモを止めました。「案内デモを見る」または「最初から見る」で再開できます。");
  }

  function restartDemo() {
    clearAllTimers();
    isRunning = false;
    setButtons();
    resetVisuals();
    playDemo();
  }

  els.btnPlay.addEventListener("click", playDemo);
  els.btnRestart.addEventListener("click", restartDemo);
  els.btnStop.addEventListener("click", stopDemo);

  resetVisuals();
  setButtons();
})();
