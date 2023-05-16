var file = new File(File($.fileName).path + "/generated_script.json");

if (!file.exists) {
    alert("File does not exist");
    //dont let the script continue
    exit();
} else {
    file.open('r');
    var dataString = file.read();
    file.close();
    var data = eval("(" + dataString + ")");
}

var availableMediaFiles = [];
var lastChosenMediaPath = '';

function arrayIndexOf(arr, searchElement) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === searchElement) {
            return i;
        }
    }
    return -1; // Not found
}

function getRandomMediaPath() {
    // Check if all media files have been used
    if (availableMediaFiles.length === 0) {
        // Reset the availableMediaFiles array
        availableMediaFiles = getMediaFiles();
        // Exclude the last chosen media file from the available options
        var lastChosenMediaIndex = arrayIndexOf(availableMediaFiles, lastChosenMediaPath);
        if (lastChosenMediaIndex !== -1) {
            availableMediaFiles.splice(lastChosenMediaIndex, 1);
        }
    }

    // Select a random index from the availableMediaFiles array
    var randomIndex = Math.floor(Math.random() * availableMediaFiles.length);
    // Get the media file path at the random index
    var randomMediaPath = availableMediaFiles[randomIndex];
    // Remove the selected media file path from the availableMediaFiles array
    availableMediaFiles.splice(randomIndex, 1);
    // Update the last chosen media path
    lastChosenMediaPath = randomMediaPath;

    return randomMediaPath;
}

function getMediaFiles() {
    var mediaFolder = new Folder(file.path + "/media");
    var mediaFiles = mediaFolder.getFiles("*.mp4");
    var mediaPaths = [];

    for (var i = 0; i < mediaFiles.length; i++) {
        mediaPaths.push(mediaFiles[i].fsName);
    }

    return mediaPaths;
}

// Create a main composition
var mainComp = app.project.items.addComp("Main Comp", 1080, 1920, 1, 10 * data.length, 24);
var startTime = 0;

// Import the intro and outro audio files
var introAudioFile = new File(file.path + "/audio/intro.wav");
var outroAudioFile = new File(file.path + "/audio/outro.wav");

// Create import options for intro and outro audio files
var introAudioImportOptions = new ImportOptions(introAudioFile);
var outroAudioImportOptions = new ImportOptions(outroAudioFile);

// Import intro and outro audio files
var introAudioFootage = app.project.importFile(introAudioImportOptions);
var outroAudioFootage = app.project.importFile(outroAudioImportOptions);

// Create compositions for intro and outro
var introComp = app.project.items.addComp("Intro", 1080, 1920, 1, introAudioFootage.duration, 24);
var outroComp = app.project.items.addComp("Outro", 1080, 1920, 1, outroAudioFootage.duration, 24);

// Add audio layers to intro and outro compositions
var introAudioLayer = introComp.layers.add(introAudioFootage);
var outroAudioLayer = outroComp.layers.add(outroAudioFootage);

// Import the intro and outro video files
var introVideoFile = new File(file.path + "/media/fixed/intro.mp4");
var outroVideoFile = new File(file.path + "/media/fixed/outro.mp4");

// Create import options for intro and outro video files
var introVideoImportOptions = new ImportOptions(introVideoFile);
var outroVideoImportOptions = new ImportOptions(outroVideoFile);

// Import intro and outro video files
var introVideoFootage = app.project.importFile(introVideoImportOptions);
var outroVideoFootage = app.project.importFile(outroVideoImportOptions);

// Add video layers to intro and outro compositions
var introVideoLayer = introComp.layers.add(introVideoFootage);
var outroVideoLayer = outroComp.layers.add(outroVideoFootage);

// Enable time remapping for both videos
introVideoLayer.timeRemapEnabled = true;
outroVideoLayer.timeRemapEnabled = true;

// Adjust the speed of the videos to match the audio
introVideoLayer.property("ADBE Time Remapping").setValueAtTime(introAudioFootage.duration, introVideoLayer.outPoint);
outroVideoLayer.property("ADBE Time Remapping").setValueAtTime(outroAudioFootage.duration, outroVideoLayer.outPoint);

// Add the intro composition to the main composition
var introLayer = mainComp.layers.add(introComp);
introLayer.startTime = startTime;

// Update the start time for the next sentence
startTime += introComp.duration;

// Add the outro composition to the main composition at the end
var outroLayer = mainComp.layers.add(outroComp);

