$(function() {
  var socket = io.connect('http://172.16.48.234:8080');
  $('.fixed-action-btn').openFAB();
  $('.fixed-action-btn').closeFAB();


  $('.modal-trigger').leanModal();


  $('select').material_select();


  $('.tooltipped').tooltip({delay: 5});


  var imgWidth, imgHeight,
      wRatio, hRatio,
      photo = $('#photo'),
      originalCanvas = null,
      filters = $('#filters li a'),
      menu = $('#slide-out li a'),
      firstCanvas,
      clone,
      jcrop_api;


  menu.click(function(){
    $(this).parent().siblings().removeClass('active');
    $(this).parent().addClass('active');

    menu.each(function(){
      $($(this).attr('href')).fadeOut();
    });

    var id = $(this).attr('href');
    $(id).fadeIn();

    if (id == "#cropContainer"){  
      $('canvas').Jcrop({
        onChange:   showCoords,
        onSelect:   showCoords,
        onRelease:  clearCoords
      },function(){
        jcrop_api = this;
      });

      makeCanvasCenter(true);
    }
    else{
      $('.jcrop-holder').remove();
      photo.find('canvas').remove().end().append(originalCanvas);
      makeCanvasCenter(false);
      showDownload(originalCanvas[0]);
    }
  });


  $('#filterContainer, #stickerContainer, #fContainer').find('ul').on('mousewheel',function(e, delta){
    this.scrollLeft -= (delta * 50);
    e.preventDefault();
  });


  $('#addBtn').click(function(e){
    e.preventDefault();

    originalCanvas = cloneCanvas(clone);
    photo.find('canvas').remove().end().append(originalCanvas);
    makeCanvasCenter(false);
    showDownload(originalCanvas[0]);
    socket.emit('saveImage');
    Materialize.toast('Your image is saved...', 2000);
  });

  socket.on('saveImageClient', function(){
    originalCanvas = cloneCanvas(clone);
    photo.find('canvas').remove().end().append(originalCanvas);
    makeCanvasCenter(false);
    showDownload(originalCanvas[0]);
    Materialize.toast('Your image is saved...', 2000);
  });

  $('#resetBtn').click(function(e){
    e.preventDefault();

    originalCanvas = cloneCanvas(firstCanvas);
    photo.find('canvas').remove().end().append(originalCanvas);
    makeCanvasCenter(false);
    showDownload(originalCanvas[0]);


    $('#filters li a').removeClass('active');
    $('#filters li a').first().addClass('active');

    $('#brightness').val(0);
    $('#hue').val(0);
    $('#contrast').val(0);
    $('#vibrance').val(0);
    $('#sepia').val(0);
    $('#sharpen').val(0);
    $('#saturation').val(0);
    $('#exposure').val(0);

    $('#blur').val(0);
    $('#blurLight').val(0);

    Materialize.toast('Your image is reseted...', 2000);
  });


  photo.fileReaderJS({
    on:{
      load: function(e, file){
        var img = $('<img>').appendTo(photo);
        console.log(photo);

        photo.find('canvas').remove();
        filters.removeClass('active');


        img.load(function() {

          imgWidth  = this.width;
          imgHeight = this.height;


          originalCanvas = $('<canvas>');
          var originalContext = originalCanvas[0].getContext('2d');


          originalCanvas.attr({
            width: imgWidth,
            height: imgHeight,
            id: "canvasImage"
          });


          originalContext.drawImage(this, 0, 0, imgWidth, imgHeight);
          firstCanvas = cloneCanvas(originalCanvas);
          socket.emit("imageUploaded" , {image : this.currentSrc, width : imgWidth , height : imgHeight});

          img.remove();


          filters.first().click();


          wRatio = imgWidth/$('canvas').width();
          hRatio = imgHeight/$('canvas').height();
        });

        img.attr('src', e.target.result);
      },
      beforestart: function(file){
        return /^image/.test(file.type);
      }
    }
  });
  
  socket.on("draw" , function(data){
            var image = new Image();
            image.src = data.d.image;
            image.onload = function(){
              imgWidth = data.d.width;
              imgHeight = data.d.height;
              originalCanvas = $('<canvas>');
              var originalContext = originalCanvas[0].getContext('2d');
              originalCanvas.attr({
                width: imgWidth,
                height: imgHeight,
                id: "canvasImage"
              });
                originalContext.drawImage(image, 0, 0, imgWidth, imgHeight);
                firstCanvas = cloneCanvas(originalCanvas);
                setTimeout(function(){
                  filters.removeClass("active");
                  filters.first().click();
                },500);

              wRatio = imgWidth/$('canvas').width();
              hRatio = imgHeight/$('canvas').height();
            };
  });

  filters.click(function(e){
    e.preventDefault();

    var f = $(this);

    if(f.is('.active')){
      return false;
    }

    filters.removeClass('active');
    f.addClass('active');

    clone = cloneCanvas(originalCanvas);
    photo.find('canvas').remove().end().append(clone);

    var effect = $.trim(f[0].id);
    Caman(clone[0], function () {

     
      if( effect in this){

        $('.preloader-wrapper ').addClass('active');

        this[effect]();
        this.render(function(){
          $('.preloader-wrapper ').removeClass('active');
        });
      }

      showDownload(clone[0]);

      $('#resetBtn').fadeIn();
      $('#addBtn').fadeIn();
    });
    socket.emit("filter", {filter : f[0].id});
    makeCanvasCenter(false);
  });

  socket.on('addFilter', function(data){
    console.dir(data);
    var f = $("#" + data.filter);

    if(f.is('.active')){
      return false;
    }

    filters.removeClass('active');
    f.addClass('active');

    clone = cloneCanvas(originalCanvas);
    photo.find('canvas').remove().end().append(clone);

    var effect = $.trim(f[0].id);
    Caman(clone[0], function () {

     
      if( effect in this){

        $('.preloader-wrapper ').addClass('active');

        this[effect]();
        this.render(function(){
          $('.preloader-wrapper ').removeClass('active');
        });
      }

      showDownload(clone[0]);

      $('#resetBtn').fadeIn();
      $('#addBtn').fadeIn();
    });
    makeCanvasCenter(false);
  })

  $('#stickers li a').click(function(){
    $('#stickers li a').removeClass('active');
    $(this).addClass('active');
  });

  $('#stickerBtn').click(function(e){
    e.preventDefault();
    
    var t = $('#stickerTop').val(),
        l = $('#stickerLeft').val();

    clone = cloneCanvas(originalCanvas);

    $('.jcrop-holder').remove();
    photo.find('canvas').remove().end().append(clone);

    clone[0].getContext('2d').drawImage(document.getElementById('img_' + $('#stickers li a.active').attr('id')), l, t);

    makeCanvasCenter(false);
    showDownload(clone[0]);
  });

  $('#addImageBtn').click(function(e){
    e.preventDefault();

    var t = $('#addedImageTop').val(),
        l = $('#addedImageLeft').val();

    clone = cloneCanvas(originalCanvas);

    $('.jcrop-holder').remove();
    photo.find('canvas').remove().end().append(clone);

    clone[0].getContext('2d').drawImage(document.getElementById('imgUpload'), l, t);

    makeCanvasCenter(false);
    showDownload(clone[0]);
  });

  $('#framers li a').click(function(e){
    e.preventDefault();

    clone = cloneCanvas(originalCanvas);

    var w = $('canvas').width,
        h = $('canvas').height,
        f = $(this);

    if(f.is('.active')){
      return false;
    }

    $('#framers li a').removeClass('active');
    f.addClass('active');

    var id = 'img_' + $('#framers li a.active').attr('id');
    var wFrame = $('#'+id).width();
    var hFrame = $('#'+id).height();

    clone[0].getContext('2d').drawImage(document.getElementById(id), 0, 0, wFrame, hFrame, 0, 0, imgWidth, imgHeight);

    $('.jcrop-holder').remove();
    photo.find('canvas').remove().end().append(clone);

    makeCanvasCenter(false);
    showDownload(clone[0]);
  });
  
  
  makeCanvasCenter = function(isJcrop){
    if(isJcrop){
      $('#photo .jcrop-holder').css({
        marginTop: -$('canvas').height()/2, 
        marginLeft: -$('canvas').width()/2
      });
    }
    else{
      $('#photo canvas').css({
        top: "50%",
        left: "50%",
        marginTop: -$('canvas').height()/2, 
        marginLeft: -$('canvas').width()/2
      });
    }
  }

  
  showDownload = function(canvas){
    $('.imageAction').fadeIn();

    $('#downloadImage').click(function(){
      var url = canvas.toDataURL();
      $('#downloadImage').attr('href', url);
    });
  }

  
  $('#advancedContainer input[type=range]').change(function(){

    var brightness = parseInt($('#brightness').val());
    var hue = parseInt($('#hue').val());
    var contrast = parseInt($('#contrast').val());
    var vibrance = parseInt($('#vibrance').val());
    var sepia = parseInt($('#sepia').val());
    var sharpen = parseInt($('#sharpen').val());
    var saturation = parseInt($('#saturation').val());
    var exposure = parseInt($('#exposure').val());

    clone = cloneCanvas(originalCanvas);
    photo.find('canvas').remove().end().append(clone);

    Caman(clone[0], function () {
      $('.preloader-wrapper ').addClass('active');

      this.brightness(brightness).hue(hue).contrast(contrast).vibrance(vibrance).sepia(sepia).sharpen(sharpen).saturation(saturation).exposure(exposure);  
      this.render(function(){
        $('.preloader-wrapper ').removeClass('active');
      });
    });

    makeCanvasCenter(false);
    showDownload(clone[0]);
    var data = {
        brightness : brightness,
        hue : hue,
        contrast : contrast,
        vibrance : vibrance,
        sepia : sepia,
        sharpen : sharpen,
        saturation : saturation,
        exposure : exposure
    }
    socket.emit('advance' , data);
  });
  socket.on('advanceResponse' , function(data){
    var brightness = data.brightness;
    var hue = data.hue;
    var contrast = data.contrast;
    var vibrance = data.vibrance;
    var sepia = data.sepia;
    var sharpen = data.sharpen;
    var saturation = data.saturation;
    var exposure = data.exposure;

    clone = cloneCanvas(originalCanvas);
    photo.find('canvas').remove().end().append(clone);

    Caman(clone[0], function () {
      $('.preloader-wrapper ').addClass('active');

      this.brightness(brightness).hue(hue).contrast(contrast).vibrance(vibrance).sepia(sepia).sharpen(sharpen).saturation(saturation).exposure(exposure);  
      this.render(function(){
        $('.preloader-wrapper ').removeClass('active');
      });
    });

    makeCanvasCenter(false);
    showDownload(clone[0]);
  });
  
  $('#blurContainer input[type=range]').change(function(){

    var brightness = parseInt($('#blurLight').val());
    var blur = parseInt($('#blur').val());

    clone = cloneCanvas(originalCanvas);
    photo.find('canvas').remove().end().append(clone);

    Caman(clone[0], function () {
      $('.preloader-wrapper ').addClass('active');

      this.brightness(brightness).stackBlur(blur);
      this.render(function(){
        $('.preloader-wrapper ').removeClass('active');
      });
    });

    makeCanvasCenter(false);
    showDownload(clone[0]);
    socket.emit('blur' , {brightness : brightness, blur : blur});
  });

  socket.on('blurResponse' , function(data){
    var brightness = data.brightness;
    var blur = data.blur;
    console.log(data);
    clone = cloneCanvas(originalCanvas);
    photo.find('canvas').remove().end().append(clone);

    Caman(clone[0], function () {
      $('.preloader-wrapper ').addClass('active');

      this.brightness(brightness).stackBlur(blur);
      this.render(function(){
        $('.preloader-wrapper ').removeClass('active');
      });
    });

    makeCanvasCenter(false);
    showDownload(clone[0]);
  });

  $('#cropContainer input').change(function(){
    var x1 = $('#xCrop').val();
    var x2 = +$('#xCrop').val() + +$('#widthCrop').val();
    var y1 = $('#yCrop').val();
    var y2 = +$('#yCrop').val() + +$('#heightCrop').val();

    jcrop_api.setSelect([x1,y1,x2,y2]);
  });

  
  showCoords = function(c){
    $('#xCrop').val(c.x);
    $('#yCrop').val(c.y);
    $('#widthCrop').val(c.w);
    $('#heightCrop').val(c.h);
  };

  
  clearCoords = function(){
    $('#cropContainer input').val('');
  };

  
  $('#cropBtn').click(function(){
    var x = +$('#xCrop').val() * wRatio,
        y = +$('#yCrop').val() * hRatio,
        w = +$('#widthCrop').val() * wRatio,
        h = +$('#heightCrop').val() * hRatio;

    var newCanvas = cropImage(originalCanvas, x, y, w, h);

    imgWidth = w;
    imgHeight = h;

    $('.jcrop-holder').remove();
    photo.find('canvas').remove().end().append(newCanvas);

    $('canvas').Jcrop({
      onChange:   showCoords,
      onSelect:   showCoords,
      onRelease:  clearCoords
    },function(){
      jcrop_api = this;
    });

    makeCanvasCenter(true);
    showDownload(newCanvas[0]);
  });

  
  cropImage = function(srcCanvas, x, y, w, h){

  
    var newCanvas = $('<canvas>');
    var context = newCanvas[0].getContext('2d');

  
    var sourceImage = new Image();
    sourceImage.src = srcCanvas[0].toDataURL();

  
    newCanvas.attr({
      width: w,
      height: h,
      id: "canvasImage"
    });

  
    newCanvas[0].getContext('2d').drawImage(sourceImage, x, y, w, h, 0, 0, w, h);

    return newCanvas;
  }

  
   cloneCanvas = function(oldCanvas) {

  
    var newCanvas = $('<canvas>');
    var context = newCanvas[0].getContext('2d');

  
    var sourceImage = new Image();
    sourceImage.src = oldCanvas[0].toDataURL();

  
    newCanvas.attr({
      width: sourceImage.width,
      height: sourceImage.height,
      id: "canvasImage"
    });

  
    newCanvas[0].getContext('2d').drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height);

    return newCanvas;
  }

  
  $('#textBtn').click(function(){

    clone = cloneCanvas(originalCanvas);

    var color = $('#textColor').val(),
        size = +$('#textSize option:selected').val(),
        xStart = +$('#textLeft').val() * wRatio,
        yStart = +$('#textTop').val() + size,
        font = $('#textFont option:selected').val(),
        text = $('#textContent').val(),
        fString = '';

    photo.find('canvas').remove().end().append(clone);

    var ctx = clone[0].getContext('2d');    
    ctx.fillStyle = color;

  
    if($('#textBold').parent().hasClass('active')){
      fString += 'bold ';
    }

    if($('#textItalic').parent().hasClass('active')){
      fString += 'italic ';
    }

    fString += size + 'px ' + font

    ctx.font = fString;
    ctx.fillText(text, xStart, yStart);

    makeCanvasCenter(false);
    showDownload(clone[0]);
  });

  
  $('#textContainer .biu li a').click(function(e){
    e.preventDefault();
    
    $(this).parent().toggleClass('active');
  });

  
  $('#printImage').click(function(){
    var dataUrl = document.getElementById('canvasImage').toDataURL();
    var windowContent = '<!DOCTYPE html>';
    windowContent += '<html>'
    windowContent += '<head><title>Printing image</title></head>';
    windowContent += '<body style="margin: 0;">'
    windowContent += '<img src="' + dataUrl + '" style="max-width: 100%;">';
    windowContent += '</body>';
    windowContent += '</html>';
    var printWin = window.open('','','width=1000, height=600');
    printWin.document.open();
    printWin.document.write(windowContent);
    printWin.document.close();
    printWin.focus();
    printWin.print();
    printWin.close();
  });

  
  calPrice = function(){
    var area, quality, paperSize, price;

    if($('input[name=imageSize]:checked').val() == 'original'){
      area = imgWidth * imgHeight;
    } else{
      area = $('#printWidth').val() * $('#printHeight').val();
    }

    quality = $("#printQuality option:selected").val();

    paperSize = $("#paperSize option:selected").val();

    price = (area*quality*paperSize*(0.01/10000)).toFixed(1);

    return price;
  }

  $('#printNext').click(function(){
    var price = calPrice();

    $('#modal2 .modal-content .price').html('');
    $('#modal2 .modal-content .price').append('Your Payment: <span>'+ price +'$</span>');
  });

  $('#optional').click(function(){
    $('#printSizeInput').fadeIn();
  });

  $('#original').click(function(){
    $('#printSizeInput').fadeOut();
  });  

  if (annyang) {
  // Let's define our first command. First the text we expect, and then the function it should call
  var commands = {
    'hello' : function(){
      alert("Hello World");
    },
    'add filter :type' : addFilter,
    'show frames' : showFrames,
    'make image blurry by :amount' : makeBlur,
    'reset image' : resetImage,
    'save image' : saveImage,
    'change brightness :amount' : changeBrightness,
    'change contrast :amount' : changeContrast,
    'change sepia :amount' : changeSepia,
    'change saturation :amount' : changeSepia,
    'change hue :amount' : changeHue,
    'change vibrance :amount' : changeVibrance,
    'change sharpness :amount' : changeSharpness,
    'change exposure :amount' : changeExposure,
    'crop image from :X and :Y with width :W and height :H' : cropImage,
    '*text' : function(text){
      console.log(text);
    },
  };

  // Add our commands to annyang
  annyang.addCommands(commands);

  // Start listening. You can call this here, or attach this call to an event, button, etc.
  annyang.start();
  }
      
  function addFilter(type){
      console.log(type);
      var f = $("#" + type);
      if(f.is('.active')){
        return false;
      }

      filters.removeClass('active');
      f.addClass('active');

      clone = cloneCanvas(originalCanvas);
      photo.find('canvas').remove().end().append(clone);

      var effect = $.trim(f[0].id);
      Caman(clone[0], function () {

       
        if( effect in this){

          $('.preloader-wrapper ').addClass('active');

          this[effect]();
          this.render(function(){
            $('.preloader-wrapper ').removeClass('active');
          });
        }

        showDownload(clone[0]);

        $('#resetBtn').fadeIn();
        $('#addBtn').fadeIn();
      });

      makeCanvasCenter(false);
      socket.emit('addFilterVoice' , {type : type});
  }

  socket.on('addFilterVoiceResponse' , function(data){
      var f = $("#" + data.type);
      if(f.is('.active')){
        return false;
      }

      filters.removeClass('active');
      f.addClass('active');

      clone = cloneCanvas(originalCanvas);
      photo.find('canvas').remove().end().append(clone);

      var effect = $.trim(f[0].id);
      Caman(clone[0], function () {

       
        if( effect in this){

          $('.preloader-wrapper ').addClass('active');

          this[effect]();
          this.render(function(){
            $('.preloader-wrapper ').removeClass('active');
          });
        }

        showDownload(clone[0]);

        $('#resetBtn').fadeIn();
        $('#addBtn').fadeIn();
      });

      makeCanvasCenter(false);
  });
  function showFrames(){
    console.log("Show Frames");
    window.location.href = "#framingContainer";
  }

  function makeBlur(amount){
    console.log(amount);
    var blur = amount;
    $('#blur').val(amount);
    clone = cloneCanvas(originalCanvas);
    photo.find('canvas').remove().end().append(clone);

    Caman(clone[0], function () {
      $('.preloader-wrapper ').addClass('active');

      this.stackBlur(blur);
      this.render(function(){
        $('.preloader-wrapper ').removeClass('active');
      });
    });

    makeCanvasCenter(false);
    showDownload(clone[0]);
  }

  function saveImage(){
    originalCanvas = cloneCanvas(clone);
    photo.find('canvas').remove().end().append(originalCanvas);
    makeCanvasCenter(false);
    showDownload(originalCanvas[0]);

    Materialize.toast('Your image is saved...', 2000);
  }

  function resetImage(){
    originalCanvas = cloneCanvas(firstCanvas);
    photo.find('canvas').remove().end().append(originalCanvas);
    makeCanvasCenter(false);
    showDownload(originalCanvas[0]);


    $('#filters li a').removeClass('active');
    $('#filters li a').first().addClass('active');

    $('#brightness').val(0);
    $('#hue').val(0);
    $('#contrast').val(0);
    $('#vibrance').val(0);
    $('#sepia').val(0);
    $('#sharpen').val(0);
    $('#saturation').val(0);
    $('#exposure').val(0);

    $('#blur').val(0);
    $('#blurLight').val(0);

    Materialize.toast('Your image is reseted...', 2000);
  }

  function changeBrightness(amount){
    var brightness = parseInt(amount);
    $('#brightness').val(amount);

    clone = cloneCanvas(originalCanvas);
    photo.find('canvas').remove().end().append(clone);

    Caman(clone[0], function () {
      $('.preloader-wrapper ').addClass('active');

      this.brightness(brightness);  
      this.render(function(){
        $('.preloader-wrapper ').removeClass('active');
      });
    });

    makeCanvasCenter(false);
    showDownload(clone[0]);
  }

  function changeHue(amount){
    
    var hue = parseInt(amount);
    $('#hue').val(amount);

    clone = cloneCanvas(originalCanvas);
    photo.find('canvas').remove().end().append(clone);

    Caman(clone[0], function () {
      $('.preloader-wrapper ').addClass('active');

      this.hue(hue);  
      this.render(function(){
        $('.preloader-wrapper ').removeClass('active');
      });
    });

    makeCanvasCenter(false);
    showDownload(clone[0]);
  }
  function changeContrast(amount){
    var contrast = parseInt(amount);
    $('#contrast').val(amount);

    clone = cloneCanvas(originalCanvas);
    photo.find('canvas').remove().end().append(clone);

    Caman(clone[0], function () {
      $('.preloader-wrapper ').addClass('active');

      this.contrast(contrast);  
      this.render(function(){
        $('.preloader-wrapper ').removeClass('active');
      });
    });

    makeCanvasCenter(false);
    showDownload(clone[0]);
  }
  function changeVibrance(amount){
    var vibrance = parseInt(amount);
    $('#vibrance').val(amount);
    clone = cloneCanvas(originalCanvas);
    photo.find('canvas').remove().end().append(clone);

    Caman(clone[0], function () {
      $('.preloader-wrapper ').addClass('active');

      this.vibrance(vibrance);  
      this.render(function(){
        $('.preloader-wrapper ').removeClass('active');
      });
    });

    makeCanvasCenter(false);
    showDownload(clone[0]);
  }
  function changeSepia(amount){
    var sepia = parseInt(amount);
    $('#sepia').val(amount);

    clone = cloneCanvas(originalCanvas);
    photo.find('canvas').remove().end().append(clone);

    Caman(clone[0], function () {
      $('.preloader-wrapper ').addClass('active');

      this.sepia(sepia);  
      this.render(function(){
        $('.preloader-wrapper ').removeClass('active');
      });
    });

    makeCanvasCenter(false);
    showDownload(clone[0]);
  }
  function changeSharpness(amount){
    var sharpen = parseInt(amount);
    $('#sharpen').val(amount);

    clone = cloneCanvas(originalCanvas);
    photo.find('canvas').remove().end().append(clone);

    Caman(clone[0], function () {
      $('.preloader-wrapper ').addClass('active');

      this.sharpen(sharpen);  
      this.render(function(){
        $('.preloader-wrapper ').removeClass('active');
      });
    });

    makeCanvasCenter(false);
    showDownload(clone[0]);
  }
  function changeSaturation(amount){
    var saturation = parseInt(amount);
    $('#saturation').val(amount);
    clone = cloneCanvas(originalCanvas);
    photo.find('canvas').remove().end().append(clone);

    Caman(clone[0], function () {
      $('.preloader-wrapper ').addClass('active');

      this.saturation(saturation);  
      this.render(function(){
        $('.preloader-wrapper ').removeClass('active');
      });
    });

    makeCanvasCenter(false);
    showDownload(clone[0]);
  }
  function changeExposure(amount){
    var exposure = parseInt(amount);
    $('#exposure').val(amount)
    clone = cloneCanvas(originalCanvas);
    photo.find('canvas').remove().end().append(clone);

    Caman(clone[0], function () {
      $('.preloader-wrapper ').addClass('active');

      this.exposure(exposure);  
      this.render(function(){
        $('.preloader-wrapper ').removeClass('active');
      });
    });

    makeCanvasCenter(false);
    showDownload(clone[0]);
  }
  
});


readURL = function(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function (e) {
      $('#imgUpload')
        .attr('src', e.target.result);
    };

    reader.readAsDataURL(input.files[0]);
  }
}