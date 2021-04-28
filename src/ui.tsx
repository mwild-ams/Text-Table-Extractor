import * as React from "react";
import * as ReactDOM from "react-dom";
import "./ui.css";
import "../node_modules/figma-plugin-ds/dist/figma-plugin-ds.css";

declare function require(path: string): any;

interface State {
  prefix: boolean;
  prefixString: string;
}

class App extends React.Component<{}, State> {
  constructor(props) {
    super(props);

    this.state = {
      prefix: true,
      prefixString: "*",
    };

    // This binding is necessary to make `this` work in the callback
    this.onExport = this.onExport.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.scanDocument = this.scanDocument.bind(this);
    this.onRadioChange = this.onRadioChange.bind(this);
    this.onPrefixStringChange = this.onPrefixStringChange.bind(this);
  }

  onExport() {
    parent.postMessage({ pluginMessage: { type: "save-csv" } }, "*");
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

  componentDidMount() {
    this.scanDocument();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.prefix !== this.state.prefix ||
      prevState.prefixString !== this.state.prefixString
    ) {
      this.scanDocument();
    }
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

  render() {
    return (
      <div>
        <div className="p-xxsmall">
          {/* <img src={require('./logo.svg')} /> */}
          {/* <h2>Rectangle Creator</h2> */}
          {/* <div className="tte-white-bg tte-sticky-search-top"> */}
          <div>
            <div className="section-title">Search settings</div>
            <div className="radio" onChange={this.onRadioChange}>
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
            <div className="input inline-flex">
              <label htmlFor="id-identifier" className="label inline-flex">
                {this.state.prefix ? "Prefix" : "Suffix"}
              </label>
              <input
                type="text"
                id="id-identifier"
                defaultValue="*"
                placeholder="Please enter..."
                className="input__field inline-flex"
                onChange={this.onPrefixStringChange}
              />
            </div>
          </div>

          <div className="section-title">Text found</div>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Id iusto
            repellat a animi obcaecati sunt aperiam vitae quibusdam, corrupti
            repudiandae, at voluptatum quisquam dolorem! Nam ipsa laudantium
            molestias quo quaerat.
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Id iusto
            repellat a animi obcaecati sunt aperiam vitae quibusdam, corrupti
            repudiandae, at voluptatum quisquam dolorem! Nam ipsa laudantium
            molestias quo quaerat.
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Id iusto
            repellat a animi obcaecati sunt aperiam vitae quibusdam, corrupti
            repudiandae, at voluptatum quisquam dolorem! Nam ipsa laudantium
            molestias quo quaerat.
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Id iusto
            repellat a animi obcaecati sunt aperiam vitae quibusdam, corrupti
            repudiandae, at voluptatum quisquam dolorem! Nam ipsa laudantium
            molestias quo quaerat.
          </p>
          {/* <p className="label">Count: <input ref={this.countRef} className="input__field"/></p> */}
        </div>
        <div className="tte-sticky-buttons-bottom tte-white-bg">
          <button
            onClick={this.onCancel}
            className="button button--secondary mt-xxsmall"
          >
            Cancel
          </button>
          <button
            id="create"
            onClick={this.onExport}
            className="button button--primary m-xxsmall"
          >
            Export as CSV
          </button>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("react-page"));
