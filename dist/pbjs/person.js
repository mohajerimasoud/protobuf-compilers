/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/light");

var $root = ($protobuf.roots["default"] || ($protobuf.roots["default"] = new $protobuf.Root()))
.addJSON({
  example: {
    nested: {
      Person: {
        fields: {
          name: {
            type: "string",
            id: 1
          },
          age: {
            type: "int32",
            id: 2
          },
          address: {
            type: "Address",
            id: 3
          }
        }
      },
      Address: {
        fields: {
          street: {
            type: "string",
            id: 1
          },
          city: {
            type: "string",
            id: 2
          },
          state: {
            type: "string",
            id: 3
          },
          zip: {
            type: "string",
            id: 4
          }
        }
      }
    }
  }
});

module.exports = $root;
