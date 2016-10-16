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