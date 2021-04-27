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
      <img src={require('./logo.svg')} />
      <h2>Rectangle Creator</h2>
      <p className="label">Count: <input ref={this.countRef} className="input__field"/></p>
      <button id="create" onClick={this.onCreate} className='button button--primary'>Create</button>
      <button onClick={this.onCancel} className='button button--secondary'>Cancel</button>
    </div>
  }
}

ReactDOM.render(<App />, document.getElementById('react-page'))
