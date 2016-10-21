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
Response  : String('success'||'failed')
params :
  +  email       :   邮箱地址当做用户名
  +  password    :   注册密码
```


## 前台登录接口
调用方式:
```bash
POST      : '/dologin'
Response  : user(JSON) && status('ok' or 'fail')
USE       : <% user% >  <% status%>
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