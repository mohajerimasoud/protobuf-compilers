const path = require('path');
const { exec, spawn } = require('child_process');
const person = require('./person.json');
const protobuf = require('protobufjs');

const protoFile = './person.proto';

// // // // // //
const root = protobuf.loadSync(protoFile);
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

// const person = {
//   name: 'John Doe',
//   age: 30,
//   address: {
//     street: '123 Main Street',
//     city: 'Anytown',
//     state: 'CA',
//     zip: '91234',
//   },
// };

const encodedMessageProtobufjs = encodeMessageProtobufjs(person);

const decodedMessageProtobufjs = decodeMessageProtobufjs(
  encodedMessageProtobufjs
);
console.log(encodedMessageProtobufjs);
console.log(decodedMessageProtobufjs);

// // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // //

function encodeMessageProtoc(message, protoFilePath, messageType) {
  const protoPath = path.dirname(protoFilePath);
  const protocCmd = 'protoc';
  const encodeFlag = '--encode';
  const inputFlag = '--proto_path';
  const protoFile = path.basename(protoFilePath);

  // Construct the protoc command string
  const cmd = `${protocCmd} ${encodeFlag}=${messageType} ${inputFlag}=${protoPath} ${protoFile}`;

  // Create a buffer from the JSON string of the message
  const messageBuffer = Buffer.from(JSON.stringify(message), 'utf-8');

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

// Usage example
// const message = {
//   id: 123,
//   name: 'John Doe',
//   email: 'john.doe@example.com',
// };
const protoFilePath = './sample.proto';
const messageType = 'SampleMessage';

// // // // // // Test Results // // // // // // // // // //

const message = {
  id: 123,
  name: 'John Doe',
  email: 'john.doe@example.com',
};
// const encodedMessageProtobufjs = encodeMessageProtobufjs(message);

// const decodedMessageProtobufjs = decodeMessageProtobufjs(
//   encodedMessageProtobufjs
// );
// console.log(encodedMessageProtobufjs);
// console.log(decodedMessageProtobufjs);

//
encodeMessageProtoc(message, protoFilePath, messageType);

// protoc --encode=SampleMessage --proto_path=./protobuf ./protobuf/sample.proto message.json  output.bin
// protoc --proto_path=./protobuf  --encode="SampleMessage" ./protobuf/sample.proto < message.json > output.bin
// protoc -I . --decode_raw ./protobuf/sample.proto < ./message.json > my_binary.bin
// protoc -I . --decode_raw < ./message.json > my_binary.bin
// protoc -I . --decode_raw < message.json | protoc -I . sample.proto --encode SampleMessage > my_binary.bin
// protoc -I . --decode_raw < person.json | protoc -I . person.proto --encode Person > my_binary.bin

// protoc -I . --decode_raw < person.json | protoc -I . person.proto --encode Person > my_binary.bin

// protoc --js_out=library=myprotos_lib.js,binary:protos person.proto
