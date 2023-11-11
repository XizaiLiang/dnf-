runtime.images.initOpenCvIfNeeded();
importClass(java.util.ArrayList);
importClass(java.util.List);
importClass(java.util.LinkedList);
importClass(org.opencv.imgproc.Imgproc);
importClass(org.opencv.imgcodecs.Imgcodecs);
importClass(org.opencv.core.Core);
importClass(org.opencv.core.Mat);
importClass(org.opencv.core.Rect);
importClass(org.opencv.core.MatOfDMatch);
importClass(org.opencv.core.MatOfKeyPoint);
importClass(org.opencv.core.MatOfRect);
importClass(org.opencv.core.Size);
importClass(org.opencv.features2d.DescriptorMatcher);
importClass(org.opencv.features2d.Features2d);
importClass(org.opencv.features2d.SIFT);
importClass(org.opencv.features2d.ORB);
importClass(org.opencv.features2d.BRISK);
importClass(org.opencv.features2d.AKAZE);
importClass(org.opencv.features2d.BFMatcher);
importClass(org.opencv.core.MatOfPoint2f);
importClass(org.opencv.calib3d.Calib3d);
importClass(org.opencv.core.CvType);
importClass(org.opencv.core.Point);
importClass(org.opencv.core.Scalar);
importClass(org.opencv.core.MatOfByte);
importClass(org.opencv.imgcodecs.Imgcodecs);


function find_text(class_name,text_str,sleep_time){
    /**循环查找页面文字  找不到返回false
     *  class_name:     对应控件的class名字
     *  text_str:       对应控件的文本
     *  sleep_time:     循环次数，间隔为0.5s
     */
    sleep_time = sleep_time ? sleep_time:20;
    let index = 0;
    while(!className(class_name).text(text_str).exists()){
        if(index>sleep_time) return false;
        index += 1;
        sleep(500);
    }
    return true;
}

function click_text(class_name,text_str,sleep_time){
    /**循环查找页面文字并点击
     *  class_name:    对应控件的class名字
     *  text_str:      对应控件的文本
     *  sleep_time:    循环次数，间隔为0.5s
     */
    sleep_time = sleep_time ? sleep_time:20;
    let index = 0;
    while(!className(class_name).text(text_str).exists()){
        if(index>sleep_time) return false;
        index += 1;
        sleep(500);
    }
    let control1 = className(class_name).text(text_str).findOne();
    click(control1.bounds().centerX(),control1.bounds().centerY());
    return true;
}

function mainClick(thisX,thisY){
    /**重写click 可使用root点击或者使用无障碍点击
     * thisX:   x
     * thisY:   y
     */
    click(thisX,thisY);
    // shell("input tap " + thisX + " " + thisY,true);
}

function ClickDetermine(){
    // click_text("android.view.View","确 认",20);
    sleep_time = 20;
    let index = 0;
    while(!className("android.view.View").text("确 认").exists()){
        if(index>sleep_time) return false;
        index += 1;
        sleep(100);
    }
    let control1 = className("android.view.View").text("确 认").findOne();
    click(control1.bounds().centerX(),control1.bounds().centerY());
    ClickDetermine();
}


function shell_back(){
    //按下返回键
    shell("input keyevent 4", true);
}


function kill_all_background(){
    //清后台
    shell("input keyevent 187",true);
    sleep(1000);
    shell("input tap 550 1900",true);
    sleep(1000);
}


function CDMain(){
    /**
     * 进入助手页面
     */
    id("tgt_title_nav_menu").findOne().click();
    sleep(1000);
    click_text("android.widget.TextView","编年等级");
    find_text("android.view.View","每日签到");
    sleep(1000);
    shell("input swipe 300 1000 300 100",true);
}


