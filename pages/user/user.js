const wx2my = require('../../wx2my');
//const Behavior = require('../../Behavior');
var t = getApp(),
    e = require("../../util/util.js"),
    n = 1;

Page({
  data: {
    isClick: !0,
    userInfo: {},
    isshowbtn: !1,
    route: ''
  },
  onLoad: function (t) {
    n = 1;
    var i = this;
    t.froms ? (this.setData({
      isshowbtn: !0
    }), this.getAlipayOppenid(function () {
      e.userAuthor(function (t) {
        i.setData({
          userInfo: t.data
        });
      });
    })) : this.getUserInfo();
  },
  getAlipayOppenid: function (i) {
    var o = this;
    my.getAuthCode({
      scopes: 'auth_user', // 主动授权（弹框）：auth_user，静默授权（不弹框）：auth_base
      success: (res) => {
        if (res.authCode) {
          res.authCode && t.httpRequest("/Auth/alipayOpendId", {
            code: res.authCode
          }, function (t) {
            if (t.data.openid) e.globalData.openID = t.data.openid, i();else {
              if (!(a < 3)) return void wx2my.showModal({
                title: "温馨提示",
                content: "尊敬的用户,您的openID未获取到,请您退出程序并再次进入重新获取"
              });
              wx2my.showToast({
                title: "openID获取失败",
                icon: "none"
              }), o.getAlipayOppenid(i), a++;
            }
          });
        }
      },
    });
  },
  getUserInfo: function () {
    var t = this;
    e.httpRequest("/user/getInfo", {}, function (e) {
      1 == e.code && t.setData({
        userInfo: e.data
      });
    });
  },
  returnDeposit: function () {
    var t = this;
    t.data.isClick && (t.setData({
      isClick: !1
    }), t.data.userInfo.balance <= 0 ? (wx2my.showToast({
      title: "当前账户没有余额",
      icon: "none"
    }), t.setData({
      isClick: !0
    })) : wx2my.showModal({
      title: "退款提醒",
      content: "亲,是否退款",
      success: function (n) {
        n.confirm && e.httpRequest("/payment/refund", {}, function (e) {
          1 == e.code && (t.setData({
            isClick: !0
          }), wx2my.showToast({
            title: "已退款" + e.data.amount + "元",
            icon: "none"
          }), t.getUserInfo());
        }, function () {
          t.setData({
            isClick: !0
          });
        });
      }
    }));
  },
  returnFreeze: function () {
    var t = this;
    t.data.isClick && (t.setData({
      isClick: !1
    }), t.data.userInfo.deposit <= 0 ? (wx2my.showToast({
      title: "当前账户没有资金",
      icon: "none"
    }), t.setData({
      isClick: !0
    })) : wx2my.showModal({
      title: "解冻提醒",
      content: "亲,是否解冻资金",
      success: function (n) {
        n.confirm && e.httpRequest("/payment/unfreeze", {}, function (e) {
          t.setData({
            isClick: !0
          }), wx2my.showToast({
            title: e.msg,
            icon: "none"
          });
        }, function () {
          t.setData({
            isClick: !0
          });
        });
      }
    }));
  },
  _scanCode: function () {
    var localThis = this;
    wx2my.scanCode({
      scanType: ["qrCode"],
      onlyFromCamera: !0,
      success: function (a) {
        if (a.result) {
          var i = a.result,
              n = e.returnQrcode(i);
          t.globalData.device_code = n.qrcode;
          if (n.oid == e.config.oid) switch (n.type) {
            case "cab":
              localThis.setData({
                route: ''
              });
              wx2my.navigateTo({
                url: "../adUploader/adUploader"
              });
              break;

            case "line":
              wx2my.showToast({
                title: '请扫描机柜二维码',
                mask: false
              });
          }
        }
      }
    });
  },
  ad_bussiness: function () {
    let localThis = this;

    if (!t.globalData.device_code) {
      wx2my.showModal({
        title: '提示',
        content: '缺少机柜编号，是否扫码获取？',
        confirmText: "立即扫码",
        cancelText: "取消",

        success(res) {
          if (res.confirm) {
            localThis.setData({
              route: 'ad_bussiness'
            });

            localThis._scanCode();
          } else if (res.cancel) {}
        }

      });
    } else {
      wx2my.navigateTo({
        url: "../adUploader/adUploader"
      });
    }
  }
});