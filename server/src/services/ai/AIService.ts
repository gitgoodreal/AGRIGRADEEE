import { AIAnalysisResult, VegetableType } from '../../models/types';

export interface ImageInput {
  base64Data: string; // Base64 encoded image string (without prefix)
  mimeType: string;
}

export interface ImageValidationResult {
  isValid: boolean;
  issues: string[];
}

export interface IAIService {
  validateImageQuality(image: ImageInput): Promise<ImageValidationResult>;
  analyzeProduce(image: ImageInput, vegetableType?: VegetableType): Promise<AIAnalysisResult>;
  analyzePotato(image: ImageInput): Promise<AIAnalysisResult>;
}
