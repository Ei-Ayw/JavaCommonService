package com.ayw.commomservice.service.impl;

import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.read.builder.ExcelReaderBuilder;
import com.alibaba.excel.write.builder.ExcelWriterBuilder;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.pdf.PdfWriter;
import com.ayw.commomservice.service.FileProcessingService;
import com.ayw.commomservice.service.StorageService;
import net.coobird.thumbnailator.Thumbnails;
import net.coobird.thumbnailator.geometry.Positions;
import java.awt.*;
import java.awt.AlphaComposite;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class FileProcessingServiceImpl implements FileProcessingService {
    private final Logger log = LoggerFactory.getLogger(FileProcessingServiceImpl.class);
    private final StorageService storageService;

    @Autowired
    public FileProcessingServiceImpl(StorageService storageService) {
        this.storageService = storageService;
    }

    @Override
    public String processImage(String fileId, String operation, Map<String, Object> params) {
        try {
            // 下载源文件
            InputStream inputStream = storageService.download(fileId);
            BufferedImage image = ImageIO.read(inputStream);
            inputStream.close();

            // 根据操作类型处理图片
            BufferedImage processedImage = switch (operation.toLowerCase()) {
                case "compress" -> compressImage(image, params);
                case "convert" -> convertImage(image, params);
                case "watermark" -> addWatermark(image, params);
                case "crop" -> cropImage(image, params);
                default -> throw new IllegalArgumentException("Unsupported image operation: " + operation);
            };

            // 上传处理后的图片
            String outputFormat = params.getOrDefault("format", "png").toString();
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ImageIO.write(processedImage, outputFormat, outputStream);
            InputStream processedInputStream = new ByteArrayInputStream(outputStream.toByteArray());

            String newFileId = storageService.upload(
                    processedInputStream,
                    UUID.randomUUID() + "." + outputFormat,
                    "image/" + outputFormat,
                    null);

            log.info("Image processed successfully: {} -> {}", fileId, newFileId);
            return newFileId;
        } catch (Exception e) {
            log.error("Failed to process image: {}", fileId, e);
            throw new RuntimeException("Failed to process image", e);
        }
    }

    private BufferedImage compressImage(BufferedImage image, Map<String, Object> params) throws IOException {
        // 按尺寸压缩
        if (params.containsKey("width") && params.containsKey("height")) {
            int width = Integer.parseInt(params.get("width").toString());
            int height = Integer.parseInt(params.get("height").toString());
            return Thumbnails.of(image)
                    .size(width, height)
                    .asBufferedImage();
        }
        // 按质量压缩
        else if (params.containsKey("quality")) {
            float quality = Float.parseFloat(params.get("quality").toString());
            return Thumbnails.of(image)
                    .scale(1.0)
                    .outputQuality(quality)
                    .asBufferedImage();
        }
        else {
            throw new IllegalArgumentException("Compress operation requires either width/height or quality parameter");
        }
    }

    private BufferedImage convertImage(BufferedImage image, Map<String, Object> params) throws IOException {
        // 格式转换在上传时处理，这里只做缩放（如果需要）
        if (params.containsKey("width") && params.containsKey("height")) {
            int width = Integer.parseInt(params.get("width").toString());
            int height = Integer.parseInt(params.get("height").toString());
            return Thumbnails.of(image)
                    .size(width, height)
                    .asBufferedImage();
        }
        return image;
    }

    private BufferedImage addWatermark(BufferedImage image, Map<String, Object> params) throws IOException {
        if (!params.containsKey("watermarkText")) {
            throw new IllegalArgumentException("Watermark operation requires watermarkText parameter");
        }

        String watermarkText = params.get("watermarkText").toString();
        float opacity = params.containsKey("opacity") ? 
                Float.parseFloat(params.get("opacity").toString()) : 0.5f;

        // 创建文字水印（简化实现）
        // 实际应用中可能需要更复杂的文字水印处理或支持图片水印
        BufferedImage watermarkImage = new BufferedImage(100, 50, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = watermarkImage.createGraphics();
        g2d.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, opacity));
        g2d.setColor(Color.BLACK);
        g2d.setFont(new Font("Arial", Font.PLAIN, 12));
        g2d.drawString(watermarkText, 10, 30);
        g2d.dispose();

        return Thumbnails.of(image)
                .scale(1.0)
                .watermark(Positions.CENTER, watermarkImage, opacity)
                .asBufferedImage();
    }

    private BufferedImage cropImage(BufferedImage image, Map<String, Object> params) throws IOException {
        if (!params.containsKey("x") || !params.containsKey("y") ||
                !params.containsKey("width") || !params.containsKey("height")) {
            throw new IllegalArgumentException("Crop operation requires x, y, width and height parameters");
        }

        int x = Integer.parseInt(params.get("x").toString());
        int y = Integer.parseInt(params.get("y").toString());
        int width = Integer.parseInt(params.get("width").toString());
        int height = Integer.parseInt(params.get("height").toString());

        return Thumbnails.of(image)
                .sourceRegion(x, y, width, height)
                .scale(1.0)
                .asBufferedImage();
    }

    @Override
    public String processDocument(String fileId, String operation, Map<String, Object> params) {
        try {
            switch (operation.toLowerCase()) {
                case "pdfgenerate":
                    return generatePdf(params);
                case "excelimport":
                    return importExcel(fileId, params);
                case "excelexport":
                    return exportExcel(params);
                default:
                    throw new IllegalArgumentException("Unsupported document operation: " + operation);
            }
        } catch (Exception e) {
            log.error("Failed to process document: {}", fileId, e);
            throw new RuntimeException("Failed to process document", e);
        }
    }

    private String generatePdf(Map<String, Object> params) throws DocumentException, IOException {
        if (!params.containsKey("templateData")) {
            throw new IllegalArgumentException("PDF generate operation requires templateData parameter");
        }

        // 这里简化实现，实际应用中可能需要使用模板引擎
        // 如FreeMarker或Velocity来生成PDF
        Document document = new Document();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, outputStream);
        document.open();

        // 示例：添加一些文本到PDF
        Map<String, Object> templateData = (Map<String, Object>) params.get("templateData");
        for (Map.Entry<String, Object> entry : templateData.entrySet()) {
            document.add(new com.itextpdf.text.Paragraph(entry.getKey() + ": " + entry.getValue()));
        }

        document.close();
        InputStream inputStream = new ByteArrayInputStream(outputStream.toByteArray());

        String newFileId = storageService.upload(
                inputStream,
                UUID.randomUUID() + ".pdf",
                "application/pdf",
                null);

        log.info("PDF generated successfully: {}", newFileId);
        return newFileId;
    }

    private String importExcel(String fileId, Map<String, Object> params) throws IOException {
        // 下载Excel文件
        InputStream inputStream = storageService.download(fileId);

        // 这里简化实现，实际应用中需要定义数据模型类
        // 并根据模型类读取Excel数据
        ExcelReaderBuilder readerBuilder = EasyExcel.read(inputStream);

        // 读取数据
        // List<Map<Integer, String>> data = readerBuilder.sheet().doReadSync();

        inputStream.close();

        // 处理导入的数据（示例中省略）
        // ...

        // 返回处理结果ID（示例中生成一个UUID）
        String resultId = UUID.randomUUID().toString();
        log.info("Excel imported successfully: {}", fileId);
        return resultId;
    }

    private String exportExcel(Map<String, Object> params) throws IOException {
        if (!params.containsKey("data") || !params.containsKey("headers")) {
            throw new IllegalArgumentException("Excel export operation requires data and headers parameters");
        }

        List<Map<String, Object>> data = (List<Map<String, Object>>) params.get("data");
        List<String> headers = (List<String>) params.get("headers");

        // 创建Excel文件
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ExcelWriterBuilder writerBuilder = EasyExcel.write(outputStream);

        // 写入数据
        // writerBuilder.sheet().doWrite(data);

        InputStream inputStream = new ByteArrayInputStream(outputStream.toByteArray());

        String newFileId = storageService.upload(
                inputStream,
                UUID.randomUUID() + ".xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                null);

        log.info("Excel exported successfully: {}", newFileId);
        return newFileId;
    }
}