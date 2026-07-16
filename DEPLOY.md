# 公開手順：GitHub Pages + Cloudflare

対象：沖縄文芸フリマ公式サイト一式

- 本番URL：`https://furima.ryukyu-tane.com/`
- GitHubリポジトリ：`sady225/bungei-furima`
- 公開元：`main` ブランチのルート
- カスタムドメイン：`furima.ryukyu-tane.com`

## 1. このリポジトリ側で必要なもの

このリポジトリには、GitHub Pages公開用に次のファイルを置いています。

- `index.html`：トップページ
- `ai-editor/`：オンライン事務局
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
- [ ] `https://furima.ryukyu-tane.com/ai-editor/` がオンライン事務局を表示する
- [ ] ページ名が「オンライン事務局」になっている
- [ ] 背景画像が表示される
- [ ] 出展までの流れが読める
- [ ] ボランティア参加までの流れが読める
- [ ] 来場者向けの当日案内が読める
- [ ] 未確定の開催日時、住所、地図、駐車場、公共交通、バリアフリー、配置図、飲食、入場料、混雑時間を断定していない
- [ ] トップページの「オンライン事務局を見る」リンクが開く
- [ ] 「メインサイトへ戻る」リンクでトップページに戻れる
- [ ] `/online-office/` と `/office/` から `/ai-editor/` へ移動できる
- [ ] 「2027年2月頃」「田場公民館」「企画中」の表記が確認できる
- [ ] 参加時間や途中参加など、未決定の参加条件を断定していない
- [ ] 募集中・受付中と誤解させる表現がない
- [ ] 管理者画面とAI相談機能を、実装済みの機能として誤解させていない
- [ ] すべてのリンクが実在する
- [ ] 電話番号が正式なものか確認されている
- [ ] スマートフォン幅でも横スクロールせず読める
- [ ] デモ開始、停止、再開始が動く
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

### `Enforce HTTPS` がONにできない場合

`furima.ryukyu-tane.com` がGitHub Pagesの内容を表示していても、証明書がまだ `*.github.io` のままだと `Enforce HTTPS` は有効化できません。

確認すること：

1. Cloudflare DNSで `furima` が `CNAME` → `sady225.github.io` になっている
2. 証明書発行中は、CloudflareのProxy statusをいったん `DNS only` にする
3. `furima` と同じ名前の旧FTP向け `A` / `AAAA` / `CNAME` レコードを残さない
4. GitHubの `Settings` → `Pages` で、Custom domainを一度削除して保存し、再度 `furima.ryukyu-tane.com` を入れて保存する
5. GitHubがTLS証明書を発行するまで数分から最大1時間ほど待つ
6. Custom domain欄にチェックが付いたら `Enforce HTTPS` をONにする

HTTPSが有効になった後でCloudflare経由に戻す場合は、Proxy statusを `Proxied` にし、Cloudflareの `SSL/TLS` は `Full` 以上にしてください。`Flexible` は使わないでください。
