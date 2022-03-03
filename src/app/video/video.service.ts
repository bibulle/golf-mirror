/// <reference types="@types/dom-mediacapture-record" />

import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  mediaStream: MediaStream | undefined;
  mediaRecorder: MediaRecorder | undefined;
  video: HTMLVideoElement | undefined;
  outputCanvas: HTMLCanvasElement | undefined;
  gridCanvas: HTMLCanvasElement | undefined;
  liveVideo: HTMLVideoElement | undefined;
  preview: HTMLVideoElement | undefined;
  bufferSource: MediaSource | undefined;
  sourceBuffer: SourceBuffer | undefined;
  recordingParts: Array<Blob> = [];
  
  videoToLoad: number = NaN;
  VIDEOS = [ '/assets/Swing1.mp4', '/assets/Golf Swing Slow Motion Girl.mp4', '/assets/Qu\'est ce que le swing .mp4' ]



  constructor(private route: ActivatedRoute) {
    this.route.queryParams.pipe(
      map((params) => {
        return Number(params['video']);
      }),
    ).subscribe((b) => {
      this.videoToLoad = b;
    });
  }

  initInputVideo(playFrame: CallableFunction): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!Number.isNaN(this.videoToLoad)) {
        //console.log(this.liveVideo);
        
        this.liveVideo!.src = this.VIDEOS[this.videoToLoad % this.VIDEOS.length];
        this.liveVideo!.muted = true;
        this.liveVideo!.loop = true;

        this.liveVideo!.onplay = () => {
          playFrame();
        };

        // And start playing
        this.liveVideo!.play();

        resolve();

      } else {
        // Initial the webcam
        navigator.mediaDevices
          .getUserMedia({
            video: {
              facingMode: localStorage.getItem('videoCamera') || 'user',
              height: parseInt(localStorage.getItem('videoQuality') || '1080p'),
            },
          })
          .then((media_stream) => {
            // Assign media stream to video element - with audio muted
            this.liveVideo!.srcObject = media_stream;
            this.liveVideo!.muted = true;

            this.liveVideo!.onplay = () => {
              playFrame();
            };

            // And start playing
            this.liveVideo!.play();

            resolve();
          })
          .catch((e) => {
            reject(e);
          });
      }
    });
  }
}
