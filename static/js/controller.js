/**
 * Created by yataozhang on 14/11/9.
 */
"use strict";
var RongIMDemo = angular.module("RongIMDemo", ["RongIMDemo.ctrl", "RongIMDemo.directive", "RongIMDemo.filter"], function () {


});
var RongIMDemoCtrl = angular.module("RongIMDemo.ctrl", []);

RongIMDemoCtrl.controller("RongC_chaInfo", function ($scope, $http, $rootScope) {
    var currentConversationTargetId = 0, conver, _historyMessagesCache = {};//历史消息列表
    $scope.hasSound=true;
    $scope.totalunreadcount = 0;
    $scope.owner = {id: "", portrait: "static/images/user_img.jpg", name: "张亚涛"};
    var list = location.search.slice(1).split('&');
    if (list.length == 3) {
        list.forEach(function (item) {
            var val = item.split("=");
            $scope.owner[val[0]] = decodeURIComponent(val[1]);
        });
    } else {
        location.href = "login.html";
        return;
    }

    $scope.ConversationList = [];
    $scope.friendsList = [];
    $rootScope.conversationTitle = "";

    $scope.playerHandle=function(t){
        $scope.hasSound = !$scope.hasSound;
        t.innerHTML=$scope.hasSound?"开启声音":"关闭声音";
    };
    $scope.logout = function () {
        $http({method: "get", url: "/logout?t=" + Date.now()}).success(function (data) {
            if (data.code == 200) {
                RongIMClient.getInstance().disconnect();
                location.href = "login.html";
            }
        }).error(function () {

        });
    };

    function initConversationList() {
        $scope.ConversationList.forEach(function (item) {
            item.unread = item.getUnreadMessageCount();
            item.lastTime = item.getLatestTime();
        });
    };
    //加载历史记录
    function getHistory(id, name, type) {
        if (!window.Modules)//检测websdk是否已经加载完毕
            return;
        currentConversationTargetId = id;
        $rootScope.conversationTitle = name;
        conver = RongIMClient.getInstance().createConversation(RongIMClient.ConversationType.setValue(type), currentConversationTargetId, name);
        if (!_historyMessagesCache[type + "_" + currentConversationTargetId])
            _historyMessagesCache[type + "_" + currentConversationTargetId] = [];
        $rootScope.historyMessages = _historyMessagesCache[type + "_" + currentConversationTargetId];
        var tempval = $scope.ConversationList.filter(function (item) {
            return item.getTargetId() == currentConversationTargetId;
        })[0];
        if (tempval) {
            tempval.unread = 0;
            $scope.totalunreadcount -= conver.getUnreadMessageCount();
            conver.setUnreadMessageCount(0);
        }
    }

    $scope.ConversationClick = function (type, targetid, name) {
        getHistory(targetid, name, type);
    };
    $scope.RongDefault = function (target, name, type) {
        var id = $(target).closest("li").attr("targetId");
        getHistory(id, name, type);
    };

    RongIMClient.init("e0x9wycfx7flq");//z3v5yqkbv8v30
    var token = "";
    $http({method: "get", url: "/token?t=" + Date.now()}).success(function (data) {
        if (data.code == 200) {
            token = data.result;
            RongIMClient.connect(token.token, {
                onSuccess: function (x) {
                    console.log("connected，userid＝" + x);
                },
                onError: function (c) {
                    console.log("失败:" + c.getMessage())
                }
            });
        } else {
            alert("获取token失败,请重新登录");
            location.href = "login.html";
        }
    }).error(function () {
        alert("获取token失败");
        location.href = "login.html";
    });
    $http({method: "get", url: "/friends?t=" + Date.now()}).success(function (data) {
        if (data.code == 200) {
            $scope.friendsList = data.result;
        }
    }).error(function () {

    });

    RongIMClient.setConnectionStatusListener({
        onChanged: function (status) {
            console.log(status.getValue(), status.getMessage());
            if (status.getValue() == 0) {
                $scope.ConversationList = RongIMClient.getInstance().getConversationList();
                $rootScope.$apply(function () {
                    initConversationList();
                });
            } else if (status.getValue() == 4) {
                alert(status.getValue().getMessage());
                location.href = "http://webim.rongcloud.net/WebIMDemo/login.html";
            }
        }
    });
    var namelist = {"group001": "融云群一", "group002": "融云群二", "group003": "融云群三", "kefu114": "客服"}
    //消息监听器
    var video = document.getElementsByTagName("video")[0];
    RongIMClient.getInstance().setOnReceiveMessageListener({
        onReceived: function (data) {
            if ($scope.hasSound) {
                video.play();
            }
            if (currentConversationTargetId != data.getTargetId()) {
                var person = $scope.friendsList.filter(function (item) {
                    return item.id == data.getTargetId();
                })[0];
                var tempval = RongIMClient.getInstance().getConversation(data.getConversationType(), data.getTargetId());
                if (person) {
                    tempval.setConversationTitle(person.username);
                } else {
                    if (data.getTargetId() in namelist) {
                        tempval.setConversationTitle(namelist[data.getTargetId()]);
                    } else {
                        RongIMClient.getInstance().getUserInfo(data.getTargetId(), {onSuccess: function (x) {
                            tempval.setConversationTitle(x.getUserName());
                        }, onError: function () {
                            tempval.setConversationTitle("陌生人Id：" + data.getTargetId());
                        }});
                    }
                }
                if (tempval) {
                    tempval.setUnreadMessageCount(tempval.getUnreadMessageCount() + 1);
                    $scope.totalunreadcount++;
                }
                if (!_historyMessagesCache[data.getConversationType().getValue() + "_" + data.getTargetId()])
                    _historyMessagesCache[data.getConversationType().getValue() + "_" + data.getTargetId()] = [data];
                else
                    _historyMessagesCache[data.getConversationType().getValue() + "_" + data.getTargetId()].push(data);
            } else {
                $rootScope.$apply(function () {
                    $rootScope.historyMessages.push(data);
                })
            }
            $rootScope.$apply(function () {
                initConversationList();
            });
        }
    });
    //加载表情

    function strreplace(str) {
        if (!str) return '';
        str = str.replace(/&amp;/g, '&');
        str = str.replace(/&lt;/g, '<');
        str = str.replace(/&gt;/g, '>');
        str = str.replace(/&quot;/g, '"');
        str = str.replace(/&#039;/g, "'");
        return str;
    }

    $scope.sendMessage = function () {
        if (!conver && !currentConversationTargetId) {
            alert("请选中需要聊天的人");
            return;
        }
        var con = $("#mainContent").html().trim().replace(/<(|\/)(br>|div>|img.+?>)/g, function (x) {
            return x.charAt(1) == "/" ? "\n" : "";
        }).replace(/\<span class="RongIMexpression_[\w|_]+?"><\/span>/g, function (x) {
            return RongIMClient.Expression.getTagByEnglishName(x.substring(30, x.length - 9));
        }).replace(/&nbsp;/g, " ");
        if (con == "") {
            alert("不允许发送空内容");
            return;
        }
        var msg = new RongIMClient.txtMessage();
        msg.setContent(strreplace(con));
        var content = new RongIMClient.MessageContent(msg);
        RongIMClient.getInstance().sendMessage(conver.getConversationType(), currentConversationTargetId, content, null, {
            onSuccess: function () {
                console.log("send successfully")
            }, onError: function (x) {
                $(".dialog_box div[messageId='" + content.getMessage().getMessageId() + "']").addClass("status_error");
                console.log(x.getValue(), x.getMessage())
            }
        });
        $rootScope.historyMessages.push(content.getMessage());
        initConversationList();
        $("#mainContent").html("");
    };
});
var RongIMDemoFilter = angular.module("RongIMDemo.filter", []);
RongIMDemoFilter.filter("showTime", function () {
    return function (item) {
        return new Date(parseInt(item)).toString().split(" ")[4];
    }
});
var RongIMDemoDirective = angular.module("RongIMDemo.directive", []);
RongIMDemoDirective.directive("msgType", function () {
    function initEmotion(str) {
        var emojiList=RongIMClient.Expression.retrievalEmoji(str);
        for(var i=0;i<emojiList.length;i++){
            var reg=new RegExp(emojiList[i]["utf-8"],"g");
            str=str.replace(reg,function(){
                var img=RongIMClient.Expression.getEmojiByContent(emojiList[i]["utf-16"])
                return '<span class="RongIMexpression_' + img.englishName + '"><img src="' + img.img.src + '" alt="' + img.chineseName + ' "></span>';
            });
        }
        return str;
    }

    function symbolreplace(str) {
        if (!str) return '';
        str = str.replace(/&/g, '&amp;');
        str = str.replace(/</g, '&lt;');
        str = str.replace(/>/g, '&gt;');
        str = str.replace(/"/g, '&quot;');
        str = str.replace(/'/g, '&#039;');
        return str;
    };
    return {
        link: function ($scope, $element, $attr, ngModel) {
            var s = RongIMClient.getInstance().getIO().util.JSONParse($attr.msgType);
            $($element[0]).closest(".xiaoxiti").after('<div class="slice"></div>');
            if ("imageUri" in s) {
                $($element[0]).html("<img class='imgThumbnail' src='data:image/jpg;base64," + s.content + "' bigUrl='" + s.imageUri + "'/>");
            } else if ("duration" in s) {
                $($element[0]).addClass("voice").html("  " + s.duration);
            } else {
                $($element[0]).html(initEmotion(symbolreplace(s.content)));
            }
            $element[0].removeAttribute("msg-type");
        }
    }
});

RongIMDemoDirective.directive("loadPortrait", function () {
    return {
        link: function ($scope, $element, $attr) {
            var s = $attr.loadPortrait.split("@"), val = $scope.friendsList.filter(function (item) {
                return item.id == s[0];
            })[0];
            if (!val)
                RongIMClient.getInstance().getUserInfo(s[0], {
                    onSuccess: function (x) {
                        $element[0].setAttribute("src", x.getPortraituri());
                    }, onError: function () {
                        $element[0].setAttribute("src", 'static/images/user.png');
                    }
                });
            else {
                if (s[1] == 1)
                    $element[0].setAttribute("src", $scope.owner.portrait);
                else
                    $element[0].setAttribute("src", val.portrait);
            }
        }
    }
});