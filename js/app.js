// コピー元の改行コード・文字コードの差による不具合を防ぐための入力正規化。
//  - 先頭BOM(U+FEFF)を除去
//  - 改行コードを LF に統一(CRLF / CR / 行区切りU+2028 / 段落区切りU+2029)
//  - タブ・改行以外の制御文字とゼロ幅文字(Webコピー等で混入)を除去
//  - Unicode正規化(NFC)で結合文字・表現ゆれ(NFD等)を吸収
// ※ 全角スペース(U+3000)やNBSP(U+00A0)は文字列リテラル内で意味を持ち得るため
//    ここでは触らず、リンク生成時(mkLink)の空白畳み込みに委ねる。
// ※ 制御文字はソースに直書きせず charCodeAt / fromCharCode で判定する。
function normalizeSource(text) {
  if (text == null) return "";
  let s = String(text);
  // 先頭BOM(U+FEFF)を除去
  if (s.charCodeAt(0) === 0xfeff) {
    s = s.slice(1);
  }
  // 改行コードを LF に統一(CRLF / CR -> LF)
  s = s.replace(/\r\n?/g, "\n");
  // 行区切り(U+2028) / 段落区切り(U+2029) -> LF
  s = s.replace(new RegExp("[" + String.fromCharCode(0x2028, 0x2029) + "]", "g"), "\n");
  // タブ(9)・改行(10)以外の制御文字・DEL(127)・ゼロ幅文字・BOMを1文字ずつ除去
  const dropCodes = { 0x200b: 1, 0x200c: 1, 0x200d: 1, 0x2060: 1, 0xfeff: 1 };
  s = s.replace(/[\s\S]/g, function (ch) {
    const c = ch.charCodeAt(0);
    if (c === 9 || c === 10) return ch; // タブ・改行は残す
    if (c < 32 || c === 127) return ""; // C0制御 + DEL
    if (dropCodes[c]) return ""; // ゼロ幅 / word joiner / BOM
    return ch;
  });
  try {
    s = s.normalize("NFC");
  } catch (err) {
    // String.prototype.normalize 非対応の古い環境では正規化をスキップ
  }
  return s;
}

function jscompCM(ele=null) {
  const tn = document.querySelector("#title_name");
  let doc = editor.getDoc();
  const e = document.querySelector("#code");
  let rawCode = doc.getValue();
  let decoded;
  try {
    decoded = decodeURI(rawCode);
  } catch (err) {
    // コード本文に単独の % など不正なエスケープが含まれる場合はそのまま扱う
    decoded = rawCode;
  }
  // 改行コード・文字コード差を正規化してから整形する
  let normalized = normalizeSource(decoded);
  doc.setValue(
    js_beautify(normalized, {
      indent_size: 2,
    })
  );
  editor.clearHistory();
  let code = doc.getValue();
  let data = {
   title:null,
    code:null,
  };
  if(!ele){
    data = getTitle(tn.value,code);
    tn.value = data['title'];
  }else{
    data = getTitle(tn.value,code,true);
  }
  doc.setValue(data['code']);
  mkLink(data['title'], data['code']);
  sampleReset();
}

function change() {
  const tn = document.querySelector("#title_name");
  const e = document.querySelector("#code");
  mkLink(tn.value, e.value);
}

// 入力中にボタン(リンク)だけを即時更新する軽量処理。
// setValue を呼ばないため整形・カーソル移動は起こさず、blur を待たずに反映できる。
function refreshLink() {
  if (typeof editor === "undefined") return;
  const tn = document.querySelector("#title_name");
  // 改行コード・文字コード差を吸収してからリンク化する
  let code = normalizeSource(editor.getDoc().getValue());
  // flg=true: 入力中のタイトルを優先し、エディタ本文は書き換えない
  let data = getTitle(tn.value, code, true);
  mkLink(data["title"], data["code"]);
}

function getTitle(title,code,flg=false){
  if(code){
  let result = /\/\*__mklet_title:(.*?)__\*\//.exec(code);
  if(result){
    if(title !== result[1]){
      title = flg?title:result[1];
      code = code.replace(result[0],'/*__mklet_title:' + title + '__*/');
    }
  }else{
    code = code + '/*__mklet_title:' + title + '__*/';
  }
  }
  return {
   title:title,
    code:code,
  };
}

function mkLink(title, url) {
  const bk = document.querySelector("#bk");
  let t = url.replace(/\s+/g, " ");
  t = t.replace(/^ ?(\S.*)/, "$1").replace(/(.*\S) ?$/, "$1");
  t = t.indexOf("javascript:") < 0 ? "javascript:" + t : t;
  // t = t.replace(/\"/g, "\\x22");
  t = t.replace(/(\W) /g, "$1").replace(/(\w) (\W)/g, "$1$2");
  //	link.href = t;
  //	count.innerHTML = ' ('+ t.length + ' chars)';
  bk.href = t;
  bk.innerHTML = title;
}
function sampleReset() {
  document.getElementById("sample").innerHTML = "";
}
