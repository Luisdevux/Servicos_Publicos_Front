// src/lib/imageUtils.ts

/**
 * Utilitários para trabalhar com imagens do bucket Minio
 */

/**
 * Valida se uma URL de imagem é válida
 */
export function isValidImageUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  
  try {
    // Verifica se é uma URL absoluta válida ou caminho relativo
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Normaliza a URL da imagem do Minio
 * Remove espaços, corrige protocolos, etc.
 */
export function normalizeImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  
  try {
    // Remove espaços em branco
    let normalized = url.trim();
    
    // Se não tiver protocolo e não começar com /, adiciona http:// como fallback
    if (!normalized.startsWith('http://') && 
        !normalized.startsWith('https://') && 
        !normalized.startsWith('/')) {
      normalized = `http://${normalized}`;
    }
    
    return normalized;
  } catch {
    return '';
  }
}

/**
 * Converte uma URL de imagem para um formato otimizado
 * Pode ser expandido para adicionar parâmetros de query para redimensionamento
 */
export function optimizeImageUrl(
  url: string,
): string {
  if (!isValidImageUrl(url)) return '';
  
  const normalized = normalizeImageUrl(url);
  
  // Se a API do Minio suportar parâmetros de transformação, adicione aqui
  // Por exemplo: return `${normalized}?w=${options?.width}&q=${options?.quality}`;
  
  return normalized;
}

/**
 * Extrai o nome do arquivo da URL
 */
export function getImageFileName(url: string): string {
  try {
    const parts = url.split('/');
    return parts[parts.length - 1] || 'imagem';
  } catch {
    return 'imagem';
  }
}

/**
 * Valida o tipo MIME de um arquivo
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/svg+xml',
] as const;

export function isValidImageType(type: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(type as typeof ALLOWED_IMAGE_TYPES[number]);
}

export function getAllowedImageTypesDisplay(): string {
  return 'JPG, JPEG, PNG e SVG';
}

/**
 * Converte bytes para formato legível
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Valida magic bytes de uma imagem
 */
export async function validateImageMagicBytes(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target?.result as ArrayBuffer).subarray(0, 4);
      let header = '';
      
      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16);
      }
      
      // Magic bytes para formatos de imagem comuns
      const validHeaders = [
        'ffd8ff',    // JPEG/JPG
        '89504e47',  // PNG
        '3c3f786d',  // SVG (<?xml)
        '3c737667',  // SVG (<svg)
      ];
      
      const isValid = validHeaders.some(validHeader => header.startsWith(validHeader));
      resolve(isValid);
    };
    
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file.slice(0, 4));
  });
}

/**
 * Converte um arquivo para Base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
