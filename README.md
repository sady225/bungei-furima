# furima.ryukyu-tane.com

沖縄文芸フリマ公式サイトの公開用作業フォルダです。

GitHub Actionsで公開専用ファイルだけを組み立て、GitHub Pagesへ公開します。`furima.ryukyu-tane.com` はCloudflare DNS経由でGitHub Pagesへ向けます。

## 公開対象

- `index.html`
- `ai-editor/index.html`
- `ai-editor/style.css`
- `ai-editor/app.js`
- `ai-editor/assets/office-background.png`
- `ai-editor/assets/audio/*.mp3`（VOICEVOX:ずんだもんの固定案内音声）
- `index.html` が実際に使用する開催写真
- `CNAME`
- `.nojekyll`

`scripts/build-public-site.sh` が `_site/` を生成し、上記以外のファイルが混入するとエラーにします。

## 公開設定

- GitHub Pages: GitHub Actions
- Custom domain: `furima.ryukyu-tane.com`
- Cloudflare DNS: `furima` の `CNAME` を `sady225.github.io` へ向ける

## 注意

- FTPユーザー名、パスワード、サーバー情報はGitHubへコミットしないでください。
- 個人データ、会議資料、制作元データ、旧HTMLの控えは、この公開リポジトリへコミットしないでください。
- `ftp_upload.sh` や `.env` は `.gitignore` で除外しています。
- 公開前は `bash scripts/build-public-site.sh` を実行し、公開物の内容、画像パス、外部リンクを確認してください。
- 詳細な移行手順は `DEPLOY.md` を確認してください。
- 町の案内所、画像公開、今後のAI接続に関する安全ルールは `SAFETY_AND_PUBLICATION.md` を正本とします。

## 町の案内所 Phase 1〜2

`ai-editor/` は、8つの立場別入口、参加の6段階、作品棚、お店・出展者ギャラリー、やさしさの足あと、田場マップ／TABA ARCHIVEのUIを提供します。

現段階では固定案内とサイト内の固定音声のみで、AI API、自由入力、外部通信、会話ログ保存は使用しません。

公開前の安全確認は次で実行します。

```bash
bash scripts/check-site-safety.sh
```

ずんだもんの固定音声を再生成する場合は、ローカルのVOICEVOXエンジンを起動してから次を実行します。既定の話者IDは、ずんだもん「ノーマル」の `3` です。

```bash
bash scripts/generate-voicevox-audio.sh
```
