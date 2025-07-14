export enum MediaType {
    Audio = 0,
    Video = 1,
    Image = 2
}

export interface UploadMediaResult {
    url: string;
    publicId?: string;
    mediaType: MediaType;
}

export interface MediaTypeDto {
    label: string;
    id: MediaType;
}

// New interface for the file upload endpoint
export interface UploadProductMediaRequest {
    file: File;
    isPrimary?: boolean;
    color?: string;
    altText?: string;
    displayOrder?: number;
}