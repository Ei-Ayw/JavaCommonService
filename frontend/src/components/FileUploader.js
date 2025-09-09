import React, { useState } from 'react';
import { Button, TextField, Typography, Box, Alert, Paper, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
import { UploadFile, ArrowRight, FileUpload, Check, CloudUpload } from '@mui/icons-material';
import storageApi from '../api/storageApi';

// 从环境变量中获取配置
const MAX_FILE_SIZE = process.env.REACT_APP_MAX_FILE_SIZE ? parseInt(process.env.REACT_APP_MAX_FILE_SIZE) : 524288000; // 默认500MB
const CHUNK_SIZE = process.env.REACT_APP_CHUNK_SIZE ? parseInt(process.env.REACT_APP_CHUNK_SIZE) : 5242880; // 默认5MB

const FileUploader = () => {
  const [file, setFile] = useState(null);
  const [uploadType, setUploadType] = useState('normal');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // 检查文件大小，使用环境变量中配置的最大值
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError(`文件大小不能超过${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB`);
        setFile(null);
      } else {
        setFile(selectedFile);
        setError(null);
      }
      setUploadResult(null);
      setProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('请选择文件');
      return;
    }

    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      let result;
      
      switch (uploadType) {
        case 'normal':
          result = await storageApi.uploadFile(file);
          break;
        case 'async':
          result = await storageApi.uploadFileAsync(file);
          break;
        case 'multipart':
          result = await handleMultipartUpload(file);
          break;
        default:
          result = await storageApi.uploadFile(file);
      }

      setUploadResult(result);
    } catch (err) {
      setError(err.response?.data?.message || '上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  const handleMultipartUpload = async (file) => {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const parts = [];

    try {
      // 1. 初始化分片上传
      const initResult = await storageApi.initMultipartUpload(file.name);
      const { uploadId, fileId } = initResult;

      // 2. 上传所有分片
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const partResult = await storageApi.uploadPart(uploadId, i + 1, fileId, chunk);
        parts.push({
          partNumber: i + 1,
          etag: partResult.etag,
        });

        // 更新进度
        setProgress(Math.round(((i + 1) / totalChunks) * 100));
      }

      // 3. 完成分片上传
      return storageApi.completeMultipartUpload(uploadId, fileId, parts);
    } catch (error) {
      throw error;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        文件上传
      </Typography>

      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel component="legend">上传方式</FormLabel>
        <RadioGroup value={uploadType} onChange={(e) => setUploadType(e.target.value)}>
          <FormControlLabel value="normal" control={<Radio />} label="普通上传" />
          <FormControlLabel value="async" control={<Radio />} label="异步上传" />
          <FormControlLabel value="multipart" control={<Radio />} label="分片上传（大文件）" />
        </RadioGroup>
      </FormControl>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadFile />}
          fullWidth
          disabled={isUploading}
        >
          选择文件
          <input
            type="file"
            hidden
            onChange={handleFileChange}
          />
        </Button>
        {file && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            已选择文件: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </Typography>
        )}
      </Box>

      {progress > 0 && (
        <Box sx={{ mb: 3 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">上传进度</Typography>
            <Typography variant="body2">{progress}%</Typography>
          </div>
          <div style={{ height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                backgroundColor: '#2196f3',
                width: `${progress}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </Box>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        startIcon={isUploading ? <CloudUpload /> : <FileUpload />}
        fullWidth
        disabled={!file || isUploading}
        sx={{ mb: 3 }}
      >
        {isUploading ? '上传中...' : '开始上传'}
      </Button>

      {uploadResult && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Check size={18} sx={{ mr: 1 }} />
          上传成功！文件ID: {uploadResult.fileId}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {uploadResult && (
        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom>上传结果详情</Typography>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
            {JSON.stringify(uploadResult, null, 2)}
          </pre>
        </Box>
      )}
    </Paper>
  );
};

export default FileUploader;