function get_taskList_coordinate(task_title){

    /**
     * 找到对应task父辈标签的位置，投影到下方位置，使用opencv分析平均值，确定状态
     * task_title:任务列表标题名
     * return : 坐标数值
     */
    console.log("当前执行任务为：" + task_title);
    //找到任务
    if(!find_text("android.view.View",task_title,10)) return null;
    var targetView = textContains(task_title).findOne();

    var weekly_mandate = targetView.parent();    //找到父辈
    var weekly_mandate_rect = weekly_mandate.bounds().toString() 
    //获取坐标信息
    var matches = weekly_mandate_rect.match(/\d+/g);
    var x1 = parseInt(matches[0], 10);
    var y1 = parseInt(matches[1], 10);
    var x2 = parseInt(matches[2], 10);
    var y2 = parseInt(matches[3], 10);
    // log(x1,y1,x2,y2);

    // var startTime = new Date().getTime(); // 获取函数开始执行的时间
    shell("screencap -p "+SAVE_IMG_DIR+"now_screen.png",true);  //Mat image = Imgcodecs.imread("path_to_your_image.jpg");  
    var source = Imgcodecs.imread(SAVE_IMG_DIR+"now_screen.png");  

    // var img_big = captureScreen();    //截图
    // var source  = Imgcodecs.imdecode(new MatOfByte(images.toBytes(img_big)), Imgcodecs.IMREAD_COLOR);

    // log(x1,y2,(x2-x1),TASK_HEIGHT);
    var regionOfiniterst = new Rect(x1,y2,(x2-x1),TASK_HEIGHT);
    var roi = new Mat(source,regionOfiniterst);
    // Imgcodecs.imwrite(SAVE_IMG_DIR+index+".png", roi);

    var Rect_mean = Core.mean(roi);
    console.log(Rect_mean.toString());
    
    let regex = /\d+\.\d+/g; // 匹配所有包含小数点的数字  
    var Rect_mean_RGB = Rect_mean.toString().match(regex);

    // var endTime = new Date().getTime(); // 获取函数结束执行的时间  
    // var timeElapsed = endTime - startTime; // 计算函数运行时间  
    // console.log("函数运行时间为： " + timeElapsed + "毫秒");  

    source.release();  
    roi.release();  
    source.release();  
    return [Rect_mean_RGB,[x1,y1,x2,y2]];
}

function task1(){
    /**
     * 分享助手周报
     * 1、找到位置
     * 2、找到对应下面的button颜色之和，分为已领取、待领取、未完成
     * 3、写入已领取操作步骤（continue）
     * 4、写入待领取操作步骤（点击对应位置）
     * 5、写入未完成操作步骤（点击任务、待加载、点击右上角分享、点击左上角退出、点击待领取位置）
     * 难点任务框获取对应位置的像素点之和
     */
    sleep(1000);
    var taskList_coordinate_Data = get_taskList_coordinate("分享助手周报");
    if(!taskList_coordinate_Data){
        console.log("错误，找不到任务目标")
        return false;
    } 
    var Rect_mean_RGB = taskList_coordinate_Data[0];

    var x1 = taskList_coordinate_Data[1][0];
    var y1 = taskList_coordinate_Data[1][1];
    var x2 = taskList_coordinate_Data[1][2];
    var y2 = taskList_coordinate_Data[1][3];

    var B = parseInt(Rect_mean_RGB[0], 10);
    var G = parseInt(Rect_mean_RGB[1], 10);
    var R = parseInt(Rect_mean_RGB[2], 10);

    if(R > (RUNFINISHED_BGR[2]-FLOAT_NUMBER) && R < (RUNFINISHED_BGR[2]+FLOAT_NUMBER) && 
        G > (RUNFINISHED_BGR[1]-FLOAT_NUMBER) && G < (RUNFINISHED_BGR[1]+FLOAT_NUMBER) && 
        B > (RUNFINISHED_BGR[0]-FLOAT_NUMBER) && B < (RUNFINISHED_BGR[0]+FLOAT_NUMBER) ){
        //未完成
        console.log("任务未完成");
        mainClick(((x1+x2)/2),((y1+y2)/2));
        click_text("android.widget.TextView","分享",20);
        sleep(1000);
        click_text("android.widget.Button","取消",20);
        sleep(1000);
        id("back").findOne().click();
        sleep(1000);
        mainClick(((x1+x2)/2),((y1+y2)/2+TASK_HEIGHT));
        return true;
    }else if(R > (UNCLAIMED_BGR[2]-FLOAT_NUMBER) && R < (UNCLAIMED_BGR[2]+FLOAT_NUMBER) && 
            G > (UNCLAIMED_BGR[1]-FLOAT_NUMBER) && G < (UNCLAIMED_BGR[1]+FLOAT_NUMBER) && 
            B > (UNCLAIMED_BGR[0]-FLOAT_NUMBER) && B < (UNCLAIMED_BGR[0]+FLOAT_NUMBER) ){
        //未领取
        console.log("未领取");
        mainClick(((x1+x2)/2),((y1+y2)/2+TASK_HEIGHT));
        return true;
    }else if(R > (DONE_BGR[2]-FLOAT_NUMBER) && R < (DONE_BGR[2]+FLOAT_NUMBER) && 
            G > (DONE_BGR[1]-FLOAT_NUMBER) && G < (DONE_BGR[1]+FLOAT_NUMBER) && 
            B > (DONE_BGR[0]-FLOAT_NUMBER) && B < (DONE_BGR[0]+FLOAT_NUMBER) ){
        console.log("已领取");
    }
    return false;
}

