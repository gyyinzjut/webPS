$(document).ready(function(){
    var canvas=$('#photo')[0],dataURL,img,imageData;
//                var context=canvas.getContext("2d");
//                context.drawImage(img,0,0);
////                    alert(canvas.width+"  "+canvas.height);
//                var imageData=context.getImageData(0,0,img.width,img.height);
//                var pixels=imageData.data;
//                var n=pixels.length;
    <!--上传图片-->
    $('#file').change(function(){
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            var file = this.files[0];
            var imageType = /image.*/;
            if (file.type.match(imageType)) {
//                if(file.size >= 512000){
//                    $('#alertError').find('.modal-body').text(file.name+"太大啦");
//                    $('#alertError').modal();
//                }else{
                var reader = new FileReader();
                reader.onload = function (e) {
                    dataURL = e.target.result;
//                        console.log(dataURL);
                    initImg(dataURL);
                };
                reader.readAsDataURL(file);
//                }
            }else{
                $('#alertError').modal().find('.modal-body').text(file.name+"是图片吗？");
                //$('#alertError').modal();
            }
        }
    });<!--end上传图片-->



    <!--初始化-->
    function initImg(dataURL){
        var context=canvas.getContext("2d");
        clear(canvas);
        if(img){
            $(img).remove();
        }
        img=new Image();
        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);
            // $('.canvasBox').append(img);
            imageData=context.getImageData(0,0,img.width,img.height);
            console.log(imageData);
        };
        img.src=dataURL;
        img.id='img';
        $('.control input').attr('disabled',false);
        $('.filter .dropdown-toggle').removeClass('disabled');
        $('#original').removeClass('disabled');
    }<!--end初始化-->
    <!--恢复原图-->
    function getSourceImg(img){
        var context=canvas.getContext("2d");
        context.drawImage(img,0,0);
        imageData=context.getImageData(0,0,img.width,img.height);
//        console.log(imageData);
        return imageData;
    }
    $('#original').click(function(e){
        clear(canvas);
        e.preventDefault();
        displayImg(canvas,getSourceImg(img));
    });<!--end恢复原图-->
    <!--反相-->
    function opposition(imgData){
        var pixels=imgData.data;
        var n=pixels.length;
        for (var i = 0; i < n; i+=4) {
            var R=pixels[i];
            var G=pixels[i+1];
            var B=pixels[i+2];
            var alpha=pixels[i+3];

            pixels[i]=255-R;
            pixels[i+1]=255-G;
            pixels[i+2]=255-B;
        }
        imgData.data=pixels;
        return imgData;
    }
    $('#opposition').click(function(e){
        e.preventDefault();
        displayImg(canvas,opposition(getSourceImg(img)));
    });<!--end反相-->
    <!--黑白效果-->
    function greyScale(imgData){
        var pixels=imgData.data;
        var n=pixels.length;
        for (var i = 0; i < n; i+=4) {
            var R=pixels[i];
            var G=pixels[i+1];
            var B=pixels[i+2];
            var alpha=pixels[i+3];


            var grey=parseInt(R*0.299+G*0.587+B*0.114);
//            var grey=(pixels[i+1]+pixels[i+2]+pixels[i])/3;
            pixels[i+1]=pixels[i+2]=pixels[i]=grey;
        }
        imgData.data=pixels;
        return imgData;
    }
    $('#greyScale').click(function(e){
        e.preventDefault();
        displayImg(canvas,greyScale(getSourceImg(img)));

        // $('#img').pixastic("invert");
    });<!--end黑白效果-->
    <!--二值化-->
    function treshold(imgData,treshold){
        var pixels=imgData.data;
        treshold=treshold||127;
        var n=pixels.length;
        for (var i = 0; i < n; i+=4) {
            var R=pixels[i];
            var G=pixels[i+1];
            var B=pixels[i+2];
            var alpha=pixels[i+3];
            var gray=parseInt(R*0.299+G*0.587+B*0.114)<treshold?0:255;
            pixels[i+1]=pixels[i+2]=pixels[i]=gray;
        }
        imgData.data=pixels;
        return imgData;
    }
    $('#binarization').click(function(e){
        e.preventDefault();
        displayImg(canvas,treshold(getSourceImg(img)));
    });<!--end二值化-->
    <!--高斯模糊-->
    function gaussianBlur(imgData,radius,sigma){
        var pixels=imgData.data;
        radius=radius||3;
        sigma=sigma||radius/3;
        var h=imgData.height,w=imgData.width;
        var R, G, B,alpha;
        var i, j, k, x, y,gaussSum;
        var gaussMatrix=Template.gaussMatrix(radius,sigma);
        convolute(imgData,gaussMatrix);
        for(y=0;y<h;y++){
            for(x=0;x<w;x++){
                R=G=B=alpha=0;
                gaussSum=0;
                for(j=-radius;j<=radius;j++){
                    k=x+j;
                    if(k>=0 && k<w){
                        i=(y*w+k)*4;
                        R+=pixels[i]*gaussMatrix[j+radius];
                        G+=pixels[i+1]*gaussMatrix[j+radius];
                        B+=pixels[i+2]*gaussMatrix[j+radius];
                        gaussSum += gaussMatrix[j + radius];
                    }
                }
                i=(y*w+x)*4;
//                            pixels[i]=R>255?255:R;
//                            pixels[i+1]=G>255?255:G;
//                            pixels[i+2]=B>255?255:B;

                pixels[i] = R / gaussSum;
                pixels[i + 1] = G / gaussSum;
                pixels[i + 2] = B / gaussSum;
            }
        }
        for(x=0;x<w;x++){
            for(y=0;y<h;y++){
                R=G=B=alpha=0;
                gaussSum=0;
                for(j=-radius;j<=radius;j++){
                    k=y+j;
                    if(k>=0 && k<h){
                        i=(k*w+x)*4;
                        R+=pixels[i]*gaussMatrix[j+radius];
                        G+=pixels[i+1]*gaussMatrix[j+radius];
                        B+=pixels[i+2]*gaussMatrix[j+radius];
                        gaussSum += gaussMatrix[j + radius];
                    }
                }
                i=(y*w+x)*4;
//                            pixels[i]=R>255?255:R;
//                            pixels[i+1]=G>255?255:G;
//                            pixels[i+2]=B>255?255:B;
                pixels[i] = R / gaussSum;
                pixels[i + 1] = G / gaussSum;
                pixels[i + 2] = B / gaussSum;
            }
        }
        imgData.data=pixels;
        return imgData;
    }
    $('#gaussianBlur').click(function(e){
        e.preventDefault();
        displayImg(canvas,gaussianBlur(getSourceImg(img),3,1));
    });<!--end高斯模糊-->
    <!--素描效果-->
    function sketch(imgData){
        var context=canvas.getContext("2d");
        var pixels=imgData.data;
        var w=imgData.width,h=imgData.height;
        greyScale(imgData);
        clear(canvas);
        context.putImageData(imgData,0,0);
        var copyImageData=context.getImageData(0,0,w,h);
        opposition(copyImageData);
        gaussianBlur(copyImageData,3,9);//radius很大时有复古效果
        superposition(imgData,copyImageData);
//                    convolute(imageData,Template.laplace);
//                    $('.canvasBox').append("<canvas id='canvas1'></canvas>");
//                    var canvas1=$('#canvas1')[0];
//                    var ctx1=canvas1.getContext("2d");
//                    canvas1.width=w;canvas1.height=h;
//                    ctx1.putImageData(imageData,1,1);
        return imgData;
    }
    $('#sketch').click(function(e){
        e.preventDefault();
        displayImg(canvas,sketch(getSourceImg(img)));
    });<!--end素描效果-->
    <!--锐化-->
    $('#sharp').click(function(e){
        e.preventDefault();
        displayImg(canvas,convolute(getSourceImg(img),Template.laplace));
    });<!--end锐化-->
    <!--Sobel-->
    function sobel(data){
        data=greyScale(imageData);
        var width=data.width,height=data.height;
        var vertical=convolute(data,Template.sobel.HX);
        var horizontal=convolute(data,Template.sobel.HY);
        var tempCanvas=document.createElement('canvas');
        var tempCtx=tempCanvas.getContext("2d");
        var output=tempCtx.createImageData(width,height);
        for(var i=0;i<output.data.length;i+=4){
            var v = Math.abs(vertical.data[i]);
            output.data[i] = v;
            var h = Math.abs(horizontal.data[i]);
            output.data[i + 1] = h
            output.data[i + 2] = (v + h) / 4;
            output.data[i + 3] = 255;
        }
        return output;
    }
    $('#sobel').click(function(e){
        e.preventDefault();
        displayImg(canvas,sobel(getSourceImg(img)));
    });<!--end  Sobel-->
    <!--virus-->
    $('#virus').click(function(e){
        e.preventDefault();
        displayImg(canvas,convolute(getSourceImg(img),Template.other['0']));
    });<!--end  virus-->
    <!--清除画布-->
    function clear(canvas){
        var context=canvas.getContext("2d");
        context.clearRect(0,0,canvas.width,canvas.height);
    }<!--end清除画布-->
    <!--处理图像后展示-->
    function displayImg(canvas,imgData){
        clear(canvas);
        var context=canvas.getContext("2d");
        context.putImageData(imgData,0,0);
//                    console.log(canvas.toDataURL());
    }<!--end处理图像后展示-->
