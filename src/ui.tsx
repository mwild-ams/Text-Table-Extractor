import * as React from 'react'
import * as ReactDOM from 'react-dom'
import './ui.css'
import '../node_modules/figma-plugin-ds/dist/figma-plugin-ds.css'

declare function require(path: string): any

class App extends React.Component {
  textbox: HTMLInputElement

  countRef = (element: HTMLInputElement) => {
    if (element) element.value = '5'
    this.textbox = element
  }

  onCreate = () => {
    const count = parseInt(this.textbox.value, 10)
    parent.postMessage({ pluginMessage: { type: 'create-rectangles', count } }, '*')
  }

  onCancel = () => {
    parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*')
  }

  render() {
    return <div>
      <div className="p-xxsmall">

        {/* <img src={require('./logo.svg')} /> */}
        {/* <h2>Rectangle Creator</h2> */}
        {/* <div className="tte-white-bg tte-sticky-search-top"> */}
        <div>
          <div className="section-title">Search settings</div>
          <div className="radio">
            <input type="radio" id="prefix" name="id-fix" value="prefix" className="radio__button" defaultChecked/>
            <label htmlFor="prefix" className="radio__label">Prefix</label>
            <input type="radio" id="suffix" name="id-fix" value="suffix" className="radio__button"/>
            <label htmlFor="suffix" className="radio__label">Suffix</label>
          </div>
          <div className="input inline-flex">
            <label htmlFor="id-identifier" className="label inline-flex">Prefix/Suffix</label>
            <input type="text" id="id-identifier" defaultValue="*" placeholder="Please enter prefix/suffix." className="input__field inline-flex"/>
          </div>
        </div>

        <div className="section-title">Text found</div>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Id iusto repellat a animi obcaecati sunt aperiam vitae quibusdam, corrupti repudiandae, at voluptatum quisquam dolorem! Nam ipsa laudantium molestias quo quaerat.</p>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Id iusto repellat a animi obcaecati sunt aperiam vitae quibusdam, corrupti repudiandae, at voluptatum quisquam dolorem! Nam ipsa laudantium molestias quo quaerat.</p>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Id iusto repellat a animi obcaecati sunt aperiam vitae quibusdam, corrupti repudiandae, at voluptatum quisquam dolorem! Nam ipsa laudantium molestias quo quaerat.</p>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Id iusto repellat a animi obcaecati sunt aperiam vitae quibusdam, corrupti repudiandae, at voluptatum quisquam dolorem! Nam ipsa laudantium molestias quo quaerat.</p>
        {/* <p className="label">Count: <input ref={this.countRef} className="input__field"/></p> */}
      </div>
      <div className="tte-sticky-buttons-bottom tte-white-bg">
        <button onClick={this.onCancel} className='button button--secondary m-xxxsmall'>Cancel</button>
        <button id="create" onClick={this.onCreate} className='button button--primary m-xxxsmall'>Export as CSV</button>
      </div>
    </div>
  }
}

ReactDOM.render(<App />, document.getElementById('react-page'))
