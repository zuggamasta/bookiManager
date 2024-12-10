import './style.css';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div id="drop-zone" style="width: 300px; height: 200px; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center;">
        Drag and drop a media file here
    </div>
`;

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

  const transcode = async (files: any) => {
    const ffmpeg = new FFmpeg();

    await ffmpeg.load({
      coreURL: await toBlobURL('ffmpeg/ffmpeg-core.js', 'text/javascript'),
      wasmURL: await toBlobURL('ffmpeg/ffmpeg-core.wasm', 'application/wasm'),
      workerURL: await toBlobURL(
        'ffmpeg/ffmpeg-core.worker.js',
        'text/javascript'
      ),
    });

    const { name } = files[0];

    await ffmpeg.writeFile(name, await fetchFile(files[0]));
    await ffmpeg.exec(['-i', name, 'output.mp4']);

    const data: any = await ffmpeg.readFile('output.mp4');
    const url = URL.createObjectURL(
      new Blob([data.buffer], { type: 'video/mp4' })
    );

    return url;
  };

  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    const a = document.createElement('a');

    const href = await transcode(files);
    a.download = 'output.mp4';
    a.textContent = 'Download converted file';
    a.href = href;
    document.body.appendChild(a);
  }
});
