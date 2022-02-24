/// <reference types="@types/dom-mediacapture-record" />

import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  mediaStream: MediaStream | undefined;
  mediaRecorder: MediaRecorder | undefined;
  video: HTMLVideoElement | undefined;
  canvasMask: HTMLCanvasElement | undefined;
  liveVideo: HTMLVideoElement | undefined;
  preview: HTMLVideoElement | undefined;
  bufferSource: MediaSource | undefined;
  sourceBuffer: SourceBuffer | undefined;
  recordingParts: Array<Blob> = [];
}
