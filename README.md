# furima.ryukyu-tane.com

沖縄文芸フリマ公式サイトの公開用作業フォルダです。

GitHub Actionsで公開専用ファイルだけを組み立て、GitHub Pagesへ公開します。`furima.ryukyu-tane.com` はCloudflare DNS経由でGitHub Pagesへ向けます。

## 公開対象

- `index.html`
- `ai-editor/index.html`
- `ai-editor/style.css`
- `ai-editor/app.js`
- `ai-editor/assets/office-background.png`
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
