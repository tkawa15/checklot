var circleCount = 0;
var random = 0;
var circleMaxX=[];
var circleMaxY=[];
var circleMinX=[];
var circleMinY=[];
var maxX=0;
var maxY=0;
var minX=1000;
var minY=1000;
var startX = 0;
var startY = 0;

var canvas = document.getElementById("main-canvas");
var choiceBtn = document.getElementById('btn-choice');
var c = canvas.getContext("2d");
var w = 450;
var h = 400;
var drawing = false;
var oldPosX;
var oldPosY;
var choiceRectWeight = 3;

//画像関係の変数
var file = document.getElementById('input-image');
var uploadImgSrc;
var image;
var reader;
var exifnum = 1;

var playDrum= document.getElementById('sound-drum');
var playCymbal= document.getElementById('sound-cymbal');

var clearButton = document.getElementById('btn-clear');
var decideButton = document.getElementById('btn-decide');

var infoButton = document.getElementById('btn-info');
var closeButton = document.getElementById('btn-close');

window.addEventListener("load", function () {
      //スクロール禁止と復帰
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.removeEventListener('touchmove', handleTouchMove, { passive: false });

      //ボタン押せなくする
      $("#btn-clear").prop("disabled", true);
      $("#btn-clear").css('background-color', '#ddd');
      $("#btn-choice").prop("disabled", true);
      $("#btn-choice").css('background-color', '#ddd');

      // CanvasとContextを初期化する
      canvas.width = w;
      canvas.height = h;
      c.strokeStyle = "red";
      c.lineWidth = 5;
      c.lineJoin = "round";
      c.lineCap = "round";

      //絵を書くもろもろ
      canvas.addEventListener('touchstart', startDraw, false);
      canvas.addEventListener('touchstart', function (e) {
    　　　　e.preventDefault();
      },  { passive: false });
      canvas.addEventListener('touchmove', Draw, false);
      canvas.addEventListener('touchend', endDraw, false);

      //PC用
      canvas.addEventListener('mousedown', startDraw, false);
      canvas.addEventListener('mousedown', function (e) {
    　　　　e.preventDefault();
      },  { passive: false });
      canvas.addEventListener('mousemove', Draw, false);
      canvas.addEventListener('mouseup', endDraw, false);

      file.addEventListener('change', fileload, false);
      //画面の切り替え
      file.addEventListener('change', selectFile, false);

      choiceBtn.addEventListener('click', function(){
        playDrum.load();
        playCymbal.load();
        if(circleCount>0){
          var choiceFlow = Promise.resolve();
          choiceFlow.then(choiceLoad(image));
        }
      }, false);

      clearButton.addEventListener('click', clearChoices, false);
      decideButton.addEventListener('click', decideChoices, false);

      infoButton.addEventListener('click', toggleInfo, false);
      closeButton.addEventListener('click', toggleInfo, false);

      if (matchMedia('(min-width: 481px)').matches) {
        $(".blinking").html("CLICK");
      }
  }, false);

  var getDevice = (function(){
    var ua = navigator.userAgent;
    if(ua.indexOf('iPhone') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0){
        return 'sp';
    }else if(ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0){
        return 'tab';
    }else{
        return 'other';
    }
});

  //////////////////////////////////////////////////ここから関数たち//////////////////////////////////////////////////

  function handleTouchMove(event) {
      event.preventDefault();
  }

  if( getDevice == 'other' ){
    function startDraw(event){
        drawing = true;
        oldPosX = event.offsetX;
        oldPosY = event.offsetY;
        startX = oldPosX;
        startY = oldPosY;
    }
    function Draw(){
        var posX = event.offsetX
        var posY = event.offsetY;
        if (drawing) {
            c.beginPath();
            c.strokeStyle = "red";
            c.lineWidth = 5;
            c.moveTo(oldPosX, oldPosY);
            c.lineTo(posX, posY);
            c.stroke();
            c.closePath();
            if(!(startX == oldPosX && startY == oldPosY)){
                updateCirclePos(posX, posY)
            }
        }
        oldPosX = posX;
        oldPosY = posY;
    }
    function endDraw(){
        drawing = false;
        if(!(startX == oldPosX && startY == oldPosY)){
          circleMaxX.push(maxX);
          circleMaxY.push(maxY);
          circleMinX.push(minX);
          circleMinY.push(minY);
          //console.log(circleMaxX);
          maxX=0;
          maxY=0;
          minX=1000;
          minY=1000;
          circleCount++;
          if(circleCount>=1){
              $("#btn-clear").prop("disabled", false);
              $("#btn-clear").css('background-color', 'blue');
          }
          if(circleCount>=2){
              $("#btn-choice").prop("disabled", false);
              $("#btn-choice").css('background-color', 'red');
          }
        }
      }
  } else {
    function startDraw(event){
        drawing = true;
        oldPosX = event.changedTouches[0].pageX;
        oldPosY = event.changedTouches[0].pageY;
        startX = oldPosX;
        startY = oldPosY;
    }
    function Draw(){
        var posX = event.changedTouches[0].pageX;
        var posY = event.changedTouches[0].pageY;
        if (drawing) {
            c.beginPath();
            c.strokeStyle = "red";
            c.lineWidth = 5;
            c.moveTo(oldPosX, oldPosY);
            c.lineTo(posX, posY);
            c.stroke();
            c.closePath();
            if(!(startX == oldPosX && startY == oldPosY)){
                updateCirclePos(posX, posY)
            }
        }
        oldPosX = posX;
        oldPosY = posY;
    }
    function endDraw(){
        drawing = false;
        if(!(startX == oldPosX && startY == oldPosY)){
          circleMaxX.push(maxX);
          circleMaxY.push(maxY);
          circleMinX.push(minX);
          circleMinY.push(minY);
          //console.log(circleMaxX);
          maxX=0;
          maxY=0;
          minX=1000;
          minY=1000;
          circleCount++;
          if(circleCount>=1){
              $("#btn-clear").prop("disabled", false);
              $("#btn-clear").css('background-color', 'blue');
          }
          if(circleCount>=2){
              $("#btn-choice").prop("disabled", false);
              $("#btn-choice").css('background-color', 'red');
          }
        }
    }
  }
  function updateCirclePos(ux, uy){
      if(ux > maxX){
        maxX = ux;
      }
      if(uy > maxY){
        maxY  = uy;
      }
      if(ux < minX){
        minX  = ux;
      }
      if(uy < minY){
        minY = uy;
      }
  }

  function fileload() {
          if ( ! file.files[0] ){ return; }
          image = new Image();
          image.src = URL.createObjectURL(file.files[0]);
          reader  = new FileReader();
          if (file.files[0]) { reader.readAsDataURL(file.files[0]); }
          reader.onloadend = function () {
              var inputbase64data = reader.result; // 入力したいbase64データ
              //console.log(getOrientation(inputbase64data));
              exifnum = getOrientation(inputbase64data);
          };
          image.onload = function() {
            circleCount = 0;
            circleMaxX=[];
            circleMaxY=[];
            circleMinX=[];
            circleMinY=[];

            //180度、時計周りに90度、反時計周りに90度
            if(exifnum == 3){
              drawExif3(image);
            } else if(exifnum == 6){
              drawExif6(image);
            } else if(exifnum == 8){
              drawExif8(image);
            } else {
              drawExifnormal(image);
            }
          }
    }

    //ドラムロール的な
    function choiceLoad(img){
      var count = 0;
      var choiceNum = circleCount;
      playDrum.play();
      var roadTime = setInterval(function(){
             var drumNum = count%circleCount;
                //console.log(drumNum);
                if(exifnum == 3){
                  drawExif3(img);
                  choiceVerticalImg(drumNum);
                } else if(exifnum == 6){
                  drawExif6(img);
                  choiceHorizontalImg(drumNum);
                } else if(exifnum == 8){
                  drawExif8(img);
                  choiceHorizontalImg(drumNum);
                } else {
                  drawExifnormal(img);
                  choiceVerticalImg(drumNum);
                }
            count++;
              if(count > 40){
                playDrum.pause();
                playDrum.currentTime = 0;
                playCymbal.play();
                //sourceC.stop(0);
                choiceRandom(img);
                clearInterval(roadTime);　//idをclearIntervalで指定している
              }
              //60msごとにrequestAnimationFrame()で更新
      }, 60);
    }

    //抽選をする
    function choiceRandom(img){
          random = Math.floor( Math.random() * circleCount ) ;
          //console.log(random);
          var circleWidth = circleMaxX[random] - circleMinX[random];
          var circleHeight = circleMaxY[random] - circleMinY[random];
          //↓は、対象のところの画像だけを抜き出す
          //c.clearRect(0, 0, w, h);
          //c.drawImage(image, circleMinX[random], circleMinY[random], circleWidth, circleHeight, 0, 0, circleWidth, circleHeight);
          //対象のところ以外を黒く塗りつぶす
          if(exifnum == 3){
            drawExif3(img);
            choiceVerticalImg(random);
          } else if(exifnum == 6){
            drawExif6(img);
            choiceHorizontalImg(random);
          } else if(exifnum == 8){
            drawExif8(img);
            choiceHorizontalImg(random);
          } else {
            drawExifnormal(img);
            choiceVerticalImg(random);
          }
          choiceOne(random);
    }

    function choiceOne(numR){
          c.beginPath();
          c.strokeStyle = "red";
          c.lineWidth = choiceRectWeight;
          c.moveTo(circleMinX[numR], circleMinY[numR]);
          c.lineTo(circleMinX[numR], circleMaxY[numR]);
          c.stroke();
          c.closePath();
          c.beginPath();
          c.strokeStyle = "red";
          c.lineWidth = choiceRectWeight;
          c.moveTo(circleMinX[numR], circleMaxY[numR]);
          c.lineTo(circleMaxX[numR], circleMaxY[numR]);
          c.stroke();
          c.closePath();
          c.beginPath();
          c.strokeStyle = "red";
          c.lineWidth = choiceRectWeight;
          c.moveTo(circleMaxX[numR], circleMaxY[numR]);
          c.lineTo(circleMaxX[numR], circleMinY[numR]);
          c.stroke();
          c.closePath();
          c.beginPath();
          c.strokeStyle = "red";
          c.lineWidth = choiceRectWeight;
          c.moveTo(circleMaxX[numR], circleMinY[numR]);
          c.lineTo(circleMinX[numR], circleMinY[numR]);
          c.stroke();
          c.closePath();
          document.getElementById("btn-choice").style.display = "none";
          document.getElementById("btn-clear").style.display = "none";
          document.getElementById("btn-decide").style.display = "block";
    }

    //exif情報がそれぞれのときの、画像を表示し直す
    function drawExif3(img){
        w = screen.width;
        h = Math.ceil((w/img.naturalWidth)*img.naturalHeight);
        canvas.width = w;
        canvas.height = h;
        c.rotate(Math.PI);
        c.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, -w, -h, w, h);
        c.rotate(-Math.PI);
    }
    function drawExif6(img){
        h = screen.width;
        w = Math.ceil((h/img.naturalHeight)*img.naturalWidth);
        canvas.width = h;
        canvas.height = w;
        c.rotate(Math.PI * 0.5);
        c.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, -h, w, h);
        c.rotate(-Math.PI * 0.5);
    }
    function drawExif8(img){
        h = screen.width;
        w = Math.ceil((h/img.naturalHeight)*img.naturalWidth);
        canvas.width = h;
        canvas.height = w;
        c.rotate(-Math.PI * 0.5);
        c.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, -w, 0, w, h);
        c.rotate(Math.PI * 0.5);
    }
    function drawExifnormal(img){
        w = screen.width;
        h = Math.ceil((w/img.naturalWidth)*img.naturalHeight);
        canvas.width = w;
        canvas.height = h;
        c.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, w, h);
    }

    //抽選結果の表示、縦or横
    function choiceVerticalImg(numR){
        c.beginPath();
        c.fillStyle = "rgba(" + [0, 0, 0, 0.5] + ")";
        c.fillRect(0, 0, circleMinX[numR], h);
        c.fillRect(circleMinX[numR], 0, circleMaxX[numR]-circleMinX[numR], circleMinY[numR]);
        c.fillRect(circleMaxX[numR], 0, w-circleMaxX[numR], h);
        c.fillRect(circleMinX[numR], circleMaxY[numR], circleMaxX[numR]-circleMinX[numR], h-circleMaxY[numR]);
        c.closePath();
    }
    function choiceHorizontalImg(numR){
        c.beginPath();
        c.fillStyle = "rgba(" + [0, 0, 0, 0.5] + ")";
        c.lineWidth = 0;
        c.fillRect(0, 0, circleMinX[numR], w);
        c.fillRect(circleMinX[numR], 0, circleMaxX[numR]-circleMinX[numR], circleMinY[numR]);
        c.fillRect(circleMaxX[numR], 0, h-circleMaxX[numR], w);
        c.fillRect(circleMinX[numR], circleMaxY[numR], circleMaxX[numR]-circleMinX[numR], w-circleMaxY[numR]);
        c.closePath();
    }

    function selectFile() {
        document.getElementById("main-canvas").style.display = "block";
        document.getElementById("input-image").style.display = "none";
        document.getElementById("home").style.display = "none";
        document.getElementById("btn-choice").style.display = "block";
        document.getElementById("btn-clear").style.display = "block";
    }

    function clearChoices(){
        circleCount = 0;
        circleMaxX=[];
        circleMaxY=[];
        circleMinX=[];
        circleMinY=[];

        if(exifnum == 3){
          drawExif3(image);
        } else if(exifnum == 6){
          drawExif6(image);
        } else if(exifnum == 8){
          drawExif8(image);
        } else {
          drawExifnormal(image);
        }

        $("#btn-clear").prop("disabled", true);
        $("#btn-clear").css('background-color', '#ddd');
        $("#btn-choice").prop("disabled", true);
        $("#btn-choice").css('background-color', '#ddd');
    }

    function decideChoices(){
        location.reload();
    }

    function toggleInfo(){
      $("#info-back").animate( { opacity: 'toggle',}, { duration: 500, easing: 'swing', } );
    }

    function getOrientation(imgDataURL){
      var byteString = atob(imgDataURL.split(',')[1]);
      var orientaion = byteStringToOrientation(byteString);
      return orientaion;
    }

    function byteStringToOrientation(img){
        var head = 0;
        var orientation;
        while (1){
            if (img.charCodeAt(head) == 255 & img.charCodeAt(head + 1) == 218) {break;}
            if (img.charCodeAt(head) == 255 & img.charCodeAt(head + 1) == 216) {
                head += 2;
            }
            else {
                var length = img.charCodeAt(head + 2) * 256 + img.charCodeAt(head + 3);
                var endPoint = head + length + 2;
                if (img.charCodeAt(head) == 255 & img.charCodeAt(head + 1) == 225) {
                    var segment = img.slice(head, endPoint);
                    var bigEndian = segment.charCodeAt(10) == 77;
                    var count;
                    if (bigEndian) {
                        count = segment.charCodeAt(18) * 256 + segment.charCodeAt(19);
                    } else {
                        count = segment.charCodeAt(18) + segment.charCodeAt(19) * 256;
                    }
                    for (i=0; i < count; i++){
                        var field = segment.slice(20 + 12 * i, 32 + 12 * i);
                        if ((bigEndian && field.charCodeAt(1) == 18) || (!bigEndian && field.charCodeAt(0) == 18)) {
                            orientation = bigEndian ? field.charCodeAt(9) : field.charCodeAt(8);
                        }
                    }
                    break;
                }
                head = endPoint;
            }
            if (head > img.length){break;}
        }
        return orientation;
    }
