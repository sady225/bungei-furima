# furima.ryukyu-tane.com

沖縄文芸フリマ公式サイトの公開用作業フォルダです。

現在は、GitHub Pagesで公開し、`furima.ryukyu-tane.com` をCloudflare DNS経由でGitHub Pagesへ向ける構成を想定しています。

## 公開対象

- `index.html`
- `style.css`
- `script.js`
- `images/`
- `photo/`
- `ai-editor/`
- `CNAME`
- `.nojekyll`

## 公開設定

- GitHub Pages: `main` ブランチの `/ (root)`
- Custom domain: `furima.ryukyu-tane.com`
- Cloudflare DNS: `furima` の `CNAME` を `sady225.github.io` へ向ける

## 注意

- FTPユーザー名、パスワード、サーバー情報はGitHubへコミットしないでください。
- `ftp_upload.sh` や `.env` は `.gitignore` で除外しています。
- 公開前は `index.html` の画像パスと外部リンクを確認してください。
- 詳細な移行手順は `DEPLOY.md` を確認してください。
