package com.ayw.commomservice.controller;

import com.ayw.commomservice.service.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/storage")
public class StorageController {

    private final StorageService storageService;

    @Autowired
    public StorageController(StorageService storageService) {
        this.storageService = storageService;
    }

    /**
     * 上传文件
     */
    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) Map<String, String> metadata) {
        try (InputStream inputStream = file.getInputStream()) {
            String fileId = storageService.upload(
                    inputStream,
                    file.getOriginalFilename(),
                    file.getContentType(),
                    metadata);
            return ResponseEntity.ok(fileId);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload file: " + e.getMessage());
        }
    }

    /**
     * 异步上传文件
     */
    @PostMapping("/upload-async")
    public ResponseEntity<CompletableFuture<String>> uploadFileAsync(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) Map<String, String> metadata) {
        try (InputStream inputStream = file.getInputStream()) {
            CompletableFuture<String> fileIdFuture = storageService.uploadAsync(
                    inputStream,
                    file.getOriginalFilename(),
                    file.getContentType(),
                    metadata);
            return ResponseEntity.ok(fileIdFuture);
        } catch (IOException e) {
            CompletableFuture<String> failedFuture = new CompletableFuture<>();
            failedFuture.completeExceptionally(
                    new RuntimeException("Failed to upload file: " + e.getMessage()));
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(failedFuture);
        }
    }

    /**
     * 下载文件
     */
    @GetMapping("/download/{fileId}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable String fileId) {
        try (InputStream inputStream = storageService.download(fileId)) {
            byte[] content = inputStream.readAllBytes();
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileId + "\"");
            return new ResponseEntity<>(content, headers, HttpStatus.OK);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(("File not found: " + fileId).getBytes());
        }
    }

    /**
     * 删除文件
     */
    @DeleteMapping("/delete/{fileId}")
    public ResponseEntity<Boolean> deleteFile(@PathVariable String fileId) {
        boolean deleted = storageService.delete(fileId);
        if (deleted) {
            return ResponseEntity.ok(true);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(false);
        }
    }

    /**
     * 生成带时效的访问签名URL
     */
    @GetMapping("/presigned-url/{fileId}")
    public ResponseEntity<String> generatePresignedUrl(
            @PathVariable String fileId,
            @RequestParam(defaultValue = "3600") long expireSeconds) {
        String presignedUrl = storageService.generatePresignedUrl(fileId, expireSeconds);
        return ResponseEntity.ok(presignedUrl);
    }

    /**
     * 分片上传初始化
     */
    @PostMapping("/multipart/init")
    public ResponseEntity<String> initiateMultipartUpload(
            @RequestParam String fileName,
            @RequestParam String contentType,
            @RequestParam long fileSize) {
        String uploadId = storageService.initiateMultipartUpload(fileName, contentType, fileSize);
        return ResponseEntity.ok(uploadId);
    }

    /**
     * 上传分片
     */
    @PostMapping("/multipart/upload")
    public ResponseEntity<String> uploadPart(
            @RequestParam String uploadId,
            @RequestParam int partNumber,
            @RequestParam("file") MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            String eTag = storageService.uploadPart(uploadId, partNumber, inputStream, file.getSize());
            return ResponseEntity.ok(eTag);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload part: " + e.getMessage());
        }
    }

    /**
     * 完成分片上传
     */
    @PostMapping("/multipart/complete")
    public ResponseEntity<String> completeMultipartUpload(
            @RequestParam String uploadId,
            @RequestBody Map<Integer, String> parts) {
        String fileId = storageService.completeMultipartUpload(uploadId, parts);
        return ResponseEntity.ok(fileId);
    }
}