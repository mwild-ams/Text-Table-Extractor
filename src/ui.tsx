import * as React from "react";
import * as ReactDOM from "react-dom";
import "./ui.css";
import "../node_modules/figma-plugin-ds/dist/figma-plugin-ds.css";

declare function require(path: string): any;

function PrefixRadioButtons(props) {
  return (
    <div className="radio" onChange={props.onChange}>
      <input
        type="radio"
        id="prefix"
        name="id-fix"
        value="prefix"
        className="radio__button"
        checked={props.prefix}
        readOnly
      />
      <label htmlFor="prefix" className="radio__label">
        Prefix
      </label>
      <input
        type="radio"
        id="suffix"
        name="id-fix"
        value="suffix"
        className="radio__button"
        checked={!props.prefix}
        readOnly
      />
      <label htmlFor="suffix" className="radio__label">
        Suffix
      </label>
    </div>
  );
}

function PrefixInputText(props) {
  return (
    <div className="input inline-flex">
      <label
        htmlFor="id-identifier"
        className="label tte-width-none mr-xxsmall"
      >
        {props.prefix ? "Prefix" : "Suffix"}
      </label>
      <input
        type="text"
        id="id-identifier"
        value={props.value}
        placeholder="Searching layer names"
        className="input__field"
        onChange={props.onChange}
      />
    </div>
  );
}

function BottomButtons(props) {
  return (
    <div className="tte-fixed-buttons-bottom tte-white-bg">
      <button
        onClick={props.onCancel}
        className="button button--secondary mt-xxsmall"
      >
        Cancel
      </button>
      <button
        id="create"
        onClick={props.onExport}
        className="button button--primary m-xxsmall"
      >
        Export as CSV
      </button>
    </div>
  );
}

interface State {
  prefix: boolean;
  prefixString: string;
  contentIDPairs: [];
}

class App extends React.Component<{}, State> {
  constructor(props) {
    super(props);

    this.state = {
      prefix: true,
      prefixString: "*",
      contentIDPairs: [],
    };

    // This binding is necessary to make `this` work in the callback
    this.onExport = this.onExport.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.scanDocument = this.scanDocument.bind(this);
    this.onRadioChange = this.onRadioChange.bind(this);
    this.onPrefixStringChange = this.onPrefixStringChange.bind(this);
    this.saveSettings = this.saveSettings.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.saveFile = this.saveFile.bind(this);
    this.download = this.download.bind(this);
    this.formatCsv = this.formatCsv.bind(this);

    // Add figma message event listener
    window.addEventListener("message", this.onMessage);

    // Load previous settings of the plugin
    parent.postMessage(
      { pluginMessage: { type: "load-previous-settings" } },
      "*"
    );
  }

  // Event handlers
  onExport() {
    // let csv: string = this.formatCsv(this.state.contentIDPairs);
    let json: string = JSON.stringify(this.state.contentIDPairs);
    // this.saveFile(csv, "contentIDTable.csv", "text/csv");
    this.saveFile(json, "contentIDPairs.json", "application/json");
  }

  onCancel() {
    parent.postMessage({ pluginMessage: { type: "close-plugin" } }, "*");
  }

  onRadioChange(event) {
    this.setState({ prefix: event.target.value === "prefix" }, () => {
      this.saveSettings(this.state.prefix, this.state.prefixString);
    });
  }

  onPrefixStringChange(event) {
    this.setState({ prefixString: event.target.value }, () => {
      this.saveSettings(this.state.prefix, this.state.prefixString);
    });
  }

  saveSettings(prefix: boolean, prefixString: string) {
    parent.postMessage(
      {
        pluginMessage: {
          type: "save-previous-settings",
          prefix,
          prefixString,
        },
      },
      "*"
    );
  }

  // Lifecycle Methods
  componentDidMount() {}

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.prefix !== this.state.prefix ||
      prevState.prefixString !== this.state.prefixString
    ) {
      this.scanDocument();
    }
  }

  componentWillUnmount() {
    window.removeEventListener("message", this.onMessage);
  }

  // Scan document function
  scanDocument() {
    const prefixBool: boolean = this.state.prefix;
    const fixString: string = this.state.prefixString;
    // TODO: change naming of these properties
    parent.postMessage(
      { pluginMessage: { type: "scan-document", prefixBool, fixString } },
      "*"
    );
  }

  // Format contentIDPairs to a string in csv format
  formatCsv(contentIDPairs): string {
    // Prepare them, concat with ; as seperator
    const csvPrepare = [];
    for (let pair of contentIDPairs) {
      csvPrepare.push(pair.join(";"));
    }
    // Concat the prepared pairs with line breaks
    const csv = csvPrepare.join("\r\n");

    return csv;
  }

  // Register plugin message handlers
  onMessage = (event) => {
    if (event.data.pluginMessage.type == "scan-results") {
      this.setState({
        contentIDPairs: event.data.pluginMessage.contentIDPairs,
      });
    }
    if (event.data.pluginMessage.type == "load-previous-settings-results") {
      this.setState(
        {
          prefix: event.data.pluginMessage.prefix,
          prefixString: event.data.pluginMessage.prefixString,
        },
        () => {
          // Initially scan the document for text pairs
          this.scanDocument();
        }
      );
    } else if (
      event.data.pluginMessage.type == "load-previous-settings-failed"
    ) {
      // Initially scan the document for text pairs with default value
      this.scanDocument();
    }
  };

  // Function to save a file
  //https://stackoverflow.com/questions/13405129/javascript-create-and-save-file
  download(data, filename, type) {
    var file = new Blob([data], { type: type });
    if (window.navigator.msSaveOrOpenBlob)
      // IE10+
      window.navigator.msSaveOrOpenBlob(file, filename);
    else {
      // Others
      var a = document.createElement("a"),
        url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    }
  }

  // Save file
  saveFile(data: any, filename: string, type: string) {
    this.download(data, filename, type);
  }

  // App render
  render() {
    return (
      <div>
        <div className="p-xxsmall">
          <div>
            <div className="section-title">Search settings</div>
            <PrefixRadioButtons
              prefix={this.state.prefix}
              onChange={this.onRadioChange}
            />
            <PrefixInputText
              prefix={this.state.prefix}
              value={this.state.prefixString}
              onChange={this.onPrefixStringChange}
            />
          </div>

          <div>
            <div className="section-title">Text found</div>
            <div className="flex column tte-width-70">
              {this.state.contentIDPairs.map((textPair) => (
                <div className="inline-flex row justify-content-between">
                  <span>{textPair[0]}</span>
                  <span>{textPair[1]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="tte-bottom-spacer"></div>
        <BottomButtons onCancel={this.onCancel} onExport={this.onExport} />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("react-page"));
