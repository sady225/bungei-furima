(function () {
  "use strict";

  var actions = {
    shelf: {
      title: "作品を置くと、会話のきっかけが増えた！",
      text: "上手かどうかより、『私はこれが好き』を見せることから始められます。作品を見るだけの人も、その場をつくる参加者です。",
      sound: "paper",
      scores: { create: 2, connect: 1 }
    },
    message: {
      title: "感想が1枚増えると、作品の向こうに人が見えた！",
      text: "『すごい』だけでなく、『ここが好き』『もっと読みたい』も立派な贈りもの。返事を求めない感想でも、つながりは生まれます。",
      sound: "note",
      scores: { connect: 2, explore: 1 }
    },
    chair: {
      title: "イスを整えたら、休める場所ができた！",
      text: "人前に立つことだけが役割ではありません。休める場所をつくる、通路を整える。見えにくい仕事も会場を支えます。",
      sound: "chair",
      scores: { support: 2, connect: 1 }
    },
    guide: {
      title: "案内が見えると、初めての人も動きやすくなった！",
      text: "受付まで一緒に歩く、場所を教える、困っている人を担当者につなぐ。『分かるようにする』ことも大切な参加です。",
      sound: "guide",
      scores: { support: 2, explore: 1 }
    },
    bridge: {
      title: "会わなくても、作品からつながる道ができた！",
      text: "学校外で作品づくりを続けている時も、まずは『同じテーマが好きな人がいる』と知るだけでいい。双方が望めば、先生や地域スタッフを介して感想から始められます。",
      sound: "bridge",
      scores: { connect: 2, create: 1 }
    },
    nature: {
      title: "地域の『好き』を見つけると、作品のタネになった！",
      text: "いきもの、昔の写真、音、暮らしの知恵。地域で見つけたものは、写真・文章・ZINE・マップへ育てられます。",
      sound: "nature",
      scores: { explore: 2, create: 1 }
    }
  };

  var routes = {
    create: { icon: "🎨", title: "作品を出してみる", text: "本・絵・写真・ZINEなど、自分の『好き』を作品にして参加。" },
    support: { icon: "🤝", title: "場を支える", text: "受付・案内・準備・片付けなど、人が過ごしやすい場をつくる。" },
    connect: { icon: "💌", title: "作品からつながる", text: "感想や作品を間に置いて、急がずに人との接点をつくる。" },
    explore: { icon: "🧭", title: "見に行く・見つける", text: "見るだけ、短い時間だけ、地域の面白さを探すところから始める。" }
  };

  var completed = new Set();
  var categoryScores = { create: 0, support: 0, connect: 0, explore: 0 };
  var started = false;
  var milestoneShown = false;
  var maxShown = false;

  var startButton = document.getElementById("start-button");
  var soundToggle = document.getElementById("sound-toggle");
  var scoreText = document.getElementById("score-text");
  var nextText = document.getElementById("next-text");
  var progressBar = document.getElementById("progress-bar");
  var guideFace = document.getElementById("guide-face");
  var guideMessage = document.getElementById("guide-message");
  var discovery = document.getElementById("discovery");
  var discoveryTitle = document.getElementById("discovery-title");
  var discoveryText = document.getElementById("discovery-text");
  var routeResult = document.getElementById("route-result");
  var routeCopy = document.getElementById("route-copy");
  var routeCards = document.getElementById("route-cards");
  var resultBadge = document.getElementById("result-badge");
  var resetButton = document.getElementById("reset-button");
  var sparkles = document.getElementById("sparkles");
  var spots = Array.prototype.slice.call(document.querySelectorAll(".spot[data-action]"));

  var audioContext = null;
  var masterGain = null;
  var bgmTimer = null;
  var soundEnabled = false;

  function createAudioContext() {
    var AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return null;
    try {
      audioContext = new AudioContextCtor();
      masterGain = audioContext.createGain();
      masterGain.gain.value = 0.16;
      masterGain.connect(audioContext.destination);
      return audioContext;
    } catch (error) {
      audioContext = null;
      masterGain = null;
      return null;
    }
  }

  function ensureAudio() {
    if (!audioContext || audioContext.state === "closed") createAudioContext();
    if (!audioContext) return Promise.resolve(false);
    if (audioContext.state === "suspended" || audioContext.state === "interrupted") {
      return audioContext.resume().then(function () { return true; }).catch(function () {
        createAudioContext();
        if (!audioContext) return false;
        return audioContext.resume().then(function () { return true; }).catch(function () { return false; });
      });
    }
    return Promise.resolve(true);
  }

  function tone(freq, duration, type, delay, volume) {
    if (!soundEnabled || !audioContext || !masterGain) return;
    var now = audioContext.currentTime + (delay || 0);
    var osc = audioContext.createOscillator();
    var gain = audioContext.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume || 0.18, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  function playSound(name) {
    if (!soundEnabled) return;
    ensureAudio().then(function (ready) {
      if (!ready) return;
      if (name === "paper") { tone(420,.08,"triangle",0,.12); tone(560,.1,"triangle",.07,.12); }
      if (name === "note") { tone(660,.08,"sine",0,.12); tone(830,.13,"sine",.08,.1); }
      if (name === "chair") { tone(230,.07,"triangle",0,.1); tone(310,.1,"triangle",.06,.08); }
      if (name === "guide") { tone(520,.07,"square",0,.06); tone(690,.1,"square",.07,.05); }
      if (name === "bridge") { tone(440,.09,"sine",0,.11); tone(554,.09,"sine",.08,.11); tone(660,.15,"sine",.16,.1); }
      if (name === "nature") { tone(740,.06,"sine",0,.09); tone(880,.08,"sine",.07,.08); }
      if (name === "milestone") { [523,659,784,1046].forEach(function (f,i) { tone(f,.16,"sine",i*.09,.12); }); }
      if (name === "max") { [523,659,784,1046,1318].forEach(function (f,i) { tone(f,.2,"triangle",i*.09,.13); }); }
      if (name === "start") { tone(392,.07,"sine",0,.1); tone(523,.11,"sine",.08,.1); }
    });
  }

  function scheduleBgm() {
    if (bgmTimer) window.clearInterval(bgmTimer);
    if (!soundEnabled) return;
    var pattern = [261.6, 329.6, 392.0, 329.6];
    var step = 0;
    function tick() {
      if (!soundEnabled) return;
      ensureAudio().then(function (ready) {
        if (!ready) return;
        tone(pattern[step % pattern.length], .42, "sine", 0, .025);
        step += 1;
      });
    }
    tick();
    bgmTimer = window.setInterval(tick, 1800);
  }

  function setSound(enabled) {
    soundEnabled = enabled;
    soundToggle.setAttribute("aria-pressed", enabled ? "true" : "false");
    soundToggle.textContent = enabled ? "🔊 音をオフ" : "🔈 音をオン";
    if (enabled) {
      ensureAudio().then(function (ready) {
        if (ready) {
          playSound("start");
          scheduleBgm();
        } else {
          soundEnabled = false;
          soundToggle.setAttribute("aria-pressed", "false");
          soundToggle.textContent = "🔇 音声非対応";
        }
      });
    } else {
      if (bgmTimer) window.clearInterval(bgmTimer);
      bgmTimer = null;
    }
  }

  function burst(symbols) {
    var items = symbols || ["✦", "♡", "✧", "☆"];
    for (var i = 0; i < 16; i += 1) {
      var node = document.createElement("span");
      node.className = "sparkle";
      node.textContent = items[i % items.length];
      node.style.left = (6 + Math.random() * 88) + "%";
      node.style.top = (38 + Math.random() * 50) + "%";
      node.style.animationDelay = (Math.random() * .32) + "s";
      sparkles.appendChild(node);
      window.setTimeout((function (n) { return function () { n.remove(); }; })(node), 1900);
    }
  }

  function setDiscovery(info) {
    discoveryTitle.textContent = info.title;
    discoveryText.textContent = info.text;
    discovery.classList.remove("pop");
    void discovery.offsetWidth;
    discovery.classList.add("pop");
  }

  function updateHud() {
    var count = completed.size;
    scoreText.textContent = count + " / 6";
    progressBar.style.width = Math.round((count / 6) * 100) + "%";
    document.querySelectorAll(".stamp[data-stamp]").forEach(function (stamp) {
      stamp.classList.toggle("is-done", completed.has(stamp.dataset.stamp));
    });

    if (count < 3) {
      nextText.textContent = "✨ あと" + (3 - count) + "つで地図完成";
    } else if (count < 6) {
      nextText.textContent = "👑 あと" + (6 - count) + "つでMAX";
    } else {
      nextText.textContent = "👑 まちの編集者 MAX";
    }
  }

  function addScores(scoreMap) {
    Object.keys(scoreMap).forEach(function (key) {
      categoryScores[key] += scoreMap[key];
    });
  }

  function rankedRoutes() {
    return Object.keys(categoryScores).sort(function (a, b) {
      return categoryScores[b] - categoryScores[a];
    });
  }

  function renderRoutes(isMax) {
    var ranked = rankedRoutes();
    routeCards.replaceChildren();
    ranked.forEach(function (key) {
      if (!isMax && categoryScores[key] === 0) return;
      var route = routes[key];
      var card = document.createElement("div");
      card.className = "route-card";
      var strong = document.createElement("strong");
      strong.textContent = route.icon + " " + route.title;
      var span = document.createElement("span");
      span.textContent = route.text;
      card.appendChild(strong);
      card.appendChild(span);
      routeCards.appendChild(card);
    });

    if (isMax) {
      resultBadge.textContent = "👑 まちの編集者 MAX";
      routeCopy.textContent = "6つ全部見つけた！ 文芸フリマには、つくる・支える・見る・つながるが全部あります。どれか1つだけでも、立派な参加です。";
    } else {
      resultBadge.textContent = "✨ 文芸フリマ地図 完成";
      routeCopy.textContent = "3つ見つけた！ 今のあなたが気になった参加のしかたを並べました。これは診断ではないので、当日は別の参加を選んでも大丈夫です。";
    }
    routeResult.hidden = false;
  }

  function handleSpot(spot) {
    var key = spot.dataset.action;
    var info = actions[key];
    if (!info) return;
    if (!started) startGame(false);

    if (completed.has(key)) {
      guideFace.textContent = "•ᴗ•";
      guideMessage.textContent = "そこはもう見つけたよ。ほかの場所も自由にのぞいてみよう。";
      playSound("note");
      return;
    }

    completed.add(key);
    addScores(info.scores);
    spot.classList.add("is-done");
    spot.setAttribute("aria-label", spot.querySelector("strong").textContent + "：完了");
    setDiscovery(info);
    guideFace.textContent = "•ᴗ•";
    guideFace.classList.add("is-happy");
    window.setTimeout(function () { guideFace.classList.remove("is-happy"); }, 500);
    guideMessage.textContent = "いい発見！ ほかの場所も、順番は自由だよ。";
    playSound(info.sound);
    updateHud();

    if (completed.size === 3 && !milestoneShown) {
      milestoneShown = true;
      window.setTimeout(function () {
        burst(["✦","♡","✧","☆"]);
        playSound("milestone");
        guideFace.textContent = "ᵔᴗᵔ";
        guideMessage.textContent = "文芸フリマ地図ができた！ まだ探検を続けると、👑MAXまで行けるよ。";
        renderRoutes(false);
        routeResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 350);
    }

    if (completed.size === 6 && !maxShown) {
      maxShown = true;
      window.setTimeout(function () {
        burst(["👑","✦","♡","☆"]);
        playSound("max");
        guideFace.textContent = "ᵔᴗᵔ";
        guideMessage.textContent = "全部見つけた！ つくる人も、支える人も、見る人も、みんなで会場ができているね。";
        renderRoutes(true);
        routeResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 350);
    } else if (completed.size > 3 && milestoneShown) {
      renderRoutes(false);
    }
  }

  function startGame(scroll) {
    started = true;
    guideFace.textContent = "•ﻌ•";
    guideMessage.textContent = "気になる場所をタップして、会場がどう変わるか見てみよう。";
    playSound("start");
    if (scroll !== false) document.getElementById("game").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetGame() {
    completed.clear();
    categoryScores = { create: 0, support: 0, connect: 0, explore: 0 };
    milestoneShown = false;
    maxShown = false;
    spots.forEach(function (spot) {
      spot.classList.remove("is-done");
      spot.removeAttribute("aria-label");
    });
    routeResult.hidden = true;
    discoveryTitle.textContent = "タップすると、ここに発見が出ます";
    discoveryText.textContent = "正解を当てるゲームではありません。会場がどう変わるかを見てみよう。";
    guideFace.textContent = "•ﻌ•";
    guideMessage.textContent = "また気になる場所から、自由に探検してみよう。";
    updateHud();
    document.getElementById("game").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  spots.forEach(function (spot) {
    spot.addEventListener("click", function () { handleSpot(spot); });
  });
  startButton.addEventListener("click", function () {
    if (!soundEnabled) {
      ensureAudio();
    }
    startGame(true);
  });
  soundToggle.addEventListener("click", function () { setSound(!soundEnabled); });
  resetButton.addEventListener("click", resetGame);

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && soundEnabled) {
      ensureAudio().then(function (ready) { if (ready) scheduleBgm(); });
    } else if (bgmTimer) {
      window.clearInterval(bgmTimer);
      bgmTimer = null;
    }
  });
  window.addEventListener("pageshow", function () {
    if (soundEnabled) ensureAudio().then(function (ready) { if (ready) scheduleBgm(); });
  });

  updateHud();
})();