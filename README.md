demo-web-sdk
============

Demostration of Rong Web SDK.

## 如何使用

### 初始化web sdk
```js
RongIMClient.init("appkey");
```
### 设置链接状态坚挺器
```js
RongIMClient.setConnectionStatusListener({  
     onChanged: function (status) {  
         window.console.log(status.getValue(), status.getMessage(), new Date()) 
     }  
}); 
```
### 链接融云服务器
```js
RongIMClient.connect("token", {
     onSuccess: function (x) {
         window.console.log("connected，userid＝" + x)
     },
     onError: function (x) {
         window.console.log(x.getMessage())
     }
});
```
### 设置消息监听器
```js
RongIMClient.getInstance().setOnReceiveMessageListener({
     onReceived: function (data) {
         console.log(data.getContent());
     }
});
```
### 得到RongIMClient实例对象
```js
var ins = RongIMClient.getInstance();
```
### 设置会话类型
```js
var contype = RongIMClient.ConversationType.PRIVATE;
```
### 例如注册某个元素点击事件(举例)
```js
element.onclick = function () {
//调用实例的发送消息方法
     ins.sendMessage(contype, "targetId", RongIMClient.TextMessage.obtain("内容"), null, {
           onSuccess: function (message) {
                //message为RongIMMessage子类实例
                console.log(message.getContent())
           },
           onError: function (data) {
                console.log(data)
           }
       });
};
```
### web sdk是全异步的，所以发送消息之前确保链接成功
