const textToSpeech = require("@google-cloud/text-to-speech");
const ttsClient = new textToSpeech.TextToSpeechClient();
const { Readable } = require("stream");

async function speech(text) {
  // Construct the request
  const request = {
    input: { text },
    // Select the language and SSML voice gender (optional)
    voice: { languageCode: "ja-JP", ssmlGender: "ja-JP-Wavenet-A" },
    // select the type of audio encoding
    audioConfig: { audioEncoding: "OGG_OPUS", speakingRate: 1.2 },
  };

  // Performs the text-to-speech request
  const [response] = await ttsClient.synthesizeSpeech(request);
  const stream = new Readable({ read() {} });
  stream.push(response.audioContent);

  return stream;
}

module.exports = {
  speech,
};
