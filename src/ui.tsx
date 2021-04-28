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
        defaultChecked
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
        defaultValue="*"
        placeholder="Searching all text."
        className="input__field"
        onChange={props.onChange}
      />
    </div>
  );
}

function BottomButtons(props) {
  return (
    <div className="tte-sticky-buttons-bottom tte-white-bg">
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
    this.onMessage = this.onMessage.bind(this);
    this.saveCsv = this.saveCsv.bind(this);
    this.download = this.download.bind(this);
    this.formatCsv = this.formatCsv.bind(this);

    // Add figma message event listener
    window.addEventListener("message", this.onMessage);

    // Scan the document for text pairs
    this.scanDocument();
  }

  // Event handlers
  onExport() {
    let csv: string = this.formatCsv(this.state.contentIDPairs);
    this.saveCsv(csv);
  }

  onCancel() {
    parent.postMessage({ pluginMessage: { type: "close-plugin" } }, "*");
  }

  onRadioChange(event) {
    this.setState({ prefix: event.target.value === "prefix" });
  }

  onPrefixStringChange(event) {
    this.setState({ prefixString: event.target.value });
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

  // Save CSV file
  saveCsv(csv) {
    this.download(csv, "contentIDTable.csv", "text/csv");
  }

  // App render
  render() {
    return (
      <div>
        <div className="p-xxsmall">
          <div>
            <div className="section-title">Search settings</div>
            <PrefixRadioButtons onChange={this.onRadioChange} />
            <PrefixInputText
              prefix={this.state.prefix}
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
        <BottomButtons onCancel={this.onCancel} onExport={this.onExport} />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("react-page"));
