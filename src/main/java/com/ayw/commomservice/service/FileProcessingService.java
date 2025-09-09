package com.ayw.commomservice.service;

import java.io.InputStream;
import java.util.Map;

public interface FileProcessingService {
    /**
     * 处理图片
     * @param fileId 源文件ID
     * @param operation 操作类型：compress, convert, watermark, crop
     * @param params 操作参数
     * @return 处理后文件的ID
     */
    String processImage(String fileId, String operation, Map<String, Object> params);

    /**
     * 处理文档
     * @param fileId 源文件ID
     * @param operation 操作类型：pdfGenerate, excelImport, excelExport
     * @param params 操作参数
     * @return 处理后文件的ID
     */
    String processDocument(String fileId, String operation, Map<String, Object> params);
}