function task2(){
    /** DNF助手签到
     * 如法炮制
     * 
     */
    sleep(1000);
    var taskList_coordinate_Data = get_taskList_coordinate("DNF助手签到");
    if(!taskList_coordinate_Data){
        console.log("错误，找不到任务目标")
        return false;
    } 
    var Rect_mean_RGB = taskList_coordinate_Data[0];

    var x1 = taskList_coordinate_Data[1][0];
    var y1 = taskList_coordinate_Data[1][1];
    var x2 = taskList_coordinate_Data[1][2];
    var y2 = taskList_coordinate_Data[1][3];

    var B = parseInt(Rect_mean_RGB[0], 10);
    var G = parseInt(Rect_mean_RGB[1], 10);
    var R = parseInt(Rect_mean_RGB[2], 10);

    if(R > (RUNFINISHED_BGR[2]-FLOAT_NUMBER) && R < (RUNFINISHED_BGR[2]+FLOAT_NUMBER) && 
        G > (RUNFINISHED_BGR[1]-FLOAT_NUMBER) && G < (RUNFINISHED_BGR[1]+FLOAT_NUMBER) && 
        B > (RUNFINISHED_BGR[0]-FLOAT_NUMBER) && B < (RUNFINISHED_BGR[0]+FLOAT_NUMBER) ){
        //未完成
        console.log("任务未完成");
        mainClick(((x1+x2)/2),((y1+y2)/2+TASK_HEIGHT));
        return true;
    }else if(R > (UNCLAIMED_BGR[2]-FLOAT_NUMBER) && R < (UNCLAIMED_BGR[2]+FLOAT_NUMBER) && 
            G > (UNCLAIMED_BGR[1]-FLOAT_NUMBER) && G < (UNCLAIMED_BGR[1]+FLOAT_NUMBER) && 
            B > (UNCLAIMED_BGR[0]-FLOAT_NUMBER) && B < (UNCLAIMED_BGR[0]+FLOAT_NUMBER) ){
        //未领取
        console.log("未领取");
        mainClick(((x1+x2)/2),((y1+y2)/2+TASK_HEIGHT));
        return true;
    }else if(R > (DONE_BGR[2]-FLOAT_NUMBER) && R < (DONE_BGR[2]+FLOAT_NUMBER) && 
            G > (DONE_BGR[1]-FLOAT_NUMBER) && G < (DONE_BGR[1]+FLOAT_NUMBER) && 
            B > (DONE_BGR[0]-FLOAT_NUMBER) && B < (DONE_BGR[0]+FLOAT_NUMBER) ){
        console.log("已领取");
    }
    return false;
}


