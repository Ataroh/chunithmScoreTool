(async () => {
    const version = "v"+"1.1.1";
    const entries = [...document.querySelectorAll(".frame02.w400")];
    const results = entries.map(entry => {
        // 楽曲ごとのプレイ日時
        const date = entry.querySelector(".play_datalist_date")?.innerText.trim() ?? "";
        // 楽曲名
        const title = entry.querySelector(".play_musicdata_title")?.innerText.trim() ?? "";
        // スコア
        const score = entry.querySelector(".play_musicdata_score_text")?.innerText.trim() ?? "";
        // 難易度（画像srcのファイル名から判別）
        const levelImgSrc = entry.querySelector(".play_track_result img")?.src ?? "";
        const level=levelImgSrc.includes("ultimate") ? "ULT" :
                    levelImgSrc.includes("master") ? "MAS" :
                    levelImgSrc.includes("expert") ? "EXP" :
                    levelImgSrc.includes("advanced") ? "ADV" :
                    levelImgSrc.includes("basic") ? "BAS" :
                    levelImgSrc.includes("worldsend") ? "WE" : "UNKNOWN";
        // クリアランプ
        const lampImg = entry.querySelector("img[src*='icon_clear'], img[src*='icon_hard'], img[src*='icon_absolute']");//
        const lamp = lampImg ? (
                        lampImg.src.includes("clear") ? "CLR" :
                        lampImg.src.includes("hard") ? "HRD" :
                        lampImg.src.includes("absolute") ? "ABS" :
                        lampImg.src.includes("catastrophy") ? "CTS" : "UNKNOWN"
                    ) : "";
        // AJ/FC検出
        const fcIcon = entry.querySelector("img[src*='icon_fullcombo']");//
        const ajIcon = entry.querySelector("img[src*='icon_alljustice']");//
        const status = ajIcon ? "AJ" : fcIcon ? "FC" : "";

        return { date, title, level, score, status, lamp };// track, rank
    });

    results.sort((a, b) => new Date(a.date) - new Date(b.date))

    /*
    console.log("取得したデータ:", results);
    alert(`${results.length}件の詳細データを取得しConsoleに出力しました`);
    */

    // 既存モーダルを削除（リロード不要）
    document.getElementById("bm-modal")?.remove();

    // モーダルHTML作成
    const modal = document.createElement("div");
    modal.id = "bm-modal";
    modal.innerHTML = `
    <div style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:#0008;display:flex;align-items:center;justify-content:center;z-index:99999;font-family:Arial,sans-serif;">
        <div style="background:#fff;padding:20px 30px;border-radius:12px;text-align:center;min-width:300px;box-shadow:0 4px 20px rgba(0,0,0,0.3);">
            <div id="bm-title" style="font-size:20px;font-weight:bold;color:#333;margin-bottom:8px;">CHUNITHM スコアツール</div>
            <div id="bm-message" style="font-size:16px;color:#333;margin-bottom:12px;">起動中</div>
            <div>
                <button id="bm-close" style="padding:8px 20px;background:#fff;color:#1970e2;border:1px solid #aaa;border-radius:6px;font-size:14px;cursor:pointer;margin:5px;">閉じる</button>
                <button id="bm-send" disabled style="padding:8px 20px;background:#1970e2;color:#fff;border:1px solid #aaa;border-radius:6px;font-size:14px;cursor:pointer;margin:5px;">送信</button>
            </div>
            <div id="bm-version" style="font-size:12px;color:#000;margin-top:4px;margin-bottom:0px;text-align:right"></div>
        </div>
    </div>
    `;
    document.body.appendChild(modal);

    const $tit = document.getElementById("bm-title");
    const $msg = document.getElementById("bm-message");
    const $ver = document.getElementById("bm-version");
    const $send = document.getElementById("bm-send");
    const $close = document.getElementById("bm-close");

    $close.onclick = () => modal.remove();

    const webhookURL = window.__WEBHOOK_URL__;
    if (!webhookURL) {
        modal.remove();
        //alert("[ERROR] Webhook URL が定義されていません");
        $send.disabled = true;
        $send.style.display = "none";
        $msg.textContent = "[ERROR] Webhook URL が定義されていません"
        $close.style.margin = "4px auto 0";
        $close.disabled = false;
        $close.style.display = "block";
        return;
    }

    $msg.textContent = "バージョンを取得中"
    fetch(webhookURL)
        .then(response => response.json())
        .then(data => {
            $ver.textContent = `${version} (GAS v${data.version})`;
            $msg.textContent = "データを送信しますか？";
            $send.disabled = false;
        })
        .catch(error => {
            $msg.textContent = "バージョン取得失敗";
            console.error(error);
        });

    $send.onclick = () => {
        $msg.textContent = "送信中";
        $send.disabled = true;
        $send.style.display = "none";
        $close.disabled = true;
        $close.style.display = "none";

        try {
            fetch(webhookURL, {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain", // "application/json"から変更
                },
                body: JSON.stringify(results)
            }).then(res => res.json())
                .then(res => {
                    if (res.status === "success") {
                        $msg.textContent = "送信完了";
                        //$msg.style.color = "#28a745";
                    } else {
                        $msg.textContent = "[ERROR] 送信失敗";
                        //$msg.style.color = "#dc3545";
                    }
                    $close.style.margin = "4px auto 0";
                    $close.disabled = false;
                    $close.style.display = "block";
                })
                .catch(err => {
                    $msg.textContent = "[ERROR] 通信中に例外が発生しました";
                    //$msg.style.color = "#dc3545";
                    console.error(err);
                    $close.style.margin = "4px auto 0";
                    $close.disabled = false;
                    $close.style.display = "block";
                    //setTimeout(() => modal.remove(), 2000);
                });
        } catch (err) {
            modal.remove();
            alert("[ERROR] catch：" + err.message);
        }
    }
})();
