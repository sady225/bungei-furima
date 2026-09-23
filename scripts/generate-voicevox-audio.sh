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

generate_voice "child" "見るだけも、作品だけもOKだよ。"
generate_voice "parent" "無理に勧めず、本人のペースを守ります。"
generate_voice "school" "参加人数だけでなく、関係の変化を見ます。"
generate_voice "highschool" "得意な一つだけでも、立派な役割です。"
generate_voice "welfare" "支えるだけでなく、役割を持てる場へ。"
generate_voice "government" "最初から共催を求めず、接続から始めます。"
generate_voice "resident" "あいさつや感想も、地域の役割です。"
generate_voice "nature" "いきものから、地域の話へ広げよう。"
generate_voice "unknown" "分からないまま来ても、大丈夫です。"