//
    <!--卷积-->
    function convolute(imgData,matrix){
        var pixels=imgData.data;
        var h=imgData.height,w=imgData.width;
        var R, G, B,alpha;
        var i, j, x, y,sum=0;
        var tempCanvas=document.createElement('canvas');
        var tempCtx=tempCanvas.getContext("2d");
        var output=tempCtx.createImageData(w,h);
        var dst=output.data;
        var side=Math.round(Math.sqrt(matrix.length));
        var radius=Math.floor(side/2);
        var point;
        for(y=0;y<h;y++){
            for(x=0;x<w;x++){
                R=G=B=alpha=0;
                sum=0;
                for(j=0;j<side;j++){
                    for(i=0;i<side;i++){
                        var my=y+j-radius;
                        var mx=x+i-radius;
                        if(my>=0&&my<h&&mx>=0&&mx<w){
                            point=(my*w+mx)*4;
                            R+=pixels[point]*matrix[j*side+i];
                            G+=pixels[point+1]*matrix[j*side+i];
                            B+=pixels[point+2]*matrix[j*side+i];
                            alpha+=pixels[point+3]*matrix[j*side+i];
                            sum += matrix[j*side+i];
                        }
                    }
                }
                point=(y*w+x)*4;
                dst[point]=R;
                dst[point+1]=G;
                dst[point+2]=B;
                dst[point + 3] =255;
//                            dst[point + 3] = alpha/sum+(opaque?(255-alpha/sum):0);//不能漏掉
            }
        }
//                    for(var i in pixels){
//                        pixels[i]=dst[i];
//                    }//较慢
//                    $.each(pixels,function(i){
//                        pixels[i]=dst[i];
//                    });
//                    imageData=output;
//                    return imageData;
        return output;
    }<!--end卷积-->
    <!--图层混合-->
    function superposition(baseImageData,mixImageData){
        var basePixels=baseImageData.data;
        var mixPixels=mixImageData.data;
        for (var i = 0, len = basePixels.length; i < len; i += 4) {
            basePixels[i] = basePixels[i] + (basePixels[i] * mixPixels[i]) / (255 - mixPixels[i]);
            basePixels[i + 1] = basePixels[i + 1] + (basePixels[i + 1] * mixPixels[i + 1]) / (255 - mixPixels[i + 1]);
            basePixels[i + 2] = basePixels[i + 2] + (basePixels[i + 2] * mixPixels[i + 2]) / (255 - mixPixels[i + 2]);

//                        basePixels[i] = (basePixels[i] + mixPixels[i] - 255) * 255 / mixPixels[i];
//                        basePixels[i + 1] = (basePixels[i+1] + mixPixels[i+1] - 255) * 255 / mixPixels[i+1];
//                        basePixels[i + 2] = (basePixels[i+2] + mixPixels[i+2] - 255) * 255 / mixPixels[i+2];
        }
        baseImageData.data=basePixels;
        return baseImageData;
    }<!--end图层混合-->
    var Template={
        gaussMatrix:function(radius,sigma){
            var o, p, q;
            var matrix = [];
            var gaussSum = 0;
            var i;
            p=1/(Math.sqrt(2*Math.PI)*sigma);
            q=-1/(2*sigma*sigma);
            for(i=-radius;i<=radius;i++){
                o=p*Math.exp(q*i*i);
                matrix.push(o);
                gaussSum+=o;
            }

            for (i = 0; i < matrix.length; i++) {
                matrix[i] /= gaussSum;
            }
            return matrix;
        },
        laplace:[  0, -1,  0,
            -1,  5, -1,
            0, -1,  0 ],
        sobel:{ HX:
            [ -1, -2, -1,
                0,  0,  0,
                1,  2,  1 ],
            HY:
                [ -1, 0, 1,
                    -2, 0, 2,
                    -1, 0, 1 ]},
        other:{'0':[1,1,1,1,0.7,-1,-1,-1,-1]}
    };
