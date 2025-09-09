# CommonService API 文档

## 项目概述
CommonService是一个集成了多种常用服务的后端服务，提供云存储、文件处理、第三方服务集成等功能的统一API接口。

## 已实现功能

### 1. 云存储服务
提供多平台对象存储统一接口，支持阿里云OSS、腾讯云COS、MinIO等。

#### API接口
- **上传文件**
  - URL: `/api/storage/upload`
  - 方法: `POST`
  - 参数:
    - `file`: 要上传的文件
    - `metadata`: 可选，文件元数据
  - 返回: 文件ID

- **异步上传文件**
  - URL: `/api/storage/upload-async`
  - 方法: `POST`
  - 参数:
    - `file`: 要上传的文件
    - `metadata`: 可选，文件元数据
  - 返回: 包含文件ID的CompletableFuture

- **下载文件**
  - URL: `/api/storage/download/{fileId}`
  - 方法: `GET`
  - 参数:
    - `fileId`: 文件ID
  - 返回: 文件内容

- **删除文件**
  - URL: `/api/storage/delete/{fileId}`
  - 方法: `DELETE`
  - 参数:
    - `fileId`: 文件ID
  - 返回: 是否删除成功

- **生成带时效的访问签名URL**
  - URL: `/api/storage/presigned-url/{fileId}`
  - 方法: `GET`
  - 参数:
    - `fileId`: 文件ID
    - `expireSeconds`: 可选，过期秒数，默认3600
  - 返回: 带签名的URL

- **分片上传初始化**
  - URL: `/api/storage/multipart/init`
  - 方法: `POST`
  - 参数:
    - `fileName`: 文件名
    - `contentType`: 文件类型
    - `fileSize`: 文件大小
  - 返回: 分片上传ID

- **上传分片**
  - URL: `/api/storage/multipart/upload`
  - 方法: `POST`
  - 参数:
    - `uploadId`: 分片上传ID
    - `partNumber`: 分片编号
    - `file`: 分片文件
  - 返回: 分片ETag

- **完成分片上传**
  - URL: `/api/storage/multipart/complete`
  - 方法: `POST`
  - 参数:
    - `uploadId`: 分片上传ID
    - `parts`: 分片信息（键为分片编号，值为ETag）
  - 返回: 文件ID

### 2. 文件处理服务
提供图片处理和文档处理功能。

#### API接口
- **处理图片**
  - URL: `/api/file/process/image`
  - 方法: `POST`
  - 参数:
    - `fileId`: 源文件ID
    - `operation`: 操作类型（compress, convert, watermark, crop）
    - `params`: 操作参数
  - 返回: 处理后文件的ID

- **处理文档**
  - URL: `/api/file/process/document`
  - 方法: `POST`
  - 参数:
    - `fileId`: 源文件ID
    - `operation`: 操作类型（pdfGenerate, excelImport, excelExport）
    - `params`: 操作参数
  - 返回: 处理后文件的ID

## 配置说明
在`application.yml`中配置存储服务类型和相关参数：

```yaml
storage:
  type: aliyun  # 可选值: aliyun, tencent, minio
  aliyun:
    endpoint: https://oss-cn-hangzhou.aliyuncs.com
    access-key-id: your-access-key-id
    access-key-secret: your-access-key-secret
    bucket-name: your-bucket-name
    region: oss-cn-hangzhou
  # 其他存储平台配置...
```

## 下一步计划
1. 实现腾讯云COS和MinIO的存储服务接口
2. 集成第三方服务（短信、邮件、推送等）
3. 实现AI/模型服务API
4. 开发企业级应用与办公协同功能
5. 添加开发提效工具

## 使用示例
### 上传文件
```bash
curl -X POST -F "file=@test.jpg" http://localhost:8080/api/storage/upload
```

### 下载文件
```bash
curl -X GET http://localhost:8080/api/storage/download/{fileId} -o test.jpg
```

### 处理图片（压缩）
```bash
curl -X POST -H "Content-Type: application/json" -d '{"width": 200, "height": 200}' http://localhost:8080/api/file/process/image?fileId={fileId}&operation=compress
```