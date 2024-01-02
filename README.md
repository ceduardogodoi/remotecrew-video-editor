# Getting Started

First, clone the project in a folder of your choice:

```sh
git clone git@github.com:ceduardogodoi/remotecrew-video-editor.git
```

Change to the project's directory:

```sh
cd remotecrew-video-editor
```

Install the dependencies:

```sh
npm i
```

Run the development server:

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

The player app contains a random preloaded [video](https://www.youtube.com/watch?v=ce5tWoPPRIQ), and there are some features to play around with:

- Play/Pause
- Crop the video (there are inputs to choose the start and end crop timings)
- Add an intro video into the result generated video
- Add a logo to the result generated video

The "process" button will generate a video applying the features you've chosen.

E.g: if you have chosen to crop the video, and add a logo in it, the result will be a video with the logo in the top left corner.

There's also a transcript that follows the video. You can also choose a moment in the video by clicking a sentence in the transcript.

Enjoy!

## Author

- [@ceduardogodoi](https://github.com/ceduardogodoi)
