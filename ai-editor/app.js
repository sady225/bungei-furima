/*
 * 沖縄文芸フリマ 町の案内所 / デジタル職員室 Phase 1-2
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
      bubble: "見るだけも、作品だけもOKだよ。",
      points: [
        "見るだけ、作品だけ、途中で帰ることもできます。",
        "どうして学校へ行きづらいのか、診断名などは聞きません。",
        "次の段階へ進まなくても、その日の参加を大切にします。"
      ],
      actions: [
        { label: "参加の6段階を見る", href: "#participation-levels" },
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
        { label: "参加の6段階を見る", href: "#participation-levels" },
        { label: "人への引継ぎ方針", href: "#human-handoff" }
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
        "作品のみ、見学のみ、短時間など複数の入口を示します。",
        "正式な学校連携や安全調整は、人間の担当者が対応します。"
      ],
      actions: [
        { label: "作品だけの参加を見る", href: "#works-shelf" },
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
        { label: "やさしさの足あと", href: "#kindness-board" }
      ]
    },
    welfare: {
      staff: "community",
      staffName: "地域連携担当 ゆい",
      icon: "🤝",
      title: "支援関係になる前の、地域の顔見知りを増やします",
      summary: "福祉教育、ボランティア、多世代交流、障がいのある人や高齢者の役割参加など、地域の接点を一緒に考えます。",
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
        { label: "やさしさの足あとを見る", href: "#kindness-board" },
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
        { label: "やさしさの足あとを見る", href: "#kindness-board" },
        { label: "田場の記録を見る", href: "#taba-archive" }
      ]
    },
    nature: {
      staff: "nature",
      staffName: "いきもの・地域文化担当 みなも",
      icon: "🐟",
      title: "いきものを、会話と地域記録の入口にします",
      summary: "猫、犬、鳥、魚、昆虫、畑の生きもの、釣りやペットとの暮らしを、作品や地域の話へつなげます。",
      bubble: "いきものから、地域の話へ広げよう。",
      points: [
        "いきものは企画全体ではなく、好きから始める入口の一つです。",
        "写真、思い出、観察記録、マップ、ZINEなどへ発展できます。",
        "個人宅や希少種の場所など、安全上公開すべきでない位置情報は載せません。"
      ],
      actions: [
        { label: "作品棚を見る", href: "#works-shelf" },
        { label: "田場マップ構想を見る", href: "#taba-archive" }
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
        { label: "参加の6段階を見る", href: "#participation-levels" },
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
  var voiceEnabled = false;
  var currentVoiceKey = "welcome";
  var currentVoiceLabel = "最初の案内";

  if (!panel || !title || !label || !summary || !points || !actions || !icon || !stageStatus || !voiceToggle || !voiceReplay || !voiceStop || !voiceStatus || !guideAudio) return;

  function buildTextElement(tagName, className, text) {
    var element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = text;
    return element;
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
    voiceReplay.disabled = !enabled;
    voiceStop.disabled = !enabled;

    if (enabled) {
      playVoice(currentVoiceKey, currentVoiceLabel);
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
    stageStatus.textContent = guide.staffName + "が案内しています。詳しい事情は入力せず、下の固定案内をご覧ください。";
    currentVoiceKey = roleKey;
    currentVoiceLabel = guide.staffName + "の案内";

    if (voiceEnabled) playVoice(currentVoiceKey, currentVoiceLabel);

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

  voiceReplay.addEventListener("click", function () {
    if (voiceEnabled) playVoice(currentVoiceKey, currentVoiceLabel);
  });

  voiceStop.addEventListener("click", function () {
    if (voiceEnabled) stopVoice("音声を停止しました。入口を選ぶと、新しい案内を再生します。");
  });

  guideAudio.addEventListener("play", function () {
    voiceStatus.textContent = currentVoiceLabel + "を再生しています。";
  });

  guideAudio.addEventListener("ended", function () {
    voiceStatus.textContent = currentVoiceLabel + "の再生が終わりました。";
  });

  guideAudio.addEventListener("error", function () {
    voiceStatus.textContent = "音声ファイルを読み込めませんでした。画面の案内文はそのまま読めます。";
  });
})();