function task3(){
    /** 体验成长指南
     * 如法炮制
     */
    sleep(1000);
    var taskList_coordinate_Data = get_taskList_coordinate("体验成长指南");
    if(!taskList_coordinate_Data){
        console.log("错误，找不到任务目标")
        return false;
    } 
    var Rect_mean_RGB = taskList_coordinate_Data[0];

    var x1 = taskList_coordinate_Data[1][0];
    var y1 = taskList_coordinate_Data[1][1];
    var x2 = taskList_coordinate_Data[1][2];
    var y2 = taskList_coordinate_Data[1][3];

    var B = parseInt(Rect_mean_RGB[0], 10);
    var G = parseInt(Rect_mean_RGB[1], 10);
    var R = parseInt(Rect_mean_RGB[2], 10);

    if(R > (RUNFINISHED_BGR[2]-FLOAT_NUMBER) && R < (RUNFINISHED_BGR[2]+FLOAT_NUMBER) && 
        G > (RUNFINISHED_BGR[1]-FLOAT_NUMBER) && G < (RUNFINISHED_BGR[1]+FLOAT_NUMBER) && 
        B > (RUNFINISHED_BGR[0]-FLOAT_NUMBER) && B < (RUNFINISHED_BGR[0]+FLOAT_NUMBER) ){
        //未完成
        console.log("任务未完成");
        mainClick(((x1+x2)/2),((y1+y2)/2));
        find_text("android.widget.TextView","搭配推荐",2);
        shell_back();
        sleep(1000);
        mainClick(((x1+x2)/2),((y1+y2)/2+TASK_HEIGHT));
        return true;
    }else if(R > (UNCLAIMED_BGR[2]-FLOAT_NUMBER) && R < (UNCLAIMED_BGR[2]+FLOAT_NUMBER) && 
            G > (UNCLAIMED_BGR[1]-FLOAT_NUMBER) && G < (UNCLAIMED_BGR[1]+FLOAT_NUMBER) && 
            B > (UNCLAIMED_BGR[0]-FLOAT_NUMBER) && B < (UNCLAIMED_BGR[0]+FLOAT_NUMBER) ){
        //未领取
        console.log("未领取");
        mainClick(((x1+x2)/2),((y1+y2)/2+TASK_HEIGHT));
        return true;
    }else if(R > (DONE_BGR[2]-FLOAT_NUMBER) && R < (DONE_BGR[2]+FLOAT_NUMBER) && 
            G > (DONE_BGR[1]-FLOAT_NUMBER) && G < (DONE_BGR[1]+FLOAT_NUMBER) && 
            B > (DONE_BGR[0]-FLOAT_NUMBER) && B < (DONE_BGR[0]+FLOAT_NUMBER) ){
        console.log("已领取");
    }
    return false;
}


function task4(){
    /** 通关推荐地下城3次
     * 如法炮制
     */
    sleep(1000);
    var taskList_coordinate_Data = get_taskList_coordinate("通关推荐地下城3次");
    if(!taskList_coordinate_Data){
        console.log("错误，找不到任务目标")
        return false;
    } 
    var Rect_mean_RGB = taskList_coordinate_Data[0];

    var x1 = taskList_coordinate_Data[1][0];
    var y1 = taskList_coordinate_Data[1][1];
    var x2 = taskList_coordinate_Data[1][2];
    var y2 = taskList_coordinate_Data[1][3];

    var B = parseInt(Rect_mean_RGB[0], 10);
    var G = parseInt(Rect_mean_RGB[1], 10);
    var R = parseInt(Rect_mean_RGB[2], 10);

    if(R > (RUNFINISHED_BGR[2]-FLOAT_NUMBER) && R < (RUNFINISHED_BGR[2]+FLOAT_NUMBER) && 
        G > (RUNFINISHED_BGR[1]-FLOAT_NUMBER) && G < (RUNFINISHED_BGR[1]+FLOAT_NUMBER) && 
        B > (RUNFINISHED_BGR[0]-FLOAT_NUMBER) && B < (RUNFINISHED_BGR[0]+FLOAT_NUMBER) ){
        //未完成
        console.log("任务未完成");
    }else if(R > (UNCLAIMED_BGR[2]-FLOAT_NUMBER) && R < (UNCLAIMED_BGR[2]+FLOAT_NUMBER) && 
            G > (UNCLAIMED_BGR[1]-FLOAT_NUMBER) && G < (UNCLAIMED_BGR[1]+FLOAT_NUMBER) && 
            B > (UNCLAIMED_BGR[0]-FLOAT_NUMBER) && B < (UNCLAIMED_BGR[0]+FLOAT_NUMBER) ){
        //未领取
        console.log("未领取");
        mainClick(((x1+x2)/2),((y1+y2)/2+TASK_HEIGHT));
        return true;
    }else if(R > (DONE_BGR[2]-FLOAT_NUMBER) && R < (DONE_BGR[2]+FLOAT_NUMBER) && 
            G > (DONE_BGR[1]-FLOAT_NUMBER) && G < (DONE_BGR[1]+FLOAT_NUMBER) && 
            B > (DONE_BGR[0]-FLOAT_NUMBER) && B < (DONE_BGR[0]+FLOAT_NUMBER) ){
        console.log("已领取");
    }
    return false;
}


