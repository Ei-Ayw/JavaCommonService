package com.ayw.commomservice.service.impl;

import com.ayw.commomservice.service.StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.InputStream;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

public abstract class AbstractStorageService implements StorageService {
    protected final Logger log = LoggerFactory.getLogger(getClass());

    /**
     * 生成唯一的文件ID
     * @param fileName 原始文件名
     * @return 唯一文件ID
     */
    protected String generateFileId(String fileName) {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        int extensionIndex = fileName.lastIndexOf('.');
        if (extensionIndex > 0) {
            String extension = fileName.substring(extensionIndex);
            return uuid + extension;
        }
        return uuid;
    }

    /**
     * 验证文件格式
     * @param fileName 文件名
     * @param allowedExtensions 允许的扩展名列表
     * @return 是否验证通过
     */
    protected boolean validateFileExtension(String fileName, String[] allowedExtensions) {
        if (allowedExtensions == null || allowedExtensions.length == 0) {
            return true;
        }

        String lowerCaseFileName = fileName.toLowerCase();
        for (String extension : allowedExtensions) {
            if (lowerCaseFileName.endsWith('.' + extension.toLowerCase())) {
                return true;
            }
        }
        return false;
    }

    /**
     * 异步上传文件的默认实现
     * @param inputStream 文件输入流
     * @param fileName 文件名
     * @param contentType 文件类型
     * @param metadata 元数据
     * @return 包含文件ID的CompletableFuture
     */
    @Override
    public CompletableFuture<String> uploadAsync(InputStream inputStream, String fileName, String contentType, Map<String, String> metadata) {
        return CompletableFuture.supplyAsync(() -> upload(inputStream, fileName, contentType, metadata));
    }
}