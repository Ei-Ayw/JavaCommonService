package com.ayw.commomservice.service.impl;

import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import com.aliyun.oss.model.*;
import com.ayw.commomservice.config.StorageProperties;
import com.ayw.commomservice.service.StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.InputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class AliyunOssStorageService extends AbstractStorageService {
    private final Logger log = LoggerFactory.getLogger(AliyunOssStorageService.class);
    private final OSS ossClient;
    private final String bucketName;

    public AliyunOssStorageService(StorageProperties.Aliyun aliyunConfig) {
        // 创建OSS客户端实例
        this.ossClient = new OSSClientBuilder().build(
                aliyunConfig.getEndpoint(),
                aliyunConfig.getAccessKeyId(),
                aliyunConfig.getAccessKeySecret());
        this.bucketName = aliyunConfig.getBucketName();

        // 检查桶是否存在，如果不存在则创建
        if (!ossClient.doesBucketExist(bucketName)) {
            ossClient.createBucket(bucketName);
            log.info("Created bucket: {}", bucketName);
        } else {
            log.info("Bucket already exists: {}", bucketName);
        }
    }

    @Override
    public String upload(InputStream inputStream, String fileName, String contentType, Map<String, String> metadata) {
        try {
            // 生成文件ID
            String fileId = generateFileId(fileName);

            // 创建上传请求
            PutObjectRequest request = new PutObjectRequest(bucketName, fileId, inputStream);

            // 设置文件类型
            if (contentType != null) {
                ObjectMetadata objectMetadata = new ObjectMetadata();
                objectMetadata.setContentType(contentType);
                request.setMetadata(objectMetadata);
            }

            // 设置元数据
            if (metadata != null && !metadata.isEmpty()) {
                ObjectMetadata objectMetadata = request.getMetadata() != null ? request.getMetadata() : new ObjectMetadata();
                for (Map.Entry<String, String> entry : metadata.entrySet()) {
                    objectMetadata.addUserMetadata(entry.getKey(), entry.getValue());
                }
                request.setMetadata(objectMetadata);
            }

            // 执行上传
            ossClient.putObject(request);
            log.info("File uploaded successfully: {}", fileId);
            return fileId;
        } catch (Exception e) {
            log.error("Failed to upload file: {}", fileName, e);
            throw new RuntimeException("Failed to upload file", e);
        }
    }

    @Override
    public InputStream download(String fileId) {
        try {
            GetObjectRequest request = new GetObjectRequest(bucketName, fileId);
            OSSObject ossObject = ossClient.getObject(request);
            log.info("File downloaded successfully: {}", fileId);
            return ossObject.getObjectContent();
        } catch (Exception e) {
            log.error("Failed to download file: {}", fileId, e);
            throw new RuntimeException("Failed to download file", e);
        }
    }

    @Override
    public boolean delete(String fileId) {
        try {
            ossClient.deleteObject(bucketName, fileId);
            log.info("File deleted successfully: {}", fileId);
            return true;
        } catch (Exception e) {
            log.error("Failed to delete file: {}", fileId, e);
            return false;
        }
    }

    @Override
    public String generatePresignedUrl(String fileId, long expireSeconds) {
        try {
            // 设置URL过期时间
            Date expiration = new Date(System.currentTimeMillis() + expireSeconds * 1000);

            // 生成预签名URL
            URL url = ossClient.generatePresignedUrl(bucketName, fileId, expiration);
            log.info("Generated presigned URL for file: {}", fileId);
            return url.toString();
        } catch (Exception e) {
            log.error("Failed to generate presigned URL for file: {}", fileId, e);
            throw new RuntimeException("Failed to generate presigned URL", e);
        }
    }

    @Override
    public String initiateMultipartUpload(String fileName, String contentType, long fileSize) {
        try {
            // 生成文件ID
            String fileId = generateFileId(fileName);

            // 创建分片上传请求
            InitiateMultipartUploadRequest request = new InitiateMultipartUploadRequest(bucketName, fileId);

            // 设置文件类型
            if (contentType != null) {
                ObjectMetadata objectMetadata = new ObjectMetadata();
                objectMetadata.setContentType(contentType);
                request.setObjectMetadata(objectMetadata);
            }

            // 初始化分片上传
            InitiateMultipartUploadResult result = ossClient.initiateMultipartUpload(request);
            log.info("Initiated multipart upload for file: {}", fileId);
            return result.getUploadId();
        } catch (Exception e) {
            log.error("Failed to initiate multipart upload for file: {}", fileName, e);
            throw new RuntimeException("Failed to initiate multipart upload", e);
        }
    }

    @Override
    public String uploadPart(String uploadId, int partNumber, InputStream inputStream, long partSize) {
        try {
            // 解析文件ID（假设uploadId包含文件ID信息）
            // 实际应用中，可能需要维护uploadId和fileId的映射关系
            String fileId = getFileIdFromUploadId(uploadId);

            // 创建分片上传请求
            UploadPartRequest request = new UploadPartRequest();
            request.setBucketName(bucketName);
            request.setKey(fileId);
            request.setUploadId(uploadId);
            request.setPartNumber(partNumber);
            request.setInputStream(inputStream);
            request.setPartSize(partSize);

            // 上传分片
            UploadPartResult result = ossClient.uploadPart(request);
            log.info("Uploaded part {} for file: {}", partNumber, fileId);
            return result.getETag();
        } catch (Exception e) {
            log.error("Failed to upload part {} for uploadId: {}", partNumber, uploadId, e);
            throw new RuntimeException("Failed to upload part", e);
        }
    }

    @Override
    public String completeMultipartUpload(String uploadId, Map<Integer, String> parts) {
        try {
            // 解析文件ID
            String fileId = getFileIdFromUploadId(uploadId);

            // 创建分片列表
            List<PartETag> partETags = new ArrayList<>();
            for (Map.Entry<Integer, String> entry : parts.entrySet()) {
                partETags.add(new PartETag(entry.getKey(), entry.getValue()));
            }

            // 创建完成分片上传请求
            CompleteMultipartUploadRequest request = new CompleteMultipartUploadRequest(
                    bucketName, fileId, uploadId, partETags);

            // 完成分片上传
            CompleteMultipartUploadResult result = ossClient.completeMultipartUpload(request);
            log.info("Completed multipart upload for file: {}", fileId);
            return fileId;
        } catch (Exception e) {
            log.error("Failed to complete multipart upload for uploadId: {}", uploadId, e);
            throw new RuntimeException("Failed to complete multipart upload", e);
        }
    }

    /**
     * 从uploadId中解析文件ID
     * 实际应用中，可能需要维护uploadId和fileId的映射关系
     */
    private String getFileIdFromUploadId(String uploadId) {
        // 这里简化实现，假设uploadId格式为{fileId}-{randomString}
        int separatorIndex = uploadId.indexOf('-');
        if (separatorIndex > 0) {
            return uploadId.substring(0, separatorIndex);
        }
        // 如果格式不符合预期，返回默认值
        return "unknown-file-id";
    }
}