function task5(){
    /** 浏览资讯详情页
     * 如法炮制
     */
    sleep(1000);
    var taskList_coordinate_Data = get_taskList_coordinate("浏览资讯详情页");
    if(!taskList_coordinate_Data){
        console.log("错误，找不到任务目标")
        return false;
    } 
    var Rect_mean_RGB = taskList_coordinate_Data[0];

    var x1 = taskList_coordinate_Data[1][0];
    var y1 = taskList_coordinate_Data[1][1];
    var x2 = taskList_coordinate_Data[1][2];
    var y2 = taskList_coordinate_Data[1][3];

    var B = parseInt(Rect_mean_RGB[0], 10);
    var G = parseInt(Rect_mean_RGB[1], 10);
    var R = parseInt(Rect_mean_RGB[2], 10);

    if(R > (RUNFINISHED_BGR[2]-FLOAT_NUMBER) && R < (RUNFINISHED_BGR[2]+FLOAT_NUMBER) && 
        G > (RUNFINISHED_BGR[1]-FLOAT_NUMBER) && G < (RUNFINISHED_BGR[1]+FLOAT_NUMBER) && 
        B > (RUNFINISHED_BGR[0]-FLOAT_NUMBER) && B < (RUNFINISHED_BGR[0]+FLOAT_NUMBER) ){
        //未完成
        console.log("任务未完成");
        mainClick(((x1+x2)/2),((y1+y2)/2));
        find_text("android.widget.RadioButton","资讯",4);    //确定进入到主页面
        id("info_title").find()[3].parent().parent().click();    //点击第三个资讯详情页，绕过置顶
        sleep(1000);
        id("back").findOne().click();
        CDMain();
        sleep(1000);
        mainClick(((x1+x2)/2),((y1+y2)/2+TASK_HEIGHT));
        return true;
    }else if(R > (UNCLAIMED_BGR[2]-FLOAT_NUMBER) && R < (UNCLAIMED_BGR[2]+FLOAT_NUMBER) && 
            G > (UNCLAIMED_BGR[1]-FLOAT_NUMBER) && G < (UNCLAIMED_BGR[1]+FLOAT_NUMBER) && 
            B > (UNCLAIMED_BGR[0]-FLOAT_NUMBER) && B < (UNCLAIMED_BGR[0]+FLOAT_NUMBER) ){
        //未领取
        console.log("未领取");
        mainClick(((x1+x2)/2),((y1+y2)/2+TASK_HEIGHT));
        return true;
    }else if(R > (DONE_BGR[2]-FLOAT_NUMBER) && R < (DONE_BGR[2]+FLOAT_NUMBER) && 
            G > (DONE_BGR[1]-FLOAT_NUMBER) && G < (DONE_BGR[1]+FLOAT_NUMBER) && 
            B > (DONE_BGR[0]-FLOAT_NUMBER) && B < (DONE_BGR[0]+FLOAT_NUMBER) ){
        console.log("已领取");
    }
    return false;
}

