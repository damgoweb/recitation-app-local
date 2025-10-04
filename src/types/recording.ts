export interface Recording {
  id: string;
  textId: string;
  audioBlobUrl: string;
  duration: number;
  fileSize: number;
  mimeType: string;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecordingInput {
  textId: string;
  audioFile: File;
  duration: number;
  recordedAt: string;
}
