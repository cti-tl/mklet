var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
  lineWrapping: true,
  lineNumbers: true,
  mode: "javascript",
  direction: "ltr",
  matchBrackets: true,
  continueComments: "Enter",
  extraKeys: { "Ctrl-Q": "toggleComment" },
});
editor.setSize("100%", "100%");
var doc = editor.getDoc();
doc.setValue(`javascript: (function(d){
  let ById = (id) => d.getElementById(id);
  let ByNames = (name, index = 0) => d.getElementsByName(name)[index];
  let q = (selector, index = 0) => d.querySelectorAll(selector)[index];
  alert('test');
  })(document);`);

// イベントハンドラは初期化より先に必ず登録する。
// (初期化 initMklet() が読み込み順の都合で失敗しても、blur/change が効くようにするため)
editor.on("blur", function () {
  jscompCM();
});
// 入力中はボタン(リンク)を即時更新し、blur のタイミングに依存しないようにする
editor.on("change", function () {
  refreshLink();
});
editor.on("drop", function (cm, e) {
  // ドロップされたファイル情報は e.dataTransfer から取得する
  // （グローバル event ではなく引数 e を参照する）
  var dt = e && e.dataTransfer;
  if (!dt || !dt.files) return;
  // TODO: 必要に応じてドロップされたファイルの取り込み処理を実装する
});

// 初期整形。外部画像/バナーの読み込み(window.onload)は待たない。
// このファイルは async、jscompCM(app.js)/js_beautify(beautify.min.js)は defer のため、
// まだ読み込まれていないことがある。未定義なら window.load 後に再試行して確実に実行する。
function initMklet() {
  if (typeof jscompCM !== "function" || typeof js_beautify !== "function") {
    window.addEventListener("load", initMklet, { once: true });
    return;
  }
  jscompCM();
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMklet);
} else {
  initMklet();
}
