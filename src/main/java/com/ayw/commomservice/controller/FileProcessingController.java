package com.ayw.commomservice.controller;

import com.ayw.commomservice.service.FileProcessingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/file/process")
public class FileProcessingController {

    private final FileProcessingService fileProcessingService;

    @Autowired
    public FileProcessingController(FileProcessingService fileProcessingService) {
        this.fileProcessingService = fileProcessingService;
    }

    /**
     * 处理图片
     */
    @PostMapping("/image")
    public ResponseEntity<String> processImage(
            @RequestParam String fileId,
            @RequestParam String operation,
            @RequestBody Map<String, Object> params) {
        String processedFileId = fileProcessingService.processImage(fileId, operation, params);
        return ResponseEntity.ok(processedFileId);
    }

    /**
     * 处理文档
     */
    @PostMapping("/document")
    public ResponseEntity<String> processDocument(
            @RequestParam String fileId,
            @RequestParam String operation,
            @RequestBody Map<String, Object> params) {
        String processedFileId = fileProcessingService.processDocument(fileId, operation, params);
        return ResponseEntity.ok(processedFileId);
    }
}