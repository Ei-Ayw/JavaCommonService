import React, { useState } from 'react';
import { Button, TextField, Typography, Box, Alert, Paper, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, MenuItem, Select, InputLabel } from '@mui/material';
import { Image as ImageIcon, DocumentScanner, Settings, Check } from '@mui/icons-material';
import fileProcessingApi from '../api/fileProcessingApi';

const FileProcessor = () => {
  const [fileId, setFileId] = useState('');
  const [processingType, setProcessingType] = useState('image');
  const [imageOperation, setImageOperation] = useState('compress');
  const [documentOperation, setDocumentOperation] = useState('generatePdf');
  const [params, setParams] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState(null);
  const [error, setError] = useState(null);

  const handleParamChange = (key, value) => {
    setParams({ ...params, [key]: value });
  };

  const handleProcess = async () => {
    if (!fileId.trim()) {
      setError('请输入文件ID');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessingResult(null);

    try {
      let result;
      const operation = processingType === 'image' ? imageOperation : documentOperation;

      if (processingType === 'image') {
        result = await fileProcessingApi.processImage(fileId, operation, params);
      } else {
        result = await fileProcessingApi.processDocument(fileId, operation, params);
      }

      setProcessingResult(result);
    } catch (err) {
      setError(err.response?.data?.message || '处理失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  // 渲染图片处理参数表单
  const renderImageParams = () => {
    switch (imageOperation) {
      case 'compress':
        return (
          <>
            <TextField
              label="压缩质量 (1-100)"
              type="number"
              fullWidth
              margin="normal"
              value={params.quality || 80}
              onChange={(e) => handleParamChange('quality', parseInt(e.target.value))}
              inputProps={{ min: 1, max: 100 }}
            />
          </>
        );
      case 'convert':
        return (
          <TextField
            label="目标格式"
            select
            fullWidth
            margin="normal"
            value={params.format || 'jpg'}
            onChange={(e) => handleParamChange('format', e.target.value)}
          >
            <MenuItem value="jpg">JPG</MenuItem>
            <MenuItem value="png">PNG</MenuItem>
            <MenuItem value="webp">WebP</MenuItem>
          </TextField>
        );
      case 'watermark':
        return (
          <>
            <TextField
              label="水印文本"
              fullWidth
              margin="normal"
              value={params.text || 'Watermark'}
              onChange={(e) => handleParamChange('text', e.target.value)}
            />
            <TextField
              label="字体大小"
              type="number"
              fullWidth
              margin="normal"
              value={params.fontSize || 24}
              onChange={(e) => handleParamChange('fontSize', parseInt(e.target.value))}
              inputProps={{ min: 8 }}
            />
          </>
        );
      case 'crop':
        return (
          <>
            <TextField
              label="宽度"
              type="number"
              fullWidth
              margin="normal"
              value={params.width || 0}
              onChange={(e) => handleParamChange('width', parseInt(e.target.value))}
              inputProps={{ min: 0 }}
            />
            <TextField
              label="高度"
              type="number"
              fullWidth
              margin="normal"
              value={params.height || 0}
              onChange={(e) => handleParamChange('height', parseInt(e.target.value))}
              inputProps={{ min: 0 }}
            />
            <TextField
              label="X坐标"
              type="number"
              fullWidth
              margin="normal"
              value={params.x || 0}
              onChange={(e) => handleParamChange('x', parseInt(e.target.value))}
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Y坐标"
              type="number"
              fullWidth
              margin="normal"
              value={params.y || 0}
              onChange={(e) => handleParamChange('y', parseInt(e.target.value))}
              inputProps={{ min: 0 }}
            />
          </>
        );
      default:
        return null;
    }
  };

  // 渲染文档处理参数表单
  const renderDocumentParams = () => {
    switch (documentOperation) {
      case 'generatePdf':
        return (
          <TextField
            label="文档标题"
            fullWidth
            margin="normal"
            value={params.title || ''}
            onChange={(e) => handleParamChange('title', e.target.value)}
          />
        );
      case 'importExcel':
        return (
          <TextField
            label="Sheet名称"
            fullWidth
            margin="normal"
            value={params.sheetName || 'Sheet1'}
            onChange={(e) => handleParamChange('sheetName', e.target.value)}
          />
        );
      case 'exportExcel':
        return (
          <>
            <TextField
              label="导出文件名"
              fullWidth
              margin="normal"
              value={params.filename || 'export'}
              onChange={(e) => handleParamChange('filename', e.target.value)}
            />
            <TextField
              label="Sheet名称"
              fullWidth
              margin="normal"
              value={params.sheetName || 'Sheet1'}
              onChange={(e) => handleParamChange('sheetName', e.target.value)}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        文件处理
      </Typography>

      <TextField
        label="文件ID"
        fullWidth
        margin="normal"
        value={fileId}
        onChange={(e) => setFileId(e.target.value)}
        placeholder="请输入要处理的文件ID"
      />

      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel component="legend">处理类型</FormLabel>
        <RadioGroup
          row
          value={processingType}
          onChange={(e) => {
            setProcessingType(e.target.value);
            setParams({});
          }}
        >
          <FormControlLabel value="image" control={<Radio />} label="图片处理" />
          <FormControlLabel value="document" control={<Radio />} label="文档处理" />
        </RadioGroup>
      </FormControl>

      {processingType === 'image' && (
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>图片操作</InputLabel>
          <Select
            value={imageOperation}
            label="图片操作"
            onChange={(e) => {
              setImageOperation(e.target.value);
              setParams({});
            }}
          >
            <MenuItem value="compress">压缩</MenuItem>
            <MenuItem value="convert">格式转换</MenuItem>
            <MenuItem value="watermark">添加水印</MenuItem>
            <MenuItem value="crop">裁剪</MenuItem>
          </Select>
        </FormControl>
      )}

      {processingType === 'document' && (
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>文档操作</InputLabel>
          <Select
            value={documentOperation}
            label="文档操作"
            onChange={(e) => {
              setDocumentOperation(e.target.value);
              setParams({});
            }}
          >
            <MenuItem value="generatePdf">生成PDF</MenuItem>
            <MenuItem value="importExcel">导入Excel</MenuItem>
            <MenuItem value="exportExcel">导出Excel</MenuItem>
          </Select>
        </FormControl>
      )}

      <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          <Settings size={16} sx={{ mr: 1, verticalAlign: 'middle' }} />
          操作参数
        </Typography>
        {processingType === 'image' ? renderImageParams() : renderDocumentParams()}
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={handleProcess}
        startIcon={isProcessing ? <Settings /> : processingType === 'image' ? <ImageIcon /> : <DocumentScanner />}
        fullWidth
        disabled={!fileId.trim() || isProcessing}
        sx={{ mb: 3 }}
      >
        {isProcessing ? '处理中...' : '开始处理'}
      </Button>

      {processingResult && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Check size={18} sx={{ mr: 1 }} />
          处理成功！处理后文件ID: {processingResult.fileId}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {processingResult && (
        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom>处理结果详情</Typography>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
            {JSON.stringify(processingResult, null, 2)}
          </pre>
        </Box>
      )}
    </Paper>
  );
};

export default FileProcessor;