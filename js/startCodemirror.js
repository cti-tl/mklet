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

// 外部画像やバナーの読み込み完了(window.onload)を待つと、ブラウザ/OSの混在コンテンツ
// 制御や読み込み待ちの差で初期化が遅れる/走らないことがある。
// DOM が使える時点(=defer の beautify/app.js 実行後)で確実に初期化する。
function initMklet() {
  jscompCM();
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMklet);
} else {
  initMklet();
}
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
