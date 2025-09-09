import apiClient from './apiClient';

/**
 * 文件处理服务API
 */
const fileProcessingApi = {
  /**
   * 处理图片
   * @param {string} fileId - 文件ID
   * @param {string} operation - 操作类型（compress/conver/watermark/crop）
   * @param {Object} params - 操作参数
   * @returns {Promise} - 返回Promise对象
   */
  processImage: async (fileId, operation, params = {}) => {
    return apiClient.post('/api/file/process/image', {
      fileId,
      operation,
      params,
    });
  },

  /**
   * 处理文档
   * @param {string} fileId - 文件ID
   * @param {string} operation - 操作类型（generatePdf/importExcel/exportExcel）
   * @param {Object} params - 操作参数
   * @returns {Promise} - 返回Promise对象
   */
  processDocument: async (fileId, operation, params = {}) => {
    return apiClient.post('/api/file/process/document', {
      fileId,
      operation,
      params,
    });
  },
};

export default fileProcessingApi;