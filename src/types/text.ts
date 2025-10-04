export interface Text {
  id: string;
  title: string;
  author: string;
  content: string;
  preview: string;
  isCustom: boolean;
  blobUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTextInput {
  title: string;
  author?: string;
  content: string;
}

export interface UpdateTextInput {
  title?: string;
  author?: string;
  content?: string;
}

export interface TextWithRecording extends Text {
  hasRecording: boolean;
  recordedAt?: string;
}
