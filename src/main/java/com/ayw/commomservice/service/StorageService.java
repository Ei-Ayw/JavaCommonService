package com.ayw.commomservice.service;

import java.io.InputStream;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

public interface StorageService {
    /**
     * 上传文件
     * @param inputStream 文件输入流
     * @param fileName 文件名
     * @param contentType 文件类型
     * @param metadata 元数据
     * @return 文件ID
     */
    String upload(InputStream inputStream, String fileName, String contentType, Map<String, String> metadata);

    /**
     * 异步上传文件
     * @param inputStream 文件输入流
     * @param fileName 文件名
     * @param contentType 文件类型
     * @param metadata 元数据
     * @return 包含文件ID的CompletableFuture
     */
    CompletableFuture<String> uploadAsync(InputStream inputStream, String fileName, String contentType, Map<String, String> metadata);

    /**
     * 下载文件
     * @param fileId 文件ID
     * @return 文件输入流
     */
    InputStream download(String fileId);

    /**
     * 删除文件
     * @param fileId 文件ID
     * @return 是否删除成功
     */
    boolean delete(String fileId);

    /**
     * 生成带时效的访问签名URL
     * @param fileId 文件ID
     * @param expireSeconds 过期秒数
     * @return 带签名的URL
     */
    String generatePresignedUrl(String fileId, long expireSeconds);

    /**
     * 分片上传初始化
     * @param fileName 文件名
     * @param contentType 文件类型
     * @param fileSize 文件大小
     * @return 分片上传ID
     */
    String initiateMultipartUpload(String fileName, String contentType, long fileSize);

    /**
     * 上传分片
     * @param uploadId 分片上传ID
     * @param partNumber 分片编号
     * @param inputStream 分片输入流
     * @param partSize 分片大小
     * @return 分片ETag
     */
    String uploadPart(String uploadId, int partNumber, InputStream inputStream, long partSize);

    /**
     * 完成分片上传
     * @param uploadId 分片上传ID
     * @param parts 分片信息
     * @return 文件ID
     */
    String completeMultipartUpload(String uploadId, Map<Integer, String> parts);
}