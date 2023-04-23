const protobuf = require('protobufjs');
const samplePerson = require('./input/person.json');
// const serializer = require('proto3-json-serializer'); // didn't work correctly
const { spawn } = require('child_process');

// // // // // //
const doPbjs = () => {
  const root = protobuf.loadSync('./input/person.proto');
  const SampleMessage = root.lookupType('Person');

  function encodeMessageProtobufjs(message) {
    const errMsg = SampleMessage.verify(message);
    if (errMsg) {
      throw Error(errMsg);
    }
    const messageInstance = SampleMessage.create(message);
    const encodedMessage = SampleMessage.encode(messageInstance).finish();
    return encodedMessage;
  }

  function decodeMessageProtobufjs(encodedMessage) {
    const messageInstance = SampleMessage.decode(encodedMessage);
    const messageObject = SampleMessage.toObject(messageInstance, {
      defaults: true,
      arrays: true,
      objects: true,
      oneofs: true,
    });

    return messageObject;
  }

  const encodedMessageProtobufjs = encodeMessageProtobufjs(samplePerson);

  const decodedMessageProtobufjs = decodeMessageProtobufjs(
    encodedMessageProtobufjs
  );
  console.log(encodedMessageProtobufjs);
  console.log(decodedMessageProtobufjs);
};

// doPbjs();

function encodeMessageProtoc() {
  const cmd = `protoc --encode=example.Person --proto_path=./input person.proto`;

  const messageBuffer = Buffer.from(JSON.stringify(samplePerson), 'utf-8');

  // Spawn the protoc process and write the message buffer to stdin
  const protoc = spawn(cmd, { shell: true });
  protoc.stdin.write(messageBuffer);
  protoc.stdin.end();

  // Capture the stdout and stderr output of the protoc process
  let stdout = '';
  let stderr = '';
  protoc.stdout.on('data', (data) => (stdout += data.toString()));
  protoc.stderr.on('data', (data) => (stderr += data.toString()));

  // Handle the completion of the protoc process
  return new Promise((resolve, reject) => {
    protoc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`protoc process exited with code ${code}: ${stderr}`));
        return;
      }

      // Parse the binary encoded message to a JavaScript object
      const buffer = Buffer.from(stdout, 'base64');
      const messageObject = JSON.parse(buffer.toString());

      // Return the parsed JavaScript object
      resolve(messageObject);
    });
  });
}

encodeMessageProtoc();

// protoc --include_imports --descriptor_set_out=tmp.pb -I./input person.proto
// protoc --decode_json=tmp.pb ./input/person.json