//    直方图
    function getHistogram(imgData){
        var pixels=imgData.data;
        var h=imgData.height,w=imgData.width;
        var value=[];
        for(var i=0;i<256;i++) value[i]=0;
        for(y=0;y<h;y++){
            for(x=0;x<w;x++){
                value[pixels[(y*w+x)*4]]++;
            }
        }
        return value;
    }
//    end直方图

//    <!--平均亮度计算-->
    function AveBrightness(imgData){
        var pixels=imgData.data;
        var n=pixels.length;
        var total=0;
        var histogram=getHistogram(greyScale(imgData));
        for(var i=0;i<256;i++){
            total+=histogram[i]*i;
        }
        return total/(n/4);
    }//<!--end平均亮度计算-->



    var brightnessVal,contrastVal;
    <!--亮度调节-->
    function brightness(imgData,valOfRange){
        var pixels=imgData.data;
        var n=pixels.length;
        for (var i = 0; i < n; i+=4) {
            var R=pixels[i];
            var G=pixels[i+1];
            var B=pixels[i+2];
            var alpha=pixels[i+3];
            var HSL=rgbToHsl(R,G,B);
            var H=HSL[0],S=HSL[1],L=HSL[2];
            L = L * ( 1 + valOfRange);

            var RGB=hslToRgb(H,S,L);
            pixels[i]=RGB[0];
            pixels[i+1]=RGB[1];
            pixels[i+2]=RGB[2];
        }
        imgData.data=pixels;
        return imgData;
    }<!--end亮度调节-->