function task6(){
    /** 浏览动态列表
     * 如法炮制
     */
    sleep(1000);
    var taskList_coordinate_Data = get_taskList_coordinate("浏览动态列表");
    if(!taskList_coordinate_Data){
        console.log("错误，找不到任务目标")
        return false;
    } 
    var Rect_mean_RGB = taskList_coordinate_Data[0];

    var x1 = taskList_coordinate_Data[1][0];
    var y1 = taskList_coordinate_Data[1][1];
    var x2 = taskList_coordinate_Data[1][2];
    var y2 = taskList_coordinate_Data[1][3];

    var B = parseInt(Rect_mean_RGB[0], 10);
    var G = parseInt(Rect_mean_RGB[1], 10);
    var R = parseInt(Rect_mean_RGB[2], 10);

    if(R > (RUNFINISHED_BGR[2]-FLOAT_NUMBER) && R < (RUNFINISHED_BGR[2]+FLOAT_NUMBER) && 
        G > (RUNFINISHED_BGR[1]-FLOAT_NUMBER) && G < (RUNFINISHED_BGR[1]+FLOAT_NUMBER) && 
        B > (RUNFINISHED_BGR[0]-FLOAT_NUMBER) && B < (RUNFINISHED_BGR[0]+FLOAT_NUMBER) ){
        //未完成
        console.log("任务未完成");
        mainClick(((x1+x2)/2),((y1+y2)/2));
        find_text("android.widget.RadioButton","资讯",4);    //确定进入到主页面
        CDMain();
        mainClick(((x1+x2)/2),((y1+y2)/2+TASK_HEIGHT));
        return true;
    }else if(R > (UNCLAIMED_BGR[2]-FLOAT_NUMBER) && R < (UNCLAIMED_BGR[2]+FLOAT_NUMBER) && 
            G > (UNCLAIMED_BGR[1]-FLOAT_NUMBER) && G < (UNCLAIMED_BGR[1]+FLOAT_NUMBER) && 
            B > (UNCLAIMED_BGR[0]-FLOAT_NUMBER) && B < (UNCLAIMED_BGR[0]+FLOAT_NUMBER) ){
        //未领取
        console.log("未领取");
        mainClick(((x1+x2)/2),((y1+y2)/2+TASK_HEIGHT));
        return true;
    }else if(R > (DONE_BGR[2]-FLOAT_NUMBER) && R < (DONE_BGR[2]+FLOAT_NUMBER) && 
            G > (DONE_BGR[1]-FLOAT_NUMBER) && G < (DONE_BGR[1]+FLOAT_NUMBER) && 
            B > (DONE_BGR[0]-FLOAT_NUMBER) && B < (DONE_BGR[0]+FLOAT_NUMBER) ){
        console.log("已领取");
    }
    return false;
}


