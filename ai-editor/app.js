/*
 * 沖縄文芸フリマ案内所 Phase 1-2
 * 固定データだけを安全なDOM APIで表示する。通信・AI・ストレージは使わない。
 */
(function () {
  "use strict";

  var guides = {
    child: {
      staff: "works",
      staffName: "子ども・作品担当 えんぴつ",
      icon: "🎨",
      title: "好きなもの、何かある？",
      summary: "絵、本、ゲーム、物語、写真、ものづくり。好きなものを入口に、自分で選べる参加があります。",
      bubble: "見るだけでも大丈夫。作品の参加方法は確認中だよ。",
      points: [
        "見るだけ、途中で帰ることもできます。作品のみの参加方法は現在確認中です。",
        "子ども実行委員など、企画から関わる参加方法も準備しています。全部をやる必要はありません。",
        "どうして学校へ行きづらいのか、診断名などは聞きません。",
        "次の段階へ進まなくても、その日の参加を大切にします。"
      ],
      actions: [
        { label: "いろいろな参加のしかたを見る", href: "#participation-levels" },
        { label: "作品棚を見る", href: "#works-shelf" }
      ]
    },
    parent: {
      staff: "care",
      staffName: "学校・保護者担当 なぎ",
      icon: "🌿",
      title: "学校復帰や継続参加を、目的にはしていません",
      summary: "本人が選べる小さな社会参加と、家庭や学校以外で安心して顔を合わせられる大人との接点をつくります。",
      bubble: "無理に勧めず、本人のペースを守ります。",
      points: [
        "参加しない、見学だけ、短時間だけという選択も尊重します。",
        "家庭事情や学校内の記録を、案内のために収集しません。",
        "個別相談が必要な場合は、AIではなく人間の担当者へつなぎます。"
      ],
      actions: [
        { label: "いろいろな参加のしかたを見る", href: "#participation-levels" },
        { label: "お問い合わせ", href: "#contact" }
      ]
    },
    school: {
      staff: "care",
      staffName: "学校・保護者担当 なぎ",
      icon: "🏫",
      title: "募集ではなく、本人が選べる選択肢としてご紹介ください",
      summary: "先生・SSW・教育相談室の方が同行する見学も想定し、学校外の社会との接点を丁寧につくります。",
      bubble: "参加人数だけでなく、関係の変化を見ます。",
      points: [
        "学校復帰を成果指標にはしません。",
        "見学のみ、短時間など複数の入口を示します。作品のみの参加方法は現在、条件を確認中です。",
        "正式な学校連携や安全調整は、人間の担当者が対応します。"
      ],
      actions: [
        { label: "作品参加の案内を見る", href: "#works-shelf" },
        { label: "人間の担当者へ相談", href: "#contact" }
      ]
    },
    highschool: {
      staff: "youth",
      staffName: "若者・伴走担当 そら",
      icon: "📷",
      title: "高校生は、少し年上の伴走者です",
      summary: "支援する側とされる側に分けず、写真、展示、案内、デザインなど、自分の得意な部分だけで関われます。",
      bubble: "得意な一つだけでも、立派な役割です。",
      points: [
        "写真・動画、受付補助、感想、インタビュー、SNSなどから選べます。",
        "人前に立たない準備や片付けも大切な参加です。",
        "金銭・契約・個人情報・安全管理の最終責任は大人が持ちます。"
      ],
      actions: [
        { label: "小さな役割を見る", href: "#participation-levels" },
        { label: "会場の『ありがとう』構想", href: "#kindness-board" }
      ]
    },
    welfare: {
      staff: "community",
      staffName: "地域連携担当 ゆい",
      icon: "🤝",
      title: "支援関係になる前の、地域の顔見知りを増やします",
      summary: "福祉教育、ボランティア、多世代交流などを通して、年齢や立場にかかわらず地域で役割を持てる接点を一緒に考えます。",
      bubble: "支えるだけでなく、役割を持てる場へ。",
      points: [
        "防災や助成情報も、参加を支える仕組みとして扱います。",
        "本人を診断・評価せず、できることや関心から役割を探します。",
        "個別ケースの相談は公開画面に入力せず、人間同士で扱います。"
      ],
      actions: [
        { label: "地域の情報ゾーンを見る", href: "#taba-archive" },
        { label: "連携について相談", href: "#contact" }
      ]
    },
    government: {
      staff: "community",
      staffName: "地域連携担当 ゆい",
      icon: "🧭",
      title: "学校外の小さな社会参加を、既存施策へつなぎます",
      summary: "作品や好き・得意を媒介にした場として、情報提供から始め、関係部署や施策との接続を段階的に相談します。",
      bubble: "最初から共催を求めず、接続から始めます。",
      points: [
        "情報提供、関係部署への橋渡し、既存施策、助成、成果共有の順で相談します。",
        "成果は参加人数だけでなく、学校外の接点や再会も見ます。",
        "共催・後援・契約・法的判断は、人間の担当者間で行います。"
      ],
      actions: [
        { label: "会場の『ありがとう』構想", href: "#kindness-board" },
        { label: "正式な連携を相談", href: "#contact" }
      ]
    },
    resident: {
      staff: "community",
      staffName: "地域連携担当 ゆい",
      icon: "🏘️",
      title: "難しい支援ではなく、小さな関わりから始められます",
      summary: "作品を見る、感想を書く、あいさつする、昔の話を伝える。一つひとつが、地域に知っている大人を増やします。",
      bubble: "あいさつや感想も、地域の役割です。",
      points: [
        "展示を一緒に直す、椅子を運ぶ、道具を貸すことも参加です。",
        "誰かの性格や優しさを採点しません。",
        "地域の話や写真は、公開範囲を確認して記録します。"
      ],
      actions: [
        { label: "会場の『ありがとう』構想", href: "#kindness-board" },
        { label: "田場の記録を見る", href: "#taba-archive" }
      ]
    },
    nature: {
      staff: "nature",
      staffName: "いきもの・地域文化担当 みなも",
      icon: "🐟",
      title: "いきものを、会話と地域記録の入口にします",
      summary: "犬、猫、鳥、魚、昆虫、植物や畑の生きもの、釣りやペットとの暮らしを、作品や地域の話へつなげます。",
      bubble: "いきものから、地域の話へ広げよう。",
      points: [
        "いきものは企画全体ではなく、好きから始める入口の一つです。",
        "写真、思い出、観察記録、マップ、ZINEなどへ発展できます。",
        "個人宅や希少種の場所など、安全上公開すべきでない位置情報は載せません。"
      ],
      actions: [
        { label: "作品棚を見る", href: "#works-shelf" },
        { label: "田場で集めたいものを見る", href: "#taba-archive" }
      ]
    },
    unknown: {
      staff: "guide",
      staffName: "総合案内担当 まどか",
      icon: "☕",
      title: "まだ決めなくても大丈夫。一緒に入口だけ眺めましょう",
      summary: "作品を見る、遊びに行く、短時間だけ過ごすなど、詳しい事情を話さなくても選べる入口があります。",
      bubble: "分からないまま来ても、大丈夫です。",
      points: [
        "参加しないという選択も尊重します。",
        "名前、学校、住所、診断名などは尋ねません。",
        "正式な申込みや個別相談だけ、人間の担当者へつなぎます。"
      ],
      actions: [
        { label: "いろいろな参加のしかたを見る", href: "#participation-levels" },
        { label: "案内所の中を見る", href: "#works-shelf" }
      ]
    }
  };

  var roleButtons = Array.prototype.slice.call(document.querySelectorAll(".role-card[data-role]"));
  var staffCharacters = Array.prototype.slice.call(document.querySelectorAll(".staff-character[data-staff-key]"));
  var panel = document.getElementById("guidance-panel");
  var title = document.getElementById("guidance-title");
  var label = document.getElementById("guidance-label");
  var summary = document.getElementById("guidance-summary");
  var points = document.getElementById("guidance-points");
  var actions = document.getElementById("guidance-actions");
  var icon = document.getElementById("guidance-icon");
  var stageStatus = document.getElementById("stage-status");
  var voiceToggle = document.getElementById("voice-toggle");
  var voiceReplay = document.getElementById("voice-replay");
  var voiceStop = document.getElementById("voice-stop");
  var voiceStatus = document.getElementById("voice-status");
  var guideAudio = document.getElementById("guide-audio");
  var dock = document.getElementById("staff-dock");
  var dockIcon = document.getElementById("dock-staff-icon");
  var dockName = document.getElementById("dock-staff-name");
  var dockMessage = document.getElementById("dock-message");
  var dockNext = document.getElementById("dock-next");
  var dockVoiceToggle = document.getElementById("dock-voice-toggle");
  var handoffToast = document.getElementById("handoff-toast");
  var guideNext = document.getElementById("guide-next");
  var voiceEnabled = false;
  var currentVoiceKey = "";
  var currentVoiceLabel = "";
  var currentDockStaff = "guide";
  var handoffTimer = 0;
  var staffDisplay = {
    guide: { name: "まどか", icon: "📋" },
    works: { name: "えんぴつ", icon: "🎨" },
    care: { name: "なぎ", icon: "🌿" },
    youth: { name: "そら", icon: "📷" },
    community: { name: "ゆい", icon: "🤝" },
    nature: { name: "みなも", icon: "🐟" }
  };

  if (!panel || !title || !label || !summary || !points || !actions || !icon || !stageStatus || !voiceToggle || !voiceReplay || !voiceStop || !voiceStatus || !guideAudio || !dock || !dockIcon || !dockName || !dockMessage || !dockNext || !dockVoiceToggle || !handoffToast || !guideNext) return;

  function buildTextElement(tagName, className, text) {
    var element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = text;
    return element;
  }

  function updateDock(staffKey, message, nextText, announceHandoff) {
    var info = staffDisplay[staffKey] || staffDisplay.guide;
    var previous = staffDisplay[currentDockStaff] || staffDisplay.guide;
    if (announceHandoff && currentDockStaff && currentDockStaff !== staffKey) {
      handoffToast.textContent = previous.name + " → " + info.name + " にバトンタッチ！";
      handoffToast.hidden = false;
      handoffToast.classList.remove("is-showing");
      void handoffToast.offsetWidth;
      handoffToast.classList.add("is-showing");
      dock.classList.add("is-handoff");
      if (handoffTimer) window.clearTimeout(handoffTimer);
      handoffTimer = window.setTimeout(function () {
        handoffToast.hidden = true;
        handoffToast.classList.remove("is-showing");
        dock.classList.remove("is-handoff");
      }, 1700);
    }
    currentDockStaff = staffKey;
    dockIcon.textContent = info.icon;
    dockName.textContent = info.name;
    dockMessage.textContent = message || "一緒に入口を探そう。";
    dockNext.textContent = nextText || "案内中";
  }

  function activateStaff(staffKey, bubbleText) {
    staffCharacters.forEach(function (character) {
      var isActive = character.dataset.staffKey === staffKey;
      character.classList.toggle("is-active", isActive);
      character.classList.toggle("is-muted", !isActive);
      var bubble = character.querySelector(".staff-bubble");
      if (bubble) bubble.textContent = isActive ? bubbleText : "";
    });
  }

  function stopVoice(message) {
    guideAudio.pause();
    guideAudio.currentTime = 0;
    if (message) voiceStatus.textContent = message;
  }

  function playVoice(voiceKey, voiceLabel) {
    currentVoiceKey = voiceKey;
    currentVoiceLabel = voiceLabel;
    guideAudio.pause();
    guideAudio.src = "assets/audio/" + voiceKey + ".mp3";
    guideAudio.load();
    voiceStatus.textContent = voiceLabel + "を読み込んでいます。";

    var playback = guideAudio.play();
    if (playback && typeof playback.catch === "function") {
      playback.catch(function () {
        voiceStatus.textContent = "音声を再生できませんでした。画面の案内文はそのまま読めます。";
      });
    }
  }

  function setVoiceEnabled(enabled) {
    voiceEnabled = enabled;
    voiceToggle.setAttribute("aria-pressed", enabled ? "true" : "false");
    voiceToggle.textContent = enabled ? "音声案内をオフにする" : "音声案内をオンにする";
    dockVoiceToggle.setAttribute("aria-pressed", enabled ? "true" : "false");
    dockVoiceToggle.textContent = enabled ? "🔊 音声" : "🔇 音声";
    dockVoiceToggle.setAttribute("aria-label", enabled ? "音声案内をオフにする" : "音声案内をオンにする");
    voiceReplay.disabled = !enabled || !currentVoiceKey;
    voiceStop.disabled = !enabled || !currentVoiceKey;

    if (enabled) {
      if (currentVoiceKey) {
        playVoice(currentVoiceKey, currentVoiceLabel);
      } else {
        voiceStatus.textContent = "音声案内はオンです。入口を選ぶと、表示された吹き出しを読み上げます。";
      }
      return;
    }

    stopVoice("音声案内はオフです。");
    guideAudio.removeAttribute("src");
    guideAudio.load();
  }

  function renderGuide(roleKey, moveFocus) {
    var guide = guides[roleKey];
    if (!guide) return;

    roleButtons.forEach(function (button) {
      button.setAttribute("aria-pressed", button.dataset.role === roleKey ? "true" : "false");
    });

    label.textContent = guide.staffName;
    title.textContent = guide.title;
    summary.textContent = guide.summary;
    icon.textContent = guide.icon;

    var pointNodes = guide.points.map(function (point) {
      return buildTextElement("li", "", point);
    });
    points.replaceChildren.apply(points, pointNodes);

    var actionNodes = guide.actions.map(function (action) {
      var link = buildTextElement("a", "", action.label);
      link.href = action.href;
      return link;
    });
    actions.replaceChildren.apply(actions, actionNodes);

    activateStaff(guide.staff, guide.bubble);
    updateDock(guide.staff, guide.bubble, "② 次は参加を選ぼう", true);
    stageStatus.textContent = guide.staffName + "が案内しています。詳しい事情は入力せず、下の固定案内をご覧ください。";
    currentVoiceKey = roleKey;
    currentVoiceLabel = guide.staffName + "の吹き出し";

    if (voiceEnabled) {
      voiceReplay.disabled = false;
      voiceStop.disabled = false;
      playVoice(currentVoiceKey, currentVoiceLabel);
    }

    guideNext.hidden = false;
    if (moveFocus) panel.focus({ preventScroll: true });
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  roleButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      renderGuide(button.dataset.role, true);
    });
  });

  voiceToggle.addEventListener("click", function () {
    setVoiceEnabled(!voiceEnabled);
  });

  dockVoiceToggle.addEventListener("click", function () {
    setVoiceEnabled(!voiceEnabled);
  });

  guideNext.addEventListener("click", function () {
    var target = document.getElementById("route-quest");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  voiceReplay.addEventListener("click", function () {
    if (voiceEnabled) playVoice(currentVoiceKey, currentVoiceLabel);
  });

  voiceStop.addEventListener("click", function () {
    if (voiceEnabled) stopVoice("音声を停止しました。吹き出しが切り替わると、新しい一言を読み上げます。");
  });

  guideAudio.addEventListener("play", function () {
    voiceStatus.textContent = currentVoiceLabel + "をずんだもんが読み上げています。";
  });

  guideAudio.addEventListener("ended", function () {
    voiceStatus.textContent = currentVoiceLabel + "の読み上げが終わりました。";
  });

  guideAudio.addEventListener("error", function () {
    voiceStatus.textContent = "音声ファイルを読み込めませんでした。画面の案内文はそのまま読めます。";
  });

  function activateTeam(staffKeys, leadKey, bubbleText, statusText) {
    staffCharacters.forEach(function (character) {
      var key = character.dataset.staffKey;
      var isTeam = staffKeys.indexOf(key) !== -1;
      var isLead = key === leadKey;
      character.classList.toggle("is-active", false);
      character.classList.toggle("is-team", isTeam);
      character.classList.toggle("is-team-lead", isLead);
      character.classList.toggle("is-muted", !isTeam);
      var bubble = character.querySelector(".staff-bubble");
      if (bubble) bubble.textContent = isLead ? bubbleText : "";
    });
    if (statusText) stageStatus.textContent = statusText;
  }

  window.addEventListener("bungei:passport-staff", function (event) {
    var detail = event.detail || {};
    if (!detail.staff) return;
    activateTeam([detail.staff], detail.staff, detail.bubble || "", detail.status || "");
    updateDock(detail.staff, detail.bubble || "", detail.next || "案内中", true);
    if (detail.voiceKey) {
      currentVoiceKey = detail.voiceKey;
      currentVoiceLabel = detail.voiceLabel || ((staffDisplay[detail.staff] || staffDisplay.guide).name + "の吹き出し");
      voiceReplay.disabled = !voiceEnabled;
      voiceStop.disabled = !voiceEnabled;
      if (voiceEnabled) playVoice(currentVoiceKey, currentVoiceLabel);
    }
  });

  window.addEventListener("bungei:passport-team", function (event) {
    var detail = event.detail || {};
    var staffKeys = Array.isArray(detail.staff) ? detail.staff : [];
    if (!staffKeys.length) return;
    var lead = detail.lead || staffKeys[0];
    activateTeam(staffKeys, lead, detail.bubble || "このチームで案内するよ！", detail.status || "あなたの案内チームができました。");
    updateDock(lead, detail.bubble || "このチームで案内するよ！", "🎉 案内カード完成", false);
  });

  window.addEventListener("bungei:passport-reset", function () {
    activateTeam(["guide"], "guide", "また一緒に探そう。", "総合案内のまどかが待っています。");
    currentVoiceKey = "";
    currentVoiceLabel = "";
    voiceReplay.disabled = true;
    voiceStop.disabled = true;
    guideNext.hidden = true;
    updateDock("guide", "入口を選ぶところから、一緒に探そう。", "① 入口", false);
  });
})();


