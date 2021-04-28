/// <reference path="../node_modules/@figma/plugin-typings/index.d.ts" />

figma.showUI(__html__, { width: 500, height: 500 });

// Variables
let contentIDPairs = [];
let conflictIDIndices = [];

figma.ui.onmessage = (msg) => {
  // if (msg.type === "create-rectangles") {
  //   const nodes = [];

  //   for (let i = 0; i < msg.count; i++) {
  //     const rect = figma.createRectangle();
  //     rect.x = i * 150;
  //     rect.fills = [{ type: "SOLID", color: { r: 1, g: 0.5, b: 0 } }];
  //     figma.currentPage.appendChild(rect);
  //     nodes.push(rect);
  //   }

  //   figma.currentPage.selection = nodes;
  //   figma.viewport.scrollAndZoomIntoView(nodes);
  // }

  if (msg.type === "scan-document") {
    const textNodes = figma.root.findAll((n) => n.type === "TEXT");
    // find all text nodes with the transmitted pre- or suffix
    contentIDPairs = [];
    for (let n of textNodes) {
      n = n as TextNode;
      if (msg.prefixBool) {
        if (n.name.startsWith(msg.fixString)) {
          contentIDPairs.push([
            n.name.substring(msg.fixString.length),
            n.characters,
          ]);
        }
      } else {
        if (n.name.endsWith(msg.fixString)) {
          contentIDPairs.push([
            n.name.substring(0, n.name.length - msg.fixString.length),
            n.characters,
          ]);
        }
      }
    }
    // contentIDPairs.forEach(([key, value]) => console.log(key + ": " + value));

    // Sort alphabetically by key
    contentIDPairs.sort((a, b) => {
      let keyComparison = a[0].localeCompare(b[0], "en");
      if (keyComparison == 0) {
        return a[1].localeCompare(b[1]);
      } else return keyComparison;
    });

    // Remove double entries (same key and same value)
    let index = 0;
    while (index < contentIDPairs.length - 1) {
      if (
        contentIDPairs[index][0].localeCompare(contentIDPairs[index + 1][0]) ==
          0 &&
        contentIDPairs[index][1].localeCompare(contentIDPairs[index + 1][1]) ==
          0
      ) {
        contentIDPairs.splice(index, 1);
      } else {
        index += 1;
      }
    }

    // Find double keys and place them in a new array with arrays containing the index sets
    conflictIDIndices = [];
    let i = 0;
    while (i < contentIDPairs.length - 1) {
      let conflictIDSet = [];
      let n = i;
      while (n < contentIDPairs.length - 1) {
        // Check if the current index n is part of the current set
        if (
          contentIDPairs[n][0].localeCompare(contentIDPairs[n + 1][0]) == 0 ||
          (n > 0
            ? contentIDPairs[n][0].localeCompare(contentIDPairs[n - 1][0]) == 0
            : false)
        ) {
          conflictIDSet.push(n);
        }
        // In case the last two are part of a set
        if (
          n == contentIDPairs.length - 2 &&
          contentIDPairs[n][0].localeCompare(contentIDPairs[n + 1][0]) == 0
        ) {
          conflictIDSet.push(n + 1);
        }
        // Break if the next one is not part of the set anymore
        if (contentIDPairs[n][0].localeCompare(contentIDPairs[n + 1][0]) != 0) {
          i = n;
          break;
        }
        // Count up the index if set is going on
        n += 1;
      }
      // Increase the i counter
      i += 1;
      // Add current set to conflictIDIndices if there are any
      if (conflictIDSet.length > 0) conflictIDIndices.push(conflictIDSet);
    }
    console.log(contentIDPairs);
    console.log(conflictIDIndices);
    figma.ui.postMessage({
      type: "scan-results",
      contentIDPairs,
      conflictIDIndices,
    });
  }

  // Save the CSV file
  if (msg.type === "save-csv") {
    // Prepare them, concat with ; as seperator
    const csvPrepare = [];
    for (let pair of contentIDPairs) {
      csvPrepare.push(pair.join(";"));
    }
    // Concat the prepared pairs with line breaks
    const csv = csvPrepare.join("\r\n");
    console.log(csv);
    // send message to ui to save the csv as a file
    figma.ui.postMessage({ type: "save-csv-dialogue", csv });
  }

  // Close the plugin
  if (msg.type === "close-plugin") {
    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    figma.closePlugin();
  }
};
