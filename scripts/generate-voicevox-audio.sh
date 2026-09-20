#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
voicevox_endpoint="${VOICEVOX_ENDPOINT:-http://127.0.0.1:50021}"
speaker_id="${VOICEVOX_SPEAKER_ID:-3}"
audio_dir="$repo_root/ai-editor/assets/audio"
voicevox_tmp="$(mktemp -d /private/tmp/bungei-voicevox.XXXXXX)"

cleanup() {
  case "$voicevox_tmp" in
    /private/tmp/bungei-voicevox.*) rm -rf -- "$voicevox_tmp" ;;
  esac
}
trap cleanup EXIT

mkdir -p "$audio_dir"

generate_voice() {
  local voice_id="$1"
  local voice_text="$2"
  local query_file="$voicevox_tmp/$voice_id.json"
  local wav_file="$voicevox_tmp/$voice_id.wav"
  local mp3_file="$audio_dir/$voice_id.mp3"

  curl --fail --silent --show-error --get --request POST \
    "$voicevox_endpoint/audio_query" \
    --data-urlencode "text=$voice_text" \
    --data-urlencode "speaker=$speaker_id" \
    --output "$query_file"

  curl --fail --silent --show-error --request POST \
    "$voicevox_endpoint/synthesis?speaker=$speaker_id" \
    --header "Content-Type: application/json" \
    --data-binary "@$query_file" \
    --output "$wav_file"

  ffmpeg -hide_banner -loglevel error -y -i "$wav_file" \
    -af "loudnorm=I=-18:TP=-1.5:LRA=11" \
    -codec:a libmp3lame -b:a 72k -ar 44100 "$mp3_file"
  printf 'generated %s\n' "$mp3_file"
}

generate_voice "welcome" "こんにちはなのだ。沖縄文芸フリマの、町の案内所なのだ。見るだけ、作品だけ、短い時間だけでも参加なのだ。下から、今の立場に近い入口を選んでみてね。"
generate_voice "child" "子どものみなさんへ。絵、本、ゲーム、物語、写真、ものづくり。好きなものを入口に、自分で選べる参加があるのだ。見るだけも、作品だけもオーケーなのだ。"
generate_voice "parent" "保護者のみなさんへ。学校復帰や継続参加を目的にはしていないのだ。本人が選べる小さな社会参加と、安心して顔を合わせられる大人との接点をつくるのだ。"
generate_voice "school" "学校や教育相談のみなさんへ。募集ではなく、本人が選べる選択肢として紹介してほしいのだ。作品だけ、見学だけ、短い時間など、いくつもの入口があるのだ。"
generate_voice "highschool" "高校生のみなさんへ。写真、展示、案内、デザインなど、得意なところだけで関われるのだ。人前に立たない準備や片付けも、大切な参加なのだ。"
generate_voice "welfare" "福祉や、社会福祉協議会のみなさんへ。支援関係になる前の、地域の顔見知りを増やすのだ。できることや関心から、役割を一緒に探すのだ。"
generate_voice "government" "行政のみなさんへ。学校外の小さな社会参加を、今ある施策へつなぐのだ。まずは情報提供や関係部署への橋渡しから、段階的に相談するのだ。"
generate_voice "resident" "地域のみなさんへ。作品を見る、感想を書く、あいさつする、昔の話を伝える。そんな小さな関わりも、地域の大切な役割なのだ。"
generate_voice "nature" "いきものが好きなみなさんへ。猫、犬、鳥、魚、昆虫や畑の生きものを、作品や地域の話へつなげるのだ。いきものは、好きから始める入口の一つなのだ。"
generate_voice "unknown" "どれにも当てはまらなくても、まだ決めなくても大丈夫なのだ。詳しい事情を話さなくても、作品を見る、遊びに行く、短い時間だけ過ごす入口があるのだ。"
