import React, { useState, useEffect } from 'react';
import { Button, TextField, Typography, Box, Alert, Paper, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Download, Delete, Link, Search, Refresh, Check, X } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import storageApi from '../api/storageApi';

const FileManager = () => {
  const [fileList, setFileList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [presignedUrlDialogOpen, setPresignedUrlDialogOpen] = useState(false);
  const [presignedUrl, setPresignedUrl] = useState('');
  const [expireSeconds, setExpireSeconds] = useState(3600); // 默认1小时

  // 模拟文件列表数据
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 由于实际后端没有提供获取文件列表的API，这里使用模拟数据
      // 在实际项目中，应该调用真实的API获取文件列表
      const mockFiles = [
        {
          id: 'file123',
          name: 'example.jpg',
          size: 2048000, // 2MB
          type: 'image/jpeg',
          uploadTime: new Date(Date.now() - 86400000).toISOString(), // 1天前
          storagePath: 'images/example.jpg',
        },
        {
          id: 'file456',
          name: 'document.pdf',
          size: 5120000, // 5MB
          type: 'application/pdf',
          uploadTime: new Date(Date.now() - 172800000).toISOString(), // 2天前
          storagePath: 'documents/document.pdf',
        },
        {
          id: 'file789',
          name: 'data.xlsx',
          size: 1024000, // 1MB
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          uploadTime: new Date(Date.now() - 259200000).toISOString(), // 3天前
          storagePath: 'excel/data.xlsx',
        },
      ];

      // 添加搜索过滤
      const filteredFiles = searchTerm
        ? mockFiles.filter(file => 
            file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            file.id.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : mockFiles;

      setFileList(filteredFiles);
    } catch (err) {
      setError('获取文件列表失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchFiles();
  };

  const handleDownload = (fileId) => {
    try {
      storageApi.downloadFile(fileId);
    } catch (err) {
      setError('下载文件失败，请重试');
    }
  };

  const handleDelete = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);

    try {
      await storageApi.deleteFile(selectedFile.id);
      // 在实际项目中，这里会重新获取文件列表
      // 由于使用的是模拟数据，这里直接从本地状态中移除
      setFileList(fileList.filter(file => file.id !== selectedFile.id));
      setDeleteDialogOpen(false);
      setSelectedFile(null);
    } catch (err) {
      setError('删除文件失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePresignedUrl = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await storageApi.generatePresignedUrl(selectedFile.id, expireSeconds);
      setPresignedUrl(result.url);
      setPresignedUrlDialogOpen(true);
    } catch (err) {
      setError('生成签名URL失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(presignedUrl).then(() => {
      alert('URL已复制到剪贴板');
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  };

  const columns = [
    {
      field: 'name',
      headerName: '文件名',
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'size',
      headerName: '大小',
      width: 100,
      valueFormatter: (params) => formatFileSize(params.value),
    },
    {
      field: 'type',
      headerName: '类型',
      width: 150,
    },
    {
      field: 'uploadTime',
      headerName: '上传时间',
      width: 200,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      field: 'id',
      headerName: '文件ID',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: '操作',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => handleDownload(params.row.id)}
            title="下载"
          >
            <Download size={16} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              setSelectedFile(params.row);
              handleGeneratePresignedUrl();
            }}
            title="生成签名URL"
          >
            <Link size={16} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              setSelectedFile(params.row);
              setDeleteDialogOpen(true);
            }}
            title="删除"
            sx={{ color: 'error.main' }}
          >
            <Delete size={16} />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        文件管理
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          label="搜索文件名或ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          startIcon={<Search />}
        >
          搜索
        </Button>
        <Button
          variant="outlined"
          onClick={fetchFiles}
          startIcon={<Refresh />}
          disabled={isLoading}
        >
          刷新
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={fileList}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          loading={isLoading}
          getRowId={(row) => row.id}
          sx={{
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: '#f5f5f5',
            },
          }}
          onRowClick={(params) => setSelectedFile(params.row)}
        />
      </Box>

      {/* 删除确认对话框 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            您确定要删除文件 "{selectedFile?.name}" 吗？此操作不可撤销。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            取消
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            disabled={isLoading}
          >
            {isLoading ? '删除中...' : '删除'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 签名URL对话框 */}
      <Dialog
        open={presignedUrlDialogOpen}
        onClose={() => setPresignedUrlDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>文件签名URL</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            签名URL有效期：{expireSeconds / 3600} 小时
          </DialogContentText>
          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={presignedUrl}
              variant="outlined"
              InputProps={{ readOnly: true }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleCopyUrl}
              sx={{ position: 'absolute', right: 8, top: 8 }}
              startIcon={<Check size={16} />}
            >
              复制
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPresignedUrlDialogOpen(false)}>
            关闭
          </Button>
          <Button
            variant="outlined"
            onClick={() => window.open(presignedUrl, '_blank')}
          >
            打开链接
          </Button>
        </DialogActions>
      </Dialog>

      {fileList.length === 0 && !isLoading && (
        <Box sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
          <Typography variant="body1">暂无文件数据</Typography>
        </Box>
      )}
    </Paper>
  );
};

export default FileManager;