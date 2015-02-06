demo-web-sdk
============

Demostration of Rong Web SDK.

## 融云 web SDK 如何使用

[文档参考](http://docs.rongcloud.cn/api/js/index.html " SDK 文档")

### 初始化web sdk ，此项必须设置

使用融云 `web SDK` 发消息之前必须利用申请的`appkey`进行初始化，只有在初始化之后才能使用RongIMClient.getInstance()方法得到实例.如只想使用 web SDK 请参考 `SDK_Demo.html`
```js
RongIMClient.init("appkey");
```
### 设置链接状态监听器，此项必须设置
```js
RongIMClient.setConnectionStatusListener({  
     onChanged: function (status) {  
         window.console.log(status.getValue(), status.getMessage(), new Date()) 
     }  
}); 
```
### 链接融云服务器，此项必须设置

此方法为异步方法，请确定链接成功之后再执行其他操作。成功返回登录人员id失败则返回失败枚举对象
```js
RongIMClient.connect("token", {
     onSuccess: function (userid) {
         window.console.log("connected，userid＝" + userid)
     },
     onError: function (x) {
         window.console.log(x.getMessage())
     }
});
```
### 设置消息监听器，此项必须设置

所有接收的消息都通过此监听器进行处理，可以通过message.getMessageType()和RongIMClient.MessageType枚举对象来判断消息类型
```js
RongIMClient.getInstance().setOnReceiveMessageListener({
     onReceived: function (message) {
         //message为RongIMMessage子类实例
         console.log(message.getContent());
     }
});
```
### 得到RongIMClient实例对象
```js
var ins = RongIMClient.getInstance();
```
### 设置私人会话类型
```js
var contype = RongIMClient.ConversationType.PRIVATE;
```
### 例如注册某个元素点击事件(举例)
```js
element.onclick = function () {
//调用实例的发送消息方法
     ins.sendMessage(contype, "targetId", RongIMClient.TextMessage.obtain("发送消息内容"), null, {
           onSuccess: function () {
                //发送成功逻辑处理
           },
           onError: function (data) {
                //发送失败逻辑处理
                console.log(data.getValue(),data.getMessage())
           }
       });
};
```
web sdk是全异步的，所以发送消息之前确保链接成功