//    var brightnessVal,contrastVal;
//    $('.brightness').change(function(){
//        brightnessVal=Number($('.brightness').val());
//        contrastVal=Number($('.contrast').val());
//    });
//    $('.bc').click(function(){
//        Pixastic.process(img, "brightness", {"brightness":brightnessVal||0,"contrast":contrastVal||0});
//    });
    <!--对比度调节-->
    function contrast(imgData,aveValue,valOfRange){
        var pixels=imgData.data;
        var n=pixels.length;
        for (var i = 0; i < n; i+=4) {
            var R=pixels[i];
            var G=pixels[i+1];
            var B=pixels[i+2];
            var alpha=pixels[i+3];
            pixels[i]=aveValue+(R-aveValue)*(1+valOfRange);
            pixels[i+1]=aveValue+(G-aveValue)*(1+valOfRange);
            pixels[i+2]=aveValue+(B-aveValue)*(1+valOfRange);
        }
        imgData.data=pixels;
        return imgData;
    }<!--end对比度调节-->

    $('.bc').click(function(){
        var aveBrightness=AveBrightness(imageData);
        var contrastTemp=contrast(getSourceImg(img),aveBrightness,Number($('.contrast').val()));
        displayImg(canvas,brightness(
            contrastTemp,Number($('.brightness').val())));
    });

