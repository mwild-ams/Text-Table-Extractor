/// <reference path="../node_modules/@figma/plugin-typings/index.d.ts" />

figma.showUI(__html__, { width: 500, height: 500 });

// Variables
let keyPairs = [];
/* keypairs = [ 
  {
    key: string,
    contents: [
      {
        id: string,
        text: string
      },
    ]
  }, ];
*/

figma.ui.onmessage = (msg) => {
  if (msg.type === "scan-document") {
    const textNodes = figma.root.findAll((n) => n.type === "TEXT");
    // find all text nodes with the transmitted pre- or suffix
    keyPairs = [];
    for (let n of textNodes) {
      n = n as TextNode;
      if (msg.prefixBool) {
        if (n.name.startsWith(msg.fixString)) {
          let name = n.name.substring(msg.fixString.length);
          let index = keyPairs.findIndex((e) => e.key === name);
          let content = {
            id: n.id,
            text: n.characters,
          };
          if (index >= 0) {
            keyPairs[index].contents.push(content);
          } else {
            keyPairs.push({
              key: name,
              contents: [content],
            });
          }
        }
      } else {
        if (n.name.endsWith(msg.fixString)) {
          let name = n.name.substring(0, n.name.length - msg.fixString.length);
          let index = keyPairs.findIndex((e) => e.key === name);
          let content = {
            id: n.id,
            text: n.characters,
          };
          if (index >= 0) {
            keyPairs[index].contents.push(content);
          } else {
            keyPairs.push({
              key: name,
              contents: [content],
            });
          }
        }
      }
    }

    // Sort alphabetically by key, then by text
    keyPairs.sort((a, b) => a.key.localeCompare(b.key, "en"));
    keyPairs.forEach((e) => {
      e.contents.sort((a: { text: string }, b: { text: string }) =>
        a.text.localeCompare(b.text, "en")
      );
    });

    figma.ui.postMessage({
      type: "scan-results",
      keyPairs,
    });
  }

  // Close the plugin
  if (msg.type === "close-plugin") {
    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    figma.closePlugin();
  }

  // Load the previous settings
  if (msg.type === "load-previous-settings") {
    const dataPrefix: string = figma.root.getPluginData("prefix");
    const prefixString: string = figma.root.getPluginData("prefixString");
    let prefix: boolean = true;
    if (dataPrefix === "false") prefix = false;
    figma.ui.postMessage({
      type: "load-previous-settings-results",
      prefix: prefix,
      prefixString: prefixString,
    });
  }

  // Save the settings
  if (msg.type === "save-previous-settings") {
    figma.root.setPluginData("prefix", String(msg.prefix));
    figma.root.setPluginData("prefixString", msg.prefixString);
  }
};
