import './typebase.css';
import './style.css';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const dropZone = document.getElementById('drop-zone');
const ffmegArea:HTMLElement = document.getElementById('ffmpeg-area')!;
let stickerNumber:number = 0;

function updateStickerNumber() {
  const input = document.getElementById('stickerInput') as HTMLInputElement;
  stickerNumber = parseInt(input.value, 10);
}

dropZone?.addEventListener('dragover', (event) => {
  event.preventDefault();
  updateStickerNumber();
  dropZone.style.borderColor = '#0199B1'; // blue
});

dropZone?.addEventListener('dragleave', () => {
  dropZone.style.borderColor = '#ccc';
});

dropZone?.addEventListener('drop', async (event) => {
  event.preventDefault();
  dropZone.style.borderColor = '#ccc'; // green

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
    await ffmpeg.exec(['-i', name,
      '-ar', '16000',
      '-ac', '1',
      '-sample_fmt', 's16p',
      '-acodec', 'adpcm_ima_wav',
      '-map_metadata', '-1',
      '-fflags', '+bitexact',
      '-flags:v', '+bitexact',
      '-flags:a', '+bitexact',
      'TestRec'+ String(stickerNumber+1) + '.wav']);


    const data: any = await ffmpeg.readFile( 'TestRec'+ String(stickerNumber+1) + '.wav');
    const url = URL.createObjectURL(
      new Blob([data.buffer], { type: 'audio/wav' })
    );

    return url;
  };

  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    const button = document.createElement('button');
    button.setAttribute("class","animate")
    const a = document.createElement('a');

    const href = await transcode(files);
    a.download =  'TestRec'+ String(stickerNumber+1) + '.wav';
    a.textContent = 'Sticker Nummer '+ String(stickerNumber) +' herunterladen';
    a.href = href;
    button.append(a)
    ffmegArea.appendChild(button);
  }
});