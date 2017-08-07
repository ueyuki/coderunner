function runCode()
{
  $("run_button").text("実行中...").prop("disabled", true);

  var language = $("#language").val();
  var source_code = aceEditor.getValue();
  var input = $("#input").val();

  $.ajax({
    url: "api/run",
    method: "POST",
    data: {
      language: language,
      source_code: source_code,
      input: input,
    },
  }).done(function(result){
    $("#stdout").text(result.stdout);
    $("#stderr").text(result.stderr);
    $("#time").text(result.time);
    $("#exit_code").text(result.exit_code);
    $("#run_button").text("実行(Ctrl-Enter)").prop("disabled", false);
  }).fail(function(error){
    alert("Request Failed:" + error);
    $("#run_button").text("実行(Ctrl-Enter)").prop("disabled", false);
  });
}
