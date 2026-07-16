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
    say("ボタンを押すと、参加ルートの管制デモが始まります。");
  }

  function setButtons() {
    els.btnPlay.disabled = isRunning;
    els.btnStop.disabled = !isRunning;
  }

  var timeline = [
    { t: 0, run: function () {
        say("古民家ミッション管制室に、スタッフが順番に配置につきます。");
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
        say("問い合わせ信号を受信。総合案内担当が最初に受け止めます。");
        setBubble(els.guide, "問い合わせ：出展・来場・お手伝いの相談を、ここで受信します。");
      }
    },
    { t: 5200, run: function () {
        clearBubbles();
        setProgress("choice");
        focusStaff(els.guide);
        say("参加方法のルートを確認します。総合案内担当が入口を整理します。");
        setBubble(els.guide, "参加方法：出展する、支える、読みに行く。3つのルートがあります。");
      }
    },
    { t: 9200, run: function () {
        clearBubbles();
        setState(els.guide, "walking");
        setState(els.entry, "walking");
        moveTo(els.guide, POS.safeLeft);
        moveTo(els.entry, POS.safeCenter);
        say("出展ルートに接続します。まず募集内容の確認をご案内します。");
      }
    },
    { t: 12800, run: function () {
        setState(els.guide, "");
        focusStaff(els.entry);
        setProgress("exhibit");
        setBubble(els.entry, "出展案内：開催予定と募集内容を確認し、募集開始後に応募へ進みます。");
        say("出展案内について、出展受付担当が出展ルートを説明します。");
      }
    },
    { t: 18200, run: function () {
        clearBubbles();
        setState(els.entry, "walking");
        setState(els.works, "walking");
        moveTo(els.entry, POS.entry);
        moveTo(els.works, POS.safeCenter);
        say("作品案内担当が、出展できる作品の信号を整理します。");
      }
    },
    { t: 23200, run: function () {
        focusStaff(els.works);
        setBubble(els.works, "作品案内：本・ZINE・漫画・地域文化など、出展できる作品例を確認します。");
        say("作品や展示物、当日の持ち物は、事務局からの案内を見ながら準備します。");
      }
    },
    { t: 28600, run: function () {
        clearBubbles();
        setState(els.works, "walking");
        setState(els.volunteer, "walking");
        moveTo(els.works, POS.works);
        moveTo(els.volunteer, POS.safeRight);
        setProgress("volunteer");
        say("支えるルートに接続します。役割例を見ながら考える流れをご案内します。");
      }
    },
    { t: 33200, run: function () {
        focusStaff(els.volunteer);
        setBubble(els.volunteer, "ボランティア案内：できることを、できる範囲で。役割や時間帯は決まり次第お知らせします。");
        say("ボランティア案内について、運営・ボランティア担当が支えるルートを説明します。");
      }
    },
    { t: 39600, run: function () {
        clearBubbles();
        setState(els.volunteer, "walking");
        setState(els.public, "walking");
        moveTo(els.volunteer, POS.volunteer);
        moveTo(els.public, POS.safeCenter);
        setProgress("news");
        say("開催情報のステータスを確認します。広報担当が現在地を案内します。");
      }
    },
    { t: 45600, run: function () {
        focusStaff(els.public);
        setBubble(els.public, "開催情報：2027年2月頃を予定し、田場公民館で開催企画中です。");
        say("開催情報について、広報担当が現在の状況を管制パネルに表示します。");
      }
    },
    { t: 52000, run: function () {
        clearBubbles();
        setState(els.public, "walking");
        setState(els.guide, "walking");
        moveTo(els.public, POS.public);
        moveTo(els.guide, POS.safeCenter);
        setProgress("next");
        say("次のお知らせルートへ接続します。情報を受け取りたい方はお問い合わせからご連絡ください。");
      }
    },
    { t: 55200, run: function () {
        focusStaff(els.guide);
        setBubble(els.guide, "次のお知らせ：まだ募集開始前です。正式な日程や募集内容は、決まり次第お知らせします。");
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
        say("つくる人も、読む人も、支える人も。一緒に沖縄文芸フリマをつくりませんか？");
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
    say("管制を止めました。「管制デモを見る」または「最初から管制」で再開できます。");
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