for (var i = 0; i < data.length; i++) {

    // Create a new composition for each title
    var sentenceComp = app.project.items.addComp(data[i].title + " - Title " + i, 1080, 1920, 1, 10, 24);

    // Import the image file and add it as a layer
    // Replace the previous line with this
    var imageFile = new File(getRandomMediaPath());

    var imageImportOptions = new ImportOptions(imageFile);
    var imageFootage = app.project.importFile(imageImportOptions);
    var imageLayer = sentenceComp.layers.add(imageFootage);

    // Calculate the scale factor needed to match the composition height while keeping proportions
    var compHeight = sentenceComp.height;
    var videoHeight = imageFootage.height;
    var scaleFactor = compHeight / videoHeight * 100; // factor needs to be in percentage

    // Apply the scale factor to the layer
    imageLayer.property("Scale").setValue([scaleFactor, scaleFactor]);

    imageLayer.property("ADBE Effect Parade").addProperty("ADBE Gaussian Blur");
    imageLayer.property("ADBE Effect Parade").property("ADBE Gaussian Blur").property("ADBE Gaussian Blur-0001").setValue(30);

    // Adjust the audio file reference
    var audioFile = new File(file.path + "/audio/audio" + i + ".wav");
    var audioImportOptions = new ImportOptions(audioFile);
    var audioFootage = app.project.importFile(audioImportOptions);
    var audioLayer = sentenceComp.layers.add(audioFootage);

    // Add a line break every 2 words
    var words = data[i].title.split(" ");
    for (var k = 1; k < words.length; k += 2) {
        words[k] += "\n";
    }
    var textWithLineBreaks = words.join(" ");

    var textLayer = sentenceComp.layers.addText(textWithLineBreaks);

    // -------------------

    // Create a new text layer for the source
    var sourceTextLayer = sentenceComp.layers.addText(data[i].source.replace("...", ":"));

    // Create a TextDocument object from the layer's Source Text
    var sourceTextProp = sourceTextLayer.property("Source Text");
    var sourceTextDocument = sourceTextProp.value;

    // Set the text properties for the source text layer
    sourceTextDocument.font = "Rubik-Bold";
    sourceTextDocument.fontSize = 40;
    sourceTextDocument.justification = ParagraphJustification.CENTER_JUSTIFY;

    // Set the text color
    sourceTextDocument.fillColor = [1, 1, 0]; // yellow
    sourceTextDocument.strokeColor = [0, 0, 0]; // black
    sourceTextDocument.strokeWidth = 1;

    // Update the layer's Source Text with the modified TextDocument
    sourceTextProp.setValue(sourceTextDocument);

    // Position the source text layer at the bottom center of the composition
    var sourceTextLayerBounds = sourceTextLayer.sourceRectAtTime(0, false);
    sourceTextLayer.anchorPoint.setValue([sourceTextLayerBounds.left + sourceTextLayerBounds.width / 2, sourceTextLayerBounds.top + sourceTextLayerBounds.height / 2]);
    sourceTextLayer.position.setValue([sentenceComp.width / 2, sentenceComp.height - (sourceTextLayerBounds.height / 2) - 50]);

    // -----------------------------

    // Create a TextDocument object from the layer's Source Text
    var textProp = textLayer.property("Source Text");
    var textDocument = textProp.value;

    // Set the text properties
    textDocument.font = "Rubik-Bold";
    textDocument.fontSize = 85;
    textDocument.justification = ParagraphJustification.CENTER_JUSTIFY;

    // Set the text color
    textDocument.fillColor = [1, 1, 1]; // white
    textDocument.strokeColor = [0, 0, 0]; // black
    textDocument.strokeWidth = 10; // change stroke width to 10px

    // Set the leading (baseline shift)
    textDocument.baselineShift = 100;

    // Update the layer's Source Text with the modified TextDocument
    textProp.setValue(textDocument);

    // Center the text
    var textLayerBounds = textLayer.sourceRectAtTime(0, false);
    textLayer.anchorPoint.setValue([textLayerBounds.left + textLayerBounds.width / 2, textLayerBounds.top + textLayerBounds.height / 2]);
    textLayer.position.setValue([sentenceComp.width / 2, sentenceComp.height / 2]);

    // Set the image layer to start fading out 1 second before the end of the composition
    imageLayer.opacity.setValueAtTime(sentenceComp.duration - 1, 100);
    imageLayer.opacity.setValueAtTime(sentenceComp.duration, 0);

    textLayer.outPoint = audioLayer.outPoint;

    // Adjust the composition duration to match the audio length
    sentenceComp.duration = audioLayer.outPoint;

    // Add the sentence composition to the main composition
    var sentenceLayer = mainComp.layers.add(sentenceComp);
    sentenceLayer.startTime = startTime;

    // Fade transition: make the layer transparent at the start and solid after 1 second
    sentenceLayer.opacity.setValueAtTime(startTime, 0);
    sentenceLayer.opacity.setValueAtTime(startTime + 1, 100);

    // Update the start time for the next sentence
    startTime += sentenceComp.duration;

    outroLayer.startTime = startTime;
}


