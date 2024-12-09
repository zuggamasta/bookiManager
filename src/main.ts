import './style.css'
import { FFmpeg } from '@ffmpeg/ffmpeg';


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div id="drop-zone" style="width: 300px; height: 200px; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center;">
        Drag and drop a media file here
    </div>
`

const dropZone = document.getElementById('drop-zone');

dropZone?.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.style.borderColor = 'blue';
});

dropZone?.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#ccc';
});

dropZone?.addEventListener('drop', async (event) => {
  event.preventDefault();
  dropZone.style.borderColor = '#ccc';

  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
      const file = files[0];
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();

      const fileData = await file.arrayBuffer();
      ffmpeg.writeFile(file.name, new Uint8Array(fileData));
      await ffmpeg.exec(['-i', file.name, 'output.mp4']);

      const data = ffmpeg.readFile('output.mp4');
      const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));

      const a = document.createElement('a');
      a.href = url;
      a.download = 'output.mp4';
      a.textContent = 'Download converted file';
      document.body.appendChild(a);
  }
});