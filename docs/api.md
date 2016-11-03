## 前台轮播api
调用方式:
```bash
POST      : '/getBanner'
Response  : Array
structure :
  +  type        :   carousel(轮播)
  +  image_url   :   banner图片路径
  +  upload_time :   上传时间(时间戳)
  +  status      :   图片状态(NEW,DELETE)
```


## 前台头部广告图片api
调用方式:
```bash
POST      : '/getHeadBanner'
Response  : JSON
structure :
  +  type        :   headBanner(轮播)
  +  image_url   :   banner图片路径
  +  upload_time :   上传时间(时间戳)
  +  status      :   图片状态(NEW,DELETE)
```


## 前台注册接口
调用方式:
```bash
POST      : '/doregister'
Response  : {error_msg: [], info: "", result: "success", code: ""}

状态码 | 状态值
------|-------------
2000  | 注册成功
2001  | 用户已存在
2002  | 服务器错误

params :
  +  email       :   邮箱地址当做用户名
  +  password    :   注册密码
```


## 前台登录接口
调用方式:
```bash
POST      : '/dologin'
Response  :  Response  : {error_msg: [], info: user, result: "success", code: ""}

 状态码 | 状态值
 ------|-------------
 1000  | 登录成功
 1001  | 账号或密码错误
 1002  | 服务器错误

USE       : <%= user% >  <%= status%>
USER structure:
  +   name: String
  +   password: String
  +   mobile: String
  +   nick_name: String
  +   level: String
  +   levelName: String
  +   userType: String
  +   registerTime: Number
params :
  +  name       :    即为邮箱地址
  +  password    :   注册密码
```

## 首页类目接口
调用方式:
```bash
URL      : '/'
Response  : categories []
USE       : <%= categories% >  PS(forEach)
categories structure:
  +   firstCategory: String,
  +   secondCategory: [{secondTitle:String,thirdTitle:[]}]
  firstCategory: 一级类目
  secondTitle  : 二级类目(多个)
  thirdTitle   : 三级类目(多个)
```

## 首页最热标签接口
调用方式:
```bash
URL      : '/'
Response  : hotLabels []
USE       : <%= hotLabels% >  PS(forEach)
categories structure:
  +   label_name: String,
  +   color_name: String,
  +   belong_category:String,
  +   add_time:Number
```


## 保存为新增类目接口

### 返回状态码

 状态码 | 状态值
 ------|-------------
 200   | 保存类目成功
 400   | 缺失(未找到)参数,保存失败
 500   | 服务器错误

### End Point:
``` bash
curl -H "Content-Type: application/json \
               -X POST -d '{"firstCategory":"1","secondCategory":"2","thirdCategory":"3","addBy":"admin","status":"NEW"}' \
               http://<host>/admin/uploadTemporary
```

### Response Success
```bash
{
    "error_msg": [],
    "info": {
        "firstCategory": "123",
        "secondCategory": "456",
        "thirdCategory": "567",
        "upload_time": "1477933258",
        "status": "NEW"
    },
    "result": "success",
    "code": "200"
}
```

### Response Failed
```bash
{
    "error_msg": [
        "FORMAT ERROR"
    ],
    "info": "",
    "result": "fail",
    "code": "400"
}
```

### Response Failed
```bash
{
    "error_msg": [
        "INTERNAL SERVER ERROR"
    ],
    "info": "",
    "result": "fail",
    "code": "500"
}
```


## 点击上传产品页面,上部导航栏接口

![](../public/api_images/landing.png)

### 返回状态码

 状态码 | 状态值
 ------|-------------
 200   | 保存类目成功
 400   | 缺失(未找到)参数,保存失败
 500   | 服务器错误

### End Point:
``` bash
curl -H "Content-Type: application/json \
               -X POST -d '[{"firstCategory":"1","secondCategory":"2","thirdCategory":"3","addBy":"admin","status":"NEW"},{"firstCategory":"1","secondCategory":"2","thirdCategory":"3","addBy":"admin","status":"NEW"}]' \
               http://<host>/admin/uploadProductsDetail
```

Return Render Page:

```bash
    http://<host>/admin/upload-products-detail
```
### Calling

```bash
    <%= info%>
    <%= status%>
```


### Response Success
```bash
{
    "error_msg": [

    ],
    "info": [
        {
            firstCategory: 'test111',
            secondCategory: 'test2222',
            thirdCategory: 'test33333',
            addBy: undefined,
            status: 'NEW'
        },
        {
            firstCategory: 'test222',
            secondCategory: 'test2222',
            thirdCategory: 'test33333',
            addBy: undefined,
            status: 'NEW'
        }
    ],
    "result": "success",
    "code": "200",
    "username": "admin"
}
```

### Response Failed
```bash
{
    "error_msg": [
        "FORMAT ERROR"
    ],
    "info": "",
    "result": "fail",
    "code": "400",
    "username":"admin"
}
```

### Response Failed
```bash
{
    "error_msg": [
        "INTERNAL SERVER ERROR"
    ],
    "info": "",
    "result": "fail",
    "code": "500",
    "username":"admin"
}
```



