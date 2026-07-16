# 公開手順：GitHub Pages + Cloudflare

対象：沖縄文芸フリマ公式サイト一式

- 本番URL：`https://furima.ryukyu-tane.com/`
- GitHubリポジトリ：`sady225/bungei-furima`
- 公開元：`main` ブランチのルート
- カスタムドメイン：`furima.ryukyu-tane.com`

## 1. このリポジトリ側で必要なもの

このリポジトリには、GitHub Pages公開用に次のファイルを置いています。

- `index.html`：トップページ
- `ai-editor/`：AI創作編集室
- `CNAME`：GitHub Pagesのカスタムドメイン指定
- `.nojekyll`：Jekyll変換を使わず、そのまま静的ファイルとして公開する指定

## 2. GitHub Pagesの設定

GitHubで `sady225/bungei-furima` を開きます。

このリポジトリがprivateの場合でもGitHub Pagesに使えますが、GitHub公式ドキュメント上は、private repositoryからPagesを公開するには GitHub Pro / Team / Enterprise 系のプランが必要です。GitHub Freeの場合は、Pages公開元のリポジトリをpublicにする必要があります。

また、private repositoryからGitHub Pagesで公開した場合でも、公開されたWebサイト自体はインターネット上で閲覧可能です。リポジトリ内に公開したくないファイルや秘密情報を置かないでください。

1. `Settings` を開く
2. 左メニューの `Pages` を開く
3. `Build and deployment` の `Source` を `Deploy from a branch` にする
4. `Branch` を `main`、フォルダを `/ (root)` にして保存
5. `Custom domain` に `furima.ryukyu-tane.com` を入れて保存
6. `Enforce HTTPS` が選べるようになったら有効化

GitHub公式ドキュメントでは、カスタムサブドメインはGitHub Pages側にドメインを追加したうえで、DNSにCNAMEを設定する流れです。DNS反映やHTTPS設定には時間がかかることがあります。

## 3. Cloudflare DNSの設定

Cloudflareで `ryukyu-tane.com` のDNSを開き、`furima` の既存レコードがValue-DomainのFTPサーバーを指している場合は、GitHub Pages向けに差し替えます。

推奨レコード：

| Type | Name | Target | Proxy status |
| --- | --- | --- | --- |
| CNAME | `furima` | `sady225.github.io` | まずは `DNS only` |

GitHub PagesでカスタムドメインとHTTPSが正常になった後、Cloudflare経由にしたい場合は `Proxy status` を `Proxied` に切り替えます。切り替え後は Cloudflare の `SSL/TLS` を `Full` 以上にしてください。

注意：

- CNAMEのTargetにリポジトリ名 `/bungei-furima` は入れません。
- ワイルドカードDNS（`*.ryukyu-tane.com`）は使わないでください。
- 旧FTPサーバー向けの `A` / `CNAME` レコードが同じ名前で残っていると、意図しない向き先になります。

## 4. 更新手順

ローカルで変更したら、通常のGit操作でGitHubへ反映します。

```bash
git status
git add .
git commit -m "Update site"
git push origin main
```

GitHub Pagesの反映には数十秒から数分かかることがあります。

## 5. 動作確認チェックリスト

- [ ] `https://furima.ryukyu-tane.com/` がトップページを表示する
- [ ] `https://furima.ryukyu-tane.com/ai-editor/` がAI創作編集室を表示する
- [ ] トップページの「AI創作編集室を体験する」リンクが開く
- [ ] 「メインサイトへ戻る」リンクでトップページに戻れる
- [ ] 「2027年2月頃」「田場公民館」「企画中」の表記が確認できる
- [ ] スマートフォン幅でも横スクロールせず読める
- [ ] Instagramなど外部リンクが正しく開く
- [ ] GitHub Pagesで `Enforce HTTPS` が有効になっている
- [ ] Cloudflare経由に切り替えた後もHTTPS警告が出ない

## 6. 正式なフォームURLが決まったら

出展・来場・ボランティアの正式な受付フォームやお問い合わせページのURLが決まったら、`ai-editor/index.html` 内の `href="#contact"` を実際のURLに差し替えてください。

現在は、各ボタンがページ内の「お問い合わせ方法」セクション（Instagram DM・電話番号）へ案内する形です。

## 7. トラブル時

- GitHub Pagesが404になる：Pages設定が `main` / `/ (root)` になっているか確認
- 独自ドメインが旧サイトを表示する：Cloudflare DNSに旧FTP向けレコードが残っていないか確認
- HTTPSが有効にならない：GitHub Pagesのカスタムドメイン保存後、DNS反映を待ってから `Enforce HTTPS` を再確認
- CSSやJSが読み込めない：ブラウザのキャッシュを削除、またはスーパーリロード