/* 案内パスポートゲーム。固定選択のみで、通信・保存は行わない。 */
(function () {
  "use strict";

  var roleLabels = {
    child: "子ども",
    parent: "保護者",
    school: "学校・SSW・教育相談室",
    highschool: "高校生・高校",
    welfare: "社協・福祉",
    government: "行政",
    resident: "田場区民・地域住民",
    nature: "いきもの好き",
    unknown: "まだ決めない"
  };
  var routeLabels = {
    create: "作品をつくる・出す",
    committee: "子ども実行委員",
    support: "場を支える",
    visit: "遊びに行く・見る",
    undecided: "まだ決めない"
  };
  var comfortLabels = {
    rest: "休む",
    ask: "聞く",
    help: "助けを求める",
    none: "まだ決めない"
  };

  var roleStaff = {
    child: "works",
    parent: "care",
    school: "care",
    highschool: "youth",
    welfare: "community",
    government: "community",
    resident: "community",
    nature: "nature",
    unknown: "guide"
  };
  var routeStaff = {
    create: { staff: "works", bubble: "見るだけでも大丈夫。作品の参加方法は確認中だよ。", status: "子ども・作品担当のえんぴつが、作品の参加方法をご案内します。", next: "③ 次は安心カード", voiceKey: "child", voiceLabel: "子ども・作品担当 えんぴつの吹き出し" },
    committee: { staff: "youth", bubble: "得意な一つだけでも、立派な役割です。", status: "若者・伴走担当のそらが、子ども実行委員の関わり方をご案内します。", next: "③ 次は安心カード", voiceKey: "highschool", voiceLabel: "若者・伴走担当 そらの吹き出し" },
    support: { staff: "community", bubble: "支えるだけでなく、役割を持てる場へ。", status: "地域連携担当のゆいが、会場を支える役割をご案内します。", next: "③ 次は安心カード", voiceKey: "welfare", voiceLabel: "地域連携担当 ゆいの吹き出し" },
    visit: { staff: "guide", bubble: "分からないまま来ても、大丈夫です。", status: "総合案内のまどかが、遊びに行く・見る参加をご案内します。", next: "③ 次は安心カード", voiceKey: "unknown", voiceLabel: "総合案内担当 まどかの吹き出し" },
    undecided: { staff: "guide", bubble: "今日は決めなくても大丈夫です。", status: "総合案内のまどかが、決めずに見る参加をご案内します。", next: "③ 次は安心カード", voiceKey: "unknown", voiceLabel: "総合案内担当 まどかの吹き出し" }
  };
  var comfortStaff = {
    rest: { staff: "care", bubble: "無理に勧めず、本人のペースを守ります。", status: "学校・保護者担当のなぎが、無理をしない参加を案内しています。", next: "🎉 案内カード完成へ", voiceKey: "parent", voiceLabel: "学校・保護者担当 なぎの吹き出し" },
    ask: { staff: "guide", bubble: "分からないまま来ても、大丈夫です。", status: "総合案内のまどかが、分からない時の聞き方を案内しています。", next: "🎉 案内カード完成へ", voiceKey: "unknown", voiceLabel: "総合案内担当 まどかの吹き出し" },
    help: { staff: "community", bubble: "支えるだけでなく、役割を持てる場へ。", status: "地域連携担当のゆいが、助けを求める・人につなぐ方法を案内しています。", next: "🎉 案内カード完成へ", voiceKey: "welfare", voiceLabel: "地域連携担当 ゆいの吹き出し" },
    none: { staff: "guide", bubble: "安心の方法も、今は決めなくて大丈夫です。", status: "総合案内のまどかが、決めずに進める方法をご案内します。", next: "🎉 案内カード完成へ", voiceKey: "unknown", voiceLabel: "総合案内担当 まどかの吹き出し" }
  };
  var staffNames = {
    guide: "📋 まどか",
    works: "🎨 えんぴつ",
    care: "🌿 なぎ",
    youth: "📷 そら",
    community: "🤝 ゆい",
    nature: "🐟 みなも"
  };

  var selectedRole = "";
  var selectedRoute = "";
  var selectedComfort = "";

  var roleButtons = Array.prototype.slice.call(document.querySelectorAll(".role-card[data-role]"));
  var routeButtons = Array.prototype.slice.call(document.querySelectorAll("[data-route-choice]"));
  var comfortButtons = Array.prototype.slice.call(document.querySelectorAll("[data-comfort-choice]"));
  var routeQuest = document.getElementById("route-quest");
  var comfortQuest = document.getElementById("comfort-quest");
  var count = document.getElementById("passport-count");
  var next = document.getElementById("passport-next");
  var progress = document.getElementById("passport-progress");
  var stampRole = document.getElementById("stamp-role");
  var stampRoute = document.getElementById("stamp-route");
  var stampComfort = document.getElementById("stamp-comfort");
  var result = document.getElementById("passport-result");
  var resultCopy = document.getElementById("passport-result-copy");
  var resultRole = document.getElementById("result-role");
  var resultRoute = document.getElementById("result-route");
  var resultComfort = document.getElementById("result-comfort");
  var resultTips = document.getElementById("result-tips");
  var teamList = document.getElementById("passport-team-list");
  var moreRolesToggle = document.getElementById("more-roles-toggle");
  var moreRolesPanel = document.getElementById("more-roles-panel");
  var printButton = document.getElementById("passport-print");
  var reset = document.getElementById("passport-reset");

  if (!roleButtons.length || !routeButtons.length || !comfortButtons.length || !routeQuest || !comfortQuest || !count || !next || !progress || !stampRole || !stampRoute || !stampComfort || !result || !resultCopy || !resultRole || !resultRoute || !resultComfort || !resultTips || !teamList || !moreRolesToggle || !moreRolesPanel || !printButton || !reset) return;

  function setMoreRoles(open) {
    moreRolesPanel.hidden = !open;
    moreRolesToggle.setAttribute("aria-expanded", open ? "true" : "false");
    moreRolesToggle.querySelector("small").textContent = open ? "閉じる" : "高校・福祉・行政・地域など";
  }

  moreRolesToggle.addEventListener("click", function () {
    setMoreRoles(moreRolesToggle.getAttribute("aria-expanded") !== "true");
  });

  function setOpen(step, buttons, open) {
    step.classList.toggle("quest-step-locked", !open);
    step.classList.toggle("is-open", open);
    buttons.forEach(function (button) { button.disabled = !open; });
  }

  function markSelected(buttons, key, dataName) {
    buttons.forEach(function (button) {
      button.classList.toggle("is-selected", button.dataset[dataName] === key);
      button.setAttribute("aria-pressed", button.dataset[dataName] === key ? "true" : "false");
    });
  }

  function buildTeam() {
    var keys = [roleStaff[selectedRole], routeStaff[selectedRoute] && routeStaff[selectedRoute].staff, comfortStaff[selectedComfort] && comfortStaff[selectedComfort].staff].filter(Boolean);
    return keys.filter(function (key, index) { return keys.indexOf(key) === index; });
  }

  function renderTeamChips(team) {
    var chips = team.map(function (key) {
      var chip = document.createElement("span");
      chip.className = "passport-team-chip";
      chip.textContent = staffNames[key] || key;
      return chip;
    });
    teamList.replaceChildren.apply(teamList, chips);
  }

  function buildTips() {
    var tips = ["見るだけ、短い時間だけでも参加です。"];
    var routeTips = {
      create: "作品の参加条件は確認中です。決まった範囲だけで参加できます。",
      committee: "全部やらなくてOK。できる役割を一つ選べます。",
      support: "人前に立たなくても、整える・案内する役割があります。",
      visit: "作品を見るだけでも大丈夫です。",
      undecided: "今日は決めずに会場を見るだけでも大丈夫です。"
    };
    var comfortTips = {
      rest: "疲れたら、自分のタイミングで休んで大丈夫です。",
      ask: "分からないことは、案内スタッフに聞いて大丈夫です。",
      help: "困ったときは、担当者につないでもらえます。",
      none: "安心の方法も、今決めなくて大丈夫です。"
    };
    if (routeTips[selectedRoute]) tips.push(routeTips[selectedRoute]);
    if (comfortTips[selectedComfort]) tips.push(comfortTips[selectedComfort]);
    return tips;
  }

  function renderTips() {
    var nodes = buildTips().map(function (tip) {
      var item = document.createElement("li");
      item.textContent = tip;
      return item;
    });
    resultTips.replaceChildren.apply(resultTips, nodes);
  }

  function updatePassport() {
    var completed = (selectedRole ? 1 : 0) + (selectedRoute ? 1 : 0) + (selectedComfort ? 1 : 0);
    count.textContent = completed + " / 3";
    progress.style.width = Math.round((completed / 3) * 100) + "%";
    stampRole.classList.toggle("is-done", !!selectedRole);
    stampRoute.classList.toggle("is-done", !!selectedRoute);
    stampComfort.classList.toggle("is-done", !!selectedComfort);

    if (!selectedRole) next.textContent = "① まず入口を選ぼう";
    else if (!selectedRoute) next.textContent = "② 気になる参加を選ぼう";
    else if (!selectedComfort) next.textContent = "③ 安心カードを選ぼう";
    else next.textContent = "🎉 パスポート完成！";

    setOpen(routeQuest, routeButtons, !!selectedRole);
    setOpen(comfortQuest, comfortButtons, !!selectedRoute);

    if (completed === 3) {
      resultRole.textContent = "入口：" + roleLabels[selectedRole];
      resultRoute.textContent = "参加：" + routeLabels[selectedRoute];
      resultComfort.textContent = "安心：" + comfortLabels[selectedComfort];
      resultCopy.textContent = "これは診断ではありません。今日は「" + routeLabels[selectedRoute] + "」が気になっただけでも十分です。見るだけ、途中まで、別の参加へ変えることもできます。";
      var team = buildTeam();
      renderTips();
      renderTeamChips(team);
      window.dispatchEvent(new CustomEvent("bungei:passport-team", {
        detail: {
          staff: team,
          lead: comfortStaff[selectedComfort].staff,
          bubble: "このチームで案内するよ！",
          status: "あなたの案内チームができました：" + team.map(function (key) { return staffNames[key].replace(/^[^ ]+ /, ""); }).join("・")
        }
      }));
      result.hidden = false;
      result.classList.remove("celebrate");
      void result.offsetWidth;
      result.classList.add("celebrate");
      result.focus({ preventScroll: true });
      result.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
      result.hidden = true;
    }
  }

  roleButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      selectedRole = button.dataset.role;
      roleButtons.forEach(function (item) {
        item.classList.toggle("is-quest-done", item === button);
      });
      if (!button.closest("#more-roles-panel")) setMoreRoles(false);
      updatePassport();
    });
  });

  routeButtons.forEach(function (button) {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", function () {
      selectedRoute = button.dataset.routeChoice;
      markSelected(routeButtons, selectedRoute, "routeChoice");
      var routeGuide = routeStaff[selectedRoute];
      window.dispatchEvent(new CustomEvent("bungei:passport-staff", { detail: routeGuide }));
      updatePassport();
      if (comfortQuest) comfortQuest.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });

  comfortButtons.forEach(function (button) {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", function () {
      selectedComfort = button.dataset.comfortChoice;
      markSelected(comfortButtons, selectedComfort, "comfortChoice");
      var comfortGuide = comfortStaff[selectedComfort];
      window.dispatchEvent(new CustomEvent("bungei:passport-staff", { detail: comfortGuide }));
      updatePassport();
    });
  });

  printButton.addEventListener("click", function () {
    window.print();
  });

  reset.addEventListener("click", function () {
    selectedRole = "";
    selectedRoute = "";
    selectedComfort = "";
    roleButtons.forEach(function (button) {
      button.classList.remove("is-quest-done");
      button.setAttribute("aria-pressed", "false");
    });
    markSelected(routeButtons, "", "routeChoice");
    markSelected(comfortButtons, "", "comfortChoice");
    resultTips.replaceChildren();
    teamList.replaceChildren();
    setMoreRoles(false);
    window.dispatchEvent(new CustomEvent("bungei:passport-reset"));
    updatePassport();
    document.getElementById("role-entrances").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  updatePassport();
})();