//    $('.bc').click(function(){
//        var brightnessTemp=brightness(getSourceImg(img),Number($('.brightness').val()));
//        displayImg(canvas,contrast(
//            brightnessTemp,AveBrightness(imageData),Number($('.contrast').val())));
//    });
//    <!--饱和度调节-->
//    function saturation(imgData){
//        var valOfRange=Number($('.saturation').val());
//        var pixels=imgData.data;
//        var n=pixels.length;
//        for (var i = 0; i < n; i+=4) {
//            var R=pixels[i];
//            var G=pixels[i+1];
//            var B=pixels[i+2];
//            var alpha=pixels[i+3];
//            var HSL=rgbToHsl(R,G,B);
//            var H=HSL[0],S=HSL[1],L=HSL[2];
//            S = S * ( 1 + valOfRange);
//            var RGB=hslToRgb(H,S,L);
//            pixels[i]=RGB[0];
//            pixels[i+1]=RGB[1];
//            pixels[i+2]=RGB[2];
//        }
//        imgData.data=pixels;
//        return imgData;
//    }<!--end饱和度调节-->
//    $('.saturation').change(function(){
//        displayImg(canvas,saturation(getSourceImg(img)));
//    });


    var hueToRgb_ = function(v1, v2, vH) {
        if (vH < 0) {
            vH += 1;
        } else if (vH > 1) {
            vH -= 1;
        }
        if ((6 * vH) < 1) {
            return (v1 + (v2 - v1) * 6 * vH);
        } else if (2 * vH < 1) {
            return v2;
        } else if (3 * vH < 2) {
            return (v1 + (v2 - v1) * ((2 / 3) - vH) * 6);
        }
        return v1;
    };
    var rgbToHsl = function(r, g, b) {
        // First must normalize r, g, b to be between 0 and 1.
        var normR = r / 255;
        var normG = g / 255;
        var normB = b / 255;
        var max = Math.max(normR, normG, normB);
        var min = Math.min(normR, normG, normB);
        var h = 0;
        var s = 0;

        // Luminosity is the average of the max and min rgb color intensities.
        var l = 0.5 * (max + min);

        // The hue and saturation are dependent on which color intensity is the max.
        // If max and min are equal, the color is gray and h and s should be 0.
        if (max != min) {
            if (max == normR) {
                h = 60 * (normG - normB) / (max - min);
            } else if (max == normG) {
                h = 60 * (normB - normR) / (max - min) + 120;
            } else if (max == normB) {
                h = 60 * (normR - normG) / (max - min) + 240;
            }

            if (0 < l && l <= 0.5) {
                s = (max - min) / (2 * l);
            } else {
                s = (max - min) / (2 - 2 * l);
            }
        }

        // Make sure the hue falls between 0 and 360.
        return [Math.round(h + 360) % 360, s, l];
    };
    var hslToRgb = function(h, s, l) {
        var r = 0;
        var g = 0;
        var b = 0;
        var normH = h / 360; // normalize h to fall in [0, 1]

        if (s == 0) {
            r = g = b = l * 255;
        } else {
            var temp1 = 0;
            var temp2 = 0;
            if (l < 0.5) {
                temp2 = l * (1 + s);
            } else {
                temp2 = l + s - (s * l);
            }
            temp1 = 2 * l - temp2;
            r = 255 * hueToRgb_(temp1, temp2, normH + (1 / 3));
            g = 255 * hueToRgb_(temp1, temp2, normH);
            b = 255 * hueToRgb_(temp1, temp2, normH - (1 / 3));
        }

        return [Math.round(r), Math.round(g), Math.round(b)];
    };
//    涂鸦
    $('#creatCanvas').click(function(){
        clear(canvas);
        canvas.width=$(".widthEntry").val();
        canvas.height=$(".heightEntry").val();
    });
    var paintCanvas=$('canvas')[0];
    var paintContext=paintCanvas.getContext('2d');
    $('.paint').click(function(){
        paint();
    });
    var paint=function(){
        paintCanvas.onmousedown=startDrawing;
        paintCanvas.onmouseup=stopDrawing;
        paintCanvas.onmouseout=stopDrawing;
        paintCanvas.onmousemove=draw;

    }
    var isDrawing=false;
    function startDrawing(e){
        isDrawing=true;
        paintContext.strokeStyle=$('#colorBox input[type="color"]').val();
        console.log($('#colorBox input[type="color"]').val());
        paintContext. lineWidth =$('#lineWidth input[type="number"]').val();
        paintContext.beginPath();
        paintContext.moveTo(e.pageX - paintCanvas.offsetLeft,e.pageY - paintCanvas.offsetTop);
        console.log(e.pageX+'   '+paintCanvas.offsetLeft+'y'+e.pageY +'   '+ paintCanvas.offsetTop);
    }
    function draw(e){
        if(isDrawing==true){
            var x=e.pageX - paintCanvas.offsetLeft;
            var y=e.pageY - paintCanvas.offsetTop;
            paintContext.lineTo(x,y);
            paintContext.stroke();
        }
    }
    function stopDrawing(){
        isDrawing=false;
    }
    function clearCanvas(){
        paintContext.clearRect(0,0,paintCanvas.width,paintCanvas.height);
    }
    function saveCanvas(){
        var imageCopy=document.getElementById("savedImageCopy");
        imageCopy.src=paintCanvas.toDataURL();
    }

//                <!--改变下拉菜单按钮的值-->
//                $('.filter ul li a').click(function(e){
//                    e.preventDefault();
//                    var $clickedA = $(e.target);
//                    var text=$clickedA.text();
//                    $(this).closest('.filter').find('.filterName').text(text);
//                });<!--end改变下拉菜单按钮的值-->
//                <!--调色板-->
//                $('#colorBox').jPicker({
//                    window:
//                    {
//                        expandable: true
//                    }
//                });<!--end调色板-->
    <!--均值-->
//                function average(array){
//                    return sum(array)/array.length;
//                }<!--end均值-->
//                <!--求和-->
//                function sum(array){
//                    var sum=0;
//                    for(var i in array){
//                        sum+=Number(array[i]);
//                    }
//                    return sum;
//                }<!--end求和-->
});