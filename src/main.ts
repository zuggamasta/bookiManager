import './style.css';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <h1>bookii manager</h1>
    <div class="description">
      <p>This small webapp is meant as helper for the bookii pens DIY recording feature.<br />
        <ol>
          <li>Record the audio on a device of your choice. </li>
          <li>Load the seperate audio files in this web app. (the files are not uploaded and stay on your machine)</li>
          <li>Add the Sticker number and optinally a name for your own organisation</li>
          <li>Export the files to be saved in the DIYrecord folder of the bookii pen.</li>
        </ol>
      </p>
    </div>
    <hr>
    <div id="drop-zone" style="width: 300px; height: 200px; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center;display: none; ">
        Drag and drop a media file here
    </div>
    <div>
      <table id="dataTable">
          <thead>
              <tr>
                  <th>Name</th>
                  <th>Sticker Number</th>
                  <th>Audio File</th>
              </tr>
          </thead>
          <tbody>
              <tr>
                  <td><input type="text" name="name"></td>
                  <td><input type="number" name="number"></td>
                  <td><input type="file" name="file"></td>
              </tr>
          </tbody>
      </table>
      <button id="addRowBtn">+</button>
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

document.addEventListener('DOMContentLoaded', () => {
  const addRowBtn = document.getElementById('addRowBtn') as HTMLButtonElement;
  const dataTable = document.getElementById('dataTable') as HTMLTableElement;

  addRowBtn.addEventListener('click', () => {
      const newRow = dataTable.insertRow();
      const nameCell = newRow.insertCell(0);
      const numberCell = newRow.insertCell(1);
      const fileCell = newRow.insertCell(2);

      nameCell.innerHTML = '<input type="text" name="name">';
      numberCell.innerHTML = '<input type="number" name="number">';
      fileCell.innerHTML = '<input type="file" name="file">';
  });
});
