import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Container, Paper, AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Menu, ChevronRight, Upload, Image, DocumentScanner, Storage, Settings, Help, Home, Logout } from '@mui/icons-material';
import FileUploader from '../components/FileUploader';
import FileProcessor from '../components/FileProcessor';
import FileManager from '../components/FileManager';

const MainPage = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawerContent = (
    <Box sx={{ width: 250 }}>
      <Toolbar>
        <Typography variant="h6" noWrap>
          CommonService
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem button onClick={() => { setSelectedTab(0); setDrawerOpen(false); }}>
          <ListItemIcon>
            <Home />
          </ListItemIcon>
          <ListItemText primary="仪表盘" />
        </ListItem>
        <ListItem button onClick={() => { setSelectedTab(1); setDrawerOpen(false); }}>
          <ListItemIcon>
            <Upload />
          </ListItemIcon>
          <ListItemText primary="文件上传" />
        </ListItem>
        <ListItem button onClick={() => { setSelectedTab(2); setDrawerOpen(false); }}>
          <ListItemIcon>
            <Image />
          </ListItemIcon>
          <ListItemText primary="文件处理" />
        </ListItem>
        <ListItem button onClick={() => { setSelectedTab(3); setDrawerOpen(false); }}>
          <ListItemIcon>
              <Storage />
            </ListItemIcon>
          <ListItemText primary="文件管理" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button>
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="设置" />
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <Help />
          </ListItemIcon>
          <ListItemText primary="帮助" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="退出" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* 侧边栏导航抽屉 */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
      >
        {drawerContent}
      </Drawer>

      {/* 主内容区域 */}
      <Box sx={{ flexGrow: 1 }}>
        {/* 顶部应用栏 */}
        <AppBar position="static">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <Menu />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              CommonService - 云存储与文件处理服务
            </Typography>
          </Toolbar>
        </AppBar>

        {/* 内容区域 */}
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* 选项卡导航 */}
          <Box sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={selectedTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
              <Tab icon={<Home />} iconPosition="start" label="仪表盘" />
              <Tab icon={<Upload />} iconPosition="start" label="文件上传" />
              <Tab icon={<DocumentScanner />} iconPosition="start" label="文件处理" />
              <Tab icon={<Storage />} iconPosition="start" label="文件管理" />
            </Tabs>
          </Box>

          {/* 选项卡内容 */}
          {selectedTab === 0 && (
            <Paper elevation={3} sx={{ p: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                欢迎使用 CommonService
              </Typography>
              <Typography variant="body1" paragraph>
                CommonService 是一个集成了云存储和文件处理功能的服务平台，支持多种云存储提供商（阿里云OSS、腾讯云COS等）和丰富的文件处理功能（图片压缩、转换、水印、裁剪，文档PDF生成、Excel导入导出等）。
              </Typography>
              <Typography variant="body1" paragraph>
                通过左侧菜单或上方选项卡，您可以访问以下功能：
              </Typography>
              <Box sx={{ ml: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <ChevronRight size={16} sx={{ mr: 1, verticalAlign: 'middle' }} />
                  <strong>文件上传</strong> - 支持普通上传、异步上传和分片上传
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <ChevronRight size={16} sx={{ mr: 1, verticalAlign: 'middle' }} />
                  <strong>文件处理</strong> - 图片处理和文档处理功能
                </Typography>
                <Typography variant="body1">
                  <ChevronRight size={16} sx={{ mr: 1, verticalAlign: 'middle' }} />
                  <strong>文件管理</strong> - 查看、下载、删除文件和生成签名URL
                </Typography>
              </Box>
            </Paper>
          )}

          {selectedTab === 1 && <FileUploader />}
          {selectedTab === 2 && <FileProcessor />}
          {selectedTab === 3 && <FileManager />}
        </Container>
      </Box>
    </Box>
  );
};

export default MainPage;