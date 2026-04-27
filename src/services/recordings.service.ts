import api from '@/lib/api';
import { unwrapApiData } from '@/lib/http/unwrap';

type RecordingDownloadResponse = {
  url: string;
};

export const recordingsService = {
  async getDownloadUrl(callId: number): Promise<string> {
    const response = await api.get(`/recordings/call/${callId}/download`, {
      responseType: 'json',
    });
    const payload = unwrapApiData<RecordingDownloadResponse>(response.data);
    return payload.url;
  },
};

