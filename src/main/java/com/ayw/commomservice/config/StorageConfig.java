package com.ayw.commomservice.config;

import com.ayw.commomservice.service.StorageService;
import com.ayw.commomservice.service.impl.AliyunOssStorageService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(StorageProperties.class)
public class StorageConfig {

    private final StorageProperties storageProperties;

    public StorageConfig(StorageProperties storageProperties) {
        this.storageProperties = storageProperties;
    }

    @Bean
    @ConditionalOnProperty(name = "storage.type", havingValue = "aliyun")
    public StorageService aliyunOssStorageService() {
        return new AliyunOssStorageService(storageProperties.getAliyun());
    }

    @Bean
    @ConditionalOnProperty(name = "storage.type", havingValue = "tencent")
    public StorageService tencentCosStorageService() {
        // 后续实现腾讯云COS存储服务
        throw new UnsupportedOperationException("Tencent COS storage service not implemented yet");
    }

    @Bean
    @ConditionalOnProperty(name = "storage.type", havingValue = "minio")
    public StorageService minioStorageService() {
        // 后续实现MinIO存储服务
        throw new UnsupportedOperationException("MinIO storage service not implemented yet");
    }
}