import apiClient from './apiClient';

/**
 * 云存储服务API
 */
const storageApi = {
  /**
   * 上传文件
   * @param {File} file - 要上传的文件
   * @returns {Promise} - 返回Promise对象
   */
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/api/storage/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * 异步上传文件
   * @param {File} file - 要上传的文件
   * @returns {Promise} - 返回Promise对象
   */
  uploadFileAsync: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/api/storage/upload-async', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * 下载文件
   * @param {string} fileId - 文件ID
   * @returns {Promise} - 返回Promise对象
   */
  downloadFile: async (fileId) => {
    // 直接打开下载链接
    window.open(`/api/storage/download/${fileId}`, '_blank');
  },

  /**
   * 删除文件
   * @param {string} fileId - 文件ID
   * @returns {Promise} - 返回Promise对象
   */
  deleteFile: async (fileId) => {
    return apiClient.delete(`/api/storage/delete/${fileId}`);
  },

  /**
   * 生成文件签名URL
   * @param {string} fileId - 文件ID
   * @param {number} expireSeconds - 过期时间（秒）
   * @returns {Promise} - 返回Promise对象
   */
  generatePresignedUrl: async (fileId, expireSeconds = 3600) => {
    return apiClient.get(`/api/storage/presigned-url/${fileId}`, {
      params: { expireSeconds },
    });
  },

  /**
   * 初始化分片上传
   * @param {string} fileName - 文件名
   * @returns {Promise} - 返回Promise对象
   */
  initMultipartUpload: async (fileName) => {
    return apiClient.post('/api/storage/multipart/init', { fileName });
  },

  /**
   * 上传分片
   * @param {string} uploadId - 上传ID
   * @param {number} partNumber - 分片编号
   * @param {string} fileId - 文件ID
   * @param {File} filePart - 文件分片
   * @returns {Promise} - 返回Promise对象
   */
  uploadPart: async (uploadId, partNumber, fileId, filePart) => {
    const formData = new FormData();
    formData.append('file', filePart);
    return apiClient.post(`/api/storage/multipart/part?uploadId=${uploadId}&partNumber=${partNumber}&fileId=${fileId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * 完成分片上传
   * @param {string} uploadId - 上传ID
   * @param {string} fileId - 文件ID
   * @param {Array} parts - 分片列表
   * @returns {Promise} - 返回Promise对象
   */
  completeMultipartUpload: async (uploadId, fileId, parts) => {
    return apiClient.post('/api/storage/multipart/complete', {
      uploadId,
      fileId,
      parts,
    });
  },
};

export default storageApi;