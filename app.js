// モジュールの読み込み
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var child_process = require('child_process');
var fs = require('fs');

// ミドルウェアとurlエンコードの設定
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));

// '/api/run'APIの設定
app.post('/api/run', function(req, res) {

  // 入力を格納
  var language = req.body.language;
  var source_code = req.body.source_code;
  var input = req.body.input;

  // 言語ごとに処理を変える
  var filename, execCmd;
  if (language == 'ruby') {
    filename = 'Main.rb';
    execCmd = 'ruby Main.rb';
  }
  else if (language == 'python') {
    filename = 'Main.py';
    execCmd = 'python Main.py'
  }
  else if (language == 'c') {
    filename = 'Main.c';
    execCmd = 'cc -Wall -o Main Main.c && ./Main';
  }

  // コンテナの作成と設定
  var dockerCmd = 
    'docker create -i ' +
    '--net none ' +
    '--cpuset-cpus 0 ' +
    '--memory 512m --memory-swap 512m ' +
    '--ulimit nproc=10:10 ' +
    '--ulimit fsize=1000000 ' +
    '-w /workspace ' +
    'ubuntu-dev ' +
    '/usr/bin/time -q -f "%e" -o /time.txt ' +
    'timeout 3 ' +
    'su nobody -s /bin/bash -c "' +
    execCmd +
    '"';

  console.log("Running: " + dockerCmd);
  var containerId = child_process.execSync(dockerCmd).toString().substr(0, 12);
  console.log("ContainerId: " + containerId);

  // コードをコンテナにコピー
  child_process.execSync('rm -rf /tmp/workspace && mkdir /tmp/workspace && chmod 777 /tmp/workspace');
  fs.writeFileSync('/tmp/workspace/' + filename, source_code);
  dockerCmd = 'docker cp /tmp/workspace ' + containerId + ':/';
  console.log("Running: " + dockerCmd);
  child_process.execSync(dockerCmd);

  // コンテナの実行
  dockerCmd = "docker start -i " + containerId;
  console.log("Running: " + dockerCmd);
  var child = child_process.exec(dockerCmd, {}, function(error, stdout, stderr){

    // 実行時間のコピー
    dockerCmd = "docker cp " + containerId + ":/time.txt /tmp/";
    console.log("Running: " + dockerCmd);
    child_process.execSync(dockerCmd);
    var time = fs.readFileSync("/tmp/time.txt").toString();

    // コンテナの削除
    dockerCmd = "docker rm " + containerId;
    console.log("Running: " + dockerCmd);
    child_process.execSync(dockerCmd);

    console.log('Result: ', error, stdout, stderr);
    res.send({
      stdout: stdout,
      stderr: stderr,
      exit_code: error && error.code || 0,
      time: time
    });
  });
  child.stdin.write(input);
  child.stdin.end();
});

app.listen(3000, function() {
  console.log('Listening on port 3000');
});
