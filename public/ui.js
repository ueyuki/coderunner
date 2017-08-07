var aceEditor = ace.edit("source_code")

//aceEditorの設定
aceEditor.setOptions({
  enableBasicAutocompletion: true,
  enableLiveAutocompletion: true,
  enableSnippets: true,
});

//Ctrl-Enterでrun_buttonが押された判定に
$("#run_button").on("click", function(event){
  runCode();
});
aceEditor.commands.addCommand({
  bindKey: {win: "Ctrl-Enter", mac: "Ctrl-Enter"},
  exec: runCode,
});

//言語ごとのシンタックスの設定
function setEditorLanguage(language)
{
  var languageToMode = {
    ruby: "ruby",
    python: "python",
    c: "c_cpp",
  };
  var mode = languageToMode[language];
  aceEditor.getSession().setMode("ace/mode/" + mode);
}
$("#language").val("ruby");
setEditorLanguage("ruby");
$("#language").on("change", function(event){
  setEditorLanguage(this.value);
})