function task7(){
    /** 登录游戏
     * 如法炮制
     */
    sleep(1000);
    var taskList_coordinate_Data = get_taskList_coordinate("登录游戏");
    if(!taskList_coordinate_Data){
        console.log("错误，找不到任务目标")
        return false;
    } 
    var Rect_mean_RGB = taskList_coordinate_Data[0];

    var x1 = taskList_coordinate_Data[1][0];
    var y1 = taskList_coordinate_Data[1][1];
    var x2 = taskList_coordinate_Data[1][2];
    var y2 = taskList_coordinate_Data[1][3];

    var B = parseInt(Rect_mean_RGB[0], 10);
    var G = parseInt(Rect_mean_RGB[1], 10);
    var R = parseInt(Rect_mean_RGB[2], 10);

    if(R > (RUNFINISHED_BGR[2]-FLOAT_NUMBER) && R < (RUNFINISHED_BGR[2]+FLOAT_NUMBER) && 
        G > (RUNFINISHED_BGR[1]-FLOAT_NUMBER) && G < (RUNFINISHED_BGR[1]+FLOAT_NUMBER) && 
        B > (RUNFINISHED_BGR[0]-FLOAT_NUMBER) && B < (RUNFINISHED_BGR[0]+FLOAT_NUMBER) ){
        //未完成
        console.log("任务未完成");
    }else if(R > (UNCLAIMED_BGR[2]-FLOAT_NUMBER) && R < (UNCLAIMED_BGR[2]+FLOAT_NUMBER) && 
            G > (UNCLAIMED_BGR[1]-FLOAT_NUMBER) && G < (UNCLAIMED_BGR[1]+FLOAT_NUMBER) && 
            B > (UNCLAIMED_BGR[0]-FLOAT_NUMBER) && B < (UNCLAIMED_BGR[0]+FLOAT_NUMBER) ){
        //未领取
        console.log("未领取");
        mainClick(((x1+x2)/2),((y1+y2)/2+TASK_HEIGHT));
        return true;
    }else if(R > (DONE_BGR[2]-FLOAT_NUMBER) && R < (DONE_BGR[2]+FLOAT_NUMBER) && 
            G > (DONE_BGR[1]-FLOAT_NUMBER) && G < (DONE_BGR[1]+FLOAT_NUMBER) && 
            B > (DONE_BGR[0]-FLOAT_NUMBER) && B < (DONE_BGR[0]+FLOAT_NUMBER) ){
        console.log("已领取");
    }
    return false;
}

var SAVE_IMG_DIR = "/storage/emulated/0/auto_android_js/";
const FLOAT_NUMBER = 12;  //像素点误差范围
const RUNFINISHED_BGR = [222, 157, 139, 0];  //未完成的平均值
const UNCLAIMED_BGR = [252, 206, 194, 0];    //未领取
const DONE_BGR = [225, 224, 224, 0];    //已领取
const TASK_HEIGHT = 84;    //领取任务框高度

log(shell("/data/data/com.termux/files/usr/bin/python /data/data/com.termux/files/home/x.py",true));


kill_all_background();
sleep(3000);
launchApp("DNF助手");  //唤起app
sleep(10000);
CDMain();
var tasks = [task1, task2, task3, task4, task5, task6, task7];
tasks.forEach(item =>{
    console.log("=========================================")
    if(item())
        ClickDetermine();
});


//切换账号
console.log("切换账号");
shell("am start -n com.tencent.gamehelper.dnf/com.tencent.gamehelper.ui.login.accoutswitch.AccountManagerActivity",true);
sleep(1000);
click_text("android.widget.TextView","社区Id: 23523***");  //小号
sleep(5000);
kill_all_background();
sleep(3000);

launchApp("DNF助手");
sleep(10000);
CDMain();
tasks.forEach(item =>{
    console.log("=========================================")
    if(item())
        ClickDetermine();
});
console.log("切换账号");
shell("am start -n com.tencent.gamehelper.dnf/com.tencent.gamehelper.ui.login.accoutswitch.AccountManagerActivity",true);
sleep(1000);
click_text("android.widget.TextView","社区Id: 480895***");  //大号
sleep(5000);
kill_all_background();



// click_text("android.widget.TextView","社区Id: 23523***");  //小号
// click_text("android.widget.TextView","社区Id: 48089***");  //大号



/**
 * log
 * 未完成 [222.46948734448733, 157.76375482625483, 139.94146825396825, 0.0]
 * 未领取 [252.22527885027884, 206.77107464607465, 194.10837623337625, 0.0]
 * 已领取 [225.44428356928358, 224.7848562848563, 224.58215358215358, 0.0]
 * 
 * 
 * 系统截图
 * 
 * threads.start(function (){
        var button = text("立即开始").findOne();
        if (button) {
            button.click();
        } else {
            toast("未找到包含 " + textToClick + " 的按钮");
        }
    });

    if(!requestScreenCapture()){
        toast("请求截图失败");
        exit();
    }
 */

